import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  // is user logged in?
  // onAuthStateChanged(auth, (user)=> {
  //   if (user) {
  //     // user is signed in
  //   } else {
  //     // user is signed out
  //   }
  // })
  return <div>Hello</div>;
}
