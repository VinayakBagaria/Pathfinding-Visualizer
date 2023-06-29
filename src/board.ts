import Node from './node';
import dfsAlgorithm from './dfs';
import bfsAlgorithm from './bfs';
import { NodeStatusType } from './types';

class Board {
  private boardNode: Element;
  private height: number;
  private width: number;

  private startCoords = [0, 0];
  private endCoords = [0, 0];
  private startId: string;
  private endId: string;

  private nodeMap: Map<string, Node>;
  private boardArray: Array<Array<Node>>;

  private nodesToAnimate: Array<Node>;

  private dragging: Record<'start' | 'end', boolean>;
  private clickPosition: Record<'r' | 'c', number>;

  constructor(_boardNode: Element, _height: number, _width: number) {
    this.boardNode = _boardNode;
    this.height = _height;
    this.width = _width;

    this.startCoords = [
      Math.floor(this.height / 2),
      Math.floor(this.width / 4),
    ];
    this.endCoords = [
      Math.floor(this.height / 2),
      3 * Math.floor(this.width / 4),
    ];
    this.startId = '';
    this.endId = '';

    this.nodeMap = new Map();
    this.boardArray = [];

    this.nodesToAnimate = [];

    this.dragging = { start: false, end: false };
    this.clickPosition = { r: -1, c: -1 };

    this.createGrid();
    this.addEventListeners();
  }

  private createGrid() {
    let tableHtml = '';

    for (let r = 0; r < this.height; r++) {
      let currentRow = '';
      const currentNodes: Array<Node> = [];

      for (let c = 0; c < this.width; c++) {
        const nodeId = `${r}-${c}`;
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
      } else {
        this.clickPosition.r = node.r;
        this.clickPosition.c = node.c;
      }
    });

    this.boardNode.addEventListener('mouseup', () => {
      this.dragging = { start: false, end: false };
      this.clickPosition = { r: -1, c: -1 };
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
      } else {
      }
    });
  }

  changeNodeElement(nodeId: string, newStatus: NodeStatusType) {
    const currentNode = this.nodeMap.get(nodeId);
    const currentElement = document.getElementById(nodeId);
    if (!currentNode || !currentElement) {
      return;
    }

    currentNode.status = newStatus;
    currentElement.classList.add(newStatus);

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

  startDfs() {
    const isSuccessful = dfsAlgorithm(
      this.startId,
      this.endId,
      this.nodeMap,
      this.nodesToAnimate
    );
    return { isSuccessful, nodesToAnimate: this.nodesToAnimate };
  }

  startBfs() {
    const isSuccessful = bfsAlgorithm(
      this.startId,
      this.endId,
      this.nodeMap,
      this.nodesToAnimate
    );
    return { isSuccessful, nodesToAnimate: this.nodesToAnimate };
  }
}

export default Board;
