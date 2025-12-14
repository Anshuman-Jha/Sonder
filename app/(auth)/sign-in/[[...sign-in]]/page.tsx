import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignIn
      appearance={{
        elements: {
          headerTitle: "Sonder",
          headerSubtitle: "Welcome back to Sonder",
        },
      }}
    />
  );
}
