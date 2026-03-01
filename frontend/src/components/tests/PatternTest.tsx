import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';

interface PatternTestProps {
  onComplete: (score: number, metadata: Record<string, unknown>) => void;
}

const COLORS = [
  { name: 'red', class: 'bg-gradient-to-br from-red-400 to-pink-500' },
  { name: 'blue', class: 'bg-gradient-to-br from-blue-400 to-indigo-500' },
  { name: 'green', class: 'bg-gradient-to-br from-green-400 to-emerald-500' },
  { name: 'yellow', class: 'bg-gradient-to-br from-yellow-400 to-orange-500' },
];

export function PatternTest({ onComplete }: PatternTestProps) {
  const [gameState, setGameState] = useState<'showing' | 'input' | 'result' | 'finished'>('showing');
  const [pattern, setPattern] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const totalRounds = 5;
  const basePatternLength = 3;

  const generatePattern = useCallback(() => {
    const length = basePatternLength + round - 1;
    const newPattern = Array.from({ length }, () => Math.floor(Math.random() * 4));
    setPattern(newPattern);
    setUserInput([]);
    return newPattern;
  }, [round]);

  const showPattern = useCallback(async (patternToShow: number[]) => {
    setGameState('showing');
    for (let i = 0; i < patternToShow.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveIndex(patternToShow[i]);
      await new Promise(resolve => setTimeout(resolve, 400));
      setActiveIndex(null);
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    setGameState('input');
  }, []);

  useEffect(() => {
    const newPattern = generatePattern();
    showPattern(newPattern);
  }, [round]);

  const handleColorClick = (index: number) => {
    if (gameState !== 'input') return;

    const newInput = [...userInput, index];
    setUserInput(newInput);
    setActiveIndex(index);
    setTimeout(() => setActiveIndex(null), 200);

    if (newInput.length === pattern.length) {
      const isCorrect = newInput.every((val, i) => val === pattern[i]);
      setFeedback(isCorrect ? 'correct' : 'wrong');
      
      if (isCorrect) {
        setScore(s => s + 1);
      }

      setGameState('result');

      setTimeout(() => {
        setFeedback(null);
        if (round >= totalRounds) {
          setGameState('finished');
          const finalScore = isCorrect ? score + 1 : score;
          const normalizedScore = (finalScore / totalRounds) * 100;
          onComplete(Math.round(normalizedScore), {
            correct: finalScore,
            total: totalRounds,
            rounds: round,
          });
        } else {
          setRound(r => r + 1);
        }
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Pattern Memory Test</h2>
        <p className="text-gray-300">
          {gameState === 'showing' && 'Watch the pattern...'}
          {gameState === 'input' && 'Repeat the pattern!'}
          {gameState === 'result' && (feedback === 'correct' ? 'Correct!' : 'Wrong!')}
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
        <p className="text-sm text-gray-400 mt-2">
          Round {round}/{totalRounds} | Pattern length: {basePatternLength + round - 1}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'finished' ? (
          <motion.div
            key="finished"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-xl font-semibold text-white">
              Score: {score}/{totalRounds}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 gap-4"
          >
            {COLORS.map((color, index) => (
              <motion.button
                key={color.name}
                onClick={() => handleColorClick(index)}
                whileTap={{ scale: 0.95 }}
                animate={{
                  scale: activeIndex === index ? 1.1 : 1,
                  opacity: activeIndex === index ? 1 : 0.7,
                }}
                className={`
                  w-28 h-28 rounded-2xl ${color.class}
                  shadow-xl cursor-pointer
                  transition-all duration-200
                  ${gameState === 'input' ? 'hover:opacity-100' : ''}
                  ${activeIndex === index ? 'ring-4 ring-white shadow-2xl' : ''}
                `}
                disabled={gameState !== 'input'}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {gameState === 'input' && (
        <div className="mt-6 flex gap-2">
          {pattern.map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all ${
                i < userInput.length ? 'bg-indigo-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}

      {feedback && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`mt-6 text-2xl font-bold ${
            feedback === 'correct' ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {feedback === 'correct' ? '✓ Correct!' : '✗ Try again!'}
        </motion.div>
      )}
    </div>
  );
}
