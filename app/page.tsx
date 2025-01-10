"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import CreatePost from "./createPost";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [gender, setGender] = useState("");
  const [website, setWebsite] = useState("");
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, "userData", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.username);
          setDescription(data.description);
          setImageURL(data.imageURL);
          setGender(data.gender);
          setWebsite(data.website);
          setFollowers(data.followers);
          setFollowing(data.following);
          setLoading(false);
        } else {
          toast({
            title: "Error processing data",
            description:
              "It seems like you haven't set your user details, set them first",
            className: "text-destructive",
          });
          router.push("/edit");
        }
      } else {
        router.push("/login");
      }
    });
  }, []);

  return (
    <div className="flex flex-col justify-center ml-auto mr-auto max-w-xl">
      <Image
        src="/banner.png"
        width={700}
        height={100}
        alt="Banner Image"
        style={{ objectFit: "cover", height: "200px", width: "700px" }}
      />
      {loading ? (
        <span className="bg-card p-4 rounded-md mb-12">Loading...</span>
      ) : (
        <div className="flex flex-col bg-card p-4 rounded-md mb-12 relative top-[-10px] overflow-visible">
          <Image
            src={imageURL}
            width={110}
            height={110}
            alt="Profile Pic"
            style={{
              objectFit: "cover",
              height: "110px",
              width: "110px",
              borderRadius: "9999px",
              position: "absolute",
              top: "-50px",
            }}
          />
          <span className="text-xl text-primary font-bold mt-12">
            {username}
          </span>
          <span className="text-muted-foreground mb-4">
            {gender}
            <br />
            {followers} Followers | {following} Following
          </span>
          <span className="bg-muted p-2 rounded-md mb-3">{description}</span>
          <span>Website: {website}</span>
        </div>
      )}
      <CreatePost />
    </div>
  );
}
