import {
  Card,
  CardTitle,
  CardHeader,
  CardFooter,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { signup } from "@/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { signupSchema } from "@/lib/validations";
import AlertDialogLoader from "@/components/AlertDialogLoader";

const Signup = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signupSchema.safeParse(formState);
    if (result.success) {
      setErrors({});
      setSubmitting(true);
      try {
        const data = {
          name: result.data.name,
          email: result.data.email,
          password: result.data.password,
        };
        const res = await signup(data);
        if (res.status === 200) {
          toast({
            title: "Success",
            description: res.data.message,
          });
          navigate("/auth/signin");
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
        title="signing up to the server"
        onOpenChange={setSubmitting}
      />
      <Card className="w-96 h-auto bg-zinc-50">
        <CardHeader>
          <CardTitle>Signup to RelayChat</CardTitle>
          <CardDescription>
            This action will sign you up for the chat app
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full h-auto flex flex-col items-center justify-center gap-4">
          <div className="w-full h-auto flex flex-col items-start justify-start gap-1">
            <Label htmlFor="name">Your name:</Label>
            <Input
              type="text"
              name="name"
              id="name"
              className={`w-full h-10 border ${
                errors.name ? "border-red-500" : "border-black"
              } bg-white`}
              placeholder="Your name"
              value={formState.name}
              onChange={handleInputChange}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>
          <div className="w-full h-auto flex flex-col items-start justify-start gap-1">
            <Label htmlFor="email">Your email address:</Label>
            <Input
              type="email"
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
          <div className="w-full h-auto flex flex-col items-start justify-start gap-1">
            <Label htmlFor="confirmPassword">Retype your password:</Label>
            <Input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              className={`w-full h-10 border ${
                errors.confirmPassword ? "border-red-500" : "border-black"
              } bg-white`}
              placeholder="Retype your password"
              value={formState.confirmPassword}
              onChange={handleInputChange}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center w-full h-auto gap-3">
          <Button className="w-full" onClick={handleSubmit}>
            SignUp
          </Button>
          <div className="w-full h-auto flex items-center justify-center gap-2">
            <p>Already have an account??</p>
            <button onClick={() => navigate("/auth/signin")}>SignIn</button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
