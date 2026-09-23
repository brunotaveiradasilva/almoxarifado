import { useState } from 'react'
import { Modal } from './Modal'
import { ROTULO_UNIDADE_META } from '../lib/unidadeMeta'
import type { MetaRepresentanteEntrada } from '../lib/api'
import type { Meta, MetaRepresentante, Representante } from '../types'

interface Props {
  representante: Representante
  meta: Meta
  atribuicao: MetaRepresentante | null
  aoFechar: () => void
  aoSalvar: (mv: MetaRepresentanteEntrada, id?: string | null) => Promise<MetaRepresentante>
}

const formatar = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

/** Troca o valor da meta de um representante em três passos: digitar o valor, confirmar a mudança e ver que deu certo. */
export function DialogoEditarMetaRepresentante({ representante, meta, atribuicao, aoFechar, aoSalvar }: Props) {
  const valorAtual = atribuicao?.valorMeta ?? 0
  const [passo, setPasso] = useState<'editar' | 'confirmar' | 'sucesso'>('editar')
  const [valor, setValor] = useState(atribuicao ? String(atribuicao.valorMeta) : '')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const valorNum = Number.parseFloat(valor)

  function continuar() {
    if (!Number.isFinite(valorNum) || valorNum < 0) return setErro('Informe um valor de meta válido.')
    if (valorNum === valorAtual) return setErro('O valor é igual ao atual.')
    setErro('')
    setPasso('confirmar')
  }

  async function salvar() {
    if (salvando) return
    setSalvando(true)
    setErro('')
    try {
      // O Realizado vai junto só porque a API pede o registro inteiro — reenvia o valor que ela mesma mandou.
      await aoSalvar(
        {
          representanteId: representante.id,
          metaId: meta.id,
          valorMeta: valorNum,
          valorRealizado: atribuicao?.valorRealizado ?? 0,
        },
        atribuicao?.id,
      )
      setPasso('sucesso')
    } catch {
      setErro('Não foi possível salvar. Tente de novo.')
    } finally {
      setSalvando(false)
    }
  }

  const descricao = (
    <>
      <strong>{representante.nome}</strong> · {meta.nome} ({ROTULO_UNIDADE_META[meta.unidade]})
    </>
  )

  if (passo === 'sucesso') {
    return (
      <Modal titulo="Meta alterada" textoConfirmar="Fechar" textoCancelar={null} aoFechar={aoFechar} aoConfirmar={aoFechar}>
        <p>
          Deu certo! A meta de {descricao} agora é <strong>{formatar(valorNum)}</strong>.
        </p>
      </Modal>
    )
  }

  if (passo === 'confirmar') {
    return (
      <Modal
        titulo="Confirmar alteração"
        textoConfirmar={salvando ? 'Salvando…' : 'Confirmar'}
        textoCancelar="Voltar"
        aoCancelar={() => setPasso('editar')}
        mensagem={erro}
        aoFechar={aoFechar}
        aoConfirmar={salvar}
      >
        <p>
          Alterar a meta de {descricao} de <strong>{formatar(valorAtual)}</strong> para{' '}
          <strong>{formatar(valorNum)}</strong>?
        </p>
      </Modal>
    )
  }

  return (
    <Modal titulo="Editar meta" textoConfirmar="Continuar" mensagem={erro} aoFechar={aoFechar} aoConfirmar={continuar}>
      <p className="hint">{descricao}</p>
      <div className="field">
        <label htmlFor="emr-valor">Valor da meta</label>
        <input
          id="emr-valor"
          type="number"
          min={0}
          step="any"
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
      </div>
    </Modal>
  )
}
