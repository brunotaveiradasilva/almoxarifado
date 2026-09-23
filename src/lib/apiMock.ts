import { somarDias } from './datas'
import { mesAtual, mesFechado, somarMeses } from './mes'
import type {
  Agendamento,
  Fornecedor,
  Material,
  Meta,
  MetaRepresentante,
  Representante,
  Role,
  Status,
  TotalVendidoMensal,
  UnidadeMeta,
} from '../types'

/**
 * Backend falso, só em memória, usado quando VITE_MOCK_API=true (sem precisar da almoxarifado-api
 * nem de Docker rodando). Login aceita qualquer usuário/senha como ADMIN. Dados somem ao recarregar
 * a página — é só pra ver a interface funcionando com dados de exemplo.
 */

let contador = 0
function novoId(prefixo: string): string {
  contador += 1
  return `${prefixo}-${contador}`
}

function achar<T extends { id: string }>(lista: T[], id: string): T {
  const item = lista.find((i) => i.id === id)
  if (!item) throw new Error(`mock: id "${id}" não encontrado`)
  return item
}

let avatar: string | null = null
const usuarios = new Set(['admin'])

let materiais: Material[] = [
  { id: novoId('mat'), nome: 'Furadeira de impacto', codigo: 'FER-014', estoque: 3, obs: 'Maleta com brocas no armário 2.' },
  { id: novoId('mat'), nome: 'Projetor multimídia', codigo: 'AUD-002', estoque: 2, obs: 'Acompanha cabo HDMI e controle.' },
  { id: novoId('mat'), nome: 'Escada de alumínio 6 degraus', codigo: 'EST-007', estoque: 4, obs: '' },
]

let agendamentos: Agendamento[] = [
  {
    id: novoId('age'),
    materialId: materiais[1].id,
    qtd: 1,
    responsavel: 'Marina Alves',
    cliente: 'Colégio Santa Cruz',
    retirada: somarDias(-6),
    devolucao: somarDias(-2),
    status: 'retirado',
    obs: 'Treinamento na sala 3.',
  },
  {
    id: novoId('age'),
    materialId: materiais[0].id,
    qtd: 1,
    responsavel: 'Carlos Prado',
    cliente: 'Construtora Vale Verde',
    retirada: somarDias(0),
    devolucao: somarDias(2),
    status: 'agendado',
    obs: 'Instalação das prateleiras.',
  },
  {
    id: novoId('age'),
    materialId: materiais[2].id,
    qtd: 2,
    responsavel: 'Equipe de manutenção',
    cliente: '',
    retirada: somarDias(1),
    devolucao: somarDias(4),
    status: 'agendado',
    obs: 'Uso interno.',
  },
  {
    id: novoId('age'),
    materialId: materiais[1].id,
    qtd: 1,
    responsavel: 'Júlia Ferraz',
    cliente: 'Colégio Santa Cruz',
    retirada: somarDias(-12),
    devolucao: somarDias(-9),
    status: 'devolvido',
    obs: 'Devolvido sem o controle; reposto depois.',
  },
]

let fornecedores: Fornecedor[] = [
  { id: novoId('for'), nome: 'Vetnil' },
  { id: novoId('for'), nome: 'Ceva Saúde Animal' },
]

let representantes: Representante[] = [
  { id: novoId('rep'), nome: 'Marina Alves', fornecedores: [fornecedores[0]], email: 'marina@exemplo.com', celular: '(11) 99999-0001', codigoAds: '', totalVendidoAds: null },
  { id: novoId('rep'), nome: 'Carlos Prado', fornecedores: [fornecedores[0], fornecedores[1]], email: 'carlos@exemplo.com', celular: '(11) 99999-0002', codigoAds: '', totalVendidoAds: null },
]

let metas: Meta[] = [
  { id: novoId('met'), nome: 'Vacina V10', fornecedor: fornecedores[0], unidade: 'UNIDADE', codigoAdsDivisao: '', cnpjAdsFornecedor: '', produtosExcluidos: '', produtosIncluidos: '', ordem: 0 },
  { id: novoId('met'), nome: 'Faturamento trimestral', fornecedor: fornecedores[1], unidade: 'REAL', codigoAdsDivisao: '', cnpjAdsFornecedor: '', produtosExcluidos: '', produtosIncluidos: '', ordem: 1 },
]

