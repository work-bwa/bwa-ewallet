import { getServerSession } from "@/lib/get-session";
import { TransferForm } from "@/components/TransferForm";
import { getWalletData } from "@/lib/wallet-data";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function TransferPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const walletData = await getWalletData(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Transfer</h1>
          </div>
          <TransferForm
            currentBalance={walletData.balance}
            userEmail={session.user.email!}
          />
        </div>
      </div>
    </div>
  );
}
