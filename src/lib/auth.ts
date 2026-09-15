import type { Role } from '../types'

const CHAVE_TOKEN = 'almoxarifado-token'
const CHAVE_USUARIO = 'almoxarifado-usuario'
const CHAVE_ROLE = 'almoxarifado-role'

/** Sessão local: token JWT, nome de usuário e papel, só neste navegador. */
export function sessaoSalva(): { token: string; usuario: string; role: Role } | null {
  try {
    const token = localStorage.getItem(CHAVE_TOKEN)
    const usuario = localStorage.getItem(CHAVE_USUARIO)
    // Sessões salvas antes do campo role existir: trata como USUARIO comum.
    const role = (localStorage.getItem(CHAVE_ROLE) as Role | null) ?? 'USUARIO'
    return token && usuario ? { token, usuario, role } : null
  } catch {
    return null
  }
}

export function salvarSessao(token: string, usuario: string, role: Role): void {
  try {
    localStorage.setItem(CHAVE_TOKEN, token)
    localStorage.setItem(CHAVE_USUARIO, usuario)
    localStorage.setItem(CHAVE_ROLE, role)
  } catch {
    // Sem localStorage disponível: a sessão não sobrevive a um recarregar da página.
  }
}

export function limparSessao(): void {
  try {
    localStorage.removeItem(CHAVE_TOKEN)
    localStorage.removeItem(CHAVE_USUARIO)
    localStorage.removeItem(CHAVE_ROLE)
  } catch {
    // nada a fazer
  }
}
