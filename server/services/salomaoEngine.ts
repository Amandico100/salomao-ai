import OpenAI from "openai";
import { storage } from "../storage";
import type { InsertSystem, InsertChatSession, ChatSession } from "@shared/schema";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface UserInput {
  targetAudience: string;
  weightGoal?: string;
  mainChallenge?: string;
  conversionMethod: string;
  sdrAutomation?: string;
  businessType?: string;
  instagramUrl?: string;
}

interface QuestionFlow {
  step: number;
  question: string;
  subtext?: string;
  type: 'text_input' | 'options' | 'text_area';
  options?: string[];
  psychology?: string;
}

export class SalomaoEngine {
  private questionFlow: QuestionFlow[] = [
    {
      step: 1,
      question: "Que tipo de cliente você quer atrair em massa?",
      subtext: "Ex: empresários, mulheres que querem emagrecer, donos de pets...",
      type: "text_input"
    },
    {
      step: 2,
      question: "Quantos kg em média seus clientes querem perder?",
      type: "options",
      options: ["5-10kg", "10-20kg", "20-30kg", "30kg+"],
      psychology: "Meta específica gera comprometimento psicológico"
    },
    {
      step: 3,
      question: "Qual o maior desafio deles hoje?",
      type: "options",
      options: ["Falta de tempo", "Não conseguem manter dieta", "Não sabem o que comer", "Resultados lentos"],
      psychology: "Identificar dor específica aumenta conexão emocional"
    },
    {
      step: 4,
      question: "Como você prefere converter esses leads?",
      type: "options",
      options: ["WhatsApp direto", "Agendamento de consulta", "Venda de programa online", "Grupo VIP"],
      psychology: "Método de conversão alinhado com perfil do público"
    },
    {
      step: 5,
      question: "Quer que eu inclua um SDR automático que fecha vendas no piloto?",
      type: "options",
      options: ["Sim, quero conversão máxima!", "Não, prefiro fazer manual"],
      psychology: "Oferta de automação aumenta valor percebido"
    }
  ];

  async startChatSession(userId?: string): Promise<ChatSession> {
    const sessionData: InsertChatSession = {
      userId,
      messages: JSON.stringify([
        {
          role: 'assistant',
          content: 'Olá! Sou o Salomão, sua IA especialista em sistemas de vendas. Vou criar um sistema personalizado para seu negócio em 60 segundos. Vamos começar?',
          timestamp: new Date().toISOString()
        }
      ]),
      currentStep: 1,
      systemData: JSON.stringify({}),
      status: 'active'
    };

    return await storage.createChatSession(sessionData);
  }

  async processMessage(sessionId: string, userMessage: string): Promise<{
    response: string;
    nextStep?: number;
    isComplete?: boolean;
    systemPreview?: any;
  }> {
    const session = await storage.getChatSession(sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    const messages = JSON.parse(session.messages as string) || [];
    const systemData = JSON.parse(session.systemData as string) || {};
    const currentStep = session.currentStep || 1;

    // Add user message to history
    messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    });

    // Process current step
    let response = '';
    let nextStep = currentStep;
    let isComplete = false;
    let systemPreview = null;
    let responseOptions: string[] | undefined;

    switch (currentStep) {
      case 1:
        systemData.targetAudience = userMessage;
        if (userMessage.toLowerCase().includes('emagrecer') || userMessage.toLowerCase().includes('peso') || userMessage.toLowerCase().includes('dieta')) {
          response = `Excelente! Para criar a isca perfeita para **${userMessage}**, me conta:`;
          responseOptions = this.questionFlow[1].options;
          response += `\n\n${this.questionFlow[1].question}`;
        } else {
          response = `Perfeito! Vou criar um sistema para atrair **${userMessage}**.\n\n${this.questionFlow[1].question}`;
          responseOptions = this.questionFlow[1].options;
        }
        nextStep = 2;
        break;

      case 2:
        systemData.weightGoal = userMessage;
        response = `Perfeito! Vou focar em pessoas que querem perder **${userMessage}**. Agora me conta:`;
        responseOptions = this.questionFlow[2].options;
        response += `\n\n${this.questionFlow[2].question}`;
        nextStep = 3;
        break;

      case 3:
        systemData.mainChallenge = userMessage;
        response = `Entendi! O maior obstáculo é "**${userMessage}**". Vou criar uma solução específica para isso.`;
        responseOptions = this.questionFlow[3].options;
        response += `\n\n${this.questionFlow[3].question}`;
        nextStep = 4;
        break;

      case 4:
        systemData.conversionMethod = userMessage;
        response = `Ótima escolha! **${userMessage}** tem alta taxa de conversão para esse nicho.`;
        responseOptions = this.questionFlow[4].options;
        response += `\n\n${this.questionFlow[4].question}`;
        nextStep = 5;
        break;

      case 5:
        systemData.sdrAutomation = userMessage;
        // Generate system with AI
        const generatedSystem = await this.generateSystemWithAI(systemData);
        
        response = `🎉 **SISTEMA "CALCULADORA DE TRANSFORMAÇÃO CORPORAL" CRIADO!**\n\n🔥 **Com este sistema você terá:**\n📈 De 3 leads/dia → **45 leads/dia**\n💰 **Aumento de 1200%** no faturamento  \n⭐ **89% de taxa de conversão**\n\n✨ **FUNCIONALIDADES INCLUÍDAS:**\n• ${generatedSystem.description}\n• Visualização antes/depois com IA\n• Plano personalizado automático\n• ${systemData.sdrAutomation === 'Sim, quero conversão máxima!' ? 'SDR automático incluso' : 'Captura manual de leads'}\n• Integração direta com ${systemData.conversionMethod}\n\n🚀 **Pronto para capturar leads qualificados que querem perder ${systemData.weightGoal}!**\n\nClique em "Publicar Sistema" para ativar e começar a receber leads hoje mesmo!`;
        
        systemPreview = {
          title: "Calculadora de Transformação Corporal",
          subtitle: "Veja como você ficará em 90 dias",
          buttonText: "Ver Minha Transformação",
          hook: "Descubra seu peso ideal e veja o resultado visual",
          template: "weight_loss_calculator",
          targetWeight: systemData.weightGoal,
          challenge: systemData.mainChallenge,
          conversionMethod: systemData.conversionMethod,
          hasSDR: systemData.sdrAutomation === 'Sim, quero conversão máxima!'
        };
        
        isComplete = true;
        break;
    }

