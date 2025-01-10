"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { doc, collection, getDoc, getDocs, setDoc } from "firebase/firestore";

export default function Edit() {
  let originalUsername = useRef("");
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [gender, setGender] = useState("");
  const [website, setWebsite] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, "userData", user.uid));
        if (docSnap.exists()) {
          // if editing profile, pre-load old values
          const data = docSnap.data();
          console.log(data);
          setUsername(data.username);
          originalUsername.current = data.username;
          originalUsername;
          setDescription(data.description);
          setGender(data.gender);
          setWebsite(data.website);
        } else {
          // if making new profile, dont pre-load any values
          return;
        }
      } else {
        router.push("/login");
      }
    });
  }, []);

  const validation = (): boolean => {
    let flag = true;
    let desc = "";
    if (!username.trim() || username.length < 3 || username.length > 10) {
      desc = "Username should be between 3-10 characters long";
      flag = false;
    }
    if (username.indexOf(" ") != -1) {
      desc = "Username cannot have spaces";
      flag = false;
    }
    if (
      !description.trim() ||
      description.length < 3 ||
      description.length > 50
    ) {
      desc = "Description should be between 3-50 characters long";
      flag = false;
    }
    if (["Male", "Female", "Others"].indexOf(gender) === -1) {
      desc = "There was a problem selecting the gender, try again";
      flag = false;
    }
    if (!flag) {
      toast({
        title: "Invalid input",
        description: desc,
        className: "text-destructive",
      });
      return false;
    }
    return true;
  };

  const IsUniqueUsername = async (): Promise<boolean> => {
    const querySnapshot = await getDocs(collection(db, "userData"));
    let flag = true;
    querySnapshot.forEach((document) => {
      if (originalUsername.current === document.data().username) {
        return;
      }
      if (username === document.data().username) {
        toast({
          title: "Invalid username",
          description: "Sorry! A username with this name already exists!",
          className: "text-destructive",
        });
        flag = false;
      }
    });
    return flag;
  };

  const handleSubmit = async () => {
    const check = validation();
    if (!check) return;
    const check2 = await IsUniqueUsername();
    if (!check2) return;

    const user = auth.currentUser;
    if (!user) return;
    await setDoc(doc(db, "userData", user.uid), {
      username: username,
      description: description,
      imageURL: imageURL,
      gender: gender,
      website: website,
      followers: 0,
      following: 0,
    });
    toast({
      title: "Success",
      description: "Successfully updated profile info",
      className: "text-primary",
    });
    router.push("/");
  };

  return (
    <div className="flex flex-row justify-center items-center gap-x-32  min-h-screen">
      <div className="flex flex-col gap-y-3">
        <span className="text-3xl font-bold mb-8">Edit Profile Info</span>
        <span>Enter username:</span>
        <input
          type="text"
          value={username}
          placeholder="Enter username..."
          maxLength={10}
          className="bg-background border-2 outline-none focus:outline-primary p-2 rounded-md"
          onChange={(e) => setUsername(e.target.value)}
        />
        <span className="text-muted-foreground mb-8">
          3-10 characters without spaces
        </span>
        <span>Write a description:</span>
        <textarea
          rows={4}
          value={description}
          placeholder="Enter description..."
          maxLength={50}
          className="bg-background border-2 outline-none focus:outline-primary p-2 rounded-md"
          onChange={(e) => setDescription(e.target.value)}
        />
        <span className="text-muted-foreground ">3-50 characters</span>
      </div>
      <div className="flex flex-col gap-y-3">
        <span>Enter a Profile Picture Link</span>
        <input
          type="text"
          placeholder="Enter image url..."
          className="bg-background w-96 border-2 outline-none focus:outline-primary p-2 rounded-md mb-8"
          onChange={(e) => setImageURL(e.target.value)}
        />
        <span>Gender</span>
        <Select onValueChange={(e) => setGender(e)}>
          <SelectTrigger className="w-[180px] mb-8">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Others">Others</SelectItem>
          </SelectContent>
        </Select>
        <span>Personal Website link</span>
        <input
          type="text"
          value={website}
          placeholder="Enter website link..."
          className="bg-background border-2 outline-none focus:outline-primary p-2 rounded-md"
          onChange={(e) => setWebsite(e.target.value)}
        />
        <button
          className="bg-primary p-2 rounded-md"
          onClick={() => handleSubmit()}
        >
          Continue to Profile
        </button>
      </div>
    </div>
  );
}
