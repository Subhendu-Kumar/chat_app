import mongoose from "mongoose";

const user_model = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dzifzjy5a/image/upload/v1730063602/d6jgofrttwkmincxynqh.jpg",
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", user_model);
