import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GentleMessage, MessageType, DailyGoal } from './types';
import { fetchGentleMessage } from './services/geminiService';
import { audioService } from './services/audioService';
import MessageCard from './components/MessageCard';
import DailyGoalSection from './components/DailyGoalSection';
import AmbientSoundControl, { AmbientType } from './components/AmbientSoundControl';

const App: React.FC = () => {
  const [message, setMessage] = useState<GentleMessage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bgIndex, setBgIndex] = useState(0);
  const [showFavorites, setShowFavorites] = useState(false);
  const [ambientType, setAmbientType] = useState<AmbientType>('none');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [savedMessages, setSavedMessages] = useState<GentleMessage[]>(() => {
    try {
      const saved = localStorage.getItem('gentle_saved_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>(() => {
    try {
      const saved = localStorage.getItem('gentle_daily_goals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const backgrounds = ['bg-[#fdfcfb]', 'bg-[#f8f9fa]', 'bg-[#fffaf0]', 'bg-[#f0f4f8]'];

  const getNewMessage = useCallback(async (forcedType?: MessageType, context?: string) => {
    setIsLoading(true);
    setError(null);
    
    // Runtime entropy selection
    const themes = [
      "soft morning light", "the first snowfall", "a quiet library", 
      "warm amber embers", "starlit horizons", "gentle ocean mist",
      "mountain silence", "garden blooms", "golden hour"
    ];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];

    try {
      const type: MessageType = forcedType || (Math.random() < 0.3 ? 'compliment' : 'quote');
      const newMessage = await fetchGentleMessage(type, context, randomTheme);
      setMessage(newMessage);
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
      
      try {
        if (newMessage.type === 'compliment') audioService.playCompliment();
        else if (newMessage.type === 'goal_completion') audioService.playCompletion();
        else audioService.playQuote();
      } catch (e) {
        console.warn('Audio playback failed', e);
      }
    } catch (err) {
      console.error("App: Fetch error", err);
      setError("The connection to the stars was interrupted. Showing local light.");
    } finally {
      setIsLoading(false);
    }
  }, [backgrounds.length]);

  // UseEffect triggers runtime randomness on every mount (refresh)
  useEffect(() => {
    getNewMessage();
  }, [getNewMessage]);

  const handleSetGoal = (text: string, totalSteps: number) => {
    const newGoal: DailyGoal = { 
      id: crypto.randomUUID(),
      text, 
      isCompleted: false, 
      currentSteps: 0, 
      totalSteps 
    };
    const updatedGoals = [...dailyGoals, newGoal];
    setDailyGoals(updatedGoals);
    try {
      localStorage.setItem('gentle_daily_goals', JSON.stringify(updatedGoals));
    } catch (e) { console.warn('LocalStorage failed', e); }
    audioService.playProgress();
  };

  const handleUpdateProgress = async (goalId: string, step: number) => {
    const updatedGoals = dailyGoals.map(goal => {
      if (goal.id === goalId) {
        const isNowCompleted = step >= goal.totalSteps;
        const isUndo = step < goal.currentSteps;
        if (isUndo) audioService.playUndo();
        else if (isNowCompleted && !goal.isCompleted) getNewMessage('goal_completion', goal.text);
        else audioService.playProgress();
        return { ...goal, currentSteps: step, isCompleted: isNowCompleted };
      }
      return goal;
    });
    setDailyGoals(updatedGoals);
    try {
      localStorage.setItem('gentle_daily_goals', JSON.stringify(updatedGoals));
    } catch (e) { console.warn('LocalStorage failed', e); }
  };

  const handleClearGoal = (goalId: string) => {
    const updatedGoals = dailyGoals.filter(goal => goal.id !== goalId);
    setDailyGoals(updatedGoals);
    try {
      localStorage.setItem('gentle_daily_goals', JSON.stringify(updatedGoals));
    } catch (e) { console.warn('LocalStorage failed', e); }
    audioService.playUndo();
  };

  const toggleSaveMessage = (msg: GentleMessage) => {
    const isAlreadySaved = savedMessages.some(m => m.text === msg.text);
    let newSaved;
    if (isAlreadySaved) {
      newSaved = savedMessages.filter(m => m.text !== msg.text);
      audioService.playUndo();
    } else {
      newSaved = [...savedMessages, msg];
      audioService.playProgress();
    }
    setSavedMessages(newSaved);
    try {
      localStorage.setItem('gentle_saved_messages', JSON.stringify(newSaved));
    } catch (e) { console.warn('LocalStorage failed', e); }
  };

  const handleAmbientChange = (type: AmbientType) => {
    setAmbientType(type);
    try {
      if (type === 'none') audioService.stopAmbient();
      else audioService.startAmbient(type as any);
    } catch (e) { console.warn('Ambient audio failed', e); }
  };

  const filteredMessages = useMemo(() => {
    if (!searchTerm.trim()) return savedMessages;
    const term = searchTerm.toLowerCase();
    return savedMessages.filter(msg => 
      msg.text.toLowerCase().includes(term) || 
      (msg.author && msg.author.toLowerCase().includes(term))
    );
  }, [savedMessages, searchTerm]);

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${backgrounds[bgIndex]} flex flex-col items-center p-4 md:p-8 relative`}>
      <nav className="w-full max-w-5xl flex justify-between items-center mb-12 md:mb-20 z-20">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl serif tracking-tighter text-[#22223b] ember-spark-text">Ember</h1>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#9a8c98] mt-1">Light for the quiet hours</span>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <AmbientSoundControl current={ambientType} onChange={handleAmbientChange} />
          <button 
            onClick={() => setShowFavorites(!showFavorites)}
            className={`p-2 rounded-full transition-all duration-300 ${showFavorites ? 'text-[#4a4e69] bg-[#4a4e69]/5' : 'text-[#9a8c98] hover:text-[#4a4e69]'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill={showFavorites ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
          </button>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-5xl flex flex-col items-center">
        {error && !showFavorites && (
          <div className="bg-red-50 text-red-800 text-[10px] uppercase tracking-widest px-4 py-2 rounded-full mb-8 animate-fade-in">
            {error}
          </div>
        )}

        {showFavorites ? (
          <div className="w-full max-w-2xl flex flex-col items-center animate-fade-in">
            <h2 className="text-xs uppercase tracking-[0.3em] text-[#9a8c98] mb-8">Your Collection</h2>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Find a spark..."
              className="w-full max-w-md bg-white/30 border border-[#f2e9e4] rounded-full py-3 px-12 text-sm text-[#4a4e69] mb-12 focus:outline-none"
            />
            {filteredMessages.length === 0 ? (
              <p className="serif italic text-[#4a4e69] opacity-40">Your sanctuary is quiet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {filteredMessages.map((msg, idx) => (
                  <div key={idx} className="bg-white/40 p-6 rounded-3xl border border-[#f2e9e4] relative group animate-fade-in-up" style={{animationDelay: `${idx*0.05}s`}}>
                    <button onClick={() => toggleSaveMessage(msg)} className="absolute top-4 right-4 text-[#e5989b] opacity-40 hover:opacity-100">×</button>
                    <p className="serif italic text-[#4a4e69] mb-2">"{msg.text}"</p>
                    {msg.author && <p className="text-[10px] uppercase tracking-widest text-[#9a8c98]">— {msg.author}</p>}
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowFavorites(false)} className="mt-12 text-[10px] uppercase tracking-[0.2em] text-[#9a8c98]">Back to light</button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center space-y-24">
            <MessageCard 
              message={message} 
              isLoading={isLoading} 
              isSaved={savedMessages.some(m => m.text === (message?.text || ""))} 
              onSave={toggleSaveMessage} 
              onRefresh={() => getNewMessage()}
            />
            <div className="w-full max-w-md pb-20">
              <DailyGoalSection 
                goals={dailyGoals} 
                onSetGoal={handleSetGoal} 
                onUpdateProgress={handleUpdateProgress} 
                onClearGoal={handleClearGoal} 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;