import React, { useState, useEffect, useRef } from 'react';

const TextToSpeech = ({ article }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('mr'); // Marathi
  const audioRef = useRef(null);

  // Extract all text from article
  const extractArticleText = () => {
    if (!article) return '';
    
    let fullText = '';
    
    if (article.title) {
      fullText += article.title + '. ';
    }
    
    if (article.subtitle) {
      fullText += article.subtitle + '. ';
    }
    
    if (article.summary) {
      fullText += article.summary + '. ';
    }
    
    if (article.content) {
      if (typeof article.content === 'string' && (article.content.includes('<') || article.content.includes('&'))) {
        // HTML content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = article.content;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        fullText += textContent;
      } else {
        // Plain text content
        fullText += article.content;
      }
    }
    
    return fullText.trim();
  };

  // Google Translate TTS via backend proxy - Free and reliable
  const speakWithGoogleTTS = async (text, lang = 'mr') => {
    try {
      // Split text at sentence boundaries (full stops) instead of fixed chunks
      const sentences = text.split(/([।.!?।]+)/).filter(s => s.trim().length > 0);
      const chunks = [];
      let currentChunk = '';
      const maxChunkLength = 200; // Still respect character limit
      
      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
        // If adding this sentence would exceed limit, save current chunk and start new one
        if (currentChunk.length + sentence.length > maxChunkLength && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          currentChunk += sentence;
        }
      }
      
      // Add the last chunk if it has content
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
      }

      // Get API base URL from environment or use default
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      
      // Create audio URLs using backend proxy for each chunk
      // Add a small random delay parameter to avoid rate limiting
      const audioUrls = chunks.map((chunk, index) => {
        const encodedText = encodeURIComponent(chunk);
        // Add index to URL to ensure unique requests (helps with caching and rate limiting)
        return `${API_BASE}/tts?text=${encodedText}&lang=${lang}&_=${Date.now() + index}`;
      });

      // Stop any current playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Create new audio element
      const audio = new Audio();
      audioRef.current = audio;
      
      // Set playback speed to 1.2x (slightly faster - was 1.1x)
      audio.defaultPlaybackRate = 1.2;
      audio.playbackRate = 1.2;

      let currentChunkIndex = 0;

      const playNextChunk = () => {
        if (currentChunkIndex >= audioUrls.length) {
          setIsPlaying(false);
          setIsPaused(false);
          return;
        }

        audio.src = audioUrls[currentChunkIndex];
        
        // Add error handling before play
        audio.onerror = (e) => {
          console.error('Error loading audio chunk:', currentChunkIndex, e);
          console.error('Audio error details:', {
            error: audio.error,
            code: audio.error?.code,
            message: audio.error?.message,
            src: audio.src
          });
          
          // Try to continue with next chunk
          currentChunkIndex++;
          if (!isPaused && currentChunkIndex < audioUrls.length) {
            setTimeout(() => playNextChunk(), 100);
          } else {
            setIsPlaying(false);
            setIsPaused(false);
            alert('Audio playback error. Please try again.');
          }
        };
        
        // Wait for audio to be ready before playing
        audio.oncanplaythrough = () => {
          audio.play().catch(err => {
            console.error('Error playing audio:', err);
            audio.onerror(err);
          });
        };
        
        audio.onended = () => {
          currentChunkIndex++;
          // Add a small delay between chunks to avoid rate limiting
          setTimeout(() => {
            if (!isPaused) {
              playNextChunk();
            }
          }, 200); // Increased delay to avoid rate limiting
        };
        
        // Load the audio source
        audio.load();
      };

      audio.onplay = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };

      audio.onpause = () => {
        if (audio.currentTime > 0 && !audio.ended) {
          setIsPaused(true);
        }
      };

      playNextChunk();
    } catch (error) {
      console.error('TTS Error:', error);
      setIsPlaying(false);
      setIsPaused(false);
      alert('Error playing audio. Please try again.');
    }
  };

  const speak = () => {
    const text = extractArticleText();
    if (!text || text.trim().length === 0) {
      alert('No content available to read.');
      return;
    }

    // Try Marathi first, fallback to Hindi, then English
    const lang = currentLanguage === 'mr' ? 'mr' : currentLanguage === 'hi' ? 'hi' : 'en';
    speakWithGoogleTTS(text, lang);
  };

  const pause = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (audioRef.current && isPaused) {
      audioRef.current.playbackRate = 1.2; // Maintain speed (slightly faster)
      audioRef.current.play();
      setIsPaused(false);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handlePlayPause = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isPlaying && !isPaused) {
      speak();
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <button
      type="button"
      onClick={handlePlayPause}
      onMouseDown={(e) => e.preventDefault()}
      className="flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border border-newsRed/30 text-newsRed hover:bg-newsRed hover:text-cleanWhite transition-all duration-200 font-medium text-sm cursor-pointer z-10 relative"
      style={{ pointerEvents: 'auto' }}
    >
      {isPaused ? (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          <span>सुरू करा</span>
        </>
      ) : isPlaying ? (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>विराम</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          <span>ऐका</span>
        </>
      )}
    </button>
  );
};

export default TextToSpeech;
