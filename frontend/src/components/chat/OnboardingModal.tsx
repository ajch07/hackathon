import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, BookOpen, Plus, X, ArrowRight, Sparkles } from 'lucide-react';
import { chatApi } from '../../services/api';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (field: string, subjects: string[]) => void;
}

const POPULAR_FIELDS = [
  'Computer Science',
  'Engineering',
  'Medicine',
  'Business',
  'Law',
  'Mathematics',
  'Physics',
  'Arts & Design',
];

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [field, setField] = useState('');
  const [customField, setCustomField] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedField = field === '__custom__' ? customField : field;

  const addSubject = () => {
    const trimmed = subjectInput.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      setSubjects([...subjects, trimmed]);
      setSubjectInput('');
    }
  };

  const removeSubject = (s: string) => {
    setSubjects(subjects.filter((sub) => sub !== s));
  };

  const handleSubmit = async () => {
    if (!selectedField || subjects.length === 0) return;
    setSaving(true);
    try {
      await chatApi.saveOnboarding({
        field_of_study: selectedField,
        subjects,
      });
      onComplete(selectedField, subjects);
    } catch (err) {
      console.error('Failed to save onboarding:', err);
      // Still complete to not block the user
      onComplete(selectedField, subjects);
    }
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="w-full max-w-lg mx-4 rounded-2xl border border-white/15 bg-gray-900/95 backdrop-blur-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Welcome to CogniTrack</h2>
                <p className="text-sm text-gray-400">Let's personalize your study experience</p>
              </div>
            </div>
            {/* Step indicator */}
            <div className="flex gap-2 mt-4">
              <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-violet-500' : 'bg-white/10'}`} />
              <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-violet-500' : 'bg-white/10'}`} />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 min-h-[280px]">
            {step === 1 ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-violet-400" />
                  <span className="text-sm font-medium text-white">What is your field of study?</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {POPULAR_FIELDS.map((f) => (
                    <button
                      key={f}
                      onClick={() => { setField(f); setCustomField(''); }}
                      className={`px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-150 border ${
                        field === f
                          ? 'border-violet-500 bg-violet-500/20 text-white'
                          : 'border-white/10 bg-white/[0.04] text-gray-300 hover:border-white/20'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={field === '__custom__' ? customField : ''}
                    onChange={(e) => { setField('__custom__'); setCustomField(e.target.value); }}
                    onFocus={() => setField('__custom__')}
                    placeholder="Or type your own..."
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none text-sm"
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-violet-400" />
                  <span className="text-sm font-medium text-white">What subjects are you studying?</span>
                </div>
                {/* Subject tags */}
                <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                  {subjects.map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-sm text-violet-200"
                    >
                      {s}
                      <button onClick={() => removeSubject(s)} className="hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {subjects.length === 0 && (
                    <span className="text-sm text-gray-500">Add at least one subject below</span>
                  )}
                </div>
                {/* Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubject(); } }}
                    placeholder="e.g. Data Structures, Calculus..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none text-sm"
                  />
                  <button
                    onClick={addSubject}
                    disabled={!subjectInput.trim()}
                    className="px-3 py-2.5 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10 flex justify-between">
            {step === 2 ? (
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            {step === 1 ? (
              <button
                onClick={() => setStep(2)}
                disabled={!selectedField}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={subjects.length === 0 || saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Start Learning'} <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
