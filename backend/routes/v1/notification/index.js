import { Router } from "express";
import { authCheck, checkRole } from "../../../middlewares/index.js";
import notificationController from "../../../controllers/notification.controller.js";

const router = Router();

// Admin send notifications
router.post("/send", authCheck, checkRole("admin"), notificationController.send);

// List my notifications
router.get("/me", authCheck, notificationController.listMine);

// Mark single notification read
router.post("/:id/read", authCheck, notificationController.markRead);
router.post("/mark-all/read", authCheck, notificationController.markAllRead);

export default router;


