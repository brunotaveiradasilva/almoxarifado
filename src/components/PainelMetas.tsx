import { useState } from 'react'
import { useMetas } from '../hooks/useMetas'
import { EstadoVazio } from './EstadoVazio'
import { TabelaFornecedores } from './TabelaFornecedores'
import { FormularioFornecedor } from './FormularioFornecedor'
import { TabelaVendedores } from './TabelaVendedores'
import { FormularioVendedor } from './FormularioVendedor'
import { TabelaMetas } from './TabelaMetas'
import { FormularioMeta } from './FormularioMeta'
import { ConsultaMetasPorVendedor } from './ConsultaMetasPorVendedor'
import { ConsultaMetasPorFornecedor } from './ConsultaMetasPorFornecedor'
import type { Fornecedor, Meta, Vendedor } from '../types'

type Subaba = 'fornecedores' | 'vendedores' | 'metas' | 'porVendedor' | 'porFornecedor'

const SUBABAS: { valor: Subaba; rotulo: string }[] = [
  { valor: 'fornecedores', rotulo: 'Fornecedores' },
  { valor: 'vendedores', rotulo: 'Vendedores' },
  { valor: 'metas', rotulo: 'Metas' },
  { valor: 'porVendedor', rotulo: 'Metas por vendedor' },
  { valor: 'porFornecedor', rotulo: 'Metas por fornecedor' },
]

/** Cadastros de apoio às metas — fornecedores, vendedores e metas — e telas de consulta. Só monta para quem é admin. */
export function PainelMetas() {
  const metas = useMetas()
  const [subaba, setSubaba] = useState<Subaba>('fornecedores')

  const [dialogoFornecedor, setDialogoFornecedor] = useState<{ aberto: boolean; fornecedor: Fornecedor | null }>({
    aberto: false,
    fornecedor: null,
  })
  const [dialogoVendedor, setDialogoVendedor] = useState<{ aberto: boolean; vendedor: Vendedor | null }>({
    aberto: false,
    vendedor: null,
  })
  const [dialogoMeta, setDialogoMeta] = useState<{ aberto: boolean; meta: Meta | null }>({
    aberto: false,
    meta: null,
  })

  const primeiraCarga =
    metas.carregando && !metas.fornecedores.length && !metas.vendedores.length && !metas.metas.length

  function excluirFornecedor(fornecedor: Fornecedor) {
    if (!window.confirm(`Excluir o fornecedor "${fornecedor.nome}"?`)) return
    metas.removerFornecedor(fornecedor.id)
  }

  function excluirVendedor(vendedor: Vendedor) {
    if (!window.confirm(`Excluir o vendedor "${vendedor.nome}"?`)) return
    metas.removerVendedor(vendedor.id)
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
          <p>Cadastre fornecedores, vendedores e metas, e consulte as metas por vendedor ou por fornecedor.</p>
        </div>
        {subaba === 'fornecedores' ? (
          <button className="btn btn-primary" onClick={() => setDialogoFornecedor({ aberto: true, fornecedor: null })}>
            + Cadastrar fornecedor
          </button>
        ) : null}
        {subaba === 'vendedores' ? (
          <button className="btn btn-primary" onClick={() => setDialogoVendedor({ aberto: true, vendedor: null })}>
            + Cadastrar vendedor
          </button>
        ) : null}
        {subaba === 'metas' ? (
          <button className="btn btn-primary" onClick={() => setDialogoMeta({ aberto: true, meta: null })}>
            + Cadastrar meta
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

      <nav className="tabs" role="tablist">
        {SUBABAS.map((s) => (
          <button key={s.valor} role="tab" aria-selected={subaba === s.valor} onClick={() => setSubaba(s.valor)}>
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
      ) : subaba === 'vendedores' ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vendedor</th>
                <th>Fornecedores</th>
                <th>E-mail</th>
                <th>Celular</th>
                <th />
              </tr>
            </thead>
            <TabelaVendedores
              vendedores={metas.vendedores}
              aoEditar={(vendedor) => setDialogoVendedor({ aberto: true, vendedor })}
              aoExcluir={excluirVendedor}
            />
          </table>

          {!metas.vendedores.length ? (
            <EstadoVazio titulo="Nenhum vendedor cadastrado" texto="Cadastre os vendedores que terão metas atribuídas.">
              <button className="btn btn-primary" onClick={() => setDialogoVendedor({ aberto: true, vendedor: null })}>
                + Cadastrar vendedor
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
      ) : subaba === 'porVendedor' ? (
        <ConsultaMetasPorVendedor
          vendedores={metas.vendedores}
          metas={metas.metas}
          metasVendedor={metas.metasVendedor}
          aoSalvar={metas.salvarMetaVendedor}
        />
      ) : (
        <ConsultaMetasPorFornecedor
          fornecedores={metas.fornecedores}
          vendedores={metas.vendedores}
          metas={metas.metas}
        />
      )}

      {dialogoFornecedor.aberto ? (
        <FormularioFornecedor
          fornecedor={dialogoFornecedor.fornecedor}
          aoFechar={() => setDialogoFornecedor({ aberto: false, fornecedor: null })}
          aoSalvar={metas.salvarFornecedor}
        />
      ) : null}

      {dialogoVendedor.aberto ? (
        <FormularioVendedor
          vendedor={dialogoVendedor.vendedor}
          fornecedores={metas.fornecedores}
          aoFechar={() => setDialogoVendedor({ aberto: false, vendedor: null })}
          aoSalvar={metas.salvarVendedor}
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
