/** Nível de acesso do login. ADMIN gerencia usuários, vendedores e tipos de meta. */
export type Role = 'ADMIN' | 'USUARIO'

/** Status guardado no agendamento. */
export type Status = 'agendado' | 'retirado' | 'devolvido'

/** Status mostrado na tela — inclui "atrasado", que é calculado a partir da data. */
export type StatusExibido = Status | 'atrasado'

export interface Material {
  id: string
  nome: string
  codigo: string
  /** Quantidade total que existe no almoxarifado. */
  estoque: number
  obs: string
}

export interface Agendamento {
  id: string
  materialId: string
  qtd: number
  responsavel: string
  /** Cliente para quem o material vai. Vazio em retiradas de uso interno. */
  cliente: string
  /** Data no formato ISO (AAAA-MM-DD). */
  retirada: string
  /** Data no formato ISO (AAAA-MM-DD). */
  devolucao: string
  status: Status
  obs: string
}

export interface Vendedor {
  id: string
  nome: string
  codigo: string
}

export interface TipoMeta {
  id: string
  nome: string
  /** Como a meta é medida, ex.: "R$", "unidades", "%". */
  unidade: string
}

export interface Dados {
  materiais: Material[]
  agendamentos: Agendamento[]
}

export interface Resumo {
  retiradasHoje: number
  devolucoesHoje: number
  emPosse: number
  atrasados: number
}

/** Filtro da lista de agendamentos. */
export type Filtro = 'todos' | StatusExibido
