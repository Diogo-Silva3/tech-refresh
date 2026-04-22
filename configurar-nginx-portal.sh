#!/bin/bash

echo "=========================================="
echo "  Configurar Nginx para Portal"
echo "=========================================="
echo ""

# Criar arquivo de configuração do Nginx
echo "[1/3] Criando configuração do Nginx..."
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
        proxy_pass http://localhost:3002;
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

# Ativar site
echo "[2/3] Ativando site no Nginx..."
ln -sf /etc/nginx/sites-available/portal-tech-refresh /etc/nginx/sites-enabled/

# Testar e recarregar
echo "[3/3] Testando e recarregando Nginx..."
nginx -t && systemctl reload nginx

echo ""
echo "=========================================="
echo "  Configuração concluída!"
echo "=========================================="
echo ""
echo "Próximos passos:"
echo "1. Execute: deploy-portal-vps.bat"
echo "2. Acesse: https://portal.tech-refresh.cloud"
echo ""
