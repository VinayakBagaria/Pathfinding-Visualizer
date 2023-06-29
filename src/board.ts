class Board {
  private height: number;
  private width: number;
  private startCoords = [0, 0];
  private endCoords = [0, 0];

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
    this.createGrid();
  }

  private createGrid() {
    let tableHtml = '';

    for (let r = 0; r < this.height; r++) {
      let currentRow = '';

      for (let c = 0; c < this.width; c++) {
        const nodeId = `${r}-${c}`;
        let nodeClass = 'unvisited';
        if (r == this.startCoords[0] && c == this.startCoords[1]) {
          nodeClass = 'start';
        } else if (r == this.endCoords[0] && c == this.endCoords[1]) {
          nodeClass = 'end';
        }
        currentRow += `<td id=${nodeId} class=${nodeClass}></td>`;
      }

      tableHtml += `<tr id="row ${r}">${currentRow}</tr>`;
    }

    const boardNode = document.getElementById('board');
    if (boardNode !== null) {
      boardNode.innerHTML = tableHtml;
    }
  }
}

export default Board;
