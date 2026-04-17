import { useState } from 'react';
import { User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { generateSeriesPlan, generateImage } from '../services/gemini';
import { X, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { motion } from 'motion/react';
import { addDays, format } from 'date-fns';
import { toast } from 'sonner';

interface CreateSeriesProps {
  user: User;
  onClose: () => void;
}

export function CreateSeries({ user, onClose }: CreateSeriesProps) {
  const [prompt, setPrompt] = useState('');
  const [parts, setParts] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [plan, setPlan] = useState<any>(null);

  const handleGeneratePlan = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const generatedPlan = await generateSeriesPlan(prompt, parts);
      setPlan(generatedPlan);
      setStep('preview');
    } catch (error) {
      console.error('Error generating plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = async () => {
    if (!plan) return;
    setIsGenerating(true);
    try {
      // 1. Create Series
      const seriesRef = await addDoc(collection(db, 'series'), {
        userId: user.uid,
        prompt,
        title: plan.title,
        description: plan.description,
        totalParts: plan.parts.length,
        status: 'active',
        createdAt: serverTimestamp()
      });

      // 2. Create Parts (Batch)
      const batch = writeBatch(db);
      const startDate = new Date();

      for (let i = 0; i < plan.parts.length; i++) {
        const part = plan.parts[i];
        const partRef = doc(collection(db, `series/${seriesRef.id}/parts`));
        
        // Generate image for the first part immediately, others can be lazy-generated or background
        let imageUrl = '';
        if (i === 0) {
          try {
            imageUrl = await generateImage(part.imagePrompt);
          } catch (e) {
            console.error('Initial image generation failed', e);
          }
        }

        batch.set(partRef, {
          seriesId: seriesRef.id,
          userId: user.uid,
          partNumber: part.partNumber,
          scheduledDate: format(addDays(startDate, i), 'yyyy-MM-dd'),
          script: part.script,
          imagePrompt: part.imagePrompt,
          imageUrl: imageUrl,
          status: 'scheduled',
          caption: part.caption,
          hashtags: part.hashtags,
          createdAt: serverTimestamp()
        });
      }

      await batch.commit();
      toast.success('Series created successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving series:', error);
      toast.error('Failed to create series.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-text-main/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-card-bg w-full max-w-2xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] border border-border"
      >
        <div className="p-8 border-b border-border flex items-center justify-between bg-card-bg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-black tracking-tight text-text-main">Create New Series</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg rounded-full transition-colors text-text-muted">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 bg-card-bg">
          {step === 'input' ? (
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-primary uppercase tracking-widest">Story Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A girl chasing her dreams in Mumbai, starting from a small village..."
                  className="input-box w-full h-40 resize-none text-lg bg-bg border-border text-text-main"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-secondary uppercase tracking-widest">Series Length (Days)</label>
                <div className="flex gap-4">
                  {[7, 14, 30].map((n) => (
                    <button
                      key={n}
                      onClick={() => setParts(n)}
                      className={`flex-1 py-4 rounded-2xl border-2 transition-all font-black ${
                        parts === n 
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                          : 'bg-bg border-border text-text-muted hover:border-primary/30'
                      }`}
                    >
                      {n} Days
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="p-6 bg-linear-to-br from-primary/10 to-secondary/10 rounded-[24px] border border-primary/20">
                <h4 className="font-black text-2xl text-text-main mb-2">{plan.title}</h4>
                <p className="text-base text-text-muted font-medium">{plan.description}</p>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black text-text-muted uppercase tracking-widest">Generated Parts Preview</label>
                <div className="space-y-4">
                  {plan.parts.slice(0, 3).map((p: any) => (
                    <div key={p.partNumber} className="p-6 border border-border rounded-[24px] flex gap-6 hover:border-primary/30 transition-colors bg-bg/50">
                      <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 font-black text-sm">
                        {p.partNumber}
                      </div>
                      <div className="space-y-2">
                        <p className="text-base font-bold text-text-main line-clamp-2 leading-relaxed">{p.script}</p>
                        <div className="flex gap-2">
                          {p.hashtags.map((tag: string) => (
                            <span key={tag} className="text-[10px] font-black text-secondary uppercase tracking-widest">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {plan.parts.length > 3 && (
                    <p className="text-center text-xs text-text-muted font-bold italic">+ {plan.parts.length - 3} more parts generated...</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-border bg-bg/50">
          {step === 'input' ? (
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating || !prompt.trim()}
              className="btn-primary w-full py-5 flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  <span className="text-lg">Generate Series Plan</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={() => setStep('input')}
                className="flex-1 py-5 bg-card-bg border border-border rounded-[20px] font-black text-text-muted hover:bg-bg transition-all shadow-lg"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={isGenerating}
                className="flex-[2] btn-primary py-5 flex items-center justify-center gap-3 shadow-xl shadow-primary/30 disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Wand2 className="w-6 h-6" />
                    <span className="text-lg">Confirm & Start Series</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

