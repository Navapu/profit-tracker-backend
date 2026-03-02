import mongoose from "mongoose";

export const health = async (req, res) => {
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

export const healthExtended = async (req, res, next) => {
  try {
    const start = Date.now();

    let mongoStatus = "unknown";

    try {
      await mongoose.connection.db.admin().ping();
      mongoStatus = "ok";
    } catch (err) {
      mongoStatus = "down";
    }

    const latency = Date.now() - start;

    const allOk = mongoStatus === "ok";

    return res.status(allOk ? 200 : 503).json({
      status: allOk ? "ok" : "degraded",
      services: {
        api: "ok",
        mongo: mongoStatus,
      },
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime(),
      latency_ms: latency,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(error, "healthExtendend error: ");
    next(error);
  }
};
