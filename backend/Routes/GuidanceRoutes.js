import express from "express";
import { GetGuidance, GetAllStations } from "../Controllers/GuidanceController.js";

const router = express.Router();

router.get("/guide",    GetGuidance);
router.get("/stations", GetAllStations);

export default router;
