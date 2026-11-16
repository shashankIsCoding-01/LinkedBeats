export function renderLinkedListVisualizer(container, list) {
  if (!container) {
    return;
  }

  container.innerHTML = '';

  const nodes = list.traverseForward();
  const nodeCountLabel = document.getElementById('nodeCountLabel');
  if (nodeCountLabel) {
    nodeCountLabel.textContent = `${nodes.length} node${nodes.length === 1 ? '' : 's'}`;
  }

  if (!nodes.length) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-visual';
    emptyState.textContent = 'Playlist is empty. Add a song to begin the linked list.';
    container.appendChild(emptyState);
    return;
  }

  const track = document.createElement('div');
  track.className = 'visual-track';

  nodes.forEach((node, index) => {
    const card = document.createElement('div');
    card.className = 'list-node';

    if (node === list.head) {
      card.classList.add('head-node');
    }

    if (node === list.tail) {
      card.classList.add('tail-node');
    }

    if (node === list.current) {
      card.classList.add('current-node');
    }

    const nodeLabel = document.createElement('div');
    nodeLabel.className = 'node-label';
    nodeLabel.textContent = node.title;

    const meta = document.createElement('div');
    meta.className = 'node-meta';
    meta.innerHTML = `
      <span>Prev: ${node.prev ? node.prev.title : 'null'}</span>
      <span>Next: ${node.next ? node.next.title : 'null'}</span>
    `;

    const nodeIndex = document.createElement('div');
    nodeIndex.className = 'node-index';
    nodeIndex.textContent = `#${index + 1}`;

    if (node === list.head) {
      const headTag = document.createElement('span');
      headTag.className = 'tag head-tag';
      headTag.textContent = 'HEAD';
      card.appendChild(headTag);
    }

    if (node === list.tail) {
      const tailTag = document.createElement('span');
      tailTag.className = 'tag tail-tag';
      tailTag.textContent = 'TAIL';
      card.appendChild(tailTag);
    }

    if (node === list.current) {
      const currentTag = document.createElement('span');
      currentTag.className = 'tag current-tag';
      currentTag.textContent = 'CURRENT';
      card.appendChild(currentTag);
    }

    card.appendChild(nodeIndex);
    card.appendChild(nodeLabel);
    card.appendChild(meta);
    track.appendChild(card);

    if (index < nodes.length - 1) {
      const arrow = document.createElement('div');
      arrow.className = 'arrow';
      arrow.textContent = '⇄';
      track.appendChild(arrow);
    }
  });

  container.appendChild(track);
}
