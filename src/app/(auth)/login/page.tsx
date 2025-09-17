import { LoginForm } from "@/components/LoginForm";
import { ModeToggle } from "@/components/ModeToggle";
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getServerSession();

  if (session?.user) redirect("/dashboard");

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="bg-card p-10 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 ">Login E-Wallet</h2>
        <p className="text-center text-gray-500 mb-6">
          Masuk untuk mengakses dashboard dan transaksi kamu
        </p>
        <LoginForm />
      </div>
      <div className="mt-10">
        <ModeToggle />
      </div>
    </div>
  );
}
