import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function AssistenteIA() {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState([
    {
      id: 1,
      tipo: 'ia',
      texto: 'Olá! Sou seu assistente IA. Como posso ajudá-lo hoje?',
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
    'oi': 'Olá! Como posso ajudá-lo com o sistema de Tech Refresh?',
    'olá': 'Olá! Como posso ajudá-lo com o sistema de Tech Refresh?',
    'ajuda': 'Posso ajudar com:\n• Informações sobre equipamentos\n• Status de agendamentos\n• Dúvidas sobre como usar o sistema\n• Sugestões de otimização\n\nO que você precisa?',
    'equipamentos': 'Para gerenciar equipamentos:\n1. Vá para "Equipamentos"\n2. Clique em "Novo Equipamento"\n3. Preencha os dados\n4. Clique em "Salvar"\n\nPrecisa de mais ajuda?',
    'agendamento': 'Para agendar uma entrega:\n1. Vá para "Solicitações"\n2. Selecione o equipamento\n3. Clique em "Agendar Entrega"\n4. Escolha data e hora\n5. Confirme\n\nAlguma dúvida?',
    'dashboard': 'O Dashboard mostra:\n• Total de equipamentos\n• Equipamentos agendados\n• Equipamentos entregues\n• Equipamentos disponíveis\n• Ciclo de preparação\n\nQuer saber mais sobre algum número?',
    'erro': 'Desculpe, encontrei um erro. Por favor:\n1. Recarregue a página\n2. Tente novamente\n3. Se persistir, contate o suporte\n\nPosso ajudar com mais algo?',
    'técnico': 'Como técnico, você pode:\n• Ver equipamentos atribuídos\n• Registrar preparação\n• Agendar entregas\n• Confirmar entregas\n• Visualizar histórico\n\nO que você precisa fazer?',
    'admin': 'Como admin, você pode:\n• Gerenciar todos os equipamentos\n• Criar usuários\n• Atribuir projetos\n• Ver relatórios\n• Configurar sistema\n\nO que você precisa?',
    'default': 'Entendi sua pergunta. Posso ajudar com:\n• Como usar o sistema\n• Informações sobre equipamentos\n• Status de agendamentos\n• Dúvidas gerais\n\nTente perguntar algo específico!'
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

    // Simular delay de resposta
    setTimeout(() => {
      const resposta = obterResposta(inputMensagem);
      const novaMensagemIA = {
        id: mensagens.length + 2,
        tipo: 'ia',
        texto: resposta,
        timestamp: new Date()
      };
      setMensagens(prev => [...prev, novaMensagemIA]);
      setCarregando(false);
    }, 500);
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
              <h3 className="font-bold">Assistente IA</h3>
              <p className="text-xs opacity-90">Sempre aqui para ajudar</p>
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
