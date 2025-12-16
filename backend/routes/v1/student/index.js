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

// Student group routes
router.post(
  "/group",
  authCheck,
  checkRole("student"),
  studentController.createGroup
);
router.get(
  "/group",
  authCheck,
  checkRole("student"),
  studentController.getMyGroup
);
router.get(
  "/students/search",
  authCheck,
  checkRole("student"),
  studentController.searchStudents
);
router.post(
  "/invitation/:invitationId/respond",
  authCheck,
  checkRole("student"),
  studentController.respondToInvitation
);
router.delete(
  "/group/:groupId",
  authCheck,
  checkRole("student"),
  studentController.deleteGroup
);
router.get(
  "/invitations/received",
  authCheck,
  checkRole("student"),
  studentController.getReceivedInvitations
);

// Supervisor-related routes
router.get(
  "/supervisors",
  authCheck,
  checkRole("student"),
  studentController.getAllSupervisors
);
router.get(
  "/supervisors/:supervisorId",
  authCheck,
  checkRole("student"),
  studentController.getSupervisorProfile
);
router.post(
  "/supervisors/request",
  authCheck,
  checkRole("student"),
  studentController.requestSupervision
);
router.post(
  "/supervisors/cancel-request",
  authCheck,
  checkRole("student"),
  studentController.cancelSupervisionRequest
);

export default router;


