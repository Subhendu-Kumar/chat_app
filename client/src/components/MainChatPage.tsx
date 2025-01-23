import { useAuth } from "@/context/AuthContext";
import { Message, User } from "@/types";
import React, { useEffect, useState } from "react";
import ProfileDialog from "./ProfileDialog";
import { IoMdMenu } from "react-icons/io";
import { BsEmojiHeartEyes } from "react-icons/bs";
import { FiUploadCloud, FiSend } from "react-icons/fi";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import GroupChatProfileDialog from "./GroupChatProfileDialog";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { AiOutlineCheck, AiOutlineLoading3Quarters } from "react-icons/ai";
import { messageFetch, messageSend } from "@/api";
import io from "socket.io-client";
import { END_POINT } from "@/config";

const MainChatPage = () => {
  const { toast } = useToast();
  const { selectedChat, user, notification, setNotification } = useAuth();
  const filteredUser = selectedChat?.users.filter(
    (u: User) => u._id !== user?.id
  );
  const formateduser = {
    id: filteredUser![0]._id,
    name: filteredUser![0].name,
    avatar: filteredUser![0].avatar,
    email: filteredUser![0].email,
  };
  const [showOtherUserProfile, setShowOtherUserProfile] =
    useState<boolean>(false);
  const [showGroupChatProfile, setShowGroupChatProfile] =
    useState<boolean>(false);
  const [loadingChat, setLoadingChat] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<string>("");
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [messageSent, setMessageSent] = useState<boolean>(false);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [typing, setTyping] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [fetchedMessages, setFetchedMessages] = useState<Message[] | []>([]);

  const socket = io(END_POINT);
  const selectedChatCompare = selectedChat;
  console.log(isTyping);

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      return toast({
        title: "Error",
        description: "message must not be empty",
        variant: "destructive",
      });
    }
    setSendingMessage(true);
    setMessageSent(false);
    setNewMessage("");
    socket.emit("stop_typing", selectedChat!._id);
    try {
      const res = await messageSend(newMessage, selectedChat!._id);
      if (res.status === 200) {
        socket.emit("new_message", res.data.message);
        setFetchedMessages([...fetchedMessages, res.data.message]);
        setMessageSent(true);
        setTimeout(() => setMessageSent(false), 2000);
      } else {
        toast({
          title: "Error",
          description: "something wemt wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "something wemt wrong",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) {
      return;
    }
    setLoadingChat(true);
    try {
      const res = await messageFetch(selectedChat!._id);
      if (res.status === 200) {
        setFetchedMessages(res.data.messages);
        socket.emit("join_chat", selectedChat._id);
      } else {
        toast({
          title: "Error",
          description: "something wemt wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "something wemt wrong",
        variant: "destructive",
      });
    } finally {
      setLoadingChat(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!socketConnected) {
      return;
    }
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat!._id);
    }
    const lastTypingTime = new Date().getTime();
    setTimeout(() => {
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - lastTypingTime;
      if (timeDiff >= 2000 && typing) {
        socket.emit("stop_typing", selectedChat!._id);
        setTyping(false);
      }
    }, 2000);
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    socket.emit("setup", user);
    socket.on("connected", () => {
      setSocketConnected(true);
    });
    socket.on("typing", () => {
      setIsTyping(true);
    });
    socket.on("stop_typing", () => {
      setIsTyping(false);
    });
  });

  useEffect(() => {
    socket.on("message_recived", (newMessageRecived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecived.chat._id
      ) {
        if (!notification.includes(newMessageRecived)) {
          setNotification([newMessageRecived, ...notification]);
        }
      } else {
        setFetchedMessages([...fetchedMessages, newMessageRecived]);
      }
    });
  });

  return (
    <div className="w-[75%] h-full">
      <ProfileDialog
        user={formateduser}
        open={showOtherUserProfile}
        onOpenChange={setShowOtherUserProfile}
      />
      {selectedChat?.is_group_chat && (
        <GroupChatProfileDialog
          open={showGroupChatProfile}
          onOpenChange={setShowGroupChatProfile}
          users={filteredUser!}
          chat_name={selectedChat?.chat_name}
        />
      )}
      <div className="w-full h-14 border-b border-gray-300 flex items-center justify-between px-6">
        <button
          onClick={() => {
            if (selectedChat?.is_group_chat) {
              setShowGroupChatProfile(true);
            } else {
              setShowOtherUserProfile(true);
            }
          }}
          className="flex items-center justify-center gap-3"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-full overflow-hidden">
            <img
              src={formateduser.avatar}
              alt="logo"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <h1 className="text-lg capitalize">
            {selectedChat?.is_group_chat
              ? selectedChat.chat_name
              : formateduser.name}
          </h1>
        </button>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger className="cursor-pointer">
              <IoMdMenu className="text-2xl" />
            </MenubarTrigger>
            <MenubarContent align="end">
              <MenubarItem>New Window</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Share</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Print</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
      <div className="w-full h-[calc(100vh-112px)] bg-pattern flex items-center justify-center flex-col">
        <div
          className={`w-full h-[calc(100vh-168px)] overflow-y-scroll px-4 pb-4 py-2 flex gap-2 ${
            loadingChat ? "items-center justify-center" : "flex-col-reverse"
          }`}
        >
          {loadingChat ? (
            <AiOutlineLoading3Quarters className="text-7xl text-gray-400 animate-spin" />
          ) : (
            fetchedMessages.length > 0 &&
            [...fetchedMessages].reverse().map((msg, idx) => {
              const isSender = msg.sender._id === user?.id;
              return (
                <div
                  key={idx}
                  className={`w-full h-auto flex items-center ${
                    isSender ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[40%] p-2 rounded-md ${
                      isSender ? "bg-[#d9fdd3]" : "bg-white"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="w-full h-14 border-t border-gray-300 bg-white px-2 flex items-center justify-start gap-1">
          <button className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-zinc-100">
            <BsEmojiHeartEyes className="text-lg text-gray-600" />
          </button>
          <button className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-zinc-100">
            <FiUploadCloud className="text-lg text-gray-600" />
          </button>
          <Input
            type="text"
            value={newMessage}
            onKeyDown={handleKeyDown}
            placeholder="Enter your message"
            className="w-[calc(100%-120px)] shadow-none"
            onChange={(e) => handleTyping(e)}
          />
          <button
            onClick={sendMessage}
            className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-zinc-100"
          >
            {sendingMessage ? (
              <AiOutlineLoading3Quarters className="animate-spin text-lg text-gray-600" />
            ) : messageSent ? (
              <AiOutlineCheck className="text-lg text-green-600" />
            ) : (
              <FiSend className="text-lg text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainChatPage;
