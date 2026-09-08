import { somarDias } from '../lib/datas'
import { novoId } from '../lib/armazenamento'
import type { Dados } from '../types'

/** Dados fictícios para conhecer o app sem precisar cadastrar nada. */
export function criarExemplos(): Dados {
  const furadeira = { id: novoId(), nome: 'Furadeira de impacto', codigo: 'FER-014', estoque: 3, obs: 'Maleta com brocas no armário 2.' }
  const projetor = { id: novoId(), nome: 'Projetor multimídia', codigo: 'AUD-002', estoque: 2, obs: 'Acompanha cabo HDMI e controle.' }
  const escada = { id: novoId(), nome: 'Escada de alumínio 6 degraus', codigo: 'EST-007', estoque: 4, obs: '' }

  return {
    materiais: [furadeira, projetor, escada],
    agendamentos: [
      {
        id: novoId(),
        materialId: projetor.id,
        qtd: 1,
        responsavel: 'Marina Alves',
        cliente: 'Colégio Santa Cruz',
        retirada: somarDias(-6),
        devolucao: somarDias(-2),
        status: 'retirado',
        obs: 'Treinamento na sala 3.',
      },
      {
        id: novoId(),
        materialId: furadeira.id,
        qtd: 1,
        responsavel: 'Carlos Prado',
        cliente: 'Construtora Vale Verde',
        retirada: somarDias(0),
        devolucao: somarDias(2),
        status: 'agendado',
        obs: 'Instalação das prateleiras.',
      },
      {
        id: novoId(),
        materialId: escada.id,
        qtd: 2,
        responsavel: 'Equipe de manutenção',
        cliente: '',
        retirada: somarDias(1),
        devolucao: somarDias(4),
        status: 'agendado',
        obs: 'Uso interno.',
      },
      {
        id: novoId(),
        materialId: projetor.id,
        qtd: 1,
        responsavel: 'Júlia Ferraz',
        cliente: 'Colégio Santa Cruz',
        retirada: somarDias(-12),
        devolucao: somarDias(-9),
        status: 'devolvido',
        obs: 'Devolvido sem o controle; reposto depois.',
      },
    ],
  }
}
