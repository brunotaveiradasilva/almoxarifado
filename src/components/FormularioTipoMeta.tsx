import { useState } from 'react'
import { Modal } from './Modal'
import type { TipoMeta } from '../types'

interface Props {
  /** Tipo de meta em edição, ou null para um cadastro novo. */
  tipoMeta: TipoMeta | null
  aoFechar: () => void
  aoSalvar: (tipoMeta: Omit<TipoMeta, 'id'>, id?: string | null) => void
}

const VAZIO = { nome: '', unidade: '' }

export function FormularioTipoMeta({ tipoMeta, aoFechar, aoSalvar }: Props) {
  const [form, setForm] = useState(() =>
    tipoMeta ? { nome: tipoMeta.nome, unidade: tipoMeta.unidade } : VAZIO,
  )
  const [erro, setErro] = useState('')

  function confirmar() {
    const nome = form.nome.trim()
    const unidade = form.unidade.trim()

    if (!nome) return setErro('Informe o nome do tipo de meta.')
    if (!unidade) return setErro('Informe a unidade de medida.')

    aoSalvar({ nome, unidade }, tipoMeta?.id)
    aoFechar()
  }

  return (
    <Modal
      titulo={tipoMeta ? 'Editar tipo de meta' : 'Cadastrar tipo de meta'}
      textoConfirmar="Salvar tipo de meta"
      mensagem={erro}
      aoFechar={aoFechar}
      aoConfirmar={confirmar}
    >
      <div className="field">
        <label htmlFor="tm-nome">Nome do tipo de meta</label>
        <input
          id="tm-nome"
          maxLength={80}
          placeholder="Ex.: Meta de vendas"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="tm-unidade">Unidade de medida</label>
        <input
          id="tm-unidade"
          maxLength={20}
          placeholder="Ex.: R$, unidades, %"
          value={form.unidade}
          onChange={(e) => setForm({ ...form, unidade: e.target.value })}
        />
      </div>
    </Modal>
  )
}
