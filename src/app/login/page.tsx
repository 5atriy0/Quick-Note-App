"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Hexagon, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

type AuthView = "login" | "register" | "forgot-password";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<AuthView>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Read initial mode from query param
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "register") setView("register");
    else if (mode === "forgot") setView("forgot-password");
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (view === "forgot-password") {
      // Mock password reset
      setTimeout(() => {
        setIsLoading(false);
        setResetSent(true);
      }, 1000);
      return;
    }

    // Mock login/register
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 1000);
  };

  const getTitle = () => {
    if (view === "forgot-password") return "Reset your password";
    return view === "login" ? "Welcome back" : "Create an account";
  };

  const getSubtitle = () => {
    if (view === "forgot-password") return "Enter your email and we'll send you a reset link";
    return view === "login" ? "Enter your credentials to access your notes" : "Sign up to start capturing your ideas instantly";
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
        
        <Card className="p-8 shadow-xl border-border/50">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <Hexagon className="h-8 w-8 text-primary fill-primary/20" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{getTitle()}</h1>
            <p className="text-sm text-muted-foreground mt-2">{getSubtitle()}</p>
          </div>

          <AnimatePresence mode="wait">
            {view === "forgot-password" && resetSent ? (
              <motion.div
                key="reset-sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 py-4"
              >
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  If an account exists with that email, you&apos;ll receive a password reset link shortly.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => { setView("login"); setResetSent(false); }}
                >
                  Back to Sign In
                </Button>
              </motion.div>
            ) : (
              <motion.form 
                key={view}
                initial={{ opacity: 0, x: view === "login" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: view === "login" ? 20 : -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit} 
                className="space-y-4"
              >
                {view === "register" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Full Name
                    </label>
                    <Input placeholder="John Doe" required />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Email
                  </label>
                  <Input type="email" placeholder="m@example.com" required />
                </div>

                {view !== "forgot-password" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium leading-none">
                        Password
                      </label>
                      {view === "login" && (
                        <button 
                          type="button"
                          onClick={() => setView("forgot-password")}
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <Input type="password" required />
                  </div>
                )}

                {view === "register" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Confirm Password
                    </label>
                    <Input type="password" required />
                  </div>
                )}
                
                <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                  {isLoading ? "Please wait..." : (
                    view === "login" ? "Sign In" :
                    view === "register" ? "Sign Up" :
                    "Send Reset Link"
                  )}
                </Button>

                {view !== "forgot-password" && (
                  <>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setIsLoading(true);
                        setTimeout(() => {
                          setIsLoading(false);
                          router.push("/dashboard");
                        }, 1000);
                      }}
                      disabled={isLoading}
                    >
                      <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                      </svg>
                      Google
                    </Button>
                  </>
                )}
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center text-sm">
            {view === "forgot-password" && !resetSent ? (
              <button 
                onClick={() => setView("login")}
                className="font-medium text-primary hover:underline"
              >
                Back to Sign In
              </button>
            ) : view !== "forgot-password" && (
              <>
                <span className="text-muted-foreground">
                  {view === "login" ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button 
                  onClick={() => setView(view === "login" ? "register" : "login")}
                  className="font-medium text-primary hover:underline"
                >
                  {view === "login" ? "Sign up" : "Log in"}
                </button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/30 flex items-center justify-center"><p>Loading...</p></div>}>
      <AuthForm />
    </Suspense>
  );
}
