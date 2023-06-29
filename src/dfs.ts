import Node from './node';

function dfsAlgorithm(
  startId: string,
  endId: string,
  nodeMap: Map<string, Node>
) {
  const queue = [nodeMap.get(startId)];

  const visited: Map<string, boolean> = new Map();

  while (queue.length > 0) {
    const current = queue.shift();
    if (typeof current === 'undefined') {
      break;
    }

    visited.set(current.id, true);
    current.status = 'visited';
    if (current.id === endId) {
      return true;
    }

    const neighbours = getNeighbours(current.id, nodeMap);
    for (const neighbour of neighbours) {
      if (!visited.has(neighbour.id)) {
        queue.push(neighbour);
      }
    }
  }

  return false;
}

function getNeighbours(currentId: string, nodeMap: Map<string, Node>) {
  const coordinates = currentId.split('-');
  const x = parseInt(coordinates[0], 10);
  const y = parseInt(coordinates[1], 10);

  const neighbours: Array<Node> = [];

  const combinations = [
    [0, -1],
    [0, 1],
    [1, 0],
    [-1, 0],
  ];

  for (const combination of combinations) {
    const newX = x + combination[0];
    const newY = y + combination[1];

    const neighbourNode = nodeMap.get(`${newX}-${newY}`);
    if (typeof neighbourNode !== 'undefined') {
      neighbours.push(neighbourNode);
    }
  }

  return neighbours;
}

export default dfsAlgorithm;
