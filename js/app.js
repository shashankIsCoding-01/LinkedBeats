import DoublyLinkedList from './DoublyLinkedList.js';
import { createPlayer } from './player.js';
import { renderLinkedListVisualizer } from './visualizer.js';
import {
  loadPlaylist,
  savePlaylist,
  saveRecentlyDeleted,
  loadRecentlyDeleted,
  saveAudioBlob,
  loadAudioBlob,
  deleteAudioBlob,
} from './storage.js';
import { HistoryManager, serializePlaylistState, restorePlaylistState } from './history.js';

const playlist = new DoublyLinkedList();
const operationLog = [];
let history = null;
let recentlyDeleted = [];

const demoSongs = [
  {
    id: 'demo-1',
    title: 'Midnight Circuit',
    artist: 'Nova Echo',
    duration: 214,
    audioUrl: '',
  },
  {
    id: 'demo-2',
    title: 'Blue Horizon',
    artist: 'Digital Waves',
    duration: 196,
    audioUrl: '',
  },
  {
    id: 'demo-3',
    title: 'Neon Dreams',
    artist: 'Pixel Symphony',
    duration: 228,
    audioUrl: '',
  },
  {
    id: 'demo-4',
    title: 'Endless Roads',
    artist: 'Aurora Pulse',
    duration: 243,
    audioUrl: '',
  },
  {
    id: 'demo-5',
    title: 'Electric Sunrise',
    artist: 'Cosmic Rhythm',
    duration: 202,
    audioUrl: '',
  },
];

const dom = {
  currentSongTitle: document.getElementById('currentSongTitle'),
  currentSongArtist: document.getElementById('currentSongArtist'),
  totalSongsStat: document.getElementById('totalSongsStat'),
  currentPositionStat: document.getElementById('currentPositionStat'),
  integrityStat: document.getElementById('integrityStat'),
  playlistTableBody: document.getElementById('playlistTableBody'),
  form: document.getElementById('songForm'),
  songTitle: document.getElementById('songTitle'),
  songArtist: document.getElementById('songArtist'),
  songDuration: document.getElementById('songDuration'),
  songPosition: document.getElementById('songPosition'),
  songAudioUrl: document.getElementById('songAudioUrl'),
  formMessage: document.getElementById('formMessage'),
  clearPlaylistBtn: document.getElementById('clearPlaylistBtn'),
  searchInput: document.getElementById('searchInput'),
  linkedListVisualizer: document.getElementById('linkedListVisualizer'),
  operationLog: document.getElementById('operationLog'),
  playPauseBtn: document.getElementById('playPauseBtn'),
  prevTrackBtn: document.getElementById('prevTrackBtn'),
  nextTrackBtn: document.getElementById('nextTrackBtn'),
  progressBar: document.getElementById('progressBar'),
  volumeControl: document.getElementById('volumeControl'),
  currentTime: document.getElementById('currentTime'),
  totalDuration: document.getElementById('totalDuration'),
  albumArt: document.getElementById('albumArt'),
  audio: document.createElement('audio'),
};

dom.audio.setAttribute('preload', 'metadata');
document.body.appendChild(dom.audio);

const player = createPlayer(dom.audio, {
  onTrackEnded: () => {
    const next = playlist.nextSong();
    selectSong(next);
  },
  onPlaybackError: () => {
    setFormMessage('The selected audio file could not be played.', 'error');
  },
});

function setFormMessage(message, type = 'info') {
  dom.formMessage.textContent = message;
  dom.formMessage.className = `message ${type}`;
}

