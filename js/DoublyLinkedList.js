import SongNode from './SongNode.js';

export default class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.current = null;
    this.size = 0;
  }

  createSongNode(song) {
    return new SongNode(song);
  }

  appendSong(song) {
    const node = this.createSongNode(song);
    if (this.isEmpty()) {
      this.head = node;
      this.tail = node;
      this.current = node;
      this.size = 1;
      return node;
    }

    node.prev = this.tail;
    this.tail.next = node;
    this.tail = node;
    this.size += 1;
    if (this.current === null) {
      this.current = node;
    }
    return node;
  }

  prependSong(song) {
    const node = this.createSongNode(song);
    if (this.isEmpty()) {
      this.head = node;
      this.tail = node;
      this.current = node;
      this.size = 1;
      return node;
    }

    node.next = this.head;
    this.head.prev = node;
    this.head = node;
    this.size += 1;
    if (this.current === null) {
      this.current = node;
    }
    return node;
  }

  insertAtPosition(song, position) {
    const safePosition = Number(position);
    if (!Number.isInteger(safePosition) || safePosition < 1) {
      return null;
    }

    const node = this.createSongNode(song);

    if (this.isEmpty()) {
      this.head = node;
      this.tail = node;
      this.current = node;
      this.size = 1;
      return node;
    }

    if (safePosition <= 1) {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
      this.size += 1;
      if (this.current === null) {
        this.current = node;
      }
      return node;
    }

    if (safePosition >= this.size + 1) {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
      this.size += 1;
      if (this.current === null) {
        this.current = node;
      }
      return node;
    }

    const target = this.getNodeAtPosition(safePosition);
    return this.insertNodeAtPosition(node, safePosition);
  }

  insertBeforeNode(targetNode, newNode) {
    if (!targetNode || !newNode) {
      return null;
    }

    if (targetNode === this.head) {
      newNode.next = this.head;
      newNode.prev = null;
      this.head.prev = newNode;
      this.head = newNode;
      this.size += 1;
      if (this.current === null) {
        this.current = newNode;
      }
      return newNode;
    }

    newNode.prev = targetNode.prev;
    newNode.next = targetNode;
    targetNode.prev.next = newNode;
    targetNode.prev = newNode;
    this.size += 1;
    if (this.current === null) {
      this.current = newNode;
    }
    return newNode;
  }

  deleteById(id) {
    if (this.isEmpty()) {
      return null;
    }

    let currentNode = this.head;
    while (currentNode && currentNode.id !== id) {
      currentNode = currentNode.next;
    }

    if (!currentNode) {
      return null;
    }

    const previousNode = currentNode.prev;
    const nextNode = currentNode.next;

    if (previousNode) {
      previousNode.next = nextNode;
    } else {
      this.head = nextNode;
    }

    if (nextNode) {
      nextNode.prev = previousNode;
    } else {
      this.tail = previousNode;
    }

    if (this.current === currentNode) {
      this.current = nextNode || previousNode || null;
    }

    currentNode.prev = null;
    currentNode.next = null;
    this.size -= 1;

    if (this.isEmpty()) {
      this.head = null;
      this.tail = null;
      this.current = null;
    }

    return currentNode;
  }

  deleteFirst() {
    if (this.isEmpty()) {
      return null;
    }
    return this.deleteById(this.head.id);
  }

  deleteLast() {
    if (this.isEmpty()) {
      return null;
    }
    return this.deleteById(this.tail.id);
  }

  searchByTitle(title) {
    const query = String(title || '').trim().toLowerCase();
    if (!query) {
      return null;
    }

    let node = this.head;
    while (node) {
      if (node.title.toLowerCase().includes(query)) {
        return node;
      }
      node = node.next;
    }

    return null;
  }

  nextSong() {
    if (!this.current) {
      return null;
    }

    if (this.current.next) {
      this.current = this.current.next;
    }
    return this.current;
  }

  previousSong() {
    if (!this.current) {
      return null;
    }

    if (this.current.prev) {
      this.current = this.current.prev;
    }
    return this.current;
  }

  traverseForward() {
    const nodes = [];
    let currentNode = this.head;

    while (currentNode) {
      nodes.push(currentNode);
      currentNode = currentNode.next;
    }

    return nodes;
  }

  traverseBackward() {
    const nodes = [];
    let currentNode = this.tail;

    while (currentNode) {
      nodes.push(currentNode);
      currentNode = currentNode.prev;
    }

    return nodes;
  }

  getNodeAtPosition(position) {
    const index = Number(position);
    if (!Number.isInteger(index) || index < 1 || index > this.size) {
      return null;
    }

    let node = this.head;
    let currentIndex = 1;

    while (node && currentIndex < index) {
      node = node.next;
      currentIndex += 1;
    }

    return node;
  }

  moveSong(fromPosition, toPosition) {
    const from = Number(fromPosition);
    const to = Number(toPosition);

    if (!Number.isInteger(from) || !Number.isInteger(to)) {
      return false;
    }

    if (this.isEmpty() || from < 1 || from > this.size || to < 1 || to > this.size) {
      return false;
    }

    if (from === to) {
      return true;
    }

    const movingNode = this.getNodeAtPosition(from);
    if (!movingNode) {
      return false;
    }

    const previousCurrent = this.current;
    this.deleteById(movingNode.id);
    const insertedNode = this.insertNodeAtPosition(movingNode, to);
    this.current = insertedNode || previousCurrent;
    return Boolean(insertedNode);
  }

  insertNodeAtPosition(node, position) {
    if (!node) {
      return null;
    }

    if (this.isEmpty()) {
      this.head = node;
      this.tail = node;
      this.current = node;
      node.prev = null;
      node.next = null;
      this.size = 1;
      return node;
    }

    const targetPosition = Number(position);
    if (!Number.isInteger(targetPosition) || targetPosition < 1) {
      node.prev = null;
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
      this.size += 1;
      return node;
    }

    if (targetPosition >= this.size + 1) {
      node.prev = this.tail;
      node.next = null;
      this.tail.next = node;
      this.tail = node;
      this.size += 1;
      return node;
    }

    const target = this.getNodeAtPosition(targetPosition);
    if (!target) {
      node.prev = this.tail;
      node.next = null;
      this.tail.next = node;
      this.tail = node;
      this.size += 1;
      return node;
    }

    if (target === this.head) {
      node.prev = null;
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
      this.size += 1;
      return node;
    }

    node.prev = target.prev;
    node.next = target;
    target.prev.next = node;
    target.prev = node;
    this.size += 1;
    return node;
  }

  clearPlaylist() {
    this.head = null;
    this.tail = null;
    this.current = null;
    this.size = 0;
  }

  getSize() {
    return this.size;
  }

  isEmpty() {
    return this.size === 0;
  }

  validateIntegrity() {
    const errors = [];
    const visited = new Set();
    let count = 0;
    let currentNode = this.head;

    if (this.isEmpty()) {
      if (this.head !== null || this.tail !== null) {
        errors.push('Empty playlist must have null head and tail.');
      }

      if (this.current !== null) {
        errors.push('Current pointer should be null when playlist is empty.');
      }

      return { valid: errors.length === 0, errors, count: 0 };
    }

    if (this.head === null || this.tail === null) {
      errors.push('Non-empty list should have both head and tail.');
    }

    if (this.head && this.head.prev !== null) {
      errors.push('Head.prev must be null for non-empty list.');
    }

    if (this.tail && this.tail.next !== null) {
      errors.push('Tail.next must be null for non-empty list.');
    }

    while (currentNode) {
      if (visited.has(currentNode)) {
        errors.push('Cycle detected in playlist.');
        break;
      }
      visited.add(currentNode);
      count += 1;

      if (currentNode.prev && currentNode.prev.next !== currentNode) {
        errors.push(`Node "${currentNode.title}" has broken prev-next link.`);
      }

      if (currentNode.next && currentNode.next.prev !== currentNode) {
        errors.push(`Node "${currentNode.title}" has broken next-prev link.`);
      }

      currentNode = currentNode.next;
    }

    if (count !== this.size) {
      errors.push('Reachable node count does not equal size.');
    }

    if (this.current && !visited.has(this.current)) {
      errors.push('Current pointer does not reference a node in the list.');
    }

    return {
      valid: errors.length === 0,
      errors,
      count,
    };
  }
}
