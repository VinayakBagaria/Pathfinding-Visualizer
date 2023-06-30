import startAnimations from './animate';
import Board from './board';
import { NODE_MAPPING, SPEED_MAPPING } from './constants';
import { AlgorithmType, SpeedType } from './types';
import { addHtmlEvent, changeDropdownLabel, getNodes } from './utils';

class VisualizerState {
  algorithm: AlgorithmType;
  speed: SpeedType;
  timers: Array<NodeJS.Timeout>;

  setAlgorithm(algorithm: AlgorithmType) {
    this.algorithm = algorithm;
  }

  setSpeed(speed: SpeedType) {
    this.speed = speed;
  }

  getTimeForSpeed() {
    return SPEED_MAPPING[this.speed].time;
  }

  setTimers(_timers: Array<NodeJS.Timeout>) {
    this.timers = _timers;
  }

  clearTimers() {
    this.timers.forEach(eachTimer => clearTimeout(eachTimer));
  }
}

const visualizerState = new VisualizerState();
const boardNode = document.querySelector('#board') as HTMLElement;
const board = new Board(boardNode);
const visualizeButton = getNodes(NODE_MAPPING.visualizeButton)[0];

function initializeButtonEvents() {
  addHtmlEvent([visualizeButton], () => {
    const { isSuccessful, nodesToAnimate } = board.start(
      visualizerState.algorithm
    );

    if (!isSuccessful) {
      return;
    }

    const timers = startAnimations(
      nodesToAnimate,
      visualizerState.getTimeForSpeed()
    );
    visualizerState.setTimers(timers);
  });

  addHtmlEvent(getNodes('#clear-board'), () => {
    board.clearBoard();
  });

  addHtmlEvent(getNodes('#clear-walls'), () => {
    board.clearWalls();
  });

  addHtmlEvent(getNodes('#clear-path'), () => {
    board.clearPath();
  });

  addHtmlEvent(getNodes('#play-pause'), () => {
    visualizerState.clearTimers();
  });
}

function applyChangesForSpeedDropdown(speedId: string) {
  const speeds = Object.keys(SPEED_MAPPING) as Array<SpeedType>;
  for (let i = 0; i < speeds.length; i++) {
    const mapping = SPEED_MAPPING[speeds[i]];
    if (mapping.id === speedId) {
      visualizerState.setSpeed(speeds[i]);
      const node = getNodes(`#${mapping.id}`)[0];
      changeDropdownLabel(node, `Speed: ${mapping.name}`);
      break;
    }
  }
}

function initializeDropdownEvents() {
  addHtmlEvent(getNodes('.dropdown'), event => {
    const node = event.currentTarget as HTMLElement;

    if (node.classList.contains('open')) {
      node.classList.remove('open');
    } else {
      node.classList.add('open');
    }
  });

  applyChangesForSpeedDropdown(SPEED_MAPPING.fast.id);
  const allSpeedIds = Object.values(SPEED_MAPPING).map(
    eachValue => eachValue.id
  );

  addHtmlEvent(getNodes('.dropdown-item'), event => {
    const node = event.currentTarget as HTMLElement;
    if (node.id === 'dfs-algorithm') {
      visualizerState.setAlgorithm('dfs');
      changeDropdownLabel(node, 'Algorithm: DFS');
      visualizeButton.innerText = 'Visualize DFS';
    } else if (node.id === 'bfs-algorithm') {
      visualizerState.setAlgorithm('bfs');
      changeDropdownLabel(node, 'Algorithm: BFS');
      visualizeButton.innerText = 'Visualize BFS';
    } else if (allSpeedIds.includes(node.id)) {
      applyChangesForSpeedDropdown(node.id);
    }
  });
}

initializeButtonEvents();
initializeDropdownEvents();
