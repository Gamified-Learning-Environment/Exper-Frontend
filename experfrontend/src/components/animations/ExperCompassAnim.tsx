// app/components/MyLottieComponent.tsx

"use client";

import * as animationData from "../../../public/animations/ExperCompass.json";
import { useLottie } from "lottie-react";

const ExperCompassAnim = () => {
  const defaultOptions = {
    animationData: animationData,
    loop: true,
  };

  const { View } = useLottie(defaultOptions);

  return (
    <>
      <div className="">
        <div className="w-full">{View}</div>
      </div>
    </>
  );
};

export default ExperCompassAnim;