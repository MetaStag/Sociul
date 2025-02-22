"use client";

import { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc, DocumentData } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import DisplayPost from "@/components/displayPost";
import { useToast } from "@/hooks/use-toast";
import { onAuthStateChanged } from "firebase/auth";

export default function Post({ params }: { params: Promise<{ id: string }> }) {
  let postid = useRef("");
  let uid = useRef("");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DocumentData>({});
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) uid.current = user.uid;
    });
    getData();
  }, []);

  const getData = async () => {
    let id = (await params).id;
    postid.current = id;
    let docSnap = await getDoc(doc(db, "posts", id));
    if (docSnap.exists()) {
      let data = docSnap.data();
      data.id = id;
      data.comments.map((comment: any) => {
        comment.author = getUsername(comment.author);
      });
      setData(data);
      setIsLoading(false);
    }
  };

  const getUsername = async (uid: string) => {
    const docSnap = await getDoc(doc(db, "userData", uid));
    if (docSnap.exists()) {
      return docSnap.data().username;
    } else {
      return "Anonymous";
    }
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast({
        title: "Invalid commment",
        description: "Comment cannot be empty",
        className: "text-destructive",
      });
      return;
    }
    let comments = [];
    const docSnap = await getDoc(doc(db, "posts", postid.current));
    if (docSnap.exists()) {
      const data = docSnap.data();
      comments = data.comments;
    }
    comments.push({ author: uid.current, body: comment });
    await setDoc(
      doc(db, "posts", postid.current),
      {
        comments: comments,
      },
      {
        merge: true,
      }
    );
    toast({
      title: "Success",
      description: "Successfully commented",
      className: "text-primary",
    });
    setComment("");
    getData();
  };

  return (
    <div className="flex flex-col max-w-xl ml-auto mr-auto">
      <DisplayPost post={data} />
      <span className="text-xl font-bold my-4">Comments</span>
      <input
        type="text"
        placeholder="Leave a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="bg-background border-2 outline-none focus:outline-primary p-2 rounded-md mb-4"
      />
      <button
        className="bg-primary w-44 p-2 rounded-md hover:bg-secondary"
        onClick={() => handleSubmit()}
      >
        Submit
      </button>
      {isLoading ||
        data.comments.map((comment: any) => (
          <div
            key={data.comments.indexOf(comment)}
            className="flex flex-col bg-muted p-3 rounded-xl my-4 gap-y-3"
          >
            <span className="text-primary">{comment.author} says</span>
            <span>{comment.body}</span>
          </div>
        ))}
    </div>
  );
}
