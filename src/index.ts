import startAnimations from './animate';
import Board from './board';

function executeSequence() {
  const boardNode = document.querySelector('#board');

  if (!boardNode) {
    return;
  }

  const board = new Board(boardNode);

  addIdEvent('visualize', event => {
    const element = event.target as HTMLElement;
    const { isSuccessful, nodesToAnimate } = board.start();
    const buttonText = element.innerText;

    if (isSuccessful) {
      startAnimations(nodesToAnimate, animationIndex => {
        if (animationIndex === 0) {
          element.classList.add('loading');
          element.innerText = 'Loading...';
        } else if (animationIndex === nodesToAnimate.length - 1) {
          element.classList.remove('loading');
          element.innerText = buttonText;

          alert('Node is found!');
        }
      });
    } else {
      alert("Can't find path");
    }
  });

  addIdEvent('dfs-algorithm', () => {
    board.setAlgorithm('dfs');
  });

  addIdEvent('bfs-algorithm', () => {
    board.setAlgorithm('bfs');
  });

  addIdEvent('clear', () => {
    board.clearBoard();
  });
}

function addIdEvent(buttonId: string, callback: (element: MouseEvent) => void) {
  const node = document.getElementById(buttonId);
  if (!node) {
    return;
  }

  node.addEventListener('click', callback);
}

executeSequence();
