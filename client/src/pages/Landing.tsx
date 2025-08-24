import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calculator, Scissors, HeartHandshake } from "lucide-react";
import Navigation from "@/components/Layout/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function Landing() {
  const [inputValue, setInputValue] = useState("");
  const [systemsCreated, setSystemsCreated] = useState(2847);

  const { data: popularTemplates } = useQuery({
    queryKey: ["/api/templates/popular"],
  });

  // Animate counter
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setSystemsCreated(prev => prev + 1);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStartFree = () => {
    window.location.href = "/chat";
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white" data-testid="landing-page">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-dark-800 border border-dark-600 text-dark-300" data-testid="systems-counter">
              <span className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></span>
              {systemsCreated.toLocaleString()} sistemas criados hoje
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" data-testid="hero-title">
            Qual tipo de <span className="gradient-text">cliente você quer</span><br/>
            atrair em massa hoje?
          </h1>
          
          <p className="text-xl text-dark-300 mb-12 max-w-3xl mx-auto leading-relaxed" data-testid="hero-description">
            Crie seu sistema automático e inteligente de vendas em <strong className="text-white">60 segundos</strong>.
            O Salomão analisa seu negócio e gera um app personalizado que converte visitantes em clientes.
          </p>
          
          {/* CTA Input Section */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="glass rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ex: Empresários de 30-50 anos que querem pagar menos impostos..."
                    className="w-full px-4 py-4 bg-dark-800 border-dark-600 text-white placeholder-dark-400 focus:border-primary-500 h-12"
                    data-testid="input-target-audience"
                  />
                </div>
                <Button 
                  onClick={handleStartFree}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 px-8 py-4 h-12 font-semibold transition-all transform hover:scale-105 shadow-lg"
                  data-testid="button-start-free"
                >
                  Começar Grátis
                </Button>
              </div>
              <p className="text-xs text-dark-400 mt-3 text-left">
                ✅ Sem cartão de crédito • ✅ Resultado em 60 segundos • ✅ Usado por 12.000+ empresários
              </p>
            </div>
          </div>

          {/* Popular Templates */}
          <div className="mb-20">
            <h3 className="text-2xl font-semibold mb-8" data-testid="templates-section-title">Templates mais populares</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {Array.isArray(popularTemplates) ? popularTemplates.map((template: any, index: number) => (
                <Card key={template.id} className="glass rounded-xl p-6 hover:bg-dark-800/60 transition-all cursor-pointer group" data-testid={`template-card-${index}`}>
                  <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                    {index === 0 && <Calculator className="w-6 h-6 text-primary-400" />}
                    {index === 1 && <Scissors className="w-6 h-6 text-purple-400" />}
                    {index === 2 && <HeartHandshake className="w-6 h-6 text-green-400" />}
                  </div>
                  <h4 className="font-semibold mb-2" data-testid={`template-name-${index}`}>{template.name}</h4>
                  <p className="text-dark-300 text-sm mb-4" data-testid={`template-description-${index}`}>{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-success text-sm font-medium" data-testid={`template-conversion-${index}`}>
                      {Math.round(parseFloat(template.conversionRate) * 100)}% conversão
                    </span>
                    <span className="text-xs text-dark-400" data-testid={`template-usage-${index}`}>
                      {template.usageCount.toLocaleString()} usando
                    </span>
                  </div>
                </Card>
              )) : null}
            </div>
          </div>

          {/* Social Proof */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center" data-testid="stat-systems">
              <div className="text-3xl font-bold text-primary-500 mb-2">12,847</div>
              <div className="text-dark-300">Sistemas criados</div>
            </div>
            <div className="text-center" data-testid="stat-conversion">
              <div className="text-3xl font-bold text-success mb-2">89%</div>
              <div className="text-dark-300">Taxa média de conversão</div>
            </div>
            <div className="text-center" data-testid="stat-revenue">
              <div className="text-3xl font-bold text-warning mb-2">R$ 2.4M</div>
              <div className="text-dark-300">Faturado pelos clientes</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
