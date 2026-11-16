# LinkedBeats Test Cases

This document lists the functional test cases for the doubly linked list implementation.

## 1. Delete from empty list
- Create an empty list.
- Attempt deleteById on a missing id.
- Expected result: null and size remains 0.

## 2. Insert first song
- Insert a single song into an empty list.
- Expected result: head, tail, and current all point to the same node.

## 3. Append multiple songs
- Append three songs.
- Expected result: traversal matches insertion order.

## 4. Insert in middle
- Insert one song at position 2.
- Expected result: list order is updated correctly.

## 5. Delete a middle node
- Delete a song not at head or tail.
- Expected result: the neighbors reconnect correctly.

## 6. Search nonexistent song
- Search for a title not present.
- Expected result: null.

## 7. Traverse forward and backward
- Verify both traversal operations are correct.
- Expected result: forward and backward orders are reversed.

## 8. Delete current song
- Set current pointer to an internal node.
- Delete the current node.
- Expected result: current pointer updates to next or previous node.

## 9. Navigate at boundaries
- Move previous at head and next at tail.
- Expected result: boundary navigation remains stable.

## 10. Move song to a new position
- Move an internal song from one index to another.
- Expected result: list order changes correctly.

## 11. Delete only remaining node
- Create a single-node list, delete it.
- Expected result: head, tail, current all reset to null and size is 0.

## 12. Validate repeated insertions and deletions
- Insert and delete multiple songs repeatedly.
- Expected result: validateIntegrity() returns valid and the traversal is consistent.
