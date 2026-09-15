import { useMemo, useState } from 'react'
import { EstadoVazio } from './EstadoVazio'
import { ROTULO_UNIDADE_META } from '../lib/unidadeMeta'
import type { Fornecedor, Meta, Vendedor } from '../types'

interface Props {
  fornecedores: Fornecedor[]
  vendedores: Vendedor[]
  metas: Meta[]
}

/** Só visualização: metas e vendedores de um fornecedor escolhido. */
export function ConsultaMetasPorFornecedor({ fornecedores, vendedores, metas }: Props) {
  const [fornecedorId, setFornecedorId] = useState(fornecedores[0]?.id ?? '')

  const metasDoFornecedor = useMemo(
    () => metas.filter((m) => m.fornecedor.id === fornecedorId),
    [metas, fornecedorId],
  )

  const vendedoresDoFornecedor = useMemo(
    () => vendedores.filter((v) => v.fornecedores.some((f) => f.id === fornecedorId)),
    [vendedores, fornecedorId],
  )

  if (!fornecedores.length) {
    return (
      <EstadoVazio titulo="Nenhum fornecedor cadastrado" texto="Cadastre um fornecedor pra consultar as metas dele." />
    )
  }

  return (
    <div>
      <div className="field consulta-filtro">
        <label htmlFor="cf-fornecedor">Fornecedor</label>
        <select id="cf-fornecedor" value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)}>
          {fornecedores.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nome}
            </option>
          ))}
        </select>
      </div>

      <h3 className="consulta-subtitulo">Metas</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Meta</th>
              <th>Unidade</th>
            </tr>
          </thead>
          <tbody>
            {metasDoFornecedor.map((m) => (
              <tr key={m.id}>
                <td className="cell-material">{m.nome}</td>
                <td>{ROTULO_UNIDADE_META[m.unidade]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!metasDoFornecedor.length ? (
          <EstadoVazio titulo="Nenhuma meta pra esse fornecedor" texto="Cadastre uma meta pra esse fornecedor." />
        ) : null}
      </div>

      <h3 className="consulta-subtitulo">Vendedores</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Vendedor</th>
              <th>E-mail</th>
              <th>Celular</th>
            </tr>
          </thead>
          <tbody>
            {vendedoresDoFornecedor.map((v) => (
              <tr key={v.id}>
                <td className="cell-material">{v.nome}</td>
                <td>{v.email || '—'}</td>
                <td>{v.celular || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!vendedoresDoFornecedor.length ? (
          <EstadoVazio titulo="Nenhum vendedor pra esse fornecedor" texto="Nenhum vendedor trabalha pra esse fornecedor ainda." />
        ) : null}
      </div>
    </div>
  )
}
