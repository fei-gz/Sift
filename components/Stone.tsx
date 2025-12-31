
import React from 'react';
import { useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';

// Defining Three.js intrinsic elements as variables to bypass JSX type errors
const Mesh = 'mesh' as any;
const DodecahedronGeometry = 'dodecahedronGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;

interface StoneProps {
  id: string;
  position: [number, number, number];
  onUpdate: (id: string, pos: [number, number, number]) => void;
}

const Stone: React.FC<StoneProps> = ({ id, position, onUpdate }) => {
  const [ref, api] = useBox(() => ({
    mass: 5,
    position,
    args: [0.8, 0.6, 0.8],
    linearDamping: 0.5,
    angularDamping: 0.5,
    friction: 0.4,
  }));

  useFrame(() => {
    if (ref.current) {
      const pos = ref.current.position;
      onUpdate(id, [pos.x, pos.y, pos.z]);
    }
  });

  return (
    /* Fix for mesh intrinsic element error */
    <Mesh ref={ref as any} castShadow receiveShadow>
      <DodecahedronGeometry args={[0.5, 0]} />
      <MeshStandardMaterial color="#607d8b" roughness={1} flatShading />
    </Mesh>
  );
};

export default Stone;
