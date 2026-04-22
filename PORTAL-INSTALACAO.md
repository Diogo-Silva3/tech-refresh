# 🚀 Guia de Instalação do Portal Tech Refresh

## 📋 Pré-requisitos

- Acesso SSH à VPS (root@187.127.8.112)
- Node.js instalado na VPS
- PM2 instalado na VPS
- Nginx configurado
- Certbot para SSL

## 🔧 Instalação Passo a Passo

### 1️⃣ Configurar a VPS

Execute o script de instalação:

```bash
instalar-portal-vps.bat
```

Este script irá:
- Criar o diretório `/var/www/apps/portal-tech-refresh`
- Criar arquivo `.env` de exemplo
- Configurar Nginx para o subdomínio `portal.tech-refresh.cloud`
- Obter certificado SSL com Let's Encrypt

### 2️⃣ Configurar Variáveis de Ambiente

Conecte na VPS e edite o arquivo `.env`:

```bash
ssh root@187.127.8.112
nano /var/www/apps/portal-tech-refresh/.env
```

Configure as seguintes variáveis:

```env
PORT=3001
JWT_SECRET=COPIE_O_MESMO_DO_BACKEND_PRINCIPAL
DATABASE_URL=postgresql://usuario:senha@localhost:5432/tech_refresh
FRONTEND_URL=https://portal.tech-refresh.cloud
ALLOWED_DOMAINS=@grupobimbo.com,@global.nttdata.com,@gbsupport.net,@nttdata.com,@pasqualisolution.com.br
```

**⚠️ IMPORTANTE:** O `JWT_SECRET` deve ser EXATAMENTE o mesmo do backend principal (`/var/www/apps/tech-refresh-backend/.env`) para que o SSO funcione!

Para copiar o JWT_SECRET do backend:

```bash
cat /var/www/apps/tech-refresh-backend/.env | grep JWT_SECRET
```

### 3️⃣ Fazer Deploy

Execute o script de deploy da sua máquina local:

```bash
deploy-portal.bat
```

Este script irá:
- Enviar todos os arquivos do portal para a VPS
- Instalar dependências (npm install)
- Gerar Prisma Client
- Iniciar/reiniciar aplicação com PM2

### 4️⃣ Verificar

Acesse o portal:

```
https://portal.tech-refresh.cloud
```

Faça login com as mesmas credenciais do Tech Refresh!

## 🔍 Verificar Status

### Na VPS

```bash
# Ver logs do portal
pm2 logs portal-tech-refresh

# Ver status
pm2 status

# Reiniciar
pm2 restart portal-tech-refresh

# Parar
pm2 stop portal-tech-refresh
```

### Nginx

```bash
# Testar configuração
nginx -t

# Recarregar
systemctl reload nginx

# Ver logs
tail -f /var/log/nginx/error.log
```

## 🐛 Troubleshooting

### Portal não carrega (tela branca)

1. Verifique se o servidor está rodando:
   ```bash
   pm2 status
   ```

2. Verifique os logs:
   ```bash
   pm2 logs portal-tech-refresh
   ```

3. Verifique se a porta 3001 está aberta:
   ```bash
   netstat -tulpn | grep 3001
   ```

### Erro de autenticação

1. Verifique se o `JWT_SECRET` é o mesmo do backend:
   ```bash
   cat /var/www/apps/tech-refresh-backend/.env | grep JWT_SECRET
   cat /var/www/apps/portal-tech-refresh/.env | grep JWT_SECRET
   ```

2. Verifique se o `DATABASE_URL` está correto:
   ```bash
   cat /var/www/apps/portal-tech-refresh/.env | grep DATABASE_URL
   ```

### Erro de SSL

1. Verifique se o certificado foi gerado:
   ```bash
   ls -la /etc/letsencrypt/live/portal.tech-refresh.cloud/
   ```

2. Se não existir, gere manualmente:
   ```bash
   certbot certonly --nginx -d portal.tech-refresh.cloud
   ```

### Erro de conexão com banco

1. Verifique se o PostgreSQL está rodando:
   ```bash
   systemctl status postgresql
   ```

2. Teste a conexão:
   ```bash
   psql -U usuario -d tech_refresh -h localhost
   ```

## 📊 Monitoramento

### Ver acessos ao portal

```sql
SELECT * FROM log_acessos 
WHERE acao LIKE '%PORTAL%' 
ORDER BY created_at DESC 
LIMIT 20;
```

### Ver usuários que acessaram

```sql
SELECT DISTINCT u.nome, u.email, COUNT(*) as acessos
FROM log_acessos la
JOIN usuarios u ON u.id = la.usuario_id
WHERE la.acao = 'LOGIN_PORTAL'
GROUP BY u.id, u.nome, u.email
ORDER BY acessos DESC;
```

## 🔄 Atualizar Portal

Para atualizar o portal após fazer alterações:

```bash
deploy-portal.bat
```

O script irá automaticamente:
- Enviar novos arquivos
- Reinstalar dependências se necessário
- Reiniciar aplicação

## 🔐 Segurança

- ✅ HTTPS obrigatório
- ✅ JWT com expiração de 7 dias
- ✅ Validação de domínios de email
- ✅ Logs de todas as ações
- ✅ Senhas criptografadas com bcrypt
- ✅ Proteção contra SQL injection (Prisma)

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs: `pm2 logs portal-tech-refresh`
2. Verifique o Nginx: `tail -f /var/log/nginx/error.log`
3. Verifique o banco: `psql -U usuario -d tech_refresh`
4. Reinicie tudo: `pm2 restart portal-tech-refresh && systemctl reload nginx`
