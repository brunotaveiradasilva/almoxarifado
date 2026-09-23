import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  texto: string
}

/**
 * Cobre a tela inteira com um carregamento e trava o app enquanto estiver montado: o resto da página
 * fica `inert` (nem clique nem Tab chegam nos botões), pra ninguém mexer no meio de uma operação longa.
 * Vai direto no body, fora do #root, senão ficaria inerte junto.
 */
export function CarregandoTelaInteira({ texto }: Props) {
  useEffect(() => {
    const raiz = document.getElementById('root')
    if (!raiz) return
    raiz.inert = true
    return () => {
      raiz.inert = false
    }
  }, [])

  return createPortal(
    <div className="carregando-tela" role="alert" aria-busy="true">
      <span className="carregando-tela-spinner" aria-hidden="true" />
      {texto}
    </div>,
    document.body,
  )
}
