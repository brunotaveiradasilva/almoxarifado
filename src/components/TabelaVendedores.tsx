import type { Vendedor } from '../types'

interface Props {
  vendedores: Vendedor[]
  aoEditar: (vendedor: Vendedor) => void
  aoExcluir: (vendedor: Vendedor) => void
}

export function TabelaVendedores({ vendedores, aoEditar, aoExcluir }: Props) {
  return (
    <tbody>
      {vendedores.map((v) => (
        <tr key={v.id}>
          <td className="cell-material">{v.nome}</td>
          <td className="cell-obs">{v.fornecedores.map((f) => f.nome).join(', ') || '—'}</td>
          <td className="cell-obs">{v.email || '—'}</td>
          <td className="cell-obs">{v.celular || '—'}</td>
          <td className="actions-cell">
            <div className="row-actions">
              <button className="btn btn-sm btn-ghost" onClick={() => aoEditar(v)}>
                Editar
              </button>
              <button className="btn btn-sm btn-ghost btn-danger" onClick={() => aoExcluir(v)}>
                Excluir
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  )
}