    // Add assistant response with options if available
    messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
      options: responseOptions
    });

    // Update session
    await storage.updateChatSession(sessionId, {
      messages: JSON.stringify(messages),
      currentStep: nextStep,
      systemData: JSON.stringify(systemData)
    });

    return {
      response,
      nextStep: isComplete ? undefined : nextStep,
      isComplete,
      systemPreview
    };
  }

  private calculateProjectedRevenue(goal: string): { min: number; max: number } {
    const goalMap: Record<string, { min: number; max: number }> = {
      '10-30': { min: 15, max: 45 },
      '30-100': { min: 50, max: 150 },
      '100-500': { min: 150, max: 400 },
      '500+': { min: 400, max: 800 }
    };
    return goalMap[goal] || { min: 50, max: 200 };
  }

  private async generateSystemWithAI(systemData: any): Promise<any> {
    try {
      const prompt = `
        Você é o Salomão, especialista em sistemas de vendas. Baseado nos dados abaixo, crie um sistema personalizado:
        
        - Público-alvo: ${systemData.targetAudience}
        - Meta mensal: ${systemData.monthlyGoal} clientes
        - Desejo dos clientes: ${systemData.clientDesires}
        - Método de conversão: ${systemData.conversionMethod}
        
        Responda em JSON com:
        {
          "name": "Nome do sistema",
          "description": "Descrição em 1 linha",
          "features": ["feature1", "feature2", "feature3"],
          "conversionRate": "taxa estimada em %",
          "template": "template_id_sugerido",
          "preview": {
            "title": "Título da landing page",
            "subtitle": "Subtítulo",
            "buttonText": "Texto do botão principal",
            "colors": {
              "primary": "#3b82f6",
              "secondary": "#1e293b"
            }
          }
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "Você é o Salomão, especialista em criar sistemas de vendas personalizados. Responda sempre em JSON válido."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result;
    } catch (error) {
      console.error('Error generating system with AI:', error);
      // Fallback response
      return {
        name: "Sistema Personalizado",
        description: "Sistema inteligente de captação de leads",
        features: ["Formulário otimizado", "Integração WhatsApp", "Analytics em tempo real"],
        conversionRate: "35",
        template: "custom_template",
        preview: {
          title: `Solução para ${systemData.targetAudience}`,
          subtitle: systemData.clientDesires,
          buttonText: "Quero Saber Mais",
          colors: {
            primary: "#3b82f6",
            secondary: "#1e293b"
          }
        }
      };
    }
  }

  async createSystemFromChat(sessionId: string, userId: string): Promise<any> {
    const session = await storage.getChatSession(sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    const systemData = JSON.parse(session.systemData as string);
    const generatedSystem = await this.generateSystemWithAI(systemData);

    const systemConfig: InsertSystem = {
      userId,
      name: generatedSystem.name,
      url: `${generatedSystem.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      config: JSON.stringify({
        ...generatedSystem,
        originalData: systemData
      }),
      status: 'active',
      metrics: JSON.stringify({
        views: 0,
        leads: 0,
        conversions: 0,
        conversionRate: 0
      })
    };

    return await storage.createSystem(systemConfig);
  }

  getQuestionFlow(): QuestionFlow[] {
    return this.questionFlow;
  }
}

export const salomaoEngine = new SalomaoEngine();
