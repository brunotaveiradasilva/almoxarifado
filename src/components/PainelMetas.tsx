import { useState } from 'react'
import { useMetas } from '../hooks/useMetas'
import { EstadoVazio } from './EstadoVazio'
import { TabelaFornecedores } from './TabelaFornecedores'
import { FormularioFornecedor } from './FormularioFornecedor'
import { TabelaRepresentantes } from './TabelaRepresentantes'
import { FormularioRepresentante } from './FormularioRepresentante'
import { TabelaMetas } from './TabelaMetas'
import { FormularioMeta } from './FormularioMeta'
import { ConsultaMetasPorRepresentante } from './ConsultaMetasPorRepresentante'
import { ConsultaMetasPorFornecedor } from './ConsultaMetasPorFornecedor'
import type { Fornecedor, Meta, Representante } from '../types'

export type SubabaMetas = 'fornecedores' | 'representantes' | 'metas' | 'porRepresentante' | 'porFornecedor'

export const SUBABAS_METAS: { valor: SubabaMetas; rotulo: string }[] = [
  { valor: 'fornecedores', rotulo: 'Fornecedores' },
  { valor: 'representantes', rotulo: 'Representantes' },
  { valor: 'metas', rotulo: 'Metas' },
  { valor: 'porRepresentante', rotulo: 'Meta Representante' },
  { valor: 'porFornecedor', rotulo: 'Meta Fornecedor' },
]

/** Cadastros de apoio às metas — fornecedores, representantes e metas — e telas de consulta. Só monta para quem é admin. */
interface Props {
  subaba: SubabaMetas
  aoMudarSubaba: (subaba: SubabaMetas) => void
}

