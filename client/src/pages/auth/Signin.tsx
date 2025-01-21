import {
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { signin } from "@/api";
import { useState } from "react";
import { UserData } from "@/types";
import { setUserData } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { signinSchema } from "@/lib/validations";
import AlertDialogLoader from "@/components/AlertDialogLoader";

const Signin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formState, setFormState] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signinSchema.safeParse(formState);
    if (result.success) {
      setErrors({});
      setSubmitting(true);
      try {
        const res = await signin(result.data);
        console.log(res.data);
        if (res.status === 200) {
          const userData: UserData = {
            id: res?.data?.result?._id,
            name: res?.data?.result?.name,
            email: res?.data?.result?.email,
            avatar: res?.data?.result?.avatar,
          };
          toast({
            title: "Success",
            description: res.data.message,
          });
          login(res?.data?.token);
          setUserData(userData);
          navigate("/chats");
        } else {
          toast({
            title: "Error",
            description: "Internal server error",
          });
        }
      } catch (error) {
        console.log(error);
        toast({
          title: "Error",
          description: "Internal server error",
        });
      } finally {
        setSubmitting(false);
      }
    } else {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as string;
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <AlertDialogLoader
        open={submitting}
        title="signing in to the server"
        onOpenChange={setSubmitting}
      />
      <Card className="w-96 h-auto bg-zinc-50">
        <CardHeader>
          <CardTitle>Signin to RelayChat</CardTitle>
          <CardDescription>
            This action will sign you in to the chat app
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full h-auto flex flex-col items-center justify-center gap-4">
          <div className="w-full h-auto flex flex-col items-start justify-start gap-1">
            <Label htmlFor="email">Your email address:</Label>
            <Input
              type="text"
              name="email"
              id="email"
              className={`w-full h-10 border ${
                errors.email ? "border-red-500" : "border-black"
              } bg-white`}
              placeholder="Your email address"
              value={formState.email}
              onChange={handleInputChange}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>
          <div className="w-full h-auto flex flex-col items-start justify-start gap-1">
            <Label htmlFor="password">Your password:</Label>
            <Input
              type="password"
              name="password"
              id="password"
              className={`w-full h-10 border ${
                errors.password ? "border-red-500" : "border-black"
              } bg-white`}
              placeholder="Your password"
              value={formState.password}
              onChange={handleInputChange}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center w-full h-auto gap-3">
          <Button className="w-full" onClick={handleSubmit}>
            SignIn
          </Button>
          <div className="w-full h-auto flex items-center justify-center gap-2">
            <p>Don't have an account??</p>
            <button onClick={() => navigate("/auth/signup")}>SignUp</button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signin;
