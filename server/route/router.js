import {
  signIn,
  signUp,
  fetchChat,
  accessChat,
  searchUsers,
  sendMessage,
  fetchMessage,
  createGroupChat,
  updateGroupChat,
} from "../controller/controller.js";
import express from "express";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/signin", signIn);
router.post("/signup", signUp);
router.post("/chat/access", verifyToken, accessChat);
router.post("/chat/message/send", verifyToken, sendMessage);
router.post("/chat/group/create", verifyToken, createGroupChat);

router.put("/chat/group/update", verifyToken, updateGroupChat);

router.get("/users", verifyToken, searchUsers);
router.get("/chat/fetch", verifyToken, fetchChat);
router.get("/chat/message/fetch/:chat_id", verifyToken, fetchMessage);

export default router;
