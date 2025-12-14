import mongoose from "mongoose";

let isConnected = false; // Variable to track the connection status

export const connectToDB = async () => {
  // Set strict query mode for Mongoose to prevent unknown field queries.
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL) {
    console.log("Missing MongoDB URL");
    return;
  }

  // If the connection is already established and ready, return without creating a new connection.
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const currentState: number = mongoose.connection.readyState as number;
  if (currentState === 1) {
    isConnected = true;
    return;
  }

  // If connection is in progress, wait for it to complete
  if (currentState === 2) {
    return new Promise<void>((resolve, reject) => {
      mongoose.connection.once("connected", () => {
        isConnected = true;
        resolve();
      });
      mongoose.connection.once("error", (err) => {
        isConnected = false;
        reject(err);
      });
    });
  }

  try {
    // Parse connection options based on the connection string
    const connectionOptions: any = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
    };

    // Check if connection string includes SSL/TLS parameters
    const mongoUrl = process.env.MONGODB_URL || "";

    // If it's a MongoDB Atlas connection (contains mongodb.net), ensure TLS
    if (mongoUrl.includes("mongodb.net") || mongoUrl.includes("mongodb+srv")) {
      connectionOptions.tls = true;
      connectionOptions.tlsAllowInvalidCertificates = false;
    }

    await mongoose.connect(process.env.MONGODB_URL, connectionOptions);

    // After successful connect, the connection should be ready
    // But we'll wait for the 'connected' event to be sure
    const connectionState = mongoose.connection.readyState;
    if (connectionState === 1) {
      isConnected = true;
      console.log("MongoDB connected");
    } else {
      // Wait for connection to be ready
      await new Promise<void>((resolve, reject) => {
        mongoose.connection.once("connected", () => {
          isConnected = true;
          console.log("MongoDB connected");
          resolve();
        });
        mongoose.connection.once("error", reject);
        setTimeout(() => reject(new Error("Connection timeout")), 10000);
      });
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    isConnected = false;
    throw error;
  }
};
