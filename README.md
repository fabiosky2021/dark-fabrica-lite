# Dark Factory Lite

Crie uma aplicação web chamada FÁBRICA DARK IA LITE.

IMPORTANTE:
Esta é a PRIMEIRA VERSÃO de um projeto maior. O objetivo é criar uma interface React extremamente leve, profissional e funcional, preparada para futuramente receber agentes de IA, APIs, geração de imagens, voz, vídeo, analytics e automação.

NÃO criar neste momento:

Docker

n8n

Redis

workers

processamento de vídeo local

modelos de IA locais

Ollama

FFmpeg

scraping pesado

banco de dados complexo

autenticação complexa

pagamentos

múltiplos servidores

dependências desnecessárias

A prioridade absoluta é:
LEVEZA + VELOCIDADE + ORGANIZAÇÃO + UX PROFISSIONAL + ARQUITETURA PREPARADA PARA EVOLUÇÃO.

A aplicação deve funcionar muito bem em computadores fracos e também em celulares.

==================================================
OBJETIVO

Criar o primeiro protótipo da Fábrica Dark IA, uma central para produção de conteúdo de canais Dark.

Fluxo principal:

IDEIA
→ ESTRATÉGIA
→ ROTEIRO
→ STORYBOARD
→ PROMPTS VISUAIS
→ THUMBNAIL
→ TÍTULO
→ SEO
→ REVISÃO
→ PROJETO FINAL

Nesta primeira versão os agentes podem funcionar como módulos simulados/localmente, produzindo resultados demonstrativos a partir dos dados fornecidos pelo usuário.

A arquitetura deve permitir posteriormente conectar APIs reais de IA.

==================================================
IDENTIDADE

Nome:
Fábrica Dark IA

Subtítulo:
Sua linha de produção de conteúdo com inteligência artificial.

Estilo visual:

dark premium

moderno

cinematográfico

tecnológico

profissional

minimalista

sem excesso de efeitos

aparência de software SaaS profissional

Evitar:

visual infantil

excesso de neon

excesso de animações

interfaces poluídas

gradientes exagerados

componentes gigantes

Usar:

fundo escuro

cards discretos

bordas sutis

boa hierarquia visual

tipografia limpa

ícones simples

responsividade

acessibilidade

==================================================
TECNOLOGIA

Usar:

React
Vite
TypeScript
Tailwind CSS

Preferir componentes simples.

Não adicionar bibliotecas externas sem necessidade.

Se uma funcionalidade puder ser implementada com React + CSS + JavaScript, fazer dessa maneira.

O projeto deve ser facilmente executável com:

npm install
npm run dev

==================================================
ARQUITETURA

Criar estrutura semelhante a:

src/
├── components/
├── pages/
├── modules/
├── agents/
├── data/
├── hooks/
├── services/
├── types/
├── utils/
└── App.tsx

Criar agentes como módulos independentes.

agents/
├── orchestrator.ts
├── strategist.ts
├── writer.ts
├── director.ts
├── thumbnail.ts
└── seo.ts

Os agentes NÃO precisam chamar APIs nesta primeira versão.

Eles devem possuir interfaces bem definidas para futuramente receber uma API.

Exemplo conceitual:

AgentInput
AgentOutput

==================================================
JSON DE CONFIGURAÇÃO PRINCIPAL

Criar uma configuração central semelhante a:

