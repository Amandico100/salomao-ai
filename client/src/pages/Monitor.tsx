import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Database, Server, Eye, FileText, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface HealthData {
  status: string;
  timestamp: string;
  uptime: number;
  memory: any;
  version: string;
  platform: string;
  environment: string;
}

interface ProjectInfo {
  name: string;
  description: string;
  version: string;
  author: string;
  stack: {
    frontend: string;
    backend: string;
    database: string;
    ai: string;
    auth: string;
    deployment: string;
  };
  features: string[];
  currentStatus: string;
}

interface ActivityData {
  timestamp: string;
  recentActivity: {
    chatSessions?: any[];
    systemsGenerated?: string;
    activeFeatures?: string[];
    status?: string;
    message?: string;
  };
}

export default function Monitor() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [env, setEnv] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthRes, infoRes, activityRes, envRes] = await Promise.all([
          fetch('/api/monitor/health'),
          fetch('/api/monitor/info'),
          fetch('/api/monitor/activity'),
          fetch('/api/monitor/env')
        ]);

        const healthData = await healthRes.json();
        const infoData = await infoRes.json();
        const activityData = await activityRes.json();
        const envData = await envRes.json();

        setHealth(healthData);
        setProjectInfo(infoData);
        setActivity(activityData);
        setEnv(envData);
      } catch (error) {
        console.error('Error fetching monitor data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Setup logs streaming
    const eventSource = new EventSource('/api/monitor/logs');
    eventSource.onmessage = (event) => {
      const logData = JSON.parse(event.data);
      setLogs(prev => [
        `[${new Date(logData.timestamp).toLocaleTimeString()}] ${logData.message}`,
        ...prev.slice(0, 9)
      ]);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes: number) => {
    return `${Math.round(bytes / 1024 / 1024)}MB`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white p-8" data-testid="monitor-page">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-4">
            SALOMÃO.AI System Monitor
          </h1>
          <p className="text-dark-400">
            Painel de monitoramento e acesso externo ao projeto
          </p>
        </motion.div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Health Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-dark-800 border-dark-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Activity className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {health?.status === 'healthy' ? '✅ Online' : '❌ Offline'}
                </div>
                <p className="text-xs text-dark-400">
                  Uptime: {health ? formatUptime(health.uptime) : '0h 0m'}
                </p>
                <p className="text-xs text-dark-400">
                  Memory: {health ? formatMemory(health.memory.used) : '0MB'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Environment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-dark-800 border-dark-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Environment</CardTitle>
                <Server className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">
                  {env?.NODE_ENV || 'development'}
                </div>
                <p className="text-xs text-dark-400">
                  OpenAI: {env?.HAS_OPENAI ? '✅' : '❌'}
                </p>
                <p className="text-xs text-dark-400">
                  Database: {env?.HAS_DATABASE ? '✅' : '❌'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Database */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-dark-800 border-dark-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database</CardTitle>
                <Database className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">
                  PostgreSQL
                </div>
                <p className="text-xs text-dark-400">
                  Provider: Neon
                </p>
                <p className="text-xs text-dark-400">
                  Status: Connected
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Project Information */}
        {projectInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-dark-800 border-dark-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Project Information
                </CardTitle>
                <CardDescription>
                  Informações completas sobre o projeto SALOMÃO.AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-primary-400">{projectInfo.name}</h3>
                  <p className="text-sm text-dark-400">{projectInfo.description}</p>
                  <p className="text-xs text-green-400 mt-2">{projectInfo.currentStatus}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-white mb-2">Tech Stack:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-dark-400">Frontend:</span> {projectInfo.stack.frontend}</div>
                    <div><span className="text-dark-400">Backend:</span> {projectInfo.stack.backend}</div>
                    <div><span className="text-dark-400">Database:</span> {projectInfo.stack.database}</div>
                    <div><span className="text-dark-400">AI:</span> {projectInfo.stack.ai}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Features:</h4>
                  <ul className="text-sm text-dark-400 space-y-1">
                    {projectInfo.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Activity */}
        {activity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-dark-800 border-dark-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activity.recentActivity.chatSessions && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Chat Sessions:</h4>
                    {activity.recentActivity.chatSessions.map((session, index) => (
                      <div key={index} className="text-sm text-dark-400 bg-dark-700 p-2 rounded">
                        Session {session.id.slice(0, 8)}... - Step {session.step} - {session.status}
                      </div>
                    ))}
                  </div>
                )}
                
                {activity.recentActivity.activeFeatures && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Active Features:</h4>
                    <ul className="text-sm text-dark-400">
                      {activity.recentActivity.activeFeatures.map((feature, index) => (
                        <li key={index}>✅ {feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Live Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-dark-800 border-dark-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto">
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <div key={index} className="text-green-400 mb-1">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-dark-400">Waiting for logs...</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Access Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center space-y-4"
        >
          <h3 className="text-xl font-semibold">API Endpoints para Acesso Externo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-dark-800 p-4 rounded-lg">
              <div className="font-mono text-primary-400">GET /api/monitor/health</div>
              <div className="text-dark-400">System health status</div>
            </div>
            <div className="bg-dark-800 p-4 rounded-lg">
              <div className="font-mono text-primary-400">GET /api/monitor/info</div>
              <div className="text-dark-400">Project information</div>
            </div>
            <div className="bg-dark-800 p-4 rounded-lg">
              <div className="font-mono text-primary-400">GET /api/monitor/structure</div>
              <div className="text-dark-400">Project file structure</div>
            </div>
            <div className="bg-dark-800 p-4 rounded-lg">
              <div className="font-mono text-primary-400">GET /api/monitor/activity</div>
              <div className="text-dark-400">Recent activity</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}