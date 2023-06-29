import startAnimations from './animate';
import Board from './board';

function executeSequence() {
  const boardNode = document.querySelector('#board');
  const visualizeButton = document.getElementById('visualize');

  if (!boardNode || !visualizeButton) {
    return;
  }

  const { height, width } = boardNode.getBoundingClientRect();
  const board = new Board(height / 28, width / 28);

  visualizeButton.addEventListener('click', () => {
    visualizeButton.classList.add('loading');
    const text = visualizeButton.innerText;
    visualizeButton.innerText = 'Loading...';

    const { isSuccessful, nodesToAnimate } = board.startBfs();

    if (isSuccessful) {
      startAnimations(nodesToAnimate);
    }

    visualizeButton.classList.remove('loading');
    visualizeButton.innerText = text;
  });
}

executeSequence();
