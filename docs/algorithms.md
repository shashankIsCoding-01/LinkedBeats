# LinkedBeats Algorithms and Concepts

## 1. Doubly Linked List Overview
A doubly linked list stores each song as a node that points to the previous and next node. This allows efficient navigation both forward and backward and makes insertion and deletion easier than with a plain array in certain situations.

Each node stores:
- id
- title
- artist
- duration
- audioUrl
- prev
- next

The list also keeps references to:
- head: first node
- tail: last node
- current: active or selected node
- size: total song count

## 2. Why Doubly Linked List Fits a Playlist
A playlist benefits from:
- walking from one song to the next
- walking backward to the previous song
- inserting songs at a specific position
- deleting any song without reordering the whole collection

The linked list avoids shifting every item, which is important in an app where a selected song may be removed or moved.

## 3. Core Operations

### Insert at head
1. Create a new node.
2. Set the new node's next to the current head.
3. Set the current head's prev to the new node.
4. Update head to the new node.
5. Update size.

Time complexity: O(1)

### Insert at tail
1. Create a new node.
2. Set the current tail's next to the new node.
3. Set the new node's prev to the current tail.
4. Update tail to the new node.
5. Update size.

Time complexity: O(1)

### Search by title
Traverse from head to tail until a matching node is found.

Time complexity: O(n)

### Delete by id
1. Locate the node using the unique id.
2. Reconnect previous.next and next.prev.
3. Update head or tail if needed.
4. Set current pointer to the next, previous, or null node.
5. Decrement size.

Time complexity: O(n) in the general case, because the node must be found.

## 4. Complexity Summary
- Insert at head: O(1)
- Insert at tail with tail pointer: O(1)
- Delete head: O(1)
- Delete tail with tail pointer: O(1)
- Search by title: O(n)
- Insert at arbitrary position: O(n)
- Forward traversal: O(n)
- Backward traversal: O(n)
- Next/Previous with current pointer: O(1)
- Storage: O(n)

## 5. Comparison: Doubly vs Singly Linked List
A singly linked list stores only next pointers. A doubly linked list stores both next and previous pointers.

### Advantages of doubly linked list
- easy backward traversal
- easier deletion when previous node is needed
- convenient current-track navigation in music playlist apps

### Trade-offs
- extra pointer memory per node
- slightly more complex pointer updates
- more bookkeeping during insertion and deletion

## 6. Beginner-Friendly Pseudocode
```text
APPEND(song):
    create node
    if list is empty:
        head = node
        tail = node
        current = node
    else:
        tail.next = node
        node.prev = tail
        tail = node
    size = size + 1
```

```text
DELETE_BY_ID(id):
    find node
    if previous exists:
        previous.next = next
    else:
        head = next

    if next exists:
        next.prev = previous
    else:
        tail = previous

    update current pointer
    size = size - 1
```

```text
NEXT_SONG():
    if current.next exists:
        current = current.next
```

```text
PREVIOUS_SONG():
    if current.prev exists:
        current = current.prev
```
