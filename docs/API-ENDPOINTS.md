# CIC — API Endpoints

## Base URL: `/api/v1`

---

## Autenticação
```
POST   /auth/login              # Login (email + senha) → JWT
POST   /auth/refresh             # Refresh token
POST   /auth/forgot-password     # Enviar email recuperação
POST   /auth/reset-password      # Redefinir senha
GET    /auth/me                  # Dados do usuário logado
```

## Campanhas
```
GET    /campaigns                # Listar campanhas do usuário
GET    /campaigns/:id            # Detalhes da campanha
POST   /campaigns                # Criar campanha
PUT    /campaigns/:id            # Editar campanha
DELETE /campaigns/:id            # Excluir campanha
```

## Dashboard
```
GET    /campaigns/:id/dashboard        # KPIs gerais
GET    /campaigns/:id/dashboard/health # Score de saúde
GET    /campaigns/:id/dashboard/alerts # Alertas ativos
```

## Demandas
```
GET    /campaigns/:id/demandas         # Listar (filtro: status, prioridade)
POST   /campaigns/:id/demandas         # Criar nova
PUT    /campaigns/:id/demandas/:did    # Editar
PATCH  /campaigns/:id/demandas/:did/status  # Mudar status
POST   /campaigns/:id/demandas/:did/distribute # Distribuir para centrais
POST   /campaigns/:id/demandas/:did/ai-suggest # IA sugerir destinos
```

## Diagnóstico
```
GET    /campaigns/:id/diagnostico/pesquisas     # Pesquisas eleitorais
GET    /campaigns/:id/diagnostico/swot          # Análise SWOT
GET    /campaigns/:id/diagnostico/cenarios      # Cenários projetados
GET    /campaigns/:id/diagnostico/posicionamento # Posicionamento por tema
POST   /campaigns/:id/diagnostico/pesquisas     # Adicionar pesquisa
```

## Monitoramento
```
GET    /campaigns/:id/monitoramento/redes       # Métricas redes sociais
GET    /campaigns/:id/monitoramento/imprensa    # Clipping imprensa
GET    /campaigns/:id/monitoramento/adversarios # Dados adversários
GET    /campaigns/:id/monitoramento/crises      # Crises ativas
GET    /campaigns/:id/monitoramento/mencoes     # Volume de menções (time series)
GET    /campaigns/:id/monitoramento/temas       # Temas em ascensão
WS     /campaigns/:id/monitoramento/live        # WebSocket tempo real
```

## CRM Eleitores
```
GET    /campaigns/:id/crm/eleitores             # Listar (filtro: perfil, região, score)
POST   /campaigns/:id/crm/eleitores             # Cadastrar
PUT    /campaigns/:id/crm/eleitores/:eid        # Editar
DELETE /campaigns/:id/crm/eleitores/:eid        # Excluir
POST   /campaigns/:id/crm/import               # Importar lista (CSV/Excel)
POST   /campaigns/:id/crm/import-tse           # Importar do TSE
GET    /campaigns/:id/crm/segmentos            # Segmentação
POST   /campaigns/:id/crm/segmentos            # Criar segmento
GET    /campaigns/:id/crm/interacoes           # Histórico interações
GET    /campaigns/:id/crm/scoring              # Distribuição de scores
POST   /campaigns/:id/crm/scoring/recalculate  # Recalcular scores (IA)
```

## Arrecadação
```
GET    /campaigns/:id/fundraising/overview      # Visão geral + meta
GET    /campaigns/:id/fundraising/doadores      # Listar doadores
POST   /campaigns/:id/fundraising/doadores      # Cadastrar doador
POST   /campaigns/:id/fundraising/doacoes       # Registrar doação
GET    /campaigns/:id/fundraising/compliance    # Status prestação de contas
POST   /campaigns/:id/fundraising/link          # Gerar link de doação
GET    /campaigns/:id/fundraising/relatorio-tse # Gerar relatório TSE
```

## Comunicação
```
POST   /campaigns/:id/comunicacao/disparos      # Enviar disparo
GET    /campaigns/:id/comunicacao/disparos      # Histórico disparos
GET    /campaigns/:id/comunicacao/templates     # Listar templates
POST   /campaigns/:id/comunicacao/templates     # Criar template
PUT    /campaigns/:id/comunicacao/templates/:tid # Editar template
GET    /campaigns/:id/comunicacao/automacoes    # Listar automações
POST   /campaigns/:id/comunicacao/automacoes    # Criar automação
PUT    /campaigns/:id/comunicacao/automacoes/:aid # Editar automação
GET    /campaigns/:id/comunicacao/metricas      # Métricas por canal
POST   /campaigns/:id/comunicacao/ai-generate   # IA gerar mensagem
```

## Voluntários
```
GET    /campaigns/:id/voluntarios               # Listar
POST   /campaigns/:id/voluntarios               # Cadastrar
PUT    /campaigns/:id/voluntarios/:vid          # Editar
GET    /campaigns/:id/voluntarios/tarefas       # Listar tarefas (kanban)
POST   /campaigns/:id/voluntarios/tarefas       # Criar tarefa
PATCH  /campaigns/:id/voluntarios/tarefas/:tid  # Mover tarefa (status)
GET    /campaigns/:id/voluntarios/campo         # Ações de campo
POST   /campaigns/:id/voluntarios/campo         # Criar ação
GET    /campaigns/:id/voluntarios/ranking       # Ranking semanal
```

