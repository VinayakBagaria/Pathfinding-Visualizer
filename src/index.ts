import Board from './board';
import Timer from './timer';
import { startAllPathsAnimations, startShortestPathAnimation } from './animate';
import showModal from './modal';
import { setUpWalkthrough, reInitiateWalkthrough } from './walkthrough';
import { NODE_TO_ID_MAPPING, SPEED_MAPPING } from './constants';
import { AlgorithmType, SpeedType } from './types';
import {
  addHtmlEvent,
  changeDropdownLabel,
  getNodes,
  getNodeById,
} from './utils';

const boardNode = getNodeById(NODE_TO_ID_MAPPING.board);
const board = new Board(boardNode);
const visualizeButton = getNodeById(NODE_TO_ID_MAPPING.visualizeButton);
const playPauseButton = getNodeById(NODE_TO_ID_MAPPING.playPauseButton);

class VisualizerState {
  algorithm: AlgorithmType;
  speed: SpeedType;
  timers: Array<Timer> = [];
  hasStarted: boolean;
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
  addHtmlEvent(visualizeButton, () => {
    const { endNode, nodesToAnimate } = board.start(visualizerState.algorithm);

    if (endNode === null) {
      showModal(
        'Error!',
        'Cannot find path to goal as we got blocked by walls. Kindly re-try.'
      );
      return;
    }

    const speed = visualizerState.speed;

    const timers = startAllPathsAnimations(
      nodesToAnimate,
      speed,
      animatedIndex => {
        onIndexAnimated(animatedIndex, nodesToAnimate);
        if (animatedIndex === nodesToAnimate.length - 1) {
          const shortestTimers = startShortestPathAnimation(
            endNode,
            board.nodeMap,
            speed
          );
          visualizerState.appendTimers(shortestTimers);
        }
      }
    );
    visualizerState.appendTimers(timers);
  });

  getNodes('#clear-board').forEach(eachNode =>
    addHtmlEvent(eachNode, () => {
      board.clearBoard();
      visualizerState.setStarted(false);
    })
  );

  getNodes('#clear-walls').forEach(eachNode =>
    addHtmlEvent(eachNode, () => {
      board.clearWalls();
      visualizerState.setStarted(false);
    })
  );

  getNodes('#clear-path').forEach(eachNode =>
    addHtmlEvent(eachNode, () => {
      board.clearPath();
      visualizerState.setStarted(false);
    })
  );

  addHtmlEvent(playPauseButton, () => {
    visualizerState.playOrPauseTimer();
  });

  addHtmlEvent(getNodeById('page-title'), () => {
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

  applyChangesForSpeedDropdown(SPEED_MAPPING.fast.id);
  const allSpeedIds = Object.values(SPEED_MAPPING).map(
    eachValue => eachValue.id
  );

  getNodes('.dropdown-item').forEach(eachNode =>
    addHtmlEvent(eachNode, event => {
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
    })
  );
}

initializeButtonEvents();
initializeDropdownEvents();
setUpWalkthrough();
