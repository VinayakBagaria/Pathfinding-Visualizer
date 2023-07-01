import Board from './board';
import Timer from './timer';
import {
  startVisitedNodesAnimations,
  startShortestPathAnimation,
} from './animate';
import showModal from './modal';
import { setUpWalkthrough, reInitiateWalkthrough } from './walkthrough';
import {
  NODE_TO_ID_MAPPING,
  SPEED_MAPPING,
  ALGORITHM_MAPPING,
} from './constants';
import { AlgorithmType, SpeedType } from './types';
import {
  addHtmlEvent,
  changeDropdownLabel,
  getNodes,
  getNodeById,
} from './utils';

const boardNode = getNodeById(NODE_TO_ID_MAPPING.board);
const board = new Board(boardNode);
const visualizeButton = getNodeById(
  NODE_TO_ID_MAPPING.visualizeButton
) as HTMLButtonElement;
const playPauseButton = getNodeById(
  NODE_TO_ID_MAPPING.playPauseButton
) as HTMLButtonElement;

class VisualizerState {
  algorithm: AlgorithmType | null = null;
  speed: SpeedType;
  timers: Array<Timer> = [];
  boardStatus: 'started' | 'completed' | null = null;
  isPlaying: boolean;

  setAlgorithm(algorithm: AlgorithmType) {
    this.algorithm = algorithm;
  }

  setSpeed(speed: SpeedType) {
    this.speed = speed;
  }

  appendTimers(_timers: Array<Timer>) {
    this.timers = [...this.timers, ..._timers];
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

  setBoardStatus(newBoardStatus: 'started' | 'completed' | null) {
    this.boardStatus = newBoardStatus;
    if (this.boardStatus === 'started') {
      this.isPlaying = true;
    } else {
      this.clearTimers();
      this.calculateNewDomState();
    }

    visualizeButton.disabled =
      this.algorithm === null || this.boardStatus === 'started';
  }

  private calculateNewDomState() {
    if (this.algorithm === null || this.boardStatus === null) {
      playPauseButton.disabled = true;
      return;
    }

    playPauseButton.disabled = false;

    if (this.isPlaying) {
      playPauseButton.innerText = 'Pause';
      playPauseButton.dataset.playstate = 'pause';
    } else if (this.boardStatus === 'started') {
      playPauseButton.innerText = 'Resume';
      playPauseButton.dataset.playstate = 'resume';
    } else if (this.boardStatus === 'completed') {
      playPauseButton.innerText = 'Revisualize';
      playPauseButton.dataset.playstate = 'revisualize';
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

function onIndexAnimated(animatedIndex: number) {
  visualizerState.timers.shift();
  if (animatedIndex === 0) {
    visualizerState.setBoardStatus('started');
    visualizerState.startOrStopTimer(true);
  }
}

function onPathAnimated(animatedIndex: number, nodesToAnimate: Array<unknown>) {
  visualizerState.timers.shift();
  if (animatedIndex === nodesToAnimate.length - 1) {
    visualizerState.setBoardStatus('completed');
    visualizerState.startOrStopTimer(false);
  }
}

function calculateAndLaunchAnimations() {
  if (visualizerState.algorithm === null) {
    return;
  }

  const { endNode, nodesToAnimate } = board.start(visualizerState.algorithm);

  if (endNode === null) {
    showModal(
      'Error!',
      'Cannot find path to goal as we got blocked by walls. Kindly re-try.'
    );
    return;
  }

  const speed = visualizerState.speed;

  const visitedTimers = startVisitedNodesAnimations(
    nodesToAnimate,
    speed,
    animatedIndex => {
      onIndexAnimated(animatedIndex);
      if (animatedIndex === nodesToAnimate.length - 1) {
        const pathTimers = startShortestPathAnimation(
          endNode,
          board.nodeMap,
          speed,
          index => onPathAnimated(index, pathTimers)
        );
        visualizerState.appendTimers(pathTimers);
      }
    }
  );

  visualizerState.appendTimers(visitedTimers);
}

function initializeButtonEvents() {
  addHtmlEvent(visualizeButton, () => {
    calculateAndLaunchAnimations();
  });

  addHtmlEvent(getNodeById('clear-board'), () => {
    board.clearBoard();
    visualizerState.setBoardStatus(null);
  });

  addHtmlEvent(getNodeById('clear-walls'), () => {
    board.clearWalls();
    visualizerState.setBoardStatus(null);
  });

  addHtmlEvent(getNodeById('clear-path'), () => {
    board.clearPath();
    visualizerState.setBoardStatus(null);
  });

  addHtmlEvent(playPauseButton, () => {
    if (playPauseButton.dataset.playstate === 'revisualize') {
      board.clearPath();
      visualizerState.setBoardStatus(null);
      calculateAndLaunchAnimations();
    } else {
      visualizerState.playOrPauseTimer();
    }
  });

  addHtmlEvent(getNodeById('walkthrough-tutorial'), () => {
    reInitiateWalkthrough();
  });
}

function applyChangesForSpeedDropdown(speedId: string) {
  const speeds = Object.keys(SPEED_MAPPING) as Array<SpeedType>;
  for (let i = 0; i < speeds.length; i++) {
    const mapping = SPEED_MAPPING[speeds[i]];
    if (mapping.id === speedId) {
      visualizerState.setSpeed(speeds[i]);
      const node = getNodeById(mapping.id);
      changeDropdownLabel(node, `Speed: ${mapping.name}`);
      break;
    }
  }
}

function initializeDropdownEvents() {
  getNodes('.dropdown').forEach(eachNode =>
    addHtmlEvent(eachNode, event => {
      const node = event.currentTarget as HTMLElement;
      if (node.classList.contains('open')) {
        node.classList.remove('open');
      } else {
        node.classList.add('open');
      }
    })
  );

  const allSpeedIds = Object.values(SPEED_MAPPING).map(
    eachValue => eachValue.id
  );

  applyChangesForSpeedDropdown(SPEED_MAPPING.fast.id);

  getNodes('.dropdown-item').forEach(eachNode =>
    addHtmlEvent(eachNode, event => {
      const node = event.currentTarget as HTMLElement;

      Object.values(ALGORITHM_MAPPING).forEach(eachConfig => {
        eachConfig;
      });

      const algorithms = Object.keys(ALGORITHM_MAPPING) as Array<AlgorithmType>;
      for (let i = 0; i < algorithms.length; i++) {
        const config = ALGORITHM_MAPPING[algorithms[i]];
        if (config.id === node.id) {
          visualizerState.setAlgorithm(algorithms[i]);
          changeDropdownLabel(node, `Algorithm: ${config.name}`);
          visualizeButton.innerText = `Visualize ${config.name}`;
          visualizeButton.disabled = false;
          return;
        }
      }

      if (allSpeedIds.includes(node.id)) {
        applyChangesForSpeedDropdown(node.id);
      }
    })
  );
}

initializeButtonEvents();
initializeDropdownEvents();
setUpWalkthrough();
