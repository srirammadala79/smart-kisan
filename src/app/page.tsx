"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sprout } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Jump straight to the dashboard to allow "view-only" interaction
    router.push("/dashboard");
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-background to-primary/5">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-primary/20 p-4 rounded-full">
            <Sprout className="w-16 h-16 text-primary animate-pulse" />
          </div>
          <h1 className="text-6xl font-extrabold tracking-in text-primary">AgriSmart</h1>
          <p className="text-xl text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    </main>
  );
}

