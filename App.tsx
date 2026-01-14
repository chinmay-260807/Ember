import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GentleMessage, MessageType, DailyGoal, DailyQuote } from './types';
import { fetchGentleMessage } from './services/geminiService';
import { audioService } from './services/audioService';
import MessageCard from './components/MessageCard';
import DailyGoalSection from './components/DailyGoalSection';
import AmbientSoundControl, { AmbientType } from './components/AmbientSoundControl';

const App: React.FC = () => {
  const [message, setMessage] = useState<GentleMessage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bgIndex, setBgIndex] = useState(0);
  const [showFavorites, setShowFavorites] = useState(false);
  const [ambientType, setAmbientType] = useState<AmbientType>('none');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [dailyQuote, setDailyQuote] = useState<DailyQuote | null>(() => {
    try {
      const saved = localStorage.getItem('gentle_quote_of_the_day');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [savedMessages, setSavedMessages] = useState<GentleMessage[]>(() => {
    try {
      const saved = localStorage.getItem('gentle_saved_messages');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>(() => {
    try {
      const saved = localStorage.getItem('gentle_daily_goals');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const backgrounds = [
    'bg-[#fdfcfb]',
    'bg-[#f8f9fa]',
    'bg-[#fffaf0]',
    'bg-[#f0f4f8]'
  ];

  const getNewMessage = useCallback(async (forcedType?: MessageType, context?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const type: MessageType = forcedType || (Math.random() < 0.2 ? 'compliment' : 'quote');
      const newMessage = await fetchGentleMessage(type, context);
      
      setMessage(newMessage);
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
      
      if (newMessage.type === 'compliment') {
        audioService.playCompliment();
      } else if (newMessage.type === 'goal_completion') {
        audioService.playCompletion();
      } else {
        audioService.playQuote();
      }
    } catch (err) {
      console.error("Failed to fetch message", err);
      setError("The connection to the stars was interrupted.");
    } finally {
      setIsLoading(false);
    }
  }, [backgrounds.length]);

  useEffect(() => {
    const init = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      if (dailyQuote && dailyQuote.date === today) {
        setMessage(dailyQuote.message);
        setIsLoading(false);
      } else {
        await getNewMessage('daily');
      }
    };
    init().catch(err => {
      console.error("Initialization error", err);
      setError("Something went wrong while lighting the fire.");
      setIsLoading(false);
    });
  }, []);

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
    localStorage.setItem('gentle_daily_goals', JSON.stringify(updatedGoals));
    audioService.playProgress();
  };

  const handleUpdateProgress = async (goalId: string, step: number) => {
    const updatedGoals = dailyGoals.map(goal => {
      if (goal.id === goalId) {
        const isNowCompleted = step >= goal.totalSteps;
        const isUndo = step < goal.currentSteps;

        if (isUndo) {
          audioService.playUndo();
        } else if (isNowCompleted && !goal.isCompleted) {
          getNewMessage('goal_completion', goal.text);
        } else {
          audioService.playProgress();
        }

        return { ...goal, currentSteps: step, isCompleted: isNowCompleted };
      }
      return goal;
    });
    
    setDailyGoals(updatedGoals);
    localStorage.setItem('gentle_daily_goals', JSON.stringify(updatedGoals));
  };

  const handleClearGoal = (goalId: string) => {
    const updatedGoals = dailyGoals.filter(goal => goal.id !== goalId);
    setDailyGoals(updatedGoals);
    localStorage.setItem('gentle_daily_goals', JSON.stringify(updatedGoals));
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
    localStorage.setItem('gentle_saved_messages', JSON.stringify(newSaved));
  };

  const handleAmbientChange = (type: AmbientType) => {
    setAmbientType(type);
    if (type === 'none') {
      audioService.stopAmbient();
    } else {
      audioService.startAmbient(type as any);
    }
  };

  const isMessageSaved = (text?: string) => {
    if (!text) return false;
    return savedMessages.some(m => m.text === text);
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
    <div className={`min-h-screen transition-colors duration-1000 ${backgrounds[bgIndex]} flex flex-col items-center p-4 md:p-8 relative overflow-x-hidden`}>
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
            title="Collection"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill={showFavorites ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
          </button>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-5xl flex flex-col items-center">
        {error && !showFavorites && (
          <div className="bg-red-50 text-red-800 text-xs px-4 py-2 rounded-full mb-8 animate-fade-in-up">
            {error}
          </div>
        )}

        {showFavorites ? (
          <div className="w-full max-w-2xl animate-fade-in flex flex-col items-center">
            <h2 className="text-xs uppercase tracking-[0.3em] text-[#9a8c98] mb-8">Your Collection</h2>
            
            <div className="w-full max-w-md mb-12 relative group">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find a spark..."
                className="w-full bg-white/30 backdrop-blur-sm border border-[#f2e9e4] rounded-full py-3 px-12 text-sm text-[#4a4e69] focus:outline-none focus:border-[#e5989b] focus:bg-white/50 transition-all placeholder:text-[#9a8c98]/50 placeholder:italic"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a8c98] opacity-50 group-focus-within:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9a8c98] hover:text-[#e5989b] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {savedMessages.length === 0 ? (
              <div className="text-center py-20 opacity-40">
                <p className="serif italic text-[#4a4e69]">Your sanctuary is waiting for its first spark.</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-20 opacity-40">
                <p className="serif italic text-[#4a4e69]">No matches found for "{searchTerm}".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {filteredMessages.map((msg, idx) => (
                  <div key={idx} className="bg-white/40 p-6 rounded-3xl border border-[#f2e9e4] relative group animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <button 
                      onClick={() => toggleSaveMessage(msg)}
                      className="absolute top-4 right-4 text-[#e5989b] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="serif italic text-[#4a4e69] mb-4">"{msg.text}"</p>
                    {msg.author && <p className="text-[10px] uppercase tracking-widest text-[#9a8c98]">— {msg.author}</p>}
                  </div>
                ))}
              </div>
            )}
            <button 
              onClick={() => {
                setShowFavorites(false);
                setSearchTerm('');
              }}
              className="mt-12 text-[10px] uppercase tracking-[0.2em] text-[#9a8c98] hover:text-[#4a4e69] transition-colors"
            >
              Back to light
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center space-y-24 md:space-y-32">
            <div className="flex flex-col items-center w-full">
              <MessageCard 
                message={message} 
                isLoading={isLoading} 
                isSaved={isMessageSaved(message?.text)} 
                onSave={toggleSaveMessage} 
                onRefresh={() => getNewMessage()}
              />
            </div>

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

      <footer className="w-full max-w-5xl py-8 flex flex-col items-center opacity-30 text-[9px] uppercase tracking-[0.3em] text-[#4a4e69]">
        <span>Softness is a strength</span>
      </footer>
    </div>
  );
};

export default App;