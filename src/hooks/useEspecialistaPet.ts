import { useCallback, useEffect, useState } from 'react'
import * as api from '../lib/api'
import { ErroApi } from '../lib/api'
import type { LinhaPlanilhaEspecialistaPet } from '../lib/api'
import type { ClienteEspecialistaPet } from '../types'

function mensagemErro(erro: unknown): string {
  return erro instanceof ErroApi ? erro.message : 'Algo deu errado. Tente de novo.'
}

/** Clientes da campanha Especialista Pet, de todos os meses, com importação da planilha e sincronização com a ADS. */
export function useEspecialistaPet() {
  const [clientes, setClientes] = useState<ClienteEspecialistaPet[]>([])
  const [carregando, setCarregando] = useState(true)
  const [ocupado, setOcupado] = useState<'importando' | 'sincronizando' | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      setClientes(await api.listarEspecialistaPet())
    } catch (e) {
      setErro(mensagemErro(e))
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  /** Troca os clientes do mês pelos que vieram no retorno da API. */
  const substituirMes = useCallback((mes: string, doMes: ClienteEspecialistaPet[]) => {
    setClientes((atual) => [...atual.filter((c) => c.mes !== mes), ...doMes])
  }, [])

  const sincronizar = useCallback(
    async (mes: string) => {
      setErro(null)
      setOcupado('sincronizando')
      try {
        substituirMes(mes, await api.sincronizarEspecialistaPet(mes))
      } catch (e) {
        setErro(mensagemErro(e))
      } finally {
        setOcupado(null)
      }
    },
    [substituirMes],
  )

  /** Grava a planilha do mês e já busca o realizado na ADS. */
  const importar = useCallback(
    async (mes: string, linhas: LinhaPlanilhaEspecialistaPet[]) => {
      setErro(null)
      setOcupado('importando')
      try {
        substituirMes(mes, await api.importarEspecialistaPet(mes, linhas))
      } catch (e) {
        setErro(mensagemErro(e))
        setOcupado(null)
        return
      }
      await sincronizar(mes)
    },
    [substituirMes, sincronizar],
  )

  return { clientes, carregando, ocupado, erro, setErro, tentarNovamente: carregar, importar, sincronizar }
}
