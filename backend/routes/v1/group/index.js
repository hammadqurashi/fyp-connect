import { Router } from "express";
import { authCheck, checkRole } from "../../../middlewares/index.js";
import groupController from "../../../controllers/group.controller.js";
import messageController from "../../../controllers/message.controller.js";
import fileController from "../../../controllers/file.controller.js";
import { upload } from "../../../middlewares/upload.js";

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
router.post(
  "/:groupId/messages",
  authCheck,
  messageController.createMessage
);

router.get(
  "/:groupId/messages",
  authCheck,
  messageController.listGroupMessages
);

// Files
router.get(
  "/:groupId/files",
  authCheck,
  messageController.listGroupFiles
);

router.post(
  "/:groupId/files",
  authCheck,
  upload.single("file"),
  fileController.uploadFile
);

router.get(
  "/files/:fileId/download",
  authCheck,
  fileController.downloadFile
);

export default router;


