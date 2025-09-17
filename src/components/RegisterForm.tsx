"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
  name: z.string().min(3, { message: "Nama minimal 3 karakter" }),
  email: z.email({ message: "Email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

type RegisterFormType = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormType>({
    resolver: zodResolver(registerSchema),
  });

  const router = useRouter();

  const onSubmit = async (data: RegisterFormType) => {
    try {
      await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });
      // Create wallet otomatis setelah register berhasil
      const walletResponse = await fetch("/api/wallet/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!walletResponse.ok) {
        console.error("Failed to create wallet");
        // Tidak perlu throw error, wallet bisa dibuat nanti
      }
      toast.success("Registrasi berhasil!");
      router.push("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Registrasi gagal");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input placeholder="Nama Lengkap" {...register("name")} />
        {errors.name && <p className="text-red-600">{errors.name.message}</p>}
      </div>
      <div>
        <Input type="email" placeholder="Email" {...register("email")} />
        {errors.email && <p className="text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <Input
          type="password"
          placeholder="Password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-red-600">{errors.password.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full mt-4">
        Daftar
      </Button>

      <Link href="/login" className="flex gap-2 justify-center mt-4">
        Sudah punya akun?{" "}
        <span className="text-blue-600 cursor-pointer hover:underline">
          Login
        </span>
      </Link>
    </form>
  );
}
