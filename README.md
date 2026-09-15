# Almoxarifado em Agenda

Controle de retirada e devolução de materiais: cadastro dos itens, agendamento por período, responsável, cliente e marcação automática de atrasos. Front-end em React, TypeScript e Vite; os dados ficam num banco de verdade, servidos pela [almoxarifado-api](https://github.com/brunotaveiradasilva/almoxarifado-api) (Java), para acessar de qualquer computador.

![Tela de agendamentos](docs/agendamentos.png)

## O que ele resolve

Quem empresta equipamento — almoxarifado, escola, locadora, equipe de campo — costuma controlar isso em planilha, e a planilha não avisa quando um item passou da data nem impede reservar três projetores quando só existem dois. O app cobre esses dois pontos:

- **Atraso é calculado, não digitado.** Todo agendamento que ainda não voltou e passou da data de devolução aparece como *Atrasado*, com quantos dias, sem ninguém precisar marcar nada.
- **Disponibilidade por período.** Ao agendar, o app soma o que já está comprometido naquelas datas e avisa quando a quantidade pedida passa do estoque cadastrado.

## Funcionalidades

- Cadastro de materiais com nome, código/patrimônio, quantidade em estoque e observação
- Agendamento com material, quantidade, responsável, cliente, data de retirada, data de devolução, status e observação
- Status *Agendado → Retirado → Devolvido*, com botões de um clique na própria linha
- Painel do dia: retiradas de hoje, devoluções de hoje, itens em posse e atrasados
- Busca por material, responsável, cliente ou observação, e filtros por status
- Sugestão automática de clientes já cadastrados
- Barra de ocupação por material (quanto está fora do estoque)
- Tema claro e escuro, seguindo a preferência do sistema
- Dados centralizados na [almoxarifado-api](https://github.com/brunotaveiradasilva/almoxarifado-api): o mesmo cadastro aparece em qualquer computador
- Login obrigatório: nada do almoxarifado carrega sem entrar com usuário e senha

![Cadastro de materiais](docs/materiais.png)

## Stack

| Camada | Escolha |
| --- | --- |
| Interface | React 19 + TypeScript |
| Build | Vite |
| Estilo | CSS puro com variáveis (temas claro/escuro) |
| Persistência | API própria ([almoxarifado-api](https://github.com/brunotaveiradasilva/almoxarifado-api), Java + MySQL) |
| Deploy | GitHub Actions → GitHub Pages |

## Como rodar

Requer Node.js 20 ou superior, e a [almoxarifado-api](https://github.com/brunotaveiradasilva/almoxarifado-api) rodando (`docker compose up` nela é o caminho mais rápido).

```bash
git clone https://github.com/brunotaveiradasilva/almoxarifado.git
cd almoxarifado
npm install
cp .env.example .env   # VITE_API_URL — por padrão já aponta pro localhost:8080
npm run dev
```

O app sobe em `http://localhost:5173`. Na primeira tela há o botão **Carregar dados de exemplo**, útil para ver tudo funcionando antes de cadastrar os seus itens.

Outros comandos:

```bash
npm run build     # gera a versão de produção em dist/
npm run preview   # serve o que foi gerado em dist/
npm run lint      # análise estática com oxlint
```

## Estrutura

```
src/
├── App.tsx                  # guarda de login: decide entre TelaLogin e PainelAlmoxarifado
├── index.css                # identidade visual e temas
├── types.ts                 # Material, Agendamento, Status
├── lib/
│   ├── datas.ts             # datas em ISO, formatação e diferença em dias
│   ├── regras.ts            # regras de negócio (atraso, disponibilidade, filtros)
│   ├── api.ts               # cliente HTTP da almoxarifado-api (anexa o token, trata 401)
│   ├── auth.ts              # sessão (token + usuário) salva no localStorage
│   └── idTemporario.ts      # id provisório pra UI otimista, até a API confirmar
├── hooks/
│   ├── useAlmoxarifado.ts   # estado da aplicação e ações que o alteram
│   └── useAuth.ts           # sessão do usuário: entrar, sair, erro de login
├── data/
│   └── exemplos.ts          # dados fictícios para demonstração
└── components/              # PainelAlmoxarifado (telas, abas, filtros e diálogos), TelaLogin e demais
```

As regras de negócio ficam em `src/lib/regras.ts`, separadas da interface: são funções puras que recebem os dados e devolvem o resultado, o que facilita testar e reaproveitar caso o projeto ganhe um back-end depois.

## Decisões de implementação

- **Datas como texto ISO (`AAAA-MM-DD`).** Comparar `"2026-09-08" < "2026-09-10"` é comparação de texto e não sofre com fuso horário — problema clássico ao usar `Date` para representar um dia do calendário.
- **Status derivado.** *Atrasado* não é gravado; é calculado a partir da data de devolução e do status atual. Não existe estado inconsistente para corrigir.
- **Estado em um hook só.** `useAlmoxarifado` concentra os dados e as ações, busca tudo da API ao montar, e mantém a UI otimista: cada ação atualiza a tela na hora e confirma com a API em seguida — se a API recusar, a mudança é desfeita e o erro some no rodapé.
- **`materialId` sem chave estrangeira.** Um agendamento guarda o id do material como texto solto, não uma relação de verdade — de propósito, porque excluir um material não pode apagar o histórico de quem já retirou aquele item.

## Deploy

O workflow em `.github/workflows/deploy.yml` publica no GitHub Pages a cada push na `main`. Para ativar:

1. No repositório, vá em **Settings → Pages** e, em *Source*, escolha **GitHub Actions**.
2. Em **Settings → Secrets and variables → Actions**, crie o secret `VITE_API_URL` com a URL pública da almoxarifado-api já publicada (ex: `https://almoxarifado-api.up.railway.app`).
3. Dê push na `main`. O site fica em `https://<seu-usuário>.github.io/<nome-do-repositório>/`.

O caminho base do build é ajustado automaticamente pelo workflow, através da variável `BASE_PATH`.

## Limitações conhecidas

- Materiais e agendamentos continuam sem permissão por usuário: qualquer login vê e edita todos.
  Só a aba **Metas** e o gerenciamento de **Usuários** são restritos a quem tem papel ADMIN.
- Não há histórico de alterações — só o estado atual de cada material e agendamento.
- Não existe "esqueci minha senha": trocar senha ou criar novo login se faz direto na
  [almoxarifado-api](https://github.com/brunotaveiradasilva/almoxarifado-api#login) por enquanto.

## Licença

MIT — veja [LICENSE](LICENSE).
