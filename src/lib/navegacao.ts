/** Subabas da área de Materiais — aparecem no menu lateral e, no celular, como abas no topo da página. */
export type SubabaMateriais = 'agendamentos' | 'cadastro'

export const SUBABAS_MATERIAIS: { valor: SubabaMateriais; rotulo: string }[] = [
  { valor: 'agendamentos', rotulo: 'Agendamentos' },
  { valor: 'cadastro', rotulo: 'Cadastro' },
]
