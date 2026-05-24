import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Lightbulb } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AssistenteIA() {
  const [aberto, setAberto] = useState(false);
  const location = useLocation();
  const { usuario } = useAuth();
  
  // Estado para posição do robô (arrastável)
  const [posicao, setPosicao] = useState(() => {
    const salva = localStorage.getItem('assistente-ia-posicao');
    return salva ? JSON.parse(salva) : { bottom: 24, right: 24 };
  });
  const [arrastando, setArrastando] = useState(false);
  const [arrastou, setArrastou] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  
  // Função para obter saudação personalizada
  const obterSaudacaoPersonalizada = () => {
    const hora = new Date().getHours();
    let saudacao = '';
    
    if (hora >= 5 && hora < 12) {
      saudacao = 'Bom dia';
    } else if (hora >= 12 && hora < 18) {
      saudacao = 'Boa tarde';
    } else {
      saudacao = 'Boa noite';
    }
    
    const nome = usuario?.nome ? usuario.nome.split(' ')[0] : 'usuário';
    return `${saudacao}, ${nome}! 👋`;
  };
  
  // Sugestões contextuais baseadas na página atual
  const obterSugestaoContextual = () => {
    const path = location.pathname;
    
    if (path.includes('/dashboard')) {
      return '💡 **Dica do Dashboard:** Use os filtros de data para analisar períodos específicos! Clique nos números para ver detalhes.';
    }
    if (path.includes('/equipamentos')) {
      return '💡 **Dica de Equipamentos:** Use Ctrl+F para buscar rapidamente por serial ou modelo. Clique em "Filtros" para refinar a busca!';
    }
    if (path.includes('/usuarios')) {
      return '💡 **Dica de Usuários:** Para atribuir equipamentos em lote, selecione múltiplos usuários usando Ctrl+Click!';
    }
    if (path.includes('/preparacao')) {
      return '💡 **Dica de Preparação:** Organize por status para ver o fluxo completo: Novo → Imagem → Softwares → Agendado → Entregue!';
    }
    if (path.includes('/solicitacoes')) {
      return '💡 **Dica de Solicitações:** Use as abas para separar por status. Priorize entregas por data de vencimento!';
    }
    if (path.includes('/relatorios')) {
      return '💡 **Dica de Relatórios:** Exporte em Excel para análises avançadas. PDF é melhor para apresentações!';
    }
    if (path.includes('/atribuicoes')) {
      return '💡 **Dica de Atribuições:** Verifique sempre o status antes de fazer nova atribuição. Use filtros por técnico!';
    }
    
    return '💡 **Dica Geral:** Explore o menu lateral para descobrir todas as funcionalidades. Cada seção tem ferramentas específicas!';
  };

  const [mensagens, setMensagens] = useState([
    {
      id: 1,
      tipo: 'ia',
      texto: `🚀 ${usuario ? obterSaudacaoPersonalizada() : 'Olá!'} Sou seu DataFlux do sistema Tech Refresh!\n\n🚨 MODO ULTRA SEGURO ATIVO\n\nEu apenas ENSINO como usar o sistema.\nNão tenho acesso a dados reais.\nNão executo ações.\n\n${obterSugestaoContextual()}\n\nComo posso te orientar hoje?`,
      timestamp: new Date()
    }
  ]);
  const [inputMensagem, setInputMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const messagesEndRef = useRef(null);

  // Atualiza mensagem inicial quando muda de página ou usuário
  useEffect(() => {
    if (mensagens.length === 1 && usuario) {
      const novaSugestao = obterSugestaoContextual();
      setMensagens([{
        id: 1,
        tipo: 'ia',
        texto: `🚀 ${obterSaudacaoPersonalizada()} Sou seu DataFlux do sistema Tech Refresh!\n\n🚨 MODO ULTRA SEGURO ATIVO\n\nEu apenas ENSINO como usar o sistema.\nNão tenho acesso a dados reais.\nNão executo ações.\n\n${novaSugestao}\n\nComo posso te orientar hoje?`,
        timestamp: new Date()
      }]);
    }
  }, [location.pathname, usuario]);

  const scrollParaBaixo = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollParaBaixo();
  }, [mensagens]);

  // Funções para arrastar o robô
  const iniciarArraste = (e) => {
    e.preventDefault();
    setArrastando(true);
    setArrastou(false);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const arrastar = (e) => {
    if (!arrastando) return;
    
    setArrastou(true); // Marca que houve movimento
    
    const novaBottom = window.innerHeight - e.clientY - offset.y;
    const novaRight = window.innerWidth - e.clientX - offset.x;
    
    // Limites para não sair da tela
    const bottomLimitado = Math.max(0, Math.min(novaBottom, window.innerHeight - 160));
    const rightLimitado = Math.max(0, Math.min(novaRight, window.innerWidth - 160));
    
    setPosicao({ bottom: bottomLimitado, right: rightLimitado });
  };

  const pararArraste = () => {
    if (arrastando) {
      setArrastando(false);
      // Salva posição no localStorage
      localStorage.setItem('assistente-ia-posicao', JSON.stringify(posicao));
    }
  };

  useEffect(() => {
    if (arrastando) {
      window.addEventListener('mousemove', arrastar);
      window.addEventListener('mouseup', pararArraste);
      return () => {
        window.removeEventListener('mousemove', arrastar);
        window.removeEventListener('mouseup', pararArraste);
      };
    }
  }, [arrastando, offset]);

  const respostasIA = {
    // Saudações
    'oi|ola|olá|hey|opa|e ai|eai|bom dia|boa tarde|boa noite': () => {
      const nome = usuario?.nome ? usuario.nome.split(' ')[0] : '';
      return `${obterSaudacaoPersonalizada()} ${nome ? '' : 'Bem-vindo ao'} Tech Refresh! Como posso ajudá-lo hoje?`;
    },
    
    // Ajuda geral
    'ajuda|help|socorro|preciso de ajuda|nao sei|não sei|como usar|tutorial': 'Claro! Posso ajudar com:\n\n📱 Equipamentos\n• Como registrar novo equipamento\n• Buscar equipamentos\n• Ver detalhes\n\n📅 Agendamentos\n• Como agendar entrega\n• Ver agendamentos\n• Confirmar entrega\n\n📊 Dashboard\n• Entender os números\n• Ver ciclo de preparação\n• Relatórios\n\n👥 Usuários\n• Criar usuários\n• Atribuir equipamentos\n• Gerenciar permissões\n\nDigite o que você precisa!',
    
    // Equipamentos
    'equipamento|equipamentos|maquina|maquinas|computador|computadores|laptop|desktop|notebook': 'Para gerenciar equipamentos:\n\n✅ Registrar novo:\n1. Clique em "Equipamentos"\n2. Clique em "Novo Equipamento"\n3. Preencha: Marca, Modelo, Serial\n4. Clique em "Salvar"\n\n🔍 Buscar:\n1. Use a barra de busca\n2. Digite marca, modelo ou serial\n\n📋 Ver detalhes:\n1. Clique no equipamento\n2. Veja histórico e status\n\n💡 **Dica Pro:** Use Ctrl+F para busca rápida na página!\n\nPrecisa de mais detalhes?',
    
    // Como cadastrar
    'como cadastrar|cadastrar|registrar|criar equipamento|novo equipamento': 'Para cadastrar um novo equipamento:\n\n📝 Passo a passo:\n1. Clique no menu "Equipamentos"\n2. Clique no botão "Novo Equipamento"\n3. Preencha os campos:\n   • Marca (ex: Dell, HP, Lenovo)\n   • Modelo (ex: Latitude 5520)\n   • Serial Number\n   • Tipo (Laptop/Desktop)\n4. Clique em "Salvar"\n\n✅ Pronto! Equipamento cadastrado!\n\nPrecisa de mais ajuda?',
    
    // Agendamentos
    'agendamento|agendar|agenda|entrega|entregar|delivery': 'Para agendar uma entrega:\n\n📅 Passo a passo:\n1. Vá para "Solicitações"\n2. Selecione o equipamento\n3. Clique em "Agendar Entrega"\n4. Escolha:\n   • Data\n   • Hora\n   • Local\n5. Confirme\n\n✅ Pronto! O equipamento está agendado.\n\nQuer saber mais?',
    
    // Dashboard
    'dashboard|painel|numeros|números|estatisticas|estatísticas': '📊 Dashboard - Entenda os números:\n\n🔵 TOTAL DO PROJETO\nTodos os equipamentos do projeto\n\n📦 AGENDADAS\nEquipamentos prontos para entregar\n\n✅ ENTREGAS\nEquipamentos já entregues\n\n📍 DISPONÍVEIS\nEquipamentos prontos para usar\n\n⏳ FALTAM ENTREGAR\nEquipamentos ainda em preparação\n\n🔄 CICLO DE PREPARAÇÃO\nEstágios: Imagem → Softwares → Agendado → Entregue\n\n💡 **Dicas do Dashboard:**\n• Clique nos números para ver detalhes\n• Use filtros de data no topo\n• Gráficos mostram tendências\n\nQuer saber mais sobre algum número?',
    
    // Usuários
    'usuario|usuários|usuarios|user|users|tecnico|técnico|admin|administrador|colaborador|colaboradores|funcionario|funcionário': '👥 Gerenciar Usuários:\n\n👨‍💼 **TÉCNICO** pode:\n✅ Ver equipamentos atribuídos\n✅ Registrar preparação\n✅ Agendar entregas\n✅ Confirmar entregas\n\n👨‍💻 **ADMIN** pode:\n✅ Criar usuários\n✅ Atribuir equipamentos\n✅ Ver relatórios\n✅ Configurar sistema\n\nQual permissão você precisa saber?',
    
    // Relatórios
    'relatorio|relatórios|relatórios|report|reports|exportar|imprimir|pdf': '📊 Relatórios disponíveis:\n\n📋 **Tipos de relatório:**\n• Equipamentos por status\n• Entregas por período\n• Assinaturas de entrega\n• Histórico de movimentações\n• Equipamentos por técnico\n\n📍 **Como acessar:**\nMenu → Relatórios\n\n📄 **Formatos:**\n• PDF para impressão\n• Excel para análise\n\n💡 **Dicas de Relatórios:**\n• Excel permite filtros avançados\n• PDF mantém formatação para apresentações\n• Use filtros de data para períodos específicos\n• Salve modelos de relatórios frequentes\n\nQual relatório você precisa?',
    
    // Erros e problemas
    'erro|error|problema|bug|nao funciona|não funciona|travou|quebrou': '❌ Problemas no sistema?\n\nTente estas soluções:\n1. Recarregue a página (F5)\n2. Limpe o cache do navegador\n3. Feche e abra o navegador\n4. Verifique sua conexão\n5. Tente em outro navegador\n\nSe persistir, anote:\n• Que tela estava usando\n• O que estava fazendo\n• Mensagem de erro\n\nE contate o suporte!',
    
    // Login e senha
    'senha|password|login|entrar|acesso|logar|loguin': '🔐 Problemas de acesso?\n\n**Esqueceu a senha?**\n1. Clique em "Esqueci minha senha"\n2. Digite seu email\n3. Verifique seu email\n4. Clique no link\n5. Crie uma nova senha\n\n**Não consegue entrar?**\n• Verifique se o email está correto\n• Certifique-se que o Caps Lock está desligado\n• Tente outro navegador\n\nPrecisa de mais ajuda?',
    
    'default': '😊 Entendi sua pergunta!\n\n🎯 **Posso ajudar com:**\n• 📱 Equipamentos (cadastrar, buscar, editar)\n• 📅 Agendamentos (agendar, confirmar entregas)\n• 📊 Dashboard (entender números)\n• 👥 Usuários (criar, permissões)\n• 📝 Solicitações (gerenciar pedidos)\n• 📋 Relatórios (gerar, exportar)\n\n💡 **Dica:** Tente ser mais específico!\nExemplo: "equipamentos" ou "como cadastrar"'
  };

  const obterResposta = (texto) => {
    const textoLimpo = texto.toLowerCase().trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s]/g, ' ') // Remove pontuação
      .replace(/\s+/g, ' '); // Remove espaços extras
    
    console.log('Texto processado:', textoLimpo); // Debug
    
    // Verifica cada categoria de respostas
    for (const [chaves, resposta] of Object.entries(respostasIA)) {
      if (chaves === 'default') continue;
      
      const palavrasChave = chaves.split('|');
      
      // Verifica se alguma palavra-chave está no texto
      for (const chave of palavrasChave) {
        const chaveNormalizada = chave.toLowerCase().trim();
        
        // Busca exata ou contém a palavra
        if (textoLimpo === chaveNormalizada || textoLimpo.includes(chaveNormalizada)) {
          console.log('Encontrou:', chaveNormalizada); // Debug
          // Se a resposta é uma função, executa ela
          return typeof resposta === 'function' ? resposta() : resposta;
        }
      }
    }
    
    console.log('Usando resposta padrão'); // Debug
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
    const perguntaUsuario = inputMensagem;
    setInputMensagem('');
    setCarregando(true);

    // Simular delay de resposta
    setTimeout(() => {
      const resposta = obterResposta(perguntaUsuario);
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
      {/* Botão Flutuante - ARRASTÁVEL */}
      <button
        onMouseDown={iniciarArraste}
        onClick={(e) => {
          // Só abre o chat se NÃO arrastou
          if (!arrastou) {
            setAberto(!aberto);
          }
        }}
        style={{
          bottom: `${posicao.bottom}px`,
          right: `${posicao.right}px`,
          cursor: arrastando ? 'grabbing' : 'grab'
        }}
        className="fixed bg-transparent hover:scale-105 transition-transform duration-300 z-40"
        title="DataFlux - Assistente IA (Arraste para mover)"
      >
        {aberto ? (
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-xl">
            <X size={16} className="text-gray-600" />
          </div>
        ) : (
          <img 
            src="/robot-icon.png" 
            alt="DataFlux - Assistente IA" 
            className="w-40 h-40 object-contain pointer-events-none"
          />
        )}
      </button>

      {/* Chat Window - Posicionado próximo ao robô */}
      {aberto && (
        <div 
          style={{
            bottom: `${posicao.bottom + 100}px`,
            right: `${posicao.right}px`
          }}
          className="fixed w-96 bg-white rounded-lg shadow-2xl flex flex-col z-40 max-h-96"
        >
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold">🚀 DataFlux Tech Refresh</h3>
              <p className="text-xs opacity-90">🚨 Modo Ultra Seguro - Apenas ensino</p>
            </div>
            <button
              onClick={() => setAberto(false)}
              className="hover:bg-blue-700 p-1 rounded transition-colors duration-200"
            >
              <X size={16} />
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
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3 bg-white rounded-b-lg">
            {/* Botão de Sugestão Contextual */}
            <div className="mb-2">
              <button
                onClick={() => {
                  const sugestao = obterSugestaoContextual();
                  const novaMensagem = {
                    id: mensagens.length + 1,
                    tipo: 'ia',
                    texto: `💡 **Sugestão para esta página:**\n\n${sugestao}\n\nPrecisa de mais orientações específicas?`,
                    timestamp: new Date()
                  };
                  setMensagens(prev => [...prev, novaMensagem]);
                }}
                className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Lightbulb size={14} />
                Dica para esta página
              </button>
            </div>
            
            <div className="flex gap-2">
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
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
