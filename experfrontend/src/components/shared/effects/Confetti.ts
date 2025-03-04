import confetti from 'canvas-confetti';

// Basic celebration - short burst
export const triggerConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
};

// Achievement unlocked - special celebration with stars
export const triggerAchievementConfetti = () => {
  const end = Date.now() + 1000;
  
  const colors = ['#9333EA', '#6366F1', '#F59E0B']; // Purple, indigo, amber
  
  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
      shapes: ['star'],
    });
    
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
      shapes: ['star'],
    });
    
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
};

// Perfect score - school of stars
export const triggerPerfectScoreConfetti = () => {
  const defaults = { 
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 0,
    particleCount: 150,
    shapes: ['star']
  };
  
  confetti({
    ...defaults,
    particleCount: 40,
    scalar: 1.2,
    shapes: ['star']
  });
  
  confetti({
    ...defaults,
    particleCount: 10,
    scalar: 0.75,
    shapes: ['circle']
  });
};

// Level up - cannon from bottom
export const triggerLevelUpConfetti = () => {
  confetti({
    particleCount: 200,
    startVelocity: 30,
    spread: 100,
    origin: { x: 0.5, y: 1 },
    gravity: 0.8,
    colors: ['#9333EA', '#818CF8', '#F87171', '#34D399', '#FBBF24']
  });
};

// Streak milestone - fire effect
export const triggerStreakConfetti = () => {
  const duration = 1500;
  const end = Date.now() + duration;
  
  (function frame() {
    confetti({
      particleCount: 20,
      angle: 120,
      spread: 70,
      origin: { x: 1 },
      colors: ['#F59E0B', '#DC2626', '#F97316'],
    });
    
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
};