import Node from './node';
import dfsAlgorithm from './dfs';
import bfsAlgorithm from './bfs';
import { createNodeId } from './helpers';
import { AlgorithmType, NodeStatusType } from './types';

class Board {
  private boardNode: Element;
  private height: number;
  private width: number;

  private startCoords: [number, number];
  private endCoords: [number, number];
  private startId: string;
  private endId: string;

  private nodeMap: Map<string, Node>;
  private boardArray: Array<Array<Node>>;

  private nodesToAnimate: Array<Node>;

  private dragging: Record<'start' | 'end', boolean>;
  private isCreatingWall: boolean;

  private algorithm: AlgorithmType;

  constructor(_boardNode: Element) {
    this.boardNode = _boardNode;

    this.setInitialCoordinates();

    this.boardArray = [];

    this.dragging = { start: false, end: false };
    this.isCreatingWall = false;

    this.createGrid();
    this.addEventListeners();
  }

  private setInitialCoordinates() {
    const { height, width } = this.boardNode.getBoundingClientRect();
    this.height = height / 28;
    this.width = width / 28;

    this.startCoords = [
      Math.floor(this.height / 2),
      Math.floor(this.width / 4),
    ];
    this.endCoords = [
      Math.floor(this.height / 2),
      3 * Math.floor(this.width / 4),
    ];
  }

  private createGrid() {
    this.nodeMap = new Map();
    this.nodesToAnimate = [];
    let tableHtml = '';

    for (let r = 0; r < this.height; r++) {
      let currentRow = '';
      const currentNodes: Array<Node> = [];

      for (let c = 0; c < this.width; c++) {
        const nodeId = createNodeId(r, c);
        let nodeStatus: NodeStatusType = 'unvisited';
        if (r == this.startCoords[0] && c == this.startCoords[1]) {
          nodeStatus = 'start';
          this.startId = nodeId;
        } else if (r == this.endCoords[0] && c == this.endCoords[1]) {
          nodeStatus = 'end';
          this.endId = nodeId;
        }
        currentRow += `<td id=${nodeId} class=${nodeStatus}></td>`;

        const node = new Node(r, c, nodeId, nodeStatus);
        this.nodeMap.set(nodeId, node);
        currentNodes.push(node);
      }

      tableHtml += `<tr id="row ${r}">${currentRow}</tr>`;
      this.boardArray.push(currentNodes);
    }

    this.boardNode.innerHTML = tableHtml;
  }

  private addEventListeners() {
    this.boardNode.addEventListener('mousedown', event => {
      const element = event.target as HTMLElement;
      const node = this.nodeMap.get(element.id);
      if (!node) {
        return;
      }

      if (node.status === 'start') {
        this.dragging.start = true;
      } else if (node.status === 'end') {
        this.dragging.end = true;
      } else if (node.status === 'wall') {
        this.changeNodeElement(element.id, 'unvisited');
      } else {
        this.isCreatingWall = true;
      }
    });

    this.boardNode.addEventListener('mouseup', () => {
      this.dragging = { start: false, end: false };
      this.isCreatingWall = false;
    });

    this.boardNode.addEventListener('mousemove', event => {
      const element = event.target as HTMLElement;

      if (this.dragging.start || this.dragging.end) {
        if (this.dragging.start) {
          if (element.id === this.endId) {
            return;
          }
          this.changeNodeElement(this.startId, 'unvisited');
          this.changeNodeElement(element.id, 'start');
        } else if (this.dragging.end) {
          if (element.id === this.startId) {
            return;
          }
          this.changeNodeElement(this.endId, 'unvisited');
          this.changeNodeElement(element.id, 'end');
        }
      } else if (this.isCreatingWall) {
        this.changeNodeElement(element.id, 'wall');
      }
    });
  }

  private changeNodeElement(nodeId: string, newStatus: NodeStatusType) {
    const currentNode = this.nodeMap.get(nodeId);
    const currentElement = document.getElementById(nodeId);
    if (!currentNode || !currentElement) {
      return;
    }

    if (newStatus === 'wall' && ['start', 'end'].includes(currentNode.status)) {
      return;
    }

    currentElement.classList.remove('unvisited');
    currentElement.classList.remove('wall');
    currentElement.classList.add(newStatus);
    currentNode.status = newStatus;

    if (newStatus === 'start') {
      this.startId = currentNode.id;
      return;
    }

    if (newStatus === 'end') {
      this.endId = currentNode.id;
      return;
    }

    currentElement.classList.remove('start');
    currentElement.classList.remove('end');
  }

  clearBoard() {
    this.setInitialCoordinates();
    this.createGrid();
  }

  setAlgorithm(algorithm: AlgorithmType) {
    this.algorithm = algorithm;
  }

  start() {
    let isSuccessful = false;
    if (this.algorithm === 'dfs') {
      isSuccessful = dfsAlgorithm(
        this.startId,
        this.endId,
        this.nodeMap,
        this.nodesToAnimate
      );
    } else if (this.algorithm === 'bfs') {
      isSuccessful = bfsAlgorithm(
        this.startId,
        this.endId,
        this.nodeMap,
        this.nodesToAnimate
      );
    } else {
      throw new Error(`Algorithm not implemented: ${this.algorithm}`);
    }
    return { isSuccessful, nodesToAnimate: this.nodesToAnimate };
  }
}

export default Board;
