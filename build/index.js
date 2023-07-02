/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/animate.ts":
/*!************************!*\
  !*** ./src/animate.ts ***!
  \************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.startShortestPathAnimation = exports.startVisitedNodesAnimations = void 0;
const timer_1 = __importDefault(__webpack_require__(/*! ./timer */ "./src/timer.ts"));
const constants_1 = __webpack_require__(/*! ./constants */ "./src/constants.ts");
function startTimer(nodesToAnimate, index, time, animationType, callback) {
    return new timer_1.default(() => {
        const node = nodesToAnimate[index];
        const currentElement = document.getElementById(node.id);
        if (!currentElement) {
            throw new Error('Unfound node');
        }
        currentElement.classList.remove('unvisited');
        if (animationType === 'travel') {
            currentElement.classList.add('current');
        }
        else {
            currentElement.classList.add('shortest-path');
        }
        if (animationType === 'travel' && index >= 1) {
            const previous = nodesToAnimate[index - 1];
            const previousElement = document.getElementById(previous.id);
            if (!previousElement) {
                throw new Error('Unfound node');
            }
            previousElement.classList.remove('current');
            previousElement.classList.add('visited');
        }
        callback === null || callback === void 0 ? void 0 : callback(index);
    }, time, animationType);
}
function startVisitedNodesAnimations(nodesToAnimate, speed, callback) {
    const timers = [];
    for (let i = 0; i < nodesToAnimate.length; i++) {
        timers.push(startTimer(nodesToAnimate, i, (i + 1) * constants_1.SPEED_MAPPING[speed].time, 'travel', callback));
    }
    return timers;
}
exports.startVisitedNodesAnimations = startVisitedNodesAnimations;
function startShortestPathAnimation(endNode, nodeMap, speed, callback) {
    var _a, _b;
    const shortestPathsToAnimate = [];
    let previousNode = endNode.previous;
    while (previousNode !== null) {
        shortestPathsToAnimate.unshift(previousNode);
        previousNode = (_b = (_a = nodeMap.get(previousNode.id)) === null || _a === void 0 ? void 0 : _a.previous) !== null && _b !== void 0 ? _b : null;
    }
    const timers = [];
    for (let i = 0; i < shortestPathsToAnimate.length; i++) {
        timers.push(startTimer(shortestPathsToAnimate, i, (i + 1) * constants_1.SPEED_MAPPING[speed].pathTime, 'shortest-path', callback));
    }
    return timers;
}
exports.startShortestPathAnimation = startShortestPathAnimation;


/***/ }),

/***/ "./src/bfs.ts":
/*!********************!*\
  !*** ./src/bfs.ts ***!
  \********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const helpers_1 = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");
function bfsAlgorithm(startId, endId, nodeMap, nodesToAnimate) {
    const queue = [nodeMap.get(startId)];
    const visited = new Map();
    visited.set(startId, true);
    while (queue.length > 0) {
        const current = queue.shift();
        if (typeof current === 'undefined') {
            break;
        }
        nodesToAnimate.push(current);
        current.status = 'visited';
        if (current.id === endId) {
            return current;
        }
        const neighbours = (0, helpers_1.getNeighbours)(current.id, nodeMap);
        for (const neighbour of neighbours) {
            if (!visited.has(neighbour.id)) {
                visited.set(neighbour.id, true);
                neighbour.previous = current;
                queue.push(neighbour);
            }
        }
    }
    return null;
}
exports["default"] = bfsAlgorithm;


/***/ }),

/***/ "./src/board.ts":
/*!**********************!*\
  !*** ./src/board.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const node_1 = __importDefault(__webpack_require__(/*! ./node */ "./src/node.ts"));
const dfs_1 = __importDefault(__webpack_require__(/*! ./dfs */ "./src/dfs.ts"));
const bfs_1 = __importDefault(__webpack_require__(/*! ./bfs */ "./src/bfs.ts"));
const helpers_1 = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");
class Board {
    constructor(_boardNode) {
        this.boardNode = _boardNode;
        this.setInitialCoordinates();
        this.dragging = { start: false, end: false };
        this.isCreatingWall = false;
        this.createGrid();
        this.addEventListeners();
    }
    setInitialCoordinates() {
        const { height, width } = this.boardNode.getBoundingClientRect();
        this.height = height / 28;
        this.width = width / 28;
        const startCoords = [
            Math.floor(this.height / 2),
            Math.floor(this.width / 4),
        ];
        this.startId = (0, helpers_1.createNodeId)(startCoords[0], startCoords[1]);
        const endCoords = [
            Math.floor(this.height / 2),
            3 * Math.floor(this.width / 4),
        ];
        this.endId = (0, helpers_1.createNodeId)(endCoords[0], endCoords[1]);
    }
    createGrid() {
        this.nodeMap = new Map();
        this.nodesToAnimate = [];
        let tableHtml = '';
        for (let r = 0; r < this.height; r++) {
            let currentRow = '';
            for (let c = 0; c < this.width; c++) {
                const nodeId = (0, helpers_1.createNodeId)(r, c);
                let nodeStatus = 'unvisited';
                if (nodeId === this.startId) {
                    nodeStatus = 'start';
                    this.startId = nodeId;
                }
                else if (nodeId === this.endId) {
                    nodeStatus = 'end';
                    this.endId = nodeId;
                }
                currentRow += `<td id=${nodeId} class=${nodeStatus}></td>`;
                const node = new node_1.default(r, c, nodeId, nodeStatus);
                this.nodeMap.set(nodeId, node);
            }
            tableHtml += `<tr id="row ${r}">${currentRow}</tr>`;
        }
        this.boardNode.innerHTML = tableHtml;
    }
    addEventListeners() {
        this.boardNode.addEventListener('mousedown', event => {
            const element = event.target;
            const node = this.nodeMap.get(element.id);
            if (!node) {
                return;
            }
            if (node.status === 'start') {
                this.dragging.start = true;
            }
            else if (node.status === 'end') {
                this.dragging.end = true;
            }
            else if (node.status === 'wall') {
                this.changeNodeElement(element.id, 'unvisited');
            }
            else {
                this.isCreatingWall = true;
            }
        });
        this.boardNode.addEventListener('mouseup', () => {
            this.dragging = { start: false, end: false };
            this.isCreatingWall = false;
        });
        this.boardNode.addEventListener('mousemove', event => {
            const element = event.target;
            if (this.dragging.start || this.dragging.end) {
                if (this.dragging.start) {
                    if (element.id === this.endId) {
                        return;
                    }
                    this.changeNodeElement(this.startId, 'unvisited');
                    this.changeNodeElement(element.id, 'start');
                }
                else if (this.dragging.end) {
                    if (element.id === this.startId) {
                        return;
                    }
                    this.changeNodeElement(this.endId, 'unvisited');
                    this.changeNodeElement(element.id, 'end');
                }
            }
            else if (this.isCreatingWall) {
                this.changeNodeElement(element.id, 'wall');
            }
        });
    }
    changeNodeElement(nodeId, newStatus) {
        const currentNode = this.nodeMap.get(nodeId);
        const currentElement = document.getElementById(nodeId);
        if (!currentNode || !currentElement) {
            return;
        }
        if (newStatus === 'wall' && ['start', 'end'].includes(currentNode.status)) {
            return;
        }
        currentElement.classList.remove('shortest-path');
        currentElement.classList.remove('visited');
        currentElement.classList.remove('current');
        currentElement.classList.remove('unvisited');
        currentElement.classList.remove('wall');
        currentElement.classList.add(newStatus);
        currentNode.status = newStatus;
        if (newStatus === 'start') {
            this.startId = currentNode.id;
            return;
        }
        if (newStatus === 'end') {
            this.endId = currentNode.id;
            return;
        }
        currentElement.classList.remove('start');
        currentElement.classList.remove('end');
    }
    clearBoard() {
        this.setInitialCoordinates();
        this.createGrid();
    }
    clearWalls() {
        for (const pair of this.nodeMap) {
            if (pair[1].status === 'wall') {
                this.changeNodeElement(pair[0], 'unvisited');
            }
        }
    }
    clearPath() {
        for (const pair of this.nodeMap) {
            const currentNodeId = pair[0];
            if (currentNodeId === this.startId) {
                this.changeNodeElement(currentNodeId, 'start');
            }
            else if (currentNodeId === this.endId) {
                this.changeNodeElement(currentNodeId, 'end');
            }
            else if (pair[1].status === 'visited') {
                this.changeNodeElement(pair[0], 'unvisited');
            }
        }
    }
    start(algorithm) {
        this.nodesToAnimate = [];
        let endNode = null;
        if (algorithm === 'dfs') {
            endNode = (0, dfs_1.default)(this.startId, this.endId, this.nodeMap, this.nodesToAnimate);
        }
        else if (algorithm === 'bfs') {
            endNode = (0, bfs_1.default)(this.startId, this.endId, this.nodeMap, this.nodesToAnimate);
        }
        else {
            throw new Error(`Algorithm not implemented: ${algorithm}`);
        }
        return { endNode, nodesToAnimate: this.nodesToAnimate };
    }
}
exports["default"] = Board;


/***/ }),

/***/ "./src/constants.ts":
/*!**************************!*\
  !*** ./src/constants.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WALKTHROUGH_COUNTER_STORAGE_KEY = exports.WALKTHROUGH_POSITIONS = exports.NODE_TO_ID_MAPPING = exports.SPEED_MAPPING = exports.ALGORITHM_MAPPING = void 0;
exports.ALGORITHM_MAPPING = Object.freeze({
    dfs: {
        id: 'dfs-algorithm',
        name: 'DFS',
    },
    bfs: {
        id: 'bfs-algorithm',
        name: 'BFS',
    },
});
exports.SPEED_MAPPING = Object.freeze({
    fast: {
        id: 'fast-speed',
        time: 5,
        name: 'Fast',
        pathTime: 50,
    },
    average: {
        id: 'average-speed',
        time: 100,
        name: 'Average',
        pathTime: 150,
    },
    slow: {
        id: 'slow-speed',
        time: 300,
        name: 'Slow',
        pathTime: 400,
    },
});
exports.NODE_TO_ID_MAPPING = Object.freeze({
    board: 'board',
    visualizeButton: 'visualize',
    playPauseButton: 'play-pause',
});
exports.WALKTHROUGH_POSITIONS = [
    {
        reference: '#algorithms',
        top: 25,
        left: 0,
        title: 'Pick an algorithm',
        description: 'Choose any traversal algorithm from this menu.',
        image: './public/algorithm-selector.gif',
    },
    {
        reference: '.start',
        top: -150,
        left: 100,
        title: 'Add walls',
        description: 'Drag on the grid to add walls. A path will not be able to cross a wall.',
        image: './public/walls.gif',
    },
    {
        reference: '.start',
        top: -150,
        left: 50,
        title: 'Drag nodes',
        description: 'You can drag the start and end nodes to any place in the grid.',
        image: './public/start-end-drag.gif',
        direction: 'left',
    },
    {
        reference: '#visualize',
        top: 25,
        left: 0,
        title: 'Controls',
        description: 'You can start the visualization, pause/resume it in between, adjust the visualization speed, clear the board from the controls panel here.',
        image: './public/controls-help.gif',
    },
    {
        reference: '#walkthrough-tutorial',
        top: 30,
        left: -275,
        title: 'Revisit',
        description: 'If you want to see this tutorial again, click on this icon.',
        direction: 'top-right',
    },
];
exports.WALKTHROUGH_COUNTER_STORAGE_KEY = 'walkthroughCounter';


/***/ }),

