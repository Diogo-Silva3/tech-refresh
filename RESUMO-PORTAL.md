# 📋 Resumo - Portal Tech Refresh

## ✅ O que foi criado

### Arquivos do Portal

```
portal/
├── server.js                    # Backend Node.js + Express
├── login.html                   # Tela de login (igual ao Tech Refresh)
├── index.html                   # Portal principal com menu lateral
├── logo-ntt.png                 # Logo NTT Data
├── package.json                 # Dependências
├── .env.example                 # Exemplo de variáveis de ambiente
├── .gitignore                   # Arquivos ignorados pelo Git
├── README.md                    # Documentação do portal
├── TESTAR-LOCAL.md             # Como testar localmente
├── SSO-INTEGRACAO.md           # Documentação do SSO
└── prisma/
    └── schema.prisma            # Schema do banco (simplificado)
```

### Scripts de Deploy

```
deploy-portal.bat                # Deploy do portal para VPS
instalar-portal-vps.bat         # Instalar e configurar portal na VPS
configurar-portal-vps.sh        # Script de configuração (roda na VPS)
PORTAL-INSTALACAO.md            # Guia completo de instalação
RESUMO-PORTAL.md                # Este arquivo
```

## 🎯 Funcionalidades Implementadas

### ✅ Autenticação
- Login com email e senha
- Validação de domínios permitidos
- JWT Token com expiração de 7 dias
- SSO com Tech Refresh (mesmo banco e JWT_SECRET)
- Logout com registro de log

### ✅ Interface
- Tela de login EXATAMENTE igual ao Tech Refresh
- Background animado com ondas azuis
- Portal com menu lateral (estilo Okta)
- Cards dos sistemas (Tech Refresh e Assets)
- Menu dropdown do usuário
- Design responsivo

### ✅ Segurança
- HTTPS obrigatório em produção
- Senhas criptografadas com bcrypt
- Validação de tokens JWT
- Logs de todas as ações
- Proteção contra SQL injection (Prisma)

### ✅ Logs e Auditoria
- Login/Logout no portal
- Acesso aos sistemas
- Tentativas de login falhadas
- IP e User-Agent registrados

## 🔧 Tecnologias Utilizadas

### Backend
- Node.js
- Express
- Prisma (ORM)
- JWT (autenticação)
- bcrypt (criptografia)

### Frontend
- HTML5
- CSS3 (inline, sem frameworks)
- JavaScript Vanilla
- Fetch API

### Infraestrutura
- PostgreSQL (banco de dados)
- Nginx (proxy reverso)
- PM2 (gerenciador de processos)
- Let's Encrypt (SSL)

## 📍 URLs

- **Portal:** https://portal.tech-refresh.cloud
- **Tech Refresh:** https://tech-refresh.cloud
- **Assets:** https://asset.tech-refresh.cloud

## 🚀 Como Instalar

### 1. Configurar VPS

```bash
instalar-portal-vps.bat
```

### 2. Editar .env na VPS

```bash
ssh root@187.127.8.112
nano /var/www/apps/portal-tech-refresh/.env
```

**IMPORTANTE:** Copie o `JWT_SECRET` do backend principal!

```bash
cat /var/www/apps/tech-refresh-backend/.env | grep JWT_SECRET
```

### 3. Fazer Deploy

```bash
deploy-portal.bat
```

### 4. Acessar

```
https://portal.tech-refresh.cloud
```

## 🔑 Variáveis de Ambiente Críticas

### Portal (.env)

```env
PORT=3001
JWT_SECRET=DEVE_SER_IGUAL_AO_BACKEND
DATABASE_URL=postgresql://usuario:senha@localhost:5432/tech_refresh
FRONTEND_URL=https://portal.tech-refresh.cloud
ALLOWED_DOMAINS=@grupobimbo.com,@global.nttdata.com,@gbsupport.net,@nttdata.com,@pasqualisolution.com.br
```

### Backend Principal (.env)

```env
JWT_SECRET=DEVE_SER_IGUAL_AO_PORTAL
DATABASE_URL=postgresql://usuario:senha@localhost:5432/tech_refresh
```

## 🔍 Verificar Status

### PM2

```bash
pm2 status
pm2 logs portal-tech-refresh
pm2 restart portal-tech-refresh
```

### Nginx

```bash
nginx -t
systemctl reload nginx
tail -f /var/log/nginx/error.log
```

### Banco de Dados

```sql
-- Ver logs de acesso ao portal
SELECT * FROM log_acessos 
WHERE acao LIKE '%PORTAL%' 
ORDER BY created_at DESC 
LIMIT 20;

-- Ver usuários ativos
SELECT id, nome, email, role 
FROM usuarios 
WHERE ativo = true;
```

