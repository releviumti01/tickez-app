# Chamados - Sistema de Gestão de Chamados

Este projeto é uma solução completa para gestão de chamados, composta por um frontend em Next.js e um backend em Node.js integrado ao Supabase e PostgreSQL.

## Sumário

- [Visão Geral](#visão-geral)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Como Rodar o Projeto](#como-rodar-o-projeto)
- [Configuração de Ambiente](#configuração-de-ambiente)
- [Variáveis do Backend (`backend-API/.env`)](#variáveis-do-backend-backend-apienv)
- [Variáveis do Frontend (`.env.local`)](#variáveis-do-frontend-envlocal)
- [Scripts Úteis](#scripts-úteis)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Licença](#licença)

---

## Visão Geral

O sistema permite:
- Abertura, acompanhamento e avaliação de chamados por usuários.
- Gestão de chamados, usuários e métricas pela equipe de T.I.
- Visualização de dashboards, gráficos e relatórios em tempo real.

## Tecnologias Utilizadas

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Node.js, Express, Supabase, PostgreSQL
- **Outros:** Docker, JWT, Recharts

## Como Rodar o Projeto

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/seu-repo.git
   cd seu-repo
   ```

2. **Configuração das variáveis de ambiente:**
   - Copie os arquivos de exemplo `.env.example` para `.env` e `.env.local` e preencha conforme necessário.

3. **Instale as dependências:**
   - Frontend:
     ```bash
     pnpm install
     ```
   - Backend:
     ```bash
     cd backend-API
     npm install
     ```

4. **Inicie o backend:**
   ```bash
   cd backend-API
   npm start
   ```

5. **Inicie o frontend:**
   ```bash
   cd ..
   pnpm dev
   ```

6. **Acesse:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:5000](http://localhost:5000)

---

## Configuração de Ambiente

### Variáveis do Backend (`backend-API/.env`)

```env
# Supabase
SUPABASE_URL=https://qalhdnczoimexugcevvy.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbGhkbmN6b2ltZXh1Z2NldnZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjAzNzU2OSwiZXhwIjoyMDYxNjEzNTY5fQ.ETHfKpQAHv2wktzBgRRn3uN9p4WP-KjVM64d7O2zt48
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbGhkbmN6b2ltZXh1Z2NldnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMzc1NjksImV4cCI6MjA2MTYxMzU2OX0.Gs_TqaLJ7VAi9P8t4JNw0Y72mhF6jRcZGL3m2c9miBg

# PostgreSQL
DB_HOST=aws-0-sa-east-1.pooler.supabase.com
DB_PORT=6543
DB_USER=postgres.qalhdnczoimexugcevvy
DB_PASS=R@levium2025
DB_NAME=postgres

# Servidor
PORT=5000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=relevium_jwt_secret_key_2025

# Ambiente
NODE_ENV=development
```

> **Atenção:** Nunca exponha suas chaves reais em repositórios públicos.

### Variáveis do Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Scripts Úteis

- **Criar usuário:**  
  `node backend-API/scripts/create-user.js`
- **Resetar senha:**  
  `node backend-API/scripts/reset-password.js`
- **Rodar migrations:**  
  `node backend-API/scripts/setup-database.js`

---

## Estrutura de Pastas

```
├── backend-API/         # Backend Node.js/Express
│   ├── controllers/
│   ├── routes/
│   ├── scripts/
│   └── ...
├── components/          # Componentes React/Next.js
├── app/                 # Páginas e rotas Next.js
├── public/              # Assets estáticos
├── styles/              # Estilos globais
├── .env.local           # Variáveis do frontend
└── ...
```

---

## Licença

Este projeto é privado e de uso exclusivo da equipe Relevium.  
Para uso comercial ou distribuição, entre em contato.

