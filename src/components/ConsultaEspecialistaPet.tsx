import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { EstadoVazio } from './EstadoVazio'
import { SeletorMes } from './SeletorMes'
import { useEspecialistaPet } from '../hooks/useEspecialistaPet'
import { descontoEspecialistaPet, lerPlanilhaEspecialistaPet, mesDoNomeDaPlanilha } from '../lib/especialistaPet'
import { mesAtual, rotuloMes, rotuloMesCurto } from '../lib/mes'
import { formatarValorMeta } from '../lib/unidadeMeta'
import type { ClienteEspecialistaPet } from '../types'

const TODOS = ''

interface Resumo {
  clientes: number
  metaFoco: number
  realizadoFoco: number
  metaTotal: number
  realizadoTotal: number
  bateramTotal: number
  bateramFoco: number
  desconto: number
}

function resumir(clientes: ClienteEspecialistaPet[]): Resumo {
  return clientes.reduce<Resumo>(
    (r, c) => ({
      clientes: r.clientes + 1,
      metaFoco: r.metaFoco + c.metaFoco,
      realizadoFoco: r.realizadoFoco + c.realizadoFoco,
      metaTotal: r.metaTotal + c.metaTotal,
      realizadoTotal: r.realizadoTotal + c.realizadoTotal,
      bateramTotal: r.bateramTotal + (c.metaTotal > 0 && c.realizadoTotal >= c.metaTotal ? 1 : 0),
      bateramFoco: r.bateramFoco + (c.metaFoco > 0 && c.realizadoFoco >= c.metaFoco ? 1 : 0),
      desconto: r.desconto + descontoEspecialistaPet(c).valor,
    }),
    { clientes: 0, metaFoco: 0, realizadoFoco: 0, metaTotal: 0, realizadoTotal: 0, bateramTotal: 0, bateramFoco: 0, desconto: 0 },
  )
}

/**
 * Campanha Especialista Pet: metas por cliente vindas da planilha da PremieR (produto foco NATTU e
 * todos os SKUs, em kg) e o realizado da ADS. Com "Todos" mostra um resumo por representante;
 * escolhendo um, os clientes dele.
 */
