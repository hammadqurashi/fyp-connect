import express from "express";
import mongoose from "mongoose";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import Message from "./models/message.js";
import connectDB from "./lib/connectDB.js";
import { AppConfig } from "./config/index.js";
import authRouter from "./routes/v1/auth/index.js";
import userRouter from "./routes/v1/user/index.js";
import groupRouter from "./routes/v1/group/index.js";
import supervisorRouter from "./routes/v1/supervisor/index.js";
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

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/group", groupRouter);
app.use("/api/v1/supervisor", supervisorRouter);
app.use("/api/v1/notification", notificationRouter);

app.get("/", (req, res) => {
  return res.status(200).json({ success: true, message: "App running" });
});

connectDB();

// Socket.io basic rooms by group
io.on("connection", (socket) => {
  socket.on("join_group", ({ groupId }) => {
    if (groupId) {
      socket.join(`group:${groupId}`);
    }
  });

  socket.on("group_message", async ({ groupId, message, senderId }) => {
    if (groupId && message && senderId) {
      try {
        const saved = await Message.create({ group: groupId, sender: senderId, content: message, type: "text" });
        io.to(`group:${groupId}`).emit("group_message", { message, ts: Date.now(), senderId });
      } catch (err) {
        // swallow for now
      }
    }
  });
});

server.listen(AppConfig.appPort, () => {
  console.log(`App running on port ${AppConfig.appPort}`);
});
