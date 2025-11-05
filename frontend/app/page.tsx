import Link from "next/link";
import SignIn from "@/components/auth/signin-button";
import { auth } from "@/lib/auth";
import Hero from "@/components/landing/hero";

export default async function Home() {
  const session = await auth();

  return (
    <div className="">
      {/* {!session || !session.user ? (
        <Link href={"/login"} className="text-blue-500 underline">
          Login
        </Link>
      ) : (
        <Link href={"/app"} className="text-blue-500 underline">
          Go to App
        </Link>
      )} */}
      <Hero />
    </div>
  );
}
