import Board from './board';
import Timer from './timer';
import startAnimations from './animate';
import { NODE_MAPPING, SPEED_MAPPING } from './constants';
import { AlgorithmType, SpeedType } from './types';
import { addHtmlEvent, changeDropdownLabel, getNodes } from './utils';

const boardNode = document.querySelector('#board') as HTMLElement;
const board = new Board(boardNode);
const visualizeButton = getNodes(NODE_MAPPING.visualizeButton)[0];
const playPauseButton = getNodes(NODE_MAPPING.playPauseButton)[0];

class VisualizerState {
  algorithm: AlgorithmType;
  speed: SpeedType;
  timers: Array<Timer>;
  hasStarted: boolean;
  isPlaying: boolean;

  setAlgorithm(algorithm: AlgorithmType) {
    this.algorithm = algorithm;
  }

  setSpeed(speed: SpeedType) {
    this.speed = speed;
  }

  getTimeForSpeed() {
    return SPEED_MAPPING[this.speed].time;
  }

  setTimers(_timers: Array<Timer>) {
    this.timers = _timers;
  }

  private clearTimers() {
    this.timers.forEach(eachTimer => eachTimer.clear());
    this.timers = [];
  }

  private resumeTimers() {
    this.timers.forEach(eachTimer => eachTimer.resume());
  }

  private pauseTimers() {
    this.timers.forEach(eachTimer => eachTimer.pause());
  }

  setStarted(hasStarted: boolean) {
    this.hasStarted = hasStarted;
    if (this.hasStarted) {
      this.isPlaying = true;
    } else {
      this.clearTimers();
      this.calculateNewDomState();
    }

    if (visualizeButton instanceof HTMLButtonElement) {
      visualizeButton.disabled = this.hasStarted;
    }
  }

  private calculateNewDomState() {
    playPauseButton.innerText = this.isPlaying ? 'Pause' : 'Resume';
    if (playPauseButton instanceof HTMLButtonElement) {
      playPauseButton.disabled = !this.hasStarted;
    }
  }

  startOrStopTimer(newState: boolean) {
    this.isPlaying = newState;
    this.calculateNewDomState();
  }

  playOrPauseTimer() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.resumeTimers();
    } else {
      this.pauseTimers();
    }
    this.calculateNewDomState();
  }
}

const visualizerState = new VisualizerState();

function onIndexAnimated(
  animatedIndex: number,
  nodesToAnimate: Array<unknown>
) {
  visualizerState.timers.shift();
  if (animatedIndex === 0) {
    visualizerState.setStarted(true);
    visualizerState.startOrStopTimer(true);
  }
  if (animatedIndex === nodesToAnimate.length - 1) {
    visualizerState.setStarted(false);
    visualizerState.startOrStopTimer(false);
  }
}

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
      visualizerState.getTimeForSpeed(),
      index => onIndexAnimated(index, nodesToAnimate)
    );
    visualizerState.setTimers(timers);
  });

  addHtmlEvent(getNodes('#clear-board'), () => {
    board.clearBoard();
    visualizerState.setStarted(false);
  });

  addHtmlEvent(getNodes('#clear-walls'), () => {
    board.clearWalls();
    visualizerState.setStarted(false);
  });

  addHtmlEvent(getNodes('#clear-path'), () => {
    board.clearPath();
    visualizerState.setStarted(false);
  });

  addHtmlEvent([playPauseButton], () => {
    visualizerState.playOrPauseTimer();
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
