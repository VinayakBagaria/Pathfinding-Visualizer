import { SpeedType } from './types';

export const SPEED_MAPPING: Record<SpeedType, { id: string; time: number }> =
  Object.freeze({
    fast: {
      id: 'fast-speed',
      time: 0,
    },
    average: {
      id: 'average-speed',
      time: 100,
    },
    slow: {
      id: 'slow-speed',
      time: 500,
    },
  });

export const NODE_MAPPING = Object.freeze({
  visualizeButton: '#visualize',
});
