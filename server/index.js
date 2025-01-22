import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import router from "./route/router.js";
import { Server } from "socket.io";
import { createServer } from "http";
import { socketHandler } from "./controller/socketController.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;
const DB_CONNECTION_URL = process.env.DATABASE_URL;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello, JavaScript with Express!");
});

app.use("/api", router);

socketHandler(io);

mongoose
  .connect(DB_CONNECTION_URL)
  .then(() => {
    server.listen(PORT, () =>
      console.log(`server is listening on at http://localhost:${PORT}`)
    );
  })
  .catch((error) => {
    console.error(error.message);
  });
