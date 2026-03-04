import { SignIn } from "@clerk/clerk-react";

export default function Signin() {
  return (
    <div className="h-screen flex items-center justify-center">
      <SignIn afterSignInUrl="/rider/dashboard" />
    </div>
  );
}