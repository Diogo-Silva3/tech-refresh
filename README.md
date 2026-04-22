# Inventário TI — Wickbold

Sistema profissional de gestão de inventário de equipamentos de TI.

## Stack

- **Frontend:** React + Vite + TailwindCSS + Recharts
- **Backend:** Node.js + Express.js
- **Banco:** PostgreSQL + Prisma ORM
- **Auth:** JWT
- **Docs:** Swagger UI

---

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

---

## Instalação

### 1. Banco de dados

Crie o banco no PostgreSQL:
```sql
CREATE DATABASE inventario_ti;
```

### 2. Backend

```bash
cd inventario-ti/backend
cp .env.example .env
# Edite o .env com sua string de conexão PostgreSQL
npm install
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

### 3. Frontend

```bash
cd inventario-ti/frontend
npm install
npm run dev
```

---

## Acesso

| URL | Descrição |
|-----|-----------|
| http://localhost:5173 | Frontend |
| http://localhost:3001/api-docs | Swagger API |

**Login padrão:**
- Email: `admin@wickbold.com.br`
- Senha: `admin123`

---

## Funcionalidades

- Dashboard com gráficos (por marca, status, unidade, tipo)
- CRUD completo de Equipamentos, Usuários e Unidades
- Vinculação de equipamentos a usuários com histórico automático
- Busca global inteligente
- Importação de planilhas Excel (usuários e equipamentos)
- Exportação de relatórios em PDF e Excel
- QR Code gerado automaticamente por equipamento
- Autenticação JWT com dois níveis (Admin / Técnico)
- Documentação automática via Swagger

---

## Importação de Planilhas

### Usuários
Colunas: `Nome`, `Função` (ou Cargo), `Email`, `Unidade`

### Equipamentos
Colunas: `Tipo`, `Marca`, `Modelo`, `Serial` (ou N° Serie), `Status`, `Unidade`

---

## Estrutura

```
inventario-ti/
├── backend/
│   ├── prisma/          # Schema e seed
│   ├── src/
│   │   ├── config/      # Prisma client, Swagger
│   │   ├── controllers/ # Lógica de negócio
│   │   ├── middleware/  # Auth JWT
│   │   ├── routes/      # Endpoints REST
│   │   └── server.js
│   └── .env
└── frontend/
    └── src/
        ├── components/  # Layout, modais, badges
        ├── contexts/    # Auth, Toast
        ├── pages/       # Todas as telas
        └── services/    # Axios
```

---

## Arquitetura Multi-tenant

O sistema já está preparado para múltiplas empresas. Cada entidade (usuário, equipamento, unidade) possui `empresa_id`. Para adicionar uma nova empresa, basta criar um registro na tabela `empresas` e associar os dados.
