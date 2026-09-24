import { ConsultaEspecialistaPet } from './ConsultaEspecialistaPet'
import { SUBABAS_CAMPANHAS, type SubabaCampanhas } from '../lib/navegacao'

interface Props {
  subaba: SubabaCampanhas
  aoMudarSubaba: (subaba: SubabaCampanhas) => void
}

/** Campanhas comerciais. A navegação entre as subabas fica no menu lateral; as abas daqui só aparecem no celular. */
export function PainelCampanhas({ subaba, aoMudarSubaba }: Props) {
  return (
    <section className="view" role="tabpanel">
      <div className="view-head">
        <div>
          <h2>{SUBABAS_CAMPANHAS.find((s) => s.valor === subaba)?.rotulo ?? 'Campanhas'}</h2>
        </div>
      </div>

      <nav className="tabs tabs-so-celular" role="tablist">
        {SUBABAS_CAMPANHAS.map((s) => (
          <button key={s.valor} role="tab" aria-selected={subaba === s.valor} onClick={() => aoMudarSubaba(s.valor)}>
            {s.rotulo}
          </button>
        ))}
      </nav>

      {subaba === 'especialistaPet' ? <ConsultaEspecialistaPet /> : null}
    </section>
  )
}
