# CIC — Centro de Inteligência de Campanhas
## Documentação Técnica para Back-End

---

### 1. VISÃO GERAL

O CIC é uma plataforma SaaS de inteligência para campanhas eleitorais.
Este pacote contém o front-end completo em React + Vite, pronto para integração com o back-end.

- **Framework:** React 18 + Vite 6
- **Componente único:** `src/CIC-LiquidGlass.jsx` (225k chars)
- **Estilo:** CSS-in-JS (inline styles)
- **Fontes:** Embeddadas em base64 (Adriana, BDSans)
- **Estado:** React useState/useEffect (sem Redux)

---

### 2. COMO RODAR

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build produção
npm run build

# Preview build
npm run preview
```

---

### 3. ESTRUTURA DO PROJETO

```
CIC-Projeto/
├── index.html              # Entry point HTML
├── package.json            # Dependências Node
├── vite.config.js          # Configuração Vite
├── .env.example            # Variáveis de ambiente
├── .gitignore
├── src/
│   ├── main.jsx            # Bootstrap React
│   └── CIC-LiquidGlass.jsx # Componente principal (toda a app)
├── public/
│   └── (assets estáticos)
└── docs/
    ├── README-BACKEND.md   # Este arquivo
    ├── API-ENDPOINTS.md    # Endpoints necessários
    ├── DATABASE-SCHEMA.md  # Schema do banco
    └── MODULES-MAP.md      # Mapa de módulos
