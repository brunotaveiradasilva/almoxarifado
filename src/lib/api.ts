import { sessaoSalva } from './auth'
import * as mock from './apiMock'
import type {
  Agendamento,
  Fornecedor,
  Material,
  Meta,
  MetaRepresentante,
  Role,
  Status,
  TotalVendidoMensal,
  UnidadeMeta,
  Representante,
} from '../types'

// Em desenvolvimento cai no back-end local (docker compose up na almoxarifado-api);
// em produção vem do VITE_API_URL configurado no build do GitHub Pages.
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

// VITE_MOCK_API=true (num .env local, nunca commitado) troca toda chamada de rede por um backend
// falso em memória (src/lib/apiMock.ts) — pra ver a interface funcionando sem precisar de Docker.
const MOCK = import.meta.env.VITE_MOCK_API === 'true'

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

export function login(
  usuario: string,
  senha: string,
): Promise<{ token: string; usuario: string; role: Role; avatar: string | null }> {
  if (MOCK) return mock.login(usuario)
  return requisitar('/api/auth/login', { method: 'POST', body: JSON.stringify({ usuario, senha }) })
}

export function listarUsuarios(): Promise<string[]> {
  if (MOCK) return mock.listarUsuarios()
  return requisitar('/api/auth/usuarios')
}

export function criarUsuario(usuario: string, senha: string): Promise<void> {
  if (MOCK) return mock.criarUsuario(usuario)
  return requisitar('/api/auth/usuarios', { method: 'POST', body: JSON.stringify({ usuario, senha }) })
}

export function excluirUsuario(usuario: string): Promise<void> {
  if (MOCK) return mock.excluirUsuario(usuario)
  return requisitar(`/api/auth/usuarios/${encodeURIComponent(usuario)}`, { method: 'DELETE' })
}

export function trocarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
  if (MOCK) return mock.trocarSenha()
  return requisitar('/api/auth/senha', { method: 'PATCH', body: JSON.stringify({ senhaAtual, novaSenha }) })
}

export function atualizarAvatar(avatar: string | null): Promise<void> {
  if (MOCK) return mock.atualizarAvatar(avatar)
  return requisitar('/api/auth/avatar', { method: 'PATCH', body: JSON.stringify({ avatar }) })
}

export function listarMateriais(): Promise<Material[]> {
  if (MOCK) return mock.listarMateriais()
  return requisitar('/api/materiais')
}

export function criarMaterial(material: Omit<Material, 'id'>): Promise<Material> {
  if (MOCK) return mock.criarMaterial(material)
  return requisitar('/api/materiais', { method: 'POST', body: JSON.stringify(material) })
}

export function atualizarMaterial(id: string, material: Omit<Material, 'id'>): Promise<Material> {
  if (MOCK) return mock.atualizarMaterial(id, material)
  return requisitar(`/api/materiais/${id}`, { method: 'PUT', body: JSON.stringify(material) })
}

export function excluirMaterial(id: string): Promise<void> {
  if (MOCK) return mock.excluirMaterial(id)
  return requisitar(`/api/materiais/${id}`, { method: 'DELETE' })
}

export function listarAgendamentos(): Promise<Agendamento[]> {
  if (MOCK) return mock.listarAgendamentos()
  return requisitar('/api/agendamentos')
}

export function criarAgendamento(agendamento: Omit<Agendamento, 'id'>): Promise<Agendamento> {
  if (MOCK) return mock.criarAgendamento(agendamento)
  return requisitar('/api/agendamentos', { method: 'POST', body: JSON.stringify(agendamento) })
}

export function atualizarAgendamento(id: string, agendamento: Omit<Agendamento, 'id'>): Promise<Agendamento> {
  if (MOCK) return mock.atualizarAgendamento(id, agendamento)
  return requisitar(`/api/agendamentos/${id}`, { method: 'PUT', body: JSON.stringify(agendamento) })
}

