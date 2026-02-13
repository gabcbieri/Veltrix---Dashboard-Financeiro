# Deploy Gratis (Projeto Pessoal)

Este projeto ja esta preparado para deploy com:
- Frontend no Vercel (gratis, rapido para portfolio)
- Backend + Postgres no Render (gratis, com `render.yaml`)

## 1. Pre-requisitos
- Conta no GitHub
- Conta no Vercel
- Conta no Render
- Repositorio com este projeto (root com `frontend/` e `backend/`)

## 2. Publicar o backend (Render)

### 2.1 Suba o repositorio no GitHub
Se ainda nao subiu:

```bash
git add .
git commit -m "prepare deploy"
git push origin main
```

### 2.2 Criar backend no Render via Blueprint
1. Entre no Render.
2. Clique em `New` -> `Blueprint`.
3. Conecte seu repositorio.
4. O Render vai ler `render.yaml` automaticamente e criar:
   - 1 Web Service: `dash-api`
   - 1 Postgres: `dash-db`

### 2.3 Configurar variaveis obrigatorias no `dash-api`
- `FRONTEND_URL`: deixe temporariamente `https://example.com` (depois troque pela URL do Vercel).
- `JWT_SECRET`: pode usar o que o Render gerar automaticamente.
- `DATABASE_URL`: sera ligado automatico via `render.yaml`.

### 2.4 Deploy do backend
- O build e start ja estao prontos:
  - Build: `npm ci && npm run prisma:generate && npm run build`
  - Start: `npm run start:prod`
- O comando `start:prod` roda migration (`prisma migrate deploy`) antes de subir API.

### 2.5 Copie a URL da API
Exemplo:
- `https://dash-api.onrender.com`

Teste:
- `https://dash-api.onrender.com/api/health`

## 3. Publicar o frontend (Vercel)

### 3.1 Ajustar variavel do frontend
No Vercel, configure:
- `VITE_API_URL=https://dash-api.onrender.com/api`

Arquivo de referencia ja incluso:
- `frontend/.env.production.example`

### 3.2 Deploy
1. Entre no Vercel.
2. Clique em `Add New Project`.
3. Selecione o mesmo repositorio.
4. Configure:
   - Root Directory: `frontend`
   - Framework: `Vite` (auto detecta)
5. Adicione env var `VITE_API_URL`.
6. Clique em `Deploy`.

Obs:
- O arquivo `frontend/vercel.json` ja foi adicionado para evitar 404 em rotas SPA.

## 4. Finalizar CORS no backend
Depois que o frontend tiver URL final (ex.: `https://seu-projeto.vercel.app`):
1. Volte no Render (`dash-api` -> Environment).
2. Atualize `FRONTEND_URL` com a URL exata do frontend.
3. Redeploy no backend.

## 5. Checklist de validacao
- Cadastro e login funcionando
- Criar/editar/excluir lancamentos
- Criar/editar/excluir categorias
- Upload de foto de perfil funcionando
- Dashboard/Analitico carregando
- Tema light/dark funcionando

## 6. Atualizar seu portfolio
- Use a URL do Vercel como link principal.
- No texto do portfolio, cite stack e arquitetura:
  - React + Vite + TypeScript
  - Node + Express + Prisma
  - Postgres
  - Deploy: Vercel (frontend) + Render (backend/db)

## 7. Estrutura de arquivos de deploy adicionados
- `render.yaml`
- `backend/.env.production.example`
- `frontend/.env.production.example`
- `frontend/vercel.json`

