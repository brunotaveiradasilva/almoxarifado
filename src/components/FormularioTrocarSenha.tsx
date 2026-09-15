import { useState } from 'react'
import { Modal } from './Modal'
import { trocarSenha, ErroApi } from '../lib/api'

interface Props {
  aoFechar: () => void
}

/** Diálogo simples: senha atual + nova senha. É assim que se recupera de uma senha gerada sozinha. */
export function FormularioTrocarSenha({ aoFechar }: Props) {
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function confirmar() {
    if (!senhaAtual) return setErro('Informe a senha atual.')
    if (novaSenha.length < 4) return setErro('A nova senha precisa ter pelo menos 4 caracteres.')
    if (novaSenha !== confirmarSenha) return setErro('As senhas não coincidem.')

    setErro('')
    setEnviando(true)
    try {
      await trocarSenha(senhaAtual, novaSenha)
      aoFechar()
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível trocar a senha. Tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal
      titulo="Trocar senha"
      textoConfirmar={enviando ? 'Salvando…' : 'Salvar nova senha'}
      mensagem={erro}
      aoFechar={aoFechar}
      aoConfirmar={confirmar}
    >
      <div className="field">
        <label htmlFor="ts-atual">Senha atual</label>
        <input
          id="ts-atual"
          type="password"
          autoFocus
          autoComplete="current-password"
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="ts-nova">Nova senha</label>
        <input
          id="ts-nova"
          type="password"
          autoComplete="new-password"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="ts-confirma">Confirmar nova senha</label>
        <input
          id="ts-confirma"
          type="password"
          autoComplete="new-password"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
        />
      </div>
    </Modal>
  )
}
