import {
  signIn,
  signUp,
  fetchChat,
  accessChat,
  searchUsers,
  addGroupMember,
  renameGroupChat,
  createGroupChat,
  removeGroupMember,
} from "../controller/controller.js";
import express from "express";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/signin", signIn);
router.post("/signup", signUp);
router.get("/users", verifyToken, searchUsers);
router.get("/chat/fetch", verifyToken, fetchChat);
router.post("/chat/access", verifyToken, accessChat);
router.put("/chat/group/add", verifyToken, addGroupMember);
router.put("/chat/group/rename", verifyToken, renameGroupChat);
router.post("/chat/group/create", verifyToken, createGroupChat);
router.put("/chat/group/remove", verifyToken, removeGroupMember);

export default router;
