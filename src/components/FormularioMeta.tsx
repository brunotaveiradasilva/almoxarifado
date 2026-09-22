import { useState } from 'react'
import { Modal } from './Modal'
import { ROTULO_UNIDADE_META, UNIDADES_META } from '../lib/unidadeMeta'
import type { MetaEntrada } from '../lib/api'
import type { Fornecedor, Meta, UnidadeMeta } from '../types'

interface Props {
  /** Meta em edição, ou null para um cadastro novo. */
  meta: Meta | null
  fornecedores: Fornecedor[]
  aoFechar: () => void
  aoSalvar: (meta: MetaEntrada, id?: string | null) => void
}

export function FormularioMeta({ meta, fornecedores, aoFechar, aoSalvar }: Props) {
  const [nome, setNome] = useState(meta?.nome ?? '')
  const [fornecedorId, setFornecedorId] = useState(meta?.fornecedor.id ?? fornecedores[0]?.id ?? '')
  const [unidade, setUnidade] = useState<UnidadeMeta>(meta?.unidade ?? 'KG')
  const [codigoAdsDivisao, setCodigoAdsDivisao] = useState(meta?.codigoAdsDivisao ?? '')
  const [erro, setErro] = useState('')

  function confirmar() {
    const nomeLimpo = nome.trim()
    if (!nomeLimpo) return setErro('Informe o nome da meta.')
    if (!fornecedorId) return setErro('Selecione o fornecedor.')

    aoSalvar({ nome: nomeLimpo, fornecedorId, unidade, codigoAdsDivisao: codigoAdsDivisao.trim() }, meta?.id)
    aoFechar()
  }

  return (
    <Modal
      titulo={meta ? 'Editar meta' : 'Cadastrar meta'}
      textoConfirmar="Salvar meta"
      mensagem={erro}
      aoFechar={aoFechar}
      aoConfirmar={confirmar}
    >
      <div className="field">
        <label htmlFor="me-nome">Nome da meta</label>
        <input
          id="me-nome"
          maxLength={80}
          placeholder="Ex.: Meta de vendas"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="me-fornecedor">Fornecedor</label>
        {fornecedores.length ? (
          <select id="me-fornecedor" value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)}>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        ) : (
          <p className="hint">Cadastre um fornecedor antes de cadastrar metas.</p>
        )}
      </div>

      <div className="field">
        <label htmlFor="me-unidade">Unidade de medida</label>
        <select id="me-unidade" value={unidade} onChange={(e) => setUnidade(e.target.value as UnidadeMeta)}>
          {UNIDADES_META.map((u) => (
            <option key={u} value={u}>
              {ROTULO_UNIDADE_META[u]}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="me-codigo-ads">Código da divisão ADS</label>
        <input
          id="me-codigo-ads"
          maxLength={20}
          placeholder="Ex.: 074"
          value={codigoAdsDivisao}
          onChange={(e) => setCodigoAdsDivisao(e.target.value)}
        />
        <p className="hint">
          Código da divisão correspondente na API da ADS (histórico de vendas). Deixe em branco se essa meta não
          deve ser sincronizada automaticamente.
        </p>
      </div>
    </Modal>
  )
}
