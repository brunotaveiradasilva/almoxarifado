import type { TipoMeta } from '../types'

interface Props {
  tiposMeta: TipoMeta[]
  aoEditar: (tipoMeta: TipoMeta) => void
  aoExcluir: (tipoMeta: TipoMeta) => void
}

export function TabelaTiposMeta({ tiposMeta, aoEditar, aoExcluir }: Props) {
  return (
    <tbody>
      {tiposMeta.map((t) => (
        <tr key={t.id}>
          <td className="cell-material">{t.nome}</td>
          <td>{t.unidade}</td>
          <td className="actions-cell">
            <div className="row-actions">
              <button className="btn btn-sm btn-ghost" onClick={() => aoEditar(t)}>
                Editar
              </button>
              <button className="btn btn-sm btn-ghost btn-danger" onClick={() => aoExcluir(t)}>
                Excluir
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  )
}
