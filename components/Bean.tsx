
import React, { useEffect } from 'react';
import { useSphere } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { LevelPhase } from '../types';

interface BeanProps {
  id: string;
  color: string;
  position: [number, number, number];
  onUpdate: (id: string, pos: [number, number, number]) => void;
  phase: LevelPhase;
}

// Fix: Define intrinsic elements as components to bypass missing JSX types
const Mesh = 'mesh' as any;
const SphereGeometry = 'sphereGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;

const Bean: React.FC<BeanProps> = ({ id, color, position, onUpdate, phase }) => {
  const [ref, api] = useSphere(() => ({
    mass: 0.2,
    position,
    args: [0.2],
    linearDamping: 0.1,
    angularDamping: 0.1,
    friction: 0.1,
    restitution: 0.3,
  }));

  // Logic to "fall through"
  useEffect(() => {
    if (phase === LevelPhase.CLEARING) {
      // Small chance to fall through or disable collision filter based on distance to center
      // For simplicity, we'll just check position in useFrame and apply a downward force if clear
    }
  }, [phase]);

  useFrame(() => {
    if (ref.current) {
      const pos = ref.current.position;
      onUpdate(id, [pos.x, pos.y, pos.z]);

      // Simple sifting logic: if in clearing phase and far from center, disable sieve floor collision
      // In Cannon, we usually do this by changing collisionFilterMask
      if (phase === LevelPhase.CLEARING) {
        const dist = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
        if (dist > 2.5) {
          // Let it fall
          api.collisionFilterMask.set(0); 
        }
      }
    }
  });

  return (
    <Mesh ref={ref as any} castShadow>
      <SphereGeometry args={[0.2, 12, 12]} />
      <MeshStandardMaterial color={color} roughness={0.3} />
    </Mesh>
  );
};

export default Bean;
