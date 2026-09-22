import { useMemo, useState } from 'react'
import { EstadoVazio } from './EstadoVazio'
import { ROTULO_UNIDADE_META } from '../lib/unidadeMeta'
import type { Meta, MetaRepresentante, Representante } from '../types'

interface Props {
  representantes: Representante[]
  metas: Meta[]
  metasRepresentante: MetaRepresentante[]
}

/** Só visualização: metas de todos os fornecedores para quem o representante escolhido trabalha. Editar é na tela "Meta Fornecedor". */
export function ConsultaMetasPorRepresentante({ representantes, metas, metasRepresentante }: Props) {
  const [representanteId, setRepresentanteId] = useState(representantes[0]?.id ?? '')
  const representante = representantes.find((v) => v.id === representanteId) ?? null

  const linhas = useMemo(() => {
    if (!representante) return []
    const fornecedorIds = new Set(representante.fornecedores.map((f) => f.id))
    return metas
      .filter((m) => fornecedorIds.has(m.fornecedor.id))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }))
      .map((meta) => {
        const atribuicao =
          metasRepresentante.find((mv) => mv.representante.id === representanteId && mv.meta.id === meta.id) ?? null
        const valorMeta = atribuicao?.valorMeta ?? 0
        const valorRealizado = atribuicao?.valorRealizado ?? 0
        const falta = valorMeta - valorRealizado
        const percentual = valorMeta > 0 ? (valorRealizado / valorMeta) * 100 : null
        return { meta, atribuicao, valorMeta, valorRealizado, falta, percentual }
      })
  }, [representante, metas, metasRepresentante, representanteId])

  const comMeta = linhas.filter((l) => l.percentual !== null)
  const progressoMedio = comMeta.length
    ? comMeta.reduce((soma, l) => soma + Math.min(l.percentual!, 100), 0) / comMeta.length
    : null
  const totalVendido = representante?.totalVendidoAds ?? 0

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
          Fornecedores associados: <strong>{representante.fornecedores.map((f) => f.nome).join(', ') || '—'}</strong>
          {representante.email ? ` · ${representante.email}` : ''}
          {representante.celular ? ` · ${representante.celular}` : ''}
        </p>
      ) : null}

      {comMeta.length ? (
        <div className="stats meta-kpis">
          <div className="stat">
            <span className="label">Progresso médio</span>
            <span className="value">
              {progressoMedio === null ? '—' : `${progressoMedio.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%`}
            </span>
            <span className="note">média das metas atribuídas</span>
          </div>
          <div className="stat">
            <span className="label">Total vendido</span>
            <span className="value">
              {totalVendido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            <span className="note">tudo vendido no mês, todos os fornecedores</span>
          </div>
        </div>
      ) : null}

      <div className="meta-card">
        <div className="meta-card-head">
          <h3>Metas de {representante?.nome ?? '—'}</h3>
          <span className="meta-badge">Período atual</span>
        </div>

        <div className="table-scroll">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Meta</th>
                  <th>Unidade</th>
                  <th className="num">Meta</th>
                  <th className="num">Realizado</th>
                  <th className="num">Falta</th>
                  <th className="num">Progresso</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map(({ meta, atribuicao, valorMeta, valorRealizado, falta, percentual }) => (
                  <tr key={meta.id}>
                    <td className="cell-material">{meta.nome}</td>
                    <td>{ROTULO_UNIDADE_META[meta.unidade]}</td>
                    <td className="num">{atribuicao ? valorMeta.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '—'}</td>
                    <td className="num">{atribuicao ? valorRealizado.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '—'}</td>
                    <td className="num">{atribuicao ? falta.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '—'}</td>
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
                ))}
              </tbody>
            </table>

            {!linhas.length ? (
              <EstadoVazio
                titulo="Nenhuma meta pra esse representante"
                texto="Nenhum dos fornecedores desse representante tem meta cadastrada ainda."
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
