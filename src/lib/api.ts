import { sessaoSalva } from './auth'
import type { Agendamento, Fornecedor, Material, Meta, MetaRepresentante, Role, Status, UnidadeMeta, Representante } from '../types'

// Em desenvolvimento cai no back-end local (docker compose up na almoxarifado-api);
// em produção vem do VITE_API_URL configurado no build do GitHub Pages.
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

/** Erro de rede ou resposta não-2xx da API, com a mensagem já pronta pra mostrar ao usuário. */
export class ErroApi extends Error {}

// Avisado quando a API devolve 401 (token ausente, inválido ou expirado), pra quem estiver
// cuidando da sessão (useAuth) derrubar o usuário de volta pra tela de login.
let aoExpirar: (() => void) | null = null
export function aoSessaoExpirar(fn: (() => void) | null): void {
  aoExpirar = fn
}

async function requisitar<T>(caminho: string, opcoes?: RequestInit): Promise<T> {
  const sessao = sessaoSalva()

  let resposta: Response
  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(sessao ? { Authorization: `Bearer ${sessao.token}` } : {}),
      },
      ...opcoes,
    })
  } catch {
    throw new ErroApi('Não foi possível falar com o servidor. Verifique sua conexão e tente de novo.')
  }

  // 401 com sessão salva = token expirou/foi revogado: derruba pra tela de login com um aviso
  // genérico. 401 sem sessão (ex.: senha errada no login) segue pro tratamento normal abaixo,
  // que usa a mensagem de erro de verdade que a API mandou.
  if (resposta.status === 401 && sessao) {
    aoExpirar?.()
    throw new ErroApi('Sua sessão expirou. Entre de novo.')
  }

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => null)
    throw new ErroApi(corpo?.erro || `O servidor respondeu com erro (${resposta.status}).`)
  }

  // Corpo vazio (204, ou 201/200 sem corpo, como em criarUsuario/excluirUsuario) não é JSON
  // válido — .json() quebraria nele. Só tenta interpretar como JSON se realmente veio algo.
  const texto = await resposta.text()
  return (texto ? JSON.parse(texto) : undefined) as T
}

export function login(usuario: string, senha: string): Promise<{ token: string; usuario: string; role: Role }> {
  return requisitar('/api/auth/login', { method: 'POST', body: JSON.stringify({ usuario, senha }) })
}

export function listarUsuarios(): Promise<string[]> {
  return requisitar('/api/auth/usuarios')
}

export function criarUsuario(usuario: string, senha: string): Promise<void> {
  return requisitar('/api/auth/usuarios', { method: 'POST', body: JSON.stringify({ usuario, senha }) })
}

export function excluirUsuario(usuario: string): Promise<void> {
  return requisitar(`/api/auth/usuarios/${encodeURIComponent(usuario)}`, { method: 'DELETE' })
}

export function trocarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
  return requisitar('/api/auth/senha', { method: 'PATCH', body: JSON.stringify({ senhaAtual, novaSenha }) })
}

export function listarMateriais(): Promise<Material[]> {
  return requisitar('/api/materiais')
}

export function criarMaterial(material: Omit<Material, 'id'>): Promise<Material> {
  return requisitar('/api/materiais', { method: 'POST', body: JSON.stringify(material) })
}

export function atualizarMaterial(id: string, material: Omit<Material, 'id'>): Promise<Material> {
  return requisitar(`/api/materiais/${id}`, { method: 'PUT', body: JSON.stringify(material) })
}

export function excluirMaterial(id: string): Promise<void> {
  return requisitar(`/api/materiais/${id}`, { method: 'DELETE' })
}

export function listarAgendamentos(): Promise<Agendamento[]> {
  return requisitar('/api/agendamentos')
}

export function criarAgendamento(agendamento: Omit<Agendamento, 'id'>): Promise<Agendamento> {
  return requisitar('/api/agendamentos', { method: 'POST', body: JSON.stringify(agendamento) })
}

