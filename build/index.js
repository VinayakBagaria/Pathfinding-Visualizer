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
        image: '/public/algorithm-selector.png',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uLy4vc3JjL2FuaW1hdGUudHMiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vLi9zcmMvYmZzLnRzIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uLy4vc3JjL2JvYXJkLnRzIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uLy4vc3JjL2NvbnN0YW50cy50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy9kZnMudHMiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vLi9zcmMvaGVscGVycy50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy9tb2RhbC50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy9ub2RlLnRzIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uLy4vc3JjL3RpbWVyLnRzIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uLy4vc3JjL3V0aWxzLnRzIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uLy4vc3JjL3dhbGt0aHJvdWdoLnRzIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuc3RhcnRTaG9ydGVzdFBhdGhBbmltYXRpb24gPSBleHBvcnRzLnN0YXJ0VmlzaXRlZE5vZGVzQW5pbWF0aW9ucyA9IHZvaWQgMDtcbmNvbnN0IHRpbWVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vdGltZXJcIikpO1xuY29uc3QgY29uc3RhbnRzXzEgPSByZXF1aXJlKFwiLi9jb25zdGFudHNcIik7XG5mdW5jdGlvbiBzdGFydFRpbWVyKG5vZGVzVG9BbmltYXRlLCBpbmRleCwgdGltZSwgYW5pbWF0aW9uVHlwZSwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gbmV3IHRpbWVyXzEuZGVmYXVsdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1RvQW5pbWF0ZVtpbmRleF07XG4gICAgICAgIGNvbnN0IGN1cnJlbnRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobm9kZS5pZCk7XG4gICAgICAgIGlmICghY3VycmVudEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5mb3VuZCBub2RlJyk7XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgndW52aXNpdGVkJyk7XG4gICAgICAgIGlmIChhbmltYXRpb25UeXBlID09PSAndHJhdmVsJykge1xuICAgICAgICAgICAgY3VycmVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY3VycmVudCcpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY3VycmVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnc2hvcnRlc3QtcGF0aCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhbmltYXRpb25UeXBlID09PSAndHJhdmVsJyAmJiBpbmRleCA+PSAxKSB7XG4gICAgICAgICAgICBjb25zdCBwcmV2aW91cyA9IG5vZGVzVG9BbmltYXRlW2luZGV4IC0gMV07XG4gICAgICAgICAgICBjb25zdCBwcmV2aW91c0VsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwcmV2aW91cy5pZCk7XG4gICAgICAgICAgICBpZiAoIXByZXZpb3VzRWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5mb3VuZCBub2RlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmV2aW91c0VsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnY3VycmVudCcpO1xuICAgICAgICAgICAgcHJldmlvdXNFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3Zpc2l0ZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBjYWxsYmFjayA9PT0gbnVsbCB8fCBjYWxsYmFjayA9PT0gdm9pZCAwID8gdm9pZCAwIDogY2FsbGJhY2soaW5kZXgpO1xuICAgIH0sIHRpbWUpO1xufVxuZnVuY3Rpb24gc3RhcnRWaXNpdGVkTm9kZXNBbmltYXRpb25zKG5vZGVzVG9BbmltYXRlLCBzcGVlZCwgY2FsbGJhY2spIHtcbiAgICBjb25zdCB0aW1lcnMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzVG9BbmltYXRlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRpbWVycy5wdXNoKHN0YXJ0VGltZXIobm9kZXNUb0FuaW1hdGUsIGksIChpICsgMSkgKiBjb25zdGFudHNfMS5TUEVFRF9NQVBQSU5HW3NwZWVkXS50aW1lLCAndHJhdmVsJywgY2FsbGJhY2spKTtcbiAgICB9XG4gICAgcmV0dXJuIHRpbWVycztcbn1cbmV4cG9ydHMuc3RhcnRWaXNpdGVkTm9kZXNBbmltYXRpb25zID0gc3RhcnRWaXNpdGVkTm9kZXNBbmltYXRpb25zO1xuZnVuY3Rpb24gc3RhcnRTaG9ydGVzdFBhdGhBbmltYXRpb24oZW5kTm9kZSwgbm9kZU1hcCwgc3BlZWQsIGNhbGxiYWNrKSB7XG4gICAgdmFyIF9hLCBfYjtcbiAgICBjb25zdCBzaG9ydGVzdFBhdGhzVG9BbmltYXRlID0gW107XG4gICAgbGV0IHByZXZpb3VzTm9kZSA9IGVuZE5vZGUucHJldmlvdXM7XG4gICAgd2hpbGUgKHByZXZpb3VzTm9kZSAhPT0gbnVsbCkge1xuICAgICAgICBzaG9ydGVzdFBhdGhzVG9BbmltYXRlLnVuc2hpZnQocHJldmlvdXNOb2RlKTtcbiAgICAgICAgcHJldmlvdXNOb2RlID0gKF9iID0gKF9hID0gbm9kZU1hcC5nZXQocHJldmlvdXNOb2RlLmlkKSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnByZXZpb3VzKSAhPT0gbnVsbCAmJiBfYiAhPT0gdm9pZCAwID8gX2IgOiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB0aW1lcnMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNob3J0ZXN0UGF0aHNUb0FuaW1hdGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGltZXJzLnB1c2goc3RhcnRUaW1lcihzaG9ydGVzdFBhdGhzVG9BbmltYXRlLCBpLCAoaSArIDEpICogY29uc3RhbnRzXzEuU1BFRURfTUFQUElOR1tzcGVlZF0ucGF0aFRpbWUsICdzaG9ydGVzdC1wYXRoJywgY2FsbGJhY2spKTtcbiAgICB9XG4gICAgcmV0dXJuIHRpbWVycztcbn1cbmV4cG9ydHMuc3RhcnRTaG9ydGVzdFBhdGhBbmltYXRpb24gPSBzdGFydFNob3J0ZXN0UGF0aEFuaW1hdGlvbjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgaGVscGVyc18xID0gcmVxdWlyZShcIi4vaGVscGVyc1wiKTtcbmZ1bmN0aW9uIGJmc0FsZ29yaXRobShzdGFydElkLCBlbmRJZCwgbm9kZU1hcCwgbm9kZXNUb0FuaW1hdGUpIHtcbiAgICBjb25zdCBxdWV1ZSA9IFtub2RlTWFwLmdldChzdGFydElkKV07XG4gICAgY29uc3QgdmlzaXRlZCA9IG5ldyBNYXAoKTtcbiAgICB2aXNpdGVkLnNldChzdGFydElkLCB0cnVlKTtcbiAgICB3aGlsZSAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBjdXJyZW50ID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZXNUb0FuaW1hdGUucHVzaChjdXJyZW50KTtcbiAgICAgICAgY3VycmVudC5zdGF0dXMgPSAndmlzaXRlZCc7XG4gICAgICAgIGlmIChjdXJyZW50LmlkID09PSBlbmRJZCkge1xuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmVpZ2hib3VycyA9ICgwLCBoZWxwZXJzXzEuZ2V0TmVpZ2hib3VycykoY3VycmVudC5pZCwgbm9kZU1hcCk7XG4gICAgICAgIGZvciAoY29uc3QgbmVpZ2hib3VyIG9mIG5laWdoYm91cnMpIHtcbiAgICAgICAgICAgIGlmICghdmlzaXRlZC5oYXMobmVpZ2hib3VyLmlkKSkge1xuICAgICAgICAgICAgICAgIHZpc2l0ZWQuc2V0KG5laWdoYm91ci5pZCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgbmVpZ2hib3VyLnByZXZpb3VzID0gY3VycmVudDtcbiAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKG5laWdoYm91cik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5leHBvcnRzLmRlZmF1bHQgPSBiZnNBbGdvcml0aG07XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IG5vZGVfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9ub2RlXCIpKTtcbmNvbnN0IGRmc18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2Rmc1wiKSk7XG5jb25zdCBiZnNfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9iZnNcIikpO1xuY29uc3QgaGVscGVyc18xID0gcmVxdWlyZShcIi4vaGVscGVyc1wiKTtcbmNsYXNzIEJvYXJkIHtcbiAgICBjb25zdHJ1Y3RvcihfYm9hcmROb2RlKSB7XG4gICAgICAgIHRoaXMuYm9hcmROb2RlID0gX2JvYXJkTm9kZTtcbiAgICAgICAgdGhpcy5zZXRJbml0aWFsQ29vcmRpbmF0ZXMoKTtcbiAgICAgICAgdGhpcy5kcmFnZ2luZyA9IHsgc3RhcnQ6IGZhbHNlLCBlbmQ6IGZhbHNlIH07XG4gICAgICAgIHRoaXMuaXNDcmVhdGluZ1dhbGwgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jcmVhdGVHcmlkKCk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICB9XG4gICAgc2V0SW5pdGlhbENvb3JkaW5hdGVzKCkge1xuICAgICAgICBjb25zdCB7IGhlaWdodCwgd2lkdGggfSA9IHRoaXMuYm9hcmROb2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodCAvIDI4O1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGggLyAyODtcbiAgICAgICAgY29uc3Qgc3RhcnRDb29yZHMgPSBbXG4gICAgICAgICAgICBNYXRoLmZsb29yKHRoaXMuaGVpZ2h0IC8gMiksXG4gICAgICAgICAgICBNYXRoLmZsb29yKHRoaXMud2lkdGggLyA0KSxcbiAgICAgICAgXTtcbiAgICAgICAgdGhpcy5zdGFydElkID0gKDAsIGhlbHBlcnNfMS5jcmVhdGVOb2RlSWQpKHN0YXJ0Q29vcmRzWzBdLCBzdGFydENvb3Jkc1sxXSk7XG4gICAgICAgIGNvbnN0IGVuZENvb3JkcyA9IFtcbiAgICAgICAgICAgIE1hdGguZmxvb3IodGhpcy5oZWlnaHQgLyAyKSxcbiAgICAgICAgICAgIDMgKiBNYXRoLmZsb29yKHRoaXMud2lkdGggLyA0KSxcbiAgICAgICAgXTtcbiAgICAgICAgdGhpcy5lbmRJZCA9ICgwLCBoZWxwZXJzXzEuY3JlYXRlTm9kZUlkKShlbmRDb29yZHNbMF0sIGVuZENvb3Jkc1sxXSk7XG4gICAgfVxuICAgIGNyZWF0ZUdyaWQoKSB7XG4gICAgICAgIHRoaXMubm9kZU1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5ub2Rlc1RvQW5pbWF0ZSA9IFtdO1xuICAgICAgICBsZXQgdGFibGVIdG1sID0gJyc7XG4gICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgdGhpcy5oZWlnaHQ7IHIrKykge1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRSb3cgPSAnJztcbiAgICAgICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgdGhpcy53aWR0aDsgYysrKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9kZUlkID0gKDAsIGhlbHBlcnNfMS5jcmVhdGVOb2RlSWQpKHIsIGMpO1xuICAgICAgICAgICAgICAgIGxldCBub2RlU3RhdHVzID0gJ3VudmlzaXRlZCc7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGVJZCA9PT0gdGhpcy5zdGFydElkKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVTdGF0dXMgPSAnc3RhcnQnO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0SWQgPSBub2RlSWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG5vZGVJZCA9PT0gdGhpcy5lbmRJZCkge1xuICAgICAgICAgICAgICAgICAgICBub2RlU3RhdHVzID0gJ2VuZCc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW5kSWQgPSBub2RlSWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGN1cnJlbnRSb3cgKz0gYDx0ZCBpZD0ke25vZGVJZH0gY2xhc3M9JHtub2RlU3RhdHVzfT48L3RkPmA7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9kZSA9IG5ldyBub2RlXzEuZGVmYXVsdChyLCBjLCBub2RlSWQsIG5vZGVTdGF0dXMpO1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZU1hcC5zZXQobm9kZUlkLCBub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRhYmxlSHRtbCArPSBgPHRyIGlkPVwicm93ICR7cn1cIj4ke2N1cnJlbnRSb3d9PC90cj5gO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYm9hcmROb2RlLmlubmVySFRNTCA9IHRhYmxlSHRtbDtcbiAgICB9XG4gICAgYWRkRXZlbnRMaXN0ZW5lcnMoKSB7XG4gICAgICAgIHRoaXMuYm9hcmROb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gdGhpcy5ub2RlTWFwLmdldChlbGVtZW50LmlkKTtcbiAgICAgICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub2RlLnN0YXR1cyA9PT0gJ3N0YXJ0Jykge1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3RhcnQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5zdGF0dXMgPT09ICdlbmQnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5lbmQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5zdGF0dXMgPT09ICd3YWxsJykge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTm9kZUVsZW1lbnQoZWxlbWVudC5pZCwgJ3VudmlzaXRlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NyZWF0aW5nV2FsbCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmJvYXJkTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZyA9IHsgc3RhcnQ6IGZhbHNlLCBlbmQ6IGZhbHNlIH07XG4gICAgICAgICAgICB0aGlzLmlzQ3JlYXRpbmdXYWxsID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmJvYXJkTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBldmVudCA9PiB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcuc3RhcnQgfHwgdGhpcy5kcmFnZ2luZy5lbmQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZy5zdGFydCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5pZCA9PT0gdGhpcy5lbmRJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTm9kZUVsZW1lbnQodGhpcy5zdGFydElkLCAndW52aXNpdGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTm9kZUVsZW1lbnQoZWxlbWVudC5pZCwgJ3N0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuZHJhZ2dpbmcuZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LmlkID09PSB0aGlzLnN0YXJ0SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZU5vZGVFbGVtZW50KHRoaXMuZW5kSWQsICd1bnZpc2l0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VOb2RlRWxlbWVudChlbGVtZW50LmlkLCAnZW5kJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5pc0NyZWF0aW5nV2FsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTm9kZUVsZW1lbnQoZWxlbWVudC5pZCwgJ3dhbGwnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNoYW5nZU5vZGVFbGVtZW50KG5vZGVJZCwgbmV3U3RhdHVzKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnROb2RlID0gdGhpcy5ub2RlTWFwLmdldChub2RlSWQpO1xuICAgICAgICBjb25zdCBjdXJyZW50RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG5vZGVJZCk7XG4gICAgICAgIGlmICghY3VycmVudE5vZGUgfHwgIWN1cnJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5ld1N0YXR1cyA9PT0gJ3dhbGwnICYmIFsnc3RhcnQnLCAnZW5kJ10uaW5jbHVkZXMoY3VycmVudE5vZGUuc3RhdHVzKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3J0ZXN0LXBhdGgnKTtcbiAgICAgICAgY3VycmVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgndmlzaXRlZCcpO1xuICAgICAgICBjdXJyZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdjdXJyZW50Jyk7XG4gICAgICAgIGN1cnJlbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3VudmlzaXRlZCcpO1xuICAgICAgICBjdXJyZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCd3YWxsJyk7XG4gICAgICAgIGN1cnJlbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQobmV3U3RhdHVzKTtcbiAgICAgICAgY3VycmVudE5vZGUuc3RhdHVzID0gbmV3U3RhdHVzO1xuICAgICAgICBpZiAobmV3U3RhdHVzID09PSAnc3RhcnQnKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0SWQgPSBjdXJyZW50Tm9kZS5pZDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmV3U3RhdHVzID09PSAnZW5kJykge1xuICAgICAgICAgICAgdGhpcy5lbmRJZCA9IGN1cnJlbnROb2RlLmlkO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3N0YXJ0Jyk7XG4gICAgICAgIGN1cnJlbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2VuZCcpO1xuICAgIH1cbiAgICBjbGVhckJvYXJkKCkge1xuICAgICAgICB0aGlzLnNldEluaXRpYWxDb29yZGluYXRlcygpO1xuICAgICAgICB0aGlzLmNyZWF0ZUdyaWQoKTtcbiAgICB9XG4gICAgY2xlYXJXYWxscygpIHtcbiAgICAgICAgZm9yIChjb25zdCBwYWlyIG9mIHRoaXMubm9kZU1hcCkge1xuICAgICAgICAgICAgaWYgKHBhaXJbMV0uc3RhdHVzID09PSAnd2FsbCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZU5vZGVFbGVtZW50KHBhaXJbMF0sICd1bnZpc2l0ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjbGVhclBhdGgoKSB7XG4gICAgICAgIGZvciAoY29uc3QgcGFpciBvZiB0aGlzLm5vZGVNYXApIHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnROb2RlSWQgPSBwYWlyWzBdO1xuICAgICAgICAgICAgaWYgKGN1cnJlbnROb2RlSWQgPT09IHRoaXMuc3RhcnRJZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTm9kZUVsZW1lbnQoY3VycmVudE5vZGVJZCwgJ3N0YXJ0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjdXJyZW50Tm9kZUlkID09PSB0aGlzLmVuZElkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VOb2RlRWxlbWVudChjdXJyZW50Tm9kZUlkLCAnZW5kJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChwYWlyWzFdLnN0YXR1cyA9PT0gJ3Zpc2l0ZWQnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VOb2RlRWxlbWVudChwYWlyWzBdLCAndW52aXNpdGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhcnQoYWxnb3JpdGhtKSB7XG4gICAgICAgIHRoaXMubm9kZXNUb0FuaW1hdGUgPSBbXTtcbiAgICAgICAgbGV0IGVuZE5vZGUgPSBudWxsO1xuICAgICAgICBpZiAoYWxnb3JpdGhtID09PSAnZGZzJykge1xuICAgICAgICAgICAgZW5kTm9kZSA9ICgwLCBkZnNfMS5kZWZhdWx0KSh0aGlzLnN0YXJ0SWQsIHRoaXMuZW5kSWQsIHRoaXMubm9kZU1hcCwgdGhpcy5ub2Rlc1RvQW5pbWF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYWxnb3JpdGhtID09PSAnYmZzJykge1xuICAgICAgICAgICAgZW5kTm9kZSA9ICgwLCBiZnNfMS5kZWZhdWx0KSh0aGlzLnN0YXJ0SWQsIHRoaXMuZW5kSWQsIHRoaXMubm9kZU1hcCwgdGhpcy5ub2Rlc1RvQW5pbWF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFsZ29yaXRobSBub3QgaW1wbGVtZW50ZWQ6ICR7YWxnb3JpdGhtfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IGVuZE5vZGUsIG5vZGVzVG9BbmltYXRlOiB0aGlzLm5vZGVzVG9BbmltYXRlIH07XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gQm9hcmQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuV0FMS1RIUk9VR0hfUE9TSVRJT05TID0gZXhwb3J0cy5OT0RFX1RPX0lEX01BUFBJTkcgPSBleHBvcnRzLlNQRUVEX01BUFBJTkcgPSBleHBvcnRzLkFMR09SSVRITV9NQVBQSU5HID0gdm9pZCAwO1xuZXhwb3J0cy5BTEdPUklUSE1fTUFQUElORyA9IE9iamVjdC5mcmVlemUoe1xuICAgIGRmczoge1xuICAgICAgICBpZDogJ2Rmcy1hbGdvcml0aG0nLFxuICAgICAgICBuYW1lOiAnREZTJyxcbiAgICB9LFxuICAgIGJmczoge1xuICAgICAgICBpZDogJ2Jmcy1hbGdvcml0aG0nLFxuICAgICAgICBuYW1lOiAnQkZTJyxcbiAgICB9LFxufSk7XG5leHBvcnRzLlNQRUVEX01BUFBJTkcgPSBPYmplY3QuZnJlZXplKHtcbiAgICBmYXN0OiB7XG4gICAgICAgIGlkOiAnZmFzdC1zcGVlZCcsXG4gICAgICAgIHRpbWU6IDUsXG4gICAgICAgIG5hbWU6ICdGYXN0JyxcbiAgICAgICAgcGF0aFRpbWU6IDUwLFxuICAgIH0sXG4gICAgYXZlcmFnZToge1xuICAgICAgICBpZDogJ2F2ZXJhZ2Utc3BlZWQnLFxuICAgICAgICB0aW1lOiAxMDAsXG4gICAgICAgIG5hbWU6ICdBdmVyYWdlJyxcbiAgICAgICAgcGF0aFRpbWU6IDE1MCxcbiAgICB9LFxuICAgIHNsb3c6IHtcbiAgICAgICAgaWQ6ICdzbG93LXNwZWVkJyxcbiAgICAgICAgdGltZTogMzAwLFxuICAgICAgICBuYW1lOiAnU2xvdycsXG4gICAgICAgIHBhdGhUaW1lOiA0MDAsXG4gICAgfSxcbn0pO1xuZXhwb3J0cy5OT0RFX1RPX0lEX01BUFBJTkcgPSBPYmplY3QuZnJlZXplKHtcbiAgICBib2FyZDogJ2JvYXJkJyxcbiAgICB2aXN1YWxpemVCdXR0b246ICd2aXN1YWxpemUnLFxuICAgIHBsYXlQYXVzZUJ1dHRvbjogJ3BsYXktcGF1c2UnLFxufSk7XG5leHBvcnRzLldBTEtUSFJPVUdIX1BPU0lUSU9OUyA9IFtcbiAgICB7XG4gICAgICAgIHJlZmVyZW5jZTogJyNhbGdvcml0aG1zJyxcbiAgICAgICAgdG9wOiAyNSxcbiAgICAgICAgbGVmdDogMCxcbiAgICAgICAgdGl0bGU6ICdQaWNrIGFuIGFsZ29yaXRobScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQ2hvb3NlIGFueSB0cmF2ZXJzYWwgYWxnb3JpdGhtIGZyb20gdGhpcyBtZW51LicsXG4gICAgICAgIGltYWdlOiAnL3B1YmxpYy9hbGdvcml0aG0tc2VsZWN0b3IucG5nJyxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgcmVmZXJlbmNlOiAnLnN0YXJ0JyxcbiAgICAgICAgdG9wOiAtMTUwLFxuICAgICAgICBsZWZ0OiAxMDAsXG4gICAgICAgIHRpdGxlOiAnQWRkIHdhbGxzJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdDbGljayBvbiB0aGUgZ3JpZCB0byBhZGQgYSB3YWxsLiBBIHBhdGggY2Fubm90IGNyb3NzIGEgd2FsbC4nLFxuICAgIH0sXG4gICAge1xuICAgICAgICByZWZlcmVuY2U6ICcuc3RhcnQnLFxuICAgICAgICB0b3A6IDEwLFxuICAgICAgICBsZWZ0OiAtMjAsXG4gICAgICAgIHRpdGxlOiAnRHJhZyBub2RlcycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnWW91IGNhbiBkcmFnIHRoZSBzdGFydCBhbmQgZW5kIHRhcmdldCB0byBhbnkgcGxhY2UgaW4gdGhlIGdyaWQuJyxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgcmVmZXJlbmNlOiAnI3Zpc3VhbGl6ZScsXG4gICAgICAgIHRvcDogMjUsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHRpdGxlOiAnQ29udHJvbHMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1lvdSBjYW4gc3RhcnQgdGhlIHZpc3VhbGl6YXRpb24sIHBhdXNlL3Jlc3VtZSBpdCBpbiBiZXR3ZWVuLCBhZGp1c3QgdGhlIHZpc3VhbGl6YXRpb24gc3BlZWQsIGNsZWFyIHRoZSBib2FyZCBmcm9tIHRoZSBjb250cm9scyBwYW5lbCBoZXJlLicsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHJlZmVyZW5jZTogJyN3YWxrdGhyb3VnaC10dXRvcmlhbCcsXG4gICAgICAgIHRvcDogMzAsXG4gICAgICAgIGxlZnQ6IC0yNzUsXG4gICAgICAgIHRpdGxlOiAnUmV2aXNpdCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnSWYgeW91IHdhbnQgdG8gc2VlIHRoaXMgdHV0b3JpYWwgYWdhaW4sIGNsaWNrIG9uIHRoaXMgaWNvbi4nLFxuICAgICAgICBkaXJlY3Rpb246ICdydGwnLFxuICAgIH0sXG5dO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBoZWxwZXJzXzEgPSByZXF1aXJlKFwiLi9oZWxwZXJzXCIpO1xuZnVuY3Rpb24gZGZzQWxnb3JpdGhtKHN0YXJ0SWQsIGVuZElkLCBub2RlTWFwLCBub2Rlc1RvQW5pbWF0ZSkge1xuICAgIGNvbnN0IHF1ZXVlID0gW25vZGVNYXAuZ2V0KHN0YXJ0SWQpXTtcbiAgICBjb25zdCB2aXNpdGVkID0gbmV3IE1hcCgpO1xuICAgIHdoaWxlIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBxdWV1ZS5wb3AoKTtcbiAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdmlzaXRlZC5zZXQoY3VycmVudC5pZCwgdHJ1ZSk7XG4gICAgICAgIG5vZGVzVG9BbmltYXRlLnB1c2goY3VycmVudCk7XG4gICAgICAgIGN1cnJlbnQuc3RhdHVzID0gJ3Zpc2l0ZWQnO1xuICAgICAgICBpZiAoY3VycmVudC5pZCA9PT0gZW5kSWQpIHtcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5laWdoYm91cnMgPSAoMCwgaGVscGVyc18xLmdldE5laWdoYm91cnMpKGN1cnJlbnQuaWQsIG5vZGVNYXApLnJldmVyc2UoKTtcbiAgICAgICAgZm9yIChjb25zdCBuZWlnaGJvdXIgb2YgbmVpZ2hib3Vycykge1xuICAgICAgICAgICAgaWYgKCF2aXNpdGVkLmhhcyhuZWlnaGJvdXIuaWQpKSB7XG4gICAgICAgICAgICAgICAgbmVpZ2hib3VyLnByZXZpb3VzID0gY3VycmVudDtcbiAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKG5laWdoYm91cik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5leHBvcnRzLmRlZmF1bHQgPSBkZnNBbGdvcml0aG07XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZ2V0TmVpZ2hib3VycyA9IGV4cG9ydHMuY3JlYXRlTm9kZUlkID0gdm9pZCAwO1xuZnVuY3Rpb24gY3JlYXRlTm9kZUlkKHIsIGMpIHtcbiAgICByZXR1cm4gYCR7cn0tJHtjfWA7XG59XG5leHBvcnRzLmNyZWF0ZU5vZGVJZCA9IGNyZWF0ZU5vZGVJZDtcbmZ1bmN0aW9uIGdldE5laWdoYm91cnMoY3VycmVudElkLCBub2RlTWFwKSB7XG4gICAgY29uc3QgY29vcmRpbmF0ZXMgPSBjdXJyZW50SWQuc3BsaXQoJy0nKTtcbiAgICBjb25zdCB4ID0gcGFyc2VJbnQoY29vcmRpbmF0ZXNbMF0sIDEwKTtcbiAgICBjb25zdCB5ID0gcGFyc2VJbnQoY29vcmRpbmF0ZXNbMV0sIDEwKTtcbiAgICBjb25zdCBuZWlnaGJvdXJzID0gW107XG4gICAgY29uc3QgY29tYmluYXRpb25zID0gW1xuICAgICAgICBbLTEsIDBdLFxuICAgICAgICBbMCwgMV0sXG4gICAgICAgIFsxLCAwXSxcbiAgICAgICAgWzAsIC0xXSxcbiAgICBdO1xuICAgIGZvciAoY29uc3QgY29tYmluYXRpb24gb2YgY29tYmluYXRpb25zKSB7XG4gICAgICAgIGNvbnN0IG5ld1ggPSB4ICsgY29tYmluYXRpb25bMF07XG4gICAgICAgIGNvbnN0IG5ld1kgPSB5ICsgY29tYmluYXRpb25bMV07XG4gICAgICAgIGNvbnN0IG5laWdoYm91ck5vZGUgPSBub2RlTWFwLmdldChjcmVhdGVOb2RlSWQobmV3WCwgbmV3WSkpO1xuICAgICAgICBpZiAodHlwZW9mIG5laWdoYm91ck5vZGUgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgICAgICBuZWlnaGJvdXJOb2RlLnN0YXR1cyAhPT0gJ3dhbGwnKSB7XG4gICAgICAgICAgICBuZWlnaGJvdXJzLnB1c2gobmVpZ2hib3VyTm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5laWdoYm91cnM7XG59XG5leHBvcnRzLmdldE5laWdoYm91cnMgPSBnZXROZWlnaGJvdXJzO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBib2FyZF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2JvYXJkXCIpKTtcbmNvbnN0IGFuaW1hdGVfMSA9IHJlcXVpcmUoXCIuL2FuaW1hdGVcIik7XG5jb25zdCBtb2RhbF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL21vZGFsXCIpKTtcbmNvbnN0IHdhbGt0aHJvdWdoXzEgPSByZXF1aXJlKFwiLi93YWxrdGhyb3VnaFwiKTtcbmNvbnN0IGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4vY29uc3RhbnRzXCIpO1xuY29uc3QgdXRpbHNfMSA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xuY29uc3QgYm9hcmROb2RlID0gKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKGNvbnN0YW50c18xLk5PREVfVE9fSURfTUFQUElORy5ib2FyZCk7XG5jb25zdCBib2FyZCA9IG5ldyBib2FyZF8xLmRlZmF1bHQoYm9hcmROb2RlKTtcbmNvbnN0IHZpc3VhbGl6ZUJ1dHRvbiA9ICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKShjb25zdGFudHNfMS5OT0RFX1RPX0lEX01BUFBJTkcudmlzdWFsaXplQnV0dG9uKTtcbmNvbnN0IHBsYXlQYXVzZUJ1dHRvbiA9ICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKShjb25zdGFudHNfMS5OT0RFX1RPX0lEX01BUFBJTkcucGxheVBhdXNlQnV0dG9uKTtcbmNsYXNzIFZpc3VhbGl6ZXJTdGF0ZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuYWxnb3JpdGhtID0gbnVsbDtcbiAgICAgICAgdGhpcy50aW1lcnMgPSBbXTtcbiAgICAgICAgdGhpcy5ib2FyZFN0YXR1cyA9IG51bGw7XG4gICAgfVxuICAgIHNldEFsZ29yaXRobShhbGdvcml0aG0pIHtcbiAgICAgICAgdGhpcy5hbGdvcml0aG0gPSBhbGdvcml0aG07XG4gICAgfVxuICAgIHNldFNwZWVkKHNwZWVkKSB7XG4gICAgICAgIHRoaXMuc3BlZWQgPSBzcGVlZDtcbiAgICB9XG4gICAgYXBwZW5kVGltZXJzKF90aW1lcnMpIHtcbiAgICAgICAgdGhpcy50aW1lcnMgPSBbLi4udGhpcy50aW1lcnMsIC4uLl90aW1lcnNdO1xuICAgIH1cbiAgICBjbGVhclRpbWVycygpIHtcbiAgICAgICAgdGhpcy50aW1lcnMuZm9yRWFjaChlYWNoVGltZXIgPT4gZWFjaFRpbWVyLmNsZWFyKCkpO1xuICAgICAgICB0aGlzLnRpbWVycyA9IFtdO1xuICAgIH1cbiAgICByZXN1bWVUaW1lcnMoKSB7XG4gICAgICAgIHRoaXMudGltZXJzLmZvckVhY2goZWFjaFRpbWVyID0+IGVhY2hUaW1lci5yZXN1bWUoKSk7XG4gICAgfVxuICAgIHBhdXNlVGltZXJzKCkge1xuICAgICAgICB0aGlzLnRpbWVycy5mb3JFYWNoKGVhY2hUaW1lciA9PiBlYWNoVGltZXIucGF1c2UoKSk7XG4gICAgfVxuICAgIHNldEJvYXJkU3RhdHVzKG5ld0JvYXJkU3RhdHVzKSB7XG4gICAgICAgIHRoaXMuYm9hcmRTdGF0dXMgPSBuZXdCb2FyZFN0YXR1cztcbiAgICAgICAgaWYgKHRoaXMuYm9hcmRTdGF0dXMgPT09ICdzdGFydGVkJykge1xuICAgICAgICAgICAgdGhpcy5pc1BsYXlpbmcgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jbGVhclRpbWVycygpO1xuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVOZXdEb21TdGF0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHZpc3VhbGl6ZUJ1dHRvbi5kaXNhYmxlZCA9XG4gICAgICAgICAgICB0aGlzLmFsZ29yaXRobSA9PT0gbnVsbCB8fCB0aGlzLmJvYXJkU3RhdHVzID09PSAnc3RhcnRlZCc7XG4gICAgfVxuICAgIGNhbGN1bGF0ZU5ld0RvbVN0YXRlKCkge1xuICAgICAgICBpZiAodGhpcy5hbGdvcml0aG0gPT09IG51bGwgfHwgdGhpcy5ib2FyZFN0YXR1cyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcGxheVBhdXNlQnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBwbGF5UGF1c2VCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuaXNQbGF5aW5nKSB7XG4gICAgICAgICAgICBwbGF5UGF1c2VCdXR0b24uaW5uZXJUZXh0ID0gJ1BhdXNlJztcbiAgICAgICAgICAgIHBsYXlQYXVzZUJ1dHRvbi5kYXRhc2V0LnBsYXlzdGF0ZSA9ICdwYXVzZSc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5ib2FyZFN0YXR1cyA9PT0gJ3N0YXJ0ZWQnKSB7XG4gICAgICAgICAgICBwbGF5UGF1c2VCdXR0b24uaW5uZXJUZXh0ID0gJ1Jlc3VtZSc7XG4gICAgICAgICAgICBwbGF5UGF1c2VCdXR0b24uZGF0YXNldC5wbGF5c3RhdGUgPSAncmVzdW1lJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmJvYXJkU3RhdHVzID09PSAnY29tcGxldGVkJykge1xuICAgICAgICAgICAgcGxheVBhdXNlQnV0dG9uLmlubmVyVGV4dCA9ICdSZXZpc3VhbGl6ZSc7XG4gICAgICAgICAgICBwbGF5UGF1c2VCdXR0b24uZGF0YXNldC5wbGF5c3RhdGUgPSAncmV2aXN1YWxpemUnO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXJ0T3JTdG9wVGltZXIobmV3U3RhdGUpIHtcbiAgICAgICAgdGhpcy5pc1BsYXlpbmcgPSBuZXdTdGF0ZTtcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVOZXdEb21TdGF0ZSgpO1xuICAgIH1cbiAgICBwbGF5T3JQYXVzZVRpbWVyKCkge1xuICAgICAgICB0aGlzLmlzUGxheWluZyA9ICF0aGlzLmlzUGxheWluZztcbiAgICAgICAgaWYgKHRoaXMuaXNQbGF5aW5nKSB7XG4gICAgICAgICAgICB0aGlzLnJlc3VtZVRpbWVycygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wYXVzZVRpbWVycygpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2FsY3VsYXRlTmV3RG9tU3RhdGUoKTtcbiAgICB9XG59XG5jb25zdCB2aXN1YWxpemVyU3RhdGUgPSBuZXcgVmlzdWFsaXplclN0YXRlKCk7XG5mdW5jdGlvbiBvbkluZGV4QW5pbWF0ZWQoYW5pbWF0ZWRJbmRleCkge1xuICAgIHZpc3VhbGl6ZXJTdGF0ZS50aW1lcnMuc2hpZnQoKTtcbiAgICBpZiAoYW5pbWF0ZWRJbmRleCA9PT0gMCkge1xuICAgICAgICB2aXN1YWxpemVyU3RhdGUuc2V0Qm9hcmRTdGF0dXMoJ3N0YXJ0ZWQnKTtcbiAgICAgICAgdmlzdWFsaXplclN0YXRlLnN0YXJ0T3JTdG9wVGltZXIodHJ1ZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gb25QYXRoQW5pbWF0ZWQoYW5pbWF0ZWRJbmRleCwgbm9kZXNUb0FuaW1hdGUpIHtcbiAgICB2aXN1YWxpemVyU3RhdGUudGltZXJzLnNoaWZ0KCk7XG4gICAgaWYgKGFuaW1hdGVkSW5kZXggPT09IG5vZGVzVG9BbmltYXRlLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgdmlzdWFsaXplclN0YXRlLnNldEJvYXJkU3RhdHVzKCdjb21wbGV0ZWQnKTtcbiAgICAgICAgdmlzdWFsaXplclN0YXRlLnN0YXJ0T3JTdG9wVGltZXIoZmFsc2UpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNhbGN1bGF0ZUFuZExhdW5jaEFuaW1hdGlvbnMoKSB7XG4gICAgaWYgKHZpc3VhbGl6ZXJTdGF0ZS5hbGdvcml0aG0gPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB7IGVuZE5vZGUsIG5vZGVzVG9BbmltYXRlIH0gPSBib2FyZC5zdGFydCh2aXN1YWxpemVyU3RhdGUuYWxnb3JpdGhtKTtcbiAgICBpZiAoZW5kTm9kZSA9PT0gbnVsbCkge1xuICAgICAgICAoMCwgbW9kYWxfMS5kZWZhdWx0KSgnRXJyb3IhJywgJ0Nhbm5vdCBmaW5kIHBhdGggdG8gZ29hbCBhcyB3ZSBnb3QgYmxvY2tlZCBieSB3YWxscy4gS2luZGx5IHJlLXRyeS4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBzcGVlZCA9IHZpc3VhbGl6ZXJTdGF0ZS5zcGVlZDtcbiAgICBjb25zdCB2aXNpdGVkVGltZXJzID0gKDAsIGFuaW1hdGVfMS5zdGFydFZpc2l0ZWROb2Rlc0FuaW1hdGlvbnMpKG5vZGVzVG9BbmltYXRlLCBzcGVlZCwgYW5pbWF0ZWRJbmRleCA9PiB7XG4gICAgICAgIG9uSW5kZXhBbmltYXRlZChhbmltYXRlZEluZGV4KTtcbiAgICAgICAgaWYgKGFuaW1hdGVkSW5kZXggPT09IG5vZGVzVG9BbmltYXRlLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhdGhUaW1lcnMgPSAoMCwgYW5pbWF0ZV8xLnN0YXJ0U2hvcnRlc3RQYXRoQW5pbWF0aW9uKShlbmROb2RlLCBib2FyZC5ub2RlTWFwLCBzcGVlZCwgaW5kZXggPT4gb25QYXRoQW5pbWF0ZWQoaW5kZXgsIHBhdGhUaW1lcnMpKTtcbiAgICAgICAgICAgIHZpc3VhbGl6ZXJTdGF0ZS5hcHBlbmRUaW1lcnMocGF0aFRpbWVycyk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB2aXN1YWxpemVyU3RhdGUuYXBwZW5kVGltZXJzKHZpc2l0ZWRUaW1lcnMpO1xufVxuZnVuY3Rpb24gaW5pdGlhbGl6ZUJ1dHRvbkV2ZW50cygpIHtcbiAgICAoMCwgdXRpbHNfMS5hZGRIdG1sRXZlbnQpKHZpc3VhbGl6ZUJ1dHRvbiwgKCkgPT4ge1xuICAgICAgICBjYWxjdWxhdGVBbmRMYXVuY2hBbmltYXRpb25zKCk7XG4gICAgfSk7XG4gICAgKDAsIHV0aWxzXzEuYWRkSHRtbEV2ZW50KSgoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ2NsZWFyLWJvYXJkJyksICgpID0+IHtcbiAgICAgICAgYm9hcmQuY2xlYXJCb2FyZCgpO1xuICAgICAgICB2aXN1YWxpemVyU3RhdGUuc2V0Qm9hcmRTdGF0dXMobnVsbCk7XG4gICAgfSk7XG4gICAgKDAsIHV0aWxzXzEuYWRkSHRtbEV2ZW50KSgoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ2NsZWFyLXdhbGxzJyksICgpID0+IHtcbiAgICAgICAgYm9hcmQuY2xlYXJXYWxscygpO1xuICAgICAgICB2aXN1YWxpemVyU3RhdGUuc2V0Qm9hcmRTdGF0dXMobnVsbCk7XG4gICAgfSk7XG4gICAgKDAsIHV0aWxzXzEuYWRkSHRtbEV2ZW50KSgoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ2NsZWFyLXBhdGgnKSwgKCkgPT4ge1xuICAgICAgICBib2FyZC5jbGVhclBhdGgoKTtcbiAgICAgICAgdmlzdWFsaXplclN0YXRlLnNldEJvYXJkU3RhdHVzKG51bGwpO1xuICAgIH0pO1xuICAgICgwLCB1dGlsc18xLmFkZEh0bWxFdmVudCkocGxheVBhdXNlQnV0dG9uLCAoKSA9PiB7XG4gICAgICAgIGlmIChwbGF5UGF1c2VCdXR0b24uZGF0YXNldC5wbGF5c3RhdGUgPT09ICdyZXZpc3VhbGl6ZScpIHtcbiAgICAgICAgICAgIGJvYXJkLmNsZWFyUGF0aCgpO1xuICAgICAgICAgICAgdmlzdWFsaXplclN0YXRlLnNldEJvYXJkU3RhdHVzKG51bGwpO1xuICAgICAgICAgICAgY2FsY3VsYXRlQW5kTGF1bmNoQW5pbWF0aW9ucygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmlzdWFsaXplclN0YXRlLnBsYXlPclBhdXNlVGltZXIoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgICgwLCB1dGlsc18xLmFkZEh0bWxFdmVudCkoKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCd3YWxrdGhyb3VnaC10dXRvcmlhbCcpLCAoKSA9PiB7XG4gICAgICAgICgwLCB3YWxrdGhyb3VnaF8xLnJlSW5pdGlhdGVXYWxrdGhyb3VnaCkoKTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGFwcGx5Q2hhbmdlc0ZvclNwZWVkRHJvcGRvd24oc3BlZWRJZCkge1xuICAgIGNvbnN0IHNwZWVkcyA9IE9iamVjdC5rZXlzKGNvbnN0YW50c18xLlNQRUVEX01BUFBJTkcpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3BlZWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG1hcHBpbmcgPSBjb25zdGFudHNfMS5TUEVFRF9NQVBQSU5HW3NwZWVkc1tpXV07XG4gICAgICAgIGlmIChtYXBwaW5nLmlkID09PSBzcGVlZElkKSB7XG4gICAgICAgICAgICB2aXN1YWxpemVyU3RhdGUuc2V0U3BlZWQoc3BlZWRzW2ldKTtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkobWFwcGluZy5pZCk7XG4gICAgICAgICAgICAoMCwgdXRpbHNfMS5jaGFuZ2VEcm9wZG93bkxhYmVsKShub2RlLCBgU3BlZWQ6ICR7bWFwcGluZy5uYW1lfWApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBpbml0aWFsaXplRHJvcGRvd25FdmVudHMoKSB7XG4gICAgKDAsIHV0aWxzXzEuZ2V0Tm9kZXMpKCcuZHJvcGRvd24nKS5mb3JFYWNoKGVhY2hOb2RlID0+ICgwLCB1dGlsc18xLmFkZEh0bWxFdmVudCkoZWFjaE5vZGUsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IGV2ZW50LmN1cnJlbnRUYXJnZXQ7XG4gICAgICAgIGlmIChub2RlLmNsYXNzTGlzdC5jb250YWlucygnb3BlbicpKSB7XG4gICAgICAgICAgICBub2RlLmNsYXNzTGlzdC5yZW1vdmUoJ29wZW4nKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG5vZGUuY2xhc3NMaXN0LmFkZCgnb3BlbicpO1xuICAgICAgICB9XG4gICAgfSkpO1xuICAgIGNvbnN0IGFsbFNwZWVkSWRzID0gT2JqZWN0LnZhbHVlcyhjb25zdGFudHNfMS5TUEVFRF9NQVBQSU5HKS5tYXAoZWFjaFZhbHVlID0+IGVhY2hWYWx1ZS5pZCk7XG4gICAgYXBwbHlDaGFuZ2VzRm9yU3BlZWREcm9wZG93bihjb25zdGFudHNfMS5TUEVFRF9NQVBQSU5HLmZhc3QuaWQpO1xuICAgICgwLCB1dGlsc18xLmdldE5vZGVzKSgnLmRyb3Bkb3duLWl0ZW0nKS5mb3JFYWNoKGVhY2hOb2RlID0+ICgwLCB1dGlsc18xLmFkZEh0bWxFdmVudCkoZWFjaE5vZGUsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IGV2ZW50LmN1cnJlbnRUYXJnZXQ7XG4gICAgICAgIE9iamVjdC52YWx1ZXMoY29uc3RhbnRzXzEuQUxHT1JJVEhNX01BUFBJTkcpLmZvckVhY2goZWFjaENvbmZpZyA9PiB7XG4gICAgICAgICAgICBlYWNoQ29uZmlnO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgYWxnb3JpdGhtcyA9IE9iamVjdC5rZXlzKGNvbnN0YW50c18xLkFMR09SSVRITV9NQVBQSU5HKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGdvcml0aG1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSBjb25zdGFudHNfMS5BTEdPUklUSE1fTUFQUElOR1thbGdvcml0aG1zW2ldXTtcbiAgICAgICAgICAgIGlmIChjb25maWcuaWQgPT09IG5vZGUuaWQpIHtcbiAgICAgICAgICAgICAgICB2aXN1YWxpemVyU3RhdGUuc2V0QWxnb3JpdGhtKGFsZ29yaXRobXNbaV0pO1xuICAgICAgICAgICAgICAgICgwLCB1dGlsc18xLmNoYW5nZURyb3Bkb3duTGFiZWwpKG5vZGUsIGBBbGdvcml0aG06ICR7Y29uZmlnLm5hbWV9YCk7XG4gICAgICAgICAgICAgICAgdmlzdWFsaXplQnV0dG9uLmlubmVyVGV4dCA9IGBWaXN1YWxpemUgJHtjb25maWcubmFtZX1gO1xuICAgICAgICAgICAgICAgIHZpc3VhbGl6ZUJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoYWxsU3BlZWRJZHMuaW5jbHVkZXMobm9kZS5pZCkpIHtcbiAgICAgICAgICAgIGFwcGx5Q2hhbmdlc0ZvclNwZWVkRHJvcGRvd24obm9kZS5pZCk7XG4gICAgICAgIH1cbiAgICB9KSk7XG59XG5pbml0aWFsaXplQnV0dG9uRXZlbnRzKCk7XG5pbml0aWFsaXplRHJvcGRvd25FdmVudHMoKTtcbigwLCB3YWxrdGhyb3VnaF8xLnNldFVwV2Fsa3Rocm91Z2gpKCk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHV0aWxzXzEgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcbmZ1bmN0aW9uIHNob3dNb2RhbCh0aXRsZVRleHQsIGRlc2NyaXB0aW9uVGV4dCkge1xuICAgIGNvbnN0IG92ZXJsYXlOb2RlID0gKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCdtb2RhbC1vdmVybGF5Jyk7XG4gICAgb3ZlcmxheU5vZGUuY2xhc3NMaXN0LmFkZCgnb3BlbicpO1xuICAgICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnbW9kYWwtdGl0bGUnKS5pbm5lclRleHQgPSB0aXRsZVRleHQ7XG4gICAgKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCdtb2RhbC1kZXNjcmlwdGlvbicpLmlubmVyVGV4dCA9IGRlc2NyaXB0aW9uVGV4dDtcbiAgICAoMCwgdXRpbHNfMS5hZGRIdG1sRXZlbnQpKCgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnbW9kYWwtY2xvc2UnKSwgKCkgPT4ge1xuICAgICAgICBvdmVybGF5Tm9kZS5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuJyk7XG4gICAgfSk7XG59XG5leHBvcnRzLmRlZmF1bHQgPSBzaG93TW9kYWw7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIE5vZGUge1xuICAgIGNvbnN0cnVjdG9yKF9yLCBfYywgX2lkLCBfc3RhdHVzKSB7XG4gICAgICAgIHRoaXMuciA9IF9yO1xuICAgICAgICB0aGlzLmMgPSBfYztcbiAgICAgICAgdGhpcy5pZCA9IF9pZDtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBfc3RhdHVzO1xuICAgICAgICB0aGlzLnByZXZpb3VzID0gbnVsbDtcbiAgICB9XG4gICAgc2V0UHJldmlvdXMocHJldmlvdXMpIHtcbiAgICAgICAgdGhpcy5wcmV2aW91cyA9IHByZXZpb3VzO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IE5vZGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIFRpbWVyIHtcbiAgICBjb25zdHJ1Y3RvcihjYWxsYmFjaywgZGVsYXkpIHtcbiAgICAgICAgdGhpcy5zdGFydCA9IERhdGUubm93KCk7XG4gICAgICAgIHRoaXMucmVtYWluaW5nID0gZGVsYXk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgdGhpcy5pZCA9IHNldFRpbWVvdXQodGhpcy5jYWxsYmFjaywgZGVsYXkpO1xuICAgIH1cbiAgICBwYXVzZSgpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuaWQpO1xuICAgICAgICB0aGlzLnJlbWFpbmluZyA9IHRoaXMucmVtYWluaW5nIC0gKERhdGUubm93KCkgLSB0aGlzLnN0YXJ0KTtcbiAgICB9XG4gICAgcmVzdW1lKCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5pZCk7XG4gICAgICAgIHRoaXMuc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgICAgICB0aGlzLmlkID0gc2V0VGltZW91dCh0aGlzLmNhbGxiYWNrLCB0aGlzLnJlbWFpbmluZyk7XG4gICAgfVxuICAgIGNsZWFyKCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5pZCk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gVGltZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuY2hhbmdlRHJvcGRvd25MYWJlbCA9IGV4cG9ydHMuYWRkSHRtbEV2ZW50ID0gZXhwb3J0cy5nZXROb2RlQnlJZCA9IGV4cG9ydHMuZ2V0Tm9kZXMgPSB2b2lkIDA7XG5mdW5jdGlvbiBnZXROb2RlcyhzZWxlY3Rvcikge1xuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbn1cbmV4cG9ydHMuZ2V0Tm9kZXMgPSBnZXROb2RlcztcbmZ1bmN0aW9uIGdldE5vZGVCeUlkKHNlbGVjdG9ySWQpIHtcbiAgICBjb25zdCBub2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0b3JJZCk7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgU2VsZWN0b3Igbm90IGZvdW5kOiAke3NlbGVjdG9ySWR9YCk7XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xufVxuZXhwb3J0cy5nZXROb2RlQnlJZCA9IGdldE5vZGVCeUlkO1xuZnVuY3Rpb24gYWRkSHRtbEV2ZW50KG5vZGUsIGNhbGxiYWNrLCBldmVudE5hbWUgPSAnY2xpY2snKSB7XG4gICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2spO1xufVxuZXhwb3J0cy5hZGRIdG1sRXZlbnQgPSBhZGRIdG1sRXZlbnQ7XG5mdW5jdGlvbiBjaGFuZ2VEcm9wZG93bkxhYmVsKG5vZGUsIHRleHQpIHtcbiAgICB2YXIgX2EsIF9iO1xuICAgIGNvbnN0IGNvbnRyb2xzID0gKF9iID0gKF9hID0gbm9kZS5wYXJlbnRFbGVtZW50KSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EucGFyZW50RWxlbWVudCkgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLnF1ZXJ5U2VsZWN0b3IoJy5kcm9wZG93bi1jb250cm9scycpO1xuICAgIGlmICghY29udHJvbHMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb250cm9scy5pbm5lclRleHQgPSB0ZXh0O1xufVxuZXhwb3J0cy5jaGFuZ2VEcm9wZG93bkxhYmVsID0gY2hhbmdlRHJvcGRvd25MYWJlbDtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5zZXRVcFdhbGt0aHJvdWdoID0gZXhwb3J0cy5yZUluaXRpYXRlV2Fsa3Rocm91Z2ggPSB2b2lkIDA7XG5jb25zdCB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG5jb25zdCBjb25zdGFudHNfMSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50c1wiKTtcbmxldCBjdXJyZW50SW5kZXggPSAwO1xuZnVuY3Rpb24gZ29Ub0luZGV4KCkge1xuICAgIHZhciBfYTtcbiAgICBjb25zdCBvdmVybGF5Tm9kZSA9ICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnd2Fsa3Rocm91Z2gtb3ZlcmxheScpO1xuICAgIGlmIChjdXJyZW50SW5kZXggPCAwKSB7XG4gICAgICAgIG92ZXJsYXlOb2RlLmNsYXNzTGlzdC5yZW1vdmUoJ29wZW4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBvdmVybGF5Tm9kZS5jbGFzc0xpc3QuYWRkKCdvcGVuJyk7XG4gICAgY29uc3QgY29udGFpbmVyTm9kZSA9ICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnd2Fsa3Rocm91Z2gtY29udGFpbmVyJyk7XG4gICAgY29uc3QgY3VycmVudFN0ZXAgPSBjb25zdGFudHNfMS5XQUxLVEhST1VHSF9QT1NJVElPTlNbY3VycmVudEluZGV4XTtcbiAgICBjb25zdCBwb3NpdGlvbnMgPSAoMCwgdXRpbHNfMS5nZXROb2RlcykoY3VycmVudFN0ZXAucmVmZXJlbmNlKVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb250YWluZXJOb2RlLnN0eWxlLnRvcCA9IGAke3Bvc2l0aW9ucy55ICsgcG9zaXRpb25zLmhlaWdodCArIGN1cnJlbnRTdGVwLnRvcH1weGA7XG4gICAgY29udGFpbmVyTm9kZS5zdHlsZS5sZWZ0ID0gYCR7cG9zaXRpb25zLnggKyBjdXJyZW50U3RlcC5sZWZ0fXB4YDtcbiAgICAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ3dhbGt0aHJvdWdoLXN0ZXBwZXInKS5pbm5lclRleHQgPSBgJHtjdXJyZW50SW5kZXggKyAxfSBvZiAke2NvbnN0YW50c18xLldBTEtUSFJPVUdIX1BPU0lUSU9OUy5sZW5ndGh9YDtcbiAgICAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ3dhbGt0aHJvdWdoLXRpdGxlJykuaW5uZXJUZXh0ID0gY3VycmVudFN0ZXAudGl0bGU7XG4gICAgKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCd3YWxrdGhyb3VnaC1kZXNjcmlwdGlvbicpLmlubmVyVGV4dCA9IGN1cnJlbnRTdGVwLmRlc2NyaXB0aW9uO1xuICAgIGNvbnN0IGltYWdlTm9kZSA9ICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnd2Fsa3Rocm91Z2gtaW1hZ2UnKTtcbiAgICBpZiAoY3VycmVudFN0ZXAuaW1hZ2UpIHtcbiAgICAgICAgaW1hZ2VOb2RlLmNsYXNzTGlzdC5hZGQoJ3ZhbGlkJyk7XG4gICAgICAgIGltYWdlTm9kZS5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBgdXJsKCR7Y3VycmVudFN0ZXAuaW1hZ2V9KWA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpbWFnZU5vZGUuY2xhc3NMaXN0LnJlbW92ZSgndmFsaWQnKTtcbiAgICB9XG4gICAgY29udGFpbmVyTm9kZS5kYXRhc2V0LmRpcmVjdGlvbiA9IChfYSA9IGN1cnJlbnRTdGVwLmRpcmVjdGlvbikgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogJ2x0cic7XG59XG5mdW5jdGlvbiByZUluaXRpYXRlV2Fsa3Rocm91Z2goKSB7XG4gICAgY3VycmVudEluZGV4ID0gMDtcbiAgICBnb1RvSW5kZXgoKTtcbn1cbmV4cG9ydHMucmVJbml0aWF0ZVdhbGt0aHJvdWdoID0gcmVJbml0aWF0ZVdhbGt0aHJvdWdoO1xuZnVuY3Rpb24gc2V0VXBXYWxrdGhyb3VnaCgpIHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHJlSW5pdGlhdGVXYWxrdGhyb3VnaCgpLCA2MDApO1xuICAgICgwLCB1dGlsc18xLmFkZEh0bWxFdmVudCkoKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCd3YWxrdGhyb3VnaC1za2lwJyksICgpID0+IHtcbiAgICAgICAgY3VycmVudEluZGV4ID0gLTE7XG4gICAgICAgIGdvVG9JbmRleCgpO1xuICAgIH0pO1xuICAgICgwLCB1dGlsc18xLmFkZEh0bWxFdmVudCkoKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCd3YWxrdGhyb3VnaC1uZXh0JyksICgpID0+IHtcbiAgICAgICAgY3VycmVudEluZGV4ICs9IDE7XG4gICAgICAgIGlmIChjdXJyZW50SW5kZXggPT09IGNvbnN0YW50c18xLldBTEtUSFJPVUdIX1BPU0lUSU9OUy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGN1cnJlbnRJbmRleCA9IC0xO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlzTGFzdFBvc2l0aW9uID0gY3VycmVudEluZGV4ID09PSBjb25zdGFudHNfMS5XQUxLVEhST1VHSF9QT1NJVElPTlMubGVuZ3RoIC0gMTtcbiAgICAgICAgKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCd3YWxrdGhyb3VnaC1za2lwJykuc3R5bGUudmlzaWJpbGl0eSA9IGlzTGFzdFBvc2l0aW9uXG4gICAgICAgICAgICA/ICdoaWRkZW4nXG4gICAgICAgICAgICA6ICd2aXNpYmxlJztcbiAgICAgICAgKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCd3YWxrdGhyb3VnaC1uZXh0JykuaW5uZXJUZXh0ID0gaXNMYXN0UG9zaXRpb25cbiAgICAgICAgICAgID8gJ0ZpbmlzaCEnXG4gICAgICAgICAgICA6ICdOZXh0JztcbiAgICAgICAgZ29Ub0luZGV4KCk7XG4gICAgfSk7XG59XG5leHBvcnRzLnNldFVwV2Fsa3Rocm91Z2ggPSBzZXRVcFdhbGt0aHJvdWdoO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2luZGV4LnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9