{
"app": {
"name": "Fábrica Dark IA",
"version": "0.1.0",
"mode": "lite",
"language": "pt-BR"
},

"factory": {
"status": "ready",

"pipeline": [
  {
    "id": "strategy",
    "name": "Estratégia",
    "icon": "target",
    "status": "idle"
  },
  {
    "id": "script",
    "name": "Roteiro",
    "icon": "file-text",
    "status": "idle"
  },
  {
    "id": "storyboard",
    "name": "Storyboard",
    "icon": "clapperboard",
    "status": "idle"
  },
  {
    "id": "visual",
    "name": "Prompts Visuais",
    "icon": "image",
    "status": "idle"
  },
  {
    "id": "thumbnail",
    "name": "Thumbnail",
    "icon": "image",
    "status": "idle"
  },
  {
    "id": "seo",
    "name": "SEO",
    "icon": "search",
    "status": "idle"
  },
  {
    "id": "quality",
    "name": "Controle de Qualidade",
    "icon": "shield-check",
    "status": "idle"
  }
]


},

"channel": {
"name": "",
"niche": "",
"language": "pt-BR",
"format": "long-form",
"duration": "10-15"
},

"project": {
"title": "",
"idea": "",
"status": "draft"
},

"settings": {
"animations": true,
"reducedMotion": false,
"autoSave": true
}
}

==================================================
TELA PRINCIPAL

Criar Dashboard.

Sidebar:

🏠 Dashboard
🏭 Fábrica
💡 Ideias
✍️ Roteiros
🎬 Storyboards
🖼️ Thumbnails
📊 Analytics
🤖 Agentes
🧠 Memória
⚙️ Configurações

No topo:

FÁBRICA DARK IA

Status:
● Sistema pronto

Mostrar:

Produções
Ideias
Roteiros
Thumbnails
Projetos concluídos

==================================================
TELA "NOVA PRODUÇÃO"

Criar uma interface extremamente simples.

Título:

Nova produção

Campos:

Nome do canal

Nicho

Tema / ideia do vídeo

Duração

Idioma

Estilo

Botão:

🚀 INICIAR PRODUÇÃO

Exemplo preenchido:

Canal:
Filmes Bíblicos Épicos

Nicho:
Filmes bíblicos cinematográficos

Tema:
O último dia antes do Dilúvio

Duração:
10–15 minutos

Idioma:
Português Brasileiro

Estilo:
Cinematográfico

==================================================
ESTEIRA DE PRODUÇÃO

Após clicar em:

INICIAR PRODUÇÃO

mostrar uma esteira visual:

IDEIA
↓
ESTRATÉGIA
↓
ROTEIRO
↓
STORYBOARD
↓
VISUAL
↓
THUMBNAIL
↓
SEO
↓
QUALIDADE

Cada etapa deve possuir:

ícone

nome

status

progresso

resultado

Estados:

idle
processing
completed
error

Exemplo:

✓ Estratégia
✓ Roteiro
⟳ Storyboard
○ Visual
○ Thumbnail
○ SEO
○ Qualidade

==================================================
AGENTE CEO / ORQUESTRADOR

Criar uma área chamada:

🧠 CEO DA FÁBRICA

Descrição:

"O agente responsável por coordenar a produção."

Mostrar:

Status:
ONLINE

Missão atual:
Produzir próximo vídeo

Etapa:
Storyboard

Decisão:
Enviar produção para o agente visual.

Nesta versão isso é apenas simulação de orquestração.

==================================================
AGENTE DE ESTRATÉGIA

Quando executado, gerar um resultado demonstrativo:

Tema:
O último dia antes do Dilúvio

Ângulo:
Mostrar as últimas horas antes do início do Dilúvio.

Objetivo:
Criar curiosidade e retenção.

Público:
Pessoas interessadas em histórias bíblicas cinematográficas.

Potencial:
92/100

==================================================
AGENTE DE ROTEIRO

Criar um editor de roteiro.

Estrutura:

HOOK

CONTEXTO

PERSONAGENS

CONFLITO

ESCALADA

CLÍMAX

RESOLUÇÃO

CTA

Mostrar contador:

Palavras
Caracteres
Duração estimada

Permitir editar o roteiro.

==================================================
AGENTE DIRETOR

Transformar o roteiro em storyboard.

Cada cena deve aparecer em um card.

Exemplo:

CENA 01

Duração:
8 segundos

Local:
Cidade antiga