function formatDuration(totalSeconds) {
  const seconds = Number(totalSeconds) || 0;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function getCurrentSong() {
  return playlist.current;
}

function updateHeaderStats() {
  const currentSong = getCurrentSong();
  const totalSongs = playlist.getSize();
  const currentPosition = currentSong ? playlist.traverseForward().findIndex((song) => song.id === currentSong.id) + 1 : 0;

  dom.totalSongsStat.textContent = String(totalSongs);
  dom.currentPositionStat.textContent = String(currentPosition);

  const integrity = playlist.validateIntegrity();
  dom.integrityStat.textContent = integrity.valid ? 'OK' : 'ERROR';
  dom.integrityStat.classList.toggle('error', !integrity.valid);
}

function renderOperationLog() {
  dom.operationLog.innerHTML = '';

  if (!operationLog.length) {
    dom.operationLog.innerHTML = '<p class="empty-log">No operations yet.</p>';
    return;
  }

  operationLog.slice(0, 6).forEach((item) => {
    const entry = document.createElement('article');
    entry.className = 'log-entry';
    entry.innerHTML = `
      <h4>${item.title}</h4>
      <p><strong>Before:</strong> ${item.before}</p>
      <p><strong>After:</strong> ${item.after}</p>
      <p><strong>Explanation:</strong> ${item.explanation}</p>
    `;
    dom.operationLog.appendChild(entry);
  });
}

function logOperation(title, beforeText, afterText, explanationText) {
  operationLog.unshift({ title, before: beforeText, after: afterText, explanation: explanationText });
  operationLog.splice(6);
  renderOperationLog();
}

function getPlaylistSnapshotLabel() {
  return playlist.traverseForward().map((song) => song.title).join(' ⇄ ') || 'Empty playlist';
}

function captureHistoryState() {
  if (!history) {
    history = new HistoryManager(serializePlaylistState(playlist));
    return;
  }

  history.capture(serializePlaylistState(playlist));
}

function updateRecentlyDeletedStorage() {
  saveRecentlyDeleted(recentlyDeleted);
  renderRecentlyDeleted();
}

function renderRecentlyDeleted() {
  const container = document.getElementById('recentlyDeletedList');
  if (!container) {
    return;
  }

  if (!recentlyDeleted.length) {
    container.innerHTML = '<p class="empty-log">No deleted songs available for restore.</p>';
    return;
  }

  container.innerHTML = '';
  recentlyDeleted.forEach((record) => {
    const item = document.createElement('div');
    item.className = 'deleted-card';
    item.innerHTML = `
      <div>
        <strong>${record.title}</strong>
        <p>${record.artist} • ${formatDuration(record.duration)} • Position ${record.position}</p>
      </div>
      <button class="button soft" data-restore-id="${record.id}">Restore</button>
    `;
    container.appendChild(item);
  });

  container.querySelectorAll('[data-restore-id]').forEach((button) => {
    button.addEventListener('click', () => restoreDeletedSong(button.dataset.restoreId));
  });
}

function addRecentlyDeleted(song, position) {
  const existing = recentlyDeleted.find((item) => item.id === song.id);
  if (existing) {
    return;
  }

  recentlyDeleted.unshift({
    id: song.id,
    title: song.title,
    artist: song.artist,
    duration: Number(song.duration) || 0,
    audioUrl: song.audioUrl || '',
    audioFileId: song.audioFileId || null,
    position,
    deletedAt: new Date().toISOString(),
  });
  updateRecentlyDeletedStorage();
}

function removeRecentlyDeleted(songId) {
  recentlyDeleted = recentlyDeleted.filter((record) => record.id !== songId);
  updateRecentlyDeletedStorage();
}

function findSongById(songId) {
  return playlist.traverseForward().find((song) => song.id === songId) || null;
}

async function restoreDeletedSong(songId) {
  const record = recentlyDeleted.find((item) => item.id === songId);
  if (!record) {
    return false;
  }

  if (findSongById(songId)) {
    setFormMessage('This song is already present in the playlist.', 'info');
    return false;
  }

  const restoredSong = {
    id: record.id,
    title: record.title,
    artist: record.artist,
    duration: Number(record.duration) || 0,
    audioUrl: record.audioUrl || '',
    audioFileId: record.audioFileId || null,
  };

  const insertionPosition = Math.max(1, Number(record.position) || 1);
  const insertedNode = playlist.insertAtPosition(restoredSong, insertionPosition);
  if (!insertedNode) {
    return false;
  }

  if (restoredSong.audioFileId) {
    const restoredAudio = await awaitAudioFile(restoredSong.audioFileId, restoredSong.id);
    if (restoredAudio) {
      insertedNode.audioUrl = restoredAudio;
      insertedNode.audioFileId = restoredSong.audioFileId;
    }
  }

  logOperation(
    `Restore ${restoredSong.title}`,
    `Deleted record restored to position ${insertionPosition}`,
    getPlaylistSnapshotLabel(),
    'Reinsert the deleted song at the nearest valid index using the linked-list insertion logic.'
  );

  removeRecentlyDeleted(songId);
  captureHistoryState();
  selectSong(insertedNode);
  return true;
}

async function awaitAudioFile(fileId, songId) {
  if (!fileId) {
    return null;
  }

  const blob = await loadAudioBlob(fileId);
  if (!blob) {
    return null;
  }

  const url = URL.createObjectURL(blob);
  const match = findSongById(songId);
  if (match) {
    match.audioUrl = url;
    match.audioFileId = fileId;
  }
  return url;
}

function renderPlaylist() {
  const query = dom.searchInput.value.trim().toLowerCase();
  const songs = playlist.traverseForward();
  const visibleSongs = songs.filter((song) => song.title.toLowerCase().includes(query));

  dom.playlistTableBody.innerHTML = '';

  if (!visibleSongs.length) {
    dom.playlistTableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No matching songs</td></tr>';
    updateHeaderStats();
    return;
  }

  visibleSongs.forEach((song, index) => {
    const displayIndex = songs.findIndex((item) => item.id === song.id) + 1;
    const row = document.createElement('tr');
    row.classList.toggle('active-row', song.id === playlist.current?.id);

    row.innerHTML = `
      <td>${displayIndex}</td>
      <td>${song.title}</td>
      <td>${song.artist}</td>
      <td>${formatDuration(song.duration)}</td>
      <td>
        <div class="action-stack">
          <button class="tiny-btn" data-action="play" data-song-id="${song.id}">Play</button>
          <button class="tiny-btn" data-action="up" data-song-id="${song.id}">↑</button>
          <button class="tiny-btn" data-action="down" data-song-id="${song.id}">↓</button>
          <button class="tiny-btn danger" data-action="delete" data-song-id="${song.id}">Delete</button>
        </div>
      </td>
    `;

    dom.playlistTableBody.appendChild(row);
  });

  dom.playlistTableBody.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      const { action, songId } = button.dataset;
      const targetSong = playlist.traverseForward().find((song) => song.id === songId);
      if (!targetSong) {
        return;
      }

      if (action === 'play') {
        selectSong(targetSong);
      }

      if (action === 'delete') {
        deleteSongById(songId);
      }

      if (action === 'up' || action === 'down') {
        moveSongInList(songId, action === 'up' ? 'up' : 'down');
      }
    });
  });

  updateHeaderStats();
}

