import { getNeighbours } from './helpers';
import Node from './node';

function dfsAlgorithm(
  startId: string,
  endId: string,
  nodeMap: Map<string, Node>,
  nodesToAnimate: Array<Node>
): Node | null {
  const queue = [nodeMap.get(startId)];

  const visited: Map<string, boolean> = new Map();

  while (queue.length > 0) {
    const current = queue.pop();
    if (typeof current === 'undefined') {
      break;
    }

    visited.set(current.id, true);
    nodesToAnimate.push(current);

    current.status = 'visited';
    if (current.id === endId) {
      return current;
    }

    const neighbours = getNeighbours(current.id, nodeMap).reverse();
    for (const neighbour of neighbours) {
      if (!visited.has(neighbour.id)) {
        neighbour.previous = current;
        queue.push(neighbour);
      }
    }
  }

  return null;
}

export default dfsAlgorithm;
