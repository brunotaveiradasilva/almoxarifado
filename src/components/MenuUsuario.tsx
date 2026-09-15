import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { redimensionarAvatar } from '../lib/avatar'

interface Props {
  usuario: string
  avatar: string | null
  isAdmin: boolean
  aoAbrirUsuarios: () => void
  aoAbrirTrocarSenha: () => void
  aoSair: () => void
  aoTrocarFoto: (avatar: string | null) => Promise<void>
}

/** Avatar clicável no canto: abre um menu com trocar foto, usuários (admin), trocar senha e sair. */
export function MenuUsuario({ usuario, avatar, isAdmin, aoAbrirUsuarios, aoAbrirTrocarSenha, aoSair, aoTrocarFoto }: Props) {
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!aberto) return
    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [aberto])

  async function aoEscolherArquivo(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return

    try {
      const dataUrl = await redimensionarAvatar(arquivo)
      await aoTrocarFoto(dataUrl)
    } catch {
      window.alert('Não foi possível trocar a foto. Tente outra imagem.')
    }
    setAberto(false)
  }

  async function remover() {
    setAberto(false)
    try {
      await aoTrocarFoto(null)
    } catch {
      window.alert('Não foi possível remover a foto. Tente de novo.')
    }
  }

  return (
    <div className="menu-usuario" ref={containerRef}>
      <button
        type="button"
        className="avatar-btn"
        onClick={() => setAberto((a) => !a)}
        aria-label="Menu do usuário"
        aria-expanded={aberto}
      >
        {avatar ? <img src={avatar} alt="" /> : <span>{usuario.charAt(0).toUpperCase()}</span>}
      </button>

      {aberto ? (
        <div className="menu-dropdown" role="menu">
          <div className="menu-dropdown-usuario">{usuario}</div>
          <button type="button" role="menuitem" onClick={() => inputRef.current?.click()}>
            Alterar foto
          </button>
          {avatar ? (
            <button type="button" role="menuitem" onClick={remover}>
              Remover foto
            </button>
          ) : null}
          {isAdmin ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setAberto(false)
                aoAbrirUsuarios()
              }}
            >
              Usuários
            </button>
          ) : null}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setAberto(false)
              aoAbrirTrocarSenha()
            }}
          >
            Trocar senha
          </button>
          <button
            type="button"
            role="menuitem"
            className="menu-dropdown-sair"
            onClick={() => {
              setAberto(false)
              aoSair()
            }}
          >
            Sair
          </button>
        </div>
      ) : null}

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={aoEscolherArquivo} />
    </div>
  )
}
