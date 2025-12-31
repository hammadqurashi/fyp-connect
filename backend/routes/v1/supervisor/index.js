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
router.get("/posts", authCheck, checkRole("supervisor"), supervisorController.getMyPosts);
router.put("/posts/:postId", authCheck, checkRole("supervisor"), supervisorController.updatePost);
router.delete("/posts/:postId", authCheck, checkRole("supervisor"), supervisorController.deletePost);

// Supervisor gets all supervision requests
router.get(
  "/requests",
  authCheck,
  checkRole("supervisor"),
  supervisorController.getSupervisionRequests
);

// Supervisor responds to requests
router.post(
  "/requests/:requestId/respond",
  authCheck,
  checkRole("supervisor"),
  supervisorController.respondToRequest
);

// Dashboard
router.get("/dashboard", authCheck, checkRole("supervisor"), supervisorController.getDashboard);

export default router;



