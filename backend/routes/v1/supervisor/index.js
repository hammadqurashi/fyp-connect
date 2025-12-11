import { Router } from "express";
import { authCheck, checkRole } from "../../../middlewares/index.js";
import supervisorController from "../../../controllers/supervisor.controller.js";

const router = Router();

// Supervisor profile routes
router.get(
  "/profile",
  authCheck,
  checkRole("supervisor"),
  supervisorController.getProfile
);
router.put(
  "/profile",
  authCheck,
  checkRole("supervisor"),
  supervisorController.updateProfile
);
router.get(
  "/profile/complete",
  authCheck,
  checkRole("supervisor"),
  supervisorController.checkProfileComplete
);

// Supervisor posts
router.post("/posts", authCheck, checkRole("supervisor"), supervisorController.createPost);
router.get("/posts", authCheck, supervisorController.listPosts);

// Student requests supervision (group -> supervisor)
router.post(
  "/requests",
  authCheck,
  checkRole("student"),
  supervisorController.requestSupervision
);

// Supervisor responds to requests
router.post(
  "/requests/:requestId/respond",
  authCheck,
  checkRole("supervisor"),
  supervisorController.respondToRequest
);

export default router;



