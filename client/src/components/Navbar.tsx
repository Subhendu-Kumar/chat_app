import {
  Menubar,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarSeparator,
} from "@/components/ui/menubar";
import { useState } from "react";
import { FaBell } from "react-icons/fa";
import SearchSheet from "./SearchSheet";
import ProfileDialog from "./ProfileDialog";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const { user, logout, notification, setNotification, setSelectedChat } =
    useAuth();
  const [showProfile, setShowProfile] = useState<boolean>(false);

  return (
    <div className="w-full h-14 bg-zinc-50 border-b border-gray-200 px-10 flex items-center justify-between">
      <ProfileDialog
        open={showProfile}
        onOpenChange={setShowProfile}
        user={user!}
      />
      <SearchSheet />
      <div className="text-xl font-semibold font-serif select-none flex items-center justify-center gap-2">
        <img src="./logo.svg" alt="logo" className="w-10 h-10" />
        <span>RelayChat</span>
      </div>
      <div className="w-40 h-auto flex items-center justify-end gap-3">
        <Menubar className="border-none bg-transparent p-0 m-0 shadow-none">
          <MenubarMenu>
            <MenubarTrigger>
              <FaBell className="text-2xl" />
            </MenubarTrigger>
            <MenubarContent align="end">
              {notification.length === 0 ? (
                <>
                  <MenubarItem>No notifications</MenubarItem>
                  <MenubarSeparator />
                </>
              ) : (
                notification.map((noti, idx) => {
                  return (
                    <div key={idx}>
                      <MenubarItem
                        onClick={() => {
                          setSelectedChat(noti.chat);
                          setNotification(
                            notification.filter((n) => n !== noti)
                          );
                        }}
                      >
                        {noti.chat.is_group_chat
                          ? `New message in ${noti.chat.chat_name}`
                          : `New message from ${noti.sender.name}`}
                      </MenubarItem>
                      <MenubarSeparator />
                    </div>
                  );
                })
              )}
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>
              <button className="w-8 h-8 rounded-full overflow-hidden">
                <img
                  src={user?.avatar}
                  alt="logo"
                  className="w-full h-full object-cover object-center"
                />
              </button>
            </MenubarTrigger>
            <MenubarContent align="end">
              <MenubarItem>
                <button
                  className="w-full text-left"
                  onClick={() => setShowProfile(true)}
                >
                  My Profile
                </button>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>
                <button className="w-full text-left" onClick={logout}>
                  Signout
                </button>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </div>
  );
};

export default Navbar;
