import GroupFile from "../models/group-file.js";
import Group from "../models/group.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileController = {
  uploadFile: async (req, res) => {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ success: false, msg: "No file uploaded" });
      }

      const group = await Group.findById(groupId).lean();
      if (!group) {
        return res.status(404).json({ success: false, msg: "Group not found" });
      }

      const isMember = group.members.map((m) => m.toString()).includes(userId);
      const isSupervisor = group.supervisor && group.supervisor.toString() === userId;
      
      if (!isMember && !isSupervisor) {
        return res.status(403).json({ success: false, msg: "Not a member of this group" });
      }

      // Create file record
      const fileUrl = `/uploads/${file.filename}`;
      const groupFile = await GroupFile.create({
        group: groupId,
        fileName: file.originalname,
        fileUrl,
        fileSize: file.size,
        fileType: file.mimetype,
        uploadedBy: userId,
      });

      const populatedFile = await GroupFile.findById(groupFile._id)
        .populate("uploadedBy", "firstName lastName")
        .lean();

      return res.status(200).json({
        success: true,
        msg: "File uploaded successfully",
        data: { file: populatedFile },
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        msg: err.message || "Failed to upload file",
      });
    }
  },

  downloadFile: async (req, res) => {
    try {
      const { fileId } = req.params;
      const userId = req.user.id;

      const file = await GroupFile.findById(fileId).populate("group").lean();
      if (!file) {
        return res.status(404).json({ success: false, msg: "File not found" });
      }

      const group = file.group;
      const isMember = group.members.map((m) => m.toString()).includes(userId);
      const isSupervisor = group.supervisor && group.supervisor.toString() === userId;
      
      if (!isMember && !isSupervisor) {
        return res.status(403).json({ success: false, msg: "Not authorized to download this file" });
      }

      const filePath = path.join(__dirname, "..", file.fileUrl);
      res.download(filePath, file.fileName);
    } catch (err) {
      return res.status(500).json({
        success: false,
        msg: err.message || "Failed to download file",
      });
    }
  },
};

export default fileController;

