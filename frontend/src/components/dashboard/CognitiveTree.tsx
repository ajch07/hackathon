import { motion } from 'framer-motion';
import { Brain, Target, Zap, TreeDeciduous } from 'lucide-react';
import type { TreeNode } from '../../types';

interface CognitiveTreeProps {
  data: TreeNode;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return { bg: '#10b981', glow: 'rgba(16, 185, 129, 0.5)', label: 'Excellent' };
  if (score >= 60) return { bg: '#38bdf8', glow: 'rgba(56, 189, 248, 0.5)', label: 'Good' };
  if (score >= 40) return { bg: '#fb7185', glow: 'rgba(251, 113, 133, 0.5)', label: 'Average' };
  return { bg: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)', label: 'Needs Work' };
};

const getIconForCategory = (name: string) => {
  switch (name.toLowerCase()) {
    case 'focus': return Target;
    case 'memory': return Brain;
    case 'reaction': return Zap;
    default: return TreeDeciduous;
  }
};

export function CognitiveTree({ data }: CognitiveTreeProps) {
  const overallColor = getScoreColor(data.score);
  
  return (
    <div className="w-full py-6">
      <svg viewBox="0 0 600 380" className="w-full h-auto" style={{ maxHeight: '400px' }}>
        <defs>
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Gradient for connections */}
          <linearGradient id="connection-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4"/>
          </linearGradient>
        </defs>

        {/* Background decorative elements */}
        <circle cx="300" cy="190" r="150" fill="rgba(139, 92, 246, 0.03)" />
        <circle cx="300" cy="190" r="100" fill="rgba(139, 92, 246, 0.05)" />

        {/* Main connections from root to branches */}
        {data.children?.map((child, index) => {
          const branchX = 120 + index * 180;
          const childColor = getScoreColor(child.score);
          
          return (
            <g key={child.id}>
              {/* Animated connection line */}
              <motion.path
                d={`M 300 90 Q ${(300 + branchX) / 2} 140 ${branchX} 200`}
                stroke={childColor.bg}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                filter="url(#glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.8 }}
                transition={{ duration: 1, delay: 0.3 + index * 0.2 }}
              />
              
              {/* Pulse dot */}
              <motion.circle
                r="4"
                fill="white"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, delay: 1.5 + index * 0.3, repeat: Infinity, repeatDelay: 2 }}
              >
                <animateMotion
                  dur="2s"
                  repeatCount="indefinite"
                  begin={`${1.5 + index * 0.3}s`}
                  path={`M 300 90 Q ${(300 + branchX) / 2} 140 ${branchX} 200`}
                />
              </motion.circle>
            </g>
          );
        })}

        {/* Root/Overall node */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Outer glow ring */}
          <circle
            cx="300" cy="60" r="50"
            fill={overallColor.glow}
            filter="url(#glow)"
          >
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
          </circle>
          
          {/* Main circle */}
          <circle
            cx="300" cy="60" r="40"
            fill="url(#connection-gradient)"
            stroke={overallColor.bg}
            strokeWidth="3"
          />
          
          {/* Inner gradient */}
          <circle
            cx="300" cy="60" r="35"
            fill="rgba(139, 92, 246, 0.3)"
          />
          
          {/* Score text */}
          <text x="300" y="55" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
            {data.score}
          </text>
          <text x="300" y="72" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="10">
            Overall
          </text>
        </motion.g>

        {/* Branch nodes */}
        {data.children?.map((child, index) => {
          const branchX = 120 + index * 180;
          const childColor = getScoreColor(child.score);
          const Icon = getIconForCategory(child.name);
          
          return (
            <motion.g
              key={child.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.15 }}
            >
              {/* Glow */}
              <circle
                cx={branchX} cy="220" r="45"
                fill={childColor.glow}
                filter="url(#glow)"
              >
                <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite" />
              </circle>
              
              {/* Main node */}
              <circle
                cx={branchX} cy="220" r="35"
                fill="rgba(30, 30, 50, 0.9)"
                stroke={childColor.bg}
                strokeWidth="3"
              />
              
              {/* Score */}
              <text x={branchX} y="215" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">
                {child.score}
              </text>
              <text x={branchX} y="232" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10">
                {child.name}
              </text>
              
              {/* Category label below */}
              <rect
                x={branchX - 40} y="270"
                width="80" height="24"
                rx="12"
                fill={childColor.bg}
                opacity="0.2"
              />
              <text x={branchX} y="286" textAnchor="middle" fill={childColor.bg} fontSize="11" fontWeight="500">
                {childColor.label}
              </text>
              
              {/* Recent test dots */}
              {child.children?.slice(0, 5).map((leaf, leafIndex) => {
                const leafColor = getScoreColor(leaf.score);
                const angle = -60 + leafIndex * 30;
                const radius = 55;
                const leafX = branchX + Math.cos(angle * Math.PI / 180) * radius;
                const leafY = 220 + Math.sin(angle * Math.PI / 180) * radius;
                
                return (
                  <motion.g
                    key={leaf.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.15 + leafIndex * 0.05 }}
                  >
                    {/* Connection to parent */}
                    <line
                      x1={branchX}
                      y1="220"
                      x2={leafX}
                      y2={leafY}
                      stroke={leafColor.bg}
                      strokeWidth="1.5"
                      opacity="0.4"
                    />
                    
                    {/* Leaf node */}
                    <circle
                      cx={leafX}
                      cy={leafY}
                      r="8"
                      fill={leafColor.bg}
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="1"
                    />
                    <text x={leafX} y={leafY + 4} textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">
                      {leaf.score}
                    </text>
                  </motion.g>
                );
              })}
            </motion.g>
          );
        })}

        {/* Tree trunk (decorative) */}
        <motion.path
          d="M 295 100 L 295 340 M 305 100 L 305 340"
          stroke="rgba(139, 92, 246, 0.2)"
          strokeWidth="2"
          strokeDasharray="5,10"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2 }}
        />
        
        {/* Ground line */}
        <motion.path
          d="M 100 350 Q 300 360 500 350"
          stroke="rgba(139, 92, 246, 0.15)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
      </svg>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
          <span className="text-xs text-gray-400">Excellent (80+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-sky-400 shadow-lg shadow-sky-400/50" />
          <span className="text-xs text-gray-400">Good (60-79)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-400 shadow-lg shadow-rose-400/50" />
          <span className="text-xs text-gray-400">Average (40-59)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
          <span className="text-xs text-gray-400">Needs Work (&lt;40)</span>
        </div>
      </div>
      
      {/* Explanation */}
      <p className="text-center text-xs text-gray-500 mt-4">
        Small dots around each skill show your recent test scores. Brighter connections = stronger performance.
      </p>
    </div>
  );
}
