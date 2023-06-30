import Node from './node';

function startTimer(
  nodesToAnimate: Array<Node>,
  index: number,
  time: number,
  callback?: (animationIndex: number) => void
) {
  return setTimeout(() => {
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

    callback?.(index);
  }, time);
}

function startAnimations(
  nodesToAnimate: Array<Node>,
  speed: number,
  callback?: (animationIndex: number) => void
) {
  const timers: Array<NodeJS.Timeout> = [];

  for (let i = 0; i < nodesToAnimate.length; i++) {
    timers.push(startTimer(nodesToAnimate, i, (i + 1) * speed, callback));
  }

  return timers;
}

export default startAnimations;
