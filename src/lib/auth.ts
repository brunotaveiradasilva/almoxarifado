const CHAVE_TOKEN = 'almoxarifado-token'
const CHAVE_USUARIO = 'almoxarifado-usuario'

/** Sessão local: token JWT e nome de usuário, só neste navegador. */
export function sessaoSalva(): { token: string; usuario: string } | null {
  try {
    const token = localStorage.getItem(CHAVE_TOKEN)
    const usuario = localStorage.getItem(CHAVE_USUARIO)
    return token && usuario ? { token, usuario } : null
  } catch {
    return null
  }
}

export function salvarSessao(token: string, usuario: string): void {
  try {
    localStorage.setItem(CHAVE_TOKEN, token)
    localStorage.setItem(CHAVE_USUARIO, usuario)
  } catch {
    // Sem localStorage disponível: a sessão não sobrevive a um recarregar da página.
  }
}

export function limparSessao(): void {
  try {
    localStorage.removeItem(CHAVE_TOKEN)
    localStorage.removeItem(CHAVE_USUARIO)
  } catch {
    // nada a fazer
  }
}
