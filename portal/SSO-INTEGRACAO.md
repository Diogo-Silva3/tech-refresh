# 🔐 Integração SSO - Portal Tech Refresh

## Como funciona o SSO (Single Sign-On)

O portal utiliza o mesmo banco de dados e JWT_SECRET do Tech Refresh, permitindo que o usuário faça login uma única vez e acesse todos os sistemas.

## 🔑 Fluxo de Autenticação

### 1. Login no Portal

```
Usuário → Portal (login.html)
         ↓
    POST /api/auth/login
         ↓
    Valida credenciais no banco
         ↓
    Gera JWT Token
         ↓
    Retorna token + dados do usuário
         ↓
    Salva no localStorage
```

### 2. Acesso aos Sistemas

```
Usuário clica em "Tech Refresh"
         ↓
    Registra acesso (POST /api/acesso/tech-refresh)
         ↓
    Abre sistema em nova aba
         ↓
    Sistema verifica token JWT
         ↓
    Usuário já está logado!
```

## 🔧 Configuração do SSO

### Requisitos

Para que o SSO funcione, os seguintes itens devem ser IDÊNTICOS em todos os sistemas:

1. **JWT_SECRET** - Chave para assinar/verificar tokens
2. **DATABASE_URL** - Mesmo banco de dados
3. **Estrutura da tabela usuarios** - Schema compatível

### Arquivo .env do Portal

```env
JWT_SECRET=MESMO_DO_BACKEND_PRINCIPAL
DATABASE_URL=postgresql://usuario:senha@localhost:5432/tech_refresh
```

### Arquivo .env do Backend Principal

```env
JWT_SECRET=MESMO_DO_PORTAL
DATABASE_URL=postgresql://usuario:senha@localhost:5432/tech_refresh
```

## 🔄 Implementação nos Sistemas

### Tech Refresh (já implementado)

O sistema Tech Refresh já possui autenticação JWT. Basta garantir que:

1. O `JWT_SECRET` seja o mesmo
2. O token seja enviado no header: `Authorization: Bearer <token>`
3. O endpoint `/auth/me` valide o token

### Assets (se necessário)

Se o sistema Assets precisar de autenticação:

```javascript
// Verificar se usuário está logado
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'https://portal.tech-refresh.cloud';
}

// Validar token
fetch('https://tech-refresh.cloud/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => {
  if (!res.ok) throw new Error('Token inválido');
  return res.json();
})
.then(usuario => {
  console.log('Usuário logado:', usuario);
})
.catch(() => {
  localStorage.removeItem('token');
  window.location.href = 'https://portal.tech-refresh.cloud';
});
```

## 📊 Logs de Acesso

Todos os acessos são registrados na tabela `log_acessos`:

```sql
CREATE TABLE log_acessos (
  id SERIAL PRIMARY KEY,
  usuario_id INT,
  empresa_id INT,
  projeto_id INT,
  acao VARCHAR(255),
  detalhes TEXT,
  ip VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tipos de ações registradas:

- `LOGIN_PORTAL` - Login no portal
- `LOGOUT_PORTAL` - Logout do portal
- `ACESSO_SISTEMA` - Acesso a um sistema específico
- `LOGIN_FALHOU` - Tentativa de login com senha incorreta

### Consultar acessos:

```sql
-- Últimos acessos ao portal
SELECT u.nome, la.acao, la.detalhes, la.created_at
FROM log_acessos la
JOIN usuarios u ON u.id = la.usuario_id
WHERE la.acao LIKE '%PORTAL%'
ORDER BY la.created_at DESC
LIMIT 20;

-- Sistemas mais acessados
SELECT 
  REPLACE(detalhes, 'Acesso ao sistema ', '') as sistema,
  COUNT(*) as acessos
FROM log_acessos
WHERE acao = 'ACESSO_SISTEMA'
GROUP BY sistema
ORDER BY acessos DESC;

-- Usuários mais ativos
SELECT 
  u.nome,
  u.email,
  COUNT(*) as total_acessos
FROM log_acessos la
JOIN usuarios u ON u.id = la.usuario_id
WHERE la.acao IN ('LOGIN_PORTAL', 'ACESSO_SISTEMA')
GROUP BY u.id, u.nome, u.email
ORDER BY total_acessos DESC
LIMIT 10;
```

## 🔒 Segurança

### Token JWT

O token JWT contém:

```json
{
  "id": 123,
  "email": "usuario@nttdata.com",
  "role": "ADMIN",
  "empresaId": 1,
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Validação

Todos os endpoints protegidos devem:

1. Verificar se o token existe
2. Validar assinatura do token
3. Verificar se não expirou
4. Verificar se usuário está ativo

```javascript
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Token não fornecido' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await prisma.usuario.findFirst({
      where: { id: decoded.id, ativo: true }
    });

    if (!usuario) return res.status(401).json({ error: 'Usuário não encontrado' });

    req.usuario = usuario;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
```

### Expiração

- Token expira em **7 dias**
- Após expirar, usuário precisa fazer login novamente
- Não há refresh token (por simplicidade)

## 🌐 CORS

Para que o SSO funcione entre domínios diferentes, configure CORS:

```javascript
// Backend
app.use(cors({
  origin: [
    'https://portal.tech-refresh.cloud',
    'https://tech-refresh.cloud',
    'https://asset.tech-refresh.cloud'
  ],
  credentials: true
}));
```

## 🔄 Logout

### Logout no Portal

```javascript
function logout() {
  // Registrar logout no backend
  fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  // Limpar localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  
  // Redirecionar para login
  window.location.href = '/';
}
```

### Logout em todos os sistemas

Para fazer logout em todos os sistemas simultaneamente, seria necessário:

1. Implementar blacklist de tokens no backend
2. Ou usar tokens de curta duração com refresh tokens
3. Ou usar cookies httpOnly compartilhados

Por simplicidade, atualmente cada sistema mantém seu próprio token no localStorage.

## 🧪 Testar SSO

### 1. Fazer login no portal

```
https://portal.tech-refresh.cloud
```

### 2. Abrir console do navegador

```javascript
// Ver token
console.log(localStorage.getItem('token'));

// Ver dados do usuário
console.log(JSON.parse(localStorage.getItem('usuario')));
```

### 3. Clicar em "Tech Refresh"

O sistema deve abrir já logado!

### 4. Verificar logs

```sql
SELECT * FROM log_acessos 
WHERE usuario_id = SEU_ID 
ORDER BY created_at DESC;
```

## 📝 Notas Importantes

1. **JWT_SECRET** deve ser mantido em segredo
2. Nunca commitar arquivos `.env` no Git
3. Usar HTTPS em produção (obrigatório)
4. Tokens são armazenados no localStorage (não em cookies)
5. Não há proteção contra XSS no localStorage (use Content Security Policy)
6. Considerar implementar refresh tokens para produção
