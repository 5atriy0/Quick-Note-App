"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { User, Moon, Sun, Monitor, HardDrive, LogOut, X, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";

type ModalType = "email" | "password" | "clear_cache" | "logout" | null;

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [email, setEmail] = useState("user@example.com");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Prevent hydration mismatch: useTheme returns undefined on server
  useEffect(() => setMounted(true), []);

  const handleSaveMock = (callback: () => void) => {
    setIsSaving(true);
    setSaveSuccess(false);
    setTimeout(() => {
      callback();
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setModal(null);
      }, 1500);
    }, 800);
  };

  const handleLogout = () => {
    // Clear mock session data
    localStorage.removeItem("quicknotes-mock");
    router.push("/login");
  };

  const handleClearCache = () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setTimeout(() => {
      // Mock clearing cache
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setModal(null);
      }, 1500);
    }, 800);
  };

  return (
    <div className="flex h-full w-full flex-col bg-background/50 overflow-y-auto relative">
      <div className="max-w-3xl w-full mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and application preferences.</p>
        </div>

        <div className="grid gap-6">
          {/* Account Profile */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-primary" />
              Account Profile
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <div className="font-medium">Email Address</div>
                  <div className="text-sm text-muted-foreground">{email}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setModal("email")}>Edit</Button>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">Password</div>
                  <div className="text-sm text-muted-foreground">Last changed 3 months ago</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setModal("password")}>Update</Button>
              </div>
            </div>
          </Card>

          {/* Appearance */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Sun className="h-5 w-5 text-primary" />
              Appearance
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <Button 
                variant={mounted && theme === 'light' ? 'default' : 'outline'} 
                className="justify-start gap-2 h-auto py-4 flex-col"
                onClick={() => setTheme('light')}
              >
                <Sun className="h-5 w-5 mb-2" />
                Light
              </Button>
              <Button 
                variant={mounted && theme === 'dark' ? 'default' : 'outline'} 
                className="justify-start gap-2 h-auto py-4 flex-col"
                onClick={() => setTheme('dark')}
              >
                <Moon className="h-5 w-5 mb-2" />
                Dark
              </Button>
              <Button 
                variant={mounted && theme === 'system' ? 'default' : 'outline'} 
                className="justify-start gap-2 h-auto py-4 flex-col"
                onClick={() => setTheme('system')}
              >
                <Monitor className="h-5 w-5 mb-2" />
                System
              </Button>
            </div>
          </Card>

          {/* Storage & Sync */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <HardDrive className="h-5 w-5 text-primary" />
              Storage & Sync
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Local Storage Usage</span>
                <span className="text-muted-foreground">1.2 MB / 50 MB</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 mb-6">
                <div className="bg-primary h-2 rounded-full" style={{ width: '2%' }}></div>
              </div>
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setModal("clear_cache")}>Clear Local Cache</Button>
            </div>
          </Card>

          {/* Logout */}
          <div className="pt-4 pb-8">
            <Button variant="danger" className="gap-2" onClick={() => setModal("logout")}>
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border rounded-lg shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {modal === "email" ? "Change Email Address" : 
                   modal === "password" ? "Update Password" :
                   modal === "clear_cache" ? "Clear Local Cache" :
                   "Log Out"}
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setModal(null)} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {saveSuccess ? (
                <div className="flex flex-col items-center py-8 gap-3">
                  <Check className="h-12 w-12 text-green-500" />
                  <p className="text-sm font-medium">
                    {modal === "email" ? "Email updated successfully!" : 
                     modal === "password" ? "Password updated successfully!" :
                     "Cache cleared successfully!"}
                  </p>
                </div>
              ) : modal === "email" ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newEmail = formData.get("newEmail") as string;
                  handleSaveMock(() => setEmail(newEmail));
                }} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Email</label>
                    <Input value={email} disabled />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Email</label>
                    <Input name="newEmail" type="email" placeholder="new@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Password</label>
                    <Input type="password" placeholder="Verify your password" required />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setModal(null)}>Cancel</Button>
                    <Button type="submit" className="flex-1" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              ) : modal === "password" ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newPass = formData.get("newPassword") as string;
                  const confirmPass = formData.get("confirmPassword") as string;
                  if (newPass !== confirmPass) {
                    alert("New password and confirmation do not match.");
                    return;
                  }
                  handleSaveMock(() => {});
                }} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Password</label>
                    <Input type="password" placeholder="Enter current password" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Password</label>
                    <Input name="newPassword" type="password" placeholder="Enter new password" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm New Password</label>
                    <Input name="confirmPassword" type="password" placeholder="Confirm new password" required />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setModal(null)}>Cancel</Button>
                    <Button type="submit" className="flex-1" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Update Password"}
                    </Button>
                  </div>
                </form>
              ) : modal === "clear_cache" ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to clear your local cache? This will free up storage but might cause the app to reload initial data slower the next time.
                  </p>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setModal(null)}>Cancel</Button>
                    <Button type="button" variant="danger" className="flex-1" onClick={handleClearCache} disabled={isSaving}>
                      {isSaving ? "Clearing..." : "Clear Cache"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to log out? You will need to sign in again to access your notes.
                  </p>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setModal(null)}>Cancel</Button>
                    <Button type="button" variant="danger" className="flex-1" onClick={handleLogout}>
                      Log Out
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}