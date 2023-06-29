import Node from './node';
import dfsAlgorithm from './dfs';

class Board {
  private height: number;
  private width: number;

  private startCoords = [0, 0];
  private endCoords = [0, 0];
  private startId: string;
  private endId: string;

  private nodeMap: Map<string, Node>;
  private boardArray: Array<Array<Node>>;

  private nodesToAnimate: Array<Node>;

  private mouseState: 'down' | 'up';
  private pressedNode: Node | null;
  private previousNode: Node | null;

  constructor(private _height: number, private _width: number) {
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

    this.mouseState = 'up';
    this.pressedNode = null;
    this.previousNode = null;

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
        let nodeStatus: 'start' | 'end' | 'unvisited' = 'unvisited';
        if (r == this.startCoords[0] && c == this.startCoords[1]) {
          nodeStatus = 'start';
          this.startId = nodeId;
        } else if (r == this.endCoords[0] && c == this.endCoords[1]) {
          nodeStatus = 'end';
          this.endId = nodeId;
        }
        currentRow += `<td id=${nodeId} class=${nodeStatus}></td>`;

        const node = new Node(nodeId, nodeStatus);
        this.nodeMap.set(nodeId, node);
        currentNodes.push(node);
      }

      tableHtml += `<tr id="row ${r}">${currentRow}</tr>`;
      this.boardArray.push(currentNodes);
    }

    const boardNode = document.getElementById('board');
    if (boardNode !== null) {
      boardNode.innerHTML = tableHtml;
    }
  }

  private addEventListeners() {
    for (let r = 0; r < this._height; r++) {
      for (let c = 0; c < this.width; c++) {
        const currentId = `${r}-${c}`;
        const currentNode = this.nodeMap.get(currentId);
        if (!currentNode) {
          throw new Error('Unfound node');
        }

        const currentElement = document.getElementById(currentId);
        if (!currentElement) {
          throw new Error('Unfound node');
        }

        currentElement.onmousedown = () => {
          this.mouseState = 'down';
          if (currentNode.status === 'start' || currentNode.status === 'end') {
            this.pressedNode = currentNode;
          }
        };

        currentElement.onmouseup = () => {
          this.mouseState = 'up';
          if (!this.pressedNode) {
            return;
          }
          if (this.pressedNode.status === 'start') {
            this.startId = currentNode.id;
          } else if (this.pressedNode.status === 'end') {
            this.endId = currentNode.id;
          }
          this.pressedNode = null;
        };

        currentElement.onmouseenter = () => {
          if (this.mouseState === 'down' && this.pressedNode) {
          }
        };

        currentElement.onmouseleave = () => {
          if (this.mouseState === 'down' && this.pressedNode) {
            this.changeNodeType(currentNode, currentElement);
          }
        };
      }
    }
  }

  changeNodeType(currentNode: Node, currentElement: HTMLElement) {}

  startDfs() {
    const isSuccessful = dfsAlgorithm(
      this.startId,
      this.endId,
      this.nodeMap,
      this.nodesToAnimate
    );
    return { isSuccessful, nodesToAnimate: this.nodesToAnimate };
  }
}

export default Board;
