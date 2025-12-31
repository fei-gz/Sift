import React, { useState, useCallback } from 'react';
import { Play, Trophy, RotateCcw, ShieldCheck, Loader2 } from 'lucide-react';
import Game from './components/Game';
import { GameState, LevelConfig } from './types';

const MAX_LEVEL = 10;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [level, setLevel] = useState(1);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const getLevelConfig = (lvl: number): LevelConfig => ({
    levelNumber: lvl,
    stoneCount: Math.min(3 + Math.floor(lvl / 2), 10),
    beanCount: Math.min(10 + lvl * 5, 60),
    beanColor: lvl % 2 === 0 ? '#ff5252' : '#ffeb3b',
  });

  const requestPermissions = async () => {
    if (isAuthorizing) return;
    setIsAuthorizing(true);
    
    try {
      // iOS 13+ requires explicit permission for DeviceOrientation
      const DeviceOrientation = (window as any).DeviceOrientationEvent;
      if (DeviceOrientation && typeof DeviceOrientation.requestPermission === 'function') {
        const response = await DeviceOrientation.requestPermission();
        console.log('Permission response:', response);
      } else {
        console.log('DeviceOrientation permission API not found, assuming granted or not needed.');
      }
    } catch (e) {
      console.warn('Orientation permission failed or not required:', e);
    } finally {
      // Small delay to ensure state updates don't clash with hardware requests
      setTimeout(() => {
        setIsAuthorizing(false);
        startGame();
      }, 100);
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
    <div className="w-full h-full relative bg-black font-sans text-white overflow-hidden flex flex-col">
      {gameState !== GameState.MENU && (
        <Game 
          config={getLevelConfig(level)} 
          onComplete={handleLevelComplete}
          isPaused={gameState !== GameState.PLAYING}
        />
      )}

      {gameState === GameState.MENU && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-900 to-black z-50 text-center">
          <div className="mb-12">
             <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-600">
              SIEVE & STONES
            </h1>
            <p className="text-gray-400 max-w-sm mx-auto text-sm md:text-lg leading-relaxed px-4">
              Tilt your device to sway the sieve. Gather the stones in the center, then sift the beans through the gaps.
            </p>
          </div>
          
          <button
            onClick={requestPermissions}
            disabled={isAuthorizing}
            className="group relative flex items-center gap-3 px-12 py-6 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-800 rounded-full text-2xl font-black transition-all active:scale-95 shadow-[0_0_50px_rgba(234,88,12,0.4)]"
          >
            {isAuthorizing ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Play fill="white" className="w-8 h-8" />
            )}
            {isAuthorizing ? 'STARTING...' : 'START GAME'}
          </button>

          <div className="mt-16 flex items-center gap-2 text-gray-500 text-xs justify-center opacity-60">
            <ShieldCheck className="w-4 h-4" />
            <span>Motion sensors used for tilt controls</span>
          </div>
        </div>
      )}

      {gameState === GameState.PLAYING && (
        <div className="absolute top-10 left-0 w-full flex justify-center pointer-events-none px-6 z-10">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-8 py-3 rounded-full flex items-center gap-10 shadow-2xl">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Level</span>
              <span className="text-2xl font-black text-orange-500 leading-none">{level}</span>
            </div>
            <div className="h-10 w-[1px] bg-white/20" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Objective</span>
              <span className="text-sm font-black leading-none text-white/90">Gather & Sift</span>
            </div>
          </div>
        </div>
      )}

      {gameState === GameState.LEVEL_COMPLETE && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/90 backdrop-blur-md z-50 animate-in fade-in zoom-in duration-500">
          <div className="bg-gray-900/95 p-12 rounded-[40px] border border-white/10 shadow-2xl flex flex-col items-center max-w-sm w-full">
            <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-8 border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
              <Trophy className="text-yellow-500 w-12 h-12" />
            </div>
            <h2 className="text-4xl font-black mb-3 text-center tracking-tighter">SUCCESS!</h2>
            <p className="text-gray-400 mb-10 text-center leading-relaxed">Level {level} completed. Ready for more challenge?</p>
            
            <button
              onClick={nextLevel}
              className="w-full py-5 bg-white text-black rounded-[24px] font-black text-xl hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl"
            >
              {level === MAX_LEVEL ? 'RESTART' : 'NEXT LEVEL'}
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;