/***/ "./src/dfs.ts":
/*!********************!*\
  !*** ./src/dfs.ts ***!
  \********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const helpers_1 = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");
function dfsAlgorithm(startId, endId, nodeMap, nodesToAnimate) {
    const queue = [nodeMap.get(startId)];
    const visited = new Map();
    while (queue.length > 0) {
        const current = queue.pop();
        if (typeof current === 'undefined') {
            break;
        }
        visited.set(current.id, true);
        nodesToAnimate.push(current);
        current.status = 'visited';
        if (current.id === endId) {
            return current;
        }
        const neighbours = (0, helpers_1.getNeighbours)(current.id, nodeMap).reverse();
        for (const neighbour of neighbours) {
            if (!visited.has(neighbour.id)) {
                neighbour.previous = current;
                queue.push(neighbour);
            }
        }
    }
    return null;
}
exports["default"] = dfsAlgorithm;


/***/ }),

/***/ "./src/helpers.ts":
/*!************************!*\
  !*** ./src/helpers.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getNeighbours = exports.createNodeId = void 0;
function createNodeId(r, c) {
    return `${r}-${c}`;
}
exports.createNodeId = createNodeId;
function getNeighbours(currentId, nodeMap) {
    const coordinates = currentId.split('-');
    const x = parseInt(coordinates[0], 10);
    const y = parseInt(coordinates[1], 10);
    const neighbours = [];
    const combinations = [
        [-1, 0],
        [0, 1],
        [1, 0],
        [0, -1],
    ];
    for (const combination of combinations) {
        const newX = x + combination[0];
        const newY = y + combination[1];
        const neighbourNode = nodeMap.get(createNodeId(newX, newY));
        if (typeof neighbourNode !== 'undefined' &&
            neighbourNode.status !== 'wall') {
            neighbours.push(neighbourNode);
        }
    }
    return neighbours;
}
exports.getNeighbours = getNeighbours;


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const board_1 = __importDefault(__webpack_require__(/*! ./board */ "./src/board.ts"));
const animate_1 = __webpack_require__(/*! ./animate */ "./src/animate.ts");
const modal_1 = __importDefault(__webpack_require__(/*! ./modal */ "./src/modal.ts"));
const walkthrough_1 = __webpack_require__(/*! ./walkthrough */ "./src/walkthrough.ts");
const utils_1 = __webpack_require__(/*! ./utils */ "./src/utils.ts");
const constants_1 = __webpack_require__(/*! ./constants */ "./src/constants.ts");
const boardNode = (0, utils_1.getNodeById)(constants_1.NODE_TO_ID_MAPPING.board);
const board = new board_1.default(boardNode);
const visualizeButton = (0, utils_1.getNodeById)(constants_1.NODE_TO_ID_MAPPING.visualizeButton);
const playPauseButton = (0, utils_1.getNodeById)(constants_1.NODE_TO_ID_MAPPING.playPauseButton);
class VisualizerState {
    constructor() {
        this.algorithm = null;
        this.timers = [];
        this.boardStatus = null;
    }
    setAlgorithm(algorithm) {
        this.algorithm = algorithm;
    }
    setSpeed(newSpeed) {
        if (this.speed === newSpeed) {
            return;
        }
        if (typeof this.speed === 'undefined') {
            this.speed = newSpeed;
            return;
        }
        const visitedDifference = constants_1.SPEED_MAPPING[newSpeed].time / constants_1.SPEED_MAPPING[this.speed].time;
        const pathDifference = constants_1.SPEED_MAPPING[newSpeed].pathTime / constants_1.SPEED_MAPPING[this.speed].pathTime;
        for (const timer of this.timers) {
            if (timer.animationType === 'shortest-path') {
                timer.setRemainingByFactor(pathDifference);
            }
            else if (timer.animationType === 'travel') {
                timer.setRemainingByFactor(visitedDifference);
            }
        }
        this.speed = newSpeed;
    }
    appendTimers(_timers) {
        this.timers = [...this.timers, ..._timers];
    }
    clearTimers() {
        this.timers.forEach(eachTimer => eachTimer.clear());
        this.timers = [];
    }
    resumeTimers() {
        this.timers.forEach(eachTimer => eachTimer.resume());
    }
    pauseTimers() {
        this.timers.forEach(eachTimer => eachTimer.pause());
    }
    setBoardStatus(newBoardStatus) {
        this.boardStatus = newBoardStatus;
        if (this.boardStatus === 'started') {
            this.isPlaying = true;
        }
        else {
            this.clearTimers();
            this.calculateNewDomState();
        }
        visualizeButton.disabled =
            this.algorithm === null || this.boardStatus === 'started';
    }
    calculateNewDomState() {
        if (this.algorithm === null || this.boardStatus === null) {
            playPauseButton.disabled = true;
            return;
        }
        playPauseButton.disabled = false;
        if (this.isPlaying) {
            playPauseButton.innerText = 'Pause';
            playPauseButton.dataset.playstate = 'pause';
        }
        else if (this.boardStatus === 'started') {
            playPauseButton.innerText = 'Resume';
            playPauseButton.dataset.playstate = 'resume';
        }
        else if (this.boardStatus === 'completed') {
            playPauseButton.innerText = 'Revisualize';
            playPauseButton.dataset.playstate = 'revisualize';
        }
    }
    startOrStopTimer(newState) {
        this.isPlaying = newState;
        this.calculateNewDomState();
    }
    playOrPauseTimer() {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            this.resumeTimers();
        }
        else {
            this.pauseTimers();
        }
        this.calculateNewDomState();
    }
}
const visualizerState = new VisualizerState();
function onIndexAnimated(animatedIndex) {
    visualizerState.timers.shift();
    if (animatedIndex === 0) {
        visualizerState.setBoardStatus('started');
        visualizerState.startOrStopTimer(true);
    }
}
function onPathAnimated(animatedIndex, nodesToAnimate) {
    visualizerState.timers.shift();
    if (animatedIndex === nodesToAnimate.length - 1) {
        visualizerState.setBoardStatus('completed');
        visualizerState.startOrStopTimer(false);
    }
}
function calculateAndLaunchAnimations() {
    if (visualizerState.algorithm === null) {
        return;
    }
    const { endNode, nodesToAnimate } = board.start(visualizerState.algorithm);
    if (endNode === null) {
        (0, modal_1.default)('Error!', 'Cannot find path to goal as we got blocked by walls. Kindly re-try.');
        return;
    }
    const visitedTimers = (0, animate_1.startVisitedNodesAnimations)(nodesToAnimate, visualizerState.speed, animatedIndex => {
        onIndexAnimated(animatedIndex);
        if (animatedIndex === nodesToAnimate.length - 1) {
            const pathTimers = (0, animate_1.startShortestPathAnimation)(endNode, board.nodeMap, visualizerState.speed, index => onPathAnimated(index, pathTimers));
            visualizerState.appendTimers(pathTimers);
        }
    });
    visualizerState.appendTimers(visitedTimers);
}
function initializeButtonEvents() {
    (0, utils_1.addHtmlEvent)(visualizeButton, () => {
        calculateAndLaunchAnimations();
    });
    (0, utils_1.addHtmlEvent)((0, utils_1.getNodeById)('clear-board'), () => {
        board.clearBoard();
        visualizerState.setBoardStatus(null);
    });
    (0, utils_1.addHtmlEvent)((0, utils_1.getNodeById)('clear-walls'), () => {
        board.clearWalls();
        visualizerState.setBoardStatus(null);
    });
    (0, utils_1.addHtmlEvent)((0, utils_1.getNodeById)('clear-path'), () => {
        board.clearPath();
        visualizerState.setBoardStatus(null);
    });
    (0, utils_1.addHtmlEvent)(playPauseButton, () => {
        if (playPauseButton.dataset.playstate === 'revisualize') {
            board.clearPath();
            visualizerState.setBoardStatus(null);
            calculateAndLaunchAnimations();
        }
        else {
            visualizerState.playOrPauseTimer();
        }
    });
    (0, utils_1.addHtmlEvent)((0, utils_1.getNodeById)('walkthrough-tutorial'), () => {
        (0, walkthrough_1.reInitiateWalkthrough)();
    });
}
function applyChangesForSpeedDropdown(speedId) {
    const speeds = Object.keys(constants_1.SPEED_MAPPING);
    for (let i = 0; i < speeds.length; i++) {
        const mapping = constants_1.SPEED_MAPPING[speeds[i]];
        if (mapping.id === speedId) {
            visualizerState.setSpeed(speeds[i]);
            const node = (0, utils_1.getNodeById)(mapping.id);
            (0, utils_1.changeDropdownLabel)(node, `Speed: ${mapping.name}`);
            break;
        }
    }
}
function initializeDropdownEvents() {
    (0, utils_1.getNodes)('.dropdown').forEach(eachNode => (0, utils_1.addHtmlEvent)(eachNode, event => {
        const node = event.currentTarget;
        if (node.classList.contains('open')) {
            node.classList.remove('open');
        }
        else {
            node.classList.add('open');
        }
    }));
    const allSpeedIds = Object.values(constants_1.SPEED_MAPPING).map(eachValue => eachValue.id);
    applyChangesForSpeedDropdown(constants_1.SPEED_MAPPING.fast.id);
    (0, utils_1.getNodes)('.dropdown-item').forEach(eachNode => (0, utils_1.addHtmlEvent)(eachNode, event => {
        const node = event.currentTarget;
        Object.values(constants_1.ALGORITHM_MAPPING).forEach(eachConfig => {
            eachConfig;
        });
        const algorithms = Object.keys(constants_1.ALGORITHM_MAPPING);
        for (let i = 0; i < algorithms.length; i++) {
            const config = constants_1.ALGORITHM_MAPPING[algorithms[i]];
            if (config.id === node.id) {
                visualizerState.setAlgorithm(algorithms[i]);
                (0, utils_1.changeDropdownLabel)(node, `Algorithm: ${config.name}`);
                visualizeButton.innerText = `Visualize ${config.name}`;
                visualizeButton.disabled = false;
                return;
            }
        }
        if (allSpeedIds.includes(node.id)) {
            applyChangesForSpeedDropdown(node.id);
        }
    }));
}
initializeButtonEvents();
initializeDropdownEvents();
(0, walkthrough_1.setUpWalkthrough)();


/***/ }),

/***/ "./src/modal.ts":
/*!**********************!*\
  !*** ./src/modal.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const utils_1 = __webpack_require__(/*! ./utils */ "./src/utils.ts");
function showModal(titleText, descriptionText) {
    const overlayNode = (0, utils_1.getNodeById)('modal-overlay');
    overlayNode.classList.add('open');
    (0, utils_1.getNodeById)('modal-title').innerText = titleText;
    (0, utils_1.getNodeById)('modal-description').innerText = descriptionText;
    (0, utils_1.addHtmlEvent)((0, utils_1.getNodeById)('modal-close'), () => {
        overlayNode.classList.remove('open');
    });
}
exports["default"] = showModal;


/***/ }),

/***/ "./src/node.ts":
/*!*********************!*\
  !*** ./src/node.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class Node {
    constructor(_r, _c, _id, _status) {
        this.r = _r;
        this.c = _c;
        this.id = _id;
        this.status = _status;
        this.previous = null;
    }
    setPrevious(previous) {
        this.previous = previous;
    }
}
exports["default"] = Node;


/***/ }),

