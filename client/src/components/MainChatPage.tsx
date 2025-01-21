import { useAuth } from "@/context/AuthContext";
import { User } from "@/types";
import { useState } from "react";
import ProfileDialog from "./ProfileDialog";
import { IoMdMenu } from "react-icons/io";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import GroupChatProfileDialog from "./GroupChatProfileDialog";

const MainChatPage = () => {
  const { selectedChat, user } = useAuth();
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
    </div>
  );
};

export default MainChatPage;
