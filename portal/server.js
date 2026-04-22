require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Domínios permitidos
const DOMINIOS_PERMITIDOS = process.env.ALLOWED_DOMAINS
  ? process.env.ALLOWED_DOMAINS.split(',').map(d => d.trim())
  : ['@grupobimbo.com', '@global.nttdata.com', '@gbsupport.net', '@nttdata.com', '@pasqualisolution.com.br'];

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Função para registrar log de acesso
async function registrarLog(dados) {
  try {
    await prisma.logAcesso.create({ data: dados });
  } catch (err) {
    console.error('Erro ao registrar log:', err);
  }
}

// Middleware de autenticação
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Token não fornecido' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await prisma.usuario.findFirst({
      where: { id: decoded.id, ativo: true },
      include: { 
        empresa: { select: { id: true, nome: true, logo: true } },
        unidade: { select: { id: true, nome: true, cidade: true, estado: true } }
      }
    });

    if (!usuario) return res.status(401).json({ error: 'Usuário não encontrado' });

    req.usuario = usuario;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// ==================== ROTAS ====================

// Login - usar API do backend principal
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Fazer login no backend principal
    const backendUrl = process.env.BACKEND_URL || 'https://tech-refresh.cloud/api';
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Registrar log de acesso ao portal
    try {
      await prisma.logAcesso.create({
        data: {
          usuarioId: data.usuario.id,
          empresaId: data.usuario.empresaId,
          acao: 'LOGIN_PORTAL',
          detalhes: `Login realizado no portal por ${data.usuario.email}`,
          ip: req.ip || req.headers['x-forwarded-for'],
          userAgent: req.headers['user-agent'],
        }
      });
    } catch (logErr) {
      console.error('Erro ao registrar log:', logErr);
      // Não falha o login se o log falhar
    }

    res.json(data);
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
});

// Verificar token (me)
app.get('/api/auth/me', auth, async (req, res) => {
  const { senha: _, ...usuarioSemSenha } = req.usuario;
  res.json(usuarioSemSenha);
});

// Logout (apenas registra log)
app.post('/api/auth/logout', auth, async (req, res) => {
  try {
    await registrarLog({
      usuarioId: req.usuario.id,
      empresaId: req.usuario.empresaId,
      acao: 'LOGOUT_PORTAL',
      detalhes: `Logout realizado no portal por ${req.usuario.email}`,
      ip: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
    });
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (err) {
    console.error('Erro no logout:', err);
    res.status(500).json({ error: 'Erro ao realizar logout' });
  }
});

// Registrar acesso a um sistema
app.post('/api/acesso/:sistema', auth, async (req, res) => {
  try {
    const { sistema } = req.params;
    
    await registrarLog({
      usuarioId: req.usuario.id,
      empresaId: req.usuario.empresaId,
      acao: 'ACESSO_SISTEMA',
      detalhes: `Acesso ao sistema ${sistema}`,
      ip: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'Acesso registrado' });
  } catch (err) {
    console.error('Erro ao registrar acesso:', err);
    res.status(500).json({ error: 'Erro ao registrar acesso' });
  }
});

// Listar últimos acessos do usuário
app.get('/api/acessos/ultimos', auth, async (req, res) => {
  try {
    const acessos = await prisma.logAcesso.findMany({
      where: {
        usuarioId: req.usuario.id,
        acao: 'ACESSO_SISTEMA'
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json(acessos);
  } catch (err) {
    console.error('Erro ao buscar acessos:', err);
    res.status(500).json({ error: 'Erro ao buscar acessos' });
  }
});

// Servir arquivos estáticos (HTML)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.get('/home', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Portal Tech Refresh rodando na porta ${PORT}`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
