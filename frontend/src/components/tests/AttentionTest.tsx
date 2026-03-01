import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';

interface AttentionTestProps {
  onComplete: (score: number, metadata: Record<string, unknown>) => void;
}

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isTarget: boolean;
}

export function AttentionTest({ onComplete }: AttentionTestProps) {
  const [gameState, setGameState] = useState<'intro' | 'highlight' | 'tracking' | 'select' | 'result' | 'finished'>('intro');
  const [balls, setBalls] = useState<Ball[]>([]);
  const [targetId, setTargetId] = useState<number>(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const totalRounds = 5;
  const ballCount = 5;

  const initializeBalls = useCallback(() => {
    const newBalls: Ball[] = [];
    const target = Math.floor(Math.random() * ballCount);
    setTargetId(target);

    for (let i = 0; i < ballCount; i++) {
      newBalls.push({
        id: i,
        x: 50 + Math.random() * 200,
        y: 50 + Math.random() * 150,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        isTarget: i === target,
      });
    }
    setBalls(newBalls);
    return target;
  }, []);

  const startRound = useCallback(() => {
    initializeBalls();
    setSelectedId(null);
    setGameState('highlight');
    
    setTimeout(() => {
      setGameState('tracking');
      setTimeLeft(5);
    }, 2000);
  }, [initializeBalls]);

  useEffect(() => {
    if (gameState === 'intro') {
      setTimeout(startRound, 1500);
    }
  }, [gameState, startRound]);

  useEffect(() => {
    if (gameState === 'tracking') {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timer);
            setGameState('select');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'tracking') {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = () => {
      setBalls(prevBalls => 
        prevBalls.map(ball => {
          let newX = ball.x + ball.vx;
          let newY = ball.y + ball.vy;
          let newVx = ball.vx;
          let newVy = ball.vy;

          if (newX <= 0 || newX >= 280) {
            newVx = -newVx;
            newX = Math.max(0, Math.min(280, newX));
          }
          if (newY <= 0 || newY >= 220) {
            newVy = -newVy;
            newY = Math.max(0, Math.min(220, newY));
          }

          return { ...ball, x: newX, y: newY, vx: newVx, vy: newVy };
        })
      );
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState]);

  const handleBallClick = (id: number) => {
    if (gameState !== 'select') return;
    
    setSelectedId(id);
    const isCorrect = id === targetId;
    
    if (isCorrect) {
      setScore(s => s + 1);
    }

    setGameState('result');

    setTimeout(() => {
      if (round >= totalRounds) {
        setGameState('finished');
        const finalScore = isCorrect ? score + 1 : score;
        const normalizedScore = (finalScore / totalRounds) * 100;
        onComplete(Math.round(normalizedScore), {
          correct: finalScore,
          total: totalRounds,
          trackingAccuracy: finalScore / totalRounds,
        });
      } else {
        setRound(r => r + 1);
        startRound();
      }
    }, 1500);
  };

  const getBallColor = (ball: Ball) => {
    if (gameState === 'highlight' && ball.isTarget) {
      return 'bg-gradient-to-br from-yellow-400 to-orange-500 ring-4 ring-yellow-300';
    }
    if (gameState === 'result') {
      if (ball.id === targetId) {
        return 'bg-gradient-to-br from-green-400 to-emerald-500';
      }
      if (ball.id === selectedId && selectedId !== targetId) {
        return 'bg-gradient-to-br from-red-400 to-pink-500';
      }
    }
    if (gameState === 'select' && ball.id === selectedId) {
      return 'bg-gradient-to-br from-indigo-400 to-purple-500 ring-2 ring-white';
    }
    return 'bg-gradient-to-br from-indigo-400 to-purple-500';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Attention Tracking Test</h2>
        <p className="text-gray-300">
          {gameState === 'intro' && 'Get ready...'}
          {gameState === 'highlight' && 'Remember this ball!'}
          {gameState === 'tracking' && `Track the target ball! ${timeLeft}s`}
          {gameState === 'select' && 'Click the target ball!'}
          {gameState === 'result' && (selectedId === targetId ? 'Correct!' : 'Wrong!')}
          {gameState === 'finished' && 'Test Complete!'}
        </p>
        <div className="flex gap-2 justify-center mt-4">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                i < round - 1 ? 'bg-green-500' : i === round - 1 ? 'bg-indigo-500 animate-pulse' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {gameState === 'finished' ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-cyan-400" />
          </div>
          <p className="text-xl font-semibold text-white">
            Score: {score}/{totalRounds}
          </p>
        </motion.div>
      ) : (
        <div
          ref={containerRef}
          className="relative w-80 h-60 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-inner overflow-hidden border border-white/10"
        >
          {balls.map(ball => (
            <motion.button
              key={ball.id}
              onClick={() => handleBallClick(ball.id)}
              className={`absolute w-10 h-10 rounded-full shadow-lg transition-colors duration-300 ${getBallColor(ball)}`}
              style={{ left: ball.x, top: ball.y }}
              whileHover={gameState === 'select' ? { scale: 1.2 } : {}}
              disabled={gameState !== 'select'}
            />
          ))}
        </div>
      )}

      {gameState === 'tracking' && (
        <div className="mt-4 w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 5, ease: 'linear' }}
          />
        </div>
      )}
    </div>
  );
}
