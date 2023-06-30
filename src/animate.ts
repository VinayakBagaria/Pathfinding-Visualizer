import Node from './node';

function startTimer(
  nodesToAnimate: Array<Node>,
  index: number,
  time: number,
  callback: (animationIndex: number) => void
) {
  if (index === nodesToAnimate.length) {
    return;
  }

  setTimeout(() => {
    const node = nodesToAnimate[index];
    const currentElement = document.getElementById(node.id);
    if (!currentElement) {
      throw new Error('Unfound node');
    }

    currentElement.classList.remove('unvisited');
    currentElement.classList.add('current');

    if (index >= 1) {
      const previous = nodesToAnimate[index - 1];
      const previousElement = document.getElementById(previous.id);
      if (!previousElement) {
        throw new Error('Unfound node');
      }
      previousElement.classList.remove('current');
      previousElement.classList.add('visited');
    }

    callback(index);
    startTimer(nodesToAnimate, index + 1, time, callback);
  }, time);
}

function startAnimations(
  nodesToAnimate: Array<Node>,
  time: number,
  callback: (animationIndex: number) => void
) {
  startTimer(nodesToAnimate, 0, time, callback);
}

export default startAnimations;
