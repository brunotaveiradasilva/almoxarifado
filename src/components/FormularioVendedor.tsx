import { useState } from 'react'
import { Modal } from './Modal'
import type { Vendedor } from '../types'

interface Props {
  /** Vendedor em edição, ou null para um cadastro novo. */
  vendedor: Vendedor | null
  aoFechar: () => void
  aoSalvar: (vendedor: Omit<Vendedor, 'id'>, id?: string | null) => void
}

const VAZIO = { nome: '', codigo: '' }

export function FormularioVendedor({ vendedor, aoFechar, aoSalvar }: Props) {
  const [form, setForm] = useState(() => (vendedor ? { nome: vendedor.nome, codigo: vendedor.codigo } : VAZIO))
  const [erro, setErro] = useState('')

  function confirmar() {
    const nome = form.nome.trim()
    const codigo = form.codigo.trim()

    if (!nome) return setErro('Informe o nome do vendedor.')
    if (!codigo) return setErro('Informe o código/matrícula do vendedor.')

    aoSalvar({ nome, codigo }, vendedor?.id)
    aoFechar()
  }

  return (
    <Modal
      titulo={vendedor ? 'Editar vendedor' : 'Cadastrar vendedor'}
      textoConfirmar="Salvar vendedor"
      mensagem={erro}
      aoFechar={aoFechar}
      aoConfirmar={confirmar}
    >
      <div className="field">
        <label htmlFor="v-nome">Nome do vendedor</label>
        <input
          id="v-nome"
          maxLength={80}
          placeholder="Ex.: Maria Souza"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="v-codigo">Código/matrícula</label>
        <input
          id="v-codigo"
          maxLength={40}
          placeholder="Ex.: V-0231"
          value={form.codigo}
          onChange={(e) => setForm({ ...form, codigo: e.target.value })}
        />
      </div>
    </Modal>
  )
}
