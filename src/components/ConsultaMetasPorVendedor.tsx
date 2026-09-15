import { useMemo, useState } from 'react'
import { EstadoVazio } from './EstadoVazio'
import { ROTULO_UNIDADE_META } from '../lib/unidadeMeta'
import type { Meta, Vendedor } from '../types'

interface Props {
  vendedores: Vendedor[]
  metas: Meta[]
}

/** Só visualização: metas de todos os fornecedores para quem o vendedor escolhido trabalha. */
export function ConsultaMetasPorVendedor({ vendedores, metas }: Props) {
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
              <th>Fornecedor</th>
              <th>Unidade</th>
            </tr>
          </thead>
          <tbody>
            {metasDoVendedor.map((m) => (
              <tr key={m.id}>
                <td className="cell-material">{m.nome}</td>
                <td>{m.fornecedor.nome}</td>
                <td>{ROTULO_UNIDADE_META[m.unidade]}</td>
              </tr>
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
