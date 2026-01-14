import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { GentleMessage } from '../types';

interface MessageCardProps {
  message: GentleMessage | null;
  isLoading: boolean;
  isSaved: boolean;
  onSave: (message: GentleMessage) => void;
  onRefresh: () => void;
}

const MessageCard: React.FC<MessageCardProps> = ({ message, isLoading, isSaved, onSave, onRefresh }) => {
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 animate-pulse h-64 md:h-80 w-full max-w-lg">
        <div className="h-6 w-48 bg-[#4a4e69]/5 rounded-full mb-4"></div>
        <div className="h-4 w-64 bg-[#4a4e69]/5 rounded-full"></div>
        <div className="h-4 w-40 bg-[#4a4e69]/5 rounded-full"></div>
      </div>
    );
  }

  const displayMessage = message || {
    text: "Kindling a thought for you...",
    type: 'quote',
    author: 'Ember'
  } as GentleMessage;

  const getFullText = () => `"${displayMessage.text}"${displayMessage.author ? ` — ${displayMessage.author}` : ''}`;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const fullText = getFullText();
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = getFullText();
    const shareUrl = window.location.origin + window.location.pathname;
    const shareData = {
      title: 'A Moment from Ember',
      text: shareText,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      handleCopy(e);
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave(displayMessage);
  };

  return (
    <div 
      key={displayMessage.text}
      className="w-full max-w-2xl px-8 py-12 md:py-20 text-center animate-fade-in flex flex-col items-center relative select-none rounded-[3rem] transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
    >
      <div className="absolute right-4 top-4 md:right-8 md:top-8 flex flex-col space-y-3 z-10 opacity-40 hover:opacity-100 transition-opacity">
        <button 
          onClick={handleSaveClick}
          className={`p-3 rounded-full transition-all duration-300 bg-white/40 backdrop-blur-sm border border-[#f2e9e4] shadow-sm ${isSaved ? 'text-[#e5989b]' : 'text-[#9a8c98] hover:text-[#e5989b]'}`}
          title={isSaved ? "Remove" : "Save"}
        >
          <svg 
            className={isSaved ? 'animate-heart-pop' : ''}
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            fill={isSaved ? "currentColor" : "none"} 
            stroke="currentColor" 
            strokeWidth="1.5" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        </button>

        <button 
          onClick={handleCopy}
          className="p-3 rounded-full text-[#9a8c98] hover:text-[#4a4e69] transition-all duration-300 bg-white/40 backdrop-blur-sm border border-[#f2e9e4] shadow-sm relative"
          title="Copy to Clipboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5-1.5H13.5a9.06 9.06 0 0 1 1.5 1.5h1.125c.621 0 1.125.504 1.125 1.125V11.25M7.5 10.5h6.375m-6.375 3h6.375m-6.375 3h7.5" />
          </svg>
          {copied && (
            <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#4a4e69] text-white text-[10px] px-3 py-1.5 rounded-lg shadow-xl uppercase tracking-widest font-medium animate-fade-in-up">
              Copied!
            </span>
          )}
        </button>

        <button 
          onClick={handleShare}
          className="p-3 rounded-full text-[#9a8c98] hover:text-[#4a4e69] transition-all duration-300 bg-white/40 backdrop-blur-sm border border-[#f2e9e4] shadow-sm"
          title="Share"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Zm3.933 12.814a2.25 2.25 0 1 0-3.933-2.185 2.25 2.25 0 0 0 3.933 2.185Z" />
          </svg>
        </button>
      </div>

      <div className={`text-2xl md:text-4xl lg:text-5xl leading-[1.6] md:leading-[1.4] serif italic mb-8 md:mb-12 transition-colors duration-1000 ${displayMessage.type === 'goal_completion' ? 'text-[#4a4e69]' : 'text-[#22223b]'}`}>
        <ReactMarkdown components={{ p: React.Fragment }}>
          {`"${displayMessage.text}"`}
        </ReactMarkdown>
      </div>
      
      {displayMessage.author && (
        <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-[#9a8c98] font-light opacity-60">
          — {displayMessage.author}
        </p>
      )}

      <div className="mt-16 flex flex-col items-center">
        <button 
          onClick={onRefresh}
          className="group flex flex-col items-center space-y-4 focus:outline-none"
        >
          <div className="w-14 h-14 rounded-full bg-white/40 border border-[#f2e9e4] flex items-center justify-center text-[#9a8c98] group-hover:text-[#4a4e69] group-hover:bg-white group-hover:shadow-lg transition-all duration-500 scale-100 group-hover:scale-110 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="group-hover:rotate-180 transition-transform duration-700">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#9a8c98] group-hover:text-[#4a4e69] transition-colors duration-500">
            Kindle Another
          </span>
        </button>
      </div>

      {displayMessage.type === 'compliment' && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-2 shimmer-bg text-[#4a4e69] text-[10px] font-medium rounded-full uppercase tracking-[0.3em] shadow-sm border border-[#f2e9e4]">
          Warmth
        </div>
      )}
    </div>
  );
};

export default MessageCard;