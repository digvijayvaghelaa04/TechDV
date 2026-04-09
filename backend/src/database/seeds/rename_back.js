const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\dv735\\Downloads\\TechDV\\cd\\cource-data\\java-script\\videos';

const originalNames = [
    "JavaScript Full Course - Variables & Data Types  Lecture 1.mp4",
    "Last Lecture  Fetch API with Project  JavaScript Full Course.mp4",
    "Lecture 10  MiniProject - Stone, Paper & Scissors Game  JavaScript Full Course.mp4",
    "Lecture 11  Classes & Objects  JavaScript Full Course.mp4",
    "Lecture 12  Callbacks, Promises & Async Await  JavaScript Full Course.mp4",
    "Lecture 2  Operators and Conditional Statements  JavaScript Full Course.mp4",
    "Lecture 3 Loops and Strings  JavaScript Full Course.mp4",
    "Lecture 4 Arrays  JavaScript Full Course.mp4",
    "Lecture 5 Functions & Methods  JavaScript Full Course.mp4",
    "Lecture 6  DOM - Document Object Model  JavaScript Full Course  Part 1.mp4",
    "Lecture 7  DOM (Part 2)  Document Object Model  JavaScript Full Course.mp4",
    "Lecture 8  Events in JavaScript  JavaScript Full Course.mp4",
    "Lecture 9  Tic Tac Toe Game in JavaScript  JS Project  JavaScript Full Course.mp4"
];

const currentFiles = [
    'lesson_1.mp4', 'lesson_2.mp4', 'lesson_3.mp4', 'lesson_4.mp4', 'lesson_5.mp4',
    'lesson_6.mp4', 'lesson_7.mp4', 'lesson_8.mp4', 'lesson_9.mp4', 'lesson_10.mp4',
    'lesson_11.mp4', 'lesson_12.mp4', 'lesson_13.mp4'
];

for (let i = 0; i < currentFiles.length; i++) {
    const oldPath = path.join(dir, currentFiles[i]);
    const newPath = path.join(dir, originalNames[i]);
    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
    }
}
console.log("Renamed back!");
