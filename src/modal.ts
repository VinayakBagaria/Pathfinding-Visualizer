import { addHtmlEvent, getNodeById } from './utils';

function showModal(titleText: string, descriptionText: string) {
  const overlayNode = getNodeById('modal-overlay');

  overlayNode.classList.add('open');
  getNodeById('modal-title').innerText = titleText;

  getNodeById('modal-description').innerText = descriptionText;

  addHtmlEvent(getNodeById('modal-close'), () => {
    overlayNode.classList.remove('open');
  });
}

export default showModal;
