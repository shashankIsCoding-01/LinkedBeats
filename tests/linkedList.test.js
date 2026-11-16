import test from 'node:test';
import assert from 'node:assert/strict';
import DoublyLinkedList from '../js/DoublyLinkedList.js';
import { HistoryManager, serializePlaylistState, restorePlaylistState } from '../js/history.js';

function makeSong(title, artist = 'Artist', duration = 180, id = title) {
  return {
    id,
    title,
    artist,
    duration,
    audioUrl: '',
  };
}

test('Test 1: Delete a song from an empty list', () => {
  const list = new DoublyLinkedList();
  const result = list.deleteById('missing');
  assert.equal(result, null);
  assert.equal(list.getSize(), 0);
  assert.equal(list.validateIntegrity().valid, true);
});

test('Test 2: Insert the first song', () => {
  const list = new DoublyLinkedList();
  const firstSong = makeSong('Alpha', 'Artist A', 200, 'a1');
  const node = list.appendSong(firstSong);

  assert.equal(node.title, 'Alpha');
  assert.equal(list.getSize(), 1);
  assert.equal(list.head.id, 'a1');
  assert.equal(list.tail.id, 'a1');
  assert.equal(list.current.id, 'a1');
});

test('Test 3: Append multiple songs', () => {
  const list = new DoublyLinkedList();
  ['Alpha', 'Beta', 'Gamma'].forEach((title, index) => list.appendSong(makeSong(title, 'Artist', 100 + index * 10, title)));

  const titles = list.traverseForward().map((song) => song.title);
  assert.deepEqual(titles, ['Alpha', 'Beta', 'Gamma']);
  assert.equal(list.getSize(), 3);
  assert.equal(list.head.title, 'Alpha');
  assert.equal(list.tail.title, 'Gamma');
});

test('Test 4: Insert a song in the middle', () => {
  const list = new DoublyLinkedList();
  ['Alpha', 'Beta', 'Gamma'].forEach((title, index) => list.appendSong(makeSong(title, 'Artist', 100 + index * 10, title)));

  const inserted = list.insertAtPosition(makeSong('Delta', 'Artist', 160, 'delta'), 2);

  assert.equal(inserted.title, 'Delta');
  assert.deepEqual(list.traverseForward().map((song) => song.title), ['Alpha', 'Delta', 'Beta', 'Gamma']);
  assert.equal(list.getSize(), 4);
});

test('Test 5: Delete a middle node', () => {
  const list = new DoublyLinkedList();
  ['Alpha', 'Beta', 'Gamma', 'Delta'].forEach((title, index) => list.appendSong(makeSong(title, 'Artist', 100 + index * 10, title)));

  const deleted = list.deleteById('Beta');

  assert.equal(deleted.title, 'Beta');
  assert.deepEqual(list.traverseForward().map((song) => song.title), ['Alpha', 'Gamma', 'Delta']);
  assert.equal(list.getSize(), 3);
});

test('Test 6: Search for a nonexistent song', () => {
  const list = new DoublyLinkedList();
  ['Alpha', 'Beta', 'Gamma'].forEach((title) => list.appendSong(makeSong(title, 'Artist', 100, title)));

  const result = list.searchByTitle('Zeta');
  assert.equal(result, null);
});

test('Test 7: Traverse forward and backward', () => {
  const list = new DoublyLinkedList();
  ['Alpha', 'Beta', 'Gamma'].forEach((title) => list.appendSong(makeSong(title, 'Artist', 100, title)));

  const forward = list.traverseForward().map((song) => song.title);
  const backward = list.traverseBackward().map((song) => song.title);

  assert.deepEqual(forward, ['Alpha', 'Beta', 'Gamma']);
  assert.deepEqual(backward, ['Gamma', 'Beta', 'Alpha']);
});

