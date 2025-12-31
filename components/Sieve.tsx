
import React, { useMemo } from 'react';
import { useCompoundBody } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LevelPhase } from '../types';

interface SieveProps {
  isPaused: boolean;
  phase: LevelPhase;
}

// Fix: Define intrinsic elements as components to bypass missing JSX types
const Group = 'group' as any;
const Mesh = 'mesh' as any;
const CylinderGeometry = 'cylinderGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;
const TorusGeometry = 'torusGeometry' as any;
const CircleGeometry = 'circleGeometry' as any;

const Sieve: React.FC<SieveProps> = ({ isPaused, phase }) => {
  const tilt = useMemo(() => new THREE.Euler(), []);
  const targetRotation = useMemo(() => new THREE.Quaternion(), []);

  const [ref, api] = useCompoundBody(() => ({
    mass: 0,
    type: 'Kinematic',
    position: [0, 0, 0],
    shapes: [
      // Base floor
      { type: 'Cylinder', args: [5, 5, 0.5, 32], position: [0, -0.25, 0] },
      // Ring wall (composed of boxes for performance or a cylinder)
      ...Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        return {
          type: 'Box',
          args: [2.5, 3, 0.5],
          position: [Math.cos(angle) * 5, 1, Math.sin(angle) * 5],
          rotation: [0, -angle, 0],
        };
      })
    ]
  }));

  useFrame((state) => {
    if (isPaused) return;

    // Use mouse fallback or actual gyro
    const mouse = state.mouse;
    const xTilt = mouse.y * 0.4;
    const zTilt = -mouse.x * 0.4;

    // We can also inject gyro data here if preferred, but for web-apps, 
    // window.addEventListener('deviceorientation') in a hook is standard.
    // See useGyro.ts for the global listener.
    
    // In this implementation, we allow the useFrame to check for global tilt state
    const globalTilt = (window as any)._globalTilt || { x: 0, z: 0 };
    
    // Combine inputs (prefer gyro if active)
    const finalXTilt = Math.abs(globalTilt.x) > 0.01 ? globalTilt.x : xTilt;
    const finalZTilt = Math.abs(globalTilt.z) > 0.01 ? globalTilt.z : zTilt;

    targetRotation.setFromEuler(new THREE.Euler(finalXTilt, 0, finalZTilt));
    api.quaternion.set(targetRotation.x, targetRotation.y, targetRotation.z, targetRotation.w);
  });

  return (
    <Group ref={ref as any}>
      {/* Visual representation */}
      <Mesh receiveShadow castShadow>
        <CylinderGeometry args={[5, 5, 0.5, 64]} />
        <MeshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </Mesh>
      
      {/* Decorative Outer Rim */}
      <Mesh position={[0, 1, 0]}>
        <TorusGeometry args={[5, 0.2, 16, 64]} />
        <MeshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
      </Mesh>

      {/* The Sieve Mesh (Visual Only) */}
      <Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.26, 0]}>
        <CircleGeometry args={[4.8, 64]} />
        <MeshStandardMaterial 
          color="#333" 
          transparent 
          opacity={0.8} 
          wireframe={phase === LevelPhase.GATHERING} 
        />
      </Mesh>
    </Group>
  );
};

export default Sieve;
