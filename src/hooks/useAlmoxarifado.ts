import { useCallback, useEffect, useState } from 'react'
import { carregar, novoId, salvar } from '../lib/armazenamento'
import { criarExemplos } from '../data/exemplos'
import type { Agendamento, Dados, Material, Status } from '../types'

/**
 * Estado único do app: materiais, agendamentos e as ações que os alteram.
 * Tudo que muda aqui é gravado no navegador logo em seguida.
 */
export function useAlmoxarifado() {
  const [dados, setDados] = useState<Dados>(() => carregar())

  useEffect(() => {
    salvar(dados)
  }, [dados])

  const salvarMaterial = useCallback((material: Omit<Material, 'id'>, id?: string | null) => {
    setDados((atual) => ({
      ...atual,
      materiais: id
        ? atual.materiais.map((m) => (m.id === id ? { ...m, ...material } : m))
        : [...atual.materiais, { ...material, id: novoId() }],
    }))
  }, [])

  const removerMaterial = useCallback((id: string) => {
    setDados((atual) => ({ ...atual, materiais: atual.materiais.filter((m) => m.id !== id) }))
  }, [])

  const salvarAgendamento = useCallback(
    (agendamento: Omit<Agendamento, 'id'>, id?: string | null) => {
      setDados((atual) => ({
        ...atual,
        agendamentos: id
          ? atual.agendamentos.map((a) => (a.id === id ? { ...a, ...agendamento } : a))
          : [...atual.agendamentos, { ...agendamento, id: novoId() }],
      }))
    },
    [],
  )

  const removerAgendamento = useCallback((id: string) => {
    setDados((atual) => ({
      ...atual,
      agendamentos: atual.agendamentos.filter((a) => a.id !== id),
    }))
  }, [])

  const definirStatus = useCallback((id: string, status: Status) => {
    setDados((atual) => ({
      ...atual,
      agendamentos: atual.agendamentos.map((a) => (a.id === id ? { ...a, status } : a)),
    }))
  }, [])

  const carregarExemplos = useCallback(() => {
    const exemplos = criarExemplos()
    setDados((atual) => ({
      materiais: [...atual.materiais, ...exemplos.materiais],
      agendamentos: [...atual.agendamentos, ...exemplos.agendamentos],
    }))
  }, [])

  return {
    materiais: dados.materiais,
    agendamentos: dados.agendamentos,
    salvarMaterial,
    removerMaterial,
    salvarAgendamento,
    removerAgendamento,
    definirStatus,
    carregarExemplos,
  }
}
