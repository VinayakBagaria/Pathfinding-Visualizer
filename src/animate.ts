import Node from './node';

const SPEED = 0;

function startTimer(nodesToAnimate: Array<Node>, index: number) {
  setTimeout(() => {
    const node = nodesToAnimate[index];
    const currentElement = document.getElementById(node.id);
    if (!currentElement) {
      throw new Error('Unfound node');
    }

    currentElement.classList.add('current');

    if (index >= 1) {
      const previous = nodesToAnimate[index - 1];
      const previousElement = document.getElementById(previous.id);
      if (!previousElement) {
        throw new Error('Unfound node');
      }
      previousElement.classList.add('visited');
    }

    startTimer(nodesToAnimate, index + 1);
  }, SPEED);
}

function startAnimations(nodesToAnimate: Array<Node>) {
  startTimer(nodesToAnimate, 0);
}

export default startAnimations;
