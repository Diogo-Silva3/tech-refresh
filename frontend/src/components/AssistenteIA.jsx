import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function AssistenteIA() {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState([
    {
      id: 1,
      tipo: 'ia',
      texto: '🎯 Olá! Sou seu TUTOR do sistema Tech Refresh!\n\n🚨 MODO ULTRA SEGURO ATIVO\n\nEu apenas ENSINO como usar o sistema.\nNão tenho acesso a dados reais.\nNão executo ações.\n\nComo posso te orientar hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputMensagem, setInputMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollParaBaixo = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollParaBaixo();
  }, [mensagens]);

  const respostasIA = {
    'oi': 'Olá! 👋 Bem-vindo ao Tech Refresh! Como posso ajudá-lo hoje?',
    'olá': 'Olá! 👋 Bem-vindo ao Tech Refresh! Como posso ajudá-lo hoje?',
    'opa': 'E aí! 😊 Tudo bem? Como posso ajudar?',
    'e aí': 'E aí! 😊 Tudo bem? Como posso ajudar?',
    'ajuda': 'Claro! Posso ajudar com:\n\n📱 Equipamentos\n• Como registrar novo equipamento\n• Buscar equipamentos\n• Ver detalhes\n\n📅 Agendamentos\n• Como agendar entrega\n• Ver agendamentos\n• Confirmar entrega\n\n📊 Dashboard\n• Entender os números\n• Ver ciclo de preparação\n• Relatórios\n\n👥 Usuários\n• Criar usuários\n• Atribuir equipamentos\n• Gerenciar permissões\n\nO que você precisa?',
    'equipamentos': 'Para gerenciar equipamentos:\n\n✅ Registrar novo:\n1. Clique em "Equipamentos"\n2. Clique em "Novo Equipamento"\n3. Preencha: Marca, Modelo, Serial\n4. Clique em "Salvar"\n\n🔍 Buscar:\n1. Use a barra de busca\n2. Digite marca, modelo ou serial\n\n📋 Ver detalhes:\n1. Clique no equipamento\n2. Veja histórico e status\n\nPrecisa de mais?',
    'agendamento': 'Para agendar uma entrega:\n\n📅 Passo a passo:\n1. Vá para "Solicitações"\n2. Selecione o equipamento\n3. Clique em "Agendar Entrega"\n4. Escolha:\n   • Data\n   • Hora\n   • Local\n5. Confirme\n\n✅ Pronto! O equipamento está agendado.\n\nQuer saber mais?',
    'dashboard': '📊 Dashboard - Entenda os números:\n\n🔵 TOTAL DO PROJETO\nTodos os equipamentos do projeto\n\n📦 AGENDADAS\nEquipamentos prontos para entregar\n\n✅ ENTREGAS\nEquipamentos já entregues\n\n📍 DISPONÍVEIS\nEquipamentos prontos para usar\n\n⏳ FALTAM ENTREGAR\nEquipamentos ainda em preparação\n\n🔄 CICLO DE PREPARAÇÃO\nEstágios: Imagem → Softwares → Agendado → Entregue\n\nQuer saber mais sobre algum número?',
    'preparacao': '🔄 Ciclo de Preparação:\n\n1️⃣ COM IMAGEM\nImagem do SO instalada\n\n2️⃣ SOFTWARES INSTALADOS\nTodos os programas prontos\n\n3️⃣ AG. ENTREGA\nAgendado para entregar\n\n4️⃣ ENTREGUES\nJá foi para o usuário\n\nCada etapa é importante! Qual você quer saber mais?',
    'técnico': '👨‍💼 Como Técnico, você pode:\n\n✅ Ver equipamentos atribuídos\n✅ Registrar preparação\n✅ Agendar entregas\n✅ Confirmar entregas\n✅ Visualizar histórico\n✅ Editar dados de entrega\n\n❌ Não pode:\n• Criar usuários\n• Deletar equipamentos\n• Alterar projetos\n\nO que você precisa fazer?',
    'admin': '👨‍💼 Como Admin, você pode:\n\n✅ Gerenciar todos os equipamentos\n✅ Criar e editar usuários\n✅ Atribuir equipamentos\n✅ Ver relatórios\n✅ Importar dados\n✅ Configurar sistema\n✅ Ver auditoria\n\nQual é sua necessidade?',
    'solicitacao': '📝 Solicitações:\n\nSolicitações são pedidos de equipamentos.\n\n✅ Você pode:\n• Ver todas as solicitações\n• Editar datas de entrega\n• Confirmar recebimento\n• Adicionar observações\n\n📍 Onde encontrar:\nMenu → Solicitações\n\nPrecisa de ajuda?',
    'erro': '❌ Encontrei um erro!\n\nTente:\n1. Recarregue a página (F5)\n2. Tente novamente\n3. Limpe o cache do navegador\n4. Se persistir, contate o suporte\n\nDesculpe pelo inconveniente!',
    'senha': '🔐 Esqueceu a senha?\n\n1. Clique em "Esqueci minha senha"\n2. Digite seu email\n3. Verifique seu email\n4. Clique no link\n5. Crie uma nova senha\n\nNão recebeu? Contate o suporte!',
    'relatorio': '📊 Relatórios:\n\nVocê pode gerar:\n• Equipamentos por status\n• Entregas por período\n• Assinaturas\n• Histórico de movimentações\n\nOnde encontrar:\nMenu → Relatórios\n\nQual relatório você precisa?',
    'default': '😊 Entendi sua pergunta!\n\nPosso ajudar com:\n• 📱 Equipamentos\n• 📅 Agendamentos\n• 📊 Dashboard\n• 👥 Usuários\n• 📝 Solicitações\n• 📋 Relatórios\n\nTente perguntar algo mais específico! 😊'
  };

  const obterResposta = (texto) => {
    const textoLower = texto.toLowerCase().trim();
    
    for (const [chave, resposta] of Object.entries(respostasIA)) {
      if (chave !== 'default' && textoLower.includes(chave)) {
        return resposta;
      }
    }
    
    return respostasIA.default;
  };

  const enviarMensagem = async () => {
    if (!inputMensagem.trim()) return;

    // Adicionar mensagem do usuário
    const novaMensagemUsuario = {
      id: mensagens.length + 1,
      tipo: 'usuario',
      texto: inputMensagem,
      timestamp: new Date()
    };

    setMensagens([...mensagens, novaMensagemUsuario]);
    setInputMensagem('');
    setCarregando(true);

    try {
      // Chamar API da IA
      const response = await fetch('/api/assistente-ia/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ mensagem: inputMensagem })
      });

      if (!response.ok) {
        throw new Error('Erro ao obter resposta da IA');
      }

      const data = await response.json();
      
      const novaMensagemIA = {
        id: mensagens.length + 2,
        tipo: 'ia',
        texto: data.resposta,
        timestamp: new Date()
      };
      
      setMensagens(prev => [...prev, novaMensagemIA]);
    } catch (err) {
      console.error('Erro:', err);
      const mensagemErro = {
        id: mensagens.length + 2,
        tipo: 'ia',
        texto: 'Desculpe, encontrei um erro ao processar sua pergunta. Tente novamente!',
        timestamp: new Date()
      };
      setMensagens(prev => [...prev, mensagemErro]);
    } finally {
      setCarregando(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setAberto(!aberto)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 z-40"
        title="Assistente IA"
      >
        {aberto ? (
          <X size={24} />
        ) : (
          <MessageCircle size={24} />
        )}
      </button>

      {/* Chat Window */}
      {aberto && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-2xl flex flex-col z-40 max-h-96">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold">🎯 TUTOR Tech Refresh</h3>
              <p className="text-xs opacity-90">🚨 Modo Ultra Seguro - Apenas ensino</p>
            </div>
            <button
              onClick={() => setAberto(false)}
              className="hover:bg-blue-700 p-1 rounded"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {mensagens.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.tipo === 'usuario'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.texto}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
            {carregando && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3 bg-white rounded-b-lg flex gap-2">
            <input
              type="text"
              value={inputMensagem}
              onChange={(e) => setInputMensagem(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua pergunta..."
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
              disabled={carregando}
            />
            <button
              onClick={enviarMensagem}
              disabled={carregando || !inputMensagem.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded px-3 py-2 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
