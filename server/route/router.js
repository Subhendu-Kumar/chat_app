import {
  signIn,
  signUp,
  fetchChat,
  accessChat,
  searchUsers,
  createGroupChat,
  updateGroupChat,
} from "../controller/controller.js";
import express from "express";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/signin", signIn);
router.post("/signup", signUp);
router.get("/users", verifyToken, searchUsers);
router.get("/chat/fetch", verifyToken, fetchChat);
router.post("/chat/access", verifyToken, accessChat);
router.put("/chat/group/update", verifyToken, updateGroupChat);
router.post("/chat/group/create", verifyToken, createGroupChat);

export default router;
