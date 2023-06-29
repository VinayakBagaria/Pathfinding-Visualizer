import startAnimations from './animate';
import Board from './board';

function executeSequence() {
  const boardNode = document.querySelector('#board');
  const visualizeButton = document.getElementById('visualize');

  if (!boardNode || !visualizeButton) {
    return;
  }

  const { height, width } = boardNode.getBoundingClientRect();
  const board = new Board(boardNode, height / 28, width / 28);

  visualizeButton.addEventListener('click', () => {
    const { isSuccessful, nodesToAnimate } = board.startBfs();
    const buttonText = visualizeButton.innerText;

    if (isSuccessful) {
      startAnimations(nodesToAnimate, animationIndex => {
        if (animationIndex === 0) {
          visualizeButton.classList.add('loading');
          visualizeButton.innerText = 'Loading...';
        } else if (animationIndex === nodesToAnimate.length - 1) {
          visualizeButton.classList.remove('loading');
          visualizeButton.innerText = buttonText;
        }
      });
    } else {
      alert("Can't find path");
    }
  });
}

executeSequence();
