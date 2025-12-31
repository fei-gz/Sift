
import { useEffect } from 'react';
import * as THREE from 'three';

export const useGyro = (active: boolean) => {
  useEffect(() => {
    if (!active) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { beta, gamma } = event;
      if (beta === null || gamma === null) return;

      // Map gyro angles to reasonable tilt values for the game
      // beta is front-to-back tilt [-180, 180]
      // gamma is left-to-right tilt [-90, 90]
      
      const x = THREE.MathUtils.clamp(THREE.MathUtils.degToRad(beta - 45), -0.7, 0.7);
      const z = THREE.MathUtils.clamp(THREE.MathUtils.degToRad(-gamma), -0.7, 0.7);

      (window as any)._globalTilt = { x, z };
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [active]);
};
