
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER'
}

export enum LevelPhase {
  GATHERING = 'GATHERING', // Shaking to group stones in the center
  CLEARING = 'CLEARING'    // Shaking to make beans fall out
}

export interface LevelConfig {
  levelNumber: number;
  stoneCount: number;
  beanCount: number;
  beanColor: string;
}
