import Link from "next/link";
import { ArrowRight, Zap, WifiOff, Layout } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center selection:bg-primary/30">
      {/* Navbar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-6 px-6 sm:px-12">
        <div className="font-bold text-xl tracking-tight flex items-center gap-2">
          <span className="bg-primary text-white p-1 rounded-md">
            <Zap className="h-5 w-5 fill-white" />
          </span>
          QuickNote
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/login?mode=register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center px-6 sm:px-12 text-center py-20">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-foreground max-w-3xl leading-[1.1]">
          Capture your ideas at the <span className="text-primary">speed of thought</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl">
          A minimalist, lightning-fast note-taking app designed to work flawlessly offline. Never let a brilliant idea slip away again.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link href="/login?mode=register">
            <Button size="lg" className="h-12 px-8 text-base group">
              Start Taking Notes
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-32 grid sm:grid-cols-3 gap-8 w-full max-w-4xl text-left">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg">Instant Load</h3>
            <p className="text-muted-foreground text-sm">Say goodbye to loading spinners. QuickNote opens instantly, ready for you to type.</p>
          </div>
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <WifiOff className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg">Always Available</h3>
            <p className="text-muted-foreground text-sm">Full offline capabilities. Write on a plane, in a tunnel, or anywhere without a connection.</p>
          </div>
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Layout className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg">Clean Interface</h3>
            <p className="text-muted-foreground text-sm">A distraction-free minimalist design helps you focus on what matters: your content.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
