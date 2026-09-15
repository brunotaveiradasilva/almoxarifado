import { useState } from 'react'
import { Modal } from './Modal'
import type { VendedorEntrada } from '../lib/api'
import type { Fornecedor, Vendedor } from '../types'

interface Props {
  /** Vendedor em edição, ou null para um cadastro novo. */
  vendedor: Vendedor | null
  fornecedores: Fornecedor[]
  aoFechar: () => void
  aoSalvar: (vendedor: VendedorEntrada, id?: string | null) => void
}

export function FormularioVendedor({ vendedor, fornecedores, aoFechar, aoSalvar }: Props) {
  const [nome, setNome] = useState(vendedor?.nome ?? '')
  const [fornecedorIds, setFornecedorIds] = useState<string[]>(
    () => vendedor?.fornecedores.map((f) => f.id) ?? [],
  )
  const [email, setEmail] = useState(vendedor?.email ?? '')
  const [celular, setCelular] = useState(vendedor?.celular ?? '')
  const [erro, setErro] = useState('')

  function alternarFornecedor(id: string, marcado: boolean) {
    setFornecedorIds((atual) => (marcado ? [...atual, id] : atual.filter((f) => f !== id)))
  }

  function confirmar() {
    const nomeLimpo = nome.trim()
    if (!nomeLimpo) return setErro('Informe o nome do vendedor.')
    if (!fornecedorIds.length) return setErro('Selecione ao menos um fornecedor.')

    aoSalvar({ nome: nomeLimpo, fornecedorIds, email: email.trim(), celular: celular.trim() }, vendedor?.id)
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
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </div>

      <div className="field">
        <label>Fornecedores</label>
        {fornecedores.length ? (
          <div className="checklist">
            {fornecedores.map((f) => (
              <label key={f.id}>
                <input
                  type="checkbox"
                  checked={fornecedorIds.includes(f.id)}
                  onChange={(e) => alternarFornecedor(f.id, e.target.checked)}
                />
                {f.nome}
              </label>
            ))}
          </div>
        ) : (
          <p className="hint">Cadastre um fornecedor antes de cadastrar vendedores.</p>
        )}
      </div>

      <div className="field">
        <label htmlFor="v-email">E-mail</label>
        <input
          id="v-email"
          type="email"
          maxLength={120}
          placeholder="Ex.: maria@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="v-celular">Celular</label>
        <input
          id="v-celular"
          type="tel"
          maxLength={20}
          placeholder="Ex.: (11) 91234-5678"
          value={celular}
          onChange={(e) => setCelular(e.target.value)}
        />
      </div>
    </Modal>
  )
}
