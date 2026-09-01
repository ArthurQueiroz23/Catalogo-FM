'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, LogIn } from 'lucide-react';
import Link from 'next/link';
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
    <div className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo tamanho="lg" comAssinatura href={null} />
          <p className="olho mt-5">Painel do catálogo</p>
        </div>

        <div className="superficie-solida p-6 sm:p-8">
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

            <Button type="submit" size="lg" loading={login.isPending} className="mt-1 w-full">
              <LogIn className="h-5 w-5" aria-hidden="true" />
              Entrar
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-pilula px-3 text-[0.9375rem]
              font-bold text-ink-500 transition-colors hover:text-coral-800 foco-marca"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar para o catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
