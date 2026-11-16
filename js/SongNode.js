export default class SongNode {
  constructor(song = {}) {
    this.id = song.id || this.generateId();
    this.title = song.title || 'Untitled Song';
    this.artist = song.artist || 'Unknown Artist';
    this.duration = Number(song.duration) || 0;
    this.audioUrl = song.audioUrl || '';
    this.prev = null;
    this.next = null;
  }

  generateId() {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
      return globalThis.crypto.randomUUID();
    }

    return `song-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  }
}
