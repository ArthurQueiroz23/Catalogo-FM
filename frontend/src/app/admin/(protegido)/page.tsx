import { redirect } from 'next/navigation';

/**
 * O painel não tem tela inicial própria: a administradora entra aqui para mexer em produtos,
 * então `/admin` leva direto para a listagem de produtos em vez de um dashboard de contagens
 * (decisão de produto — ver docs/ARCHITECTURE.md §7). O endpoint `GET /admin/dashboard` e os
 * componentes correspondentes continuam no código, sem uso, caso a decisão seja revista.
 */
export default function AdminHomePage() {
  redirect('/admin/produtos');
}
