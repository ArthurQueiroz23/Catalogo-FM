'use client';

import { Check, MessageSquarePlus, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { LIMITE_OBSERVACAO, useCartStore } from '@/store/cart-store';
import type { CartItem } from '@/types/cart';

/**
 * Observação da cliente **sobre uma peça específica** da seleção ("quero uma azul e uma
 * branca", "separar o 40", "se possível com manga curta").
 *
 * Três estados no mesmo lugar, sem modal e sem campo aberto por padrão:
 *
 * 1. **sem observação** → um botão discreto "Adicionar observação";
 * 2. **escrevendo** → o campo abre no lugar do botão, já com o foco, e mostra quanto ainda cabe;
 * 3. **com observação** → um bloco coral com o texto e as ações "Editar" e "Remover".
 *
 * O campo fechado por padrão é a decisão central do desenho: uma seleção com dez peças teria dez
 * caixas de texto vazias empilhadas, e a tela deixaria de ser uma lista de peças para virar um
 * formulário. Quem não tem recado nenhum não vê campo nenhum.
 *
 * Guardar e apagar são a mesma ação do store (`definirObservacao` com texto vazio apaga), então
 * não existe caminho em que a observação de uma peça encoste na de outra: tudo é endereçado pelo
 * `produtoId` do item.
 */
export function ItemObservacao({ item }: { item: CartItem }) {
  const definirObservacao = useCartStore((state) => state.definirObservacao);

  const [editando, setEditando] = useState(false);
  const [rascunho, setRascunho] = useState(item.observacao ?? '');
  const campoRef = useRef<HTMLTextAreaElement>(null);

  const idCampo = `observacao-${item.produtoId}`;
  const observacaoSalva = item.observacao?.trim() ?? '';
  const restantes = LIMITE_OBSERVACAO - rascunho.length;

  // Abrir o campo já com o cursor dentro poupa um toque no celular, que é de onde vem a maior
  // parte das clientes. `setSelectionRange` deixa o cursor no fim do texto na edição, em vez de
  // selecionar tudo (um toque errado apagaria a observação inteira).
  useEffect(() => {
    if (!editando) return;
    const campo = campoRef.current;
    if (!campo) return;
    campo.focus();
    campo.setSelectionRange(campo.value.length, campo.value.length);
  }, [editando]);

  function abrirEdicao() {
    setRascunho(observacaoSalva);
    setEditando(true);
  }

  function salvar() {
    definirObservacao(item.produtoId, rascunho);
    setEditando(false);
  }

  function cancelar() {
    setRascunho(observacaoSalva);
    setEditando(false);
  }

  function remover() {
    definirObservacao(item.produtoId, '');
    setRascunho('');
    setEditando(false);
  }

  // 44px de altura, como todo controle do projeto (docs/DESIGN_SYSTEM.md §6) — só o texto é
  // menor, porque são ações secundárias dentro de um bloco que já tem dono.
  const estiloAcao =
    'inline-flex min-h-11 items-center gap-1.5 rounded-pilula px-2.5 text-[0.8125rem] font-bold ' +
    'transition-colors foco-marca';

  // ---- Escrevendo ------------------------------------------------------------------------
  if (editando) {
    return (
      <div className="mt-4 rounded-2xl bg-creme-100 p-3.5 ring-1 ring-inset ring-coral-100">
        <label htmlFor={idCampo} className="text-[0.8125rem] font-bold text-ink-800">
          Observação para esta peça
        </label>

        <textarea
          id={idCampo}
          ref={campoRef}
          value={rascunho}
          onChange={(evento) => setRascunho(evento.target.value)}
          onKeyDown={(evento) => {
            // Esc desiste, Ctrl/⌘+Enter salva — o Enter sozinho continua quebrando linha,
            // porque o campo é de texto livre.
            if (evento.key === 'Escape') {
              evento.preventDefault();
              cancelar();
            }
            if (evento.key === 'Enter' && (evento.ctrlKey || evento.metaKey)) {
              evento.preventDefault();
              salvar();
            }
          }}
          rows={3}
          maxLength={LIMITE_OBSERVACAO}
          aria-describedby={`${idCampo}-contador`}
          placeholder="Ex.: quero uma azul e uma branca."
          className="mt-2 w-full resize-y rounded-2xl border border-coral-100 bg-creme-50 px-3.5 py-2.5
            text-[0.9375rem] leading-relaxed text-ink-800 shadow-suave transition-all duration-200
            placeholder:text-ink-400 hover:border-coral-200 focus:border-coral-300 focus:outline-none
            focus:ring-4 focus:ring-coral-100"
        />

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          <p
            id={`${idCampo}-contador`}
            className={`text-[0.75rem] tabular-nums ${restantes <= 20 ? 'font-bold text-coral-800' : 'text-ink-500'}`}
          >
            {restantes} caracteres restantes
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={cancelar} className="btn-secondary px-4 text-[0.8125rem]">
              Cancelar
            </button>
            <button type="button" onClick={salvar} className="btn-primary px-4 text-[0.8125rem]">
              <Check className="h-4 w-4" aria-hidden="true" />
              Salvar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Já tem observação -----------------------------------------------------------------
  if (observacaoSalva) {
    return (
      <div className="mt-4 rounded-2xl bg-coral-50 p-3.5 ring-1 ring-inset ring-coral-100">
        <p className="text-[0.6875rem] font-extrabold uppercase tracking-[0.12em] text-coral-800">
          Observação
        </p>

        {/* `break-words` + `whitespace-pre-line`: preserva as quebras de linha que a cliente
            digitou e impede que uma palavra longa (um link colado, por exemplo) estoure a
            largura do card no celular. */}
        <p className="mt-1.5 whitespace-pre-line break-words text-[0.9375rem] leading-relaxed text-ink-700">
          {observacaoSalva}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={abrirEdicao}
            className={`${estiloAcao} text-coral-800 hover:bg-coral-100`}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Editar
          </button>
          <button
            type="button"
            onClick={remover}
            className={`${estiloAcao} text-ink-500 hover:bg-coral-100 hover:text-coral-800`}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Remover
          </button>
        </div>
      </div>
    );
  }

  // ---- Sem observação --------------------------------------------------------------------
  return (
    <button
      type="button"
      onClick={abrirEdicao}
      className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-pilula px-3 text-[0.8125rem]
        font-bold text-coral-800 transition-colors hover:bg-coral-50 foco-marca"
    >
      <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
      Adicionar observação
    </button>
  );
}
