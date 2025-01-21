import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";

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
      .json({ message: "group created successfully", chat: fullGroupChat });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const updateGroupChat = async (req, res) => {
  const { chat_id, chat_name, users } = req.body;
  if (!chat_id || !chat_name || !users) {
    return res.status(400).json({ message: "All feilds are required." });
  }
  try {
    const chat = await Chat.findById(chat_id);
    if (!chat) {
      return res.status(404).json({ message: "Group chat not found." });
    }
    const isAdmin = chat.group_admin.toString() === req.user.id;
    if (!isAdmin) {
      return res.status(403).json({
        message: "You are not the admin of this group.",
      });
    }
    chat.chat_name = chat_name;
    if (!Array.isArray(users) || users.length < 2) {
      return res.status(400).json({
        message: "Users must be an array with at least 2 members.",
      });
    }
    users.push(req.user.id);
    chat.users = users;
    const updatedChat = await chat.save();
    const populatedChat = await Chat.findById(updatedChat._id)
      .populate("users", "-password")
      .populate("group_admin", "-password");
    res.status(200).json({
      message: "Group updated successfully",
      chat: populatedChat,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  const { content, chat_id } = req.body;
  if (!content || !chat_id) {
    return res.status(400).json({ message: "invalid data passed to req" });
  }
  const newMessage = {
    sender: req.user.id,
    content,
    chat: chat_id,
  };
  try {
    const chat = await Chat.findById(chat_id);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }
    const isMember = chat.users.some((user) => user.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this chat.",
      });
    }
    let message = await Message.create(newMessage);
    await Chat.findByIdAndUpdate(chat_id, { latest_message: message._id });
    message = await Message.findById(message._id)
      .populate("sender", "-password")
      .populate({
        path: "chat",
        populate: [
          {
            path: "users",
            select: "-password",
          },
          {
            path: "group_admin",
            select: "-password",
          },
          {
            path: "latest_message",
            populate: {
              path: "sender",
              select: "-password",
            },
          },
        ],
      });
    res.status(200).json({ message, msg: "Message sent successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const fetchMessage = async (req, res) => {
  const { chat_id } = req.params;
  if (!chat_id) {
    return res.status(400).json({ message: "Chat id not provided" });
  }
  try {
    const messages = await Message.find({ chat: chat_id })
      .populate("sender", "-password")
      .populate("chat");
    res.status(200).json({ messages, mes: "messages fetched successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
