import { useMemo, useState } from 'react'
import { EstadoVazio } from './EstadoVazio'
import { useComparativoVendas } from '../hooks/useComparativoVendas'
import {
  METRICAS,
  TIPOS_COMPARACAO,
  UNIDADE_DA_METRICA,
  mesesDoFiltro,
  periodosDaComparacao,
  rotuloPeriodo,
  variacao,
  type Metrica,
  type Periodo,
  type TipoComparacao,
} from '../lib/comparativo'
import { mesAtual, rotuloMesCurto } from '../lib/mes'
import { formatarValorMeta } from '../lib/unidadeMeta'
import type { ValoresVenda } from '../types'

const TODOS = ''
const ZERO: ValoresVenda = { valor: 0, kg: 0, clientes: 0 }

interface Linha {
  codigoAds: string
  nome: string
  atual: ValoresVenda
  anterior: ValoresVenda
}

/**
 * Aba Dados: quanto cada representante vendeu num período comparado com outro — mês contra o mesmo
 * mês do ano passado, contra o mês anterior, acumulado do ano ou dois períodos livres. Os números
 * vêm direto da ADS (não do que foi sincronizado nas metas), então vale pra qualquer mês passado.
 */
export function ConsultaComparativoVendas() {
  const [tipo, setTipo] = useState<TipoComparacao>('mesAnoAnterior')
  const [mes, setMes] = useState(mesAtual)
  const [mesmoDia, setMesmoDia] = useState(true)
  // Preenchidos com os períodos da comparação que estava escolhida quando a pessoa passa pra "Períodos livres".
  const [livreAtual, setLivreAtual] = useState<Periodo>({ inicio: '', fim: '' })
  const [livreAnterior, setLivreAnterior] = useState<Periodo>({ inicio: '', fim: '' })
  const [representante, setRepresentante] = useState(TODOS)
  const [fornecedorId, setFornecedorId] = useState(TODOS)
  const [metrica, setMetrica] = useState<Metrica>('valor')

  const periodos = useMemo(
    () =>
      tipo === 'personalizado'
        ? { atual: livreAtual, anterior: livreAnterior }
        : periodosDaComparacao(tipo, mes, mesmoDia),
    [tipo, mes, mesmoDia, livreAtual, livreAnterior],
  )

  const comp = useComparativoVendas(periodos.atual, periodos.anterior, fornecedorId)
  const meses = useMemo(() => mesesDoFiltro(), [])

  /** Cada representante que vendeu em algum dos dois períodos, casado pelo código ADS. */
  const linhas = useMemo<Linha[]>(() => {
    if (!comp.dados) return []
    const porCodigo = new Map<string, Linha>()
    for (const r of comp.dados.anterior.representantes) {
      porCodigo.set(r.codigoAds, { codigoAds: r.codigoAds, nome: r.nome, atual: ZERO, anterior: r.valores })
    }
    for (const r of comp.dados.atual.representantes) {
      const existente = porCodigo.get(r.codigoAds)
      porCodigo.set(r.codigoAds, { codigoAds: r.codigoAds, nome: r.nome, atual: r.valores, anterior: existente?.anterior ?? ZERO })
    }
    return [...porCodigo.values()]
  }, [comp.dados])

  const opcoesRepresentante = useMemo(
    () => [...linhas].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [linhas],
  )

  const visiveis = useMemo(() => {
    const filtradas = representante === TODOS ? linhas : linhas.filter((l) => l.codigoAds === representante)
    return [...filtradas].sort(
      (a, b) => b.atual[metrica] - a.atual[metrica] || b.anterior[metrica] - a.anterior[metrica] || a.nome.localeCompare(b.nome, 'pt-BR'),
    )
  }, [linhas, representante, metrica])

  // Clientes do total vêm prontos da API: somar os de cada representante contaria duas vezes quem compra de dois.
  const resumo =
    representante === TODOS
      ? { atual: comp.dados?.atual.total ?? ZERO, anterior: comp.dados?.anterior.total ?? ZERO }
      : { atual: visiveis[0]?.atual ?? ZERO, anterior: visiveis[0]?.anterior ?? ZERO }

  const unidade = UNIDADE_DA_METRICA[metrica]
  const rotuloAtual = rotuloPeriodo(periodos.atual)
  const rotuloAnterior = rotuloPeriodo(periodos.anterior)
  const mesEmAndamento = tipo !== 'personalizado' && mes === mesAtual()
  const nomeRepresentante = linhas.find((l) => l.codigoAds === representante)?.nome

  function mudarTipo(novo: TipoComparacao) {
    if (novo === 'personalizado' && tipo !== 'personalizado') {
      setLivreAtual(periodos.atual)
      setLivreAnterior(periodos.anterior)
    }
    setTipo(novo)
  }

  return (
    <div className={comp.carregando ? 'comparativo is-carregando' : 'comparativo'}>
      {comp.erro ? (
        <div className="banner-erro" role="alert">
          <span>{comp.erro}</span>
          <button className="btn" onClick={comp.tentarNovamente}>
            Tentar de novo
          </button>
        </div>
      ) : null}

      <div className="consulta-filtros">
        <div className="field consulta-filtro">
          <label htmlFor="dados-tipo">Comparação</label>
          <select id="dados-tipo" value={tipo} onChange={(e) => mudarTipo(e.target.value as TipoComparacao)}>
            {TIPOS_COMPARACAO.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.rotulo}
              </option>
            ))}
          </select>
        </div>

        {tipo !== 'personalizado' ? (
          <div className="field consulta-filtro consulta-filtro-mes">
            <label htmlFor="dados-mes">{tipo === 'acumuladoAno' ? 'Até o mês' : 'Mês'}</label>
            <select id="dados-mes" value={mes} onChange={(e) => setMes(e.target.value)}>
              {meses.map((m) => (
                <option key={m} value={m}>
                  {rotuloMesCurto(m)}
                  {m === mesAtual() ? ' (atual)' : ''}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <IntervaloDatas id="dados-atual" rotulo="Período" periodo={livreAtual} aoMudar={setLivreAtual} />
            <IntervaloDatas id="dados-anterior" rotulo="Comparar com" periodo={livreAnterior} aoMudar={setLivreAnterior} />
          </>
        )}

        {mesEmAndamento ? (
          <label className="comparativo-check">
            <input type="checkbox" checked={mesmoDia} onChange={(e) => setMesmoDia(e.target.checked)} />
            Comparar até o mesmo dia
          </label>
        ) : null}
      </div>

      <div className="consulta-filtros">
        <div className="field consulta-filtro">
          <label htmlFor="dados-representante">Representante</label>
          <select id="dados-representante" value={representante} onChange={(e) => setRepresentante(e.target.value)}>
            <option value={TODOS}>Todos os representantes</option>
            {opcoesRepresentante.map((l) => (
              <option key={l.codigoAds} value={l.codigoAds}>
                {l.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="field consulta-filtro">
          <label htmlFor="dados-fornecedor">Fornecedor</label>
          <select id="dados-fornecedor" value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)}>
            <option value={TODOS}>Todos os fornecedores</option>
            {comp.fornecedores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="field comparativo-metrica">
          <span className="comparativo-metrica-rotulo" id="dados-metrica">
            Métrica
          </span>
          <div className="filters" role="group" aria-labelledby="dados-metrica">
            {METRICAS.map((m) => (
              <button key={m.valor} aria-pressed={metrica === m.valor} onClick={() => setMetrica(m.valor)}>
                {m.rotulo}
              </button>
            ))}
          </div>
        </div>
      </div>

      {comp.erroPeriodo ? (
        <p className="hint warn comparativo-aviso">{comp.erroPeriodo}</p>
      ) : !comp.dados ? (
        <EstadoVazio titulo="Buscando na ADS…" texto="Somando as vendas dos dois períodos. Um ano inteiro pode levar alguns segundos." />
      ) : (
        <>
          <div className="stats meta-kpis meta-kpis-largo">
            <div className="stat">
              <span className="label">{rotuloAtual}</span>
              <span className="value">{formatarValorMeta(resumo.atual[metrica], unidade)}</span>
            </div>
            <div className="stat">
              <span className="label">{rotuloAnterior}</span>
              <span className="value">{formatarValorMeta(resumo.anterior[metrica], unidade)}</span>
            </div>
            <div className="stat">
              <span className="label">Variação</span>
              <span className="value">
                <Variacao atual={resumo.atual[metrica]} anterior={resumo.anterior[metrica]} />
              </span>
              <span className="note">{diferenca(resumo.atual[metrica], resumo.anterior[metrica], unidade)}</span>
            </div>
          </div>

          <div className="meta-card">
            <div className="meta-card-head">
              <h3>{nomeRepresentante ?? 'Por representante'}</h3>
              <span className="meta-badge">{comp.carregando ? 'Atualizando…' : `${rotuloAtual} × ${rotuloAnterior}`}</span>
            </div>
            {visiveis.length ? (
              <div className="table-scroll">
                <div className="table-wrap">
                  <table className="tabela-comparativo">
                    <thead>
                      <tr>
                        <th>Representante</th>
                        <th className="num">{rotuloAnterior}</th>
                        <th className="num">{rotuloAtual}</th>
                        <th className="num">Diferença</th>
                        <th className="num">Variação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visiveis.map((l) => (
                        <tr key={l.codigoAds}>
                          <td className="cell-material">{l.nome}</td>
                          <td className="num">{formatarValorMeta(l.anterior[metrica], unidade)}</td>
                          <td className="num">{formatarValorMeta(l.atual[metrica], unidade)}</td>
                          <td className="num">{diferenca(l.atual[metrica], l.anterior[metrica], unidade)}</td>
                          <td className="num">
                            <Variacao atual={l.atual[metrica]} anterior={l.anterior[metrica]} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {representante === TODOS && visiveis.length > 1 ? (
                      <tfoot>
                        <tr>
                          <td>Total</td>
                          <td className="num">{formatarValorMeta(resumo.anterior[metrica], unidade)}</td>
                          <td className="num">{formatarValorMeta(resumo.atual[metrica], unidade)}</td>
                          <td className="num">{diferenca(resumo.atual[metrica], resumo.anterior[metrica], unidade)}</td>
                          <td className="num">
                            <Variacao atual={resumo.atual[metrica]} anterior={resumo.anterior[metrica]} />
                          </td>
                        </tr>
                      </tfoot>
                    ) : null}
                  </table>
                </div>
              </div>
            ) : (
              <EstadoVazio titulo="Nenhuma venda" texto="Nada vendido nesses dois períodos com esses filtros." />
            )}
          </div>
          {metrica === 'clientes' && representante === TODOS ? (
            <p className="hint comparativo-aviso">
              No total, cada cliente conta uma vez só — por isso ele pode ser menor que a soma dos representantes.
            </p>
          ) : null}
        </>
      )}
    </div>
  )
}

function IntervaloDatas({
  id,
  rotulo,
  periodo,
  aoMudar,
}: {
  id: string
  rotulo: string
  periodo: Periodo
  aoMudar: (p: Periodo) => void
}) {
  return (
    <div className="field consulta-filtro comparativo-intervalo">
      <label htmlFor={`${id}-inicio`}>{rotulo}</label>
      <div className="comparativo-intervalo-datas">
        <input
          id={`${id}-inicio`}
          type="date"
          aria-label={`${rotulo}: início`}
          value={periodo.inicio}
          onChange={(e) => aoMudar({ ...periodo, inicio: e.target.value })}
        />
        <span aria-hidden="true">a</span>
        <input
          type="date"
          aria-label={`${rotulo}: fim`}
          value={periodo.fim}
          onChange={(e) => aoMudar({ ...periodo, fim: e.target.value })}
        />
      </div>
    </div>
  )
}

function diferenca(atual: number, anterior: number, unidade: (typeof UNIDADE_DA_METRICA)[Metrica]): string {
  const d = atual - anterior
  return `${d > 0 ? '+' : d < 0 ? '−' : ''}${formatarValorMeta(Math.abs(d), unidade)}`
}

/** "▲ 12,4%" verde, "▼ 3,0%" vermelho; "novo" quando o período anterior não teve venda. */
function Variacao({ atual, anterior }: { atual: number; anterior: number }) {
  const pct = variacao(atual, anterior)
  if (pct === null) {
    return atual > 0 ? <span className="variacao is-alta">novo</span> : <span className="variacao">—</span>
  }
  const classe = pct > 0.05 ? ' is-alta' : pct < -0.05 ? ' is-baixa' : ''
  const seta = pct > 0.05 ? '▲ ' : pct < -0.05 ? '▼ ' : ''
  return (
    <span className={`variacao${classe}`}>
      {seta}
      {Math.abs(pct).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
    </span>
  )
}
