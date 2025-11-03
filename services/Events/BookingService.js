const prisma = require("../../utils/prisma");
const razorpay = require("../../config/razorpay"); // Your Razorpay instance
const crypto = require("crypto");
const redisService = require("../redisService");

exports.initiateBooking = async (userId, eventId, items) => {
  for (const item of items) {
    const ticketType = await prisma.ticketType.findUnique({
      where: { id: item.ticketTypeId },
    });
    if (!ticketType) {
      throw new Error(`Ticket type ID ${item.ticketTypeId} not found.`);
    }
    const lockedCount = await redisService.getLockedCount(item.ticketTypeId);
    const available = ticketType.quantity - lockedCount;
    if (available < item.quantity) {
      const err = new Error(
        `Not enough tickets for '${ticketType.name}'. Only ${available} available.`
      );
      err.isOperational = true;
      throw err;
    }
  }

  try {
    for (const item of items) {
      await redisService.createLock(item.ticketTypeId, item.quantity);
    }
  } catch (error) {
    console.error("Failed to acquire Redis lock:", error);
    throw new Error("Could not reserve tickets. Please try again.");
  }

  let pendingOrder;
  try {
    pendingOrder = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];
      for (const item of items) {
        const ticketType = await tx.ticketType.findUnique({
          where: { id: item.ticketTypeId },
        });

        if (ticketType.quantity < item.quantity) {
          throw new Error(
            `Someone just booked the last tickets for '${ticketType.name}'.`
          );
        }

        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { quantity: { decrement: item.quantity } },
        });

        totalAmount += ticketType.price * item.quantity;
        orderItemsData.push({
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
          priceAtPurchase: ticketType.price,
        });
      }

      return tx.order.create({
        data: {
          userId,
          totalAmount,
          status: "PENDING",
          items: { create: orderItemsData },
        },
        include: { items: true },
      });
    });
  } catch (error) {
    console.error("Database transaction failed, releasing Redis locks.", error);
    for (const item of items) {
      await redisService.releaseLock(item.ticketTypeId, item.quantity);
    }
    const finalError = new Error(
      error.isOperational
        ? error.message
        : "Failed to confirm ticket availability."
    );
    finalError.isOperational = error.isOperational || true;
    throw finalError;
  }

  const razorpayOptions = {
    amount: pendingOrder.totalAmount * 100, // Amount in the smallest currency unit (paise)
    currency: "INR",
    receipt: `receipt_order_${pendingOrder.id}`, // A unique receipt ID
    notes: {
      bookingId: pendingOrder.id,
      userId: userId,
      eventId: eventId,
    },
  };
  try {
    const razorpayOrder = await razorpay.orders.create(razorpayOptions);

    return { databaseOrder: pendingOrder, razorpayOrder };
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    await prisma.$transaction(async (tx) => {
      for (const item of pendingOrder.items) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { quantity: { increment: item.quantity } },
        });
        await redisService.releaseLock(item.ticketTypeId, item.quantity);
      }
    });
    throw new Error("Failed to create payment order. Please try again.");
  }
};

exports.confirmBooking = async (webhookBody, signature) => {
  // 1. CRITICAL: Verify the webhook signature first.
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET) // Use your webhook secret
    .update(JSON.stringify(webhookBody))
    .digest("hex");

  if (expectedSignature !== signature) {
    throw new Error("InvalidWebhookSignature");
  }

  // 2. Extract the Razorpay Order ID from the webhook payload
  const razorpayOrderId = webhookBody.payload.payment.entity.order_id;
  if (!razorpayOrderId) {
    throw new Error("OrderIdMissingFromPayload");
  }

  // 3. Perform all database updates in a single transaction
  return prisma.$transaction(async (tx) => {
    // Find the PENDING order using the Razorpay Order ID
    const order = await tx.order.findFirst({
      where: { razorpayOrderId: razorpayOrderId, status: "PENDING" },
      include: { items: { include: { ticketType: true } } }, // Include items and their ticketType
    });

    if (!order) {
      // If order is not found or already processed, it's not an error.
      // Just acknowledge the webhook. It might be a duplicate call.
      console.log(
        `Webhook for order ${razorpayOrderId} received, but no pending order found. Acknowledging.`
      );
      return null;
    }

    // Update the order status to COMPLETED
    const completedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: "COMPLETED",
        razorpayPaymentId: webhookBody.payload.payment.entity.id,
      },
    });

    // Create EventRegistration records for each ticket
    const registrationPromises = order.items.flatMap((item) =>
      Array.from({ length: item.quantity }, () =>
        tx.eventRegistration.create({
          data: {
            orderId: order.id,
            userId: order.userId,
            eventId: item.ticketType.eventId,
          },
        })
      )
    );
    await Promise.all(registrationPromises);

    // IMPORTANT: Clear the ticket locks from Redis
    const lockPromises = order.items.map((item) =>
      redisService.clearLock(item.ticketTypeId, item.quantity)
    );
    await Promise.all(lockPromises);

    return completedOrder;
  });
};
