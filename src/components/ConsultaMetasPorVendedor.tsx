import { useMemo, useState } from 'react'
import { EstadoVazio } from './EstadoVazio'
import { ROTULO_UNIDADE_META } from '../lib/unidadeMeta'
import type { Meta, MetaVendedor, Vendedor } from '../types'

interface Props {
  vendedores: Vendedor[]
  metas: Meta[]
  metasVendedor: MetaVendedor[]
}

/** Só visualização: metas de todos os fornecedores para quem o vendedor escolhido trabalha. Editar é na tela "Metas por fornecedor". */
export function ConsultaMetasPorVendedor({ vendedores, metas, metasVendedor }: Props) {
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
            {metasDoVendedor.map((meta) => {
              const atribuicao =
                metasVendedor.find((mv) => mv.vendedor.id === vendedorId && mv.meta.id === meta.id) ?? null
              const valorMeta = atribuicao?.valorMeta ?? 0
              const valorRealizado = atribuicao?.valorRealizado ?? 0
              const falta = valorMeta - valorRealizado
              const percentual = valorMeta > 0 ? (valorRealizado / valorMeta) * 100 : null

              return (
                <tr key={meta.id}>
                  <td className="cell-material">{meta.nome}</td>
                  <td>{ROTULO_UNIDADE_META[meta.unidade]}</td>
                  <td className="num">{atribuicao ? valorMeta.toLocaleString('pt-BR') : '—'}</td>
                  <td className="num">{atribuicao ? valorRealizado.toLocaleString('pt-BR') : '—'}</td>
                  <td className="num">{atribuicao ? falta.toLocaleString('pt-BR') : '—'}</td>
                  <td className="num">
                    {percentual === null ? '—' : `${percentual.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`}
                  </td>
                </tr>
              )
            })}
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
