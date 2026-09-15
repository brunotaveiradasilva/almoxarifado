import { useMemo, useState } from 'react'
import { EstadoVazio } from './EstadoVazio'
import { ROTULO_UNIDADE_META } from '../lib/unidadeMeta'
import type { MetaVendedorEntrada } from '../lib/api'
import type { Meta, MetaVendedor, Vendedor } from '../types'

interface Props {
  vendedores: Vendedor[]
  metas: Meta[]
  metasVendedor: MetaVendedor[]
  aoSalvar: (mv: MetaVendedorEntrada, id?: string | null) => Promise<MetaVendedor>
}

/** Metas de todos os fornecedores para quem o vendedor escolhido trabalha — os valores dão pra editar direto aqui. */
export function ConsultaMetasPorVendedor({ vendedores, metas, metasVendedor, aoSalvar }: Props) {
  const [vendedorId, setVendedorId] = useState(vendedores[0]?.id ?? '')
  const vendedor = vendedores.find((v) => v.id === vendedorId) ?? null

  const metasDoVendedor = useMemo(() => {
    if (!vendedor) return []
    const fornecedorIds = new Set(vendedor.fornecedores.map((f) => f.id))
    return metas.filter((m) => fornecedorIds.has(m.fornecedor.id))
  }, [vendedor, metas])

  if (!vendedores.length) {
    return <EstadoVazio titulo="Nenhum vendedor cadastrado" texto="Cadastre um vendedor pra consultar as metas dele." />
  }

  return (
    <div>
      <div className="field consulta-filtro">
        <label htmlFor="cv-vendedor">Vendedor</label>
        <select id="cv-vendedor" value={vendedorId} onChange={(e) => setVendedorId(e.target.value)}>
          {vendedores.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nome}
            </option>
          ))}
        </select>
      </div>

      {vendedor ? (
        <p className="hint consulta-info">
          Fornecedores: {vendedor.fornecedores.map((f) => f.nome).join(', ') || '—'}
          {vendedor.email ? ` · ${vendedor.email}` : ''}
          {vendedor.celular ? ` · ${vendedor.celular}` : ''}
        </p>
      ) : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Meta</th>
              <th>Unidade</th>
              <th className="num">Meta</th>
              <th className="num">Realizado</th>
              <th className="num">Falta</th>
              <th className="num">Realizado %</th>
            </tr>
          </thead>
          <tbody>
            {metasDoVendedor.map((meta) => (
              <LinhaMetaVendedor
                key={`${vendedorId}:${meta.id}`}
                vendedorId={vendedorId}
                meta={meta}
                atribuicao={metasVendedor.find((mv) => mv.vendedor.id === vendedorId && mv.meta.id === meta.id) ?? null}
                aoSalvar={aoSalvar}
              />
            ))}
          </tbody>
        </table>

        {!metasDoVendedor.length ? (
          <EstadoVazio
            titulo="Nenhuma meta pra esse vendedor"
            texto="Nenhum dos fornecedores desse vendedor tem meta cadastrada ainda."
          />
        ) : null}
      </div>
    </div>
  )
}

interface LinhaProps {
  vendedorId: string
  meta: Meta
  atribuicao: MetaVendedor | null
  aoSalvar: (mv: MetaVendedorEntrada, id?: string | null) => Promise<MetaVendedor>
}

function LinhaMetaVendedor({ vendedorId, meta, atribuicao, aoSalvar }: LinhaProps) {
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