Personagem:
Noé

Ação:
Noé observa o céu.

Câmera:
Plano aberto cinematográfico.

Emoção:
Pressentimento.

Prompt visual:
Cinematic ancient biblical city...

Criar botão:

Adicionar cena

E permitir editar cenas.

==================================================
AGENTE DE PROMPTS VISUAIS

Para cada cena criar:

Prompt principal

Negative Prompt

Estilo

Câmera

Iluminação

Aspect ratio

Exemplo:

Prompt:

"Cinematic biblical epic, ancient world, dramatic clouds, realistic characters, volumetric lighting, epic composition, highly detailed..."

Negative:

"low quality, blurry, distorted face, extra fingers..."

Não gerar imagem nesta primeira versão.

Apenas preparar os prompts.

==================================================
AGENTE THUMBNAIL

Criar painel para 3 conceitos de thumbnail.

CONCEITO A
Personagem + ameaça

CONCEITO B
Grande momento dramático

CONCEITO C
Mistério + personagem

Cada conceito possui:

Título
Descrição
Composição
Texto sugerido
Emoção
Prompt

Mostrar uma pontuação:

CTR POTENCIAL
92/100

Não gerar imagens nesta versão.

Preparar a arquitetura para conectar futuramente um gerador de imagens.

==================================================
AGENTE SEO

Gerar:

5 títulos

Descrição

Palavras-chave

Hashtags

Capítulos

Tags

Cada título deve receber:

CTR estimado

Curiosidade

Clareza

Potencial

Exemplo:

NINGUÉM ACREDITOU EM NOÉ — ATÉ O CÉU SE ABRIR

CTR potencial:
94/100

==================================================
CONTROLE DE QUALIDADE

Criar painel:

QUALIDADE DA PRODUÇÃO

Roteiro:
94

Narrativa:
91

Hook:
96

Continuidade:
88

SEO:
93

Thumbnail:
90

Pontuação geral:
92/100

Status:

✓ APROVADO

Criar também estado:

⚠️ PRECISA DE REVISÃO

==================================================
HISTÓRICO

Criar página:

Produções anteriores

Cada projeto mostra:

Nome
Nicho
Data
Status
Score
Etapa

Exemplo:

"O Último Dia Antes do Dilúvio"

Status:
Concluído

Score:
92

Botões:

Abrir
Duplicar
Excluir

==================================================
MEMÓRIA / CHANNEL DNA

Criar página:

🧠 DNA DO CANAL

Campos:

Nicho

Tom narrativo

Estilo visual

Duração padrão

Tipo de hook

Estilo de thumbnail

Tipo de título

Voz

Público

Regras do canal

A memória deve ficar preparada para futuramente ser persistida em banco de dados.

Nesta versão utilizar localStorage.

==================================================
PERSISTÊNCIA

Não usar banco de dados nesta primeira versão.

Utilizar:

localStorage

Salvar:

configurações

canais

projetos

roteiros

cenas

thumbnails

SEO

histórico

Criar uma camada:

storageService

para que futuramente seja possível substituir:

localStorage

por:

Supabase

sem modificar os componentes da interface.

==================================================
RESPONSIVIDADE

A aplicação deve funcionar em:

Desktop
Notebook
Tablet
Celular

No celular:

Sidebar vira menu recolhível.

Cards ficam empilhados.

Botões ocupam largura adequada.

Evitar tabelas largas.

==================================================
PERFORMANCE

MUITO IMPORTANTE.

Este projeto será utilizado em um notebook com aproximadamente 2 GB de RAM.

Portanto:

não executar IA localmente;

não instalar modelos;

não usar processamento pesado;

não usar canvas pesado;

não usar vídeos automaticamente;

não carregar bibliotecas gigantes;

evitar animações contínuas;

evitar partículas;

evitar efeitos WebGL;

evitar background animado;

usar lazy loading quando fizer sentido;

