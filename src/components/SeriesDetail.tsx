import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { generateImage } from '../services/gemini';
import { ArrowLeft, Play, Image as ImageIcon, CheckCircle2, Clock, Wand2, Loader2, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface SeriesDetailProps {
  series: any;
  onBack: () => void;
}

export function SeriesDetail({ series, onBack }: SeriesDetailProps) {
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [activePart, setActivePart] = useState<any | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, `series/${series.id}/parts`),
      orderBy('partNumber', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const partsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setParts(partsData);
      if (partsData.length > 0 && !activePart) {
        setActivePart(partsData[0]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [series.id]);

  const handleGenerateImage = async (part: any) => {
    setGeneratingId(part.id);
    try {
      const imageUrl = await generateImage(part.imagePrompt);
      await updateDoc(doc(db, `series/${series.id}/parts`, part.id), {
        imageUrl
      });
      toast.success('Image generated!');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Generation failed.');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleGenerateVideo = async (part: any) => {
    if (!part.imageUrl) {
      toast.error('Generate an image first!');
      return;
    }
    setGeneratingId(part.id);
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: part.imageUrl,
          script: part.script,
          partId: part.id
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate video');
      
      const { videoUrl } = await response.json();
      await updateDoc(doc(db, `series/${series.id}/parts`, part.id), {
        videoUrl
      });
      toast.success('Video generated successfully!');
    } catch (error) {
      console.error('Error generating video:', error);
      toast.error('Video generation failed.');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Download started!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <button 
          onClick={onBack}
          className="p-3 bg-card-bg hover:bg-bg rounded-2xl border border-border shadow-sm transition-all text-text-muted"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-text-main">{series.title}</h2>
          <p className="text-text-muted font-medium">{series.description}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        {/* Left Column: Timeline & Details */}
        <div className="space-y-8">
          <div className="card">
            <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-6">Series Timeline</h3>
            <div className="space-y-4">
              {parts.map((part) => (
                <motion.div
                  key={part.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setActivePart(part)}
                  className={`p-6 rounded-[24px] border cursor-pointer transition-all ${
                    activePart?.id === part.id 
                      ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' 
                      : 'bg-card-bg border-border hover:border-primary/30'
                  }`}
                >
                  <div className="flex gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-lg transition-colors ${
                      activePart?.id === part.id ? 'bg-primary text-white' : 'bg-bg text-text-muted'
                    }`}>
                      {part.partNumber}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{part.scheduledDate}</span>
                        <div className="flex items-center gap-2">
                          {part.status === 'posted' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-secondary" />
                          )}
                          <span className="text-[10px] uppercase font-black tracking-widest opacity-60">{part.status}</span>
                        </div>
                      </div>
                      <p className="text-base font-bold text-text-main leading-relaxed">{part.script}</p>
                      <div className="flex flex-wrap gap-2">
                        {part.hashtags?.map((tag: string) => (
                          <span key={tag} className="px-2 py-1 bg-secondary/10 text-secondary text-[10px] font-black rounded-lg">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Phone Preview */}
        <div className="space-y-6 sticky top-24 h-fit">
          <h3 className="text-sm font-black text-secondary uppercase tracking-widest text-center">Live Preview</h3>
          
          <div className="phone-frame w-[300px] h-[533px] bg-[#000] rounded-[36px] border-[8px] border-border relative overflow-hidden mx-auto shadow-2xl">
            {activePart?.videoUrl ? (
              <div className="h-full w-full relative">
                <video 
                  src={activePart.videoUrl} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
                  <div className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full w-fit mb-4">VIDEO READY</div>
                  <h4 className="font-black text-xl leading-tight mb-2 uppercase italic">
                    PART {activePart.partNumber}
                  </h4>
                </div>
              </div>
            ) : activePart?.imageUrl ? (
              <div className="h-full w-full relative">
                <img 
                  src={activePart.imageUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full w-fit mb-4">IMAGE READY</div>
                  <h4 className="font-black text-2xl leading-tight mb-2 uppercase italic">
                    PART {activePart.partNumber}:<br />
                    {activePart.script.split(' ').slice(0, 3).join(' ')}...
                  </h4>
                  <p className="text-xs opacity-80 font-medium">Scheduled for {activePart.scheduledDate}</p>
                </div>
                
                {/* Mock UI */}
                <div className="absolute right-3 bottom-20 flex flex-col gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full border border-white/20" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full w-full bg-bg flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-card-bg rounded-2xl border border-border flex items-center justify-center shadow-sm">
                  <ImageIcon className="w-8 h-8 text-primary/20" />
                </div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest leading-relaxed">
                  No visual generated for Part {activePart?.partNumber}
                </p>
                <button
                  onClick={() => handleGenerateImage(activePart)}
                  disabled={generatingId === activePart?.id}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                >
                  {generatingId === activePart?.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Generate Image</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {activePart?.videoUrl ? (
              <button
                onClick={() => handleDownload(activePart.videoUrl, `series-${series.id}-part-${activePart.partNumber}.mp4`)}
                className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
              >
                <Download className="w-5 h-5" />
                <span>Download Video</span>
              </button>
            ) : activePart?.imageUrl ? (
              <div className="space-y-3">
                <button
                  onClick={() => handleGenerateVideo(activePart)}
                  disabled={generatingId === activePart?.id}
                  className="w-full py-4 bg-secondary text-white rounded-2xl font-black text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-secondary/20"
                >
                  {generatingId === activePart?.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Generate Video</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDownload(activePart.imageUrl, `series-${series.id}-part-${activePart.partNumber}.jpg`)}
                  className="w-full py-4 bg-card-bg border border-border text-text-main rounded-2xl font-black text-sm hover:bg-bg transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Image</span>
                </button>
              </div>
            ) : null}
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-card-bg border border-border rounded-xl font-bold text-sm hover:bg-bg transition-colors">Edit Script</button>
              <button className="flex-1 py-3 bg-card-bg border border-border rounded-xl font-bold text-sm hover:bg-bg transition-colors">Replace Media</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