export function ConsultaEspecialistaPet() {
  const esp = useEspecialistaPet()
  const [mes, setMes] = useState(mesAtual)
  const [representante, setRepresentante] = useState(TODOS)
  const entradaArquivo = useRef<HTMLInputElement>(null)

  const doMes = useMemo(() => esp.clientes.filter((c) => c.mes === mes), [esp.clientes, mes])
  const mesesComDados = useMemo(() => [...new Set(esp.clientes.map((c) => c.mes))], [esp.clientes])
  const representantes = useMemo(
    () => [...new Set(doMes.map((c) => c.representante))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [doMes],
  )
  const visiveis = representante === TODOS ? doMes : doMes.filter((c) => c.representante === representante)
  const resumo = resumir(visiveis)

  const porRepresentante = useMemo(
    () => representantes.map((nome) => ({ nome, resumo: resumir(doMes.filter((c) => c.representante === nome)) })),
    [representantes, doMes],
  )

  const clientesOrdenados = useMemo(
    () => [...visiveis].sort((a, b) => b.metaTotal - a.metaTotal || a.nome.localeCompare(b.nome, 'pt-BR')),
    [visiveis],
  )

  async function escolherArquivo(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    let linhas
    try {
      linhas = await lerPlanilhaEspecialistaPet(arquivo)
    } catch (erro) {
      esp.setErro(erro instanceof Error ? erro.message : 'Não deu pra ler essa planilha.')
      return
    }
    const destino = mesDoNomeDaPlanilha(arquivo.name) ?? mes
    const jaTem = esp.clientes.some((c) => c.mes === destino)
    const aviso =
      `Importar ${linhas.length} clientes para ${rotuloMes(destino)}?` +
      (jaTem ? '\n\nOs clientes já importados desse mês serão substituídos pelos da planilha.' : '')
    if (!window.confirm(aviso)) return
    setMes(destino)
    setRepresentante(TODOS)
    await esp.importar(destino, linhas)
  }

  function mudarMes(novo: string) {
    setMes(novo)
    setRepresentante(TODOS)
  }

  return (
    <div>
      {esp.erro ? (
        <div className="banner-erro" role="alert">
          <span>{esp.erro}</span>
          <button className="btn" onClick={esp.tentarNovamente}>
            Tentar de novo
          </button>
        </div>
      ) : null}

      <div className="consulta-filtros">
        <div className="field consulta-filtro">
          <label htmlFor="ep-representante">Representante</label>
          <select id="ep-representante" value={representante} onChange={(e) => setRepresentante(e.target.value)}>
            <option value={TODOS}>Todos os representantes</option>
            {representantes.map((nome) => (
              <option key={nome} value={nome}>
                {nome}
              </option>
            ))}
          </select>
        </div>
        <SeletorMes id="ep-mes" mes={mes} mesesComDados={mesesComDados} aoMudar={mudarMes} />
        <div className="consulta-acoes">
          <button className="btn" disabled={esp.ocupado !== null} onClick={() => entradaArquivo.current?.click()}>
            {esp.ocupado === 'importando' ? 'Importando…' : 'Importar planilha'}
          </button>
          <button className="btn" disabled={esp.ocupado !== null || !doMes.length} onClick={() => esp.sincronizar(mes)}>
            {esp.ocupado === 'sincronizando' ? 'Sincronizando…' : 'Sincronizar com a ADS'}
          </button>
          <input
            ref={entradaArquivo}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            hidden
            onChange={escolherArquivo}
          />
        </div>
      </div>

      {esp.carregando && !esp.clientes.length ? (
        <EstadoVazio titulo="Carregando…" texto="Buscando os dados salvos no servidor." />
      ) : !doMes.length ? (
        <EstadoVazio
          titulo={`Nenhuma planilha em ${rotuloMesCurto(mes)}`}
          texto="Importe a planilha de acompanhamento da PremieR (a aba CNPJ, com as metas por cliente). O realizado vem da ADS."
        >
          <button className="btn btn-primary" disabled={esp.ocupado !== null} onClick={() => entradaArquivo.current?.click()}>
            Importar planilha
          </button>
        </EstadoVazio>
      ) : (
        <>
          <div className="stats meta-kpis meta-kpis-largo">
            <div className="stat">
              <span className="label">Bateram todos os SKUs</span>
              <span className="value">
                {resumo.bateramTotal}/{resumo.clientes}
              </span>
            </div>
            <div className="stat">
              <span className="label">Bateram o produto foco</span>
              <span className="value">
                {resumo.bateramFoco}/{resumo.clientes}
              </span>
            </div>
            <div className="stat">
              <span className="label">Desconto conquistado</span>
              <span className="value">{formatarValorMeta(resumo.desconto, 'REAL')}</span>
            </div>
          </div>

          {representante === TODOS ? (
            <div className="meta-card">
              <div className="meta-card-head">
                <h3>Por representante</h3>
                <span className="meta-badge">{rotuloMesCurto(mes)}</span>
              </div>
              <div className="table-scroll">
                <div className="table-wrap">
                  <table className="tabela-especialista-pet ep-por-representante">
                    <thead>
                      <tr>
                        <th>Representante</th>
                        <th className="num">Clientes</th>
                        <th className="num">Foco (NATTU)</th>
                        <th className="num">Todos os SKUs</th>
                        <th className="num">Bateram</th>
                        <th className="num">Desconto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {porRepresentante.map(({ nome, resumo: r }) => (
                        <tr key={nome} className="linha-clicavel" onClick={() => setRepresentante(nome)}>
                          <td className="cell-material">{nome}</td>
                          <td className="num">{r.clientes}</td>
                          <td className="num">
                            <Progresso meta={r.metaFoco} realizado={r.realizadoFoco} />
                          </td>
                          <td className="num">
                            <Progresso meta={r.metaTotal} realizado={r.realizadoTotal} />
                          </td>
                          <td className="num">
                            {r.bateramTotal}/{r.clientes}
                          </td>
                          <td className="num">{formatarValorMeta(r.desconto, 'REAL')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}

          <div className="meta-card">
            <div className="meta-card-head">
              <h3>{representante === TODOS ? 'Todos os clientes' : `Clientes de ${representante}`}</h3>
              <span className="meta-badge">{rotuloMesCurto(mes)}</span>
            </div>
            <div className="table-scroll">
              <div className="table-wrap">
                <table className="tabela-especialista-pet ep-clientes">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th className="num">Foco (NATTU)</th>
                      <th className="num">Todos os SKUs</th>
                      <th className="num">Desconto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesOrdenados.map((c) => {
                      const desconto = descontoEspecialistaPet(c)
                      return (
                        <tr key={c.id}>
                          <td className="cell-material">
                            {c.nome}
                            <span className="meta-em-reais">
                              {c.codigoCliente} · {c.classificacao.toLowerCase() || 'sem classificação'}
                              {representante === TODOS ? ` · ${c.representante}` : ''}
                            </span>
                          </td>
                          <td className="num">
                            <Progresso meta={c.metaFoco} realizado={c.realizadoFoco} />
                          </td>
                          <td className="num">
                            <Progresso meta={c.metaTotal} realizado={c.realizadoTotal} />
                            <span className="meta-em-reais">{formatarValorMeta(c.realizadoReais, 'REAL')}</span>
                          </td>
                          <td className="num">
                            {desconto.percentual ? (
                              <>
                                {formatarValorMeta(desconto.valor, 'REAL')}
                                <span className="meta-em-reais">{desconto.percentual}%</span>
                              </>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/** "12,5 / 45,0 kg" em cima da barra de progresso, como nas metas dos representantes. */
function Progresso({ meta, realizado }: { meta: number; realizado: number }) {
  const percentual = meta > 0 ? (realizado / meta) * 100 : null
  return (
    <div className="ep-progresso">
      <span className="ep-progresso-valores">
        {realizado.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} /{' '}
        {formatarValorMeta(meta, 'KG')}
      </span>
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
    </div>
  )
}
