import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";

export const signIn = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Please enter all the details!" });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ message: `User doesn't exist with email: ${email}` });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const userObject = existingUser.toObject();
    const { password: _, ...userWithoutPassword } = userObject;
    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    res.status(200).json({
      success: true,
      message: "user loggedin successfully",
      result: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signUp = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please enter all the details!" });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "user already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await User.create({
      email,
      name,
      password: hashedPassword,
    });
    res
      .status(200)
      .json({ success: true, message: "user created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const searchUsers = async (req, res) => {
  const searchQuery = req.query.search;
  if (searchQuery && searchQuery.trim().length > 0) {
    const keyword = {
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { email: { $regex: searchQuery, $options: "i" } },
      ],
    };
    try {
      const userId = req.user && req.user.id;
      const users = await User.find(keyword)
        .find({ _id: { $ne: userId } })
        .select("-__v -createdAt -updatedAt -password");
      if (users.length === 0) {
        return res.status(202).json({
          message: "No users found matching the search term",
        });
      }
      res.status(200).json({ message: "users fetched", users });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.json({ message: "Invalid search query" });
  }
};

export const accessChat = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res
      .status(400)
      .json({ message: "user id not provided in req body" });
  }
  let isChat = await Chat.find({
    is_group_chat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user.id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latest_message");
  isChat = await User.populate(isChat, {
    path: "latest_message.sender",
    select: "name email avatar",
  });
  if (isChat.length > 0) {
    res
      .status(200)
      .json({ message: "chat fetched successfully", chat: isChat[0] });
  } else {
    let chatData = {
      chat_name: "sender",
      is_group_chat: false,
      users: [req.user.id, userId],
    };
    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res
        .status(200)
        .json({ message: "chat created successfully", chat: fullChat });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "internal server error" });
    }
  }
};

export const fetchChat = async (req, res) => {
  try {
    await Chat.find({ users: { $elemMatch: { $eq: req.user.id } } })
      .populate("users", "-password")
      .populate("group_admin", "-password")
      .populate("latest_message")
      .sort({ updatedAt: -1 })
      .then(async (result) => {
        result = await User.populate(result, {
          path: "latest_message.sender",
          select: "name email avatar",
        });
        res.status(200).json({ message: "chat fetched successfully", result });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const createGroupChat = async (req, res) => {
  const { users, chat_name } = req.body;
  if (!users || !chat_name) {
    return res.status(400).json({ message: "please fill all the fileds!" });
  }
  if (users.length < 2) {
    return res
      .status(400)
      .json({ message: "more tan 2 users are required to form a group chat" });
  }
  users.push(req.user.id);
  try {
    const groupChat = await Chat.create({
      chat_name,
      users,
      is_group_chat: true,
      group_admin: req.user.id,
    });
    const fullGroupChat = await Chat.find({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("group_admin", "-password");
    res
      .status(200)
      .json({ message: "group created successfully", fullGroupChat });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const renameGroupChat = async (req, res) => {
  const { chat_name, chat_id } = req.body;
  if (!chat_name || !chat_id) {
    return res
      .status(400)
      .json({ message: "Chat name and chat ID are required." });
  }
  try {
    const chat = await Chat.findOne({ _id: chat_id });
    if (!chat) {
      return res.status(400).json({ message: "no such group chat is present" });
    }
    const isAdmin = chat.group_admin.toString() === req.user.id;
    if (!isAdmin) {
      return res.status(400).json({
        message:
          "you are not admin, so you don't have access to change group name",
      });
    }
    const updatedChat = await Chat.findByIdAndUpdate(
      chat_id,
      { chat_name },
      { new: true }
    )
      .populate("users", "-password")
      .populate("group_admin", "-password");
    res
      .status(200)
      .json({ message: "chat name updated successfully", updatedChat });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const addGroupMember = async (req, res) => {
  const { chat_id, user_id } = req.body;
  if (!user_id || !chat_id) {
    return res
      .status(400)
      .json({ message: "user ID and chat ID are required." });
  }
  try {
    const chat = await Chat.findOne({ _id: chat_id });
    if (!chat) {
      return res.status(400).json({ message: "no such group chat is present" });
    }
    const isAdmin = chat.group_admin.toString() === req.user.id;
    if (!isAdmin) {
      return res.status(400).json({
        message:
          "you are not admin, so you don't have access to change group name",
      });
    }
    const isExists = chat.users.some((user) => user.toString() === user_id);
    if (isExists) {
      return res
        .status(400)
        .json({ message: "User is already a member of the group." });
    }
    const updatedChat = await Chat.findByIdAndUpdate(
      chat_id,
      { $push: { users: user_id } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("group_admin", "-password");
    res
      .status(200)
      .json({ message: "chat name updated successfully", updatedChat });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const removeGroupMember = async (req, res) => {
  const { chat_id, user_id } = req.body;
  if (!user_id || !chat_id) {
    return res
      .status(400)
      .json({ message: "user ID and chat ID are required." });
  }
  try {
    const chat = await Chat.findOne({ _id: chat_id });
    if (!chat) {
      return res.status(400).json({ message: "no such group chat is present" });
    }
    const isAdmin = chat.group_admin.toString() === req.user.id;
    if (!isAdmin) {
      return res.status(400).json({
        message:
          "you are not admin, so you don't have access to change group name",
      });
    }
    const isExists = chat.users.some((user) => user.toString() === user_id);
    if (!isExists) {
      return res
        .status(400)
        .json({ message: "User is not a member of the group." });
    }
    const updatedChat = await Chat.findByIdAndUpdate(
      chat_id,
      { $pull: { users: user_id } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("group_admin", "-password");
    res
      .status(200)
      .json({ message: "chat name updated successfully", updatedChat });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};
