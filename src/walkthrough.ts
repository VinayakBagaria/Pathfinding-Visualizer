import { getNodes, getNodeById, addHtmlEvent } from './utils';
import { WALKTHROUGH_POSITIONS } from './constants';

let currentIndex = 0;

function goToIndex() {
  const overlayNode = getNodeById('walkthrough-overlay');
  if (currentIndex < 0) {
    overlayNode.classList.remove('open');
    return;
  }

  overlayNode.classList.add('open');
  const containerNode = getNodeById('walkthrough-container');

  const currentStep = WALKTHROUGH_POSITIONS[currentIndex];

  const positions = getNodes(currentStep.reference)[0].getBoundingClientRect();
  containerNode.style.top = `${
    positions.y + positions.height + currentStep.top
  }px`;
  containerNode.style.left = `${positions.x + currentStep.left}px`;

  getNodeById('walkthrough-stepper').innerText = `${currentIndex + 1} of ${
    WALKTHROUGH_POSITIONS.length
  }`;
  getNodeById('walkthrough-title').innerText = currentStep.title;
  getNodeById('walkthrough-description').innerText = currentStep.description;
}

export function reInitiateWalkthrough() {
  currentIndex = 0;
  goToIndex();
}

export function setUpWalkthrough() {
  setTimeout(() => reInitiateWalkthrough(), 600);

  addHtmlEvent(getNodeById('walkthrough-skip'), () => {
    currentIndex = -1;
    goToIndex();
  });

  addHtmlEvent(getNodeById('walkthrough-next'), () => {
    currentIndex += 1;
    if (currentIndex === WALKTHROUGH_POSITIONS.length) {
      currentIndex = -1;
    }
    goToIndex();
  });
}
