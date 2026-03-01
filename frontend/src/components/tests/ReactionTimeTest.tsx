import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface ReactionTimeTestProps {
  onComplete: (score: number, metadata: Record<string, unknown>) => void;
}

export function ReactionTimeTest({ onComplete }: ReactionTimeTestProps) {
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'go' | 'clicked' | 'tooEarly' | 'finished'>('waiting');
  const [round, setRound] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [lastTime, setLastTime] = useState(0);
  
  const startTimeRef = useRef(0);
  const isGoRef = useRef(false);
  const totalRounds = 5;

  const startRound = useCallback(() => {
    setGameState('ready');
    isGoRef.current = false;
    
    const delay = 1000 + Math.random() * 3000;
    const timeoutId = setTimeout(() => {
      startTimeRef.current = performance.now();
      isGoRef.current = true;
      setGameState('go');
    }, delay);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (gameState === 'waiting' && round < totalRounds) {
      const timer = setTimeout(startRound, 800);
      return () => clearTimeout(timer);
    }
  }, [gameState, round, startRound]);

  const handleMouseDown = useCallback(() => {
    if (gameState === 'ready') {
      setGameState('tooEarly');
      isGoRef.current = false;
      setTimeout(() => setGameState('waiting'), 1200);
    } else if (isGoRef.current && gameState === 'go') {
      const reactionTime = Math.round(performance.now() - startTimeRef.current);
      isGoRef.current = false;
      
      const newTimes = [...reactionTimes, reactionTime];
      setReactionTimes(newTimes);
      setLastTime(reactionTime);
      setGameState('clicked');
      
      if (round + 1 >= totalRounds) {
        setTimeout(() => {
          setGameState('finished');
          const avgTime = newTimes.reduce((a, b) => a + b, 0) / newTimes.length;
          const score = Math.max(0, Math.min(100, 100 - ((avgTime - 200) / 4)));
          onComplete(Math.round(score), { 
            attempts: totalRounds, 
            avgTime: Math.round(avgTime),
            times: newTimes 
          });
        }, 800);
      } else {
        setTimeout(() => {
          setRound(r => r + 1);
          setGameState('waiting');
        }, 800);
      }
    }
  }, [gameState, reactionTimes, round, onComplete]);

  const getCircleStyle = () => {
    if (gameState === 'go') return 'bg-green-500';
    if (gameState === 'tooEarly') return 'bg-yellow-500';
    if (gameState === 'clicked') return 'bg-blue-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 select-none">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Reaction Time Test</h2>
        <p className="text-gray-400">Click when the circle turns GREEN!</p>
        <div className="flex gap-2 justify-center mt-4">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i < round ? 'bg-green-500' : i === round ? 'bg-violet-500' : 'bg-gray-600'}`} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'finished' ? (
          <motion.div key="finished" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-xl font-semibold text-white">Test Complete!</p>
            <p className="text-gray-400">Average: {Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)}ms</p>
          </motion.div>
        ) : (
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            className={`w-48 h-48 rounded-full cursor-pointer flex items-center justify-center shadow-2xl ${getCircleStyle()} active:scale-95`}
            style={{ touchAction: 'manipulation' }}
          >
            <span className="text-white text-xl font-bold pointer-events-none">
              {gameState === 'waiting' && 'Get Ready...'}
              {gameState === 'ready' && 'Wait...'}
              {gameState === 'go' && 'CLICK!'}
              {gameState === 'clicked' && `${lastTime}ms`}
              {gameState === 'tooEarly' && 'Too Early!'}
            </span>
          </div>
        )}
      </AnimatePresence>

      {reactionTimes.length > 0 && gameState !== 'finished' && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">Last: {reactionTimes[reactionTimes.length - 1]}ms | Best: {Math.min(...reactionTimes)}ms</p>
        </div>
      )}
    </div>
  );
}
