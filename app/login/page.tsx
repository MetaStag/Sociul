"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import Image from "next/image";
import { signOut } from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const validation = (): boolean => {
    if (!email.trim()) {
      toast({
        title: "Invalid email",
        description: "Email cannot be empty",
        className: "text-destructive",
      });
      return false;
    }
    if (!password.trim()) {
      toast({
        title: "Invalid password",
        description: "Password cannot be empty",
        className: "text-destructive",
      });
      return false;
    }
    if (password.length < 5) {
      toast({
        title: "Invalid password",
        description: "Password must be 5 characters minimum",
        className: "text-destructive",
      });
      return false;
    }
    return true;
  };

  const signupUser = () => {
    const check = validation();
    if (!check) return; // validation failed
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        toast({
          title: "Success",
          description: "Successfully Signed up!",
          className: "text-primary",
        });
        router.push("/edit");
      })
      .catch((err) => {
        if (err.code === "auth/email-already-in-use") {
          toast({
            title: "Error",
            description:
              "Account with this email already exists, log in or click forgot password",
            className: "text-destructive",
          });
        }
      });
  };

  const loginUser = () => {
    const check = validation();
    if (!check) return; // validation failed;
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        toast({
          title: "Success",
          description: "Successfully logged in!",
          className: "text-primary",
        });
        router.push("/");
      })
      .catch((err) => {
        if (err.code === "auth/invalid-email") {
          toast({
            title: "Error",
            description:
              "Account with this email does not exist, create one in the Sign Up tab",
            className: "text-destructive",
          });
        } else if (err.code === "auth/invalid-credential") {
          toast({
            title: "Error",
            description: "Invalid password! Please check again",
            className: "text-destructive",
          });
        }
      });
  };

  const googleLogin = (firstTime: boolean) => {
    const provider = new GoogleAuthProvider();
    auth.useDeviceLanguage();
    provider.setCustomParameters({
      login_hint: "user@example.com",
    });
    signInWithPopup(auth, provider)
      .then((result) => {
        toast({
          title: "Success",
          description: "Successfully logged in!",
          className: "text-primary",
        });
        if (firstTime) router.push("/edit");
        else router.push("/");
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  // temp
  const logout = () => {
    signOut(auth)
      .then(() => {
        console.log("sign out");
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <span className="text-2xl mb-16">Sociul</span>
      <div className="border-2 px-4 py-8 rounded-md min-w-96">
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Log In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <div className="flex flex-col gap-y-3">
              <span className="text-xl my-2">Log In</span>
              <span>Email:</span>
              <input
                className="bg-background border-2 outline-none focus:outline-primary p-2 rounded-md"
                type="text"
                placeholder="Enter email..."
                onChange={(e) => setEmail(e.target.value)}
              />
              <span>Password:</span>
              <input
                className="bg-background border-2 outline-none focus:outline-primary p-2 rounded-md"
                type="password"
                placeholder="Enter password..."
                onChange={(e) => setPassword(e.target.value)}
              />
              <Image
                src="/google.png"
                className="self-center cursor-pointer"
                alt="Google button"
                width={200}
                height={50}
                onClick={() => googleLogin(false)}
              />
              <button
                className="bg-primary p-2 rounded-md"
                onClick={() => loginUser()}
              >
                Submit
              </button>
            </div>
          </TabsContent>
          <TabsContent value="signup">
            <div className="flex flex-col gap-y-3">
              <span className="text-xl my-2">Sign Up</span>
              <span>Email:</span>
              <input
                className="bg-background border-2 outline-none focus:outline-primary p-2 rounded-md"
                type="text"
                placeholder="Enter email..."
                onChange={(e) => setEmail(e.target.value)}
              />
              <span>Password:</span>
              <input
                className="bg-background border-2 outline-none focus:outline-primary p-2 rounded-md"
                type="password"
                placeholder="Enter password..."
                onChange={(e) => setPassword(e.target.value)}
              />
              <Image
                src="/google.png"
                className="self-center cursor-pointer"
                alt="Google button"
                width={200}
                height={50}
                onClick={() => googleLogin(true)}
              />
              <button
                className="bg-primary p-2 rounded-md"
                onClick={() => signupUser()}
              >
                Submit
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
