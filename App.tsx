
import React, { useState, useCallback, useEffect } from 'react';
import { Play, Trophy, RotateCcw, ShieldCheck } from 'lucide-react';
import Game from './components/Game';
import { GameState, LevelConfig } from './types';

const MAX_LEVEL = 10;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [level, setLevel] = useState(1);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const getLevelConfig = (lvl: number): LevelConfig => ({
    levelNumber: lvl,
    stoneCount: Math.min(3 + Math.floor(lvl / 2), 10),
    beanCount: Math.min(10 + lvl * 5, 60),
    beanColor: lvl % 2 === 0 ? '#ff5252' : '#ffeb3b',
  });

  const requestPermissions = async () => {
    // Handle iOS DeviceOrientation permissions
    const DeviceOrientation = (window as any).DeviceOrientationEvent;
    if (DeviceOrientation && typeof DeviceOrientation.requestPermission === 'function') {
      try {
        const response = await DeviceOrientation.requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          startGame();
        } else {
          alert('Sensor permission is required to play with tilt controls.');
        }
      } catch (e) {
        console.error('Permission request failed', e);
      }
    } else {
      // Non-iOS or older browser
      setPermissionGranted(true);
      startGame();
    }
  };

  const startGame = () => {
    setGameState(GameState.PLAYING);
  };

  const handleLevelComplete = useCallback(() => {
    setGameState(GameState.LEVEL_COMPLETE);
  }, []);

  const nextLevel = () => {
    if (level < MAX_LEVEL) {
      setLevel(prev => prev + 1);
      setGameState(GameState.PLAYING);
    } else {
      setGameState(GameState.MENU);
      setLevel(1);
    }
  };

  return (
    <div className="w-full h-full relative bg-black font-sans text-white overflow-hidden">
      {/* 3D Scene Layer */}
      {gameState !== GameState.MENU && (
        <Game 
          config={getLevelConfig(level)} 
          onComplete={handleLevelComplete}
          isPaused={gameState !== GameState.PLAYING}
        />
      )}

      {/* UI Overlays */}
      {gameState === GameState.MENU && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-900 to-black z-50 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-600">
            SIEVE & STONES
          </h1>
          <p className="text-gray-400 max-w-sm mb-10 text-sm md:text-lg">
            Tilt your device to sway the sieve. Gather the stones in the center, then sift the beans through the gaps.
          </p>
          
          <button
            onClick={requestPermissions}
            className="group relative flex items-center gap-3 px-10 py-5 bg-orange-600 hover:bg-orange-500 rounded-full text-2xl font-bold transition-all active:scale-95 shadow-[0_0_40px_rgba(234,88,12,0.3)]"
          >
            <Play fill="white" className="w-8 h-8" />
            START GAME
          </button>

          <div className="mt-12 flex items-center gap-2 text-gray-500 text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Motion sensors required for tilt controls</span>
          </div>
        </div>
      )}

      {gameState === GameState.PLAYING && (
        <div className="absolute top-10 left-0 w-full flex justify-center pointer-events-none px-6">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Level</span>
              <span className="text-xl font-black text-orange-500 leading-none">{level}</span>
            </div>
            <div className="h-8 w-[1px] bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Objective</span>
              <span className="text-sm font-bold leading-none">Gather & Sift</span>
            </div>
          </div>
        </div>
      )}

      {gameState === GameState.LEVEL_COMPLETE && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in zoom-in duration-300">
          <div className="bg-gray-900/80 p-10 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center max-w-xs w-full">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6">
              <Trophy className="text-yellow-500 w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black mb-2 text-center">EXCELLENT!</h2>
            <p className="text-gray-400 mb-8 text-center">Level {level} completed with precision.</p>
            
            <button
              onClick={nextLevel}
              className="w-full py-4 bg-white text-black rounded-2xl font-black text-lg hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              {level === MAX_LEVEL ? 'RESTART' : 'NEXT LEVEL'}
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
