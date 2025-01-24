"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  collection,
  DocumentData,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [profiles, setProfiles] = useState<DocumentData[]>([]);
  const [visible, setVisible] = useState(false);
  const searchBox = useRef(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const handleClick = (e: any) => {
      if (!searchBox.current?.contains(e.target)) {
        setVisible(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => {
      window.removeEventListener("mousedown", handleClick);
    };
  }, [searchBox]);

  // target is string upon which query is being matched
  const searchString = (target: string, query: string): boolean => {
    let score = 0;
    for (let i = 0; i < query.length; i++) {
      if (target[i] === query[i]) score++;
    }
    // if at least half characters match, return true
    return score > target.length / 2 ? true : false;
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      return;
    }
    let temp: DocumentData[] = [];
    const querySnapshot = await getDocs(collection(db, "userData"));
    querySnapshot.forEach((doc) => {
      if (searchString(doc.data().username, searchTerm)) {
        temp.push(doc.data());
      }
    });
    if (temp.length === 0) {
      toast({
        title: "No match found",
        description: "Try a different username",
        className: "text-destructive",
      });
    } else {
      setVisible(true);
      setProfiles(temp);
    }
  };

  const goToProfile = async () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, "userData", user.uid));
        if (docSnap.exists()) {
          router.push(`/profile/${docSnap.data().username}`);
        }
      } else {
        toast({
          title: "Error",
          description: "Log in first",
          className: "text-destructive",
        });
      }
    });
  };

  const signOutUser = async () => {
    signOut(auth)
      .then(() => {
        toast({
          title: "Success",
          description: "Succesfully logged out user",
          className: "text-primary",
        });
        router.push("/login");
      })
      .catch((err) => {
        console.log(err);
        toast({
          title: "Error",
          description:
            "There was some problem when trying to sign out. Try again later",
          className: "text-destructive",
        });
      });
  };

  return (
    <div className="flex flex-row justify-between p-2">
      <span
        className="text-lg text-primary hover:bg-muted p-2 rounded-md cursor-pointer"
        onClick={() => router.push("/")}
      >
        Sociul
      </span>
      <div className="w-2/5 ml-32" ref={searchBox}>
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.code === "Enter") handleSearch();
          }}
          className="bg-background border-2 outline-none px-2 rounded-md w-full h-full relative"
        />
        <div
          className={
            visible
              ? "flex flex-col bg-card p-2 rounded-md w-2/5 absolute top-14 z-10"
              : "hidden"
          }
        >
          {profiles.map((profile) => (
            <div
              key={profile.username}
              className="flex flex-row bg-card mt-2 p-4 rounded-xl gap-x-6 hover:bg-muted items-center cursor-pointer"
              onClick={() => router.push(`/profile/${profile.username}`)}
            >
              <Image
                src={profile.imageURL}
                width={100}
                height={100}
                alt="Profile picture"
                style={{
                  objectFit: "cover",
                  height: "50px",
                  width: "50px",
                  borderRadius: "9999px",
                }}
              />
              <div className="flex flex-col">
                <span>{profile.username}</span>
                <span className="text-muted-foreground">
                  {profile.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-row gap-x-2">
        <button
          className="bg-primary p-2 rounded-md hover:bg-secondary"
          onClick={() => goToProfile()}
        >
          Profile
        </button>
        <button
          className="bg-card p-2 rounded-md hover:bg-secondary"
          onClick={() => router.push("/edit")}
        >
          Edit
        </button>
        <button
          className="bg-muted p-2 rounded-md hover:bg-secondary"
          onClick={() => signOutUser()}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
