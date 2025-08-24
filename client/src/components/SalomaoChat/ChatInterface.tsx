import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAppStore } from "@/lib/store";
import { Crown, Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  options?: string[];
  isBuilding?: boolean;
  buildingStep?: string;
}

interface ChatInterfaceProps {
  sessionId: string | null;
}

export default function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isBuildingSystem, setIsBuildingSystem] = useState(false);
  const [buildingStep, setBuildingStep] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { setSystemPreview, setIsGenerating } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: chatSession } = useQuery({
    queryKey: ["/api/chat", sessionId],
    enabled: !!sessionId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest("POST", `/api/chat/${sessionId}/message`, {
        message: messageText
      });
      return response.json();
    },
    onSuccess: async (result) => {
      setIsTyping(false);
      
      if (result.isComplete) {
        setIsBuildingSystem(true);
        setIsGenerating(true);
        
        // Animação de construção do sistema
        const buildingSteps = [
          { text: "🔍 Analisando seu nicho...", duration: 2000 },
          { text: "🎯 Criando isca irresistível...", duration: 2000 },
          { text: "🤖 Configurando SDR inteligente...", duration: 2000 },
          { text: "🚀 Sistema pronto! Veja o resultado...", duration: 2000 }
        ];
        
        for (const step of buildingSteps) {
          setBuildingStep(step.text);
          await new Promise(resolve => setTimeout(resolve, step.duration));
        }
        
        setIsBuildingSystem(false);
        setIsGenerating(false);
        
        // Salvar sistema no localStorage temporariamente
        if (result.systemPreview) {
          const systems = JSON.parse(localStorage.getItem('createdSystems') || '[]');
          const newSystem = {
            id: Date.now().toString(),
            ...result.systemPreview,
            createdAt: new Date().toISOString()
          };
          systems.push(newSystem);
          localStorage.setItem('createdSystems', JSON.stringify(systems));
          setSystemPreview(newSystem);
        }
        
        toast({
          title: "🎉 Sistema criado com sucesso!",
          description: "Seu sistema personalizado está pronto e pode capturar até 45 leads por dia!",
        });
      } else if (result.systemPreview) {
        setSystemPreview(result.systemPreview);
      }
      
      // Refetch chat session to get updated messages
      queryClient.invalidateQueries({ queryKey: ["/api/chat", sessionId] });
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
    },
  });

  const messages: Message[] = chatSession && (chatSession as any).messages ? (typeof (chatSession as any).messages === 'string' ? JSON.parse((chatSession as any).messages) : (chatSession as any).messages) : [];

  const handleSendMessage = () => {
    if (!message.trim() || !sessionId) return;
    
    setIsTyping(true);
    sendMessageMutation.mutate(message);
    setMessage("");
  };
  
  const handleOptionClick = (option: string) => {
    setIsTyping(true);
    sendMessageMutation.mutate(option);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <>
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-dark-600 flex items-center space-x-3" data-testid="chat-header">
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
          <Crown className="w-5 h-5 text-dark-900" />
        </div>
        <div>
          <h3 className="font-semibold" data-testid="salomao-name">Salomão</h3>
          <p className="text-xs text-success flex items-center" data-testid="salomao-status">
            <span className="w-2 h-2 bg-success rounded-full mr-1 animate-pulse"></span>
            {isTyping ? 'Analisando...' : 'Online'}
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6" data-testid="chat-messages">
        <AnimatePresence>
          {messages && messages.map((msg, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`chat-bubble ${msg.role === 'user' ? 'flex justify-end' : ''}`} 
              data-testid={`message-${index}`}
            >
              {msg.role === 'assistant' ? (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Crown className="w-4 h-4 text-dark-900" />
                  </div>
                  <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm">
                    <p className="text-sm whitespace-pre-wrap" data-testid={`assistant-message-${index}`}>{msg.content}</p>
                    {msg.options && (
                      <div className="mt-3 space-y-2">
                        {msg.options.map((option, optIndex) => (
                          <motion.button
                            key={optIndex}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleOptionClick(option)}
                            className="block w-full text-left px-3 py-2 bg-primary-500/20 hover:bg-primary-500/30 rounded-lg text-sm transition-colors border border-primary-500/30"
                            data-testid={`option-${optIndex}`}
                          >
                            {option}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="bg-primary-500 rounded-2xl rounded-tr-sm px-4 py-3 max-w-sm"
                >
                  <p className="text-sm whitespace-pre-wrap" data-testid={`user-message-${index}`}>{msg.content}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-3 opacity-70" 
            data-testid="typing-indicator"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Crown className="w-4 h-4 text-dark-900" />
            </div>
            <div className="glass rounded-2xl rounded-tl-sm px-4 py-3">
              <p className="text-sm typing-dots">Analisando respostas</p>
            </div>
          </motion.div>
        )}
        
        {/* Building System Animation */}
        {isBuildingSystem && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start space-x-3" 
            data-testid="building-indicator"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Crown className="w-4 h-4 text-dark-900" />
            </div>
            <div className="glass rounded-2xl rounded-tl-sm px-4 py-3">
              <p className="text-sm font-medium text-yellow-400">{buildingStep}</p>
              <div className="w-32 h-1 bg-dark-600 rounded-full mt-2 overflow-hidden">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600"
                />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-6 border-t border-dark-600" data-testid="chat-input-area">
        <div className="flex items-end space-x-3">
          <Button variant="ghost" className="p-2 text-dark-400 hover:text-white transition-colors" data-testid="attachment-button">
            <Paperclip className="w-5 h-5" />
          </Button>
          <div className="flex-1 bg-dark-800 rounded-xl border border-dark-600 focus-within:border-primary-500 transition-colors">
            <Textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua resposta..."
              className="w-full bg-transparent px-4 py-3 text-sm placeholder-dark-400 focus:outline-none resize-none border-0"
              rows={1}
              data-testid="message-input"
            />
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-primary-500 hover:bg-primary-600 p-2 rounded-xl transition-colors disabled:opacity-50"
              data-testid="send-button"
            >
              <Send className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  );
}
