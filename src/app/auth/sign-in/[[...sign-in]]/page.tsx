import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
        <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
      </div>
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none",
          },
        }}
        redirectUrl="/dashboard"
      />
    </div>
  );
}
