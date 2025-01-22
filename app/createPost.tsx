import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {};

  return (
    <Dialog>
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
            onChange={(e) => setTitle(e.target.value)}
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
