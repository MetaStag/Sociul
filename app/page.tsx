"use client";

import { useState, useEffect, useRef } from "react";
import {
  collection,
  getDocs,
  query,
  limit,
  DocumentData,
  startAfter,
  getCountFromServer,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import DisplayPost from "@/components/displayPost";

export default function Home() {
  const totalCount = useRef(0);
  const currentCount = useRef(0);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);
  const [posts, setPosts] = useState<DocumentData[]>([]);

  useEffect(() => {
    const getPosts = async () => {
      let temp: DocumentData[] = [];
      let tempPost;
      const docSnap = await getCountFromServer(collection(db, "posts"));
      totalCount.current = docSnap.data().count;
      if (docSnap.data().count < 9) setVisible(false);
      else currentCount.current = 9;
      const q = query(collection(db, "posts"), limit(9));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((post) => {
        tempPost = post.data();
        tempPost.id = post.id;
        temp.push(tempPost);
      });
      setPosts(temp);
      setLoading(false);
    };
    getPosts();
  }, []);

  const load = async () => {
    let temp: DocumentData[] = [];
    let tempPost;
    if (totalCount.current - currentCount.current < 9) setVisible(false);
    const last = posts[posts.length - 1];
    const q = query(
      collection(db, "posts"),
      orderBy("date"),
      startAfter(last),
      limit(9)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((post) => {
      tempPost = post.data();
      tempPost.id = post.id;
      temp.push(tempPost);
    });
    setPosts([...posts, ...temp]);
  };

  return (
    <div className="flex flex-col max-w-xl ml-auto mr-auto mt-16">
      <span className="text-4xl font-bold mb-8">Sociul</span>
      {loading ? (
        <span>Loading...</span>
      ) : (
        <div>
          {posts.map((post) => (
            <DisplayPost key={post.id} post={post} />
          ))}
          {visible && (
            <button
              className="bg-primary p-2 rounded-md hover:bg-secondary my-16 w-full"
              onClick={() => load()}
            >
              Load more posts
            </button>
          )}
        </div>
      )}
    </div>
  );
}
