# Portal Tech Refresh

Portal centralizado de acesso aos sistemas Tech Refresh.

## 🚀 Funcionalidades

- ✅ Login com autenticação JWT (mesmo banco do Tech Refresh)
- ✅ SSO entre portal e sistemas
- ✅ Registro de acessos aos sistemas
- ✅ Interface moderna e responsiva
- ✅ Últimos acessos do usuário

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Copiar arquivo de ambiente
cp .env.example .env
```

## ⚙️ Configuração

Edite o arquivo `.env` com as configurações corretas:

```env
PORT=3001
JWT_SECRET=mesmo_secret_do_backend_principal
DATABASE_URL=postgresql://usuario:senha@localhost:5432/tech_refresh
FRONTEND_URL=https://portal.tech-refresh.cloud
ALLOWED_DOMAINS=@grupobimbo.com,@global.nttdata.com,@gbsupport.net,@nttdata.com,@pasqualisolution.com.br
```

**IMPORTANTE:** O `JWT_SECRET` deve ser EXATAMENTE o mesmo do backend principal para que o SSO funcione.

## 🏃 Executar

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🌐 Deploy na VPS

O portal será acessível em: `https://portal.tech-refresh.cloud`

### Configuração do Nginx

```nginx
server {
    listen 80;
    server_name portal.tech-refresh.cloud;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name portal.tech-refresh.cloud;

    ssl_certificate /etc/letsencrypt/live/portal.tech-refresh.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/portal.tech-refresh.cloud/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### PM2 (Gerenciador de processos)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start server.js --name portal-tech-refresh

# Salvar configuração
pm2 save

# Configurar para iniciar no boot
pm2 startup
```

## 📁 Estrutura

```
portal/
├── server.js           # Servidor Express
├── login.html          # Tela de login
├── index.html          # Portal principal
├── logo-ntt.png        # Logo NTT Data
├── package.json        # Dependências
├── .env                # Variáveis de ambiente
└── prisma/
    └── schema.prisma   # Schema do banco (simplificado)
```

## 🔐 Segurança

- Autenticação JWT com expiração de 7 dias
- Validação de domínios de email permitidos
- Logs de acesso e tentativas de login
- Senhas criptografadas com bcrypt
- HTTPS obrigatório em produção

## 📊 Logs

Todos os acessos são registrados na tabela `log_acessos`:
- Login/Logout no portal
- Acesso aos sistemas
- Tentativas de login falhadas

## 🔗 Integração com Sistemas

O portal registra quando o usuário acessa cada sistema, permitindo:
- Rastreamento de uso
- Auditoria de acessos
- Estatísticas de utilização
