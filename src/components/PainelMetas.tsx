import { useState } from 'react'
import { useMetas } from '../hooks/useMetas'
import { EstadoVazio } from './EstadoVazio'
import { TabelaVendedores } from './TabelaVendedores'
import { FormularioVendedor } from './FormularioVendedor'
import { TabelaTiposMeta } from './TabelaTiposMeta'
import { FormularioTipoMeta } from './FormularioTipoMeta'
import type { TipoMeta, Vendedor } from '../types'

/** Cadastros de apoio às metas: vendedores e tipos de meta. Só monta para quem é admin. */
export function PainelMetas() {
  const metas = useMetas()
  const [subaba, setSubaba] = useState<'vendedores' | 'tipos'>('vendedores')

  const [dialogoVendedor, setDialogoVendedor] = useState<{ aberto: boolean; vendedor: Vendedor | null }>({
    aberto: false,
    vendedor: null,
  })
  const [dialogoTipoMeta, setDialogoTipoMeta] = useState<{ aberto: boolean; tipoMeta: TipoMeta | null }>({
    aberto: false,
    tipoMeta: null,
  })

  const primeiraCarga = metas.carregando && !metas.vendedores.length && !metas.tiposMeta.length

  function excluirVendedor(vendedor: Vendedor) {
    if (!window.confirm(`Excluir o vendedor "${vendedor.nome}"?`)) return
    metas.removerVendedor(vendedor.id)
  }

  function excluirTipoMeta(tipoMeta: TipoMeta) {
    if (!window.confirm(`Excluir o tipo de meta "${tipoMeta.nome}"?`)) return
    metas.removerTipoMeta(tipoMeta.id)
  }

  return (
    <section className="view" role="tabpanel">
      <div className="view-head">
        <div>
          <h2>Metas</h2>
          <p>Cadastre os vendedores e os tipos de meta que serão usados para acompanhar as metas.</p>
        </div>
        {subaba === 'vendedores' ? (
          <button className="btn btn-primary" onClick={() => setDialogoVendedor({ aberto: true, vendedor: null })}>
            + Cadastrar vendedor
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => setDialogoTipoMeta({ aberto: true, tipoMeta: null })}>
            + Cadastrar tipo de meta
          </button>
        )}
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
        <button role="tab" aria-selected={subaba === 'vendedores'} onClick={() => setSubaba('vendedores')}>
          Vendedores
        </button>
        <button role="tab" aria-selected={subaba === 'tipos'} onClick={() => setSubaba('tipos')}>
          Tipos de meta
        </button>
      </nav>

      {primeiraCarga ? (
        <EstadoVazio titulo="Carregando…" texto="Buscando os dados salvos no servidor." />
      ) : subaba === 'vendedores' ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vendedor</th>
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
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tipo de meta</th>
                <th>Unidade</th>
                <th />
              </tr>
            </thead>
            <TabelaTiposMeta
              tiposMeta={metas.tiposMeta}
              aoEditar={(tipoMeta) => setDialogoTipoMeta({ aberto: true, tipoMeta })}
              aoExcluir={excluirTipoMeta}
            />
          </table>

          {!metas.tiposMeta.length ? (
            <EstadoVazio titulo="Nenhum tipo de meta cadastrado" texto="Cadastre os tipos de meta, como 'Vendas' ou 'Novos clientes'.">
              <button className="btn btn-primary" onClick={() => setDialogoTipoMeta({ aberto: true, tipoMeta: null })}>
                + Cadastrar tipo de meta
              </button>
            </EstadoVazio>
          ) : null}
        </div>
      )}

      {dialogoVendedor.aberto ? (
        <FormularioVendedor
          vendedor={dialogoVendedor.vendedor}
          aoFechar={() => setDialogoVendedor({ aberto: false, vendedor: null })}
          aoSalvar={metas.salvarVendedor}
        />
      ) : null}

      {dialogoTipoMeta.aberto ? (
        <FormularioTipoMeta
          tipoMeta={dialogoTipoMeta.tipoMeta}
          aoFechar={() => setDialogoTipoMeta({ aberto: false, tipoMeta: null })}
          aoSalvar={metas.salvarTipoMeta}
        />
      ) : null}
    </section>
  )
}
