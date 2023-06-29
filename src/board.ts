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

    this.createGrid();
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

  startDfs() {
    dfsAlgorithm(this.startId, this.endId, this.nodeMap);
  }
}

export default Board;
