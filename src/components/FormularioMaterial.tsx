import { useState } from 'react'
import { Modal } from './Modal'
import type { Material } from '../types'

interface Props {
  /** Material em edição, ou null para um cadastro novo. */
  material: Material | null
  aoFechar: () => void
  aoSalvar: (material: Omit<Material, 'id'>, id?: string | null) => void
}

const VAZIO = { nome: '', codigo: '', estoque: '1', obs: '' }

/** Montado só enquanto o diálogo está aberto, então o formulário já nasce preenchido. */
export function FormularioMaterial({ material, aoFechar, aoSalvar }: Props) {
  const [form, setForm] = useState(() =>
    material
      ? { nome: material.nome, codigo: material.codigo, estoque: String(material.estoque), obs: material.obs }
      : VAZIO,
  )
  const [erro, setErro] = useState('')

  function confirmar() {
    const nome = form.nome.trim()
    const estoque = Number.parseInt(form.estoque, 10)

    if (!nome) return setErro('Informe o nome do material.')
    if (!(estoque >= 1)) return setErro('O estoque precisa ser pelo menos 1.')

    aoSalvar({ nome, codigo: form.codigo.trim(), estoque, obs: form.obs.trim() }, material?.id)
    aoFechar()
  }

  return (
    <Modal
      titulo={material ? 'Editar material' : 'Cadastrar material'}
      textoConfirmar="Salvar material"
      mensagem={erro}
      aoFechar={aoFechar}
      aoConfirmar={confirmar}
    >
      <div className="field">
        <label htmlFor="m-nome">Nome do material</label>
        <input
          id="m-nome"
          maxLength={80}
          placeholder="Ex.: Furadeira de impacto"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />
      </div>

      <div className="grid-2">
        <div className="field">
          <label htmlFor="m-codigo">Código / patrimônio</label>
          <input
            id="m-codigo"
            maxLength={30}
            placeholder="Opcional"
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="m-estoque">Quantidade em estoque</label>
          <input
            id="m-estoque"
            type="number"
            min={1}
            step={1}
            value={form.estoque}
            onChange={(e) => setForm({ ...form, estoque: e.target.value })}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="m-obs">Observação</label>
        <textarea
          id="m-obs"
          maxLength={400}
          placeholder="Onde fica guardado, cuidados de uso, acessórios que acompanham…"
          value={form.obs}
          onChange={(e) => setForm({ ...form, obs: e.target.value })}
        />
      </div>
    </Modal>
  )
}
