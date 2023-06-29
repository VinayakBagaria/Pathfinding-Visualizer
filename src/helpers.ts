import Node from './node';

export function getNeighbours(currentId: string, nodeMap: Map<string, Node>) {
  const coordinates = currentId.split('-');
  const x = parseInt(coordinates[0], 10);
  const y = parseInt(coordinates[1], 10);

  const neighbours: Array<Node> = [];

  const combinations = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
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
