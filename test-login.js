const axios = require('axios');

async function testarLogin() {
  try {
    const res = await axios.post('https://tech-refresh.cloud/api/auth/login', {
      email: 'pedro.severo@gbsupport.net',
      senha: 'Bimbo@123'
    });
    
    console.log('✅ LOGIN SUCESSO');
    console.log('Token:', res.data.token?.substring(0, 30) + '...');
    console.log('Usuário:', JSON.stringify(res.data.usuario, null, 2));
    console.log('ProjetoId:', res.data.usuario.projetoId);
    
  } catch (err) {
    console.error('❌ ERRO:', err.response?.data || err.message);
  }
}

testarLogin();
