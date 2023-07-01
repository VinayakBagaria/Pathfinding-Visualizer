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
    }, time);
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
exports.WALKTHROUGH_POSITIONS = exports.NODE_TO_ID_MAPPING = exports.SPEED_MAPPING = exports.ALGORITHM_MAPPING = void 0;
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
        image: './public/algorithm-selector.png',
    },
    {
        reference: '.start',
        top: -150,
        left: 100,
        title: 'Add walls',
        description: 'Click on the grid to add a wall. A path cannot cross a wall.',
    },
    {
        reference: '.start',
        top: 10,
        left: -20,
        title: 'Drag nodes',
        description: 'You can drag the start and end target to any place in the grid.',
    },
    {
        reference: '#visualize',
        top: 25,
        left: 0,
        title: 'Controls',
        description: 'You can start the visualization, pause/resume it in between, adjust the visualization speed, clear the board from the controls panel here.',
    },
    {
        reference: '#walkthrough-tutorial',
        top: 30,
        left: -275,
        title: 'Revisit',
        description: 'If you want to see this tutorial again, click on this icon.',
        direction: 'rtl',
    },
];


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
const constants_1 = __webpack_require__(/*! ./constants */ "./src/constants.ts");
const utils_1 = __webpack_require__(/*! ./utils */ "./src/utils.ts");
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
    setSpeed(speed) {
        this.speed = speed;
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
    const speed = visualizerState.speed;
    const visitedTimers = (0, animate_1.startVisitedNodesAnimations)(nodesToAnimate, speed, animatedIndex => {
        onIndexAnimated(animatedIndex);
        if (animatedIndex === nodesToAnimate.length - 1) {
            const pathTimers = (0, animate_1.startShortestPathAnimation)(endNode, board.nodeMap, speed, index => onPathAnimated(index, pathTimers));
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
    constructor(callback, delay) {
        this.start = Date.now();
        this.remaining = delay;
        this.callback = callback;
        this.id = setTimeout(this.callback, delay);
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
    const containerNode = (0, utils_1.getNodeById)('walkthrough-container');
    const currentStep = constants_1.WALKTHROUGH_POSITIONS[currentIndex];
    const positions = (0, utils_1.getNodes)(currentStep.reference)[0].getBoundingClientRect();
    containerNode.style.top = `${positions.y + positions.height + currentStep.top}px`;
    containerNode.style.left = `${positions.x + currentStep.left}px`;
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
    containerNode.dataset.direction = (_a = currentStep.direction) !== null && _a !== void 0 ? _a : 'ltr';
}
function reInitiateWalkthrough() {
    currentIndex = 0;
    goToIndex();
}
exports.reInitiateWalkthrough = reInitiateWalkthrough;
function setUpWalkthrough() {
    setTimeout(() => reInitiateWalkthrough(), 600);
    (0, utils_1.addHtmlEvent)((0, utils_1.getNodeById)('walkthrough-skip'), () => {
        currentIndex = -1;
        goToIndex();
    });
    (0, utils_1.addHtmlEvent)((0, utils_1.getNodeById)('walkthrough-next'), () => {
        currentIndex += 1;
        if (currentIndex === constants_1.WALKTHROUGH_POSITIONS.length) {
            currentIndex = -1;
        }
        const isLastPosition = currentIndex === constants_1.WALKTHROUGH_POSITIONS.length - 1;
        (0, utils_1.getNodeById)('walkthrough-skip').style.visibility = isLastPosition
            ? 'hidden'
            : 'visible';
        (0, utils_1.getNodeById)('walkthrough-next').innerText = isLastPosition
            ? 'Finish!'
            : 'Next';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uLy4vc3JjL2FuaW1hdGUudHMiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vLi9zcmMvYmZzLnRzIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uLy4vc3JjL2JvYXJkLnRzIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uLy4vc3JjL2NvbnN0YW50cy50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy9kZnMudHMiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vLi9zcmMvaGVscGVycy50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy9tb2RhbC50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy9ub2RlLnRzIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uLy4vc3JjL3RpbWVyLnRzIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uLy4vc3JjL3V0aWxzLnRzIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uLy4vc3JjL3dhbGt0aHJvdWdoLnRzIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuc3RhcnRTaG9ydGVzdFBhdGhBbmltYXRpb24gPSBleHBvcnRzLnN0YXJ0VmlzaXRlZE5vZGVzQW5pbWF0aW9ucyA9IHZvaWQgMDtcbmNvbnN0IHRpbWVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vdGltZXJcIikpO1xuY29uc3QgY29uc3RhbnRzXzEgPSByZXF1aXJlKFwiLi9jb25zdGFudHNcIik7XG5mdW5jdGlvbiBzdGFydFRpbWVyKG5vZGVzVG9BbmltYXRlLCBpbmRleCwgdGltZSwgYW5pbWF0aW9uVHlwZSwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gbmV3IHRpbWVyXzEuZGVmYXVsdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1RvQW5pbWF0ZVtpbmRleF07XG4gICAgICAgIGNvbnN0IGN1cnJlbnRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobm9kZS5pZCk7XG4gICAgICAgIGlmICghY3VycmVudEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5mb3VuZCBub2RlJyk7XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgndW52aXNpdGVkJyk7XG4gICAgICAgIGlmIChhbmltYXRpb25UeXBlID09PSAndHJhdmVsJykge1xuICAgICAgICAgICAgY3VycmVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY3VycmVudCcpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY3VycmVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnc2hvcnRlc3QtcGF0aCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhbmltYXRpb25UeXBlID09PSAndHJhdmVsJyAmJiBpbmRleCA+PSAxKSB7XG4gICAgICAgICAgICBjb25zdCBwcmV2aW91cyA9IG5vZGVzVG9BbmltYXRlW2luZGV4IC0gMV07XG4gICAgICAgICAgICBjb25zdCBwcmV2aW91c0VsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwcmV2aW91cy5pZCk7XG4gICAgICAgICAgICBpZiAoIXByZXZpb3VzRWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5mb3VuZCBub2RlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmV2aW91c0VsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnY3VycmVudCcpO1xuICAgICAgICAgICAgcHJldmlvdXNFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3Zpc2l0ZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBjYWxsYmFjayA9PT0gbnVsbCB8fCBjYWxsYmFjayA9PT0gdm9pZCAwID8gdm9pZCAwIDogY2FsbGJhY2soaW5kZXgpO1xuICAgIH0sIHRpbWUpO1xufVxuZnVuY3Rpb24gc3RhcnRWaXNpdGVkTm9kZXNBbmltYXRpb25zKG5vZGVzVG9BbmltYXRlLCBzcGVlZCwgY2FsbGJhY2spIHtcbiAgICBjb25zdCB0aW1lcnMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzVG9BbmltYXRlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRpbWVycy5wdXNoKHN0YXJ0VGltZXIobm9kZXNUb0FuaW1hdGUsIGksIChpICsgMSkgKiBjb25zdGFudHNfMS5TUEVFRF9NQVBQSU5HW3NwZWVkXS50aW1lLCAndHJhdmVsJywgY2FsbGJhY2spKTtcbiAgICB9XG4gICAgcmV0dXJuIHRpbWVycztcbn1cbmV4cG9ydHMuc3RhcnRWaXNpdGVkTm9kZXNBbmltYXRpb25zID0gc3RhcnRWaXNpdGVkTm9kZXNBbmltYXRpb25zO1xuZnVuY3Rpb24gc3RhcnRTaG9ydGVzdFBhdGhBbmltYXRpb24oZW5kTm9kZSwgbm9kZU1hcCwgc3BlZWQsIGNhbGxiYWNrKSB7XG4gICAgdmFyIF9hLCBfYjtcbiAgICBjb25zdCBzaG9ydGVzdFBhdGhzVG9BbmltYXRlID0gW107XG4gICAgbGV0IHByZXZpb3VzTm9kZSA9IGVuZE5vZGUucHJldmlvdXM7XG4gICAgd2hpbGUgKHByZXZpb3VzTm9kZSAhPT0gbnVsbCkge1xuICAgICAgICBzaG9ydGVzdFBhdGhzVG9BbmltYXRlLnVuc2hpZnQocHJldmlvdXNOb2RlKTtcbiAgICAgICAgcHJldmlvdXNOb2RlID0gKF9iID0gKF9hID0gbm9kZU1hcC5nZXQocHJldmlvdXNOb2RlLmlkKSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnByZXZpb3VzKSAhPT0gbnVsbCAmJiBfYiAhPT0gdm9pZCAwID8gX2IgOiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB0aW1lcnMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNob3J0ZXN0UGF0aHNUb0FuaW1hdGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGltZXJzLnB1c2goc3RhcnRUaW1lcihzaG9ydGVzdFBhdGhzVG9BbmltYXRlLCBpLCAoaSArIDEpICogY29uc3RhbnRzXzEuU1BFRURfTUFQUElOR1tzcGVlZF0ucGF0aFRpbWUsICdzaG9ydGVzdC1wYXRoJywgY2FsbGJhY2spKTtcbiAgICB9XG4gICAgcmV0dXJuIHRpbWVycztcbn1cbmV4cG9ydHMuc3RhcnRTaG9ydGVzdFBhdGhBbmltYXRpb24gPSBzdGFydFNob3J0ZXN0UGF0aEFuaW1hdGlvbjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgaGVscGVyc18xID0gcmVxdWlyZShcIi4vaGVscGVyc1wiKTtcbmZ1bmN0aW9uIGJmc0FsZ29yaXRobShzdGFydElkLCBlbmRJZCwgbm9kZU1hcCwgbm9kZXNUb0FuaW1hdGUpIHtcbiAgICBjb25zdCBxdWV1ZSA9IFtub2RlTWFwLmdldChzdGFydElkKV07XG4gICAgY29uc3QgdmlzaXRlZCA9IG5ldyBNYXAoKTtcbiAgICB2aXNpdGVkLnNldChzdGFydElkLCB0cnVlKTtcbiAgICB3aGlsZSAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBjdXJyZW50ID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZXNUb0FuaW1hdGUucHVzaChjdXJyZW50KTtcbiAgICAgICAgY3VycmVudC5zdGF0dXMgPSAndmlzaXRlZCc7XG4gICAgICAgIGlmIChjdXJyZW50LmlkID09PSBlbmRJZCkge1xuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmVpZ2hib3VycyA9ICgwLCBoZWxwZXJzXzEuZ2V0TmVpZ2hib3VycykoY3VycmVudC5pZCwgbm9kZU1hcCk7XG4gICAgICAgIGZvciAoY29uc3QgbmVpZ2hib3VyIG9mIG5laWdoYm91cnMpIHtcbiAgICAgICAgICAgIGlmICghdmlzaXRlZC5oYXMobmVpZ2hib3VyLmlkKSkge1xuICAgICAgICAgICAgICAgIHZpc2l0ZWQuc2V0KG5laWdoYm91ci5pZCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgbmVpZ2hib3VyLnByZXZpb3VzID0gY3VycmVudDtcbiAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKG5laWdoYm91cik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5leHBvcnRzLmRlZmF1bHQgPSBiZnNBbGdvcml0aG07XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IG5vZGVfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9ub2RlXCIpKTtcbmNvbnN0IGRmc18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2Rmc1wiKSk7XG5jb25zdCBiZnNfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9iZnNcIikpO1xuY29uc3QgaGVscGVyc18xID0gcmVxdWlyZShcIi4vaGVscGVyc1wiKTtcbmNsYXNzIEJvYXJkIHtcbiAgICBjb25zdHJ1Y3RvcihfYm9hcmROb2RlKSB7XG4gICAgICAgIHRoaXMuYm9hcmROb2RlID0gX2JvYXJkTm9kZTtcbiAgICAgICAgdGhpcy5zZXRJbml0aWFsQ29vcmRpbmF0ZXMoKTtcbiAgICAgICAgdGhpcy5kcmFnZ2luZyA9IHsgc3RhcnQ6IGZhbHNlLCBlbmQ6IGZhbHNlIH07XG4gICAgICAgIHRoaXMuaXNDcmVhdGluZ1dhbGwgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jcmVhdGVHcmlkKCk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICB9XG4gICAgc2V0SW5pdGlhbENvb3JkaW5hdGVzKCkge1xuICAgICAgICBjb25zdCB7IGhlaWdodCwgd2lkdGggfSA9IHRoaXMuYm9hcmROb2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodCAvIDI4O1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGggLyAyODtcbiAgICAgICAgY29uc3Qgc3RhcnRDb29yZHMgPSBbXG4gICAgICAgICAgICBNYXRoLmZsb29yKHRoaXMuaGVpZ2h0IC8gMiksXG4gICAgICAgICAgICBNYXRoLmZsb29yKHRoaXMud2lkdGggLyA0KSxcbiAgICAgICAgXTtcbiAgICAgICAgdGhpcy5zdGFydElkID0gKDAsIGhlbHBlcnNfMS5jcmVhdGVOb2RlSWQpKHN0YXJ0Q29vcmRzWzBdLCBzdGFydENvb3Jkc1sxXSk7XG4gICAgICAgIGNvbnN0IGVuZENvb3JkcyA9IFtcbiAgICAgICAgICAgIE1hdGguZmxvb3IodGhpcy5oZWlnaHQgLyAyKSxcbiAgICAgICAgICAgIDMgKiBNYXRoLmZsb29yKHRoaXMud2lkdGggLyA0KSxcbiAgICAgICAgXTtcbiAgICAgICAgdGhpcy5lbmRJZCA9ICgwLCBoZWxwZXJzXzEuY3JlYXRlTm9kZUlkKShlbmRDb29yZHNbMF0sIGVuZENvb3Jkc1sxXSk7XG4gICAgfVxuICAgIGNyZWF0ZUdyaWQoKSB7XG4gICAgICAgIHRoaXMubm9kZU1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5ub2Rlc1RvQW5pbWF0ZSA9IFtdO1xuICAgICAgICBsZXQgdGFibGVIdG1sID0gJyc7XG4gICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgdGhpcy5oZWlnaHQ7IHIrKykge1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRSb3cgPSAnJztcbiAgICAgICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgdGhpcy53aWR0aDsgYysrKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9kZUlkID0gKDAsIGhlbHBlcnNfMS5jcmVhdGVOb2RlSWQpKHIsIGMpO1xuICAgICAgICAgICAgICAgIGxldCBub2RlU3RhdHVzID0gJ3VudmlzaXRlZCc7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGVJZCA9PT0gdGhpcy5zdGFydElkKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVTdGF0dXMgPSAnc3RhcnQnO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0SWQgPSBub2RlSWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG5vZGVJZCA9PT0gdGhpcy5lbmRJZCkge1xuICAgICAgICAgICAgICAgICAgICBub2RlU3RhdHVzID0gJ2VuZCc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW5kSWQgPSBub2RlSWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGN1cnJlbnRSb3cgKz0gYDx0ZCBpZD0ke25vZGVJZH0gY2xhc3M9JHtub2RlU3RhdHVzfT48L3RkPmA7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9kZSA9IG5ldyBub2RlXzEuZGVmYXVsdChyLCBjLCBub2RlSWQsIG5vZGVTdGF0dXMpO1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZU1hcC5zZXQobm9kZUlkLCBub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRhYmxlSHRtbCArPSBgPHRyIGlkPVwicm93ICR7cn1cIj4ke2N1cnJlbnRSb3d9PC90cj5gO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYm9hcmROb2RlLmlubmVySFRNTCA9IHRhYmxlSHRtbDtcbiAgICB9XG4gICAgYWRkRXZlbnRMaXN0ZW5lcnMoKSB7XG4gICAgICAgIHRoaXMuYm9hcmROb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gdGhpcy5ub2RlTWFwLmdldChlbGVtZW50LmlkKTtcbiAgICAgICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub2RlLnN0YXR1cyA9PT0gJ3N0YXJ0Jykge1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3RhcnQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5zdGF0dXMgPT09ICdlbmQnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5lbmQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5zdGF0dXMgPT09ICd3YWxsJykge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTm9kZUVsZW1lbnQoZWxlbWVudC5pZCwgJ3VudmlzaXRlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NyZWF0aW5nV2FsbCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmJvYXJkTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZyA9IHsgc3RhcnQ6IGZhbHNlLCBlbmQ6IGZhbHNlIH07XG4gICAgICAgICAgICB0aGlzLmlzQ3JlYXRpbmdXYWxsID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmJvYXJkTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBldmVudCA9PiB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcuc3RhcnQgfHwgdGhpcy5kcmFnZ2luZy5lbmQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZy5zdGFydCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5pZCA9PT0gdGhpcy5lbmRJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTm9kZUVsZW1lbnQodGhpcy5zdGFydElkLCAndW52aXNpdGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTm9kZUVsZW1lbnQoZWxlbWVudC5pZCwgJ3N0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuZHJhZ2dpbmcuZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LmlkID09PSB0aGlzLnN0YXJ0SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZU5vZGVFbGVtZW50KHRoaXMuZW5kSWQsICd1bnZpc2l0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VOb2RlRWxlbWVudChlbGVtZW50LmlkLCAnZW5kJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5pc0NyZWF0aW5nV2FsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTm9kZUVsZW1lbnQoZWxlbWVudC5pZCwgJ3dhbGwnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNoYW5nZU5vZGVFbGVtZW50KG5vZGVJZCwgbmV3U3RhdHVzKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnROb2RlID0gdGhpcy5ub2RlTWFwLmdldChub2RlSWQpO1xuICAgICAgICBjb25zdCBjdXJyZW50RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG5vZGVJZCk7XG4gICAgICAgIGlmICghY3VycmVudE5vZGUgfHwgIWN1cnJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5ld1N0YXR1cyA9PT0gJ3dhbGwnICYmIFsnc3RhcnQnLCAnZW5kJ10uaW5jbHVkZXMoY3VycmVudE5vZGUuc3RhdHVzKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3J0ZXN0LXBhdGgnKTtcbiAgICAgICAgY3VycmVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgndmlzaXRlZCcpO1xuICAgICAgICBjdXJyZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdjdXJyZW50Jyk7XG4gICAgICAgIGN1cnJlbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3VudmlzaXRlZCcpO1xuICAgICAgICBjdXJyZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCd3YWxsJyk7XG4gICAgICAgIGN1cnJlbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQobmV3U3RhdHVzKTtcbiAgICAgICAgY3VycmVudE5vZGUuc3RhdHVzID0gbmV3U3RhdHVzO1xuICAgICAgICBpZiAobmV3U3RhdHVzID09PSAnc3RhcnQnKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0SWQgPSBjdXJyZW50Tm9kZS5pZDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmV3U3RhdHVzID09PSAnZW5kJykge1xuICAgICAgICAgICAgdGhpcy5lbmRJZCA9IGN1cnJlbnROb2RlLmlkO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3N0YXJ0Jyk7XG4gICAgICAgIGN1cnJlbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2VuZCcpO1xuICAgIH1cbiAgICBjbGVhckJvYXJkKCkge1xuICAgICAgICB0aGlzLnNldEluaXRpYWxDb29yZGluYXRlcygpO1xuICAgICAgICB0aGlzLmNyZWF0ZUdyaWQoKTtcbiAgICB9XG4gICAgY2xlYXJXYWxscygpIHtcbiAgICAgICAgZm9yIChjb25zdCBwYWlyIG9mIHRoaXMubm9kZU1hcCkge1xuICAgICAgICAgICAgaWYgKHBhaXJbMV0uc3RhdHVzID09PSAnd2FsbCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZU5vZGVFbGVtZW50KHBhaXJbMF0sICd1bnZpc2l0ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjbGVhclBhdGgoKSB7XG4gICAgICAgIGZvciAoY29uc3QgcGFpciBvZiB0aGlzLm5vZGVNYXApIHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnROb2RlSWQgPSBwYWlyWzBdO1xuICAgICAgICAgICAgaWYgKGN1cnJlbnROb2RlSWQgPT09IHRoaXMuc3RhcnRJZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTm9kZUVsZW1lbnQoY3VycmVudE5vZGVJZCwgJ3N0YXJ0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjdXJyZW50Tm9kZUlkID09PSB0aGlzLmVuZElkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VOb2RlRWxlbWVudChjdXJyZW50Tm9kZUlkLCAnZW5kJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChwYWlyWzFdLnN0YXR1cyA9PT0gJ3Zpc2l0ZWQnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VOb2RlRWxlbWVudChwYWlyWzBdLCAndW52aXNpdGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhcnQoYWxnb3JpdGhtKSB7XG4gICAgICAgIHRoaXMubm9kZXNUb0FuaW1hdGUgPSBbXTtcbiAgICAgICAgbGV0IGVuZE5vZGUgPSBudWxsO1xuICAgICAgICBpZiAoYWxnb3JpdGhtID09PSAnZGZzJykge1xuICAgICAgICAgICAgZW5kTm9kZSA9ICgwLCBkZnNfMS5kZWZhdWx0KSh0aGlzLnN0YXJ0SWQsIHRoaXMuZW5kSWQsIHRoaXMubm9kZU1hcCwgdGhpcy5ub2Rlc1RvQW5pbWF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYWxnb3JpdGhtID09PSAnYmZzJykge1xuICAgICAgICAgICAgZW5kTm9kZSA9ICgwLCBiZnNfMS5kZWZhdWx0KSh0aGlzLnN0YXJ0SWQsIHRoaXMuZW5kSWQsIHRoaXMubm9kZU1hcCwgdGhpcy5ub2Rlc1RvQW5pbWF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFsZ29yaXRobSBub3QgaW1wbGVtZW50ZWQ6ICR7YWxnb3JpdGhtfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IGVuZE5vZGUsIG5vZGVzVG9BbmltYXRlOiB0aGlzLm5vZGVzVG9BbmltYXRlIH07XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gQm9hcmQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuV0FMS1RIUk9VR0hfUE9TSVRJT05TID0gZXhwb3J0cy5OT0RFX1RPX0lEX01BUFBJTkcgPSBleHBvcnRzLlNQRUVEX01BUFBJTkcgPSBleHBvcnRzLkFMR09SSVRITV9NQVBQSU5HID0gdm9pZCAwO1xuZXhwb3J0cy5BTEdPUklUSE1fTUFQUElORyA9IE9iamVjdC5mcmVlemUoe1xuICAgIGRmczoge1xuICAgICAgICBpZDogJ2Rmcy1hbGdvcml0aG0nLFxuICAgICAgICBuYW1lOiAnREZTJyxcbiAgICB9LFxuICAgIGJmczoge1xuICAgICAgICBpZDogJ2Jmcy1hbGdvcml0aG0nLFxuICAgICAgICBuYW1lOiAnQkZTJyxcbiAgICB9LFxufSk7XG5leHBvcnRzLlNQRUVEX01BUFBJTkcgPSBPYmplY3QuZnJlZXplKHtcbiAgICBmYXN0OiB7XG4gICAgICAgIGlkOiAnZmFzdC1zcGVlZCcsXG4gICAgICAgIHRpbWU6IDUsXG4gICAgICAgIG5hbWU6ICdGYXN0JyxcbiAgICAgICAgcGF0aFRpbWU6IDUwLFxuICAgIH0sXG4gICAgYXZlcmFnZToge1xuICAgICAgICBpZDogJ2F2ZXJhZ2Utc3BlZWQnLFxuICAgICAgICB0aW1lOiAxMDAsXG4gICAgICAgIG5hbWU6ICdBdmVyYWdlJyxcbiAgICAgICAgcGF0aFRpbWU6IDE1MCxcbiAgICB9LFxuICAgIHNsb3c6IHtcbiAgICAgICAgaWQ6ICdzbG93LXNwZWVkJyxcbiAgICAgICAgdGltZTogMzAwLFxuICAgICAgICBuYW1lOiAnU2xvdycsXG4gICAgICAgIHBhdGhUaW1lOiA0MDAsXG4gICAgfSxcbn0pO1xuZXhwb3J0cy5OT0RFX1RPX0lEX01BUFBJTkcgPSBPYmplY3QuZnJlZXplKHtcbiAgICBib2FyZDogJ2JvYXJkJyxcbiAgICB2aXN1YWxpemVCdXR0b246ICd2aXN1YWxpemUnLFxuICAgIHBsYXlQYXVzZUJ1dHRvbjogJ3BsYXktcGF1c2UnLFxufSk7XG5leHBvcnRzLldBTEtUSFJPVUdIX1BPU0lUSU9OUyA9IFtcbiAgICB7XG4gICAgICAgIHJlZmVyZW5jZTogJyNhbGdvcml0aG1zJyxcbiAgICAgICAgdG9wOiAyNSxcbiAgICAgICAgbGVmdDogMCxcbiAgICAgICAgdGl0bGU6ICdQaWNrIGFuIGFsZ29yaXRobScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQ2hvb3NlIGFueSB0cmF2ZXJzYWwgYWxnb3JpdGhtIGZyb20gdGhpcyBtZW51LicsXG4gICAgICAgIGltYWdlOiAnLi9wdWJsaWMvYWxnb3JpdGhtLXNlbGVjdG9yLnBuZycsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHJlZmVyZW5jZTogJy5zdGFydCcsXG4gICAgICAgIHRvcDogLTE1MCxcbiAgICAgICAgbGVmdDogMTAwLFxuICAgICAgICB0aXRsZTogJ0FkZCB3YWxscycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQ2xpY2sgb24gdGhlIGdyaWQgdG8gYWRkIGEgd2FsbC4gQSBwYXRoIGNhbm5vdCBjcm9zcyBhIHdhbGwuJyxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgcmVmZXJlbmNlOiAnLnN0YXJ0JyxcbiAgICAgICAgdG9wOiAxMCxcbiAgICAgICAgbGVmdDogLTIwLFxuICAgICAgICB0aXRsZTogJ0RyYWcgbm9kZXMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1lvdSBjYW4gZHJhZyB0aGUgc3RhcnQgYW5kIGVuZCB0YXJnZXQgdG8gYW55IHBsYWNlIGluIHRoZSBncmlkLicsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHJlZmVyZW5jZTogJyN2aXN1YWxpemUnLFxuICAgICAgICB0b3A6IDI1LFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICB0aXRsZTogJ0NvbnRyb2xzJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdZb3UgY2FuIHN0YXJ0IHRoZSB2aXN1YWxpemF0aW9uLCBwYXVzZS9yZXN1bWUgaXQgaW4gYmV0d2VlbiwgYWRqdXN0IHRoZSB2aXN1YWxpemF0aW9uIHNwZWVkLCBjbGVhciB0aGUgYm9hcmQgZnJvbSB0aGUgY29udHJvbHMgcGFuZWwgaGVyZS4nLFxuICAgIH0sXG4gICAge1xuICAgICAgICByZWZlcmVuY2U6ICcjd2Fsa3Rocm91Z2gtdHV0b3JpYWwnLFxuICAgICAgICB0b3A6IDMwLFxuICAgICAgICBsZWZ0OiAtMjc1LFxuICAgICAgICB0aXRsZTogJ1JldmlzaXQnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0lmIHlvdSB3YW50IHRvIHNlZSB0aGlzIHR1dG9yaWFsIGFnYWluLCBjbGljayBvbiB0aGlzIGljb24uJyxcbiAgICAgICAgZGlyZWN0aW9uOiAncnRsJyxcbiAgICB9LFxuXTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgaGVscGVyc18xID0gcmVxdWlyZShcIi4vaGVscGVyc1wiKTtcbmZ1bmN0aW9uIGRmc0FsZ29yaXRobShzdGFydElkLCBlbmRJZCwgbm9kZU1hcCwgbm9kZXNUb0FuaW1hdGUpIHtcbiAgICBjb25zdCBxdWV1ZSA9IFtub2RlTWFwLmdldChzdGFydElkKV07XG4gICAgY29uc3QgdmlzaXRlZCA9IG5ldyBNYXAoKTtcbiAgICB3aGlsZSAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBjdXJyZW50ID0gcXVldWUucG9wKCk7XG4gICAgICAgIGlmICh0eXBlb2YgY3VycmVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHZpc2l0ZWQuc2V0KGN1cnJlbnQuaWQsIHRydWUpO1xuICAgICAgICBub2Rlc1RvQW5pbWF0ZS5wdXNoKGN1cnJlbnQpO1xuICAgICAgICBjdXJyZW50LnN0YXR1cyA9ICd2aXNpdGVkJztcbiAgICAgICAgaWYgKGN1cnJlbnQuaWQgPT09IGVuZElkKSB7XG4gICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZWlnaGJvdXJzID0gKDAsIGhlbHBlcnNfMS5nZXROZWlnaGJvdXJzKShjdXJyZW50LmlkLCBub2RlTWFwKS5yZXZlcnNlKCk7XG4gICAgICAgIGZvciAoY29uc3QgbmVpZ2hib3VyIG9mIG5laWdoYm91cnMpIHtcbiAgICAgICAgICAgIGlmICghdmlzaXRlZC5oYXMobmVpZ2hib3VyLmlkKSkge1xuICAgICAgICAgICAgICAgIG5laWdoYm91ci5wcmV2aW91cyA9IGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgcXVldWUucHVzaChuZWlnaGJvdXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuZXhwb3J0cy5kZWZhdWx0ID0gZGZzQWxnb3JpdGhtO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmdldE5laWdoYm91cnMgPSBleHBvcnRzLmNyZWF0ZU5vZGVJZCA9IHZvaWQgMDtcbmZ1bmN0aW9uIGNyZWF0ZU5vZGVJZChyLCBjKSB7XG4gICAgcmV0dXJuIGAke3J9LSR7Y31gO1xufVxuZXhwb3J0cy5jcmVhdGVOb2RlSWQgPSBjcmVhdGVOb2RlSWQ7XG5mdW5jdGlvbiBnZXROZWlnaGJvdXJzKGN1cnJlbnRJZCwgbm9kZU1hcCkge1xuICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gY3VycmVudElkLnNwbGl0KCctJyk7XG4gICAgY29uc3QgeCA9IHBhcnNlSW50KGNvb3JkaW5hdGVzWzBdLCAxMCk7XG4gICAgY29uc3QgeSA9IHBhcnNlSW50KGNvb3JkaW5hdGVzWzFdLCAxMCk7XG4gICAgY29uc3QgbmVpZ2hib3VycyA9IFtdO1xuICAgIGNvbnN0IGNvbWJpbmF0aW9ucyA9IFtcbiAgICAgICAgWy0xLCAwXSxcbiAgICAgICAgWzAsIDFdLFxuICAgICAgICBbMSwgMF0sXG4gICAgICAgIFswLCAtMV0sXG4gICAgXTtcbiAgICBmb3IgKGNvbnN0IGNvbWJpbmF0aW9uIG9mIGNvbWJpbmF0aW9ucykge1xuICAgICAgICBjb25zdCBuZXdYID0geCArIGNvbWJpbmF0aW9uWzBdO1xuICAgICAgICBjb25zdCBuZXdZID0geSArIGNvbWJpbmF0aW9uWzFdO1xuICAgICAgICBjb25zdCBuZWlnaGJvdXJOb2RlID0gbm9kZU1hcC5nZXQoY3JlYXRlTm9kZUlkKG5ld1gsIG5ld1kpKTtcbiAgICAgICAgaWYgKHR5cGVvZiBuZWlnaGJvdXJOb2RlICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAgICAgbmVpZ2hib3VyTm9kZS5zdGF0dXMgIT09ICd3YWxsJykge1xuICAgICAgICAgICAgbmVpZ2hib3Vycy5wdXNoKG5laWdoYm91ck5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZWlnaGJvdXJzO1xufVxuZXhwb3J0cy5nZXROZWlnaGJvdXJzID0gZ2V0TmVpZ2hib3VycztcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgYm9hcmRfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9ib2FyZFwiKSk7XG5jb25zdCBhbmltYXRlXzEgPSByZXF1aXJlKFwiLi9hbmltYXRlXCIpO1xuY29uc3QgbW9kYWxfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9tb2RhbFwiKSk7XG5jb25zdCB3YWxrdGhyb3VnaF8xID0gcmVxdWlyZShcIi4vd2Fsa3Rocm91Z2hcIik7XG5jb25zdCBjb25zdGFudHNfMSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50c1wiKTtcbmNvbnN0IHV0aWxzXzEgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcbmNvbnN0IGJvYXJkTm9kZSA9ICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKShjb25zdGFudHNfMS5OT0RFX1RPX0lEX01BUFBJTkcuYm9hcmQpO1xuY29uc3QgYm9hcmQgPSBuZXcgYm9hcmRfMS5kZWZhdWx0KGJvYXJkTm9kZSk7XG5jb25zdCB2aXN1YWxpemVCdXR0b24gPSAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoY29uc3RhbnRzXzEuTk9ERV9UT19JRF9NQVBQSU5HLnZpc3VhbGl6ZUJ1dHRvbik7XG5jb25zdCBwbGF5UGF1c2VCdXR0b24gPSAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoY29uc3RhbnRzXzEuTk9ERV9UT19JRF9NQVBQSU5HLnBsYXlQYXVzZUJ1dHRvbik7XG5jbGFzcyBWaXN1YWxpemVyU3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmFsZ29yaXRobSA9IG51bGw7XG4gICAgICAgIHRoaXMudGltZXJzID0gW107XG4gICAgICAgIHRoaXMuYm9hcmRTdGF0dXMgPSBudWxsO1xuICAgIH1cbiAgICBzZXRBbGdvcml0aG0oYWxnb3JpdGhtKSB7XG4gICAgICAgIHRoaXMuYWxnb3JpdGhtID0gYWxnb3JpdGhtO1xuICAgIH1cbiAgICBzZXRTcGVlZChzcGVlZCkge1xuICAgICAgICB0aGlzLnNwZWVkID0gc3BlZWQ7XG4gICAgfVxuICAgIGFwcGVuZFRpbWVycyhfdGltZXJzKSB7XG4gICAgICAgIHRoaXMudGltZXJzID0gWy4uLnRoaXMudGltZXJzLCAuLi5fdGltZXJzXTtcbiAgICB9XG4gICAgY2xlYXJUaW1lcnMoKSB7XG4gICAgICAgIHRoaXMudGltZXJzLmZvckVhY2goZWFjaFRpbWVyID0+IGVhY2hUaW1lci5jbGVhcigpKTtcbiAgICAgICAgdGhpcy50aW1lcnMgPSBbXTtcbiAgICB9XG4gICAgcmVzdW1lVGltZXJzKCkge1xuICAgICAgICB0aGlzLnRpbWVycy5mb3JFYWNoKGVhY2hUaW1lciA9PiBlYWNoVGltZXIucmVzdW1lKCkpO1xuICAgIH1cbiAgICBwYXVzZVRpbWVycygpIHtcbiAgICAgICAgdGhpcy50aW1lcnMuZm9yRWFjaChlYWNoVGltZXIgPT4gZWFjaFRpbWVyLnBhdXNlKCkpO1xuICAgIH1cbiAgICBzZXRCb2FyZFN0YXR1cyhuZXdCb2FyZFN0YXR1cykge1xuICAgICAgICB0aGlzLmJvYXJkU3RhdHVzID0gbmV3Qm9hcmRTdGF0dXM7XG4gICAgICAgIGlmICh0aGlzLmJvYXJkU3RhdHVzID09PSAnc3RhcnRlZCcpIHtcbiAgICAgICAgICAgIHRoaXMuaXNQbGF5aW5nID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJUaW1lcnMoKTtcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlTmV3RG9tU3RhdGUoKTtcbiAgICAgICAgfVxuICAgICAgICB2aXN1YWxpemVCdXR0b24uZGlzYWJsZWQgPVxuICAgICAgICAgICAgdGhpcy5hbGdvcml0aG0gPT09IG51bGwgfHwgdGhpcy5ib2FyZFN0YXR1cyA9PT0gJ3N0YXJ0ZWQnO1xuICAgIH1cbiAgICBjYWxjdWxhdGVOZXdEb21TdGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuYWxnb3JpdGhtID09PSBudWxsIHx8IHRoaXMuYm9hcmRTdGF0dXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHBsYXlQYXVzZUJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcGxheVBhdXNlQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLmlzUGxheWluZykge1xuICAgICAgICAgICAgcGxheVBhdXNlQnV0dG9uLmlubmVyVGV4dCA9ICdQYXVzZSc7XG4gICAgICAgICAgICBwbGF5UGF1c2VCdXR0b24uZGF0YXNldC5wbGF5c3RhdGUgPSAncGF1c2UnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuYm9hcmRTdGF0dXMgPT09ICdzdGFydGVkJykge1xuICAgICAgICAgICAgcGxheVBhdXNlQnV0dG9uLmlubmVyVGV4dCA9ICdSZXN1bWUnO1xuICAgICAgICAgICAgcGxheVBhdXNlQnV0dG9uLmRhdGFzZXQucGxheXN0YXRlID0gJ3Jlc3VtZSc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5ib2FyZFN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcpIHtcbiAgICAgICAgICAgIHBsYXlQYXVzZUJ1dHRvbi5pbm5lclRleHQgPSAnUmV2aXN1YWxpemUnO1xuICAgICAgICAgICAgcGxheVBhdXNlQnV0dG9uLmRhdGFzZXQucGxheXN0YXRlID0gJ3JldmlzdWFsaXplJztcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGFydE9yU3RvcFRpbWVyKG5ld1N0YXRlKSB7XG4gICAgICAgIHRoaXMuaXNQbGF5aW5nID0gbmV3U3RhdGU7XG4gICAgICAgIHRoaXMuY2FsY3VsYXRlTmV3RG9tU3RhdGUoKTtcbiAgICB9XG4gICAgcGxheU9yUGF1c2VUaW1lcigpIHtcbiAgICAgICAgdGhpcy5pc1BsYXlpbmcgPSAhdGhpcy5pc1BsYXlpbmc7XG4gICAgICAgIGlmICh0aGlzLmlzUGxheWluZykge1xuICAgICAgICAgICAgdGhpcy5yZXN1bWVUaW1lcnMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucGF1c2VUaW1lcnMoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbGN1bGF0ZU5ld0RvbVN0YXRlKCk7XG4gICAgfVxufVxuY29uc3QgdmlzdWFsaXplclN0YXRlID0gbmV3IFZpc3VhbGl6ZXJTdGF0ZSgpO1xuZnVuY3Rpb24gb25JbmRleEFuaW1hdGVkKGFuaW1hdGVkSW5kZXgpIHtcbiAgICB2aXN1YWxpemVyU3RhdGUudGltZXJzLnNoaWZ0KCk7XG4gICAgaWYgKGFuaW1hdGVkSW5kZXggPT09IDApIHtcbiAgICAgICAgdmlzdWFsaXplclN0YXRlLnNldEJvYXJkU3RhdHVzKCdzdGFydGVkJyk7XG4gICAgICAgIHZpc3VhbGl6ZXJTdGF0ZS5zdGFydE9yU3RvcFRpbWVyKHRydWUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIG9uUGF0aEFuaW1hdGVkKGFuaW1hdGVkSW5kZXgsIG5vZGVzVG9BbmltYXRlKSB7XG4gICAgdmlzdWFsaXplclN0YXRlLnRpbWVycy5zaGlmdCgpO1xuICAgIGlmIChhbmltYXRlZEluZGV4ID09PSBub2Rlc1RvQW5pbWF0ZS5sZW5ndGggLSAxKSB7XG4gICAgICAgIHZpc3VhbGl6ZXJTdGF0ZS5zZXRCb2FyZFN0YXR1cygnY29tcGxldGVkJyk7XG4gICAgICAgIHZpc3VhbGl6ZXJTdGF0ZS5zdGFydE9yU3RvcFRpbWVyKGZhbHNlKTtcbiAgICB9XG59XG5mdW5jdGlvbiBjYWxjdWxhdGVBbmRMYXVuY2hBbmltYXRpb25zKCkge1xuICAgIGlmICh2aXN1YWxpemVyU3RhdGUuYWxnb3JpdGhtID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgeyBlbmROb2RlLCBub2Rlc1RvQW5pbWF0ZSB9ID0gYm9hcmQuc3RhcnQodmlzdWFsaXplclN0YXRlLmFsZ29yaXRobSk7XG4gICAgaWYgKGVuZE5vZGUgPT09IG51bGwpIHtcbiAgICAgICAgKDAsIG1vZGFsXzEuZGVmYXVsdCkoJ0Vycm9yIScsICdDYW5ub3QgZmluZCBwYXRoIHRvIGdvYWwgYXMgd2UgZ290IGJsb2NrZWQgYnkgd2FsbHMuIEtpbmRseSByZS10cnkuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgc3BlZWQgPSB2aXN1YWxpemVyU3RhdGUuc3BlZWQ7XG4gICAgY29uc3QgdmlzaXRlZFRpbWVycyA9ICgwLCBhbmltYXRlXzEuc3RhcnRWaXNpdGVkTm9kZXNBbmltYXRpb25zKShub2Rlc1RvQW5pbWF0ZSwgc3BlZWQsIGFuaW1hdGVkSW5kZXggPT4ge1xuICAgICAgICBvbkluZGV4QW5pbWF0ZWQoYW5pbWF0ZWRJbmRleCk7XG4gICAgICAgIGlmIChhbmltYXRlZEluZGV4ID09PSBub2Rlc1RvQW5pbWF0ZS5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBjb25zdCBwYXRoVGltZXJzID0gKDAsIGFuaW1hdGVfMS5zdGFydFNob3J0ZXN0UGF0aEFuaW1hdGlvbikoZW5kTm9kZSwgYm9hcmQubm9kZU1hcCwgc3BlZWQsIGluZGV4ID0+IG9uUGF0aEFuaW1hdGVkKGluZGV4LCBwYXRoVGltZXJzKSk7XG4gICAgICAgICAgICB2aXN1YWxpemVyU3RhdGUuYXBwZW5kVGltZXJzKHBhdGhUaW1lcnMpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgdmlzdWFsaXplclN0YXRlLmFwcGVuZFRpbWVycyh2aXNpdGVkVGltZXJzKTtcbn1cbmZ1bmN0aW9uIGluaXRpYWxpemVCdXR0b25FdmVudHMoKSB7XG4gICAgKDAsIHV0aWxzXzEuYWRkSHRtbEV2ZW50KSh2aXN1YWxpemVCdXR0b24sICgpID0+IHtcbiAgICAgICAgY2FsY3VsYXRlQW5kTGF1bmNoQW5pbWF0aW9ucygpO1xuICAgIH0pO1xuICAgICgwLCB1dGlsc18xLmFkZEh0bWxFdmVudCkoKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCdjbGVhci1ib2FyZCcpLCAoKSA9PiB7XG4gICAgICAgIGJvYXJkLmNsZWFyQm9hcmQoKTtcbiAgICAgICAgdmlzdWFsaXplclN0YXRlLnNldEJvYXJkU3RhdHVzKG51bGwpO1xuICAgIH0pO1xuICAgICgwLCB1dGlsc18xLmFkZEh0bWxFdmVudCkoKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCdjbGVhci13YWxscycpLCAoKSA9PiB7XG4gICAgICAgIGJvYXJkLmNsZWFyV2FsbHMoKTtcbiAgICAgICAgdmlzdWFsaXplclN0YXRlLnNldEJvYXJkU3RhdHVzKG51bGwpO1xuICAgIH0pO1xuICAgICgwLCB1dGlsc18xLmFkZEh0bWxFdmVudCkoKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCdjbGVhci1wYXRoJyksICgpID0+IHtcbiAgICAgICAgYm9hcmQuY2xlYXJQYXRoKCk7XG4gICAgICAgIHZpc3VhbGl6ZXJTdGF0ZS5zZXRCb2FyZFN0YXR1cyhudWxsKTtcbiAgICB9KTtcbiAgICAoMCwgdXRpbHNfMS5hZGRIdG1sRXZlbnQpKHBsYXlQYXVzZUJ1dHRvbiwgKCkgPT4ge1xuICAgICAgICBpZiAocGxheVBhdXNlQnV0dG9uLmRhdGFzZXQucGxheXN0YXRlID09PSAncmV2aXN1YWxpemUnKSB7XG4gICAgICAgICAgICBib2FyZC5jbGVhclBhdGgoKTtcbiAgICAgICAgICAgIHZpc3VhbGl6ZXJTdGF0ZS5zZXRCb2FyZFN0YXR1cyhudWxsKTtcbiAgICAgICAgICAgIGNhbGN1bGF0ZUFuZExhdW5jaEFuaW1hdGlvbnMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZpc3VhbGl6ZXJTdGF0ZS5wbGF5T3JQYXVzZVRpbWVyKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICAoMCwgdXRpbHNfMS5hZGRIdG1sRXZlbnQpKCgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnd2Fsa3Rocm91Z2gtdHV0b3JpYWwnKSwgKCkgPT4ge1xuICAgICAgICAoMCwgd2Fsa3Rocm91Z2hfMS5yZUluaXRpYXRlV2Fsa3Rocm91Z2gpKCk7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBhcHBseUNoYW5nZXNGb3JTcGVlZERyb3Bkb3duKHNwZWVkSWQpIHtcbiAgICBjb25zdCBzcGVlZHMgPSBPYmplY3Qua2V5cyhjb25zdGFudHNfMS5TUEVFRF9NQVBQSU5HKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNwZWVkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBtYXBwaW5nID0gY29uc3RhbnRzXzEuU1BFRURfTUFQUElOR1tzcGVlZHNbaV1dO1xuICAgICAgICBpZiAobWFwcGluZy5pZCA9PT0gc3BlZWRJZCkge1xuICAgICAgICAgICAgdmlzdWFsaXplclN0YXRlLnNldFNwZWVkKHNwZWVkc1tpXSk7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKG1hcHBpbmcuaWQpO1xuICAgICAgICAgICAgKDAsIHV0aWxzXzEuY2hhbmdlRHJvcGRvd25MYWJlbCkobm9kZSwgYFNwZWVkOiAke21hcHBpbmcubmFtZX1gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gaW5pdGlhbGl6ZURyb3Bkb3duRXZlbnRzKCkge1xuICAgICgwLCB1dGlsc18xLmdldE5vZGVzKSgnLmRyb3Bkb3duJykuZm9yRWFjaChlYWNoTm9kZSA9PiAoMCwgdXRpbHNfMS5hZGRIdG1sRXZlbnQpKGVhY2hOb2RlLCBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBldmVudC5jdXJyZW50VGFyZ2V0O1xuICAgICAgICBpZiAobm9kZS5jbGFzc0xpc3QuY29udGFpbnMoJ29wZW4nKSkge1xuICAgICAgICAgICAgbm9kZS5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBub2RlLmNsYXNzTGlzdC5hZGQoJ29wZW4nKTtcbiAgICAgICAgfVxuICAgIH0pKTtcbiAgICBjb25zdCBhbGxTcGVlZElkcyA9IE9iamVjdC52YWx1ZXMoY29uc3RhbnRzXzEuU1BFRURfTUFQUElORykubWFwKGVhY2hWYWx1ZSA9PiBlYWNoVmFsdWUuaWQpO1xuICAgIGFwcGx5Q2hhbmdlc0ZvclNwZWVkRHJvcGRvd24oY29uc3RhbnRzXzEuU1BFRURfTUFQUElORy5mYXN0LmlkKTtcbiAgICAoMCwgdXRpbHNfMS5nZXROb2RlcykoJy5kcm9wZG93bi1pdGVtJykuZm9yRWFjaChlYWNoTm9kZSA9PiAoMCwgdXRpbHNfMS5hZGRIdG1sRXZlbnQpKGVhY2hOb2RlLCBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBldmVudC5jdXJyZW50VGFyZ2V0O1xuICAgICAgICBPYmplY3QudmFsdWVzKGNvbnN0YW50c18xLkFMR09SSVRITV9NQVBQSU5HKS5mb3JFYWNoKGVhY2hDb25maWcgPT4ge1xuICAgICAgICAgICAgZWFjaENvbmZpZztcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGFsZ29yaXRobXMgPSBPYmplY3Qua2V5cyhjb25zdGFudHNfMS5BTEdPUklUSE1fTUFQUElORyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxnb3JpdGhtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gY29uc3RhbnRzXzEuQUxHT1JJVEhNX01BUFBJTkdbYWxnb3JpdGhtc1tpXV07XG4gICAgICAgICAgICBpZiAoY29uZmlnLmlkID09PSBub2RlLmlkKSB7XG4gICAgICAgICAgICAgICAgdmlzdWFsaXplclN0YXRlLnNldEFsZ29yaXRobShhbGdvcml0aG1zW2ldKTtcbiAgICAgICAgICAgICAgICAoMCwgdXRpbHNfMS5jaGFuZ2VEcm9wZG93bkxhYmVsKShub2RlLCBgQWxnb3JpdGhtOiAke2NvbmZpZy5uYW1lfWApO1xuICAgICAgICAgICAgICAgIHZpc3VhbGl6ZUJ1dHRvbi5pbm5lclRleHQgPSBgVmlzdWFsaXplICR7Y29uZmlnLm5hbWV9YDtcbiAgICAgICAgICAgICAgICB2aXN1YWxpemVCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFsbFNwZWVkSWRzLmluY2x1ZGVzKG5vZGUuaWQpKSB7XG4gICAgICAgICAgICBhcHBseUNoYW5nZXNGb3JTcGVlZERyb3Bkb3duKG5vZGUuaWQpO1xuICAgICAgICB9XG4gICAgfSkpO1xufVxuaW5pdGlhbGl6ZUJ1dHRvbkV2ZW50cygpO1xuaW5pdGlhbGl6ZURyb3Bkb3duRXZlbnRzKCk7XG4oMCwgd2Fsa3Rocm91Z2hfMS5zZXRVcFdhbGt0aHJvdWdoKSgpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG5mdW5jdGlvbiBzaG93TW9kYWwodGl0bGVUZXh0LCBkZXNjcmlwdGlvblRleHQpIHtcbiAgICBjb25zdCBvdmVybGF5Tm9kZSA9ICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnbW9kYWwtb3ZlcmxheScpO1xuICAgIG92ZXJsYXlOb2RlLmNsYXNzTGlzdC5hZGQoJ29wZW4nKTtcbiAgICAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ21vZGFsLXRpdGxlJykuaW5uZXJUZXh0ID0gdGl0bGVUZXh0O1xuICAgICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnbW9kYWwtZGVzY3JpcHRpb24nKS5pbm5lclRleHQgPSBkZXNjcmlwdGlvblRleHQ7XG4gICAgKDAsIHV0aWxzXzEuYWRkSHRtbEV2ZW50KSgoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ21vZGFsLWNsb3NlJyksICgpID0+IHtcbiAgICAgICAgb3ZlcmxheU5vZGUuY2xhc3NMaXN0LnJlbW92ZSgnb3BlbicpO1xuICAgIH0pO1xufVxuZXhwb3J0cy5kZWZhdWx0ID0gc2hvd01vZGFsO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBOb2RlIHtcbiAgICBjb25zdHJ1Y3RvcihfciwgX2MsIF9pZCwgX3N0YXR1cykge1xuICAgICAgICB0aGlzLnIgPSBfcjtcbiAgICAgICAgdGhpcy5jID0gX2M7XG4gICAgICAgIHRoaXMuaWQgPSBfaWQ7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gX3N0YXR1cztcbiAgICAgICAgdGhpcy5wcmV2aW91cyA9IG51bGw7XG4gICAgfVxuICAgIHNldFByZXZpb3VzKHByZXZpb3VzKSB7XG4gICAgICAgIHRoaXMucHJldmlvdXMgPSBwcmV2aW91cztcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBOb2RlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBUaW1lciB7XG4gICAgY29uc3RydWN0b3IoY2FsbGJhY2ssIGRlbGF5KSB7XG4gICAgICAgIHRoaXMuc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgICAgICB0aGlzLnJlbWFpbmluZyA9IGRlbGF5O1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIHRoaXMuaWQgPSBzZXRUaW1lb3V0KHRoaXMuY2FsbGJhY2ssIGRlbGF5KTtcbiAgICB9XG4gICAgcGF1c2UoKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmlkKTtcbiAgICAgICAgdGhpcy5yZW1haW5pbmcgPSB0aGlzLnJlbWFpbmluZyAtIChEYXRlLm5vdygpIC0gdGhpcy5zdGFydCk7XG4gICAgfVxuICAgIHJlc3VtZSgpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuaWQpO1xuICAgICAgICB0aGlzLnN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdGhpcy5pZCA9IHNldFRpbWVvdXQodGhpcy5jYWxsYmFjaywgdGhpcy5yZW1haW5pbmcpO1xuICAgIH1cbiAgICBjbGVhcigpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuaWQpO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IFRpbWVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmNoYW5nZURyb3Bkb3duTGFiZWwgPSBleHBvcnRzLmFkZEh0bWxFdmVudCA9IGV4cG9ydHMuZ2V0Tm9kZUJ5SWQgPSBleHBvcnRzLmdldE5vZGVzID0gdm9pZCAwO1xuZnVuY3Rpb24gZ2V0Tm9kZXMoc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG59XG5leHBvcnRzLmdldE5vZGVzID0gZ2V0Tm9kZXM7XG5mdW5jdGlvbiBnZXROb2RlQnlJZChzZWxlY3RvcklkKSB7XG4gICAgY29uc3Qgbm9kZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNlbGVjdG9ySWQpO1xuICAgIGlmICghbm9kZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNlbGVjdG9yIG5vdCBmb3VuZDogJHtzZWxlY3RvcklkfWApO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbn1cbmV4cG9ydHMuZ2V0Tm9kZUJ5SWQgPSBnZXROb2RlQnlJZDtcbmZ1bmN0aW9uIGFkZEh0bWxFdmVudChub2RlLCBjYWxsYmFjaywgZXZlbnROYW1lID0gJ2NsaWNrJykge1xuICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrKTtcbn1cbmV4cG9ydHMuYWRkSHRtbEV2ZW50ID0gYWRkSHRtbEV2ZW50O1xuZnVuY3Rpb24gY2hhbmdlRHJvcGRvd25MYWJlbChub2RlLCB0ZXh0KSB7XG4gICAgdmFyIF9hLCBfYjtcbiAgICBjb25zdCBjb250cm9scyA9IChfYiA9IChfYSA9IG5vZGUucGFyZW50RWxlbWVudCkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnBhcmVudEVsZW1lbnQpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5xdWVyeVNlbGVjdG9yKCcuZHJvcGRvd24tY29udHJvbHMnKTtcbiAgICBpZiAoIWNvbnRyb2xzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29udHJvbHMuaW5uZXJUZXh0ID0gdGV4dDtcbn1cbmV4cG9ydHMuY2hhbmdlRHJvcGRvd25MYWJlbCA9IGNoYW5nZURyb3Bkb3duTGFiZWw7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuc2V0VXBXYWxrdGhyb3VnaCA9IGV4cG9ydHMucmVJbml0aWF0ZVdhbGt0aHJvdWdoID0gdm9pZCAwO1xuY29uc3QgdXRpbHNfMSA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xuY29uc3QgY29uc3RhbnRzXzEgPSByZXF1aXJlKFwiLi9jb25zdGFudHNcIik7XG5sZXQgY3VycmVudEluZGV4ID0gMDtcbmZ1bmN0aW9uIGdvVG9JbmRleCgpIHtcbiAgICB2YXIgX2E7XG4gICAgY29uc3Qgb3ZlcmxheU5vZGUgPSAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ3dhbGt0aHJvdWdoLW92ZXJsYXknKTtcbiAgICBpZiAoY3VycmVudEluZGV4IDwgMCkge1xuICAgICAgICBvdmVybGF5Tm9kZS5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgb3ZlcmxheU5vZGUuY2xhc3NMaXN0LmFkZCgnb3BlbicpO1xuICAgIGNvbnN0IGNvbnRhaW5lck5vZGUgPSAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ3dhbGt0aHJvdWdoLWNvbnRhaW5lcicpO1xuICAgIGNvbnN0IGN1cnJlbnRTdGVwID0gY29uc3RhbnRzXzEuV0FMS1RIUk9VR0hfUE9TSVRJT05TW2N1cnJlbnRJbmRleF07XG4gICAgY29uc3QgcG9zaXRpb25zID0gKDAsIHV0aWxzXzEuZ2V0Tm9kZXMpKGN1cnJlbnRTdGVwLnJlZmVyZW5jZSlbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29udGFpbmVyTm9kZS5zdHlsZS50b3AgPSBgJHtwb3NpdGlvbnMueSArIHBvc2l0aW9ucy5oZWlnaHQgKyBjdXJyZW50U3RlcC50b3B9cHhgO1xuICAgIGNvbnRhaW5lck5vZGUuc3R5bGUubGVmdCA9IGAke3Bvc2l0aW9ucy54ICsgY3VycmVudFN0ZXAubGVmdH1weGA7XG4gICAgKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCd3YWxrdGhyb3VnaC1zdGVwcGVyJykuaW5uZXJUZXh0ID0gYCR7Y3VycmVudEluZGV4ICsgMX0gb2YgJHtjb25zdGFudHNfMS5XQUxLVEhST1VHSF9QT1NJVElPTlMubGVuZ3RofWA7XG4gICAgKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCd3YWxrdGhyb3VnaC10aXRsZScpLmlubmVyVGV4dCA9IGN1cnJlbnRTdGVwLnRpdGxlO1xuICAgICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnd2Fsa3Rocm91Z2gtZGVzY3JpcHRpb24nKS5pbm5lclRleHQgPSBjdXJyZW50U3RlcC5kZXNjcmlwdGlvbjtcbiAgICBjb25zdCBpbWFnZU5vZGUgPSAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ3dhbGt0aHJvdWdoLWltYWdlJyk7XG4gICAgaWYgKGN1cnJlbnRTdGVwLmltYWdlKSB7XG4gICAgICAgIGltYWdlTm9kZS5jbGFzc0xpc3QuYWRkKCd2YWxpZCcpO1xuICAgICAgICBpbWFnZU5vZGUuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gYHVybCgke2N1cnJlbnRTdGVwLmltYWdlfSlgO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaW1hZ2VOb2RlLmNsYXNzTGlzdC5yZW1vdmUoJ3ZhbGlkJyk7XG4gICAgfVxuICAgIGNvbnRhaW5lck5vZGUuZGF0YXNldC5kaXJlY3Rpb24gPSAoX2EgPSBjdXJyZW50U3RlcC5kaXJlY3Rpb24pICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6ICdsdHInO1xufVxuZnVuY3Rpb24gcmVJbml0aWF0ZVdhbGt0aHJvdWdoKCkge1xuICAgIGN1cnJlbnRJbmRleCA9IDA7XG4gICAgZ29Ub0luZGV4KCk7XG59XG5leHBvcnRzLnJlSW5pdGlhdGVXYWxrdGhyb3VnaCA9IHJlSW5pdGlhdGVXYWxrdGhyb3VnaDtcbmZ1bmN0aW9uIHNldFVwV2Fsa3Rocm91Z2goKSB7XG4gICAgc2V0VGltZW91dCgoKSA9PiByZUluaXRpYXRlV2Fsa3Rocm91Z2goKSwgNjAwKTtcbiAgICAoMCwgdXRpbHNfMS5hZGRIdG1sRXZlbnQpKCgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnd2Fsa3Rocm91Z2gtc2tpcCcpLCAoKSA9PiB7XG4gICAgICAgIGN1cnJlbnRJbmRleCA9IC0xO1xuICAgICAgICBnb1RvSW5kZXgoKTtcbiAgICB9KTtcbiAgICAoMCwgdXRpbHNfMS5hZGRIdG1sRXZlbnQpKCgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnd2Fsa3Rocm91Z2gtbmV4dCcpLCAoKSA9PiB7XG4gICAgICAgIGN1cnJlbnRJbmRleCArPSAxO1xuICAgICAgICBpZiAoY3VycmVudEluZGV4ID09PSBjb25zdGFudHNfMS5XQUxLVEhST1VHSF9QT1NJVElPTlMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjdXJyZW50SW5kZXggPSAtMTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpc0xhc3RQb3NpdGlvbiA9IGN1cnJlbnRJbmRleCA9PT0gY29uc3RhbnRzXzEuV0FMS1RIUk9VR0hfUE9TSVRJT05TLmxlbmd0aCAtIDE7XG4gICAgICAgICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnd2Fsa3Rocm91Z2gtc2tpcCcpLnN0eWxlLnZpc2liaWxpdHkgPSBpc0xhc3RQb3NpdGlvblxuICAgICAgICAgICAgPyAnaGlkZGVuJ1xuICAgICAgICAgICAgOiAndmlzaWJsZSc7XG4gICAgICAgICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnd2Fsa3Rocm91Z2gtbmV4dCcpLmlubmVyVGV4dCA9IGlzTGFzdFBvc2l0aW9uXG4gICAgICAgICAgICA/ICdGaW5pc2ghJ1xuICAgICAgICAgICAgOiAnTmV4dCc7XG4gICAgICAgIGdvVG9JbmRleCgpO1xuICAgIH0pO1xufVxuZXhwb3J0cy5zZXRVcFdhbGt0aHJvdWdoID0gc2V0VXBXYWxrdGhyb3VnaDtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9pbmRleC50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==