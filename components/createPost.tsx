import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import {
  doc,
  setDoc,
  collection,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function CreatePost(props: any) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const validation = (): boolean => {
    if (!title.trim()) {
      toast({
        title: "Invalid title",
        description: "Title cannot be empty",
        className: "text-destructive",
      });
      return false;
    } else if (!description.trim()) {
      toast({
        title: "Invalid description",
        description: "Description cannot be empty",
        className: "text-destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    const check = validation();
    if (!check) return;
    const docSnap = await getCountFromServer(collection(db, "posts"));
    let count = docSnap.data().count;
    const date = Date.now();
    await setDoc(doc(db, "posts", `${count + 1}`), {
      title: title,
      description: description,
      date: date,
      uid: props.uid,
      author: props.author,
      likes: [],
      comments: [{}],
    });
    toast({
      title: "Success",
      description: "Successfully created post!",
      className: "text-primary",
    });
    setOpen(false);
  };

  return (
    <Dialog defaultOpen={open}>
      <DialogTrigger className="bg-primary p-2 rounded-md w-44 hover:bg-secondary">
        Create Post
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col my-6 gap-y-2">
          <span>Enter Post title:</span>
          <input
            type="text"
            placeholder="Enter title..."
            className="bg-background border-2 outline-none focus:outline-primary p-2 rounded-md mb-4"
            onChange={(e) => setTitle(e.target.value)}
          />
          <span>Enter Post description:</span>
          <textarea
            rows={4}
            placeholder="Enter description..."
            className="bg-background border-2 outline-none focus:outline-primary p-2 rounded-md"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button
          className="bg-primary p-2 rounded-md hover:bg-secondary"
          onClick={() => handleSubmit()}
        >
          Submit
        </button>
      </DialogContent>
    </Dialog>
  );
}
