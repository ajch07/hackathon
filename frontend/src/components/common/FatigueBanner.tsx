import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { FatigueLevel } from '../../types';

const DISMISS_STORAGE_KEY = 'fatigue_banner_dismissed_at';
const DISMISS_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes
const AUTO_DISMISS_MS = 60 * 1000; // 60 seconds

interface FatigueBannerProps {
  fatigueLevel: FatigueLevel | null;
  isWebcamActive: boolean;
}

export function FatigueBanner({ fatigueLevel, isWebcamActive }: FatigueBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const shouldShow =
    isWebcamActive &&
    fatigueLevel &&
    (fatigueLevel === 'moderate_fatigue' || fatigueLevel === 'high_fatigue') &&
    !dismissed;

  // Check localStorage cooldown
  useEffect(() => {
    const lastDismissed = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (lastDismissed) {
      const elapsed = Date.now() - parseInt(lastDismissed, 10);
      if (elapsed < DISMISS_COOLDOWN_MS) {
        setDismissed(true);
        // Auto un-dismiss after cooldown
        const timeout = setTimeout(() => setDismissed(false), DISMISS_COOLDOWN_MS - elapsed);
        return () => clearTimeout(timeout);
      }
    }
  }, []);

  // Auto-dismiss after 60s
  useEffect(() => {
    if (!shouldShow) return;
    const timeout = setTimeout(() => {
      handleDismiss();
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShow]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem(DISMISS_STORAGE_KEY, Date.now().toString());
  }, []);

  if (!shouldShow) return null;

  const isHigh = fatigueLevel === 'high_fatigue';

  return (
    <div
      className="w-full px-4 py-3 flex items-center justify-between rounded-xl mb-4"
      style={{
        background: isHigh
          ? 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(251,113,133,0.15) 100%)'
          : 'linear-gradient(135deg, rgba(251,113,133,0.15) 0%, rgba(251,146,60,0.12) 100%)',
        border: `1px solid ${isHigh ? 'rgba(239,68,68,0.3)' : 'rgba(251,113,133,0.25)'}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: isHigh ? 'rgba(239,68,68,0.2)' : 'rgba(251,113,133,0.2)' }}
        >
          <AlertTriangle className="w-4 h-4" style={{ color: isHigh ? '#ef4444' : '#fb7185' }} />
        </div>
        <p className="text-sm" style={{ color: isHigh ? '#fca5a5' : '#fda4af' }}>
          {isHigh
            ? 'High fatigue detected \u2014 consider a 10-minute break before your next study session.'
            : 'Moderate fatigue detected \u2014 a short break could help improve your focus.'}
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
}
