/** Nível de acesso do login. ADMIN gerencia usuários, fornecedores, representantes e metas. */
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

export interface Fornecedor {
  id: string
  nome: string
}

export interface Representante {
  id: string
  nome: string
  /** Um representante pode trabalhar para mais de um fornecedor. */
  fornecedores: Fornecedor[]
  email: string
  celular: string
}

/** Como uma meta é medida. */
export type UnidadeMeta = 'KG' | 'UNIDADE' | 'REAL'

export interface Meta {
  id: string
  nome: string
  /** Uma meta pertence a um único fornecedor. */
  fornecedor: Fornecedor
  unidade: UnidadeMeta
}

/** O valor de uma meta atribuído a um representante específico: quanto ele precisa bater e quanto já bateu. */
export interface MetaRepresentante {
  id: string
  representante: Representante
  meta: Meta
  valorMeta: number
  valorRealizado: number
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
