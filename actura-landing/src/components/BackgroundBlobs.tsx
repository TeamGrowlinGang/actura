export function BackgroundBlobs() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Top-left blob (larger + slightly stronger) */}
      <div
        className="blob-animate absolute -top-24 -left-20 h-[36rem] w-[36rem] rounded-full blur-3xl opacity-80 bg-[radial-gradient(closest-side,rgba(180,215,255,0.8),rgba(180,215,255,0)_70%)]"
        style={{ animationDelay: '0s' }}
      />

      {/* Right-center blob */}
      <div
        className="blob-animate absolute top-1/3 -right-16 h-[40rem] w-[40rem] rounded-full blur-3xl opacity-70 bg-[radial-gradient(closest-side,rgba(132,182,255,0.6),rgba(132,182,255,0)_70%)]"
        style={{ animationDelay: '3s' }}
      />

      {/* Bottom blob */}
      <div
        className="blob-animate absolute -bottom-24 left-1/4 h-[38rem] w-[38rem] rounded-full blur-3xl opacity-60 bg-[radial-gradient(closest-side,rgba(200,225,255,0.7),rgba(200,225,255,0)_70%)]"
        style={{ animationDelay: '6s' }}
      />

      {/* Large rotating orb in the background center-left */}
      <div
        className="bg-orb absolute top-1/4 left-0 h-[48rem] w-[48rem] rounded-full"
        style={{ transformOrigin: '55% 45%' }}
      />
    </div>
  )
}


