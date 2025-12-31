
import { useEffect } from 'react';
import * as THREE from 'three';

export const useGyro = (active: boolean) => {
  useEffect(() => {
    if (!active) return;

    // 默认倾斜角（用户通常以一定角度握持手机）
    const DEFAULT_BETA = 45; 

    const handleOrientation = (event: DeviceOrientationEvent) => {
      let { beta, gamma } = event;
      if (beta === null || gamma === null) return;

      // 针对横竖屏或握持姿势进行平滑处理
      // 限制倾斜范围，防止物理模型过度翻转
      const targetX = THREE.MathUtils.clamp(THREE.MathUtils.degToRad(beta - DEFAULT_BETA), -0.7, 0.7);
      const targetZ = THREE.MathUtils.clamp(THREE.MathUtils.degToRad(-gamma), -0.7, 0.7);

      // 使用简单的指数平滑减缓抖动
      const current = (window as any)._globalTilt || { x: 0, z: 0 };
      (window as any)._globalTilt = {
        x: current.x + (targetX - current.x) * 0.2,
        z: current.z + (targetZ - current.z) * 0.2
      };
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [active]);
};
