import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import savingLogo from "../../public/saving.gif";

const AlertDialogLoader = ({
  open,
  title,
  onOpenChange,
}: {
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
          <div className="w-full h-36 mt-6 flex items-center justify-center">
            <img
              src={savingLogo}
              alt="saving"
              className="w-full h-full object-contain object-center"
            />
          </div>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertDialogLoader;
