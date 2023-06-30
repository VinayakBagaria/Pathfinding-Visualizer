import startAnimations from './animate';
import Board from './board';
import { AlgorithmType, SpeedType } from './types';

class VisualizerState {
  algorithm: AlgorithmType;
  speed: SpeedType;

  setAlgorithm(algorithm: AlgorithmType) {
    this.algorithm = algorithm;
  }

  setSpeed(speed: SpeedType) {
    this.speed = speed;
  }

  getTimeForSpeed() {
    if (this.speed === 'fast') {
      return 0;
    }
    if (this.speed === 'average') {
      return 100;
    }
    if (this.speed === 'slow') {
      return 500;
    }
    throw new Error('Speed is not set');
  }
}

function executeSequence() {
  const boardNode = document.querySelector('#board');

  if (!boardNode) {
    return;
  }

  const visualizerState = new VisualizerState();
  const board = new Board(boardNode);

  const visualizeButton = addSelectorEvent('#visualize', event => {
    const element = event.target as HTMLElement;
    const { isSuccessful, nodesToAnimate } = board.start(
      visualizerState.algorithm
    );
    const buttonText = element.innerText;

    if (isSuccessful) {
      startAnimations(
        nodesToAnimate,
        visualizerState.getTimeForSpeed(),
        animationIndex => {
          if (animationIndex === 0) {
            element.classList.add('loading');
            element.innerText = 'Loading...';
          } else if (animationIndex === nodesToAnimate.length - 1) {
            element.classList.remove('loading');
            element.innerText = buttonText;

            alert('Node is found!');
          }
        }
      );
    } else {
      alert("Can't find path");
    }
  })[0];

  addSelectorEvent('#clear', () => {
    board.clearBoard();
  });

  addSelectorEvent('.dropdown', event => {
    const node = event.currentTarget as HTMLElement;
    if (node.classList.contains('open')) {
      node.classList.remove('open');
    } else {
      node.classList.add('open');
    }
  });

  addSelectorEvent('.dropdown-item', event => {
    const node = event.currentTarget as HTMLElement;
    if (node.id === 'dfs-algorithm') {
      visualizerState.setAlgorithm('dfs');
      changeDropdownLabel(node, 'Algorithm: DFS');
      visualizeButton.innerText = 'Visualize DFS';
    } else if (node.id === 'bfs-algorithm') {
      visualizerState.setAlgorithm('bfs');
      changeDropdownLabel(node, 'Algorithm: BFS');
      visualizeButton.innerText = 'Visualize BFS';
    } else if (node.id === 'fast-speed') {
      visualizerState.setSpeed('fast');
      changeDropdownLabel(node, 'Speed: Fast');
    } else if (node.id === 'average-speed') {
      visualizerState.setSpeed('average');
      changeDropdownLabel(node, 'Speed: Average');
    } else if (node.id === 'slow-speed') {
      visualizerState.setSpeed('slow');
      changeDropdownLabel(node, 'Speed: Slow');
    }
  });
}

function addSelectorEvent(
  selector: string,
  callback: (element: Event) => void
) {
  const nodes = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
  nodes.forEach(eachNode => eachNode.addEventListener('click', callback));
  return nodes;
}

function changeDropdownLabel(node: HTMLElement, text: string) {
  const controls = node.parentElement?.parentElement?.querySelector(
    '.dropdown-controls'
  ) as HTMLElement | undefined | null;
  if (!controls) {
    return;
  }
  controls.innerText = text;
}

executeSequence();
