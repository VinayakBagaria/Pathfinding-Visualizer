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
    image: './public/algorithm-selector.gif',
  },
  {
    reference: '.start',
    top: -150,
    left: 100,
    title: 'Add walls',
    description:
      'Drag on the grid to add walls. A path will not be able to cross a wall.',
    image: './public/walls.gif',
  },
  {
    reference: '.start',
    top: -150,
    left: 50,
    title: 'Drag nodes',
    description:
      'You can drag the start and end target to any place in the grid.',
    image: './public/start-end-drag.gif',
    direction: 'left',
  },
  {
    reference: '#visualize',
    top: 25,
    left: 0,
    title: 'Controls',
    description:
      'You can start the visualization, pause/resume it in between, adjust the visualization speed, clear the board from the controls panel here.',
    image: './public/controls-help.gif',
  },
  {
    reference: '#walkthrough-tutorial',
    top: 30,
    left: -275,
    title: 'Revisit',
    description: 'If you want to see this tutorial again, click on this icon.',
    direction: 'top-right',
  },
];

export const WALKTHROUGH_COUNTER_STORAGE_KEY = 'walkthroughCounter';
