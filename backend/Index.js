import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import UserRoutes from "./Routes/UserRoutes.js";
import ContactRoutes from "./Routes/ContactsRoutes.js";
import ReviewRoutes from "./Routes/ReviewRoutes.js";
import ProfileRoutes from "./Routes/ProfileRoutes.js";
import GuidanceRoutes from "./Routes/GuidanceRoutes.js";

import ConnectToDb from "./Utils/ConnectDb.js";
//import { initializeWhatsApp } from "./Utils/WhatsAppClient.js";

dotenv.config();

const app = express();

ConnectToDb().then(() => {
  // Initialize WhatsApp Client for SOS messages AFTER database starts
  // This prevents heavy CPU load and memory server timeout issues
  //initializeWhatsApp();
});

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
    ],
    credentials: true,
  })
);

// Routes
app.use("/api/users", UserRoutes);
app.use("/api/contacts", ContactRoutes);
app.use("/api/reviews", ReviewRoutes);
app.use("/api/profile", ProfileRoutes);
app.use("/api/guidance", GuidanceRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});

// Server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});