
import React from 'react';
import { useSphere } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { LevelPhase } from '../types';

// Defining Three.js intrinsic elements as variables to bypass JSX type errors
const Mesh = 'mesh' as any;
const SphereGeometry = 'sphereGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;

interface BeanProps {
  id: string;
  color: string;
  position: [number, number, number];
  onUpdate: (id: string, pos: [number, number, number]) => void;
  phase: LevelPhase;
}

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

  useFrame(() => {
    if (ref.current) {
      const pos = ref.current.position;
      onUpdate(id, [pos.x, pos.y, pos.z]);

      if (phase === LevelPhase.CLEARING) {
        const dist = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
        if (dist > 2.5) {
          api.collisionFilterMask.set(0); 
        }
      }
    }
  });

  return (
    /* Fix for mesh intrinsic element error */
    <Mesh ref={ref as any} castShadow>
      <SphereGeometry args={[0.2, 12, 12]} />
      <MeshStandardMaterial color={color} roughness={0.3} />
    </Mesh>
  );
};

export default Bean;
