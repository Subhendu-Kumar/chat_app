import { fetchAllChat } from "@/api";
import { Button } from "./ui/button";
import { FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import CreateGroupChatDialog from "./CreateGroupChatDialog";

const ChatSidebar = () => {
  const { selectedChat, setSelectedChat, reload, chats, setChats, user } =
    useAuth();
  const loggedInUserId = user?.id;
  const [openCreateGroupDialog, setOpenCreateGroupDialog] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetchAllChat();
        if (res.status === 200) {
          setChats(res.data.result);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchChats();
  }, [setChats, reload]);

  return (
    <div className="w-[25%] h-full border-r border-gray-200 p-4">
      <CreateGroupChatDialog
        open={openCreateGroupDialog}
        onOpenChange={setOpenCreateGroupDialog}
      />
      <div className="w-full h-10 flex items-center justify-between">
        <p className="text-xl">My chats</p>
        <Button
          variant="outline"
          onClick={() => setOpenCreateGroupDialog(true)}
          className="flex items-center justify-center gap-3"
        >
          <span>New group chat</span>
          <FaPlus />
        </Button>
      </div>
      <div className="w-full h-[calc(100vh-152px)] overflow-y-scroll flex flex-col items-start justify-start gap-3 mt-6">
        {chats.map((chat, idx) => {
          const filteredUsers = chat.users
            .filter((user) => user._id !== loggedInUserId)
            .map(({ name, avatar }) => ({ name, avatar }));
          return (
            <div
              className={`w-full h-auto cursor-pointer flex items-center justify-start gap-3 border border-gray-100 p-2 rounded-md ${
                chat === selectedChat
                  ? "bg-purple-300"
                  : "bg-purple-50 hover:bg-purple-100"
              }`}
              onClick={() => setSelectedChat(chat)}
              key={idx}
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={filteredUsers[0].avatar}
                    alt="logo"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="flex flex-col items-start justify-start">
                  <p className="text-base font-medium text-gray-700 capitalize">
                    {chat.is_group_chat
                      ? chat.chat_name
                      : filteredUsers[0].name}
                  </p>
                  <p className="text-sm text-gray-600">latest message</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatSidebar;
