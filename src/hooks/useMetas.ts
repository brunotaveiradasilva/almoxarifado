import { useCallback, useEffect, useState } from 'react'
import * as api from '../lib/api'
import { ErroApi } from '../lib/api'
import type { MetaEntrada, VendedorEntrada } from '../lib/api'
import { idTemporario } from '../lib/idTemporario'
import type { Fornecedor, Meta, Vendedor } from '../types'

function mensagemErro(erro: unknown): string {
  return erro instanceof ErroApi ? erro.message : 'Algo deu errado. Tente de novo.'
}

/**
 * Estado dos cadastros de apoio às metas — fornecedores, vendedores e metas —, só para quem é
 * admin. Mesmo padrão otimista do useAlmoxarifado: atualiza a tela na hora e confirma com a API
 * depois; se a API recusar, desfaz e mostra o erro.
 */
export function useMetas() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [metas, setMetas] = useState<Meta[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const carregarTudo = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const [fornecedoresCarregados, vendedoresCarregados, metasCarregadas] = await Promise.all([
        api.listarFornecedores(),
        api.listarVendedores(),
        api.listarMetas(),
      ])
      setFornecedores(fornecedoresCarregados)
      setVendedores(vendedoresCarregados)
      setMetas(metasCarregadas)
    } catch (e) {
      setErro(mensagemErro(e))
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarTudo()
  }, [carregarTudo])

  const salvarFornecedor = useCallback(
    (fornecedor: Omit<Fornecedor, 'id'>, id?: string | null) => {
      setErro(null)

      if (id) {
        const anterior = fornecedores
        setFornecedores((atual) => atual.map((f) => (f.id === id ? { ...f, ...fornecedor } : f)))
        api
          .atualizarFornecedor(id, fornecedor)
          .then((atualizado) => setFornecedores((atual) => atual.map((f) => (f.id === id ? atualizado : f))))
          .catch((e) => {
            setErro(mensagemErro(e))
            setFornecedores(anterior)
          })
        return
      }

      const provisorio = idTemporario()
      setFornecedores((atual) => [...atual, { ...fornecedor, id: provisorio }])
      api
        .criarFornecedor(fornecedor)
        .then((criado) => setFornecedores((atual) => atual.map((f) => (f.id === provisorio ? criado : f))))
        .catch((e) => {
          setErro(mensagemErro(e))
          setFornecedores((atual) => atual.filter((f) => f.id !== provisorio))
        })
    },
    [fornecedores],
  )

  const removerFornecedor = useCallback(
    (id: string) => {
      setErro(null)
      const anterior = fornecedores
      setFornecedores((atual) => atual.filter((f) => f.id !== id))
      api.excluirFornecedor(id).catch((e) => {
        setErro(mensagemErro(e))
        setFornecedores(anterior)
      })
    },
    [fornecedores],
  )

  const salvarVendedor = useCallback(
    (vendedor: VendedorEntrada, id?: string | null) => {
      setErro(null)

      if (id) {
        // Otimista só com o que dá pra saber na hora (nome, email, celular); os fornecedores
        // completos (nome incluso) só voltam certos na resposta da API.
        setVendedores((atual) => atual.map((v) => (v.id === id ? { ...v, ...vendedor } : v)))
        api
          .atualizarVendedor(id, vendedor)
          .then((atualizado) => setVendedores((atual) => atual.map((v) => (v.id === id ? atualizado : v))))
          .catch((e) => {
            setErro(mensagemErro(e))
            carregarTudo()
          })
        return
      }

      api
        .criarVendedor(vendedor)
        .then((criado) => setVendedores((atual) => [...atual, criado]))
        .catch((e) => setErro(mensagemErro(e)))
    },
    [carregarTudo],
  )

  const removerVendedor = useCallback(
    (id: string) => {
      setErro(null)
      const anterior = vendedores
      setVendedores((atual) => atual.filter((v) => v.id !== id))
      api.excluirVendedor(id).catch((e) => {
        setErro(mensagemErro(e))
        setVendedores(anterior)
      })
    },
    [vendedores],
  )

  const salvarMeta = useCallback(
    (meta: MetaEntrada, id?: string | null) => {
      setErro(null)

      if (id) {
        api
          .atualizarMeta(id, meta)
          .then((atualizada) => setMetas((atual) => atual.map((m) => (m.id === id ? atualizada : m))))
          .catch((e) => setErro(mensagemErro(e)))
        return
      }

      api
        .criarMeta(meta)
        .then((criada) => setMetas((atual) => [...atual, criada]))
        .catch((e) => setErro(mensagemErro(e)))
    },
    [],
  )

  const removerMeta = useCallback((id: string) => {
    setErro(null)
    const anterior = metas
    setMetas((atual) => atual.filter((m) => m.id !== id))
    api.excluirMeta(id).catch((e) => {
      setErro(mensagemErro(e))
      setMetas(anterior)
    })
  }, [metas])

  return {
    fornecedores,
    vendedores,
    metas,
    carregando,
    erro,
    tentarNovamente: carregarTudo,
    salvarFornecedor,
    removerFornecedor,
    salvarVendedor,
    removerVendedor,
    salvarMeta,
    removerMeta,
  }
}
