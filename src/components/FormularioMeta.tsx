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
  const [cnpjAdsFornecedor, setCnpjAdsFornecedor] = useState(meta?.cnpjAdsFornecedor ?? '')
  const [produtosIncluidos, setProdutosIncluidos] = useState(meta?.produtosIncluidos ?? '')
  const [produtosExcluidos, setProdutosExcluidos] = useState(meta?.produtosExcluidos ?? '')
  const [erro, setErro] = useState('')

  function confirmar() {
    const nomeLimpo = nome.trim()
    if (!nomeLimpo) return setErro('Informe o nome da meta.')
    if (!fornecedorId) return setErro('Selecione o fornecedor.')

    aoSalvar(
      {
        nome: nomeLimpo,
        fornecedorId,
        unidade,
        codigoAdsDivisao: codigoAdsDivisao.trim(),
        cnpjAdsFornecedor: cnpjAdsFornecedor.trim(),
        produtosExcluidos: produtosExcluidos.trim(),
        produtosIncluidos: produtosIncluidos.trim(),
      },
      meta?.id,
    )
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
          maxLength={40}
          placeholder="Ex.: 074 ou 112,113"
          value={codigoAdsDivisao}
          onChange={(e) => setCodigoAdsDivisao(e.target.value)}
        />
        <p className="hint">
          Código (ou vários, separados por vírgula) da divisão correspondente na API da ADS. Ignorado se o CNPJ do
          fornecedor abaixo estiver preenchido.
        </p>
      </div>

      <div className="field">
        <label htmlFor="me-cnpj-ads">CNPJ do fornecedor na ADS</label>
        <input
          id="me-cnpj-ads"
          maxLength={20}
          placeholder="Ex.: 46325254000180"
          value={cnpjAdsFornecedor}
          onChange={(e) => setCnpjAdsFornecedor(e.target.value)}
        />
        <p className="hint">
          Pra metas "geral" que somam tudo vendido de um fornecedor na ADS, sem filtrar por divisão. Deixe em branco
          se essa meta usa o código de divisão acima. Se os dois estiverem preenchidos, esse tem prioridade.
        </p>
      </div>

      <div className="field">
        <label htmlFor="me-produtos-incluidos">Produtos incluídos na meta</label>
        <input
          id="me-produtos-incluidos"
          maxLength={255}
          placeholder="Ex.: BANNI ou 1234, 1235*3"
          value={produtosIncluidos}
          onChange={(e) => setProdutosIncluidos(e.target.value)}
        />
        <p className="hint">
          Se preenchido, só esses produtos contam pra meta — pra metas de um produto só (ex.: a sazonal do Banni). Mesmo
          formato dos excluídos: número é o código do produto na ADS; texto pega todo produto que tenha ele no nome.
          Funciona sozinho, sem CNPJ nem divisão. Pra kit que a ADS conta como 1, ponha o fator depois: 4931*3 faz
          cada unidade vendida valer 3 nas metas em unidade.
        </p>
      </div>

      <div className="field">
        <label htmlFor="me-produtos-excluidos">Produtos excluídos da meta</label>
        <input
          id="me-produtos-excluidos"
          maxLength={255}
          placeholder="Ex.: WELLPET ou 5085,5084"
          value={produtosExcluidos}
          onChange={(e) => setProdutosExcluidos(e.target.value)}
        />
        <p className="hint">
          Vendas desses produtos não contam pra meta. Separe por vírgula: um número é o código do produto na ADS; um
          texto tira todo produto que tenha ele no nome (ex.: WELLPET tira todas as apresentações do Wellpet).
        </p>
      </div>
    </Modal>
  )
}
