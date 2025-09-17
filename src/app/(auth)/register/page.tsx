import { ModeToggle } from "@/components/ModeToggle";
import { RegisterForm } from "@/components/RegisterForm";
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await getServerSession();

  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center ">
      <div className="bg-card p-10 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 ">
          Daftar E-Wallet
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Buat akun baru untuk mulai menggunakan e-wallet modern
        </p>
        <RegisterForm />
      </div>
      <div className="mt-10">
        <ModeToggle />
      </div>
    </div>
  );
}
