import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
        <WifiOff className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">You&apos;re Offline</h1>
      <p className="text-muted-foreground text-center max-w-md">
        It looks like you&apos;ve lost your internet connection. Don&apos;t worry — your cached notes are still available. 
        Reconnect to the internet to sync your latest changes.
      </p>
    </div>
  );
}
