# 🚀 Deploy Portal Tech Refresh na VPS

## 📋 Pré-requisitos

- Acesso SSH à VPS: `root@187.127.8.112`
- Node.js instalado na VPS
- PM2 instalado na VPS
- Nginx configurado
- Certificado SSL (Let's Encrypt)

## 🔧 Passo a Passo

### 1️⃣ Configurar Nginx (primeira vez apenas)

Na sua máquina local, execute:

```bash
scp configurar-nginx-portal.sh root@187.127.8.112:/tmp/
ssh root@187.127.8.112 "chmod +x /tmp/configurar-nginx-portal.sh && /tmp/configurar-nginx-portal.sh"
```

Ou conecte na VPS e execute manualmente:

```bash
ssh root@187.127.8.112
bash /tmp/configurar-nginx-portal.sh
```

### 2️⃣ Obter Certificado SSL

Se ainda não tiver certificado para `portal.tech-refresh.cloud`:

```bash
ssh root@187.127.8.112
certbot certonly --nginx -d portal.tech-refresh.cloud
```

### 3️⃣ Fazer Deploy do Portal

Execute o script de deploy:

```bash
deploy-portal-vps.bat
```

Este script irá:
- ✅ Criar diretório na VPS
- ✅ Enviar arquivos do portal
- ✅ Instalar dependências
- ✅ Configurar variáveis de ambiente
- ✅ Iniciar/reiniciar com PM2

### 4️⃣ Verificar Status

```bash
ssh root@187.127.8.112
pm2 status
pm2 logs portal-tech-refresh
```

### 5️⃣ Acessar o Portal

```
https://portal.tech-refresh.cloud
```

**Credenciais de teste:**
- Email: `teste@nttdata.com`
- Senha: `123456`

## 🔄 Atualizar Portal

Para fazer deploy novamente após alterações:

```bash
deploy-portal-vps.bat
```

## 🐛 Troubleshooting

### Portal não carrega

1. Verifique se o servidor está rodando:
```bash
ssh root@187.127.8.112
pm2 status
```

2. Veja os logs:
```bash
pm2 logs portal-tech-refresh
```

3. Verifique se a porta 3002 está aberta:
```bash
netstat -tulpn | grep 3002
```

### Erro de SSL

```bash
ssh root@187.127.8.112
certbot renew
systemctl reload nginx
```

### Erro de conexão

Verifique o Nginx:
```bash
nginx -t
systemctl reload nginx
tail -f /var/log/nginx/error.log
```

## 📊 Monitorar

### Ver logs em tempo real

```bash
ssh root@187.127.8.112
pm2 logs portal-tech-refresh
```

### Reiniciar portal

```bash
ssh root@187.127.8.112
pm2 restart portal-tech-refresh
```

### Parar portal

```bash
ssh root@187.127.8.112
pm2 stop portal-tech-refresh
```

## 🔐 Segurança

- ✅ HTTPS obrigatório
- ✅ JWT com expiração de 7 dias
- ✅ Validação de domínios
- ✅ Logs de acesso
- ✅ Senhas criptografadas

## 📝 Variáveis de Ambiente

O arquivo `.env` na VPS contém:

```env
PORT=3002
JWT_SECRET=ntt-device-control-jwt-secret-2024-wickbold
BACKEND_URL=https://tech-refresh.cloud/api
FRONTEND_URL=https://portal.tech-refresh.cloud
```

Para editar:
```bash
ssh root@187.127.8.112
nano /var/www/apps/portal-tech-refresh/.env
pm2 restart portal-tech-refresh
```

## ✅ Checklist Final

- [ ] Nginx configurado
- [ ] SSL ativo
- [ ] Portal rodando (PM2)
- [ ] Acesso em https://portal.tech-refresh.cloud
- [ ] Login funcionando
- [ ] Cards dos sistemas aparecem
- [ ] Logout funciona
- [ ] Logs sendo salvos

## 🎉 Pronto!

O portal está em produção! 🚀