/***/ "./src/timer.ts":
/*!**********************!*\
  !*** ./src/timer.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class Timer {
    constructor(callback, delay, animationType) {
        this.start = Date.now();
        this.remaining = delay;
        this.callback = callback;
        this.id = setTimeout(this.callback, delay);
        this.animationType = animationType;
    }
    pause() {
        clearTimeout(this.id);
        this.remaining = this.remaining - (Date.now() - this.start);
    }
    resume() {
        clearTimeout(this.id);
        this.start = Date.now();
        this.id = setTimeout(this.callback, this.remaining);
    }
    clear() {
        clearTimeout(this.id);
    }
    setRemainingByFactor(factor) {
        this.remaining *= factor;
    }
}
exports["default"] = Timer;


/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.changeDropdownLabel = exports.addHtmlEvent = exports.getNodeById = exports.getNodes = void 0;
function getNodes(selector) {
    return document.querySelectorAll(selector);
}
exports.getNodes = getNodes;
function getNodeById(selectorId) {
    const node = document.getElementById(selectorId);
    if (!node) {
        throw new Error(`Selector not found: ${selectorId}`);
    }
    return node;
}
exports.getNodeById = getNodeById;
function addHtmlEvent(node, callback, eventName = 'click') {
    node.addEventListener(eventName, callback);
}
exports.addHtmlEvent = addHtmlEvent;
function changeDropdownLabel(node, text) {
    var _a, _b;
    const controls = (_b = (_a = node.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.querySelector('.dropdown-controls');
    if (!controls) {
        return;
    }
    controls.innerText = text;
}
exports.changeDropdownLabel = changeDropdownLabel;


/***/ }),

