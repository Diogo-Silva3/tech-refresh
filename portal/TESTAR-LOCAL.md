# 🧪 Testar Portal Localmente

## 📋 Pré-requisitos

- Node.js instalado
- Acesso ao banco de dados PostgreSQL do Tech Refresh
- Arquivo `.env` configurado

## 🚀 Passo a Passo

### 1. Instalar Dependências

```bash
cd portal
npm install
```

### 2. Configurar .env

Crie o arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
PORT=3001
JWT_SECRET=copie_do_backend_principal
DATABASE_URL=postgresql://usuario:senha@localhost:5432/tech_refresh
FRONTEND_URL=http://localhost:3001
ALLOWED_DOMAINS=@grupobimbo.com,@global.nttdata.com,@gbsupport.net,@nttdata.com,@pasqualisolution.com.br
```

**IMPORTANTE:** Copie o `JWT_SECRET` do arquivo `backend/.env` para que o SSO funcione!

### 3. Gerar Prisma Client

```bash
npx prisma generate
```

### 4. Iniciar Servidor

```bash
npm run dev
```

O servidor irá iniciar em: `http://localhost:3001`

### 5. Testar no Navegador

Abra o navegador e acesse:

```
http://localhost:3001
```

Você verá a tela de login!

## 🔍 Testar Funcionalidades

### Login

1. Acesse `http://localhost:3001`
2. Digite email e senha de um usuário existente
3. Clique em "Entrar"
4. Você deve ser redirecionado para `/home`

### Portal Principal

1. Após login, você verá os cards dos sistemas
2. Clique em "Solicitações" ou "Assets"
3. O sistema deve abrir em nova aba
4. Verifique no console se o acesso foi registrado

### Logout

1. Clique no avatar do usuário (canto superior direito)
2. Clique em "Sair"
3. Você deve ser redirecionado para a tela de login

### Verificar Logs

Abra o console do navegador (F12) e veja as requisições:

```javascript
// Ver token
console.log(localStorage.getItem('token'));

// Ver usuário
console.log(JSON.parse(localStorage.getItem('usuario')));
```

## 🐛 Troubleshooting

### Erro: "Cannot find module '@prisma/client'"

```bash
npx prisma generate
```

### Erro: "JWT_SECRET is not defined"

Verifique se o arquivo `.env` existe e contém `JWT_SECRET`

### Erro: "Connection refused" ao conectar no banco

1. Verifique se o PostgreSQL está rodando
2. Verifique se o `DATABASE_URL` está correto
3. Teste a conexão:

```bash
psql -U usuario -d tech_refresh -h localhost
```

### Erro: "Token inválido" ao fazer login

1. Verifique se o `JWT_SECRET` é o mesmo do backend
2. Limpe o localStorage:

```javascript
localStorage.clear();
```

### Tela branca após login

1. Abra o console (F12) e veja os erros
2. Verifique se o servidor está rodando
3. Verifique se a API está respondendo:

```bash
curl http://localhost:3001/api/auth/me -H "Authorization: Bearer SEU_TOKEN"
```

## 📊 Verificar Banco de Dados

### Ver usuários cadastrados

```sql
SELECT id, nome, email, role, ativo 
FROM usuarios 
WHERE ativo = true;
```

### Ver logs de acesso

```sql
SELECT * FROM log_acessos 
ORDER BY created_at DESC 
LIMIT 10;
```

### Criar usuário de teste (se necessário)

```sql
-- Senha: 123456
INSERT INTO usuarios (nome, email, senha, role, empresa_id, ativo)
VALUES (
  'Usuário Teste',
  'teste@nttdata.com',
  '$2a$10$YourHashedPasswordHere',
  'ADMIN',
  1,
  true
);
```

Para gerar o hash da senha:

```javascript
const bcrypt = require('bcryptjs');
const senha = '123456';
const hash = bcrypt.hashSync(senha, 10);
console.log(hash);
```

## 🔄 Testar SSO

### 1. Iniciar Backend Principal

```bash
cd backend
npm run dev
```

### 2. Iniciar Portal

```bash
cd portal
npm run dev
```

### 3. Fazer Login no Portal

```
http://localhost:3001
```

### 4. Verificar Token

Abra o console e copie o token:

```javascript
const token = localStorage.getItem('token');
console.log(token);
```

### 5. Testar no Backend Principal

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Se retornar os dados do usuário, o SSO está funcionando! ✅

## 📝 Checklist de Testes

- [ ] Login com credenciais válidas
- [ ] Login com credenciais inválidas (deve mostrar erro)
- [ ] Login com email de domínio não autorizado (deve mostrar erro)
- [ ] Redirecionamento após login
- [ ] Exibição do nome e email do usuário
- [ ] Dropdown do menu do usuário
- [ ] Logout
- [ ] Registro de acesso aos sistemas
- [ ] Token JWT válido
- [ ] SSO com backend principal
- [ ] Logs salvos no banco de dados

## 🎯 Próximos Passos

Após testar localmente e confirmar que tudo funciona:

1. Commit das alterações
2. Execute `instalar-portal-vps.bat` para configurar a VPS
3. Configure o `.env` na VPS
4. Execute `deploy-portal.bat` para fazer deploy
5. Acesse `https://portal.tech-refresh.cloud`

## 💡 Dicas

- Use `npm run dev` para desenvolvimento (reinicia automaticamente)
- Use `npm start` para produção
- Mantenha o console aberto para ver erros
- Use o Postman para testar as APIs
- Verifique sempre os logs do banco de dados
