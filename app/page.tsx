import { Suspense } from "react";
import { Footer } from "@/components/ui/footer";
import { HomeContent } from "@/components/home/home-content";
import { Navbar } from "@/components/layout/Navbar";

function HomeLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Suspense fallback={<HomeLoading />}>
        <HomeContent />
      </Suspense>
      <Footer />
    </div>
  );
}