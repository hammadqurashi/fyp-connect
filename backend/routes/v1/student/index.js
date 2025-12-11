import { Router } from "express";
import { authCheck, checkRole } from "../../../middlewares/index.js";
import studentController from "../../../controllers/student.controller.js";

const router = Router();

// Student profile routes
router.get(
  "/profile",
  authCheck,
  checkRole("student"),
  studentController.getProfile
);
router.put(
  "/profile",
  authCheck,
  checkRole("student"),
  studentController.updateProfile
);
router.get(
  "/profile/complete",
  authCheck,
  checkRole("student"),
  studentController.checkProfileComplete
);

export default router;