function selectSong(songNode) {
  if (!songNode) {
    return;
  }

  playlist.current = songNode;
  if (globalThis.localStorage) {
    localStorage.setItem('linkedbeats-current-song', songNode.id);
  }

  const currentPosition = playlist.traverseForward().findIndex((song) => song.id === songNode.id) + 1;
  dom.currentPositionStat.textContent = String(currentPosition);
  dom.currentSongTitle.textContent = songNode.title;
  dom.currentSongArtist.textContent = songNode.artist;
  dom.totalDuration.textContent = formatDuration(songNode.duration);
  dom.albumArt.innerHTML = '<span>♪</span>';

  if (songNode.audioUrl) {
    player.setSong(songNode);
    dom.playPauseBtn.textContent = player.isPlaying ? '❚❚' : '▶';
  } else {
    player.stop();
    player.currentSong = songNode;
    dom.playPauseBtn.textContent = '▶';
  }

  renderLinkedListVisualizer(dom.linkedListVisualizer, playlist);
  renderPlaylist();
  savePlaylist(playlist);
}

function persistAndRender() {
  savePlaylist(playlist);
  renderLinkedListVisualizer(dom.linkedListVisualizer, playlist);
  renderPlaylist();
  updateHeaderStats();
}

function addSong(song, position = null) {
  const beforeText = getPlaylistSnapshotLabel();
  let insertedNode;

  if (position !== null && Number(position) > 0) {
    insertedNode = playlist.insertAtPosition(song, Number(position));
  } else {
    insertedNode = playlist.appendSong(song);
  }

  if (!insertedNode) {
    return false;
  }

  playlist.current = insertedNode;
  const afterText = getPlaylistSnapshotLabel();
  logOperation(
    `Insert ${song.title} at position ${position || playlist.getSize()}`,
    beforeText,
    afterText,
    'Locate the insertion point, update the neighboring prev and next references, and increment the size counter.'
  );

  captureHistoryState();
  persistAndRender();
  return true;
}

