import { Router } from "express";
import { authCheck, checkRole } from "../../../middlewares/index.js";
import groupController from "../../../controllers/group.controller.js";
import messageController from "../../../controllers/message.controller.js";

const router = Router();

// Student creates a group
router.post("/", authCheck, checkRole("student"), groupController.createGroup);

// Invite students to group
router.post(
  "/:groupId/invitations",
  authCheck,
  checkRole("student"),
  groupController.sendInvitations
);

// Accept/Reject invitation
router.post(
  "/invitations/:invitationId/respond",
  authCheck,
  checkRole("student"),
  groupController.respondToInvitation
);

// Get current user's group
router.get("/my", authCheck, groupController.getMyGroup);

// Messages
router.get(
  "/:groupId/messages",
  authCheck,
  messageController.listGroupMessages
);

export default router;