// Mês atual e o anterior, pra dar pra testar o filtro de mês e o "copiar do mês anterior".
const MES_ATUAL = mesAtual()
const MES_ANTERIOR = somarMeses(MES_ATUAL, -1)

let metasRepresentante: MetaRepresentante[] = [
  { id: novoId('mrp'), representante: representantes[0], meta: metas[0], mes: MES_ATUAL, valorMeta: 500, valorRealizado: 320 },
  { id: novoId('mrp'), representante: representantes[1], meta: metas[1], mes: MES_ATUAL, valorMeta: 80000, valorRealizado: 54000 },
  { id: novoId('mrp'), representante: representantes[0], meta: metas[0], mes: MES_ANTERIOR, valorMeta: 450, valorRealizado: 470 },
  { id: novoId('mrp'), representante: representantes[1], meta: metas[0], mes: MES_ANTERIOR, valorMeta: 300, valorRealizado: 210 },
  { id: novoId('mrp'), representante: representantes[1], meta: metas[1], mes: MES_ANTERIOR, valorMeta: 75000, valorRealizado: 81200 },
]

const totaisVendidos: TotalVendidoMensal[] = [
  { id: novoId('tvm'), representanteId: representantes[0].id, mes: MES_ATUAL, total: 98021.64 },
  { id: novoId('tvm'), representanteId: representantes[0].id, mes: MES_ANTERIOR, total: 112430.1 },
  { id: novoId('tvm'), representanteId: representantes[1].id, mes: MES_ANTERIOR, total: 87311.9 },
]

export function login(usuario: string): Promise<{ token: string; usuario: string; role: Role; avatar: string | null }> {
  return Promise.resolve({ token: 'mock-token', usuario: usuario.trim() || 'admin', role: 'ADMIN', avatar })
}

export function listarUsuarios(): Promise<string[]> {
  return Promise.resolve([...usuarios])
}

export function criarUsuario(usuario: string): Promise<void> {
  usuarios.add(usuario)
  return Promise.resolve()
}

export function excluirUsuario(usuario: string): Promise<void> {
  usuarios.delete(usuario)
  return Promise.resolve()
}

export function trocarSenha(): Promise<void> {
  return Promise.resolve()
}

export function atualizarAvatar(novoAvatar: string | null): Promise<void> {
  avatar = novoAvatar
  return Promise.resolve()
}

export function listarMateriais(): Promise<Material[]> {
  return Promise.resolve(materiais)
}

export function criarMaterial(material: Omit<Material, 'id'>): Promise<Material> {
  const novo = { ...material, id: novoId('mat') }
  materiais = [...materiais, novo]
  return Promise.resolve(novo)
}

export function atualizarMaterial(id: string, material: Omit<Material, 'id'>): Promise<Material> {
  const atualizado = { ...material, id }
  materiais = materiais.map((m) => (m.id === id ? atualizado : m))
  return Promise.resolve(atualizado)
}

export function excluirMaterial(id: string): Promise<void> {
  materiais = materiais.filter((m) => m.id !== id)
  return Promise.resolve()
}

export function listarAgendamentos(): Promise<Agendamento[]> {
  return Promise.resolve(agendamentos)
}

export function criarAgendamento(agendamento: Omit<Agendamento, 'id'>): Promise<Agendamento> {
  const novo = { ...agendamento, id: novoId('age') }
  agendamentos = [...agendamentos, novo]
  return Promise.resolve(novo)
}

export function atualizarAgendamento(id: string, agendamento: Omit<Agendamento, 'id'>): Promise<Agendamento> {
  const atualizado = { ...agendamento, id }
  agendamentos = agendamentos.map((a) => (a.id === id ? atualizado : a))
  return Promise.resolve(atualizado)
}

export function definirStatusAgendamento(id: string, status: Status): Promise<Agendamento> {
  const atualizado = { ...achar(agendamentos, id), status }
  agendamentos = agendamentos.map((a) => (a.id === id ? atualizado : a))
  return Promise.resolve(atualizado)
}