function deleteSongById(songId) {
  const beforeText = getPlaylistSnapshotLabel();
  const target = playlist.traverseForward().find((song) => song.id === songId);
  if (!target) {
    return false;
  }

  const deletedPosition = playlist.traverseForward().findIndex((song) => song.id === songId) + 1;
  if (target.audioFileId && target.audioUrl.startsWith('blob:')) {
    URL.revokeObjectURL(target.audioUrl);
    deleteAudioBlob(target.audioFileId);
  }

  const deletedNode = playlist.deleteById(songId);
  if (!deletedNode) {
    return false;
  }

  addRecentlyDeleted({ ...target }, deletedPosition);

  const afterText = getPlaylistSnapshotLabel();
  logOperation(
    `Delete ${target.title}`,
    beforeText,
    afterText,
    'Disconnect the node from its previous and next links, reattach neighbors, and update the current pointer when needed.'
  );

  captureHistoryState();

  if (playlist.isEmpty()) {
    if (globalThis.localStorage) {
      localStorage.removeItem('linkedbeats-current-song');
    }
    dom.currentSongTitle.textContent = 'Select a song';
    dom.currentSongArtist.textContent = 'Artist name';
    dom.totalDuration.textContent = '0:00';
    dom.progressBar.value = 0;
    dom.currentTime.textContent = '0:00';
    dom.playPauseBtn.textContent = '▶';
  } else {
    const newCurrent = playlist.current || playlist.head;
    playlist.current = newCurrent;
    selectSong(newCurrent);
  }

  persistAndRender();
  return true;
}

function moveSongInList(songId, direction) {
  const songs = playlist.traverseForward();
  const index = songs.findIndex((song) => song.id === songId);
  if (index === -1) {
    return false;
  }

  if (direction === 'up' && index === 0) {
    return false;
  }

  if (direction === 'down' && index === songs.length - 1) {
    return false;
  }

  const beforeText = getPlaylistSnapshotLabel();
  const oldPosition = index + 1;
  const targetPosition = direction === 'up' ? index : index + 2;
  const moved = playlist.moveSong(oldPosition, targetPosition);
  if (!moved) {
    return false;
  }

  const afterText = getPlaylistSnapshotLabel();
  logOperation(
    `Move ${songs[index].title} to position ${targetPosition}`,
    beforeText,
    afterText,
    'Remove the song from its old link position, then splice it into the new index without rebuilding the whole list.'
  );
  captureHistoryState();
  persistAndRender();
  return true;
}

