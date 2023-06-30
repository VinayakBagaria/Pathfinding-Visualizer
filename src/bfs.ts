import { getNeighbours } from './helpers';
import Node from './node';

function bfsAlgorithm(
  startId: string,
  endId: string,
  nodeMap: Map<string, Node>,
  nodesToAnimate: Array<Node>
): Node | null {
  const queue = [nodeMap.get(startId)];

  const visited: Map<string, boolean> = new Map();
  visited.set(startId, true);

  while (queue.length > 0) {
    const current = queue.shift();
    if (typeof current === 'undefined') {
      break;
    }

    nodesToAnimate.push(current);

    current.status = 'visited';
    if (current.id === endId) {
      return current;
    }

    const neighbours = getNeighbours(current.id, nodeMap);
    for (const neighbour of neighbours) {
      if (!visited.has(neighbour.id)) {
        visited.set(neighbour.id, true);
        neighbour.previous = current;
        queue.push(neighbour);
      }
    }
  }

  return null;
}

export default bfsAlgorithm;
