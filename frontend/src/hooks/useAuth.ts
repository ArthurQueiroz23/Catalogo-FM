import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as adminApi from '@/lib/admin-api';
import { ApiError } from '@/lib/api';
import { limparSessao, salvarSessao } from '@/lib/auth';
import type { LoginRequest } from '@/types/api';

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (request: LoginRequest) => adminApi.login(request),
    onSuccess: (resposta) => {
      salvarSessao(resposta);
      toast.success(`Bem-vinda, ${resposta.usuario.nome}!`);
      router.push('/admin');
    },
    onError: (erro) => {
      const mensagem = erro instanceof ApiError ? erro.message : 'Não foi possível fazer login.';
      toast.error(mensagem);
    },
  });
}

export function useLogout() {
  const router = useRouter();

  return () => {
    limparSessao();
    router.push('/admin/login');
  };
}
