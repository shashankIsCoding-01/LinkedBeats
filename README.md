# LinkedBeats

LinkedBeats is a beginner-friendly academic microproject that demonstrates a music playlist manager built with a manually implemented doubly linked list.

## Overview
This project uses a real doubly linked list as the main storage structure for songs. Instead of storing songs in an array as the primary data structure, each song is stored in a node with prev and next references. The site also includes a player, playlist manager, visualizer, operation log, and educational explanations.

## Features
- doubly linked list implementation from scratch
- song insertion at head, tail, and arbitrary positions
- deletion by id and position-aware movement
- forward and backward traversal
- current-pointer navigation
- playlist search and validation
- linked-list visualizer with head, tail, and current indicators
- localStorage persistence for playlist state
- responsive dark-themed interface

## Technologies
- HTML5
- CSS3
- Vanilla JavaScript ES6+
- Browser localStorage
- Node.js test runner for data-structure validation

## Data Structure Explanation
Each node contains:
- id
- title
- artist
- duration
- audioUrl
- prev
- next

The list maintains:
- head
- tail
- current
- size

A basic node diagram is shown below:

```text
HEAD → [Song A] ⇄ [Song B] ⇄ [Song C] ← TAIL
       ^             ^
       |             |
     prev          next
```

## Installation
1. Clone or download the project.
2. Open the folder in a code editor.
3. Use a local static web server to view the app.

## Running Instructions
From the project root:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Test Instructions
Run the unit tests with:

```bash
npm test
```

## Project Structure
```text
linkedbeats/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── SongNode.js
│   ├── DoublyLinkedList.js
│   ├── app.js
│   ├── player.js
│   ├── visualizer.js
│   └── storage.js
├── tests/
│   └── linkedList.test.js
├── docs/
│   ├── algorithms.md
│   ├── test-cases.md
│   └── report-notes.md
├── README.md
├── .gitignore
├── LICENSE
└── package.json
```

## Complexity Analysis
- Insert at head: O(1)
- Insert at tail with tail pointer: O(1)
- Delete head: O(1)
- Delete tail with tail pointer: O(1)
- Search: O(n)
- Insert at arbitrary position: O(n)
- Forward traversal: O(n)
- Backward traversal: O(n)
- Next/Previous using current pointer: O(1)
- Storage: O(n)

## Screenshots
Add screenshots here during GitHub deployment or academic submission.

Example placeholder:
- Home screen with playlist manager and player
- Linked list visualizer with node connections
- Operation log and complexity section

## GitHub Pages Deployment
1. Push this folder to GitHub.
2. Open the repository settings.
3. Navigate to Pages.
4. Select the main branch and root folder.
5. Save the deployment.

The project will be available at a GitHub Pages URL such as:

```text
https://<your-username>.github.io/<repository-name>/
```

## Academic Learning Outcomes
Students will learn:
- linked-list theory and implementation
- pointer manipulation and node connection logic
- insertion, deletion, and traversal operations
- complexity analysis
- practical UI integration with data structures

## License
This project is distributed under the MIT License.
