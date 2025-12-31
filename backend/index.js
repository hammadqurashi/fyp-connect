import express from "express";
import mongoose from "mongoose";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "./models/message.js";
import connectDB from "./lib/connectDB.js";
import { AppConfig } from "./config/index.js";
import authRouter from "./routes/v1/auth/index.js";
import userRouter from "./routes/v1/user/index.js";
import groupRouter from "./routes/v1/group/index.js";
import supervisorRouter from "./routes/v1/supervisor/index.js";
import studentRouter from "./routes/v1/student/index.js";
import notificationRouter from "./routes/v1/notification/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
  },
});

app.use(
  cors({
    origin: "*",
  })
);

mongoose.set("strictQuery", true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/group", groupRouter);
app.use("/api/v1/supervisor", supervisorRouter);
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/notification", notificationRouter);

app.get("/", (req, res) => {
  return res.status(200).json({ success: true, message: "App running" });
});

connectDB();

// Socket.io basic rooms by group
const onlineUsers = new Map(); // Map<userId, Set<socketId>>

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      const decoded = jwt.verify(token, AppConfig.jwtSecret);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
    }
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.userId;
  
  if (userId) {
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
  }

  socket.on("join_group", ({ groupId }) => {
    if (groupId && userId) {
      socket.join(`group:${groupId}`);
      // Notify group members that user is online
      io.to(`group:${groupId}`).emit("user_online", { userId });
      
      // Notify the joining user about other online members in the group
      const groupRoom = io.sockets.adapter.rooms.get(`group:${groupId}`);
      if (groupRoom) {
        const onlineUserIds = new Set();
        groupRoom.forEach((socketId) => {
          const socket = io.sockets.sockets.get(socketId);
          if (socket?.userId && socket.userId !== userId) {
            onlineUserIds.add(socket.userId);
          }
        });
        // Send list of online users to the newly joined user
        socket.emit("group_online_users", { userIds: Array.from(onlineUserIds) });
      }
    }
  });

  socket.on(
    "group_message",
    async ({
      groupId,
      message,
      senderId,
      type,
      fileUrl,
      fileName,
      fileSize,
    }) => {
      console.log(
        "groupId && senderId && (message || fileUrl)",
        groupId && senderId && (message || fileUrl)
      );
      console.log({
        message: message || fileName || "",
        ts: Date.now(),
        senderId,
        type: type || "text",
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
      });
      if (groupId && senderId && !!(message || fileUrl)) {
        console.log("here");
        try {
          io.to(`group:${groupId}`).emit("group_message", {
            message: message || fileName || "",
            ts: Date.now(),
            senderId,
            type: type || "text",
            fileUrl: fileUrl || null,
            fileName: fileName || null,
            fileSize: fileSize || null,
          });
        } catch (err) {
          console.error("Error saving message:", err);
        }
      }
    }
  );

  socket.on("disconnect", () => {
    const uid = socket.userId;
    if (uid && onlineUsers.has(uid)) {
      onlineUsers.get(uid).delete(socket.id);
      if (onlineUsers.get(uid).size === 0) {
        onlineUsers.delete(uid);
        // Notify all groups that user went offline
        io.emit("user_offline", { userId: uid });
      }
    }
  });
});

server.listen(AppConfig.appPort, () => {
  console.log(`App running on port ${AppConfig.appPort}`);
});
