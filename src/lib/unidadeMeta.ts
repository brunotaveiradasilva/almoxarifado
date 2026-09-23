import type { UnidadeMeta } from '../types'

/** Rótulo de cada unidade fixa de meta, pra mostrar na tela. */
export const ROTULO_UNIDADE_META: Record<UnidadeMeta, string> = {
  KG: 'kg',
  UNIDADE: 'unidade',
  REAL: 'R$',
  CLIENTES: 'clientes',
}

export const UNIDADES_META: UnidadeMeta[] = ['KG', 'UNIDADE', 'REAL', 'CLIENTES']

/** Valor de meta/realizado/falta pra tabela: 1 casa decimal, menos em CLIENTES, que é contagem (sem "468,0"). */
export function formatarValorMeta(n: number, unidade: UnidadeMeta): string {
  const casas = unidade === 'CLIENTES' ? 0 : 1
  return n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
}
