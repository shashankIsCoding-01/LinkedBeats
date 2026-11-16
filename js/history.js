export class ManualStack {
  constructor() {
    this.items = [];
  }

  push(value) {
    this.items.push(value);
  }

  pop() {
    return this.items.pop() ?? null;
  }

  peek() {
    return this.items[this.items.length - 1] ?? null;
  }

  clear() {
    this.items = [];
  }

  size() {
    return this.items.length;
  }
}

export function serializePlaylistState(list) {
  const songs = list.traverseForward().map((song) => ({
    id: song.id,
    title: song.title,
    artist: song.artist,
    duration: Number(song.duration) || 0,
    audioUrl: song.audioUrl || '',
    audioFileId: song.audioFileId || null,
  }));

  return {
    songs,
    currentSongId: list.current ? list.current.id : null,
  };
}

export function restorePlaylistState(list, state) {
  if (!state || !Array.isArray(state.songs)) {
    list.clearPlaylist();
    return false;
  }

  list.clearPlaylist();
  state.songs.forEach((song) => list.appendSong({ ...song }));

  if (state.currentSongId) {
    const restored = list.traverseForward().find((song) => song.id === state.currentSongId);
    list.current = restored || list.head || null;
  } else {
    list.current = list.head || null;
  }

  return true;
}

export class HistoryManager {
  constructor(initialState) {
    this.undoStack = new ManualStack();
    this.redoStack = new ManualStack();
    this.capture(initialState);
  }

  capture(state) {
    this.undoStack.push(JSON.parse(JSON.stringify(state)));
    this.redoStack.clear();
  }

  undo() {
    if (this.undoStack.size() <= 1) {
      return null;
    }

    const currentState = this.undoStack.pop();
    const previousState = this.undoStack.peek();
    this.redoStack.push(currentState);
    return previousState;
  }

  redo() {
    if (this.redoStack.size() === 0) {
      return null;
    }

    const nextState = this.redoStack.pop();
    this.undoStack.push(nextState);
    return nextState;
  }
}
