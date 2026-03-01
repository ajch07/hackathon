export function GradientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#08081a]">
      {/* Base gradient - static for performance */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d25] via-[#151535] to-[#0a0a1e]" />
      
      {/* Static gradient orbs - no animation for better performance */}
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
        }}
      />
      
      <div
        className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
        }}
      />
      
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
