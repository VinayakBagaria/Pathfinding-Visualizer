import { SpeedType, AlgorithmType } from './types';

export const ALGORITHM_MAPPING: Record<
  AlgorithmType,
  { id: string; name: string }
> = Object.freeze({
  dfs: {
    id: 'dfs-algorithm',
    name: 'DFS',
  },
  bfs: {
    id: 'bfs-algorithm',
    name: 'BFS',
  },
});

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

export const NODE_TO_ID_MAPPING = Object.freeze({
  board: 'board',
  visualizeButton: 'visualize',
  playPauseButton: 'play-pause',
});

export const WALKTHROUGH_POSITIONS = [
  {
    reference: '#algorithms',
    top: 25,
    left: 0,
    title: 'Pick an algorithm',
    description: 'Choose any traversal algorithm from this menu.',
    image: '/public/algorithm-selector.png',
  },
  {
    reference: '.start',
    top: 0,
    left: 200,
    title: 'Add walls',
    description: 'Click on the grid to add a wall. A path cannot cross a wall.',
  },
  {
    reference: '.start',
    top: 10,
    left: -20,
    title: 'Drag nodes',
    description:
      'You can drag the start and end target to any place in the grid.',
  },
  {
    reference: '#visualize',
    top: 25,
    left: 0,
    title: 'Controls',
    description:
      'You can start the visualization, pause/resume it in between, adjust the visualization speed, clear the board from the controls panel here.',
  },
  {
    reference: '#walkthrough-tutorial',
    top: 30,
    left: 0,
    title: 'Revisit',
    description:
      'If you want to see this tutorial again, click on this title again.',
  },
];
