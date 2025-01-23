"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { collection, DocumentData, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Search() {
  const [username, setUsername] = useState("");
  const [profiles, setProfiles] = useState<DocumentData[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  // target is string upon which query is being matched
  const searchString = (target: string, query: string): boolean => {
    let score = 0;
    for (let i = 0; i < query.length; i++) {
      if (target[i] === query[i]) score++;
    }
    // if at least half characters match, return true
    return score > target.length / 2 ? true : false;
  };

  const handleSubmit = async () => {
    if (!username.trim()) {
      toast({
        title: "Invalid username",
        description: "Username cannot be empty!",
        className: "text-destructive",
      });
      return;
    }
    let temp: DocumentData[] = [];
    const querySnapshot = await getDocs(collection(db, "userData"));
    querySnapshot.forEach((doc) => {
      if (searchString(doc.data().username, username)) {
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
      setProfiles(temp);
    }
  };

  return (
    <div className="flex flex-col max-w-xl ml-auto mr-auto mt-16">
      <span className="text-4xl font-bold mb-8">Search Users</span>
      <input
        type="text"
        placeholder="Enter username..."
        onChange={(e) => setUsername(e.target.value)}
        className="bg-card border-2 outline-none focus:outline-primary p-2 rounded-md mb-4"
      />
      <button
        className="bg-primary p-2 mb-6 rounded-md hover:bg-secondary w-44"
        onClick={() => handleSubmit()}
      >
        Submit
      </button>
      {profiles.map((profile) => (
        <div
          key={profile.username}
          className="flex flex-row bg-card mt-2 p-8 rounded-xl gap-x-6 hover:bg-muted items-center"
          onClick={() => router.push(`/profile/${profile.username}`)}
        >
          <Image
            src={profile.imageURL}
            width={100}
            height={100}
            alt="Profile picture"
            style={{
              objectFit: "cover",
              height: "100px",
              width: "100px",
              borderRadius: "9999px",
            }}
          />
          <div className="flex flex-col gap-y-4">
            <span className="text-xl">{profile.username}</span>
            <span className="text-muted-foreground">{profile.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
