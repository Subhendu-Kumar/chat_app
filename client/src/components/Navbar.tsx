import {
  Menubar,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarShortcut,
  MenubarSeparator,
} from "@/components/ui/menubar";
import { useState } from "react";
import { FaBell } from "react-icons/fa";
import SearchSheet from "./SearchSheet";
import ProfileDialog from "./ProfileDialog";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState<boolean>(false);

  return (
    <div className="w-full h-14 bg-zinc-50 border-b border-gray-200 px-10 flex items-center justify-between">
      <ProfileDialog
        open={showProfile}
        onOpenChange={setShowProfile}
        user={user!}
      />
      <SearchSheet />
      <p className="text-xl font-semibold font-serif select-none">RelayChat</p>
      <div className="w-40 h-auto flex items-center justify-end gap-3">
        <Menubar className="border-none bg-transparent p-0 m-0 shadow-none">
          <MenubarMenu>
            <MenubarTrigger>
              <FaBell className="text-2xl" />
            </MenubarTrigger>
            <MenubarContent align="end">
              <MenubarItem>
                New Tab <MenubarShortcut>⌘T</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>New Window</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Share</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Print</MenubarItem>
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
