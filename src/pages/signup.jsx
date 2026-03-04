import { SignUp } from "@clerk/clerk-react";

export default function Signup() {
  return (
    <div className="h-screen flex items-center justify-center">
      <SignUp afterSignUpUrl="/rider/dashboard" />
    </div>
  );
}