/***/ "./src/walkthrough.ts":
/*!****************************!*\
  !*** ./src/walkthrough.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setUpWalkthrough = exports.reInitiateWalkthrough = void 0;
const utils_1 = __webpack_require__(/*! ./utils */ "./src/utils.ts");
const constants_1 = __webpack_require__(/*! ./constants */ "./src/constants.ts");
let currentIndex = 0;
function goToIndex() {
    var _a;
    const overlayNode = (0, utils_1.getNodeById)('walkthrough-overlay');
    if (currentIndex < 0) {
        overlayNode.classList.remove('open');
        return;
    }
    overlayNode.classList.add('open');
    const isLastPosition = currentIndex === constants_1.WALKTHROUGH_POSITIONS.length - 1;
    (0, utils_1.getNodeById)('walkthrough-skip').style.visibility = isLastPosition
        ? 'hidden'
        : 'visible';
    (0, utils_1.getNodeById)('walkthrough-next').innerText = isLastPosition
        ? 'Finish!'
        : 'Next';
    const currentStep = constants_1.WALKTHROUGH_POSITIONS[currentIndex];
    const referencePosition = (0, utils_1.getNodes)(currentStep.reference)[0].getBoundingClientRect();
    const containerNode = (0, utils_1.getNodeById)('walkthrough-container');
    const xDisplacement = referencePosition.x + currentStep.left;
    const yDisplacement = referencePosition.y + referencePosition.height + currentStep.top;
    containerNode.style.transform = `translate(${xDisplacement}px, ${yDisplacement}px)`;
    if (currentIndex > 0) {
        containerNode.classList.add('with-transition');
    }
    else {
        containerNode.classList.remove('with-transition');
    }
    (0, utils_1.getNodeById)('walkthrough-stepper').innerText = `${currentIndex + 1} of ${constants_1.WALKTHROUGH_POSITIONS.length}`;
    (0, utils_1.getNodeById)('walkthrough-title').innerText = currentStep.title;
    (0, utils_1.getNodeById)('walkthrough-description').innerText = currentStep.description;
    const imageNode = (0, utils_1.getNodeById)('walkthrough-image');
    if (currentStep.image) {
        imageNode.classList.add('valid');
        imageNode.style.backgroundImage = `url(${currentStep.image})`;
    }
    else {
        imageNode.classList.remove('valid');
    }
    (0, utils_1.getNodeById)('walkthrough-arrow').dataset.direction =
        (_a = currentStep.direction) !== null && _a !== void 0 ? _a : 'top-left';
}
function reInitiateWalkthrough() {
    currentIndex = 0;
    goToIndex();
}
exports.reInitiateWalkthrough = reInitiateWalkthrough;
function setUpWalkthrough() {
    if (!localStorage.getItem(constants_1.WALKTHROUGH_COUNTER_STORAGE_KEY)) {
        setTimeout(() => reInitiateWalkthrough(), 600);
    }
    (0, utils_1.addHtmlEvent)((0, utils_1.getNodeById)('walkthrough-skip'), () => {
        currentIndex = -1;
        goToIndex();
    });
    (0, utils_1.addHtmlEvent)((0, utils_1.getNodeById)('walkthrough-next'), () => {
        currentIndex += 1;
        if (currentIndex === constants_1.WALKTHROUGH_POSITIONS.length) {
            localStorage.setItem(constants_1.WALKTHROUGH_COUNTER_STORAGE_KEY, '1');
            currentIndex = -1;
        }
        goToIndex();
    });
}
exports.setUpWalkthrough = setUpWalkthrough;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSx3QkFBd0I7Ozs7Ozs7VUNyRXhCO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy9hbmltYXRlLnRzIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uLy4vc3JjL2Jmcy50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy9ib2FyZC50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vLi9zcmMvZGZzLnRzIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uLy4vc3JjL2hlbHBlcnMudHMiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vLi9zcmMvbW9kYWwudHMiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vLi9zcmMvbm9kZS50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy90aW1lci50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy91dGlscy50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy93YWxrdGhyb3VnaC50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnN0YXJ0U2hvcnRlc3RQYXRoQW5pbWF0aW9uID0gZXhwb3J0cy5zdGFydFZpc2l0ZWROb2Rlc0FuaW1hdGlvbnMgPSB2b2lkIDA7XG5jb25zdCB0aW1lcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL3RpbWVyXCIpKTtcbmNvbnN0IGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4vY29uc3RhbnRzXCIpO1xuZnVuY3Rpb24gc3RhcnRUaW1lcihub2Rlc1RvQW5pbWF0ZSwgaW5kZXgsIHRpbWUsIGFuaW1hdGlvblR5cGUsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIG5ldyB0aW1lcl8xLmRlZmF1bHQoKCkgPT4ge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZXNUb0FuaW1hdGVbaW5kZXhdO1xuICAgICAgICBjb25zdCBjdXJyZW50RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG5vZGUuaWQpO1xuICAgICAgICBpZiAoIWN1cnJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZm91bmQgbm9kZScpO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3VudmlzaXRlZCcpO1xuICAgICAgICBpZiAoYW5pbWF0aW9uVHlwZSA9PT0gJ3RyYXZlbCcpIHtcbiAgICAgICAgICAgIGN1cnJlbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2N1cnJlbnQnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGN1cnJlbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3Nob3J0ZXN0LXBhdGgnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYW5pbWF0aW9uVHlwZSA9PT0gJ3RyYXZlbCcgJiYgaW5kZXggPj0gMSkge1xuICAgICAgICAgICAgY29uc3QgcHJldmlvdXMgPSBub2Rlc1RvQW5pbWF0ZVtpbmRleCAtIDFdO1xuICAgICAgICAgICAgY29uc3QgcHJldmlvdXNFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocHJldmlvdXMuaWQpO1xuICAgICAgICAgICAgaWYgKCFwcmV2aW91c0VsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZm91bmQgbm9kZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJldmlvdXNFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2N1cnJlbnQnKTtcbiAgICAgICAgICAgIHByZXZpb3VzRWxlbWVudC5jbGFzc0xpc3QuYWRkKCd2aXNpdGVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2sgPT09IG51bGwgfHwgY2FsbGJhY2sgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGNhbGxiYWNrKGluZGV4KTtcbiAgICB9LCB0aW1lLCBhbmltYXRpb25UeXBlKTtcbn1cbmZ1bmN0aW9uIHN0YXJ0VmlzaXRlZE5vZGVzQW5pbWF0aW9ucyhub2Rlc1RvQW5pbWF0ZSwgc3BlZWQsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgdGltZXJzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlc1RvQW5pbWF0ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aW1lcnMucHVzaChzdGFydFRpbWVyKG5vZGVzVG9BbmltYXRlLCBpLCAoaSArIDEpICogY29uc3RhbnRzXzEuU1BFRURfTUFQUElOR1tzcGVlZF0udGltZSwgJ3RyYXZlbCcsIGNhbGxiYWNrKSk7XG4gICAgfVxuICAgIHJldHVybiB0aW1lcnM7XG59XG5leHBvcnRzLnN0YXJ0VmlzaXRlZE5vZGVzQW5pbWF0aW9ucyA9IHN0YXJ0VmlzaXRlZE5vZGVzQW5pbWF0aW9ucztcbmZ1bmN0aW9uIHN0YXJ0U2hvcnRlc3RQYXRoQW5pbWF0aW9uKGVuZE5vZGUsIG5vZGVNYXAsIHNwZWVkLCBjYWxsYmFjaykge1xuICAgIHZhciBfYSwgX2I7XG4gICAgY29uc3Qgc2hvcnRlc3RQYXRoc1RvQW5pbWF0ZSA9IFtdO1xuICAgIGxldCBwcmV2aW91c05vZGUgPSBlbmROb2RlLnByZXZpb3VzO1xuICAgIHdoaWxlIChwcmV2aW91c05vZGUgIT09IG51bGwpIHtcbiAgICAgICAgc2hvcnRlc3RQYXRoc1RvQW5pbWF0ZS51bnNoaWZ0KHByZXZpb3VzTm9kZSk7XG4gICAgICAgIHByZXZpb3VzTm9kZSA9IChfYiA9IChfYSA9IG5vZGVNYXAuZ2V0KHByZXZpb3VzTm9kZS5pZCkpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5wcmV2aW91cykgIT09IG51bGwgJiYgX2IgIT09IHZvaWQgMCA/IF9iIDogbnVsbDtcbiAgICB9XG4gICAgY29uc3QgdGltZXJzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaG9ydGVzdFBhdGhzVG9BbmltYXRlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRpbWVycy5wdXNoKHN0YXJ0VGltZXIoc2hvcnRlc3RQYXRoc1RvQW5pbWF0ZSwgaSwgKGkgKyAxKSAqIGNvbnN0YW50c18xLlNQRUVEX01BUFBJTkdbc3BlZWRdLnBhdGhUaW1lLCAnc2hvcnRlc3QtcGF0aCcsIGNhbGxiYWNrKSk7XG4gICAgfVxuICAgIHJldHVybiB0aW1lcnM7XG59XG5leHBvcnRzLnN0YXJ0U2hvcnRlc3RQYXRoQW5pbWF0aW9uID0gc3RhcnRTaG9ydGVzdFBhdGhBbmltYXRpb247XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGhlbHBlcnNfMSA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XG5mdW5jdGlvbiBiZnNBbGdvcml0aG0oc3RhcnRJZCwgZW5kSWQsIG5vZGVNYXAsIG5vZGVzVG9BbmltYXRlKSB7XG4gICAgY29uc3QgcXVldWUgPSBbbm9kZU1hcC5nZXQoc3RhcnRJZCldO1xuICAgIGNvbnN0IHZpc2l0ZWQgPSBuZXcgTWFwKCk7XG4gICAgdmlzaXRlZC5zZXQoc3RhcnRJZCwgdHJ1ZSk7XG4gICAgd2hpbGUgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgIGlmICh0eXBlb2YgY3VycmVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG5vZGVzVG9BbmltYXRlLnB1c2goY3VycmVudCk7XG4gICAgICAgIGN1cnJlbnQuc3RhdHVzID0gJ3Zpc2l0ZWQnO1xuICAgICAgICBpZiAoY3VycmVudC5pZCA9PT0gZW5kSWQpIHtcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5laWdoYm91cnMgPSAoMCwgaGVscGVyc18xLmdldE5laWdoYm91cnMpKGN1cnJlbnQuaWQsIG5vZGVNYXApO1xuICAgICAgICBmb3IgKGNvbnN0IG5laWdoYm91ciBvZiBuZWlnaGJvdXJzKSB7XG4gICAgICAgICAgICBpZiAoIXZpc2l0ZWQuaGFzKG5laWdoYm91ci5pZCkpIHtcbiAgICAgICAgICAgICAgICB2aXNpdGVkLnNldChuZWlnaGJvdXIuaWQsIHRydWUpO1xuICAgICAgICAgICAgICAgIG5laWdoYm91ci5wcmV2aW91cyA9IGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgcXVldWUucHVzaChuZWlnaGJvdXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuZXhwb3J0cy5kZWZhdWx0ID0gYmZzQWxnb3JpdGhtO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBub2RlXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vbm9kZVwiKSk7XG5jb25zdCBkZnNfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9kZnNcIikpO1xuY29uc3QgYmZzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vYmZzXCIpKTtcbmNvbnN0IGhlbHBlcnNfMSA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XG5jbGFzcyBCb2FyZCB7XG4gICAgY29uc3RydWN0b3IoX2JvYXJkTm9kZSkge1xuICAgICAgICB0aGlzLmJvYXJkTm9kZSA9IF9ib2FyZE5vZGU7XG4gICAgICAgIHRoaXMuc2V0SW5pdGlhbENvb3JkaW5hdGVzKCk7XG4gICAgICAgIHRoaXMuZHJhZ2dpbmcgPSB7IHN0YXJ0OiBmYWxzZSwgZW5kOiBmYWxzZSB9O1xuICAgICAgICB0aGlzLmlzQ3JlYXRpbmdXYWxsID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY3JlYXRlR3JpZCgpO1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgfVxuICAgIHNldEluaXRpYWxDb29yZGluYXRlcygpIHtcbiAgICAgICAgY29uc3QgeyBoZWlnaHQsIHdpZHRoIH0gPSB0aGlzLmJvYXJkTm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQgLyAyODtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoIC8gMjg7XG4gICAgICAgIGNvbnN0IHN0YXJ0Q29vcmRzID0gW1xuICAgICAgICAgICAgTWF0aC5mbG9vcih0aGlzLmhlaWdodCAvIDIpLFxuICAgICAgICAgICAgTWF0aC5mbG9vcih0aGlzLndpZHRoIC8gNCksXG4gICAgICAgIF07XG4gICAgICAgIHRoaXMuc3RhcnRJZCA9ICgwLCBoZWxwZXJzXzEuY3JlYXRlTm9kZUlkKShzdGFydENvb3Jkc1swXSwgc3RhcnRDb29yZHNbMV0pO1xuICAgICAgICBjb25zdCBlbmRDb29yZHMgPSBbXG4gICAgICAgICAgICBNYXRoLmZsb29yKHRoaXMuaGVpZ2h0IC8gMiksXG4gICAgICAgICAgICAzICogTWF0aC5mbG9vcih0aGlzLndpZHRoIC8gNCksXG4gICAgICAgIF07XG4gICAgICAgIHRoaXMuZW5kSWQgPSAoMCwgaGVscGVyc18xLmNyZWF0ZU5vZGVJZCkoZW5kQ29vcmRzWzBdLCBlbmRDb29yZHNbMV0pO1xuICAgIH1cbiAgICBjcmVhdGVHcmlkKCkge1xuICAgICAgICB0aGlzLm5vZGVNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMubm9kZXNUb0FuaW1hdGUgPSBbXTtcbiAgICAgICAgbGV0IHRhYmxlSHRtbCA9ICcnO1xuICAgICAgICBmb3IgKGxldCByID0gMDsgciA8IHRoaXMuaGVpZ2h0OyByKyspIHtcbiAgICAgICAgICAgIGxldCBjdXJyZW50Um93ID0gJyc7XG4gICAgICAgICAgICBmb3IgKGxldCBjID0gMDsgYyA8IHRoaXMud2lkdGg7IGMrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVJZCA9ICgwLCBoZWxwZXJzXzEuY3JlYXRlTm9kZUlkKShyLCBjKTtcbiAgICAgICAgICAgICAgICBsZXQgbm9kZVN0YXR1cyA9ICd1bnZpc2l0ZWQnO1xuICAgICAgICAgICAgICAgIGlmIChub2RlSWQgPT09IHRoaXMuc3RhcnRJZCkge1xuICAgICAgICAgICAgICAgICAgICBub2RlU3RhdHVzID0gJ3N0YXJ0JztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFydElkID0gbm9kZUlkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChub2RlSWQgPT09IHRoaXMuZW5kSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZVN0YXR1cyA9ICdlbmQnO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVuZElkID0gbm9kZUlkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdXJyZW50Um93ICs9IGA8dGQgaWQ9JHtub2RlSWR9IGNsYXNzPSR7bm9kZVN0YXR1c30+PC90ZD5gO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgbm9kZV8xLmRlZmF1bHQociwgYywgbm9kZUlkLCBub2RlU3RhdHVzKTtcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGVNYXAuc2V0KG5vZGVJZCwgbm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0YWJsZUh0bWwgKz0gYDx0ciBpZD1cInJvdyAke3J9XCI+JHtjdXJyZW50Um93fTwvdHI+YDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJvYXJkTm9kZS5pbm5lckhUTUwgPSB0YWJsZUh0bWw7XG4gICAgfVxuICAgIGFkZEV2ZW50TGlzdGVuZXJzKCkge1xuICAgICAgICB0aGlzLmJvYXJkTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBldmVudCA9PiB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMubm9kZU1hcC5nZXQoZWxlbWVudC5pZCk7XG4gICAgICAgICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm9kZS5zdGF0dXMgPT09ICdzdGFydCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0YXJ0ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUuc3RhdHVzID09PSAnZW5kJykge1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuZW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUuc3RhdHVzID09PSAnd2FsbCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZU5vZGVFbGVtZW50KGVsZW1lbnQuaWQsICd1bnZpc2l0ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNDcmVhdGluZ1dhbGwgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ib2FyZE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcgPSB7IHN0YXJ0OiBmYWxzZSwgZW5kOiBmYWxzZSB9O1xuICAgICAgICAgICAgdGhpcy5pc0NyZWF0aW5nV2FsbCA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ib2FyZE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nLnN0YXJ0IHx8IHRoaXMuZHJhZ2dpbmcuZW5kKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcuc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuaWQgPT09IHRoaXMuZW5kSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZU5vZGVFbGVtZW50KHRoaXMuc3RhcnRJZCwgJ3VudmlzaXRlZCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZU5vZGVFbGVtZW50KGVsZW1lbnQuaWQsICdzdGFydCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmRyYWdnaW5nLmVuZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5pZCA9PT0gdGhpcy5zdGFydElkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VOb2RlRWxlbWVudCh0aGlzLmVuZElkLCAndW52aXNpdGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTm9kZUVsZW1lbnQoZWxlbWVudC5pZCwgJ2VuZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuaXNDcmVhdGluZ1dhbGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZU5vZGVFbGVtZW50KGVsZW1lbnQuaWQsICd3YWxsJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjaGFuZ2VOb2RlRWxlbWVudChub2RlSWQsIG5ld1N0YXR1cykge1xuICAgICAgICBjb25zdCBjdXJyZW50Tm9kZSA9IHRoaXMubm9kZU1hcC5nZXQobm9kZUlkKTtcbiAgICAgICAgY29uc3QgY3VycmVudEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChub2RlSWQpO1xuICAgICAgICBpZiAoIWN1cnJlbnROb2RlIHx8ICFjdXJyZW50RWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuZXdTdGF0dXMgPT09ICd3YWxsJyAmJiBbJ3N0YXJ0JywgJ2VuZCddLmluY2x1ZGVzKGN1cnJlbnROb2RlLnN0YXR1cykpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdzaG9ydGVzdC1wYXRoJyk7XG4gICAgICAgIGN1cnJlbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3Zpc2l0ZWQnKTtcbiAgICAgICAgY3VycmVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnY3VycmVudCcpO1xuICAgICAgICBjdXJyZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCd1bnZpc2l0ZWQnKTtcbiAgICAgICAgY3VycmVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnd2FsbCcpO1xuICAgICAgICBjdXJyZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKG5ld1N0YXR1cyk7XG4gICAgICAgIGN1cnJlbnROb2RlLnN0YXR1cyA9IG5ld1N0YXR1cztcbiAgICAgICAgaWYgKG5ld1N0YXR1cyA9PT0gJ3N0YXJ0Jykge1xuICAgICAgICAgICAgdGhpcy5zdGFydElkID0gY3VycmVudE5vZGUuaWQ7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5ld1N0YXR1cyA9PT0gJ2VuZCcpIHtcbiAgICAgICAgICAgIHRoaXMuZW5kSWQgPSBjdXJyZW50Tm9kZS5pZDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdzdGFydCcpO1xuICAgICAgICBjdXJyZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdlbmQnKTtcbiAgICB9XG4gICAgY2xlYXJCb2FyZCgpIHtcbiAgICAgICAgdGhpcy5zZXRJbml0aWFsQ29vcmRpbmF0ZXMoKTtcbiAgICAgICAgdGhpcy5jcmVhdGVHcmlkKCk7XG4gICAgfVxuICAgIGNsZWFyV2FsbHMoKSB7XG4gICAgICAgIGZvciAoY29uc3QgcGFpciBvZiB0aGlzLm5vZGVNYXApIHtcbiAgICAgICAgICAgIGlmIChwYWlyWzFdLnN0YXR1cyA9PT0gJ3dhbGwnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VOb2RlRWxlbWVudChwYWlyWzBdLCAndW52aXNpdGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2xlYXJQYXRoKCkge1xuICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2YgdGhpcy5ub2RlTWFwKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50Tm9kZUlkID0gcGFpclswXTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50Tm9kZUlkID09PSB0aGlzLnN0YXJ0SWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZU5vZGVFbGVtZW50KGN1cnJlbnROb2RlSWQsICdzdGFydCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY3VycmVudE5vZGVJZCA9PT0gdGhpcy5lbmRJZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTm9kZUVsZW1lbnQoY3VycmVudE5vZGVJZCwgJ2VuZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAocGFpclsxXS5zdGF0dXMgPT09ICd2aXNpdGVkJykge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTm9kZUVsZW1lbnQocGFpclswXSwgJ3VudmlzaXRlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXJ0KGFsZ29yaXRobSkge1xuICAgICAgICB0aGlzLm5vZGVzVG9BbmltYXRlID0gW107XG4gICAgICAgIGxldCBlbmROb2RlID0gbnVsbDtcbiAgICAgICAgaWYgKGFsZ29yaXRobSA9PT0gJ2RmcycpIHtcbiAgICAgICAgICAgIGVuZE5vZGUgPSAoMCwgZGZzXzEuZGVmYXVsdCkodGhpcy5zdGFydElkLCB0aGlzLmVuZElkLCB0aGlzLm5vZGVNYXAsIHRoaXMubm9kZXNUb0FuaW1hdGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFsZ29yaXRobSA9PT0gJ2JmcycpIHtcbiAgICAgICAgICAgIGVuZE5vZGUgPSAoMCwgYmZzXzEuZGVmYXVsdCkodGhpcy5zdGFydElkLCB0aGlzLmVuZElkLCB0aGlzLm5vZGVNYXAsIHRoaXMubm9kZXNUb0FuaW1hdGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBbGdvcml0aG0gbm90IGltcGxlbWVudGVkOiAke2FsZ29yaXRobX1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBlbmROb2RlLCBub2Rlc1RvQW5pbWF0ZTogdGhpcy5ub2Rlc1RvQW5pbWF0ZSB9O1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IEJvYXJkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLldBTEtUSFJPVUdIX0NPVU5URVJfU1RPUkFHRV9LRVkgPSBleHBvcnRzLldBTEtUSFJPVUdIX1BPU0lUSU9OUyA9IGV4cG9ydHMuTk9ERV9UT19JRF9NQVBQSU5HID0gZXhwb3J0cy5TUEVFRF9NQVBQSU5HID0gZXhwb3J0cy5BTEdPUklUSE1fTUFQUElORyA9IHZvaWQgMDtcbmV4cG9ydHMuQUxHT1JJVEhNX01BUFBJTkcgPSBPYmplY3QuZnJlZXplKHtcbiAgICBkZnM6IHtcbiAgICAgICAgaWQ6ICdkZnMtYWxnb3JpdGhtJyxcbiAgICAgICAgbmFtZTogJ0RGUycsXG4gICAgfSxcbiAgICBiZnM6IHtcbiAgICAgICAgaWQ6ICdiZnMtYWxnb3JpdGhtJyxcbiAgICAgICAgbmFtZTogJ0JGUycsXG4gICAgfSxcbn0pO1xuZXhwb3J0cy5TUEVFRF9NQVBQSU5HID0gT2JqZWN0LmZyZWV6ZSh7XG4gICAgZmFzdDoge1xuICAgICAgICBpZDogJ2Zhc3Qtc3BlZWQnLFxuICAgICAgICB0aW1lOiA1LFxuICAgICAgICBuYW1lOiAnRmFzdCcsXG4gICAgICAgIHBhdGhUaW1lOiA1MCxcbiAgICB9LFxuICAgIGF2ZXJhZ2U6IHtcbiAgICAgICAgaWQ6ICdhdmVyYWdlLXNwZWVkJyxcbiAgICAgICAgdGltZTogMTAwLFxuICAgICAgICBuYW1lOiAnQXZlcmFnZScsXG4gICAgICAgIHBhdGhUaW1lOiAxNTAsXG4gICAgfSxcbiAgICBzbG93OiB7XG4gICAgICAgIGlkOiAnc2xvdy1zcGVlZCcsXG4gICAgICAgIHRpbWU6IDMwMCxcbiAgICAgICAgbmFtZTogJ1Nsb3cnLFxuICAgICAgICBwYXRoVGltZTogNDAwLFxuICAgIH0sXG59KTtcbmV4cG9ydHMuTk9ERV9UT19JRF9NQVBQSU5HID0gT2JqZWN0LmZyZWV6ZSh7XG4gICAgYm9hcmQ6ICdib2FyZCcsXG4gICAgdmlzdWFsaXplQnV0dG9uOiAndmlzdWFsaXplJyxcbiAgICBwbGF5UGF1c2VCdXR0b246ICdwbGF5LXBhdXNlJyxcbn0pO1xuZXhwb3J0cy5XQUxLVEhST1VHSF9QT1NJVElPTlMgPSBbXG4gICAge1xuICAgICAgICByZWZlcmVuY2U6ICcjYWxnb3JpdGhtcycsXG4gICAgICAgIHRvcDogMjUsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHRpdGxlOiAnUGljayBhbiBhbGdvcml0aG0nLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Nob29zZSBhbnkgdHJhdmVyc2FsIGFsZ29yaXRobSBmcm9tIHRoaXMgbWVudS4nLFxuICAgICAgICBpbWFnZTogJy4vcHVibGljL2FsZ29yaXRobS1zZWxlY3Rvci5naWYnLFxuICAgIH0sXG4gICAge1xuICAgICAgICByZWZlcmVuY2U6ICcuc3RhcnQnLFxuICAgICAgICB0b3A6IC0xNTAsXG4gICAgICAgIGxlZnQ6IDEwMCxcbiAgICAgICAgdGl0bGU6ICdBZGQgd2FsbHMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0RyYWcgb24gdGhlIGdyaWQgdG8gYWRkIHdhbGxzLiBBIHBhdGggd2lsbCBub3QgYmUgYWJsZSB0byBjcm9zcyBhIHdhbGwuJyxcbiAgICAgICAgaW1hZ2U6ICcuL3B1YmxpYy93YWxscy5naWYnLFxuICAgIH0sXG4gICAge1xuICAgICAgICByZWZlcmVuY2U6ICcuc3RhcnQnLFxuICAgICAgICB0b3A6IC0xNTAsXG4gICAgICAgIGxlZnQ6IDUwLFxuICAgICAgICB0aXRsZTogJ0RyYWcgbm9kZXMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1lvdSBjYW4gZHJhZyB0aGUgc3RhcnQgYW5kIGVuZCBub2RlcyB0byBhbnkgcGxhY2UgaW4gdGhlIGdyaWQuJyxcbiAgICAgICAgaW1hZ2U6ICcuL3B1YmxpYy9zdGFydC1lbmQtZHJhZy5naWYnLFxuICAgICAgICBkaXJlY3Rpb246ICdsZWZ0JyxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgcmVmZXJlbmNlOiAnI3Zpc3VhbGl6ZScsXG4gICAgICAgIHRvcDogMjUsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHRpdGxlOiAnQ29udHJvbHMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1lvdSBjYW4gc3RhcnQgdGhlIHZpc3VhbGl6YXRpb24sIHBhdXNlL3Jlc3VtZSBpdCBpbiBiZXR3ZWVuLCBhZGp1c3QgdGhlIHZpc3VhbGl6YXRpb24gc3BlZWQsIGNsZWFyIHRoZSBib2FyZCBmcm9tIHRoZSBjb250cm9scyBwYW5lbCBoZXJlLicsXG4gICAgICAgIGltYWdlOiAnLi9wdWJsaWMvY29udHJvbHMtaGVscC5naWYnLFxuICAgIH0sXG4gICAge1xuICAgICAgICByZWZlcmVuY2U6ICcjd2Fsa3Rocm91Z2gtdHV0b3JpYWwnLFxuICAgICAgICB0b3A6IDMwLFxuICAgICAgICBsZWZ0OiAtMjc1LFxuICAgICAgICB0aXRsZTogJ1JldmlzaXQnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0lmIHlvdSB3YW50IHRvIHNlZSB0aGlzIHR1dG9yaWFsIGFnYWluLCBjbGljayBvbiB0aGlzIGljb24uJyxcbiAgICAgICAgZGlyZWN0aW9uOiAndG9wLXJpZ2h0JyxcbiAgICB9LFxuXTtcbmV4cG9ydHMuV0FMS1RIUk9VR0hfQ09VTlRFUl9TVE9SQUdFX0tFWSA9ICd3YWxrdGhyb3VnaENvdW50ZXInO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBoZWxwZXJzXzEgPSByZXF1aXJlKFwiLi9oZWxwZXJzXCIpO1xuZnVuY3Rpb24gZGZzQWxnb3JpdGhtKHN0YXJ0SWQsIGVuZElkLCBub2RlTWFwLCBub2Rlc1RvQW5pbWF0ZSkge1xuICAgIGNvbnN0IHF1ZXVlID0gW25vZGVNYXAuZ2V0KHN0YXJ0SWQpXTtcbiAgICBjb25zdCB2aXNpdGVkID0gbmV3IE1hcCgpO1xuICAgIHdoaWxlIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBxdWV1ZS5wb3AoKTtcbiAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdmlzaXRlZC5zZXQoY3VycmVudC5pZCwgdHJ1ZSk7XG4gICAgICAgIG5vZGVzVG9BbmltYXRlLnB1c2goY3VycmVudCk7XG4gICAgICAgIGN1cnJlbnQuc3RhdHVzID0gJ3Zpc2l0ZWQnO1xuICAgICAgICBpZiAoY3VycmVudC5pZCA9PT0gZW5kSWQpIHtcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5laWdoYm91cnMgPSAoMCwgaGVscGVyc18xLmdldE5laWdoYm91cnMpKGN1cnJlbnQuaWQsIG5vZGVNYXApLnJldmVyc2UoKTtcbiAgICAgICAgZm9yIChjb25zdCBuZWlnaGJvdXIgb2YgbmVpZ2hib3Vycykge1xuICAgICAgICAgICAgaWYgKCF2aXNpdGVkLmhhcyhuZWlnaGJvdXIuaWQpKSB7XG4gICAgICAgICAgICAgICAgbmVpZ2hib3VyLnByZXZpb3VzID0gY3VycmVudDtcbiAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKG5laWdoYm91cik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5leHBvcnRzLmRlZmF1bHQgPSBkZnNBbGdvcml0aG07XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZ2V0TmVpZ2hib3VycyA9IGV4cG9ydHMuY3JlYXRlTm9kZUlkID0gdm9pZCAwO1xuZnVuY3Rpb24gY3JlYXRlTm9kZUlkKHIsIGMpIHtcbiAgICByZXR1cm4gYCR7cn0tJHtjfWA7XG59XG5leHBvcnRzLmNyZWF0ZU5vZGVJZCA9IGNyZWF0ZU5vZGVJZDtcbmZ1bmN0aW9uIGdldE5laWdoYm91cnMoY3VycmVudElkLCBub2RlTWFwKSB7XG4gICAgY29uc3QgY29vcmRpbmF0ZXMgPSBjdXJyZW50SWQuc3BsaXQoJy0nKTtcbiAgICBjb25zdCB4ID0gcGFyc2VJbnQoY29vcmRpbmF0ZXNbMF0sIDEwKTtcbiAgICBjb25zdCB5ID0gcGFyc2VJbnQoY29vcmRpbmF0ZXNbMV0sIDEwKTtcbiAgICBjb25zdCBuZWlnaGJvdXJzID0gW107XG4gICAgY29uc3QgY29tYmluYXRpb25zID0gW1xuICAgICAgICBbLTEsIDBdLFxuICAgICAgICBbMCwgMV0sXG4gICAgICAgIFsxLCAwXSxcbiAgICAgICAgWzAsIC0xXSxcbiAgICBdO1xuICAgIGZvciAoY29uc3QgY29tYmluYXRpb24gb2YgY29tYmluYXRpb25zKSB7XG4gICAgICAgIGNvbnN0IG5ld1ggPSB4ICsgY29tYmluYXRpb25bMF07XG4gICAgICAgIGNvbnN0IG5ld1kgPSB5ICsgY29tYmluYXRpb25bMV07XG4gICAgICAgIGNvbnN0IG5laWdoYm91ck5vZGUgPSBub2RlTWFwLmdldChjcmVhdGVOb2RlSWQobmV3WCwgbmV3WSkpO1xuICAgICAgICBpZiAodHlwZW9mIG5laWdoYm91ck5vZGUgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgICAgICBuZWlnaGJvdXJOb2RlLnN0YXR1cyAhPT0gJ3dhbGwnKSB7XG4gICAgICAgICAgICBuZWlnaGJvdXJzLnB1c2gobmVpZ2hib3VyTm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5laWdoYm91cnM7XG59XG5leHBvcnRzLmdldE5laWdoYm91cnMgPSBnZXROZWlnaGJvdXJzO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBib2FyZF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2JvYXJkXCIpKTtcbmNvbnN0IGFuaW1hdGVfMSA9IHJlcXVpcmUoXCIuL2FuaW1hdGVcIik7XG5jb25zdCBtb2RhbF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL21vZGFsXCIpKTtcbmNvbnN0IHdhbGt0aHJvdWdoXzEgPSByZXF1aXJlKFwiLi93YWxrdGhyb3VnaFwiKTtcbmNvbnN0IHV0aWxzXzEgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcbmNvbnN0IGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4vY29uc3RhbnRzXCIpO1xuY29uc3QgYm9hcmROb2RlID0gKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKGNvbnN0YW50c18xLk5PREVfVE9fSURfTUFQUElORy5ib2FyZCk7XG5jb25zdCBib2FyZCA9IG5ldyBib2FyZF8xLmRlZmF1bHQoYm9hcmROb2RlKTtcbmNvbnN0IHZpc3VhbGl6ZUJ1dHRvbiA9ICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKShjb25zdGFudHNfMS5OT0RFX1RPX0lEX01BUFBJTkcudmlzdWFsaXplQnV0dG9uKTtcbmNvbnN0IHBsYXlQYXVzZUJ1dHRvbiA9ICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKShjb25zdGFudHNfMS5OT0RFX1RPX0lEX01BUFBJTkcucGxheVBhdXNlQnV0dG9uKTtcbmNsYXNzIFZpc3VhbGl6ZXJTdGF0ZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuYWxnb3JpdGhtID0gbnVsbDtcbiAgICAgICAgdGhpcy50aW1lcnMgPSBbXTtcbiAgICAgICAgdGhpcy5ib2FyZFN0YXR1cyA9IG51bGw7XG4gICAgfVxuICAgIHNldEFsZ29yaXRobShhbGdvcml0aG0pIHtcbiAgICAgICAgdGhpcy5hbGdvcml0aG0gPSBhbGdvcml0aG07XG4gICAgfVxuICAgIHNldFNwZWVkKG5ld1NwZWVkKSB7XG4gICAgICAgIGlmICh0aGlzLnNwZWVkID09PSBuZXdTcGVlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5zcGVlZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRoaXMuc3BlZWQgPSBuZXdTcGVlZDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2aXNpdGVkRGlmZmVyZW5jZSA9IGNvbnN0YW50c18xLlNQRUVEX01BUFBJTkdbbmV3U3BlZWRdLnRpbWUgLyBjb25zdGFudHNfMS5TUEVFRF9NQVBQSU5HW3RoaXMuc3BlZWRdLnRpbWU7XG4gICAgICAgIGNvbnN0IHBhdGhEaWZmZXJlbmNlID0gY29uc3RhbnRzXzEuU1BFRURfTUFQUElOR1tuZXdTcGVlZF0ucGF0aFRpbWUgLyBjb25zdGFudHNfMS5TUEVFRF9NQVBQSU5HW3RoaXMuc3BlZWRdLnBhdGhUaW1lO1xuICAgICAgICBmb3IgKGNvbnN0IHRpbWVyIG9mIHRoaXMudGltZXJzKSB7XG4gICAgICAgICAgICBpZiAodGltZXIuYW5pbWF0aW9uVHlwZSA9PT0gJ3Nob3J0ZXN0LXBhdGgnKSB7XG4gICAgICAgICAgICAgICAgdGltZXIuc2V0UmVtYWluaW5nQnlGYWN0b3IocGF0aERpZmZlcmVuY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGltZXIuYW5pbWF0aW9uVHlwZSA9PT0gJ3RyYXZlbCcpIHtcbiAgICAgICAgICAgICAgICB0aW1lci5zZXRSZW1haW5pbmdCeUZhY3Rvcih2aXNpdGVkRGlmZmVyZW5jZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zcGVlZCA9IG5ld1NwZWVkO1xuICAgIH1cbiAgICBhcHBlbmRUaW1lcnMoX3RpbWVycykge1xuICAgICAgICB0aGlzLnRpbWVycyA9IFsuLi50aGlzLnRpbWVycywgLi4uX3RpbWVyc107XG4gICAgfVxuICAgIGNsZWFyVGltZXJzKCkge1xuICAgICAgICB0aGlzLnRpbWVycy5mb3JFYWNoKGVhY2hUaW1lciA9PiBlYWNoVGltZXIuY2xlYXIoKSk7XG4gICAgICAgIHRoaXMudGltZXJzID0gW107XG4gICAgfVxuICAgIHJlc3VtZVRpbWVycygpIHtcbiAgICAgICAgdGhpcy50aW1lcnMuZm9yRWFjaChlYWNoVGltZXIgPT4gZWFjaFRpbWVyLnJlc3VtZSgpKTtcbiAgICB9XG4gICAgcGF1c2VUaW1lcnMoKSB7XG4gICAgICAgIHRoaXMudGltZXJzLmZvckVhY2goZWFjaFRpbWVyID0+IGVhY2hUaW1lci5wYXVzZSgpKTtcbiAgICB9XG4gICAgc2V0Qm9hcmRTdGF0dXMobmV3Qm9hcmRTdGF0dXMpIHtcbiAgICAgICAgdGhpcy5ib2FyZFN0YXR1cyA9IG5ld0JvYXJkU3RhdHVzO1xuICAgICAgICBpZiAodGhpcy5ib2FyZFN0YXR1cyA9PT0gJ3N0YXJ0ZWQnKSB7XG4gICAgICAgICAgICB0aGlzLmlzUGxheWluZyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyVGltZXJzKCk7XG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZU5ld0RvbVN0YXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdmlzdWFsaXplQnV0dG9uLmRpc2FibGVkID1cbiAgICAgICAgICAgIHRoaXMuYWxnb3JpdGhtID09PSBudWxsIHx8IHRoaXMuYm9hcmRTdGF0dXMgPT09ICdzdGFydGVkJztcbiAgICB9XG4gICAgY2FsY3VsYXRlTmV3RG9tU3RhdGUoKSB7XG4gICAgICAgIGlmICh0aGlzLmFsZ29yaXRobSA9PT0gbnVsbCB8fCB0aGlzLmJvYXJkU3RhdHVzID09PSBudWxsKSB7XG4gICAgICAgICAgICBwbGF5UGF1c2VCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHBsYXlQYXVzZUJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICBpZiAodGhpcy5pc1BsYXlpbmcpIHtcbiAgICAgICAgICAgIHBsYXlQYXVzZUJ1dHRvbi5pbm5lclRleHQgPSAnUGF1c2UnO1xuICAgICAgICAgICAgcGxheVBhdXNlQnV0dG9uLmRhdGFzZXQucGxheXN0YXRlID0gJ3BhdXNlJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmJvYXJkU3RhdHVzID09PSAnc3RhcnRlZCcpIHtcbiAgICAgICAgICAgIHBsYXlQYXVzZUJ1dHRvbi5pbm5lclRleHQgPSAnUmVzdW1lJztcbiAgICAgICAgICAgIHBsYXlQYXVzZUJ1dHRvbi5kYXRhc2V0LnBsYXlzdGF0ZSA9ICdyZXN1bWUnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuYm9hcmRTdGF0dXMgPT09ICdjb21wbGV0ZWQnKSB7XG4gICAgICAgICAgICBwbGF5UGF1c2VCdXR0b24uaW5uZXJUZXh0ID0gJ1JldmlzdWFsaXplJztcbiAgICAgICAgICAgIHBsYXlQYXVzZUJ1dHRvbi5kYXRhc2V0LnBsYXlzdGF0ZSA9ICdyZXZpc3VhbGl6ZSc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhcnRPclN0b3BUaW1lcihuZXdTdGF0ZSkge1xuICAgICAgICB0aGlzLmlzUGxheWluZyA9IG5ld1N0YXRlO1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZU5ld0RvbVN0YXRlKCk7XG4gICAgfVxuICAgIHBsYXlPclBhdXNlVGltZXIoKSB7XG4gICAgICAgIHRoaXMuaXNQbGF5aW5nID0gIXRoaXMuaXNQbGF5aW5nO1xuICAgICAgICBpZiAodGhpcy5pc1BsYXlpbmcpIHtcbiAgICAgICAgICAgIHRoaXMucmVzdW1lVGltZXJzKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnBhdXNlVGltZXJzKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jYWxjdWxhdGVOZXdEb21TdGF0ZSgpO1xuICAgIH1cbn1cbmNvbnN0IHZpc3VhbGl6ZXJTdGF0ZSA9IG5ldyBWaXN1YWxpemVyU3RhdGUoKTtcbmZ1bmN0aW9uIG9uSW5kZXhBbmltYXRlZChhbmltYXRlZEluZGV4KSB7XG4gICAgdmlzdWFsaXplclN0YXRlLnRpbWVycy5zaGlmdCgpO1xuICAgIGlmIChhbmltYXRlZEluZGV4ID09PSAwKSB7XG4gICAgICAgIHZpc3VhbGl6ZXJTdGF0ZS5zZXRCb2FyZFN0YXR1cygnc3RhcnRlZCcpO1xuICAgICAgICB2aXN1YWxpemVyU3RhdGUuc3RhcnRPclN0b3BUaW1lcih0cnVlKTtcbiAgICB9XG59XG5mdW5jdGlvbiBvblBhdGhBbmltYXRlZChhbmltYXRlZEluZGV4LCBub2Rlc1RvQW5pbWF0ZSkge1xuICAgIHZpc3VhbGl6ZXJTdGF0ZS50aW1lcnMuc2hpZnQoKTtcbiAgICBpZiAoYW5pbWF0ZWRJbmRleCA9PT0gbm9kZXNUb0FuaW1hdGUubGVuZ3RoIC0gMSkge1xuICAgICAgICB2aXN1YWxpemVyU3RhdGUuc2V0Qm9hcmRTdGF0dXMoJ2NvbXBsZXRlZCcpO1xuICAgICAgICB2aXN1YWxpemVyU3RhdGUuc3RhcnRPclN0b3BUaW1lcihmYWxzZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gY2FsY3VsYXRlQW5kTGF1bmNoQW5pbWF0aW9ucygpIHtcbiAgICBpZiAodmlzdWFsaXplclN0YXRlLmFsZ29yaXRobSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHsgZW5kTm9kZSwgbm9kZXNUb0FuaW1hdGUgfSA9IGJvYXJkLnN0YXJ0KHZpc3VhbGl6ZXJTdGF0ZS5hbGdvcml0aG0pO1xuICAgIGlmIChlbmROb2RlID09PSBudWxsKSB7XG4gICAgICAgICgwLCBtb2RhbF8xLmRlZmF1bHQpKCdFcnJvciEnLCAnQ2Fubm90IGZpbmQgcGF0aCB0byBnb2FsIGFzIHdlIGdvdCBibG9ja2VkIGJ5IHdhbGxzLiBLaW5kbHkgcmUtdHJ5LicpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHZpc2l0ZWRUaW1lcnMgPSAoMCwgYW5pbWF0ZV8xLnN0YXJ0VmlzaXRlZE5vZGVzQW5pbWF0aW9ucykobm9kZXNUb0FuaW1hdGUsIHZpc3VhbGl6ZXJTdGF0ZS5zcGVlZCwgYW5pbWF0ZWRJbmRleCA9PiB7XG4gICAgICAgIG9uSW5kZXhBbmltYXRlZChhbmltYXRlZEluZGV4KTtcbiAgICAgICAgaWYgKGFuaW1hdGVkSW5kZXggPT09IG5vZGVzVG9BbmltYXRlLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhdGhUaW1lcnMgPSAoMCwgYW5pbWF0ZV8xLnN0YXJ0U2hvcnRlc3RQYXRoQW5pbWF0aW9uKShlbmROb2RlLCBib2FyZC5ub2RlTWFwLCB2aXN1YWxpemVyU3RhdGUuc3BlZWQsIGluZGV4ID0+IG9uUGF0aEFuaW1hdGVkKGluZGV4LCBwYXRoVGltZXJzKSk7XG4gICAgICAgICAgICB2aXN1YWxpemVyU3RhdGUuYXBwZW5kVGltZXJzKHBhdGhUaW1lcnMpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgdmlzdWFsaXplclN0YXRlLmFwcGVuZFRpbWVycyh2aXNpdGVkVGltZXJzKTtcbn1cbmZ1bmN0aW9uIGluaXRpYWxpemVCdXR0b25FdmVudHMoKSB7XG4gICAgKDAsIHV0aWxzXzEuYWRkSHRtbEV2ZW50KSh2aXN1YWxpemVCdXR0b24sICgpID0+IHtcbiAgICAgICAgY2FsY3VsYXRlQW5kTGF1bmNoQW5pbWF0aW9ucygpO1xuICAgIH0pO1xuICAgICgwLCB1dGlsc18xLmFkZEh0bWxFdmVudCkoKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCdjbGVhci1ib2FyZCcpLCAoKSA9PiB7XG4gICAgICAgIGJvYXJkLmNsZWFyQm9hcmQoKTtcbiAgICAgICAgdmlzdWFsaXplclN0YXRlLnNldEJvYXJkU3RhdHVzKG51bGwpO1xuICAgIH0pO1xuICAgICgwLCB1dGlsc18xLmFkZEh0bWxFdmVudCkoKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCdjbGVhci13YWxscycpLCAoKSA9PiB7XG4gICAgICAgIGJvYXJkLmNsZWFyV2FsbHMoKTtcbiAgICAgICAgdmlzdWFsaXplclN0YXRlLnNldEJvYXJkU3RhdHVzKG51bGwpO1xuICAgIH0pO1xuICAgICgwLCB1dGlsc18xLmFkZEh0bWxFdmVudCkoKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCdjbGVhci1wYXRoJyksICgpID0+IHtcbiAgICAgICAgYm9hcmQuY2xlYXJQYXRoKCk7XG4gICAgICAgIHZpc3VhbGl6ZXJTdGF0ZS5zZXRCb2FyZFN0YXR1cyhudWxsKTtcbiAgICB9KTtcbiAgICAoMCwgdXRpbHNfMS5hZGRIdG1sRXZlbnQpKHBsYXlQYXVzZUJ1dHRvbiwgKCkgPT4ge1xuICAgICAgICBpZiAocGxheVBhdXNlQnV0dG9uLmRhdGFzZXQucGxheXN0YXRlID09PSAncmV2aXN1YWxpemUnKSB7XG4gICAgICAgICAgICBib2FyZC5jbGVhclBhdGgoKTtcbiAgICAgICAgICAgIHZpc3VhbGl6ZXJTdGF0ZS5zZXRCb2FyZFN0YXR1cyhudWxsKTtcbiAgICAgICAgICAgIGNhbGN1bGF0ZUFuZExhdW5jaEFuaW1hdGlvbnMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZpc3VhbGl6ZXJTdGF0ZS5wbGF5T3JQYXVzZVRpbWVyKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICAoMCwgdXRpbHNfMS5hZGRIdG1sRXZlbnQpKCgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnd2Fsa3Rocm91Z2gtdHV0b3JpYWwnKSwgKCkgPT4ge1xuICAgICAgICAoMCwgd2Fsa3Rocm91Z2hfMS5yZUluaXRpYXRlV2Fsa3Rocm91Z2gpKCk7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBhcHBseUNoYW5nZXNGb3JTcGVlZERyb3Bkb3duKHNwZWVkSWQpIHtcbiAgICBjb25zdCBzcGVlZHMgPSBPYmplY3Qua2V5cyhjb25zdGFudHNfMS5TUEVFRF9NQVBQSU5HKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNwZWVkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBtYXBwaW5nID0gY29uc3RhbnRzXzEuU1BFRURfTUFQUElOR1tzcGVlZHNbaV1dO1xuICAgICAgICBpZiAobWFwcGluZy5pZCA9PT0gc3BlZWRJZCkge1xuICAgICAgICAgICAgdmlzdWFsaXplclN0YXRlLnNldFNwZWVkKHNwZWVkc1tpXSk7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKG1hcHBpbmcuaWQpO1xuICAgICAgICAgICAgKDAsIHV0aWxzXzEuY2hhbmdlRHJvcGRvd25MYWJlbCkobm9kZSwgYFNwZWVkOiAke21hcHBpbmcubmFtZX1gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gaW5pdGlhbGl6ZURyb3Bkb3duRXZlbnRzKCkge1xuICAgICgwLCB1dGlsc18xLmdldE5vZGVzKSgnLmRyb3Bkb3duJykuZm9yRWFjaChlYWNoTm9kZSA9PiAoMCwgdXRpbHNfMS5hZGRIdG1sRXZlbnQpKGVhY2hOb2RlLCBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBldmVudC5jdXJyZW50VGFyZ2V0O1xuICAgICAgICBpZiAobm9kZS5jbGFzc0xpc3QuY29udGFpbnMoJ29wZW4nKSkge1xuICAgICAgICAgICAgbm9kZS5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBub2RlLmNsYXNzTGlzdC5hZGQoJ29wZW4nKTtcbiAgICAgICAgfVxuICAgIH0pKTtcbiAgICBjb25zdCBhbGxTcGVlZElkcyA9IE9iamVjdC52YWx1ZXMoY29uc3RhbnRzXzEuU1BFRURfTUFQUElORykubWFwKGVhY2hWYWx1ZSA9PiBlYWNoVmFsdWUuaWQpO1xuICAgIGFwcGx5Q2hhbmdlc0ZvclNwZWVkRHJvcGRvd24oY29uc3RhbnRzXzEuU1BFRURfTUFQUElORy5mYXN0LmlkKTtcbiAgICAoMCwgdXRpbHNfMS5nZXROb2RlcykoJy5kcm9wZG93bi1pdGVtJykuZm9yRWFjaChlYWNoTm9kZSA9PiAoMCwgdXRpbHNfMS5hZGRIdG1sRXZlbnQpKGVhY2hOb2RlLCBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBldmVudC5jdXJyZW50VGFyZ2V0O1xuICAgICAgICBPYmplY3QudmFsdWVzKGNvbnN0YW50c18xLkFMR09SSVRITV9NQVBQSU5HKS5mb3JFYWNoKGVhY2hDb25maWcgPT4ge1xuICAgICAgICAgICAgZWFjaENvbmZpZztcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGFsZ29yaXRobXMgPSBPYmplY3Qua2V5cyhjb25zdGFudHNfMS5BTEdPUklUSE1fTUFQUElORyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxnb3JpdGhtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gY29uc3RhbnRzXzEuQUxHT1JJVEhNX01BUFBJTkdbYWxnb3JpdGhtc1tpXV07XG4gICAgICAgICAgICBpZiAoY29uZmlnLmlkID09PSBub2RlLmlkKSB7XG4gICAgICAgICAgICAgICAgdmlzdWFsaXplclN0YXRlLnNldEFsZ29yaXRobShhbGdvcml0aG1zW2ldKTtcbiAgICAgICAgICAgICAgICAoMCwgdXRpbHNfMS5jaGFuZ2VEcm9wZG93bkxhYmVsKShub2RlLCBgQWxnb3JpdGhtOiAke2NvbmZpZy5uYW1lfWApO1xuICAgICAgICAgICAgICAgIHZpc3VhbGl6ZUJ1dHRvbi5pbm5lclRleHQgPSBgVmlzdWFsaXplICR7Y29uZmlnLm5hbWV9YDtcbiAgICAgICAgICAgICAgICB2aXN1YWxpemVCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFsbFNwZWVkSWRzLmluY2x1ZGVzKG5vZGUuaWQpKSB7XG4gICAgICAgICAgICBhcHBseUNoYW5nZXNGb3JTcGVlZERyb3Bkb3duKG5vZGUuaWQpO1xuICAgICAgICB9XG4gICAgfSkpO1xufVxuaW5pdGlhbGl6ZUJ1dHRvbkV2ZW50cygpO1xuaW5pdGlhbGl6ZURyb3Bkb3duRXZlbnRzKCk7XG4oMCwgd2Fsa3Rocm91Z2hfMS5zZXRVcFdhbGt0aHJvdWdoKSgpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG5mdW5jdGlvbiBzaG93TW9kYWwodGl0bGVUZXh0LCBkZXNjcmlwdGlvblRleHQpIHtcbiAgICBjb25zdCBvdmVybGF5Tm9kZSA9ICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnbW9kYWwtb3ZlcmxheScpO1xuICAgIG92ZXJsYXlOb2RlLmNsYXNzTGlzdC5hZGQoJ29wZW4nKTtcbiAgICAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ21vZGFsLXRpdGxlJykuaW5uZXJUZXh0ID0gdGl0bGVUZXh0O1xuICAgICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnbW9kYWwtZGVzY3JpcHRpb24nKS5pbm5lclRleHQgPSBkZXNjcmlwdGlvblRleHQ7XG4gICAgKDAsIHV0aWxzXzEuYWRkSHRtbEV2ZW50KSgoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ21vZGFsLWNsb3NlJyksICgpID0+IHtcbiAgICAgICAgb3ZlcmxheU5vZGUuY2xhc3NMaXN0LnJlbW92ZSgnb3BlbicpO1xuICAgIH0pO1xufVxuZXhwb3J0cy5kZWZhdWx0ID0gc2hvd01vZGFsO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBOb2RlIHtcbiAgICBjb25zdHJ1Y3RvcihfciwgX2MsIF9pZCwgX3N0YXR1cykge1xuICAgICAgICB0aGlzLnIgPSBfcjtcbiAgICAgICAgdGhpcy5jID0gX2M7XG4gICAgICAgIHRoaXMuaWQgPSBfaWQ7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gX3N0YXR1cztcbiAgICAgICAgdGhpcy5wcmV2aW91cyA9IG51bGw7XG4gICAgfVxuICAgIHNldFByZXZpb3VzKHByZXZpb3VzKSB7XG4gICAgICAgIHRoaXMucHJldmlvdXMgPSBwcmV2aW91cztcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBOb2RlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBUaW1lciB7XG4gICAgY29uc3RydWN0b3IoY2FsbGJhY2ssIGRlbGF5LCBhbmltYXRpb25UeXBlKSB7XG4gICAgICAgIHRoaXMuc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgICAgICB0aGlzLnJlbWFpbmluZyA9IGRlbGF5O1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIHRoaXMuaWQgPSBzZXRUaW1lb3V0KHRoaXMuY2FsbGJhY2ssIGRlbGF5KTtcbiAgICAgICAgdGhpcy5hbmltYXRpb25UeXBlID0gYW5pbWF0aW9uVHlwZTtcbiAgICB9XG4gICAgcGF1c2UoKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmlkKTtcbiAgICAgICAgdGhpcy5yZW1haW5pbmcgPSB0aGlzLnJlbWFpbmluZyAtIChEYXRlLm5vdygpIC0gdGhpcy5zdGFydCk7XG4gICAgfVxuICAgIHJlc3VtZSgpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuaWQpO1xuICAgICAgICB0aGlzLnN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdGhpcy5pZCA9IHNldFRpbWVvdXQodGhpcy5jYWxsYmFjaywgdGhpcy5yZW1haW5pbmcpO1xuICAgIH1cbiAgICBjbGVhcigpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuaWQpO1xuICAgIH1cbiAgICBzZXRSZW1haW5pbmdCeUZhY3RvcihmYWN0b3IpIHtcbiAgICAgICAgdGhpcy5yZW1haW5pbmcgKj0gZmFjdG9yO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IFRpbWVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmNoYW5nZURyb3Bkb3duTGFiZWwgPSBleHBvcnRzLmFkZEh0bWxFdmVudCA9IGV4cG9ydHMuZ2V0Tm9kZUJ5SWQgPSBleHBvcnRzLmdldE5vZGVzID0gdm9pZCAwO1xuZnVuY3Rpb24gZ2V0Tm9kZXMoc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG59XG5leHBvcnRzLmdldE5vZGVzID0gZ2V0Tm9kZXM7XG5mdW5jdGlvbiBnZXROb2RlQnlJZChzZWxlY3RvcklkKSB7XG4gICAgY29uc3Qgbm9kZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNlbGVjdG9ySWQpO1xuICAgIGlmICghbm9kZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNlbGVjdG9yIG5vdCBmb3VuZDogJHtzZWxlY3RvcklkfWApO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbn1cbmV4cG9ydHMuZ2V0Tm9kZUJ5SWQgPSBnZXROb2RlQnlJZDtcbmZ1bmN0aW9uIGFkZEh0bWxFdmVudChub2RlLCBjYWxsYmFjaywgZXZlbnROYW1lID0gJ2NsaWNrJykge1xuICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrKTtcbn1cbmV4cG9ydHMuYWRkSHRtbEV2ZW50ID0gYWRkSHRtbEV2ZW50O1xuZnVuY3Rpb24gY2hhbmdlRHJvcGRvd25MYWJlbChub2RlLCB0ZXh0KSB7XG4gICAgdmFyIF9hLCBfYjtcbiAgICBjb25zdCBjb250cm9scyA9IChfYiA9IChfYSA9IG5vZGUucGFyZW50RWxlbWVudCkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnBhcmVudEVsZW1lbnQpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5xdWVyeVNlbGVjdG9yKCcuZHJvcGRvd24tY29udHJvbHMnKTtcbiAgICBpZiAoIWNvbnRyb2xzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29udHJvbHMuaW5uZXJUZXh0ID0gdGV4dDtcbn1cbmV4cG9ydHMuY2hhbmdlRHJvcGRvd25MYWJlbCA9IGNoYW5nZURyb3Bkb3duTGFiZWw7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuc2V0VXBXYWxrdGhyb3VnaCA9IGV4cG9ydHMucmVJbml0aWF0ZVdhbGt0aHJvdWdoID0gdm9pZCAwO1xuY29uc3QgdXRpbHNfMSA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xuY29uc3QgY29uc3RhbnRzXzEgPSByZXF1aXJlKFwiLi9jb25zdGFudHNcIik7XG5sZXQgY3VycmVudEluZGV4ID0gMDtcbmZ1bmN0aW9uIGdvVG9JbmRleCgpIHtcbiAgICB2YXIgX2E7XG4gICAgY29uc3Qgb3ZlcmxheU5vZGUgPSAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ3dhbGt0aHJvdWdoLW92ZXJsYXknKTtcbiAgICBpZiAoY3VycmVudEluZGV4IDwgMCkge1xuICAgICAgICBvdmVybGF5Tm9kZS5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgb3ZlcmxheU5vZGUuY2xhc3NMaXN0LmFkZCgnb3BlbicpO1xuICAgIGNvbnN0IGlzTGFzdFBvc2l0aW9uID0gY3VycmVudEluZGV4ID09PSBjb25zdGFudHNfMS5XQUxLVEhST1VHSF9QT1NJVElPTlMubGVuZ3RoIC0gMTtcbiAgICAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ3dhbGt0aHJvdWdoLXNraXAnKS5zdHlsZS52aXNpYmlsaXR5ID0gaXNMYXN0UG9zaXRpb25cbiAgICAgICAgPyAnaGlkZGVuJ1xuICAgICAgICA6ICd2aXNpYmxlJztcbiAgICAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ3dhbGt0aHJvdWdoLW5leHQnKS5pbm5lclRleHQgPSBpc0xhc3RQb3NpdGlvblxuICAgICAgICA/ICdGaW5pc2ghJ1xuICAgICAgICA6ICdOZXh0JztcbiAgICBjb25zdCBjdXJyZW50U3RlcCA9IGNvbnN0YW50c18xLldBTEtUSFJPVUdIX1BPU0lUSU9OU1tjdXJyZW50SW5kZXhdO1xuICAgIGNvbnN0IHJlZmVyZW5jZVBvc2l0aW9uID0gKDAsIHV0aWxzXzEuZ2V0Tm9kZXMpKGN1cnJlbnRTdGVwLnJlZmVyZW5jZSlbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgY29udGFpbmVyTm9kZSA9ICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnd2Fsa3Rocm91Z2gtY29udGFpbmVyJyk7XG4gICAgY29uc3QgeERpc3BsYWNlbWVudCA9IHJlZmVyZW5jZVBvc2l0aW9uLnggKyBjdXJyZW50U3RlcC5sZWZ0O1xuICAgIGNvbnN0IHlEaXNwbGFjZW1lbnQgPSByZWZlcmVuY2VQb3NpdGlvbi55ICsgcmVmZXJlbmNlUG9zaXRpb24uaGVpZ2h0ICsgY3VycmVudFN0ZXAudG9wO1xuICAgIGNvbnRhaW5lck5vZGUuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke3hEaXNwbGFjZW1lbnR9cHgsICR7eURpc3BsYWNlbWVudH1weClgO1xuICAgIGlmIChjdXJyZW50SW5kZXggPiAwKSB7XG4gICAgICAgIGNvbnRhaW5lck5vZGUuY2xhc3NMaXN0LmFkZCgnd2l0aC10cmFuc2l0aW9uJyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb250YWluZXJOb2RlLmNsYXNzTGlzdC5yZW1vdmUoJ3dpdGgtdHJhbnNpdGlvbicpO1xuICAgIH1cbiAgICAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ3dhbGt0aHJvdWdoLXN0ZXBwZXInKS5pbm5lclRleHQgPSBgJHtjdXJyZW50SW5kZXggKyAxfSBvZiAke2NvbnN0YW50c18xLldBTEtUSFJPVUdIX1BPU0lUSU9OUy5sZW5ndGh9YDtcbiAgICAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ3dhbGt0aHJvdWdoLXRpdGxlJykuaW5uZXJUZXh0ID0gY3VycmVudFN0ZXAudGl0bGU7XG4gICAgKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCd3YWxrdGhyb3VnaC1kZXNjcmlwdGlvbicpLmlubmVyVGV4dCA9IGN1cnJlbnRTdGVwLmRlc2NyaXB0aW9uO1xuICAgIGNvbnN0IGltYWdlTm9kZSA9ICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnd2Fsa3Rocm91Z2gtaW1hZ2UnKTtcbiAgICBpZiAoY3VycmVudFN0ZXAuaW1hZ2UpIHtcbiAgICAgICAgaW1hZ2VOb2RlLmNsYXNzTGlzdC5hZGQoJ3ZhbGlkJyk7XG4gICAgICAgIGltYWdlTm9kZS5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBgdXJsKCR7Y3VycmVudFN0ZXAuaW1hZ2V9KWA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpbWFnZU5vZGUuY2xhc3NMaXN0LnJlbW92ZSgndmFsaWQnKTtcbiAgICB9XG4gICAgKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCd3YWxrdGhyb3VnaC1hcnJvdycpLmRhdGFzZXQuZGlyZWN0aW9uID1cbiAgICAgICAgKF9hID0gY3VycmVudFN0ZXAuZGlyZWN0aW9uKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiAndG9wLWxlZnQnO1xufVxuZnVuY3Rpb24gcmVJbml0aWF0ZVdhbGt0aHJvdWdoKCkge1xuICAgIGN1cnJlbnRJbmRleCA9IDA7XG4gICAgZ29Ub0luZGV4KCk7XG59XG5leHBvcnRzLnJlSW5pdGlhdGVXYWxrdGhyb3VnaCA9IHJlSW5pdGlhdGVXYWxrdGhyb3VnaDtcbmZ1bmN0aW9uIHNldFVwV2Fsa3Rocm91Z2goKSB7XG4gICAgaWYgKCFsb2NhbFN0b3JhZ2UuZ2V0SXRlbShjb25zdGFudHNfMS5XQUxLVEhST1VHSF9DT1VOVEVSX1NUT1JBR0VfS0VZKSkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHJlSW5pdGlhdGVXYWxrdGhyb3VnaCgpLCA2MDApO1xuICAgIH1cbiAgICAoMCwgdXRpbHNfMS5hZGRIdG1sRXZlbnQpKCgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnd2Fsa3Rocm91Z2gtc2tpcCcpLCAoKSA9PiB7XG4gICAgICAgIGN1cnJlbnRJbmRleCA9IC0xO1xuICAgICAgICBnb1RvSW5kZXgoKTtcbiAgICB9KTtcbiAgICAoMCwgdXRpbHNfMS5hZGRIdG1sRXZlbnQpKCgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnd2Fsa3Rocm91Z2gtbmV4dCcpLCAoKSA9PiB7XG4gICAgICAgIGN1cnJlbnRJbmRleCArPSAxO1xuICAgICAgICBpZiAoY3VycmVudEluZGV4ID09PSBjb25zdGFudHNfMS5XQUxLVEhST1VHSF9QT1NJVElPTlMubGVuZ3RoKSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShjb25zdGFudHNfMS5XQUxLVEhST1VHSF9DT1VOVEVSX1NUT1JBR0VfS0VZLCAnMScpO1xuICAgICAgICAgICAgY3VycmVudEluZGV4ID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgZ29Ub0luZGV4KCk7XG4gICAgfSk7XG59XG5leHBvcnRzLnNldFVwV2Fsa3Rocm91Z2ggPSBzZXRVcFdhbGt0aHJvdWdoO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2luZGV4LnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9