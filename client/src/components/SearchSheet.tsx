import {
  Sheet,
  SheetTitle,
  SheetHeader,
  SheetTrigger,
  SheetContent,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "./ui/input";
import { UserData } from "@/types";
import { Skeleton } from "./ui/skeleton";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { accessChat, searchUsers } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { AiOutlineLoading3Quarters, AiOutlineSearch } from "react-icons/ai";

const SearchSheet = () => {
  const { toast } = useToast();
  const { setSelectedChat, selectedChat, setReload, chats, setChats } =
    useAuth();
  const [open, onOpenChange] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [fetching, setFetching] = useState<boolean>(false);
  const [fetchingChat, setFetchingChat] = useState<boolean>(false);
  const [userNotFoundMsg, SetUserNotFoundMsg] = useState<string>("");
  const [fetchedUsers, setFetchedUsers] = useState<UserData[] | []>([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [userIdofChatWhichIsFecthing, setUserIdofChatWhichIsFecthing] =
    useState<string | undefined>("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchUsers(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  const fetchUsers = async (query: string) => {
    setFetching(true);
    try {
      const res = await searchUsers(query);
      if (res.status === 200) {
        setFetchedUsers(res.data.users);
      }
      if (res.status === 202) {
        SetUserNotFoundMsg(res.data.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      SetUserNotFoundMsg("Something went wrong!!!");
    } finally {
      setFetching(false);
    }
  };

  const handleAccessChat = async (userId: string | undefined) => {
    setUserIdofChatWhichIsFecthing(userId);
    setFetchingChat(true);
    setReload(false);
    try {
      const res = await accessChat(userId);
      if (res.status === 200) {
        if (chats.find((c) => c._id === res.data.chat._id)) {
          setChats([res.data.chat, ...chats]);
        }
        setSelectedChat(res.data.chat);
        setReload(true);
        onOpenChange(false);
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "something went wrong when fetching chats",
        variant: "destructive",
      });
    } finally {
      setFetchingChat(false);
      console.log(selectedChat);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger>
        <div className="w-40 h-auto px-2 py-1 bg-zinc-100 border border-gray-200 rounded-md flex items-center justify-start gap-3">
          <AiOutlineSearch className="text-xl" />
          <p className="pb-1">Search</p>
        </div>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Search users!</SheetTitle>
          <SheetDescription className="w-full h-auto flex items-center justify-center gap-2">
            <Input
              type="text"
              value={searchTerm}
              placeholder="Enter username"
              className="w-full h-10 border-black text-xl"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SheetDescription>
        </SheetHeader>
        <div className="w-full h-full overflow-y-scroll mt-6 flex flex-col items-start justify-start gap-3">
          {fetching ? (
            Array.from({ length: 3 }).map((_, idx) => {
              return (
                <Skeleton
                  key={idx}
                  className="w-full h-10 bg-zinc-100 border border-gray-200"
                />
              );
            })
          ) : userNotFoundMsg ? (
            <div className="w-full h-40 flex items-center justify-center text-xl font-medium text-red-500">
              {userNotFoundMsg}
            </div>
          ) : (
            fetchedUsers.map((user, idx) => {
              return (
                <div
                  key={idx}
                  onClick={() => handleAccessChat(user?._id)}
                  className="w-full h-auto p-2 flex items-center cursor-pointer justify-between bg-zinc-100 hover:bg-purple-100 transition-all duration-300 ease-in-out border border-gray-200 rounded-md"
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img
                        src={user.avatar}
                        alt="logo"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="flex flex-col items-start justify-start">
                      <p className="text-base font-medium text-gray-700 capitalize">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Email: {user.email}
                      </p>
                    </div>
                  </div>
                  {user._id === userIdofChatWhichIsFecthing && fetchingChat && (
                    <AiOutlineLoading3Quarters className="animate-spin text-xl" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SearchSheet;
