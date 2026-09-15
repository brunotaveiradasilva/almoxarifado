import { useMemo, useState } from 'react'
import { EstadoVazio } from './EstadoVazio'
import { ROTULO_UNIDADE_META } from '../lib/unidadeMeta'
import type { Meta, MetaRepresentante, Representante } from '../types'

interface Props {
  representantes: Representante[]
  metas: Meta[]
  metasRepresentante: MetaRepresentante[]
}

/** Só visualização: metas de todos os fornecedores para quem o representante escolhido trabalha. Editar é na tela "Metas por fornecedor". */
export function ConsultaMetasPorRepresentante({ representantes, metas, metasRepresentante }: Props) {
  const [representanteId, setRepresentanteId] = useState(representantes[0]?.id ?? '')
  const representante = representantes.find((v) => v.id === representanteId) ?? null

  const metasDoRepresentante = useMemo(() => {
    if (!representante) return []
    const fornecedorIds = new Set(representante.fornecedores.map((f) => f.id))
    return metas.filter((m) => fornecedorIds.has(m.fornecedor.id))
  }, [representante, metas])

  if (!representantes.length) {
    return <EstadoVazio titulo="Nenhum representante cadastrado" texto="Cadastre um representante pra consultar as metas dele." />
  }

  return (
    <div>
      <div className="field consulta-filtro">
        <label htmlFor="cv-representante">Representante</label>
        <select id="cv-representante" value={representanteId} onChange={(e) => setRepresentanteId(e.target.value)}>
          {representantes.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nome}
            </option>
          ))}
        </select>
      </div>

      {representante ? (
        <p className="hint consulta-info">
          Fornecedores: {representante.fornecedores.map((f) => f.nome).join(', ') || '—'}
          {representante.email ? ` · ${representante.email}` : ''}
          {representante.celular ? ` · ${representante.celular}` : ''}
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
            {metasDoRepresentante.map((meta) => {
              const atribuicao =
                metasRepresentante.find((mv) => mv.representante.id === representanteId && mv.meta.id === meta.id) ?? null
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

        {!metasDoRepresentante.length ? (
          <EstadoVazio
            titulo="Nenhuma meta pra esse representante"
            texto="Nenhum dos fornecedores desse representante tem meta cadastrada ainda."
          />
        ) : null}
      </div>
    </div>
  )
}
