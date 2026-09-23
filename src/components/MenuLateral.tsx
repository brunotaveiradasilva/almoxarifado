import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { redimensionarAvatar } from '../lib/avatar'
import { IconeMateriais, IconeMetas } from './IconesMenu'
import { SUBABAS_METAS, type SubabaMetas } from './PainelMetas'

export type AbaPrincipal = 'materiais' | 'metas'

interface Props {
  aba: AbaPrincipal
  isAdmin: boolean
  usuario: string
  avatar: string | null
  aoMudarAba: (aba: AbaPrincipal) => void
  subabaMetas: SubabaMetas
  aoMudarSubabaMetas: (subaba: SubabaMetas) => void
  aoAbrirUsuarios: () => void
  aoAbrirTrocarSenha: () => void
  aoSair: () => void
  aoTrocarFoto: (avatar: string | null) => Promise<void>
}

/** Menu vertical fixo à esquerda: navegação principal em cima, conta logada (com menu) no rodapé. */
export function MenuLateral({
  aba,
  isAdmin,
  usuario,
  avatar,
  aoMudarAba,
  subabaMetas,
  aoMudarSubabaMetas,
  aoAbrirUsuarios,
  aoAbrirTrocarSenha,
  aoSair,
  aoTrocarFoto,
}: Props) {
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
    <aside className="menu-lateral">
      <div className="menu-lateral-marca">SulBiologic</div>

      <nav className="menu-lateral-nav" aria-label="Navegação principal">
        <button
          type="button"
          className={`menu-lateral-item${aba === 'materiais' ? ' is-ativo' : ''}`}
          aria-current={aba === 'materiais' ? 'page' : undefined}
          onClick={() => aoMudarAba('materiais')}
        >
          <IconeMateriais />
          <span>Materiais</span>
        </button>

        {isAdmin ? (
          <button
            type="button"
            className={`menu-lateral-item${aba === 'metas' ? ' is-ativo' : ''}`}
            aria-current={aba === 'metas' ? 'page' : undefined}
            onClick={() => aoMudarAba('metas')}
          >
            <IconeMetas />
            <span>Metas</span>
          </button>
        ) : null}

        {isAdmin && aba === 'metas' ? (
          <div className="menu-lateral-subitens">
            {SUBABAS_METAS.map((s) => (
              <button
                key={s.valor}
                type="button"
                className={`menu-lateral-subitem${subabaMetas === s.valor ? ' is-ativo' : ''}`}
                aria-current={subabaMetas === s.valor ? 'page' : undefined}
                onClick={() => aoMudarSubabaMetas(s.valor)}
              >
                {s.rotulo}
              </button>
            ))}
          </div>
        ) : null}
      </nav>

      <div className="menu-lateral-conta" ref={containerRef}>
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

        <button
          type="button"
          className={`menu-lateral-rodape${aberto ? ' is-ativo' : ''}`}
          onClick={() => setAberto((a) => !a)}
          aria-label="Menu do usuário"
          aria-expanded={aberto}
        >
          <span className="avatar-btn" aria-hidden="true">
            {avatar ? <img src={avatar} alt="" /> : <span>{usuario.charAt(0).toUpperCase()}</span>}
          </span>
          <span className="menu-lateral-usuario">{usuario}</span>
        </button>

        <input ref={inputRef} type="file" accept="image/*" hidden onChange={aoEscolherArquivo} />
      </div>
    </aside>
  )
}