export function excluirAgendamento(id: string): Promise<void> {
  agendamentos = agendamentos.filter((a) => a.id !== id)
  return Promise.resolve()
}

export function listarFornecedores(): Promise<Fornecedor[]> {
  return Promise.resolve(fornecedores)
}

export function criarFornecedor(fornecedor: Omit<Fornecedor, 'id'>): Promise<Fornecedor> {
  const novo = { ...fornecedor, id: novoId('for') }
  fornecedores = [...fornecedores, novo]
  return Promise.resolve(novo)
}

export function atualizarFornecedor(id: string, fornecedor: Omit<Fornecedor, 'id'>): Promise<Fornecedor> {
  const atualizado = { ...fornecedor, id }
  fornecedores = fornecedores.map((f) => (f.id === id ? atualizado : f))
  return Promise.resolve(atualizado)
}

export function excluirFornecedor(id: string): Promise<void> {
  fornecedores = fornecedores.filter((f) => f.id !== id)
  return Promise.resolve()
}

interface RepresentanteEntradaMock {
  nome: string
  fornecedorIds: string[]
  email: string
  celular: string
  codigoAds: string
}

export function listarRepresentantes(): Promise<Representante[]> {
  return Promise.resolve(representantes)
}

export function criarRepresentante(representante: RepresentanteEntradaMock): Promise<Representante> {
  const novo: Representante = {
    id: novoId('rep'),
    nome: representante.nome,
    email: representante.email,
    celular: representante.celular,
    codigoAds: representante.codigoAds,
    totalVendidoAds: null,
    fornecedores: fornecedores.filter((f) => representante.fornecedorIds.includes(f.id)),
  }
  representantes = [...representantes, novo]
  return Promise.resolve(novo)
}

export function atualizarRepresentante(id: string, representante: RepresentanteEntradaMock): Promise<Representante> {
  const atualizado: Representante = {
    id,
    nome: representante.nome,
    email: representante.email,
    celular: representante.celular,
    codigoAds: representante.codigoAds,
    totalVendidoAds: achar(representantes, id).totalVendidoAds,
    fornecedores: fornecedores.filter((f) => representante.fornecedorIds.includes(f.id)),
  }
  representantes = representantes.map((r) => (r.id === id ? atualizado : r))
  return Promise.resolve(atualizado)
}

export function excluirRepresentante(id: string): Promise<void> {
  representantes = representantes.filter((r) => r.id !== id)
  return Promise.resolve()
}

interface MetaEntradaMock {
  nome: string
  fornecedorId: string
  unidade: UnidadeMeta
  codigoAdsDivisao: string
  cnpjAdsFornecedor: string
  produtosExcluidos: string
  produtosIncluidos: string
}

export function listarMetas(): Promise<Meta[]> {
  return Promise.resolve(metas)
}

export function criarMeta(meta: MetaEntradaMock): Promise<Meta> {
  const novo: Meta = {
    id: novoId('met'),
    nome: meta.nome,
    unidade: meta.unidade,
    codigoAdsDivisao: meta.codigoAdsDivisao,
    cnpjAdsFornecedor: meta.cnpjAdsFornecedor,
    produtosExcluidos: meta.produtosExcluidos,
    produtosIncluidos: meta.produtosIncluidos,
    ordem: metas.length,
    fornecedor: achar(fornecedores, meta.fornecedorId),
  }
  metas = [...metas, novo]
  return Promise.resolve(novo)
}

export function atualizarMeta(id: string, meta: MetaEntradaMock): Promise<Meta> {
  const atualizado: Meta = {
    id,
    nome: meta.nome,
    unidade: meta.unidade,
    codigoAdsDivisao: meta.codigoAdsDivisao,
    cnpjAdsFornecedor: meta.cnpjAdsFornecedor,
    produtosExcluidos: meta.produtosExcluidos,
    produtosIncluidos: meta.produtosIncluidos,
    ordem: metas.find((m) => m.id === id)?.ordem ?? null,
    fornecedor: achar(fornecedores, meta.fornecedorId),
  }
  metas = metas.map((m) => (m.id === id ? atualizado : m))
  return Promise.resolve(atualizado)
}

