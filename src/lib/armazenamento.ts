import type { Dados } from '../types'

const CHAVE = 'agenda-materiais-v1'

export const DADOS_VAZIOS: Dados = { materiais: [], agendamentos: [] }

/**
 * Lê os dados do navegador. Qualquer falha (aba anônima, armazenamento
 * bloqueado, JSON corrompido) devolve dados vazios em vez de quebrar o app.
 */
export function carregar(): Dados {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (!bruto) return DADOS_VAZIOS

    const dados = JSON.parse(bruto) as Dados
    if (!Array.isArray(dados?.materiais) || !Array.isArray(dados?.agendamentos)) {
      return DADOS_VAZIOS
    }

    // Agendamentos salvos antes do campo "cliente" existir.
    return {
      materiais: dados.materiais,
      agendamentos: dados.agendamentos.map((a) => ({ ...a, cliente: a.cliente ?? '' })),
    }
  } catch {
    return DADOS_VAZIOS
  }
}

export function salvar(dados: Dados): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(dados))
  } catch {
    // Sem armazenamento disponível: o app segue funcionando só nesta sessão.
  }
}

export function novoId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}
