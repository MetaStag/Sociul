"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  query,
  limit,
  DocumentData,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import DisplayPost from "@/components/displayPost";
import { useToast } from "@/hooks/use-toast";
import CreatePost from "@/components/createPost";

export default function Profile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  let ownUid = useRef("");
  let profileUid = useRef("");
  let username = useRef("");
  const [followingUser, setFollowingUser] = useState(false);
  const ownAccount = useRef(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [posts, setPosts] = useState<DocumentData[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      username.current = (await params).username;
      let found = false;
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          ownUid.current = user.uid;
        } else {
          return;
        }
      });
      let querySnapshot = await getDocs(collection(db, "userData"));
      querySnapshot.forEach((doc) => {
        if (username.current === doc.data().username) {
          found = true;
          if (doc.id === ownUid.current) {
            ownAccount.current = true;
          }
          const data = doc.data();
          if (data.imageURL === "") {
            data.imageURL =
              "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg";
          }

          profileUid.current = doc.id;
          setFollowerCount(data.followers.length);
          setFollowingCount(data.following.length);
          if (data.followers.includes(ownUid.current)) setFollowingUser(true);
          delete data.username;
          delete data.followers;
          delete data.following;
          setData(data);
          setLoading(false);
        }
      });
      if (found) {
        let tempPosts: DocumentData[] = [];
        let tempPost;
        const q = query(collection(db, "posts"), limit(9));
        querySnapshot = await getDocs(q);
        querySnapshot.forEach((post) => {
          if (post.data().author === profileUid.current) {
            tempPost = post.data();
            tempPost.id = post.id;
            tempPosts.push(tempPost);
          }
        });
        setPosts(tempPosts);
      } else if (!found) {
        toast({
          title: "Invalid username",
          description: "No profile with this username exists",
          className: "text-destructive",
        });
        router.push("/");
      }
    };
    check();
  }, []);

  const followUser = async () => {
    let followers = [];
    let following = [];
    let docSnap = await getDoc(doc(db, "userData", profileUid.current));
    if (docSnap.exists()) {
      const data = docSnap.data();
      followers = data.followers;
    }
    docSnap = await getDoc(doc(db, "userData", ownUid.current));
    if (docSnap.exists()) {
      const data = docSnap.data();
      following = data.following;
    }
    setDoc(
      doc(db, "userData", profileUid.current),
      {
        followers: [...followers, ownUid.current],
      },
      { merge: true }
    );
    setDoc(
      doc(db, "userData", ownUid.current),
      {
        following: [...following, profileUid.current],
      },
      { merge: true }
    );
    setFollowingUser(true);
    setFollowerCount(followerCount + 1);
    toast({
      title: "Success",
      description: "Successfully followed",
      className: "text-primary",
    });
  };

  const unfollowUser = async () => {
    let followers = [];
    let following = [];
    let docSnap = await getDoc(doc(db, "userData", profileUid.current));
    if (docSnap.exists()) {
      const data = docSnap.data();
      followers = data.followers;
    }
    docSnap = await getDoc(doc(db, "userData", ownUid.current));
    if (docSnap.exists()) {
      const data = docSnap.data();
      following = data.following;
    }
    followers = followers.filter((id: any) => id !== ownUid.current);
    following = following.filter((id: any) => id !== profileUid.current);
    setDoc(
      doc(db, "userData", profileUid.current),
      {
        followers: [...followers],
      },
      { merge: true }
    );
    setDoc(
      doc(db, "userData", ownUid.current),
      {
        following: [...following],
      },
      { merge: true }
    );
    setFollowingUser(false);
    setFollowerCount(followerCount - 1);
    toast({
      title: "Success",
      description: "Successfully unfollowed",
      className: "text-primary",
    });
  };

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
        <div>
          <div className="flex flex-col bg-card p-4 rounded-md mb-6 relative top-[-10px] overflow-visible">
            <Image
              src={data.imageURL}
              width={110}
              height={110}
              alt="Profile picture"
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
              {username.current}
            </span>
            <span className="text-muted-foreground mb-4">
              {data.gender}
              <br />
              {followerCount} Followers | {followingCount} Following
            </span>
            <span className="bg-muted p-2 rounded-md mb-3">
              {data.description}
            </span>
            <span>Website: {data.website}</span>
            {ownUid.current !== "" &&
              !ownAccount.current &&
              (followingUser ? (
                <button
                  className="bg-primary p-2 mt-8 rounded-md w-44 hover:bg-secondary"
                  onClick={() => unfollowUser()}
                >
                  Unfollow
                </button>
              ) : (
                <button
                  className="bg-primary p-2 mt-8 rounded-md w-44 hover:bg-secondary"
                  onClick={() => followUser()}
                >
                  Follow
                </button>
              ))}
          </div>
          {!ownAccount.current || (
            <CreatePost uid={ownUid.current} author={username.current} />
          )}
          <div className="mt-12">
            {posts.length > 0 ? (
              posts.map((post) => <DisplayPost key={post.id} post={post} />)
            ) : (
              <span className="flex bg-card p-4 rounded-xl justify-center">
                No Posts yet
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
