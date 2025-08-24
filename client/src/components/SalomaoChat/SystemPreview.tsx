import { useAppStore } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Calculator, Rocket, Eye, Share2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function SystemPreview() {
  const { systemPreview, isGenerating } = useAppStore();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const publishSystemMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        window.location.href = "/api/login";
        return;
      }
      
      const response = await apiRequest("POST", "/api/systems/create-from-chat", {
        sessionId: "temp-session"
      });
      return response.json();
    },
    onSuccess: (system) => {
      toast({
        title: "Sistema publicado!",
        description: `Seu sistema "${system.name}" está online e capturando leads`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível publicar o sistema",
        variant: "destructive",
      });
    },
  });

  const handlePublishSystem = () => {
    publishSystemMutation.mutate();
  };

  const handleShareSystem = () => {
    if (systemPreview) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "O link do sistema foi copiado para a área de transferência",
      });
    }
  };
  
  const handleTestSystem = () => {
    toast({
      title: "🚀 Modo de teste ativado!",
      description: "Visualizando como seus clientes verão o sistema",
    });
  };

  return (
    <div className="max-w-md w-full" data-testid="system-preview">
      <AnimatePresence>
        {/* iPhone Mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mx-auto"
        >
          {/* iPhone Frame */}
          <div className="relative w-[375px] h-[812px] bg-black rounded-[60px] p-3 shadow-2xl">
            {/* Screen */}
            <div className="w-full h-full bg-white rounded-[50px] overflow-hidden relative">
              {/* Status Bar */}
              <div className="h-12 bg-white flex items-center justify-between px-6 pt-2">
                <span className="text-black text-sm font-semibold">9:41</span>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-2 bg-black rounded-sm"></div>
                  <div className="w-6 h-3 border border-black rounded-sm">
                    <div className="w-4 h-2 bg-black rounded-sm ml-0.5 mt-0.5"></div>
                  </div>
                </div>
              </div>
              
              {/* App Content */}
              <div className="flex-1 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                {/* App Header */}
                <div className="bg-white/90 backdrop-blur-sm shadow-sm p-4 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Calculator className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm" data-testid="preview-title">
                        {systemPreview?.title || "Sistema Personalizado"}
                      </h3>
                      <p className="text-xs text-gray-500">IA • Transformação</p>
                    </div>
                  </div>
                  <Smartphone className="w-5 h-5 text-gray-400" />
                </div>

                {/* Hero Section */}
                <div className="px-6 py-8 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h1 className="text-2xl font-bold text-gray-800 mb-3" data-testid="preview-subtitle">
                      {systemPreview?.subtitle || "Descubra sua transformação"}
                    </h1>
                    <p className="text-gray-600 text-sm mb-6">
                      {systemPreview?.hook || "IA personalizada para seu objetivo"}
                    </p>
                  </motion.div>
                  
                  {/* Before/After Preview */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-200 rounded-xl h-24 flex items-center justify-center">
                      <span className="text-gray-500 text-xs font-medium">Antes</span>
                    </div>
                    <div className="bg-gradient-to-br from-green-200 to-emerald-200 rounded-xl h-24 flex items-center justify-center">
                      <span className="text-green-700 text-xs font-medium">Depois</span>
                    </div>
                  </div>
                  
                  {/* Input Form */}
                  <div className="space-y-4 mb-6">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Seu peso atual (kg)"
                        className="w-full p-4 bg-white rounded-xl border border-gray-200 text-gray-800 text-center font-medium shadow-sm"
                        data-testid="preview-input"
                      />
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Sua altura (cm)"
                        className="w-full p-4 bg-white rounded-xl border border-gray-200 text-gray-800 text-center font-medium shadow-sm"
                      />
                    </div>
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg mb-4"
                    data-testid="preview-cta"
                  >
                    {systemPreview?.buttonText || "Ver Minha Transformação"}
                  </motion.button>

                  {/* Trust Signals */}
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="flex items-center justify-center space-x-4 text-green-700 text-xs font-medium">
                      <span>✅ Grátis</span>
                      <span>✅ IA Avançada</span>
                      <span>✅ Resultado em 2min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-60"></div>
          </div>

          {/* Building Animation Overlay */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 rounded-[60px] flex items-center justify-center backdrop-blur-sm"
                data-testid="generation-progress"
              >
                <div className="text-center text-white p-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"
                  />
                  <p className="text-lg font-semibold mb-2">Construindo sistema...</p>
                  <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 8, repeat: Infinity }}
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 space-y-3"
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            onClick={handlePublishSystem}
            disabled={!systemPreview || publishSystemMutation.isPending}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 shadow-lg"
            data-testid="button-publish-system"
          >
            <Rocket className="w-5 h-5 inline mr-2" />
            {publishSystemMutation.isPending ? 'Publicando...' : 'Publicar Sistema'}
          </Button>
        </motion.div>
        
        <div className="grid grid-cols-2 gap-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={handleTestSystem}
              variant="outline"
              className="w-full bg-dark-800 border-dark-600 text-white py-3 rounded-xl font-medium hover:bg-dark-700 transition-colors"
              data-testid="button-test-system"
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Testar
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={handleShareSystem}
              variant="outline"
              className="w-full bg-dark-800 border-dark-600 text-white py-3 rounded-xl font-medium hover:bg-dark-700 transition-colors"
              data-testid="button-share-system"
            >
              <Share2 className="w-4 h-4 inline mr-2" />
              Compartilhar
            </Button>
          </motion.div>
        </div>
        
        {/* Success Metrics */}
        {systemPreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20 mt-6"
          >
            <h4 className="text-center font-semibold text-green-400 mb-3">📊 Métricas Projetadas</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-white">45</div>
                <div className="text-xs text-green-300">Leads/dia</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">89%</div>
                <div className="text-xs text-green-300">Conversão</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">1200%</div>
                <div className="text-xs text-green-300">ROI</div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
