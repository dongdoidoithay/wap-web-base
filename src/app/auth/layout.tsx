import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Sign in to your account or create a new one",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
