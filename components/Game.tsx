
import React, { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Sky, Environment, ContactShadows, Stars } from '@react-three/drei';
import Sieve from './Sieve';
import { LevelConfig, LevelPhase } from '../types';
import Stone from './Stone';
import Bean from './Bean';
import GameWrapper from './GameWrapper';

interface GameProps {
  config: LevelConfig;
  onComplete: () => void;
  isPaused: boolean;
}

// Fix: Define intrinsic elements as components to bypass missing JSX types
const Color = 'color' as any;
const AmbientLight = 'ambientLight' as any;
const DirectionalLight = 'directionalLight' as any;

const Game: React.FC<GameProps> = ({ config, onComplete, isPaused }) => {
  const [phase, setPhase] = useState<LevelPhase>(LevelPhase.GATHERING);
  const stonePositions = useRef<Record<string, [number, number, number]>>({});
  const beanPositions = useRef<Record<string, [number, number, number]>>({});
  
  useEffect(() => {
    setPhase(LevelPhase.GATHERING);
    stonePositions.current = {};
    beanPositions.current = {};
  }, [config.levelNumber]);

  useEffect(() => {
    if (isPaused) return;

    const checkWinCondition = setInterval(() => {
      if (phase === LevelPhase.GATHERING) {
        const positions = Object.values(stonePositions.current);
        if (positions.length === config.stoneCount) {
          const allInCenter = positions.every(pos => {
            const dist = Math.sqrt(pos[0] * pos[0] + pos[2] * pos[2]);
            return dist < 1.4;
          });
          if (allInCenter) setPhase(LevelPhase.CLEARING);
        }
      } else if (phase === LevelPhase.CLEARING) {
        const positions = Object.values(beanPositions.current);
        const remaining = positions.filter(pos => pos[1] > -3).length;
        if (remaining === 0 && positions.length === config.beanCount) {
          onComplete();
        }
      }
    }, 1000);

    return () => clearInterval(checkWinCondition);
  }, [phase, config, onComplete, isPaused]);

  return (
    <GameWrapper active={!isPaused}>
      <Canvas 
        shadows 
        camera={{ position: [0, 15, 8], fov: 45 }}
        gl={{ antialias: true }}
        className="touch-none"
      >
        <Color attach="background" args={['#050505']} />
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <AmbientLight intensity={0.4} />
          <DirectionalLight 
            position={[10, 20, 10]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize={[1024, 1024]}
          />
          
          <Physics gravity={[0, -30, 0]} iterations={15} tolerance={0.001}>
            <Sieve isPaused={isPaused} phase={phase} />
            
            {!isPaused && Array.from({ length: config.stoneCount }).map((_, i) => (
              <Stone 
                key={`stone-${i}-${config.levelNumber}`} 
                id={`stone-${i}`} 
                position={[Math.random() * 4 - 2, 3 + i * 0.5, Math.random() * 4 - 2]} 
                onUpdate={(id, pos) => { stonePositions.current[id] = pos; }}
              />
            ))}

            {!isPaused && Array.from({ length: config.beanCount }).map((_, i) => (
              <Bean 
                key={`bean-${i}-${config.levelNumber}`} 
                id={`bean-${i}`} 
                color={config.beanColor}
                position={[Math.random() * 6 - 3, 5 + i * 0.4, Math.random() * 6 - 3]} 
                onUpdate={(id, pos) => { beanPositions.current[id] = pos; }}
                phase={phase}
              />
            ))}
          </Physics>

          <ContactShadows position={[0, -10, 0]} opacity={0.4} scale={40} blur={2} far={10} />
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </GameWrapper>
  );
};

export default Game;