test('Test 8: Delete the current song', () => {
  const list = new DoublyLinkedList();
  ['Alpha', 'Beta', 'Gamma'].forEach((title) => list.appendSong(makeSong(title, 'Artist', 100, title)));
  list.current = list.getNodeAtPosition(2);

  const deleted = list.deleteById(list.current.id);

  assert.equal(deleted.title, 'Beta');
  assert.equal(list.current.title, 'Gamma');
  assert.deepEqual(list.traverseForward().map((song) => song.title), ['Alpha', 'Gamma']);
});

test('Test 9: Navigate at playlist boundaries', () => {
  const list = new DoublyLinkedList();
  ['Alpha', 'Beta', 'Gamma'].forEach((title) => list.appendSong(makeSong(title, 'Artist', 100, title)));

  list.current = list.head;
  assert.equal(list.previousSong().title, 'Alpha');
  assert.equal(list.nextSong().title, 'Beta');
  list.current = list.tail;
  assert.equal(list.nextSong().title, 'Gamma');
  list.current = list.head;
  assert.equal(list.previousSong().title, 'Alpha');
});

test('Test 10: Move a song to a new position', () => {
  const list = new DoublyLinkedList();
  ['Alpha', 'Beta', 'Gamma', 'Delta'].forEach((title) => list.appendSong(makeSong(title, 'Artist', 100, title)));

  const moved = list.moveSong(2, 4);

  assert.equal(moved, true);
  assert.deepEqual(list.traverseForward().map((song) => song.title), ['Alpha', 'Gamma', 'Delta', 'Beta']);
});

test('Test 11: Delete the only remaining node', () => {
  const list = new DoublyLinkedList();
  const onlySong = makeSong('Solo', 'Artist', 120, 'solo');
  list.appendSong(onlySong);

  const deleted = list.deleteById('solo');

  assert.equal(deleted.title, 'Solo');
  assert.equal(list.getSize(), 0);
  assert.equal(list.head, null);
  assert.equal(list.tail, null);
  assert.equal(list.current, null);
});

test('Test 12: Validate node links after repeated insertions and deletions', () => {
  const list = new DoublyLinkedList();

  ['One', 'Two', 'Three', 'Four', 'Five'].forEach((title) => list.appendSong(makeSong(title, 'Artist', 100, title)));
  list.insertAtPosition(makeSong('Inserted', 'Artist', 140, 'inserted'), 3);
  list.deleteById('Two');
  list.deleteById('Five');

  const integrity = list.validateIntegrity();
  assert.equal(integrity.valid, true);
  assert.deepEqual(list.traverseForward().map((song) => song.title), ['One', 'Inserted', 'Three', 'Four']);
  assert.equal(list.getSize(), 4);
});

test('Undo/Redo history restores the prior playlist state', () => {
  const list = new DoublyLinkedList();
  const history = new HistoryManager(serializePlaylistState(list));

  ['One', 'Two'].forEach((title) => list.appendSong(makeSong(title, 'Artist', 100, title)));
  history.capture(serializePlaylistState(list));
  list.appendSong(makeSong('Three', 'Artist', 120, 'three'));
  history.capture(serializePlaylistState(list));

  const undone = history.undo();
  restorePlaylistState(list, undone);
  assert.deepEqual(list.traverseForward().map((song) => song.title), ['One', 'Two']);

  const redone = history.redo();
  restorePlaylistState(list, redone);
  assert.deepEqual(list.traverseForward().map((song) => song.title), ['One', 'Two', 'Three']);
});

test('Recently deleted song metadata can be restored without duplicating IDs', () => {
  const list = new DoublyLinkedList();
  const song = makeSong('Gamma', 'Artist', 170, 'gamma');
  list.appendSong(song);

  const deletedRecord = {
    id: song.id,
    title: song.title,
    artist: song.artist,
    duration: song.duration,
    audioUrl: '',
    audioFileId: null,
    position: 1,
    deletedAt: '2026-11-17T00:00:00.000Z',
  };

  const restored = { ...deletedRecord };
  list.clearPlaylist();
  list.appendSong(restored);
  assert.equal(list.getSize(), 1);
  assert.equal(list.traverseForward()[0].id, 'gamma');
});
