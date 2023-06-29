import Node from './node';

const SPEED = 0;

function startTimer(
  nodesToAnimate: Array<Node>,
  index: number,
  callback: (animationIndex: number) => void
) {
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

    callback(index);
    startTimer(nodesToAnimate, index + 1, callback);
  }, SPEED);
}

function startAnimations(
  nodesToAnimate: Array<Node>,
  callback: (animationIndex: number) => void
) {
  startTimer(nodesToAnimate, 0, callback);
}

export default startAnimations;
