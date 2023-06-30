import { SpeedType } from './types';

export const SPEED_MAPPING: Record<
  SpeedType,
  { id: string; time: number; name: string; pathTime: number }
> = Object.freeze({
  fast: {
    id: 'fast-speed',
    time: 5,
    name: 'Fast',
    pathTime: 50,
  },
  average: {
    id: 'average-speed',
    time: 100,
    name: 'Average',
    pathTime: 150,
  },
  slow: {
    id: 'slow-speed',
    time: 300,
    name: 'Slow',
    pathTime: 400,
  },
});

export const NODE_MAPPING = Object.freeze({
  visualizeButton: '#visualize',
  playPauseButton: '#play-pause',
});
