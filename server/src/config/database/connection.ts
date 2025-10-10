import mongoose from "mongoose";
import Logger from "../../utils/logger";

// Configure Mongoose
mongoose.set("strictQuery", false);

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(mongoURI);

    Logger.info(`MongoDB Connected: ${conn.connection.host}`, {
      database: conn.connection.name,
      port: conn.connection.port,
    });

    // Connection events
    mongoose.connection.on("error", (err) => {
      Logger.error("MongoDB connection error:", { error: err.message });
    });

    mongoose.connection.on("disconnected", () => {
      Logger.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      Logger.info("MongoDB reconnected successfully");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      Logger.info("MongoDB connection closed through app termination");
      process.exit(0);
    });
  } catch (error) {
    Logger.error("Failed to connect to MongoDB:", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    process.exit(1);
  }
};

export default connectDB;
