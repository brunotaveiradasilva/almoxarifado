import type { UnidadeMeta } from '../types'

/** Rótulo de cada unidade fixa de meta, pra mostrar na tela. */
export const ROTULO_UNIDADE_META: Record<UnidadeMeta, string> = {
  KG: 'kg',
  UNIDADE: 'unidade',
  REAL: 'R$',
}

export const UNIDADES_META: UnidadeMeta[] = ['KG', 'UNIDADE', 'REAL']
