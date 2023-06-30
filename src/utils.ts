export function getNodes(selector: string) {
  return document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
}

export function getNodeById(selectorId: string) {
  const node = document.getElementById(selectorId);
  if (!node) {
    throw new Error(`Selector not found: ${selectorId}`);
  }
  return node;
}

export function addHtmlEvent(
  node: HTMLElement,
  callback: (element: Event) => void,
  eventName: 'click' = 'click'
) {
  node.addEventListener(eventName, callback);
}

export function changeDropdownLabel(node: HTMLElement, text: string) {
  const controls = node.parentElement?.parentElement?.querySelector(
    '.dropdown-controls'
  ) as HTMLElement | undefined | null;
  if (!controls) {
    return;
  }
  controls.innerText = text;
}
