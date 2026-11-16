# LinkedBeats Report Notes

## 1. Abstract
LinkedBeats is a static web application designed to demonstrate how a doubly linked list can be used to manage a music playlist. The project emphasizes data-structure correctness, pointer manipulation, playlist navigation, and educational explanation in a beginner-friendly format. It combines a modern UI with a real linked-list backend instead of using arrays as the main storage structure.

## 2. Problem Statement
Students often learn linked lists in theory but struggle to apply them to real systems. A music playlist is a practical and intuitive example because it involves ordering, insertion, deletion, and movement of songs. This project addresses that gap by implementing a fully functional playlist manager using a doubly linked list.

## 3. Objectives
- implement a doubly linked list from scratch
- use it to manage playlist operations
- provide visualization of node links and pointer updates
- allow playlist navigation and insertion/deletion operations
- document algorithmic complexity and educational concepts
- create a browser-based project suitable for academic submission

## 4. Functional Requirements
The application must support song insertion, deletion, search, position-based insertion, playback navigation, visual list representation, and data persistence using localStorage. It must also provide a clean user interface suitable for desktop and mobile devices.

## 5. Scope and Assumptions
This project assumes a browser environment with JavaScript enabled. Audio playback is optional and depends on user-provided or valid audio URLs. The playlist uses localStorage for convenience, but it does not persist temporary browser object URLs or non-serializable data.

## 6. Data Structure Selection
A doubly linked list is selected because the playlist requires both forward and backward navigation. Unlike a singly linked list, it stores both previous and next references and makes deletion of arbitrary nodes easier when the previous node is known.

## 7. Comparison with Singly Linked List
A singly linked list supports traversal only in one direction and requires more careful pointer management for certain deletions. A doubly linked list stores a prev pointer in addition to next, making backward movement and previous-node updates simpler and more direct.

## 8. Node Design
Each node stores a unique id, song title, artist, duration, optional audio URL, and references to previous and next nodes. This structure allows the list to maintain order while also supporting quick traversal and safe disconnection when songs are removed.

## 9. Algorithms and Pseudocode
The core operations include append, prepend, insertAtPosition, deleteById, searchByTitle, nextSong, previousSong, and moveSong. Each method works by updating node references instead of reconstructing the whole list whenever possible.

## 10. Implementation Overview
The project is implemented using static HTML, CSS, and JavaScript modules. The playlist logic sits in a custom class, while the UI handles form validation, player behavior, and visualization updates.

## 11. Dry Run of Operations
Example operations:
1. Insert song A at head.
2. Append song B and C.
3. Insert D at position 2.
4. Delete song B.
5. Move song C to a new position.

Each step updates neighboring links in the actual linked-list structure and updates the visualizer immediately.

## 12. Time and Space Complexity
The design follows standard linked-list complexity:
- insertion at head: O(1)
- insertion at tail: O(1)
- search: O(n)
- arbitrary-position insert: O(n)
- traversal: O(n)
- storage: O(n)

## 13. Test-Case Documentation
The repository includes at least twelve unit tests covering empty lists, insertion, deletion, search, traversal, navigation, movement, and validation rules. These tests validate the actual implementation rather than a simulated structure.

## 14. Sustainability Analysis
This project has a low environmental footprint because it uses a simple static website and no backend infrastructure. It avoids unnecessary dependency overhead and reduces the need for servers or cloud processing for a basic microproject.

## 15. SDG Alignment
This project aligns with SDG 4: Quality Education, because it provides an accessible, interactive way to learn data structures and algorithmic thinking. It also supports digital literacy and practical engineering education in a resource-efficient way.

## 16. Limitations
- The project is a static browser app without a server-side database.
- Audio playback depends on valid media URLs.
- The interface is designed for educational demonstration rather than production-scale streaming.

## 17. Future Improvements
Potential improvements include:
- drag-and-drop reordering
- playlist export/import
- richer visual animation for pointer updates
- keyboard navigation and screen-reader improvements
- integration with real audio sources in a browser-friendly way

## 18. Conclusion
LinkedBeats demonstrates the practical value of a doubly linked list in a familiar context: a music playlist manager. The project balances academic correctness with a clean, professional UI and beginner-friendly explanations, making it suitable for a second-year engineering microproject.

## 19. References
- Data Structures and Algorithms textbooks
- Classroom notes on linked lists and pointer manipulation
- Web browser documentation for HTML5 Audio API and localStorage

## 20. Individual Contribution Placeholders
- Student Name: Shashank Mishra
- Roll Number: 41
- Role: Developer and Project Contributor
- Contribution Summary: Designed and implemented the complete LinkedBeats playlist application, including the doubly linked list logic, UI, player, visualizer, and academic documentation.
- Date: 2026-11-16
- Mentor Verification: Mrs. Vidya Zope

### Sustainability and responsible use
The application uses open educational content, avoids copyrighted media by default, and avoids unnecessary network or storage use. It is suitable as a demonstration platform for learning and academic reporting.
