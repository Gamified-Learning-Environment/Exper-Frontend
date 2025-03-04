// src/components/shared/LottieAnimation.tsx
'use client';

import Lottie from 'lottie-react';
import { useEffect, useRef, useState } from 'react';

interface LottieAnimationProps {
  animationData: any;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  onComplete?: () => void;
}

export default function LottieAnimation({ 
  animationData, 
  loop = false, 
  autoplay = true, 
  className = '',
  onComplete
}: LottieAnimationProps) {
  const lottieRef = useRef<any>(null);
  
  useEffect(() => {
    if (lottieRef.current && !loop && onComplete) {
      lottieRef.current.addEventListener('complete', onComplete);
      return () => {
        lottieRef.current?.removeEventListener('complete', onComplete);
      };
    }
  }, [loop, onComplete]);

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      className={className}
    />
  );
}