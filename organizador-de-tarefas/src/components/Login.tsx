import React from 'react';
import { motion } from 'motion/react';
import { LogIn, Sparkles, Mic } from 'lucide-react';
import { login } from '../lib/session';

export const Login: React.FC = () => {
  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-indigo-500/10 p-8 text-center border border-slate-200 dark:border-slate-800"
      >
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-full p-6 border border-slate-100 dark:border-slate-800">
              <Mic className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
            </div>
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.2, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full bg-indigo-500/20"
            />
          </div>
        </div>

        <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-3">
          Organizador de Tarefas
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          Grave um áudio com as suas tarefas do dia. O app transcreve, categoriza, define prioridades e configura lembretes de forma inteligente.
        </p>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 group"
        >
          <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          Entrar com Google
        </button>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Potencializado por Gemini AI</span>
        </div>
      </motion.div>
    </div>
  );
};