export function definirStatusAgendamento(id: string, status: Status): Promise<Agendamento> {
  if (MOCK) return mock.definirStatusAgendamento(id, status)
  return requisitar(`/api/agendamentos/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
}

export function excluirAgendamento(id: string): Promise<void> {
  if (MOCK) return mock.excluirAgendamento(id)
  return requisitar(`/api/agendamentos/${id}`, { method: 'DELETE' })
}

export function listarFornecedores(): Promise<Fornecedor[]> {
  if (MOCK) return mock.listarFornecedores()
  return requisitar('/api/fornecedores')
}

export function criarFornecedor(fornecedor: Omit<Fornecedor, 'id'>): Promise<Fornecedor> {
  if (MOCK) return mock.criarFornecedor(fornecedor)
  return requisitar('/api/fornecedores', { method: 'POST', body: JSON.stringify(fornecedor) })
}

export function atualizarFornecedor(id: string, fornecedor: Omit<Fornecedor, 'id'>): Promise<Fornecedor> {
  if (MOCK) return mock.atualizarFornecedor(id, fornecedor)
  return requisitar(`/api/fornecedores/${id}`, { method: 'PUT', body: JSON.stringify(fornecedor) })
}

export function excluirFornecedor(id: string): Promise<void> {
  if (MOCK) return mock.excluirFornecedor(id)
  return requisitar(`/api/fornecedores/${id}`, { method: 'DELETE' })
}

/** Formato aceito pela API para criar/atualizar um representante: fornecedores só pelo id. */
export interface RepresentanteEntrada {
  nome: string
  fornecedorIds: string[]
  email: string
  celular: string
  codigoAds: string
}

export function listarRepresentantes(): Promise<Representante[]> {
  if (MOCK) return mock.listarRepresentantes()
  return requisitar('/api/representantes')
}

export function criarRepresentante(representante: RepresentanteEntrada): Promise<Representante> {
  if (MOCK) return mock.criarRepresentante(representante)
  return requisitar('/api/representantes', { method: 'POST', body: JSON.stringify(representante) })
}

export function atualizarRepresentante(id: string, representante: RepresentanteEntrada): Promise<Representante> {
  if (MOCK) return mock.atualizarRepresentante(id, representante)
  return requisitar(`/api/representantes/${id}`, { method: 'PUT', body: JSON.stringify(representante) })
}

export function excluirRepresentante(id: string): Promise<void> {
  if (MOCK) return mock.excluirRepresentante(id)
  return requisitar(`/api/representantes/${id}`, { method: 'DELETE' })
}

/** Formato aceito pela API para criar/atualizar uma meta: fornecedor só pelo id. */
export interface MetaEntrada {
  nome: string
  fornecedorId: string
  unidade: UnidadeMeta
  codigoAdsDivisao: string
  cnpjAdsFornecedor: string
}

export function listarMetas(): Promise<Meta[]> {
  if (MOCK) return mock.listarMetas()
  return requisitar('/api/metas')
}

export function criarMeta(meta: MetaEntrada): Promise<Meta> {
  if (MOCK) return mock.criarMeta(meta)
  return requisitar('/api/metas', { method: 'POST', body: JSON.stringify(meta) })
}

export function atualizarMeta(id: string, meta: MetaEntrada): Promise<Meta> {
  if (MOCK) return mock.atualizarMeta(id, meta)
  return requisitar(`/api/metas/${id}`, { method: 'PUT', body: JSON.stringify(meta) })
}

export function excluirMeta(id: string): Promise<void> {
  if (MOCK) return mock.excluirMeta(id)
  return requisitar(`/api/metas/${id}`, { method: 'DELETE' })
}

/**
 * Formato aceito pela API para criar/atualizar um valor de meta de representante num mês. Não tem
 * valorRealizado: ele só chega pela sincronização com a ADS.
 */
export interface MetaRepresentanteEntrada {
  representanteId: string
  metaId: string
  /** "2026-09" */
  mes: string
  valorMeta: number
}

/** Todas as atribuições, de todos os meses — as telas filtram pelo mês escolhido. */
export function listarMetasRepresentante(): Promise<MetaRepresentante[]> {
  if (MOCK) return mock.listarMetasRepresentante()
  return requisitar('/api/metas-representante')
}

export function listarTotaisVendidos(): Promise<TotalVendidoMensal[]> {
  if (MOCK) return mock.listarTotaisVendidos()
  return requisitar('/api/metas-representante/totais-vendidos')
}

/** Força agora o recálculo do realizado de um mês a partir do histórico de vendas da ADS (o mês atual também roda sozinho todo dia). */
export function sincronizarMetasRepresentante(mes: string): Promise<MetaRepresentante[]> {
  if (MOCK) return mock.sincronizarMetasRepresentante(mes)
  return requisitar(`/api/metas-representante/sincronizar?mes=${encodeURIComponent(mes)}`, { method: 'POST' })
}

/** Copia os valores de meta do mês `de` pro mês `para`, só onde o destino ainda não tem valor. Devolve as atribuições criadas. */
export function copiarMetasRepresentante(de: string, para: string, fornecedorId?: string): Promise<MetaRepresentante[]> {
  if (MOCK) return mock.copiarMetasRepresentante(de, para, fornecedorId)
  return requisitar('/api/metas-representante/copiar', {
    method: 'POST',
    body: JSON.stringify({ de, para, fornecedorId }),
  })
}

export function criarMetaRepresentante(mv: MetaRepresentanteEntrada): Promise<MetaRepresentante> {
  if (MOCK) return mock.criarMetaRepresentante(mv)
  return requisitar('/api/metas-representante', { method: 'POST', body: JSON.stringify(mv) })
}

export function atualizarMetaRepresentante(id: string, mv: MetaRepresentanteEntrada): Promise<MetaRepresentante> {
  if (MOCK) return mock.atualizarMetaRepresentante(id, mv)
  return requisitar(`/api/metas-representante/${id}`, { method: 'PUT', body: JSON.stringify(mv) })
}

export function excluirMetaRepresentante(id: string): Promise<void> {
  if (MOCK) return mock.excluirMetaRepresentante(id)
  return requisitar(`/api/metas-representante/${id}`, { method: 'DELETE' })
}
