import { Button } from "@/components/ui/button";
import { Plus, Send, History } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Link href="/dashboard/topup">
        <Button
          variant="default"
          className="h-20 w-full flex-col space-y-2 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          <Plus className="h-6 w-6" />
          <span className="text-sm font-medium">Top Up</span>
        </Button>
      </Link>

      <Button
        variant="outline"
        className="h-20 flex-col space-y-2 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
      >
        <Send className="h-6 w-6" />
        <span className="text-sm font-medium">Transfer</span>
      </Button>

      <Button
        variant="outline"
        className="h-20 flex-col space-y-2 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
      >
        <History className="h-6 w-6" />
        <span className="text-sm font-medium">Riwayat</span>
      </Button>
    </div>
  );
}
