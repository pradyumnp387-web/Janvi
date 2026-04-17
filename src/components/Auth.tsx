import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthProps {
  onLogin: () => void;
}

export function Auth({ onLogin }: AuthProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Pane - Branding */}
      <div className="bg-sidebar p-12 flex flex-col justify-between relative overflow-hidden border-r border-border">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-primary">AutoContent</span>
          </div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl sm:text-8xl font-black leading-[0.88] tracking-tight mb-8 text-text-main"
          >
            CONTENT<br />ON AUTO<br />PILOT.
          </motion.h1>
          <p className="text-xl text-text-muted max-w-md">
            Turn a single prompt into a daily content series. Automated scripts, visuals, and scheduling for creators.
          </p>
        </div>

        <div className="relative z-10 flex gap-8 items-end">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary">Status</span>
            <span className="text-xs font-mono font-bold text-text-main">SYSTEM_READY</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-secondary">Version</span>
            <span className="text-xs font-mono font-bold text-text-main">v1.0.4_BETA</span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Right Pane - Login */}
      <div className="bg-bg flex items-center justify-center p-8">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-sm w-full space-y-8"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-text-main">Welcome back</h2>
            <p className="text-text-muted">Sign in to manage your automated content studio.</p>
          </div>

          <button
            onClick={onLogin}
            className="w-full h-16 bg-linear-to-r from-primary to-secondary text-white rounded-[20px] flex items-center justify-between px-8 hover:opacity-90 transition-all group shadow-lg shadow-primary/20"
          >
            <span className="font-bold text-lg">Continue with Google</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="pt-8 border-t border-border">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-card-bg rounded-[24px] border border-border shadow-sm">
                <span className="block text-3xl font-black text-primary mb-1">100%</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-text-muted">Automated</span>
              </div>
              <div className="p-6 bg-card-bg rounded-[24px] border border-border shadow-sm">
                <span className="block text-3xl font-black text-secondary mb-1">24/7</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-text-muted">Scheduling</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


