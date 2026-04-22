#!/bin/bash

echo "=========================================="
echo "  Configurar Portal na VPS"
echo "=========================================="
echo ""

# Criar diretório do portal
echo "[1/6] Criando diretório do portal..."
mkdir -p /var/www/apps/portal-tech-refresh

# Criar arquivo .env
echo "[2/6] Configurando variáveis de ambiente..."
cat > /var/www/apps/portal-tech-refresh/.env << 'EOF'
PORT=3001
JWT_SECRET=seu_jwt_secret_aqui
DATABASE_URL=postgresql://usuario:senha@localhost:5432/tech_refresh
FRONTEND_URL=https://portal.tech-refresh.cloud
ALLOWED_DOMAINS=@grupobimbo.com,@global.nttdata.com,@gbsupport.net,@nttdata.com,@pasqualisolution.com.br
EOF

echo "ATENÇÃO: Edite o arquivo /var/www/apps/portal-tech-refresh/.env com as credenciais corretas!"
echo "Pressione ENTER para continuar..."
read

# Configurar Nginx
echo "[3/6] Configurando Nginx..."
cat > /etc/nginx/sites-available/portal-tech-refresh << 'EOF'
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
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

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
EOF

# Ativar site no Nginx
echo "[4/6] Ativando site no Nginx..."
ln -sf /etc/nginx/sites-available/portal-tech-refresh /etc/nginx/sites-enabled/

# Obter certificado SSL
echo "[5/6] Obtendo certificado SSL..."
certbot certonly --nginx -d portal.tech-refresh.cloud --non-interactive --agree-tos --email seu@email.com

# Recarregar Nginx
echo "[6/6] Recarregando Nginx..."
nginx -t && systemctl reload nginx

echo ""
echo "=========================================="
echo "  Configuração concluída!"
echo "=========================================="
echo ""
echo "Próximos passos:"
echo "1. Edite /var/www/apps/portal-tech-refresh/.env com as credenciais corretas"
echo "2. Execute o deploy-portal.bat da sua máquina local"
echo "3. Acesse https://portal.tech-refresh.cloud"
echo ""
