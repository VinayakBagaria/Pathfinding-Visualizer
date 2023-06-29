import Node from './node';

const SPEED = 0;

function startTimer(nodesToAnimate: Array<Node>, index: number) {
  setTimeout(() => {
    const node = nodesToAnimate[index];
    const currentTag = document.getElementById(node.id);
    if (!currentTag) {
      throw new Error('Unfound node');
    }

    currentTag.classList.add('current');

    if (index >= 1) {
      const previous = nodesToAnimate[index - 1];
      const previousTag = document.getElementById(previous.id);
      if (!previousTag) {
        throw new Error('Unfound node');
      }
      previousTag.classList.add('visited');
    }

    startTimer(nodesToAnimate, index + 1);
  }, SPEED);
}

function startAnimations(nodesToAnimate: Array<Node>) {
  startTimer(nodesToAnimate, 0);
}

export default startAnimations;
