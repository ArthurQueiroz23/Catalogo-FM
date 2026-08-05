'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLogin } from '@/hooks/useAuth';
import { estaAutenticado } from '@/lib/auth';
import { loginSchema, type LoginFormValues } from '@/lib/schemas';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (estaAutenticado()) {
      router.replace('/admin');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-xl font-bold text-brand-600">Fruto da Malha</p>
          <p className="mt-1 text-sm text-gray-500">Painel administrativo</p>
        </div>

        <form onSubmit={handleSubmit((valores) => login.mutate(valores))} className="flex flex-col gap-4">
          <Input
            label="E-mail"
            type="email"
            autoComplete="username"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            error={errors.senha?.message}
            {...register('senha')}
          />

          <Button type="submit" loading={login.isPending} className="mt-2 w-full">
            <LogIn className="h-4 w-4" />
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
