import { getNodes, getNodeById, addHtmlEvent } from './utils';
import {
  WALKTHROUGH_COUNTER_STORAGE_KEY,
  WALKTHROUGH_POSITIONS,
} from './constants';

let currentIndex = 0;

function goToIndex() {
  const overlayNode = getNodeById('walkthrough-overlay');
  if (currentIndex < 0) {
    overlayNode.classList.remove('open');
    return;
  }

  overlayNode.classList.add('open');
  const isLastPosition = currentIndex === WALKTHROUGH_POSITIONS.length - 1;
  getNodeById('walkthrough-skip').style.visibility = isLastPosition
    ? 'hidden'
    : 'visible';
  getNodeById('walkthrough-next').innerText = isLastPosition
    ? 'Finish!'
    : 'Next';

  const currentStep = WALKTHROUGH_POSITIONS[currentIndex];
  const referencePosition = getNodes(
    currentStep.reference
  )[0].getBoundingClientRect();

  const containerNode = getNodeById('walkthrough-container');

  const xDisplacement = referencePosition.x + currentStep.left;
  const yDisplacement =
    referencePosition.y + referencePosition.height + currentStep.top;
  containerNode.style.transform = `translate(${xDisplacement}px, ${yDisplacement}px)`;
  if (currentIndex > 0) {
    containerNode.classList.add('with-transition');
  } else {
    containerNode.classList.remove('with-transition');
  }

  getNodeById('walkthrough-stepper').innerText = `${currentIndex + 1} of ${
    WALKTHROUGH_POSITIONS.length
  }`;
  getNodeById('walkthrough-title').innerText = currentStep.title;
  getNodeById('walkthrough-description').innerText = currentStep.description;

  const imageNode = getNodeById('walkthrough-image');
  if (currentStep.image) {
    imageNode.classList.add('valid');
    imageNode.style.backgroundImage = `url(${currentStep.image})`;
  } else {
    imageNode.classList.remove('valid');
  }

  getNodeById('walkthrough-arrow').dataset.direction =
    currentStep.direction ?? 'top-left';
}

export function reInitiateWalkthrough() {
  currentIndex = 0;
  goToIndex();
}

export function setUpWalkthrough() {
  if (!localStorage.getItem(WALKTHROUGH_COUNTER_STORAGE_KEY)) {
    setTimeout(() => reInitiateWalkthrough(), 600);
  }

  addHtmlEvent(getNodeById('walkthrough-skip'), () => {
    currentIndex = -1;
    goToIndex();
  });

  addHtmlEvent(getNodeById('walkthrough-next'), () => {
    currentIndex += 1;
    if (currentIndex === WALKTHROUGH_POSITIONS.length) {
      localStorage.setItem(WALKTHROUGH_COUNTER_STORAGE_KEY, '1');
      currentIndex = -1;
    }
    goToIndex();
  });
}
