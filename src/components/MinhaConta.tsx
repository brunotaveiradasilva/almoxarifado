import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { redimensionarAvatar } from '../lib/avatar'
import { trocarSenha, ErroApi } from '../lib/api'

interface Props {
  usuario: string
  avatar: string | null
  aoTrocarFoto: (avatar: string | null) => Promise<void>
  aoFechar: () => void
}

/**
 * Conta de quem está logado: foto (trocar/remover) e troca de senha, num lugar só. Diálogo próprio
 * (não o <Modal> genérico) porque são ações independentes, cada uma com o seu botão.
 */
export function MinhaConta({ usuario, avatar, aoTrocarFoto, aoFechar }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const inputFotoRef = useRef<HTMLInputElement>(null)

  const [erro, setErro] = useState('')
  const [enviandoFoto, setEnviandoFoto] = useState(false)

  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [senhaTrocada, setSenhaTrocada] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  async function aoEscolherFoto(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return

    setErro('')
    setEnviandoFoto(true)
    try {
      await aoTrocarFoto(await redimensionarAvatar(arquivo))
    } catch {
      setErro('Não foi possível trocar a foto. Tente outra imagem.')
    } finally {
      setEnviandoFoto(false)
    }
  }

  async function removerFoto() {
    setErro('')
    setEnviandoFoto(true)
    try {
      await aoTrocarFoto(null)
    } catch {
      setErro('Não foi possível remover a foto. Tente de novo.')
    } finally {
      setEnviandoFoto(false)
    }
  }

  async function salvarSenha(e: FormEvent) {
    e.preventDefault()
    setSenhaTrocada(false)
    if (!senhaAtual) return setErro('Informe a senha atual.')
    if (novaSenha.length < 4) return setErro('A nova senha precisa ter pelo menos 4 caracteres.')
    if (novaSenha !== confirmarSenha) return setErro('As senhas não coincidem.')

    setErro('')
    setSalvandoSenha(true)
    try {
      await trocarSenha(senhaAtual, novaSenha)
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
      setSenhaTrocada(true)
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível trocar a senha. Tente de novo.')
    } finally {
      setSalvandoSenha(false)
    }
  }

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault()
        aoFechar()
      }}
    >
      <div className="dlg-head">
        <h3>Minha conta</h3>
        <button type="button" className="icon-btn" onClick={aoFechar} aria-label="Fechar">
          &times;
        </button>
      </div>

      <div className="dlg-body">
        <div className="conta-perfil">
          <span className="conta-avatar" aria-hidden="true">
            {avatar ? <img src={avatar} alt="" /> : <span>{usuario.charAt(0).toUpperCase()}</span>}
          </span>
          <div className="conta-perfil-info">
            <strong>{usuario}</strong>
            <div className="conta-perfil-acoes">
              <button
                type="button"
                className="btn btn-sm"
                disabled={enviandoFoto}
                onClick={() => inputFotoRef.current?.click()}
              >
                {enviandoFoto ? 'Salvando…' : avatar ? 'Trocar foto' : 'Adicionar foto'}
              </button>
              {avatar ? (
                <button type="button" className="btn btn-sm btn-ghost btn-danger" disabled={enviandoFoto} onClick={removerFoto}>
                  Remover foto
                </button>
              ) : null}
            </div>
          </div>
          <input ref={inputFotoRef} type="file" accept="image/*" hidden onChange={aoEscolherFoto} />
        </div>

        <form className="conta-senha" onSubmit={salvarSenha}>
          <h4>Trocar senha</h4>
          <div className="field">
            <label htmlFor="mc-atual">Senha atual</label>
            <input
              id="mc-atual"
              type="password"
              autoComplete="current-password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
            />
          </div>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="mc-nova">Nova senha</label>
              <input
                id="mc-nova"
                type="password"
                autoComplete="new-password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="mc-confirma">Confirmar nova senha</label>
              <input
                id="mc-confirma"
                type="password"
                autoComplete="new-password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
            </div>
          </div>
          <div className="conta-senha-rodape">
            {senhaTrocada ? <span className="conta-ok">Senha trocada.</span> : null}
            <button className="btn btn-primary btn-sm" type="submit" disabled={salvandoSenha}>
              {salvandoSenha ? 'Salvando…' : 'Salvar nova senha'}
            </button>
          </div>
        </form>
      </div>

      <div className="dlg-foot">
        {erro ? <span className="msg">{erro}</span> : null}
        <button type="button" className="btn" onClick={aoFechar}>
          Fechar
        </button>
      </div>
    </dialog>
  )
}
