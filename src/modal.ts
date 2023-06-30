import { addHtmlEvent, getNodes } from './utils';

function showModal(titleText: string, descriptionText: string) {
  const overlayNode = getNodes('.modal-overlay')[0];
  overlayNode.classList.add('open');

  const titleNode = getNodes('.modal-title')[0];
  titleNode.innerText = titleText;

  const descriptionNode = getNodes('.modal-description')[0];
  descriptionNode.innerText = descriptionText;

  addHtmlEvent(getNodes('.modal-close'), () => {
    overlayNode.classList.remove('open');
  });
}

export default showModal;
