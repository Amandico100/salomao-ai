import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAppStore } from "@/lib/store";
import Navigation from "@/components/Layout/Navigation";
import ChatInterface from "@/components/SalomaoChat/ChatInterface";
import SystemPreview from "@/components/SalomaoChat/SystemPreview";
import { useToast } from "@/hooks/use-toast";

export default function Chat() {
  const { currentChatSession, setCurrentChatSession } = useAppStore();
  const { toast } = useToast();

  // Start chat session on mount
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/chat/start", {});
      return response.json();
    },
    onSuccess: (session) => {
      setCurrentChatSession(session.id);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a conversa com o Salomão",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!currentChatSession) {
      startSessionMutation.mutate();
    }
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 text-white" data-testid="chat-page">
      <Navigation />
      
      <div className="flex h-screen pt-16">
        {/* Left Column - Chat Interface */}
        <div className="w-2/5 border-r border-dark-600 flex flex-col bg-dark-900" data-testid="chat-column">
          <ChatInterface sessionId={currentChatSession} />
        </div>

        {/* Right Column - System Preview */}
        <div className="flex-1 bg-dark-800 flex items-center justify-center p-8" data-testid="preview-column">
          <SystemPreview />
        </div>
      </div>
    </div>
  );
}
