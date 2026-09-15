import { sessaoSalva } from './auth'
import type { Agendamento, Material, Role, Status, TipoMeta, Vendedor } from '../types'

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

export function listarVendedores(): Promise<Vendedor[]> {
  return requisitar('/api/vendedores')
}

export function criarVendedor(vendedor: Omit<Vendedor, 'id'>): Promise<Vendedor> {
  return requisitar('/api/vendedores', { method: 'POST', body: JSON.stringify(vendedor) })
}

export function atualizarVendedor(id: string, vendedor: Omit<Vendedor, 'id'>): Promise<Vendedor> {
  return requisitar(`/api/vendedores/${id}`, { method: 'PUT', body: JSON.stringify(vendedor) })
}

export function excluirVendedor(id: string): Promise<void> {
  return requisitar(`/api/vendedores/${id}`, { method: 'DELETE' })
}

export function listarTiposMeta(): Promise<TipoMeta[]> {
  return requisitar('/api/tipos-meta')
}

export function criarTipoMeta(tipoMeta: Omit<TipoMeta, 'id'>): Promise<TipoMeta> {
  return requisitar('/api/tipos-meta', { method: 'POST', body: JSON.stringify(tipoMeta) })
}

export function atualizarTipoMeta(id: string, tipoMeta: Omit<TipoMeta, 'id'>): Promise<TipoMeta> {
  return requisitar(`/api/tipos-meta/${id}`, { method: 'PUT', body: JSON.stringify(tipoMeta) })
}

export function excluirTipoMeta(id: string): Promise<void> {
  return requisitar(`/api/tipos-meta/${id}`, { method: 'DELETE' })
}
