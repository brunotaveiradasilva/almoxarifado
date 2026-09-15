import { useCallback, useEffect, useState } from 'react'
import * as api from '../lib/api'
import { ErroApi, aoSessaoExpirar } from '../lib/api'
import { limparSessao, salvarSessao, sessaoSalva } from '../lib/auth'
import type { Role } from '../types'

/** Sessão do usuário: quem está logado (se alguém), seu papel, e as ações de entrar/sair. */
export function useAuth() {
  const [usuario, setUsuario] = useState<string | null>(() => sessaoSalva()?.usuario ?? null)
  const [role, setRole] = useState<Role | null>(() => sessaoSalva()?.role ?? null)
  const [entrando, setEntrando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const sair = useCallback(() => {
    limparSessao()
    setUsuario(null)
    setRole(null)
  }, [])

  // Se qualquer chamada à API devolver 401 (token expirado, por exemplo), volta pra tela de login.
  useEffect(() => {
    aoSessaoExpirar(sair)
    return () => aoSessaoExpirar(null)
  }, [sair])

  const entrar = useCallback(async (usuarioDigitado: string, senha: string) => {
    setEntrando(true)
    setErro(null)
    try {
      const resposta = await api.login(usuarioDigitado, senha)
      salvarSessao(resposta.token, resposta.usuario, resposta.role)
      setUsuario(resposta.usuario)
      setRole(resposta.role)
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível entrar. Tente de novo.')
    } finally {
      setEntrando(false)
    }
  }, [])

  return { usuario, role, isAdmin: role === 'ADMIN', logado: usuario !== null, entrando, erro, entrar, sair }
}
