import { SpeedType } from './types';

export const SPEED_MAPPING: Record<
  SpeedType,
  { id: string; time: number; name: string }
> = Object.freeze({
  fast: {
    id: 'fast-speed',
    time: 0,
    name: 'Fast',
  },
  average: {
    id: 'average-speed',
    time: 100,
    name: 'Average',
  },
  slow: {
    id: 'slow-speed',
    time: 500,
    name: 'Slow',
  },
});

export const NODE_MAPPING = Object.freeze({
  visualizeButton: '#visualize',
});