import { BotoesOrdemMeta } from './BotoesOrdemMeta'
import { ROTULO_UNIDADE_META } from '../lib/unidadeMeta'
import type { Meta } from '../types'

interface Props {
  /** Já na ordem da tela — a mesma usada nas consultas de metas. */
  metas: Meta[]
  aoEditar: (meta: Meta) => void
  aoExcluir: (meta: Meta) => void
  aoTrocarOrdem: (meta: Meta, vizinha: Meta) => void
}

export function TabelaMetas({ metas, aoEditar, aoExcluir, aoTrocarOrdem }: Props) {
  return (
    <tbody>
      {metas.map((m, i) => (
        <tr key={m.id}>
          <td className="cell-material">{m.nome}</td>
          <td>{m.fornecedor.nome}</td>
          <td>{ROTULO_UNIDADE_META[m.unidade]}</td>
          <td className="actions-cell">
            <div className="row-actions">
              <BotoesOrdemMeta
                meta={m}
                anterior={metas[i - 1] ?? null}
                proxima={metas[i + 1] ?? null}
                aoTrocar={aoTrocarOrdem}
              />
              <button className="btn btn-sm btn-ghost" onClick={() => aoEditar(m)}>
                Editar
              </button>
              <button className="btn btn-sm btn-ghost btn-danger" onClick={() => aoExcluir(m)}>
                Excluir
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  )
}