/** A navegação entre as subabas fica no menu lateral; as abas daqui só aparecem no celular, onde o menu vira só ícones. */
export function PainelMetas({ subaba, aoMudarSubaba }: Props) {
  const metas = useMetas()

  const [dialogoFornecedor, setDialogoFornecedor] = useState<{ aberto: boolean; fornecedor: Fornecedor | null }>({
    aberto: false,
    fornecedor: null,
  })
  const [dialogoRepresentante, setDialogoRepresentante] = useState<{ aberto: boolean; representante: Representante | null }>({
    aberto: false,
    representante: null,
  })
  const [dialogoMeta, setDialogoMeta] = useState<{ aberto: boolean; meta: Meta | null }>({
    aberto: false,
    meta: null,
  })

  const primeiraCarga =
    metas.carregando && !metas.fornecedores.length && !metas.representantes.length && !metas.metas.length

  function excluirFornecedor(fornecedor: Fornecedor) {
    if (!window.confirm(`Excluir o fornecedor "${fornecedor.nome}"?`)) return
    metas.removerFornecedor(fornecedor.id)
  }

  function excluirRepresentante(representante: Representante) {
    if (!window.confirm(`Excluir o representante "${representante.nome}"?`)) return
    metas.removerRepresentante(representante.id)
  }

  function excluirMeta(meta: Meta) {
    if (!window.confirm(`Excluir a meta "${meta.nome}"?`)) return
    metas.removerMeta(meta.id)
  }

  return (
    <section className="view" role="tabpanel">
      <div className="view-head">
        <div>
          <h2>Metas</h2>
        </div>
        {subaba === 'fornecedores' ? (
          <button className="btn btn-primary" onClick={() => setDialogoFornecedor({ aberto: true, fornecedor: null })}>
            + Cadastrar fornecedor
          </button>
        ) : null}
        {subaba === 'representantes' ? (
          <button className="btn btn-primary" onClick={() => setDialogoRepresentante({ aberto: true, representante: null })}>
            + Cadastrar representante
          </button>
        ) : null}
        {subaba === 'metas' ? (
          <button className="btn btn-primary" onClick={() => setDialogoMeta({ aberto: true, meta: null })}>
            + Cadastrar meta
          </button>
        ) : null}
        {subaba === 'porRepresentante' || subaba === 'porFornecedor' ? (
          <button className="btn" disabled={metas.sincronizando} onClick={metas.sincronizarComAds}>
            {metas.sincronizando ? 'Sincronizando…' : 'Sincronizar com a ADS'}
          </button>
        ) : null}
      </div>

      {metas.erro ? (
        <div className="banner-erro" role="alert">
          <span>{metas.erro}</span>
          <button className="btn" onClick={metas.tentarNovamente}>
            Tentar de novo
          </button>
        </div>
      ) : null}

      <nav className="tabs tabs-so-celular" role="tablist">
        {SUBABAS_METAS.map((s) => (
          <button key={s.valor} role="tab" aria-selected={subaba === s.valor} onClick={() => aoMudarSubaba(s.valor)}>
            {s.rotulo}
          </button>
        ))}
      </nav>

      {primeiraCarga ? (
        <EstadoVazio titulo="Carregando…" texto="Buscando os dados salvos no servidor." />
      ) : subaba === 'fornecedores' ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fornecedor</th>
                <th />
              </tr>
            </thead>
            <TabelaFornecedores
              fornecedores={metas.fornecedores}
              aoEditar={(fornecedor) => setDialogoFornecedor({ aberto: true, fornecedor })}
              aoExcluir={excluirFornecedor}
            />
          </table>

          {!metas.fornecedores.length ? (
            <EstadoVazio titulo="Nenhum fornecedor cadastrado" texto="Cadastre os fornecedores donos das metas.">
              <button
                className="btn btn-primary"
                onClick={() => setDialogoFornecedor({ aberto: true, fornecedor: null })}
              >
                + Cadastrar fornecedor
              </button>
            </EstadoVazio>
          ) : null}
        </div>
      ) : subaba === 'representantes' ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Representante</th>
                <th>Fornecedores</th>
                <th>E-mail</th>
                <th>Celular</th>
                <th />
              </tr>
            </thead>
            <TabelaRepresentantes
              representantes={metas.representantes}
              aoEditar={(representante) => setDialogoRepresentante({ aberto: true, representante })}
              aoExcluir={excluirRepresentante}
            />
          </table>

          {!metas.representantes.length ? (
            <EstadoVazio titulo="Nenhum representante cadastrado" texto="Cadastre os representantes que terão metas atribuídas.">
              <button className="btn btn-primary" onClick={() => setDialogoRepresentante({ aberto: true, representante: null })}>
                + Cadastrar representante
              </button>
            </EstadoVazio>
          ) : null}
        </div>
      ) : subaba === 'metas' ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Meta</th>
                <th>Fornecedor</th>
                <th>Unidade</th>
                <th />
              </tr>
            </thead>
            <TabelaMetas
              metas={metas.metas}
              aoEditar={(meta) => setDialogoMeta({ aberto: true, meta })}
              aoExcluir={excluirMeta}
            />
          </table>

          {!metas.metas.length ? (
            <EstadoVazio titulo="Nenhuma meta cadastrada" texto="Cadastre as metas de cada fornecedor.">
              <button className="btn btn-primary" onClick={() => setDialogoMeta({ aberto: true, meta: null })}>
                + Cadastrar meta
              </button>
            </EstadoVazio>
          ) : null}
        </div>
      ) : subaba === 'porRepresentante' ? (
        <ConsultaMetasPorRepresentante representantes={metas.representantes} metas={metas.metas} metasRepresentante={metas.metasRepresentante} />
      ) : (
        <ConsultaMetasPorFornecedor
          fornecedores={metas.fornecedores}
          representantes={metas.representantes}
          metas={metas.metas}
          metasRepresentante={metas.metasRepresentante}
          aoSalvar={metas.salvarMetaRepresentante}
        />
      )}

      {dialogoFornecedor.aberto ? (
        <FormularioFornecedor
          fornecedor={dialogoFornecedor.fornecedor}
          aoFechar={() => setDialogoFornecedor({ aberto: false, fornecedor: null })}
          aoSalvar={metas.salvarFornecedor}
        />
      ) : null}

      {dialogoRepresentante.aberto ? (
        <FormularioRepresentante
          representante={dialogoRepresentante.representante}
          fornecedores={metas.fornecedores}
          aoFechar={() => setDialogoRepresentante({ aberto: false, representante: null })}
          aoSalvar={metas.salvarRepresentante}
        />
      ) : null}

      {dialogoMeta.aberto ? (
        <FormularioMeta
          meta={dialogoMeta.meta}
          fornecedores={metas.fornecedores}
          aoFechar={() => setDialogoMeta({ aberto: false, meta: null })}
          aoSalvar={metas.salvarMeta}
        />
      ) : null}
    </section>
  )
}
