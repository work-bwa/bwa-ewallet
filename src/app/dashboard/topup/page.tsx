import { getServerSession } from "@/lib/get-session";
import { TopUpForm } from "@/components/TopUpForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function TopUpPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

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
            <h1 className="text-2xl font-bold">Top Up Saldo</h1>
          </div>
          <TopUpForm userId={session.user.id} />
        </div>
      </div>
    </div>
  );
}
