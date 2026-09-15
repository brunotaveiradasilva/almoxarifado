import { useMemo, useState } from 'react'
import { useAlmoxarifado } from '../hooks/useAlmoxarifado'
import { calcularResumo, filtrarAgendamentos } from '../lib/regras'
import { PainelResumo } from './PainelResumo'
import { EstadoVazio } from './EstadoVazio'
import { TabelaAgendamentos } from './TabelaAgendamentos'
import { TabelaMateriais } from './TabelaMateriais'
import { FormularioAgendamento } from './FormularioAgendamento'
import { FormularioMaterial } from './FormularioMaterial'
import { FormularioTrocarSenha } from './FormularioTrocarSenha'
import { PainelUsuarios } from './PainelUsuarios'
import { PainelMetas } from './PainelMetas'
import type { Agendamento, Filtro, Material } from '../types'

interface Props {
  usuario: string
  isAdmin: boolean
  aoSair: () => void
}

const FILTROS: { valor: Filtro; rotulo: string }[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'atrasado', rotulo: 'Atrasados' },
  { valor: 'agendado', rotulo: 'Agendados' },
  { valor: 'retirado', rotulo: 'Em posse' },
  { valor: 'devolvido', rotulo: 'Devolvidos' },
]

/** Tudo que só existe depois do login: só monta (e só busca dados da API) quem já está autenticado. */
export function PainelAlmoxarifado({ usuario, isAdmin, aoSair }: Props) {
  const app = useAlmoxarifado()

  const [aba, setAba] = useState<'agenda' | 'materiais' | 'metas'>('agenda')
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [buscaAgenda, setBuscaAgenda] = useState('')
  const [buscaMaterial, setBuscaMaterial] = useState('')

  const [dialogoAgendamento, setDialogoAgendamento] = useState<{
    aberto: boolean
    agendamento: Agendamento | null
    materialInicial?: string
  }>({ aberto: false, agendamento: null })

  const [dialogoMaterial, setDialogoMaterial] = useState<{ aberto: boolean; material: Material | null }>({
    aberto: false,
    material: null,
  })

  const [dialogoSenha, setDialogoSenha] = useState(false)
  const [dialogoUsuarios, setDialogoUsuarios] = useState(false)

  const primeiraCarga = app.carregando && !app.materiais.length && !app.agendamentos.length

  const resumo = useMemo(() => calcularResumo(app.agendamentos), [app.agendamentos])

  const agendamentosVisiveis = useMemo(
    () => filtrarAgendamentos(app.agendamentos, app.materiais, filtro, buscaAgenda),
    [app.agendamentos, app.materiais, filtro, buscaAgenda],
  )

  const materiaisOrdenados = useMemo(
    () => [...app.materiais].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [app.materiais],
  )

  const materiaisVisiveis = useMemo(() => {
    const termo = buscaMaterial.trim().toLowerCase()
    return materiaisOrdenados.filter((m) => !termo || `${m.nome} ${m.codigo}`.toLowerCase().includes(termo))
  }, [materiaisOrdenados, buscaMaterial])

  function abrirAgendamento(agendamento: Agendamento | null, materialInicial?: string) {
    if (!app.materiais.length) {
      setAba('materiais')
      setDialogoMaterial({ aberto: true, material: null })
      return
    }
    setDialogoAgendamento({ aberto: true, agendamento, materialInicial })
  }

  function excluirMaterial(material: Material) {
    const usos = app.agendamentos.filter((a) => a.materialId === material.id).length
    const aviso = `Este material tem ${usos} agendamento(s). Excluir mesmo assim? Os agendamentos continuam na lista, sem o material.`
    if (usos && !window.confirm(aviso)) return
    app.removerMaterial(material.id)
  }

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <h1>Almoxarifado em Agenda</h1>
          <span className="sub">controle de retiradas</span>
        </div>
        <nav className="tabs" role="tablist">
          <button role="tab" aria-selected={aba === 'agenda'} onClick={() => setAba('agenda')}>
            Agendamentos
          </button>
          <button role="tab" aria-selected={aba === 'materiais'} onClick={() => setAba('materiais')}>
            Materiais
          </button>
          {isAdmin ? (
            <button role="tab" aria-selected={aba === 'metas'} onClick={() => setAba('metas')}>
              Metas
            </button>
          ) : null}
        </nav>
        <div className="session">
          <span className="session-usuario">{usuario}</span>
          {isAdmin ? (
            <button className="btn btn-sm btn-ghost" onClick={() => setDialogoUsuarios(true)}>
              Usuários
            </button>
          ) : null}
          <button className="btn btn-sm btn-ghost" onClick={() => setDialogoSenha(true)}>
            Trocar senha
          </button>
          <button className="btn btn-sm" onClick={aoSair}>
            Sair
          </button>
        </div>
      </header>

      <main>
        {app.erro ? (
          <div className="banner-erro" role="alert">
            <span>{app.erro}</span>
            <button className="btn" onClick={app.tentarNovamente}>
              Tentar de novo
            </button>
          </div>
        ) : null}

        {primeiraCarga ? (
          <EstadoVazio titulo="Carregando…" texto="Buscando os dados salvos no servidor." />
        ) : aba === 'agenda' ? (
          <section className="view" role="tabpanel">
            <div className="view-head">
              <div>
                <h2>Agendamentos</h2>
                <p>
                  Quem levou o quê, quando leva e quando devolve. Itens com devolução vencida sobem marcados
                  como atrasados.
                </p>
              </div>
              <button className="btn btn-primary" onClick={() => abrirAgendamento(null)}>
                + Novo agendamento
              </button>
            </div>

            <PainelResumo resumo={resumo} />

            <div className="toolbar">
              <input
                className="search"
                type="search"
                placeholder="Buscar por material, responsável, cliente ou observação…"
                aria-label="Buscar agendamentos"
                value={buscaAgenda}
                onChange={(e) => setBuscaAgenda(e.target.value)}
              />
              <div className="filters">
                {FILTROS.map((f) => (
                  <button key={f.valor} aria-pressed={filtro === f.valor} onClick={() => setFiltro(f.valor)}>
                    {f.rotulo}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Material</th>
                    <th className="num">Qtd.</th>
                    <th>Responsável</th>
                    <th>Cliente</th>
                    <th>Retirada</th>
                    <th>Devolução</th>
                    <th>Status</th>
                    <th>Observação</th>
                    <th />
                  </tr>
                </thead>
                <TabelaAgendamentos
                  agendamentos={agendamentosVisiveis}
                  materiais={app.materiais}
                  aoMudarStatus={app.definirStatus}
                  aoEditar={(a) => abrirAgendamento(a)}
                  aoExcluir={app.removerAgendamento}
                />
              </table>

              {!agendamentosVisiveis.length && app.agendamentos.length ? (
                <EstadoVazio titulo="Nada aqui com esses filtros" texto="Ajuste a busca ou volte para “Todos”." />
              ) : null}

              {!app.agendamentos.length ? (
                <EstadoVazio
                  titulo={app.materiais.length ? 'Nenhum agendamento ainda' : 'Comece pelo cadastro de materiais'}
                  texto={
                    app.materiais.length
                      ? 'Registre a primeira retirada: material, quantidade, responsável e as duas datas.'
                      : 'Cadastre os materiais que podem ser retirados e depois agende as retiradas.'
                  }
                >
                  <button className="btn btn-primary" onClick={() => abrirAgendamento(null)}>
                    {app.materiais.length ? '+ Novo agendamento' : '+ Cadastrar material'}
                  </button>
                  <button className="btn" onClick={app.carregarExemplos}>
                    Carregar dados de exemplo
                  </button>
                </EstadoVazio>
              ) : null}
            </div>
          </section>
        ) : aba === 'metas' ? (
          <PainelMetas />
        ) : (
          <section className="view" role="tabpanel">
            <div className="view-head">
              <div>
                <h2>Cadastro de materiais</h2>
                <p>
                  Cadastre aqui tudo que pode ser retirado. A quantidade em estoque é usada para avisar quando
                  um agendamento passa do que existe.
                </p>
              </div>
              <button className="btn btn-primary" onClick={() => setDialogoMaterial({ aberto: true, material: null })}>
                + Cadastrar material
              </button>
            </div>

            <div className="toolbar">
              <input
                className="search"
                type="search"
                placeholder="Buscar material por nome ou código…"
                aria-label="Buscar materiais"
                value={buscaMaterial}
                onChange={(e) => setBuscaMaterial(e.target.value)}
              />
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Material</th>
                    <th className="num">Estoque</th>
                    <th className="num">Em posse / reservado</th>
                    <th>Observação</th>
                    <th />
                  </tr>
                </thead>
                <TabelaMateriais
                  materiais={materiaisVisiveis}
                  agendamentos={app.agendamentos}
                  aoAgendar={(materialId) => abrirAgendamento(null, materialId)}
                  aoEditar={(material) => setDialogoMaterial({ aberto: true, material })}
                  aoExcluir={excluirMaterial}
                />
              </table>

              {!materiaisVisiveis.length && app.materiais.length ? (
                <EstadoVazio titulo="Nenhum material com esse termo" texto="Tente outro nome ou código." />
              ) : null}

              {!app.materiais.length ? (
                <EstadoVazio
                  titulo="Nenhum material cadastrado"
                  texto="Cadastre os itens do almoxarifado — nome, código e quantidade em estoque. Depois eles aparecem na hora de agendar."
                >
                  <button className="btn btn-primary" onClick={() => setDialogoMaterial({ aberto: true, material: null })}>
                    + Cadastrar material
                  </button>
                  <button className="btn" onClick={app.carregarExemplos}>
                    Carregar dados de exemplo
                  </button>
                </EstadoVazio>
              ) : null}
            </div>
          </section>
        )}
      </main>

      <footer className="foot">
        {app.materiais.length} material(is) cadastrado(s) · {app.agendamentos.length} agendamento(s). Os dados
        ficam no servidor — acessíveis de qualquer computador.
      </footer>

      {dialogoAgendamento.aberto ? (
        <FormularioAgendamento
          agendamento={dialogoAgendamento.agendamento}
          materialInicial={dialogoAgendamento.materialInicial}
          materiais={materiaisOrdenados}
          agendamentos={app.agendamentos}
          aoFechar={() => setDialogoAgendamento({ aberto: false, agendamento: null })}
          aoSalvar={app.salvarAgendamento}
        />
      ) : null}

      {dialogoMaterial.aberto ? (
        <FormularioMaterial
          material={dialogoMaterial.material}
          aoFechar={() => setDialogoMaterial({ aberto: false, material: null })}
          aoSalvar={app.salvarMaterial}
        />
      ) : null}

      {dialogoSenha ? <FormularioTrocarSenha aoFechar={() => setDialogoSenha(false)} /> : null}

      {dialogoUsuarios ? (
        <PainelUsuarios usuarioAtual={usuario} aoFechar={() => setDialogoUsuarios(false)} />
      ) : null}
    </>
  )
}