export function atualizarAgendamento(id: string, agendamento: Omit<Agendamento, 'id'>): Promise<Agendamento> {
  return requisitar(`/api/agendamentos/${id}`, { method: 'PUT', body: JSON.stringify(agendamento) })
}

export function definirStatusAgendamento(id: string, status: Status): Promise<Agendamento> {
  return requisitar(`/api/agendamentos/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
}

export function excluirAgendamento(id: string): Promise<void> {
  return requisitar(`/api/agendamentos/${id}`, { method: 'DELETE' })
}

export function listarFornecedores(): Promise<Fornecedor[]> {
  return requisitar('/api/fornecedores')
}

export function criarFornecedor(fornecedor: Omit<Fornecedor, 'id'>): Promise<Fornecedor> {
  return requisitar('/api/fornecedores', { method: 'POST', body: JSON.stringify(fornecedor) })
}

export function atualizarFornecedor(id: string, fornecedor: Omit<Fornecedor, 'id'>): Promise<Fornecedor> {
  return requisitar(`/api/fornecedores/${id}`, { method: 'PUT', body: JSON.stringify(fornecedor) })
}

export function excluirFornecedor(id: string): Promise<void> {
  return requisitar(`/api/fornecedores/${id}`, { method: 'DELETE' })
}

/** Formato aceito pela API para criar/atualizar um representante: fornecedores só pelo id. */
export interface RepresentanteEntrada {
  nome: string
  fornecedorIds: string[]
  email: string
  celular: string
}

export function listarRepresentantes(): Promise<Representante[]> {
  return requisitar('/api/representantes')
}

export function criarRepresentante(representante: RepresentanteEntrada): Promise<Representante> {
  return requisitar('/api/representantes', { method: 'POST', body: JSON.stringify(representante) })
}

export function atualizarRepresentante(id: string, representante: RepresentanteEntrada): Promise<Representante> {
  return requisitar(`/api/representantes/${id}`, { method: 'PUT', body: JSON.stringify(representante) })
}

export function excluirRepresentante(id: string): Promise<void> {
  return requisitar(`/api/representantes/${id}`, { method: 'DELETE' })
}

/** Formato aceito pela API para criar/atualizar uma meta: fornecedor só pelo id. */
export interface MetaEntrada {
  nome: string
  fornecedorId: string
  unidade: UnidadeMeta
}

export function listarMetas(): Promise<Meta[]> {
  return requisitar('/api/metas')
}

export function criarMeta(meta: MetaEntrada): Promise<Meta> {
  return requisitar('/api/metas', { method: 'POST', body: JSON.stringify(meta) })
}

export function atualizarMeta(id: string, meta: MetaEntrada): Promise<Meta> {
  return requisitar(`/api/metas/${id}`, { method: 'PUT', body: JSON.stringify(meta) })
}

export function excluirMeta(id: string): Promise<void> {
  return requisitar(`/api/metas/${id}`, { method: 'DELETE' })
}

/** Formato aceito pela API para criar/atualizar um valor de meta de representante. */
export interface MetaRepresentanteEntrada {
  representanteId: string
  metaId: string
  valorMeta: number
  valorRealizado: number
}

export function listarMetasRepresentante(): Promise<MetaRepresentante[]> {
  return requisitar('/api/metas-representante')
}

export function criarMetaRepresentante(mv: MetaRepresentanteEntrada): Promise<MetaRepresentante> {
  return requisitar('/api/metas-representante', { method: 'POST', body: JSON.stringify(mv) })
}

export function atualizarMetaRepresentante(id: string, mv: MetaRepresentanteEntrada): Promise<MetaRepresentante> {
  return requisitar(`/api/metas-representante/${id}`, { method: 'PUT', body: JSON.stringify(mv) })
}

export function excluirMetaRepresentante(id: string): Promise<void> {
  return requisitar(`/api/metas-representante/${id}`, { method: 'DELETE' })
}
