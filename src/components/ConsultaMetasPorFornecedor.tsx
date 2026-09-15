import { useMemo, useState } from 'react'
import { EstadoVazio } from './EstadoVazio'
import { LinhaMetaRepresentante } from './LinhaMetaRepresentante'
import { ROTULO_UNIDADE_META } from '../lib/unidadeMeta'
import type { MetaRepresentanteEntrada } from '../lib/api'
import type { Fornecedor, Meta, MetaRepresentante, Representante } from '../types'

interface Props {
  fornecedores: Fornecedor[]
  representantes: Representante[]
  metas: Meta[]
  metasRepresentante: MetaRepresentante[]
  aoSalvar: (mv: MetaRepresentanteEntrada, id?: string | null) => Promise<MetaRepresentante>
}

/** Metas e representantes de um fornecedor escolhido — o valor de meta de cada representante dá pra editar direto aqui. */
export function ConsultaMetasPorFornecedor({ fornecedores, representantes, metas, metasRepresentante, aoSalvar }: Props) {
  const [fornecedorId, setFornecedorId] = useState(fornecedores[0]?.id ?? '')

  const metasDoFornecedor = useMemo(
    () => metas.filter((m) => m.fornecedor.id === fornecedorId),
    [metas, fornecedorId],
  )

  const representantesDoFornecedor = useMemo(
    () => representantes.filter((v) => v.fornecedores.some((f) => f.id === fornecedorId)),
    [representantes, fornecedorId],
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

      <h3 className="consulta-subtitulo">Representantes</h3>

      {!representantesDoFornecedor.length ? (
        <div className="table-wrap">
          <EstadoVazio
            titulo="Nenhum representante pra esse fornecedor"
            texto="Nenhum representante trabalha pra esse fornecedor ainda."
          />
        </div>
      ) : !metasDoFornecedor.length ? (
        <p className="hint">Cadastre uma meta pra esse fornecedor pra poder atribuir valores aos representantes.</p>
      ) : (
        representantesDoFornecedor.map((v) => (
          <div key={v.id} className="bloco-representante">
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
                    <LinhaMetaRepresentante
                      key={`${v.id}:${meta.id}`}
                      representanteId={v.id}
                      meta={meta}
                      atribuicao={metasRepresentante.find((mv) => mv.representante.id === v.id && mv.meta.id === meta.id) ?? null}
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
