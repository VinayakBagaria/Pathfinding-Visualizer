export function getNodes(selector: string) {
  return document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
}

export function addHtmlEvent(
  nodes: NodeListOf<HTMLElement> | Array<HTMLElement>,
  callback: (element: Event) => void,
  eventName: 'click' = 'click'
) {
  nodes.forEach(eachNode => eachNode.addEventListener(eventName, callback));
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
