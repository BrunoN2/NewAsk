# NewAsk

Aplicativo de produtividade minimalista para quem quer focar sem distrações. Desenvolvido com React, Vite e TypeScript.

## Principais funcionalidades

- **Modo Foco imersivo** — cronômetro crescente com fogueira animada, fundo estrelado e economia de bateria.
- **Lista de tarefas** — organize por categorias (Personal, Study, Work etc.) e acompanhe o progresso.
- **Calendário de eventos** — visualização em grade dos compromissos do mês.
- **Notícias diárias** — feed resumido para manter-se informado sem sair do app.
- **PWA (Progressive Web App)** — instalável na tela inicial, funciona offline com service worker e cache de assets.
- **Tela de boas-vindas** — orienta novos visitantes a instalar o app antes de usar.
- **Modo noturno** — alternância entre tema claro e escuro.

## Tecnologias

- React 19
- TypeScript
- Vite
- CSS puro (sem frameworks de UI)
- Service Worker manual para cache/offline
- Supabase (backend, quando configurado)

## Scripts

```bash
npm run dev      # inicia servidor de desenvolvimento
npm run build    # gera build de produção
npm run preview  # preview do build local
```

## Publicação

O projeto é publicado via Verdent Hosting. A cada `npm run build`, o service worker recebe os assets hasheados do Vite automaticamente.

## Licença

Projeto privado.