export function excluirMeta(id: string): Promise<void> {
  metas = metas.filter((m) => m.id !== id)
  return Promise.resolve()
}

/** Mesma regra da API: as da lista na ordem dela, as que faltarem no fim. */
export function ordenarMetas(ids: string[]): Promise<Meta[]> {
  const naLista = ids.map((id) => metas.find((m) => m.id === id)).filter((m): m is Meta => !!m)
  const resto = metas.filter((m) => !ids.includes(m.id))
  metas = [...naLista, ...resto].map((m, i) => ({ ...m, ordem: i }))
  return Promise.resolve(metas)
}

interface MetaRepresentanteEntradaMock {
  representanteId: string
  metaId: string
  mes: string
  valorMeta: number
}

export function listarMetasRepresentante(): Promise<MetaRepresentante[]> {
  return Promise.resolve(metasRepresentante)
}

export function listarTotaisVendidos(): Promise<TotalVendidoMensal[]> {
  return Promise.resolve(totaisVendidos)
}

/** Como a API: mês que já acabou não aceita mais mudança de meta. */
function recusarSeFechado(mes: string): Promise<never> | null {
  return mesFechado(mes) ? Promise.reject(new Error(`mock: o mês ${mes} já fechou`)) : null
}

export function criarMetaRepresentante(mv: MetaRepresentanteEntradaMock): Promise<MetaRepresentante> {
  const fechado = recusarSeFechado(mv.mes)
  if (fechado) return fechado
  const novo: MetaRepresentante = {
    id: novoId('mrp'),
    representante: achar(representantes, mv.representanteId),
    meta: achar(metas, mv.metaId),
    mes: mv.mes,
    valorMeta: mv.valorMeta,
    valorRealizado: 0,
  }
  metasRepresentante = [...metasRepresentante, novo]
  return Promise.resolve(novo)
}

/** Como a API: troca só o valor da meta, o realizado fica como está. */
export function atualizarMetaRepresentante(id: string, mv: MetaRepresentanteEntradaMock): Promise<MetaRepresentante> {
  const fechado = recusarSeFechado(achar(metasRepresentante, id).mes) ?? recusarSeFechado(mv.mes)
  if (fechado) return fechado
  const atualizado: MetaRepresentante = {
    ...achar(metasRepresentante, id),
    representante: achar(representantes, mv.representanteId),
    meta: achar(metas, mv.metaId),
    mes: mv.mes,
    valorMeta: mv.valorMeta,
  }
  metasRepresentante = metasRepresentante.map((m) => (m.id === id ? atualizado : m))
  return Promise.resolve(atualizado)
}

/** Como a API: copia só o que o mês de destino ainda não tem, com realizado zerado. */
export function copiarMetasRepresentante(de: string, para: string, fornecedorId?: string): Promise<MetaRepresentante[]> {
  const fechado = recusarSeFechado(para)
  if (fechado) return fechado
  const criadas = metasRepresentante
    .filter((m) => m.mes === de && (!fornecedorId || m.meta.fornecedor.id === fornecedorId))
    .filter(
      (m) =>
        !metasRepresentante.some(
          (outra) => outra.mes === para && outra.representante.id === m.representante.id && outra.meta.id === m.meta.id,
        ),
    )
    .map((m): MetaRepresentante => ({ ...m, id: novoId('mrp'), mes: para, valorRealizado: 0 }))
  metasRepresentante = [...metasRepresentante, ...criadas]
  return Promise.resolve(criadas)
}

export function excluirMetaRepresentante(id: string): Promise<void> {
  metasRepresentante = metasRepresentante.filter((m) => m.id !== id)
  return Promise.resolve()
}

/** No mock não tem ADS de verdade pra consultar — devolve a lista como está (nenhum representante/meta de exemplo tem código ADS cadastrado). */
export function sincronizarMetasRepresentante(mes: string): Promise<MetaRepresentante[]> {
  return Promise.resolve(metasRepresentante.filter((m) => m.mes === mes))
}