function handleFormSubmit(event) {
  event.preventDefault();
  const title = dom.songTitle.value.trim();
  const artist = dom.songArtist.value.trim();
  const duration = Number(dom.songDuration.value);
  const position = dom.songPosition.value.trim();
  const audioUrl = dom.songAudioUrl.value.trim();

  if (!title) {
    setFormMessage('Song title cannot be blank.', 'error');
    return;
  }

  if (!artist) {
    setFormMessage('Artist name cannot be blank.', 'error');
    return;
  }

  if (!Number.isFinite(duration) || duration <= 0) {
    setFormMessage('Duration must be a positive number in seconds.', 'error');
    return;
  }

  const newSong = {
    id: `song-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    title,
    artist,
    duration,
    audioUrl,
  };

  const insertPosition = position ? Number(position) : null;
  if (insertPosition !== null && (!Number.isInteger(insertPosition) || insertPosition < 1)) {
    setFormMessage('Position must be a positive integer.', 'error');
    return;
  }

  const added = addSong(newSong, insertPosition);
  if (!added) {
    setFormMessage('The song could not be inserted.', 'error');
    return;
  }

  dom.form.reset();
  setFormMessage('Song added successfully.', 'success');
  selectSong(playlist.current);
}

function clearPlaylist() {
  if (!playlist.getSize()) {
    setFormMessage('The playlist is already empty.', 'info');
    return;
  }

  const confirmed = window.confirm('Clear the full playlist? This action cannot be undone.');
  if (!confirmed) {
    return;
  }

  const beforeText = getPlaylistSnapshotLabel();
  const clearedSongs = playlist.traverseForward().map((song) => ({ ...song }));
  clearedSongs.forEach((song, index) => addRecentlyDeleted(song, index + 1));
  playlist.clearPlaylist();
  const afterText = 'Empty playlist';
  logOperation(
    'Clear Playlist',
    beforeText,
    afterText,
    'Reset the head, tail, current pointer, and size to empty state while removing every song node.'
  );

  captureHistoryState();

  if (globalThis.localStorage) {
    localStorage.removeItem('linkedbeats-current-song');
  }

  dom.currentSongTitle.textContent = 'Select a song';
  dom.currentSongArtist.textContent = 'Artist name';
  dom.totalDuration.textContent = '0:00';
  dom.currentTime.textContent = '0:00';
  dom.progressBar.value = 0;
  dom.playPauseBtn.textContent = '▶';
  setFormMessage('Playlist cleared.', 'success');
  persistAndRender();
}

async function restoreFromStorage() {
  const savedSongs = loadPlaylist();
  if (!savedSongs.length) {
    demoSongs.forEach((song) => playlist.appendSong(song));
    playlist.current = playlist.head;
    recentlyDeleted = loadRecentlyDeleted();
    history = new HistoryManager(serializePlaylistState(playlist));
    return;
  }

  savedSongs.forEach((song) => {
    const restoredSong = { ...song, audioUrl: song.audioUrl || '' };
    playlist.appendSong(restoredSong);
  });

  for (const song of savedSongs) {
    if (song.audioFileId) {
      const blob = await loadAudioBlob(song.audioFileId);
      if (blob) {
        const match = playlist.traverseForward().find((node) => node.id === song.id);
        if (match) {
          match.audioFileId = song.audioFileId;
          match.audioUrl = URL.createObjectURL(blob);
        }
      }
    }
  }

  const currentSongId = globalThis.localStorage ? localStorage.getItem('linkedbeats-current-song') : null;
  const currentSong = savedSongs.find((song) => song.id === currentSongId);
  if (currentSong) {
    const listNode = playlist.traverseForward().find((song) => song.id === currentSong.id);
    if (listNode) {
      playlist.current = listNode;
    }
  }

  if (!playlist.current) {
    playlist.current = playlist.head;
  }

  recentlyDeleted = loadRecentlyDeleted();
  history = new HistoryManager(serializePlaylistState(playlist));
}

function setupExpertControls() {
  dom.form.addEventListener('submit', handleFormSubmit);
  dom.clearPlaylistBtn.addEventListener('click', clearPlaylist);
  dom.searchInput.addEventListener('input', renderPlaylist);

  document.getElementById('searchSongBtn').addEventListener('click', () => {
    const searchText = document.getElementById('searchInput').value.trim();
    const match = playlist.searchByTitle(searchText);
    if (!searchText) {
      setFormMessage('Please enter a title to search for.', 'info');
      return;
    }
    if (!match) {
      setFormMessage(`No song titled "${searchText}" was found.`, 'error');
      return;
    }
    selectSong(match);
    setFormMessage(`Found song: ${match.title}`, 'success');
  });

  document.getElementById('deleteFirstBtn').addEventListener('click', () => {
    if (!playlist.head) {
      setFormMessage('The playlist is empty.', 'info');
      return;
    }
    deleteSongById(playlist.head.id);
  });

  document.getElementById('deleteLastBtn').addEventListener('click', () => {
    if (!playlist.tail) {
      setFormMessage('The playlist is empty.', 'info');
      return;
    }
    deleteSongById(playlist.tail.id);
  });

  document.getElementById('undoBtn').addEventListener('click', () => {
    if (!history) {
      return;
    }
    const previousState = history.undo();
    if (!previousState) {
      setFormMessage('Nothing to undo.', 'info');
      return;
    }
    restorePlaylistState(playlist, previousState);
    setFormMessage('Undo complete.', 'success');
    persistAndRender();
    const restoredCurrent = playlist.current || playlist.head;
    if (restoredCurrent) {
      selectSong(restoredCurrent);
    }
  });

  document.getElementById('redoBtn').addEventListener('click', () => {
    if (!history) {
      return;
    }
    const nextState = history.redo();
    if (!nextState) {
      setFormMessage('Nothing to redo.', 'info');
      return;
    }
    restorePlaylistState(playlist, nextState);
    setFormMessage('Redo complete.', 'success');
    persistAndRender();
    const restoredCurrent = playlist.current || playlist.head;
    if (restoredCurrent) {
      selectSong(restoredCurrent);
    }
  });

  document.getElementById('uploadMusicBtn').addEventListener('click', () => {
    document.getElementById('musicUploadInput').click();
  });

  document.getElementById('musicUploadInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'];
    if (!validTypes.includes(file.type) && !/\.(mp3|wav|ogg|m4a)$/i.test(file.name)) {
      setFormMessage('Please upload a valid audio file in MP3, WAV, OGG, or M4A format.', 'error');
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setFormMessage('Audio file size exceeds 30 MB. Please choose a smaller file.', 'error');
      return;
    }

    const songId = `song-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const safeTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Uploaded Track';
    const uploadedSong = {
      id: songId,
      title: safeTitle,
      artist: 'Uploaded Artist',
      duration: 0,
      audioUrl: '',
      audioFileId: songId,
    };

    const objectUrl = URL.createObjectURL(file);
    uploadedSong.audioUrl = objectUrl;

    const stored = await saveAudioBlob(songId, file);
    if (!stored) {
      setFormMessage('Audio upload failed to be stored in IndexedDB. The song was not saved.', 'error');
      URL.revokeObjectURL(objectUrl);
      return;
    }

    const insertedNode = playlist.appendSong(uploadedSong);
    playlist.current = insertedNode;
    captureHistoryState();
    persistAndRender();
    selectSong(insertedNode);
    setFormMessage('Uploaded audio stored successfully.', 'success');
  });

  dom.playPauseBtn.addEventListener('click', () => {
    const currentSong = getCurrentSong();
    if (!currentSong) {
      return;
    }

    if (!currentSong.audioUrl) {
      setFormMessage('This song does not have a playable audio file. Select another track to play audio.', 'info');
      return;
    }

    if (!player.audio.src || player.audio.src !== currentSong.audioUrl) {
      player.setSong(currentSong);
    }

    const isPlaying = player.togglePlayback();
    dom.playPauseBtn.textContent = isPlaying && player.isPlaying ? '❚❚' : '▶';
  });

  dom.prevTrackBtn.addEventListener('click', () => {
    const previousSong = playlist.previousSong();
    if (previousSong) {
      selectSong(previousSong);
    }
  });

  dom.nextTrackBtn.addEventListener('click', () => {
    const nextSong = playlist.nextSong();
    if (nextSong) {
      selectSong(nextSong);
    }
  });

  dom.volumeControl.addEventListener('input', (event) => {
    dom.audio.volume = Number(event.target.value);
  });

  dom.progressBar.addEventListener('input', (event) => {
    const progress = Number(event.target.value);
    if (!dom.audio.duration || Number.isNaN(dom.audio.duration)) {
      return;
    }

    dom.audio.currentTime = (progress / 100) * dom.audio.duration;
  });

  dom.audio.addEventListener('timeupdate', () => {
    if (!dom.audio.duration || Number.isNaN(dom.audio.duration)) {
      return;
    }

    const progressPercent = (dom.audio.currentTime / dom.audio.duration) * 100;
    dom.progressBar.value = String(progressPercent);
    dom.currentTime.textContent = formatDuration(dom.audio.currentTime);
  });
}

async function initializeApp() {
  await restoreFromStorage();
  setupExpertControls();
  renderRecentlyDeleted();
  const firstSong = playlist.current || playlist.head;
  if (firstSong) {
    selectSong(firstSong);
  }
  renderLinkedListVisualizer(dom.linkedListVisualizer, playlist);
  renderPlaylist();
}

initializeApp();