manter bundle pequeno.

A aplicação deve parecer premium sem depender de efeitos pesados.

==================================================
MODO DEMONSTRAÇÃO

Criar botão:

🎬 DEMO

Ao clicar, carregar automaticamente um projeto demonstrativo:

Canal:
Filmes Bíblicos Épicos

Projeto:
O Último Dia Antes do Dilúvio

E preencher toda a esteira com dados de exemplo.

Isso permitirá testar a interface sem API.

==================================================
FUTURO

Criar uma seção:

ROADMAP

Mostrar:

FASE 1
✓ Interface Lite
✓ Projetos
✓ Agentes simulados
✓ LocalStorage
✓ Pipeline

FASE 2
○ API de IA
○ Geração real de roteiros
○ Geração de prompts
○ geração de thumbnails

FASE 3
○ Supabase
○ Autenticação
○ Memória
○ Analytics

FASE 4
○ n8n
○ Automação
○ Publicação
○ Agentes reais

FASE 5
○ Geração de vídeo
○ Multi-canais
○ SaaS
○ Monetização

==================================================
ARQUITETURA PARA FUTURAS APIs

Criar uma camada:

services/

aiService.ts

imageService.ts

voiceService.ts

videoService.ts

youtubeService.ts

analyticsService.ts

Todos inicialmente devem retornar dados simulados.

Exemplo:

aiService.generateScript()

imageService.generatePrompt()

voiceService.generateVoice()

videoService.renderVideo()

No futuro essas funções serão conectadas às APIs reais.

==================================================
REGRAS IMPORTANTES

Não criar funcionalidades fictícias que dependam de backend inexistente.

Quando algo ainda não estiver conectado, mostrar claramente:

"Modo demonstração"

Não inventar integração com APIs.

Não instalar dependências sem necessidade.

Priorizar código simples.

Priorizar manutenção.

Criar componentes reutilizáveis.

Usar TypeScript corretamente.

Evitar código duplicado.

Não modificar configurações do sistema operacional.

Não adicionar Docker.

Não adicionar servidor local pesado.

Não criar processamento de IA no navegador.

Não criar automação 24h nesta primeira versão.

A aplicação deve ser uma base sólida para evolução futura.

==================================================
RESULTADO ESPERADO

Ao finalizar, quero uma aplicação React funcional com aparência de um verdadeiro software SaaS chamado:

🏭 FÁBRICA DARK IA

O usuário deve conseguir:

criar um canal;

criar um projeto;

inserir uma ideia;

iniciar a produção;

visualizar os agentes trabalhando;

visualizar roteiro;

visualizar storyboard;

visualizar prompts;

criar conceitos de thumbnail;

gerar títulos;

revisar qualidade;

salvar o projeto;

consultar projetos anteriores;

editar o DNA do canal.

Tudo deve funcionar no modo demonstração sem depender de API externa.

==================================================
CRITÉRIO DE SUCESSO

O projeto será considerado pronto quando eu conseguir abrir a aplicação e fazer:

NOVO PROJETO
→ inserir ideia
→ clicar PRODUZIR
→ acompanhar a esteira
→ receber roteiro
→ receber storyboard
→ receber prompts
→ receber conceitos de thumbnail
→ receber títulos e SEO
→ receber score de qualidade
→ salvar o projeto

SEM PRECISAR CONFIGURAR API.

Depois dessa primeira versão, NÃO reescrever o projeto.

A próxima evolução deverá conectar as APIs reais gradualmente.

Antes de adicionar qualquer dependência, avaliar se a funcionalidade pode ser feita com React, TypeScript, CSS e APIs nativas do navegador.

Prioridade final:

FUNCIONAR

SER LEVE

SER BONITO

SER FÁCIL DE USAR

SER FÁCIL DE EVOLUIR

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://dark-fabrica-lite.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c437dfe7-07aa-4bef-8d71-b77b02bc86cf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
