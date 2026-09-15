import { useMemo, useState } from 'react'
import { EstadoVazio } from './EstadoVazio'
import { LinhaMetaVendedor } from './LinhaMetaVendedor'
import { ROTULO_UNIDADE_META } from '../lib/unidadeMeta'
import type { MetaVendedorEntrada } from '../lib/api'
import type { Fornecedor, Meta, MetaVendedor, Vendedor } from '../types'

interface Props {
  fornecedores: Fornecedor[]
  vendedores: Vendedor[]
  metas: Meta[]
  metasVendedor: MetaVendedor[]
  aoSalvar: (mv: MetaVendedorEntrada, id?: string | null) => Promise<MetaVendedor>
}

/** Metas e vendedores de um fornecedor escolhido — o valor de meta de cada vendedor dá pra editar direto aqui. */
export function ConsultaMetasPorFornecedor({ fornecedores, vendedores, metas, metasVendedor, aoSalvar }: Props) {
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

      {!vendedoresDoFornecedor.length ? (
        <div className="table-wrap">
          <EstadoVazio
            titulo="Nenhum vendedor pra esse fornecedor"
            texto="Nenhum vendedor trabalha pra esse fornecedor ainda."
          />
        </div>
      ) : !metasDoFornecedor.length ? (
        <p className="hint">Cadastre uma meta pra esse fornecedor pra poder atribuir valores aos vendedores.</p>
      ) : (
        vendedoresDoFornecedor.map((v) => (
          <div key={v.id} className="bloco-vendedor">
            <p className="consulta-info">
              <strong>{v.nome}</strong>
              {v.email ? ` · ${v.email}` : ''}
              {v.celular ? ` · ${v.celular}` : ''}
            </p>
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
                  {metasDoFornecedor.map((meta) => (
                    <LinhaMetaVendedor
                      key={`${v.id}:${meta.id}`}
                      vendedorId={v.id}
                      meta={meta}
                      atribuicao={metasVendedor.find((mv) => mv.vendedor.id === v.id && mv.meta.id === meta.id) ?? null}
                      aoSalvar={aoSalvar}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
