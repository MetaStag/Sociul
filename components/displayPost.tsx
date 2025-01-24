import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  doc,
  collection,
  getDoc,
  setDoc,
  getCountFromServer,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import commentIcon from "@/public/comment.svg";
import shareIcon from "@/public/share.svg";
import reshareIcon from "@/public/reshare.svg";

export default function DisplayPost(props: any) {
  let uid = useRef("");
  const [author, setAuthor] = useState("Anonymous");
  const [isLiked, setIsLiked] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) uid.current = user.uid;
    });
    const check = async () => {
      let docSnap = await getDoc(doc(db, "userData", props.post.author));
      if (docSnap.exists()) setAuthor(docSnap.data().username);
      docSnap = await getDoc(doc(db, "posts", props.post.id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        for (let i = 0; i < data.likes.length; i++) {
          if (uid.current === data.likes[i]) {
            setIsLiked(true);
          }
        }
      }
    };
    if (props.post.id) check();
  }, [props.post]);

  const like = async () => {
    let likes = [];
    const docSnap = await getDoc(doc(db, "posts", props.post.id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      likes = data.likes;
    }
    likes.push(uid.current);
    await setDoc(
      doc(db, "posts", props.post.id),
      {
        likes: likes,
      },
      {
        merge: true,
      }
    );
    setIsLiked(true);
  };

  const unlike = async () => {
    let likes = [];
    const docSnap = await getDoc(doc(db, "posts", props.post.id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      likes = data.likes;
    }
    likes.splice(likes.indexOf(uid.current), 1);
    await setDoc(
      doc(db, "posts", props.post.id),
      {
        likes: likes,
      },
      {
        merge: true,
      }
    );
    setIsLiked(false);
  };

  const share = () => {
    navigator.clipboard.writeText(
      `https://localhost:3000/profile/${props.post.author}`
    );
    toast({
      title: "Clipboard",
      description: "Link copied to clipboard",
      className: "text-primary",
    });
  };

  const reshare = async () => {
    let newPost = props.post;
    newPost.author = uid.current;
    newPost.date = Date.now();
    let docSnap = await getCountFromServer(collection(db, "posts"));
    const count = docSnap.data().count;
    await setDoc(doc(db, "posts", `${count + 1}`), props.post);
    toast({
      title: "Success",
      description: "Successfully reshared",
      className: "text-primary",
    });
    router.push(`/profile/${props.post.author}`);
  };

  return (
    <div
      className="flex flex-col bg-card mt-4 p-4 rounded-xl hover:bg-muted cursor-pointer"
      onClick={() => router.push(`/posts/${props.post.id}`)}
    >
      <span className="text-2xl text-primary font-bold">
        {props.post.title}
      </span>
      <span
        className="text-muted-foreground underline cursor-pointer"
        onClick={(e) => {e.stopPropagation();router.push(`/profile/${author}`)}}
      >
        by {author}
      </span>
      <span className="text-muted-foreground">
        on {new Date(props.post.date).toDateString()}
      </span>
      <span>{props.post.description}</span>
      <div className="flex flex-row mt-4 gap-x-2">
        <svg
          width="30px"
          height="30px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={isLiked ? "invert fill-green-500" : "invert"}
          onClick={(e) => {
            e.stopPropagation();
            isLiked ? unlike() : like();
          }}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <Image
          src={commentIcon}
          height={23}
          width={23}
          alt="Comment icon"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/posts/${props.post.id}`);
          }}
          className="cursor-pointer"
        />
        <Image
          src={shareIcon}
          height={30}
          width={30}
          alt="Share icon"
          onClick={(e) => {
            e.stopPropagation();
            share();
          }}
          className="cursor-pointer"
        />
        <Image
          src={reshareIcon}
          height={35}
          width={35}
          alt="Reshare icon"
          onClick={(e) => {
            e.stopPropagation();
            reshare();
          }}
          className="cursor-pointer"
        />
      </div>
    </div>
  );
}
