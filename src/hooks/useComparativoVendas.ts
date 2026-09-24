import { useEffect, useRef, useState } from 'react'
import * as api from '../lib/api'
import { ErroApi } from '../lib/api'
import { erroDoPeriodo, type Periodo } from '../lib/comparativo'
import type { Fornecedor, VendasPeriodo } from '../types'

function mensagemErro(erro: unknown): string {
  return erro instanceof ErroApi ? erro.message : 'Algo deu errado. Tente de novo.'
}

/** Espera a pessoa parar de mexer nas datas antes de ir na ADS, que é lenta. */
const ESPERA_MS = 500

/**
 * Vendas dos dois períodos comparados na aba Dados, buscadas direto da ADS sempre que os períodos
 * ou o fornecedor mudam. Resposta atrasada de uma busca antiga é ignorada. Enquanto busca, mantém o
 * resultado anterior na tela.
 */
export function useComparativoVendas(atual: Periodo, anterior: Periodo, fornecedorId: string) {
  const [dados, setDados] = useState<{ atual: VendasPeriodo; anterior: VendasPeriodo } | null>(null)
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)
  const ultimaBusca = useRef(0)

  useEffect(() => {
    api
      .listarFornecedores()
      .then((lista) => setFornecedores([...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))))
      .catch((e) => setErro(mensagemErro(e)))
  }, [])

  const erroPeriodo = erroDoPeriodo(atual) ?? erroDoPeriodo(anterior)

  useEffect(() => {
    // Conta também quando não busca: resposta de antes das datas ficarem inválidas não vale mais.
    const busca = ++ultimaBusca.current
    if (erroPeriodo) return
    const timer = setTimeout(async () => {
      setCarregando(true)
      setErro(null)
      try {
        const [vendasAtual, vendasAnterior] = await Promise.all([
          api.buscarVendasPeriodo(atual.inicio, atual.fim, fornecedorId || undefined),
          api.buscarVendasPeriodo(anterior.inicio, anterior.fim, fornecedorId || undefined),
        ])
        if (busca === ultimaBusca.current) setDados({ atual: vendasAtual, anterior: vendasAnterior })
      } catch (e) {
        if (busca === ultimaBusca.current) setErro(mensagemErro(e))
      } finally {
        if (busca === ultimaBusca.current) setCarregando(false)
      }
    }, ESPERA_MS)
    return () => clearTimeout(timer)
  }, [atual.inicio, atual.fim, anterior.inicio, anterior.fim, fornecedorId, erroPeriodo, tentativa])

  return {
    dados,
    fornecedores,
    // Busca antiga ignorada não chega a desligar o carregando: com período inválido nada está buscando.
    carregando: carregando && !erroPeriodo,
    erro,
    erroPeriodo,
    tentarNovamente: () => setTentativa((t) => t + 1),
  }
}
