
import React, { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Sky, Environment, ContactShadows, Stars, Html } from '@react-three/drei';
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

const LoadingScreen = () => (
  <Html center>
    <div className="flex flex-col items-center gap-6">
      <div className="w-16 h-16 border-[6px] border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
      <p className="text-orange-500 font-black tracking-[0.3em] text-xs uppercase animate-pulse">Building Terrain</p>
    </div>
  </Html>
);

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
        if (positions.length >= config.stoneCount) {
          const allInCenter = positions.every(pos => {
            const dist = Math.sqrt(pos[0] * pos[0] + pos[2] * pos[2]);
            return dist < 1.6; 
          });
          if (allInCenter) setPhase(LevelPhase.CLEARING);
        }
      } else if (phase === LevelPhase.CLEARING) {
        const positions = Object.values(beanPositions.current);
        const remaining = positions.filter(pos => pos[1] > -3).length;
        if (remaining === 0 && positions.length >= config.beanCount) {
          onComplete();
        }
      }
    }, 800);

    return () => clearInterval(checkWinCondition);
  }, [phase, config, onComplete, isPaused]);

  return (
    <div className="w-full h-full flex-1">
      <GameWrapper active={!isPaused}>
        <Canvas 
          shadows 
          camera={{ position: [0, 16, 10], fov: 40 }}
          gl={{ antialias: true, alpha: false, stencil: false }}
          className="w-full h-full touch-none"
          style={{ width: '100%', height: '100%' }}
        >
          {/* @ts-ignore */}
          <color attach="background" args={['#050505']} />
          <Suspense fallback={<LoadingScreen />}>
            <Sky sunPosition={[100, 20, 100]} />
            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
            {/* @ts-ignore */}
            <ambientLight intensity={0.6} />
            {/* @ts-ignore */}
            <directionalLight
              position={[15, 25, 15]}
              intensity={2.5}
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            
            <Physics 
              gravity={[0, -35, 0]} 
              iterations={10} 
              allowSleep
              stepSize={1/60}
              broadphase="SAP"
            >
              <Sieve isPaused={isPaused} phase={phase} />
              
              {!isPaused && Array.from({ length: config.stoneCount }).map((_, i) => (
                <Stone 
                  key={`stone-${i}-${config.levelNumber}`} 
                  id={`stone-${i}`} 
                  position={[Math.random() * 3 - 1.5, 4 + i * 0.8, Math.random() * 3 - 1.5]} 
                  onUpdate={(id, pos) => { stonePositions.current[id] = pos; }}
                />
              ))}

              {!isPaused && Array.from({ length: config.beanCount }).map((_, i) => (
                <Bean 
                  key={`bean-${i}-${config.levelNumber}`} 
                  id={`bean-${i}`} 
                  color={config.beanColor}
                  position={[Math.random() * 6 - 3, 6 + i * 0.4, Math.random() * 6 - 3]} 
                  onUpdate={(id, pos) => { beanPositions.current[id] = pos; }}
                  phase={phase}
                />
              ))}
            </Physics>

            <ContactShadows position={[0, -10, 0]} opacity={0.5} scale={40} blur={2.5} far={15} />
            <Environment preset="night" />
          </Suspense>
        </Canvas>
      </GameWrapper>
    </div>
  );
};

export default Game;
