import Node from './node';
import Timer from './timer';
import { SPEED_MAPPING } from './constants';
import { SpeedType, AnimationType } from './types';

function startTimer(
  nodesToAnimate: Array<Node>,
  index: number,
  time: number,
  animationType: AnimationType,
  callback?: (animationIndex: number) => void
) {
  return new Timer(
    () => {
      const node = nodesToAnimate[index];
      const currentElement = document.getElementById(node.id);
      if (!currentElement) {
        throw new Error('Unfound node');
      }

      currentElement.classList.remove('unvisited');
      if (animationType === 'travel') {
        currentElement.classList.add('current');
      } else {
        currentElement.classList.add('shortest-path');
      }

      if (animationType === 'travel' && index >= 1) {
        const previous = nodesToAnimate[index - 1];
        const previousElement = document.getElementById(previous.id);
        if (!previousElement) {
          throw new Error('Unfound node');
        }

        previousElement.classList.remove('current');
        previousElement.classList.add('visited');
      }

      callback?.(index);
    },
    time,
    animationType
  );
}

export function startVisitedNodesAnimations(
  nodesToAnimate: Array<Node>,
  speed: SpeedType,
  callback?: (animationIndex: number) => void
) {
  const timers: Array<Timer> = [];

  for (let i = 0; i < nodesToAnimate.length; i++) {
    timers.push(
      startTimer(
        nodesToAnimate,
        i,
        (i + 1) * SPEED_MAPPING[speed].time,
        'travel',
        callback
      )
    );
  }

  return timers;
}

export function startShortestPathAnimation(
  endNode: Node,
  nodeMap: Map<string, Node>,
  speed: SpeedType,
  callback?: (animationIndex: number) => void
) {
  const shortestPathsToAnimate: Array<Node> = [];
  let previousNode: Node | null = endNode.previous;

  while (previousNode !== null) {
    shortestPathsToAnimate.unshift(previousNode);
    previousNode = nodeMap.get(previousNode.id)?.previous ?? null;
  }

  const timers: Array<Timer> = [];
  for (let i = 0; i < shortestPathsToAnimate.length; i++) {
    timers.push(
      startTimer(
        shortestPathsToAnimate,
        i,
        (i + 1) * SPEED_MAPPING[speed].pathTime,
        'shortest-path',
        callback
      )
    );
  }

  return timers;
}
