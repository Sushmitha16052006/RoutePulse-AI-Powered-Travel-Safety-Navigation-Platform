import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongod = null;

const ConnectToDb = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // If MONGO_URI is "memory" or empty, spin up in-memory MongoDB (no install needed)
    if (!uri || uri === "memory") {
      console.log("🔧 Starting in-memory MongoDB (no installation required)...");
      mongod = await MongoMemoryServer.create({
        instance: {
          launchTimeout: 60000 // Increased timeout to 60 seconds to prevent crashes
        }
      });
      uri = mongod.getUri();
      console.log(`✅ In-memory MongoDB started at: ${uri}`);
    }

    await mongoose.connect(uri);
    console.log("✅ Connected to Database");
  } catch (error) {
    console.log("❌ Error connecting to Database:", error.message);
    process.exit(1);
  }
};

export default ConnectToDb;