## Produção IA
```
POST   /campaigns/:id/producao/gerar           # Gerar conteúdo (tipo + params)
GET    /campaigns/:id/producao/gerados         # Listar conteúdos gerados
PUT    /campaigns/:id/producao/gerados/:gid    # Aprovar/Rejeitar/Editar
POST   /campaigns/:id/producao/ai-chat         # Chat livre com IA
```

## Publicação Social
```
POST   /campaigns/:id/social/agendar           # Agendar post
GET    /campaigns/:id/social/agendados         # Listar agendados
PUT    /campaigns/:id/social/agendados/:pid    # Editar agendado
DELETE /campaigns/:id/social/agendados/:pid    # Cancelar
GET    /campaigns/:id/social/calendario        # Calendário editorial
GET    /campaigns/:id/social/analytics         # Analytics por plataforma
POST   /campaigns/:id/social/publicar-agora    # Publicar imediatamente
POST   /campaigns/:id/social/ai-suggest        # IA sugerir horário/formato
```

## Agenda
```
GET    /campaigns/:id/agenda                   # Listar compromissos (filtro: dia/semana/mês)
POST   /campaigns/:id/agenda                   # Criar compromisso
PUT    /campaigns/:id/agenda/:aid              # Editar
DELETE /campaigns/:id/agenda/:aid              # Excluir
GET    /campaigns/:id/agenda/:aid/briefing     # Briefing IA do compromisso
POST   /campaigns/:id/agenda/sync-google       # Sync Google Calendar
```

## Simulador de Debate
```
POST   /campaigns/:id/debate/iniciar           # Iniciar sessão (adversário selecionado)
POST   /campaigns/:id/debate/responder         # Enviar resposta → receber feedback IA
GET    /campaigns/:id/debate/historico         # Sessões anteriores
GET    /campaigns/:id/debate/stats             # Estatísticas (score médio, tempo, etc)
```

## Relatórios
```
POST   /campaigns/:id/relatorios/gerar         # Gerar relatório (tipo + params) → PDF
GET    /campaigns/:id/relatorios/historico      # Relatórios gerados
GET    /campaigns/:id/relatorios/:rid/download  # Baixar PDF
PUT    /campaigns/:id/relatorios/config-envio   # Configurar envio automático
```

## Pesquisas
```
POST   /campaigns/:id/pesquisas                # Criar pesquisa
GET    /campaigns/:id/pesquisas                # Listar pesquisas
GET    /campaigns/:id/pesquisas/:pid           # Detalhes + respostas
PUT    /campaigns/:id/pesquisas/:pid           # Editar
PATCH  /campaigns/:id/pesquisas/:pid/status    # Ativar/Encerrar
POST   /campaigns/:id/pesquisas/:pid/disparar  # Disparar por canal
POST   /campaigns/:id/pesquisas/ai-generate    # IA gerar perguntas
```

## GOTV / Dia da Eleição
```
GET    /campaigns/:id/gotv/status              # KPIs dia D
GET    /campaigns/:id/gotv/checklist           # Checklist items
PATCH  /campaigns/:id/gotv/checklist/:cid      # Marcar/desmarcar
POST   /campaigns/:id/gotv/disparar-lembrete   # Disparar SMS/WhatsApp lembrete
GET    /campaigns/:id/gotv/apuracao            # Dados de apuração
```

## Mapa Eleitoral
```
GET    /campaigns/:id/mapa/regioes             # Dados por região
GET    /campaigns/:id/mapa/zonas               # Zonas eleitorais detalhadas
GET    /campaigns/:id/mapa/demografico         # Dados demográficos
GET    /campaigns/:id/mapa/prioridades         # Prioridades IA
```

## Estratégica
```
GET    /campaigns/:id/estrategia/decisoes      # Decisões pendentes
PATCH  /campaigns/:id/estrategia/decisoes/:did # Aprovar/Rejeitar
GET    /campaigns/:id/estrategia/matriz        # Matriz de comunicação
PUT    /campaigns/:id/estrategia/matriz        # Atualizar matriz
GET    /campaigns/:id/estrategia/narrativa     # Eixos narrativos
GET    /campaigns/:id/estrategia/timeline      # Timeline estratégica
GET    /campaigns/:id/estrategia/recomendacoes # Recomendações IA
```

## Assistente IA
```
POST   /campaigns/:id/ia/chat                 # Enviar mensagem → resposta IA
GET    /campaigns/:id/ia/historico             # Histórico de conversas
```

## Configurações
```
GET    /users/me                               # Perfil do usuário
PUT    /users/me                               # Atualizar perfil
PUT    /users/me/password                      # Alterar senha
GET    /campaigns/:id/equipe                   # Listar membros
POST   /campaigns/:id/equipe                   # Convidar membro
PUT    /campaigns/:id/equipe/:uid              # Editar permissões
DELETE /campaigns/:id/equipe/:uid              # Remover membro
GET    /campaigns/:id/equipe/perfis            # Listar perfis de acesso
```
