import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserData } from "@/types";

const ProfileDialog = ({
  open,
  user,
  onOpenChange,
}: {
  open: boolean;
  user: UserData;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-96 h-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">My profile</DialogTitle>
        </DialogHeader>
        <div className="w-full h-auto flex items-center justify-center flex-col">
          <div className="w-32 h-32 rounded-full overflow-hidden">
            <img
              src={user?.avatar}
              alt="logo"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <p className="w-full flex items-center justify-start gap-2 mt-4 text-lg font-semibold">
            Id: <span className="font-medium text-gray-600">{user?.id}</span>
          </p>
          <p className="w-full flex items-center justify-start gap-2 text-lg font-semibold">
            Name:{" "}
            <span className="font-medium text-gray-600">{user?.name}</span>
          </p>
          <p className="w-full flex items-center justify-start gap-2 text-lg font-semibold">
            Email:{" "}
            <span className="font-medium text-gray-600">{user?.email}</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
