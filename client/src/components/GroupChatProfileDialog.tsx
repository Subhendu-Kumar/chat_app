import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { FaCheck } from "react-icons/fa";
import { Skeleton } from "./ui/skeleton";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { GroupForm, User, UserData } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { searchUsers, updateGroup } from "@/api";

const GroupChatProfileDialog = ({
  open,
  users,
  chat_name,
  onOpenChange,
}: {
  open: boolean;
  users: User[];
  chat_name: string;
  onOpenChange: (open: boolean) => void;
}) => {
  const { user } = useAuth();
  const userIds =
    users.filter((u: User) => u._id !== user?.id).map((u: User) => u._id) ?? [];
  const { toast } = useToast();
  const { setSelectedChat, selectedChat, setReload } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [fetching, setFetching] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [userNotFoundMsg, SetUserNotFoundMsg] = useState<string>("");
  const [fetchedUsers, setFetchedUsers] = useState<UserData[] | []>(users);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [groupForm, setGroupForm] = useState<GroupForm>({
    chat_name: chat_name,
    users: userIds,
  });

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

  const handleUserClick = (userId: string) => {
    setGroupForm((prev) => {
      const isUserInGroup = prev.users.includes(userId);
      return {
        ...prev,
        users: isUserInGroup
          ? prev.users.filter((id) => id !== userId)
          : [...prev.users, userId],
      };
    });
  };

  const fetchUsers = async (query: string) => {
    setFetching(true);
    try {
      const res = await searchUsers(query);
      if (res.status === 200) {
        setFetchedUsers([...res.data.users, ...users]);
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

  const handleSumit = async () => {
    setSubmitting(true);
    try {
      const res = await updateGroup(
        selectedChat!._id,
        groupForm.chat_name,
        groupForm.users
      );
      if (res.status === 200) {
        setSelectedChat(res.data.chat);
        onOpenChange(false);
        setReload(true);
      } else {
        toast({
          title: "Error",
          description: "Someting went wrong!",
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Someting went wrong!",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const uniqueUserArray = fetchedUsers.filter(
    (item, index, self) => index === self.findIndex((t) => t._id === item._id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-96 h-auto">
        <DialogHeader>
          <DialogTitle>Create group</DialogTitle>
          <DialogDescription>
            Add group members and name. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full h-auto flex flex-col items-start justify-start">
          <Input
            type="text"
            value={groupForm.chat_name}
            placeholder="Enter group name"
            className="w-full h-10 border-black text-xl"
            onChange={(e) =>
              setGroupForm({ ...groupForm, chat_name: e.target.value })
            }
          />
          <Input
            type="text"
            value={searchTerm}
            placeholder="Enter username"
            className="mt-4 w-full border-black text-xl h-10"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full h-40 overflow-y-scroll flex flex-col items-start justify-start gap-3">
          {fetching ? (
            Array.from({ length: 3 }).map((_, idx) => {
              return (
                <Skeleton
                  key={idx}
                  className="w-full h-8 bg-zinc-100 border border-gray-200"
                />
              );
            })
          ) : userNotFoundMsg ? (
            <div className="w-full h-full flex items-center justify-center text-xl font-medium text-red-500">
              {userNotFoundMsg}
            </div>
          ) : (
            uniqueUserArray.map((user, idx) => {
              return (
                <div
                  key={idx}
                  onClick={() => handleUserClick(user._id!)}
                  className="w-full h-auto p-1 flex items-center cursor-pointer justify-between bg-zinc-100 hover:bg-purple-100 transition-all duration-300 ease-in-out border border-gray-200 rounded-md"
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 rounded-full flex bg-green-400 items-center justify-center overflow-hidden">
                      {groupForm.users.includes(user._id!) ? (
                        <FaCheck className="text-sm text-white" />
                      ) : (
                        <img
                          src={user.avatar}
                          alt="logo"
                          className="w-full h-full object-cover object-center"
                        />
                      )}
                    </div>
                    <div className="flex flex-col items-start justify-start">
                      <p className="text-sm font-medium text-gray-700 capitalize">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        Email: {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSumit}>
            {submitting ? "Saving data" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupChatProfileDialog;
