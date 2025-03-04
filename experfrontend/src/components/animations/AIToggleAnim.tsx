"use client";

import * as animationData from "../../../public/animations/AIToggle.json";
import { useLottie } from "lottie-react";

const AIToggleAnim = () => {
  const defaultOptions = {
    animationData: animationData,
    loop: true,
  };

  const { View } = useLottie(defaultOptions);

  return (
    <div className="w-10 h-10">
      <div className="w-full">{View}</div>
    </div>
  );
};

export default AIToggleAnim;