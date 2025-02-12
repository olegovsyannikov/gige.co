import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Gige.co</h1>
        <p className="text-gray-600 mb-8">Your AI Gig Marketplace</p>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/auth/sign-in">
              Sign In
            </Link>
          </Button>
          <Button asChild>
            <Link href="/auth/sign-up">
              Sign Up
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
