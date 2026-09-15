import { useState } from 'react'
import { ROTULO_UNIDADE_META } from '../lib/unidadeMeta'
import type { MetaVendedorEntrada } from '../lib/api'
import type { Meta, MetaVendedor } from '../types'

interface Props {
  vendedorId: string
  meta: Meta
  atribuicao: MetaVendedor | null
  aoSalvar: (mv: MetaVendedorEntrada, id?: string | null) => Promise<MetaVendedor>
}

/** Linha editável de uma tabela de metas: Meta e Realizado digitáveis, Falta e % calculados na hora. */
export function LinhaMetaVendedor({ vendedorId, meta, atribuicao, aoSalvar }: Props) {
  const [id, setId] = useState(atribuicao?.id ?? null)
  const [valorMeta, setValorMeta] = useState(atribuicao ? String(atribuicao.valorMeta) : '')
  const [valorRealizado, setValorRealizado] = useState(atribuicao ? String(atribuicao.valorRealizado) : '')
  const [salvo, setSalvo] = useState({ meta: atribuicao?.valorMeta ?? 0, realizado: atribuicao?.valorRealizado ?? 0 })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const metaNum = Number.parseFloat(valorMeta) || 0
  const realizadoNum = Number.parseFloat(valorRealizado) || 0
  const falta = metaNum - realizadoNum
  const percentual = metaNum > 0 ? (realizadoNum / metaNum) * 100 : null

  async function salvarSeMudou() {
    if (metaNum === salvo.meta && realizadoNum === salvo.realizado) return

    setSalvando(true)
    setErro('')
    try {
      const salva = await aoSalvar({ vendedorId, metaId: meta.id, valorMeta: metaNum, valorRealizado: realizadoNum }, id)
      setId(salva.id)
      setSalvo({ meta: salva.valorMeta, realizado: salva.valorRealizado })
    } catch {
      setErro('Não salvou — tenta de novo.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <tr>
      <td className="cell-material">{meta.nome}</td>
      <td>{ROTULO_UNIDADE_META[meta.unidade]}</td>
      <td className="num">
        <input
          className="input-tabela"
          type="number"
          min={0}
          step="any"
          value={valorMeta}
          onChange={(e) => setValorMeta(e.target.value)}
          onBlur={salvarSeMudou}
        />
      </td>
      <td className="num">
        <input
          className="input-tabela"
          type="number"
          min={0}
          step="any"
          value={valorRealizado}
          onChange={(e) => setValorRealizado(e.target.value)}
          onBlur={salvarSeMudou}
        />
        {salvando ? <span className="hint"> salvando…</span> : null}
        {erro ? <span className="hint warn"> {erro}</span> : null}
      </td>
      <td className="num">{falta.toLocaleString('pt-BR')}</td>
      <td className="num">{percentual === null ? '—' : `${percentual.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`}</td>
    </tr>
  )
}
