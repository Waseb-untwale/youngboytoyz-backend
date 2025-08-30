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
    } = req.body;

    const files = req.files.images;
    const imageUrls = files ? files.map((file) => file.path) : [];

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        maxAttendees: maxAttendees ? parseInt(maxAttendees, 10) : null,
        currentAttendees: currentAttendees ? parseInt(currentAttendees, 10) : 0,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        imageUrls, // This is now a correct array of paths
        primaryImage: imageUrls[0] || null, // Set the first image as the primary one
      },
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create event",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
