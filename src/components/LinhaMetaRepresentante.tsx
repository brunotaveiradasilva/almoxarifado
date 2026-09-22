import { useState } from 'react'
import { ROTULO_UNIDADE_META } from '../lib/unidadeMeta'
import type { MetaRepresentanteEntrada } from '../lib/api'
import type { Meta, MetaRepresentante } from '../types'

interface Props {
  representanteId: string
  meta: Meta
  atribuicao: MetaRepresentante | null
  aoSalvar: (mv: MetaRepresentanteEntrada, id?: string | null) => Promise<MetaRepresentante>
}

/** Linha editável de uma tabela de metas: Meta e Realizado digitáveis, Falta e progresso calculados na hora. */
export function LinhaMetaRepresentante({ representanteId, meta, atribuicao, aoSalvar }: Props) {
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
      const salva = await aoSalvar({ representanteId, metaId: meta.id, valorMeta: metaNum, valorRealizado: realizadoNum }, id)
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
      <td className="num">
        <div className="meta-progress-cell">
          <span className="meta-progress-track">
            <span
              className={`meta-progress-fill${(percentual ?? 0) >= 100 ? ' is-complete' : ''}`}
              style={{ width: `${Math.min(percentual ?? 0, 100)}%` }}
            />
          </span>
          <span className="meta-progress-pct">
            {percentual === null ? '—' : `${percentual.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%`}
          </span>
        </div>
      </td>
    </tr>
  )
}
