import { useEffect, useRef, useState, type FormEvent } from 'react'
import { criarUsuario, excluirUsuario, listarUsuarios, ErroApi } from '../lib/api'

interface Props {
  usuarioAtual: string
  aoFechar: () => void
}

/**
 * Diálogo próprio (não o <Modal> genérico) porque aqui tem várias ações independentes —
 * excluir cada linha, criar um novo — em vez de um formulário só com "confirmar".
 */
export function PainelUsuarios({ usuarioAtual, aoFechar }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  const [usuarios, setUsuarios] = useState<string[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [novoUsuario, setNovoUsuario] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [criando, setCriando] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    setErro('')
    try {
      setUsuarios(await listarUsuarios())
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível carregar os usuários.')
    } finally {
      setCarregando(false)
    }
  }

  async function adicionar(e: FormEvent) {
    e.preventDefault()
    if (!novoUsuario.trim()) return setErro('Informe o nome do novo usuário.')
    if (novaSenha.length < 4) return setErro('A senha precisa ter pelo menos 4 caracteres.')

    setErro('')
    setCriando(true)
    try {
      await criarUsuario(novoUsuario.trim(), novaSenha)
      setNovoUsuario('')
      setNovaSenha('')
      await carregar()
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível criar o usuário.')
    } finally {
      setCriando(false)
    }
  }

  async function remover(usuario: string) {
    if (!window.confirm(`Excluir o login "${usuario}"? Essa pessoa não vai mais conseguir entrar.`)) return

    setErro('')
    try {
      await excluirUsuario(usuario)
      await carregar()
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível excluir esse usuário.')
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
        <h3>Usuários</h3>
        <button type="button" className="icon-btn" onClick={aoFechar} aria-label="Fechar">
          &times;
        </button>
      </div>

      <div className="dlg-body">
        {carregando ? (
          <p className="hint">Carregando…</p>
        ) : (
          <ul className="lista-usuarios">
            {usuarios.map((u) => (
              <li key={u}>
                <span>
                  {u}
                  {u === usuarioAtual ? <span className="hint"> (você)</span> : null}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost btn-danger"
                  disabled={usuarios.length <= 1}
                  title={usuarios.length <= 1 ? 'Não dá para excluir o único login que existe' : undefined}
                  onClick={() => remover(u)}
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        )}

        <form className="form-novo-usuario" onSubmit={adicionar}>
          <div className="field">
            <label htmlFor="nu-usuario">Novo usuário</label>
            <input
              id="nu-usuario"
              value={novoUsuario}
              onChange={(e) => setNovoUsuario(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="nu-senha">Senha</label>
            <input
              id="nu-senha"
              type="password"
              autoComplete="new-password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-sm" type="submit" disabled={criando}>
            {criando ? 'Criando…' : '+ Adicionar'}
          </button>
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
