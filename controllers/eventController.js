const prisma = require("../utils/prisma");

exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      maxAttendees,
      currentAttendees,
      location,
      startDate,
      endDate,
      agenda,
    } = req.body;

    const files = req.files;
    const eventImages = [];

    if (files && files.images) {
      if (Array.isArray(files.images)) {
        eventImages.push(...files.images.map((file) => file.path));
      } else {
        eventImages.push(files.images.path); // single file
      }
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    let parsedAgenda = [];
    if (agenda) {
      try {
        parsedAgenda = typeof agenda === "string" ? JSON.parse(agenda) : agenda;
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid agenda format. Must be valid JSON.",
        });
      }
    }

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        maxAttendees: maxAttendees ? parseInt(maxAttendees, 10) : null,
        currentAttendees: currentAttendees ? parseInt(currentAttendees, 10) : 0,
        location,
        startDate: start,
        endDate: end,
        imageUrls: eventImages,
        primaryImage:
          eventImages.length > 0
            ? eventImages[0]
            : "https://placehold.co/800x600/EFEFEF/AAAAAA?text=Image+Not+Available",
        agenda: parsedAgenda.length > 0 ? { create: parsedAgenda } : undefined,
      },
      include: {
        agenda: {
          orderBy: { time: "asc" },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: event,
      message: "Event created successfully",
    });
  } catch (error) {
    console.error("Create event error:", error);

    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Event with this slug already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create event",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

exports.getallEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany();
    res.status(200).json(events);
  } catch (error) {
    console.error("Failed to retrieve events:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching events." });
  }
};

exports.getEventbyId = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        agenda: true,
      },
    });

    if (!event) return res.status(404).json({ error: "No Event found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTotalEventsCount = async (req, res) => {
  try {
    const totalEvents = await prisma.event.count();
    res.status(200).json({
      totalEvents: totalEvents,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
