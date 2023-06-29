import startAnimations from './animate';
import Board from './board';

function executeSequence() {
  const boardNode = document.querySelector('#board');

  if (!boardNode) {
    return;
  }

  const board = new Board(boardNode);

  addButtonEvent('visualize', event => {
    const element = event.target as HTMLElement;
    const { isSuccessful, nodesToAnimate } = board.startBfs();
    const buttonText = element.innerText;

    if (isSuccessful) {
      startAnimations(nodesToAnimate, animationIndex => {
        if (animationIndex === 0) {
          element.classList.add('loading');
          element.innerText = 'Loading...';
        } else if (animationIndex === nodesToAnimate.length - 1) {
          element.classList.remove('loading');
          element.innerText = buttonText;
        }
      });
    } else {
      alert("Can't find path");
    }
  });

  addButtonEvent('clear', () => {
    board.clearBoard();
  });
}

function addButtonEvent(
  buttonId: string,
  callback: (element: MouseEvent) => void
) {
  const buttonNode = document.getElementById(buttonId);
  if (!buttonNode) {
    return;
  }

  buttonNode.addEventListener('click', callback);
}

executeSequence();
