// here added
import Board from './board';

const boardNode = document.querySelector('#board');

if (boardNode !== null) {
  const { height, width } = boardNode.getBoundingClientRect();
  const board = new Board(height / 25, width / 25);
}
