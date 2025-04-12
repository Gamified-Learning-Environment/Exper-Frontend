"use client";

import * as animationData from "../../../public/animations/ControllerAnim.json";
import { useLottie } from "lottie-react";

const ControllerAnim = () => {
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

export default ControllerAnim;