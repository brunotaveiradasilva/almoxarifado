import type { Role } from '../types'

const CHAVE_TOKEN = 'almoxarifado-token'
const CHAVE_USUARIO = 'almoxarifado-usuario'
const CHAVE_ROLE = 'almoxarifado-role'
const CHAVE_AVATAR = 'almoxarifado-avatar'

/** Sessão local: token JWT, nome de usuário, papel e foto, só neste navegador. */
export function sessaoSalva(): { token: string; usuario: string; role: Role; avatar: string | null } | null {
  try {
    const token = localStorage.getItem(CHAVE_TOKEN)
    const usuario = localStorage.getItem(CHAVE_USUARIO)
    // Sessões salvas antes do campo role existir: trata como USUARIO comum.
    const role = (localStorage.getItem(CHAVE_ROLE) as Role | null) ?? 'USUARIO'
    const avatar = localStorage.getItem(CHAVE_AVATAR)
    if (token && usuario) return { token, usuario, role, avatar }
  } catch {
    // Sem localStorage: segue sem sessão salva.
  }
  // Com o backend falso (VITE_MOCK_API=true) já entra como admin, sem passar pela tela de login.
  return import.meta.env.VITE_MOCK_API === 'true' ? { token: 'mock-token', usuario: 'admin', role: 'ADMIN', avatar: null } : null
}

export function salvarSessao(token: string, usuario: string, role: Role, avatar: string | null): void {
  try {
    localStorage.setItem(CHAVE_TOKEN, token)
    localStorage.setItem(CHAVE_USUARIO, usuario)
    localStorage.setItem(CHAVE_ROLE, role)
    salvarAvatar(avatar)
  } catch {
    // Sem localStorage disponível: a sessão não sobrevive a um recarregar da página.
  }
}

export function salvarAvatar(avatar: string | null): void {
  try {
    if (avatar) localStorage.setItem(CHAVE_AVATAR, avatar)
    else localStorage.removeItem(CHAVE_AVATAR)
  } catch {
    // nada a fazer
  }
}

export function limparSessao(): void {
  try {
    localStorage.removeItem(CHAVE_TOKEN)
    localStorage.removeItem(CHAVE_USUARIO)
    localStorage.removeItem(CHAVE_ROLE)
    localStorage.removeItem(CHAVE_AVATAR)
  } catch {
    // nada a fazer
  }
}