```

---

### 4. MÓDULOS (19 total)

| # | ID sidebar | Componente React | Descrição |
|---|-----------|-----------------|-----------|
| 1 | dash | Dash | Dashboard geral com KPIs, countdown, calendário |
| 2 | demandas | CentralDemandas | Hub de operações — recebe demandas do cliente |
| 3 | diag | Diag | Diagnóstico: pesquisas, SWOT, cenários, posicionamento |
| 4 | mon | Mon | Monitoramento: redes, imprensa, adversários, crises |
| 5 | crm | CRMEleitores | CRM: base eleitoral, segmentos, interações, scoring IA |
| 6 | fund | Fundraising | Arrecadação: visão geral, doadores, compliance TSE |
| 7 | comm | Comunicacao | Comunicação: disparos, templates, automações, métricas |
| 8 | vol | Voluntarios | Voluntários: equipe, tarefas, campo, ranking |
| 9 | prod | Prod | Produção IA: fotos, jingles, roteiros, flyers, locução |
| 10 | social | SocialPublisher | Publicação social: agendar, calendário, analytics |
| 11 | agenda | AgendaCandidato | Agenda: hoje, semana, mês com briefing IA |
| 12 | debate | SimuladorDebate | Simulador de debate IA (exclusivo) |
| 13 | relat | Relatorios | Relatórios: gerar, histórico, configurar envio |
| 14 | pesq | PesquisasSurveys | Pesquisas: criar, ativas, resultados |
| 15 | gotv | GOTV | Dia da eleição: countdown, checklist, ações rápidas |
| 16 | mapa | MapaEleitoral | Mapa: visão geral, zonas, demográfico, prioridades IA |
| 17 | estr | Estr | Estratégica: decisões, matriz, narrativa, timeline |
| 18 | ia | IA | Assistente IA: chat com metodologia Fernando Carreiro |
| 19 | config | ConfigPage | Configurações: perfil, conta, notificações, plano, equipe |

---

### 5. EQUIPE E PERFIS DE ACESSO

#### 5.1 Membros (9)
| Nome | Email | Perfil | Módulos |
|------|-------|--------|---------|
| Marcos Oliveira | marcos@cic.com | Gerente de Campanha | Todos |
| Lucas Costa | lucas@cic.com | Produtor de Conteúdo | dash, demandas, prod, social, comm |
| Ana Martins | ana@cic.com | Coordenadora de Campo | dash, demandas, crm, comm, vol, mapa, gotv, pesq |
| Rafael Pereira | rafael@cic.com | Analista | dash, demandas, diag, mon, relat, pesq, mapa |
| Juliana Mendes | juliana@cic.com | Financeira | dash, demandas, fund, relat |
| Pedro Santos | pedro@cic.com | Coordenador de Campo | dash, demandas, crm, comm, vol, mapa, gotv, pesq |
| Diana Rocha | diana@cic.com | Curadora de Pesquisa | dash, demandas, diag, mon, pesq, mapa, relat |
| Bruno Tavares | bruno@cic.com | Roteirista de TV | dash, demandas, prod, social, debate, comm |
| Camila Freitas | camila@cic.com | Roteirista de Rádio | dash, demandas, prod, comm, agenda |

#### 5.2 Perfis de Acesso (9)
| Perfil | Permissões |
|--------|-----------|
| Administrador | Ler, Criar, Editar, Excluir, Aprovar, Configurar |
| Gerente de Campanha | Ler, Criar, Editar, Aprovar |
| Produtor de Conteúdo | Ler, Criar, Editar |
| Analista | Ler, Criar, Exportar |
| Coordenador de Campo | Ler, Criar, Editar |
| Financeiro | Ler, Criar, Exportar |
| Curador de Pesquisa | Ler, Criar, Editar, Exportar |
| Roteirista de TV | Ler, Criar, Editar |
| Roteirista de Rádio | Ler, Criar, Editar |

---

### 6. DADOS MOCK NO FRONT-END

O front-end contém dados mock em cada módulo para demonstração.
O back-end deve substituir por dados reais via API.

Dados mock incluem:
- Pesquisas eleitorais (4 institutos)
- 12 demandas de exemplo
- 8 eleitores no CRM
- 6 doadores
- 6 voluntários
- 6 compromissos na agenda
- Métricas de monitoramento
- Templates de comunicação
- Automações de fluxo

---

### 7. INTEGRAÇÕES NECESSÁRIAS

| Serviço | Uso | Prioridade |
|---------|-----|-----------|
| API de IA (OpenAI/Anthropic) | Assistente IA, Produção, Briefings, Debate | Alta |
| WhatsApp Business API | Disparos de mensagem | Alta |
| Twilio / SMS API | Disparos SMS | Alta |
| SendGrid / Email API | Disparos e-mail | Alta |
| Google Calendar API | Sync agenda do candidato | Média |
| Social Media APIs (Meta, X, TikTok) | Publicação + Monitoramento | Alta |
| TSE API / Dados eleitorais | Importação de dados | Média |
| Stripe / Gateway pagamento | Doações online | Média |
| AWS S3 / Cloudflare R2 | Storage de mídia gerada | Alta |
| WebSocket | Dados em tempo real (monitoramento) | Alta |

---

### 8. AUTENTICAÇÃO

O front-end tem tela de login com:
- Campo de e-mail e senha
- Botão "Entrar no CIC"
- Link "Esqueceu? Recuperar"
- Link "Novo? Solicitar"

**Implementar:**
- JWT com refresh token
- Login por e-mail/senha
- Recuperação de senha por e-mail
- Multi-campanha (um usuário pode ter acesso a várias campanhas)
- Permissões por módulo baseadas no perfil

---

### 9. FUNCIONALIDADES QUE REQUEREM BACK-END

#### 9.1 TEMPO REAL (WebSocket)
- Monitoramento de redes sociais (menções, sentimento)
- Alertas de crise
- Status online dos membros da equipe
- Countdown da eleição

#### 9.2 IA (API calls)
- Assistente IA (chat)
- Produção de conteúdo (fotos, jingles, roteiros, flyers, locução)
- Briefing automático por evento na agenda
- Sugestão de destinos para demandas
- Scoring de eleitores
- Recomendações estratégicas
- Simulador de debate (perguntas + feedback)
- Geração de pesquisas com IA

#### 9.3 CRUD COMPLETO
- Demandas (criar, editar, redistribuir, concluir)
- Eleitores/CRM (cadastro, importação, segmentação)
- Doadores (cadastro, doações, compliance)
- Voluntários (cadastro, tarefas, ações de campo)
- Compromissos da agenda
- Templates de comunicação
- Automações de fluxo
- Pesquisas/Surveys
- Relatórios (geração PDF, envio automático)

#### 9.4 DISPAROS EM MASSA
- WhatsApp (segmentado por perfil/região)
- SMS
- E-mail marketing
- Phone banking (discador)

#### 9.5 IMPORTAÇÃO/EXPORTAÇÃO
- Importar lista de eleitores (CSV/Excel)
- Importar dados do TSE
- Exportar relatórios (PDF/Excel)
- Exportar dados do CRM

