import { useCallback, useEffect, useState } from 'react'
import * as api from '../lib/api'
import { ErroApi } from '../lib/api'
import { idTemporario } from '../lib/idTemporario'
import type { TipoMeta, Vendedor } from '../types'

function mensagemErro(erro: unknown): string {
  return erro instanceof ErroApi ? erro.message : 'Algo deu errado. Tente de novo.'
}

/**
 * Estado dos cadastros de vendedores e tipos de meta, só para quem é admin.
 * Mesmo padrão otimista do useAlmoxarifado: atualiza a tela na hora e confirma com a API depois.
 */
export function useMetas() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [tiposMeta, setTiposMeta] = useState<TipoMeta[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const carregarTudo = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const [vendedoresCarregados, tiposMetaCarregados] = await Promise.all([
        api.listarVendedores(),
        api.listarTiposMeta(),
      ])
      setVendedores(vendedoresCarregados)
      setTiposMeta(tiposMetaCarregados)
    } catch (e) {
      setErro(mensagemErro(e))
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarTudo()
  }, [carregarTudo])

  const salvarVendedor = useCallback(
    (vendedor: Omit<Vendedor, 'id'>, id?: string | null) => {
      setErro(null)

      if (id) {
        const anterior = vendedores
        setVendedores((atual) => atual.map((v) => (v.id === id ? { ...v, ...vendedor } : v)))
        api
          .atualizarVendedor(id, vendedor)
          .then((atualizado) => setVendedores((atual) => atual.map((v) => (v.id === id ? atualizado : v))))
          .catch((e) => {
            setErro(mensagemErro(e))
            setVendedores(anterior)
          })
        return
      }

      const provisorio = idTemporario()
      setVendedores((atual) => [...atual, { ...vendedor, id: provisorio }])
      api
        .criarVendedor(vendedor)
        .then((criado) => setVendedores((atual) => atual.map((v) => (v.id === provisorio ? criado : v))))
        .catch((e) => {
          setErro(mensagemErro(e))
          setVendedores((atual) => atual.filter((v) => v.id !== provisorio))
        })
    },
    [vendedores],
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

  const salvarTipoMeta = useCallback(
    (tipoMeta: Omit<TipoMeta, 'id'>, id?: string | null) => {
      setErro(null)

      if (id) {
        const anterior = tiposMeta
        setTiposMeta((atual) => atual.map((t) => (t.id === id ? { ...t, ...tipoMeta } : t)))
        api
          .atualizarTipoMeta(id, tipoMeta)
          .then((atualizado) => setTiposMeta((atual) => atual.map((t) => (t.id === id ? atualizado : t))))
          .catch((e) => {
            setErro(mensagemErro(e))
            setTiposMeta(anterior)
          })
        return
      }

      const provisorio = idTemporario()
      setTiposMeta((atual) => [...atual, { ...tipoMeta, id: provisorio }])
      api
        .criarTipoMeta(tipoMeta)
        .then((criado) => setTiposMeta((atual) => atual.map((t) => (t.id === provisorio ? criado : t))))
        .catch((e) => {
          setErro(mensagemErro(e))
          setTiposMeta((atual) => atual.filter((t) => t.id !== provisorio))
        })
    },
    [tiposMeta],
  )

  const removerTipoMeta = useCallback(
    (id: string) => {
      setErro(null)
      const anterior = tiposMeta
      setTiposMeta((atual) => atual.filter((t) => t.id !== id))
      api.excluirTipoMeta(id).catch((e) => {
        setErro(mensagemErro(e))
        setTiposMeta(anterior)
      })
    },
    [tiposMeta],
  )

  return {
    vendedores,
    tiposMeta,
    carregando,
    erro,
    tentarNovamente: carregarTudo,
    salvarVendedor,
    removerVendedor,
    salvarTipoMeta,
    removerTipoMeta,
  }
}
