import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import likeIcon from "@/public/like.svg";
import commentIcon from "@/public/comment.svg";
import shareIcon from "@/public/share.svg";
import reshareIcon from "@/public/reshare.svg";

export default function Post(props: any) {
  const router = useRouter();
  const { toast } = useToast();

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

  return (
    <div className="flex flex-col bg-card mt-4 p-4 rounded-xl hover:bg-muted">
      <span className="text-2xl text-primary font-bold">
        {props.post.title}
      </span>
      <span
        className="text-muted-foreground underline cursor-pointer"
        onClick={() => router.push(`/profile/${props.post.author}`)}
      >
        by {props.post.author}
      </span>
      <span className="text-muted-foreground">
        on {new Date(props.post.date).toDateString()}
      </span>
      <span>{props.post.description}</span>
      <div className="flex flex-row mt-4 gap-x-2">
        <Image src={likeIcon} height={30} width={30} alt="Like icon" />
        <Image src={commentIcon} height={23} width={23} alt="Comment icon" />
        <Image
          src={shareIcon}
          height={30}
          width={30}
          alt="Share icon"
          onClick={() => share()}
          className="cursor-pointer"
        />
        <Image src={reshareIcon} height={35} width={35} alt="Reshare icon" />
      </div>
    </div>
  );
}
