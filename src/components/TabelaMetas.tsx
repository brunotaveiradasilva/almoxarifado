import { ROTULO_UNIDADE_META } from '../lib/unidadeMeta'
import type { Meta } from '../types'

interface Props {
  metas: Meta[]
  aoEditar: (meta: Meta) => void
  aoExcluir: (meta: Meta) => void
}

export function TabelaMetas({ metas, aoEditar, aoExcluir }: Props) {
  return (
    <tbody>
      {metas.map((m) => (
        <tr key={m.id}>
          <td className="cell-material">{m.nome}</td>
          <td>{m.fornecedor.nome}</td>
          <td>{ROTULO_UNIDADE_META[m.unidade]}</td>
          <td className="actions-cell">
            <div className="row-actions">
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