## 🐛 Problemas Comuns

### Tela branca

1. Verifique se o servidor está rodando: `pm2 status`
2. Veja os logs: `pm2 logs portal-tech-refresh`
3. Verifique o Nginx: `nginx -t`

### Erro de autenticação

1. Verifique se `JWT_SECRET` é igual nos dois sistemas
2. Limpe o localStorage do navegador
3. Verifique se o usuário está ativo no banco

### Erro de conexão com banco

1. Verifique `DATABASE_URL` no `.env`
2. Teste conexão: `psql -U usuario -d tech_refresh`
3. Verifique se PostgreSQL está rodando

## 📊 Estrutura do Banco

### Tabelas Utilizadas

- `usuarios` - Autenticação e dados dos usuários
- `empresas` - Empresas/clientes
- `unidades` - Unidades das empresas
- `log_acessos` - Logs de todas as ações

### Campos Importantes

```sql
-- usuarios
id, nome, email, senha, role, ativo, empresa_id, unidade_id

-- log_acessos
id, usuario_id, empresa_id, acao, detalhes, ip, user_agent, created_at
```

## 🔄 Fluxo de Autenticação

```
1. Usuário acessa portal.tech-refresh.cloud
   ↓
2. Vê tela de login (login.html)
   ↓
3. Digita email e senha
   ↓
4. POST /api/auth/login
   ↓
5. Backend valida credenciais no banco
   ↓
6. Gera JWT Token
   ↓
7. Retorna token + dados do usuário
   ↓
8. Frontend salva no localStorage
   ↓
9. Redireciona para /home (index.html)
   ↓
10. Usuário vê portal com sistemas
    ↓
11. Clica em "Tech Refresh"
    ↓
12. Registra acesso (POST /api/acesso/tech-refresh)
    ↓
13. Abre sistema em nova aba
    ↓
14. Sistema valida token JWT
    ↓
15. Usuário já está logado! ✅
```

## 📝 Próximos Passos (Opcional)

### Melhorias Futuras

- [ ] Adicionar mais sistemas ao portal
- [ ] Dashboard com estatísticas de uso
- [ ] Notificações em tempo real
- [ ] Histórico de acessos do usuário
- [ ] Favoritos/sistemas mais usados
- [ ] Busca de sistemas
- [ ] Temas claro/escuro
- [ ] Refresh tokens
- [ ] 2FA (autenticação de dois fatores)

### Novos Sistemas

Para adicionar um novo sistema ao portal:

1. Edite `portal/index.html`
2. Adicione um novo card:

```html
<a href="#" onclick="event.preventDefault(); acessarSistema('novo-sistema', 'https://novo.tech-refresh.cloud/');" class="app-card">
  <div class="app-icon">🆕</div>
  <div class="app-name">Novo Sistema</div>
  <div class="app-description">Descrição</div>
</a>
```

3. Faça deploy: `deploy-portal.bat`

## 📞 Suporte

### Logs

```bash
# Portal
pm2 logs portal-tech-refresh

# Nginx
tail -f /var/log/nginx/error.log

# PostgreSQL
tail -f /var/log/postgresql/postgresql-*.log
```

### Reiniciar Tudo

```bash
pm2 restart all
systemctl reload nginx
systemctl restart postgresql
```

### Backup

```bash
# Backup do banco
pg_dump -U usuario tech_refresh > backup.sql

# Backup do portal
tar -czf portal-backup.tar.gz /var/www/apps/portal-tech-refresh
```

## ✅ Checklist Final

Antes de considerar concluído:

- [ ] Portal instalado na VPS
- [ ] Nginx configurado
- [ ] SSL funcionando
- [ ] `.env` configurado corretamente
- [ ] `JWT_SECRET` igual ao backend
- [ ] PM2 rodando o portal
- [ ] Login funcionando
- [ ] SSO funcionando com Tech Refresh
- [ ] Logs sendo salvos no banco
- [ ] Acesso aos sistemas funcionando
- [ ] Logout funcionando

## 🎉 Conclusão

O portal está pronto para uso! Agora você tem:

✅ Portal centralizado de acesso
✅ Login único (SSO) para todos os sistemas
✅ Interface moderna e profissional
✅ Logs e auditoria completos
✅ Segurança com HTTPS e JWT
✅ Fácil de adicionar novos sistemas

**URL de acesso:** https://portal.tech-refresh.cloud

**Credenciais:** Mesmas do Tech Refresh!
