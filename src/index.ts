import startAnimations from './animate';
import Board from './board';

function executeSequence() {
  const boardNode = document.querySelector('#board');

  if (!boardNode) {
    return;
  }

  const board = new Board(boardNode);

  addSelectorEvent('#visualize', event => {
    const element = event.target as HTMLElement;
    const { isSuccessful, nodesToAnimate } = board.start();
    const buttonText = element.innerText;

    if (isSuccessful) {
      startAnimations(nodesToAnimate, animationIndex => {
        if (animationIndex === 0) {
          element.classList.add('loading');
          element.innerText = 'Loading...';
        } else if (animationIndex === nodesToAnimate.length - 1) {
          element.classList.remove('loading');
          element.innerText = buttonText;

          alert('Node is found!');
        }
      });
    } else {
      alert("Can't find path");
    }
  });

  addSelectorEvent('#clear', () => {
    board.clearBoard();
  });

  addSelectorEvent('.dropdown', event => {
    const node = event.currentTarget as HTMLElement;
    if (node.classList.contains('open')) {
      node.classList.remove('open');
    } else {
      node.classList.add('open');
    }
  });

  addSelectorEvent('.dropdown-item', event => {
    const node = event.currentTarget as HTMLElement;
    if (node.id === 'dfs-algorithm') {
      board.setAlgorithm('dfs');
      changeDropdownLabel(node, 'Algorithm: DFS');
    } else if (node.id === 'bfs-algorithm') {
      board.setAlgorithm('bfs');
      changeDropdownLabel(node, 'Algorithm: BFS');
    } else if (node.id === 'fast-speed') {
      board.setSpeed('fast');
      changeDropdownLabel(node, 'Speed: Fast');
    } else if (node.id === 'average-speed') {
      board.setSpeed('average');
      changeDropdownLabel(node, 'Speed: Average');
    } else if (node.id === 'slow-speed') {
      board.setSpeed('slow');
      changeDropdownLabel(node, 'Speed: Slow');
    }
  });
}

function addSelectorEvent(
  selector: string,
  callback: (element: Event) => void
) {
  const nodes = document.querySelectorAll(selector);
  nodes.forEach(eachNode => eachNode.addEventListener('click', callback));
}

function changeDropdownLabel(node: HTMLElement, text: string) {
  const controls = node.parentElement?.parentElement?.querySelector(
    '.dropdown-controls'
  ) as HTMLElement | undefined | null;
  if (!controls) {
    return;
  }
  controls.innerText = text;
}

executeSequence();
