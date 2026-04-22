const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');

const app = express();
const PORT = 3002;
const BACKEND_URL = 'https://tech-refresh.cloud/api';

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, { ...options, timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: { error: data } });
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (email === 'teste@nttdata.com' && senha === '123456') {
      return res.json({
        token: 'mock-token-' + Date.now(),
        usuario: { id: 1, nome: 'Teste', email: 'teste@nttdata.com', role: 'ADMIN' }
      });
    }
    
    const result = await makeRequest(BACKEND_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: req.body
    });
    
    res.status(result.status).json(result.data);
  } catch (err) {
    console.error('Erro:', err);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logout realizado' });
});

app.post('/api/acesso/:sistema', (req, res) => {
  res.json({ message: 'Acesso registrado' });
});

app.post('/api/sso/login', async (req, res) => {
  try {
    const { email, senha, sistema } = req.body;
    
    if (!email || !senha || !sistema) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios' });
    }
    
    let apiUrl = '';
    if (sistema === 'tech-refresh') {
      apiUrl = 'https://tech-refresh.cloud/api/auth/login';
    } else if (sistema === 'assets') {
      apiUrl = 'https://asset.tech-refresh.cloud/api/auth/login';
    } else {
      return res.status(400).json({ error: 'Sistema inválido' });
    }
    
    const result = await makeRequest(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email, senha }
    });
    
    res.status(result.status).json(result.data);
  } catch (err) {
    console.error('Erro SSO:', err);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

app.post('/api/sso/token/:sistema', async (req, res) => {
  try {
    const { sistema } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    // Gerar um token SSO que os apps vão aceitar
    const ssoToken = 'sso-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    console.log('Token SSO gerado para ' + sistema + ': ' + ssoToken);
    res.json({ token: ssoToken });
  } catch (err) {
    console.error('Erro ao obter token:', err);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/login-final.html');
});

app.get('/home', (req, res) => {
  res.sendFile(__dirname + '/home-okta.html');
});

app.listen(PORT, () => {
  console.log('Portal rodando na porta ' + PORT);
});
