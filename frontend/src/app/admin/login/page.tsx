'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLogin } from '@/hooks/useAuth';
import { estaAutenticado } from '@/lib/auth';
import { loginSchema, type LoginFormValues } from '@/lib/schemas';

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
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center text-center">
          <Logo tamanho="lg" comAssinatura href={null} />
          <p className="mt-4 text-[0.9375rem] text-ink-500">Painel do catálogo</p>
        </div>

        <div className="superficie-solida p-7">
          <form onSubmit={handleSubmit((valores) => login.mutate(valores))} className="flex flex-col gap-5">
            <Input
              label="E-mail"
              type="email"
              autoComplete="username"
              autoFocus
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

            <Button type="submit" loading={login.isPending} className="mt-1 w-full">
              <LogIn className="h-5 w-5" />
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
