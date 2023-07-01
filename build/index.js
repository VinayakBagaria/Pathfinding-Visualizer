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
        if (index >= 1 && animationType === 'travel') {
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
        description: 'Choose an algorithm from this menu.',
    },
    {
        reference: '.start',
        top: 0,
        left: 200,
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
        reference: '#page-title',
        top: 30,
        left: 0,
        title: 'Revisit',
        description: 'If you want to see this tutorial again, click on this title again.',
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
    setStarted(hasStarted) {
        this.hasStarted = hasStarted;
        if (this.hasStarted) {
            this.isPlaying = true;
        }
        else {
            this.clearTimers();
            this.calculateNewDomState();
        }
        visualizeButton.disabled = this.hasStarted;
    }
    calculateNewDomState() {
        playPauseButton.innerText = this.isPlaying ? 'Pause' : 'Resume';
        playPauseButton.disabled = !this.hasStarted;
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
        visualizerState.setStarted(true);
        visualizerState.startOrStopTimer(true);
    }
}
function onPathAnimated(animatedIndex, nodesToAnimate) {
    visualizerState.timers.shift();
    if (animatedIndex === nodesToAnimate.length - 1) {
        visualizerState.setStarted(false);
        visualizerState.startOrStopTimer(false);
    }
}
function initializeButtonEvents() {
    (0, utils_1.addHtmlEvent)(visualizeButton, () => {
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
    });
    (0, utils_1.getNodes)('#clear-board').forEach(eachNode => (0, utils_1.addHtmlEvent)(eachNode, () => {
        board.clearBoard();
        visualizerState.setStarted(false);
    }));
    (0, utils_1.getNodes)('#clear-walls').forEach(eachNode => (0, utils_1.addHtmlEvent)(eachNode, () => {
        board.clearWalls();
        visualizerState.setStarted(false);
    }));
    (0, utils_1.getNodes)('#clear-path').forEach(eachNode => (0, utils_1.addHtmlEvent)(eachNode, () => {
        board.clearPath();
        visualizerState.setStarted(false);
    }));
    (0, utils_1.addHtmlEvent)(playPauseButton, () => {
        visualizerState.playOrPauseTimer();
    });
    (0, utils_1.addHtmlEvent)((0, utils_1.getNodeById)('page-title'), () => {
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
    const allAlgorithmIds = Object.values(constants_1.ALGORITHM_MAPPING).map(eachValue => eachValue.id);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LG9CQUFvQixHQUFHLG1CQUFtQixHQUFHLGdCQUFnQjtBQUMzRjtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0EsK0NBQStDLFdBQVc7QUFDMUQ7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CO0FBQ25CO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCOzs7Ozs7Ozs7OztBQzNCZDtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCx3QkFBd0IsR0FBRyw2QkFBNkI7QUFDeEQsZ0JBQWdCLG1CQUFPLENBQUMsK0JBQVM7QUFDakMsb0JBQW9CLG1CQUFPLENBQUMsdUNBQWE7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQyxpREFBaUQ7QUFDbEYsa0NBQWtDLCtCQUErQjtBQUNqRSxtRUFBbUUsa0JBQWtCLEtBQUsseUNBQXlDO0FBQ25JO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0Esd0JBQXdCOzs7Ozs7O1VDekN4QjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vLi9zcmMvYW5pbWF0ZS50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy9iZnMudHMiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vLi9zcmMvYm9hcmQudHMiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vLi9zcmMvY29uc3RhbnRzLnRzIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uLy4vc3JjL2Rmcy50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy9oZWxwZXJzLnRzIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uLy4vc3JjL21vZGFsLnRzIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uLy4vc3JjL25vZGUudHMiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vLi9zcmMvdGltZXIudHMiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vLi9zcmMvdXRpbHMudHMiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vLi9zcmMvd2Fsa3Rocm91Z2gudHMiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5zdGFydFNob3J0ZXN0UGF0aEFuaW1hdGlvbiA9IGV4cG9ydHMuc3RhcnRWaXNpdGVkTm9kZXNBbmltYXRpb25zID0gdm9pZCAwO1xuY29uc3QgdGltZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi90aW1lclwiKSk7XG5jb25zdCBjb25zdGFudHNfMSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50c1wiKTtcbmZ1bmN0aW9uIHN0YXJ0VGltZXIobm9kZXNUb0FuaW1hdGUsIGluZGV4LCB0aW1lLCBhbmltYXRpb25UeXBlLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBuZXcgdGltZXJfMS5kZWZhdWx0KCgpID0+IHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzVG9BbmltYXRlW2luZGV4XTtcbiAgICAgICAgY29uc3QgY3VycmVudEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChub2RlLmlkKTtcbiAgICAgICAgaWYgKCFjdXJyZW50RWxlbWVudCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmZvdW5kIG5vZGUnKTtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCd1bnZpc2l0ZWQnKTtcbiAgICAgICAgaWYgKGFuaW1hdGlvblR5cGUgPT09ICd0cmF2ZWwnKSB7XG4gICAgICAgICAgICBjdXJyZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjdXJyZW50Jyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjdXJyZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdzaG9ydGVzdC1wYXRoJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluZGV4ID49IDEgJiYgYW5pbWF0aW9uVHlwZSA9PT0gJ3RyYXZlbCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzID0gbm9kZXNUb0FuaW1hdGVbaW5kZXggLSAxXTtcbiAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHByZXZpb3VzLmlkKTtcbiAgICAgICAgICAgIGlmICghcHJldmlvdXNFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmZvdW5kIG5vZGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByZXZpb3VzRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdjdXJyZW50Jyk7XG4gICAgICAgICAgICBwcmV2aW91c0VsZW1lbnQuY2xhc3NMaXN0LmFkZCgndmlzaXRlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrID09PSBudWxsIHx8IGNhbGxiYWNrID09PSB2b2lkIDAgPyB2b2lkIDAgOiBjYWxsYmFjayhpbmRleCk7XG4gICAgfSwgdGltZSk7XG59XG5mdW5jdGlvbiBzdGFydFZpc2l0ZWROb2Rlc0FuaW1hdGlvbnMobm9kZXNUb0FuaW1hdGUsIHNwZWVkLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IHRpbWVycyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXNUb0FuaW1hdGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGltZXJzLnB1c2goc3RhcnRUaW1lcihub2Rlc1RvQW5pbWF0ZSwgaSwgKGkgKyAxKSAqIGNvbnN0YW50c18xLlNQRUVEX01BUFBJTkdbc3BlZWRdLnRpbWUsICd0cmF2ZWwnLCBjYWxsYmFjaykpO1xuICAgIH1cbiAgICByZXR1cm4gdGltZXJzO1xufVxuZXhwb3J0cy5zdGFydFZpc2l0ZWROb2Rlc0FuaW1hdGlvbnMgPSBzdGFydFZpc2l0ZWROb2Rlc0FuaW1hdGlvbnM7XG5mdW5jdGlvbiBzdGFydFNob3J0ZXN0UGF0aEFuaW1hdGlvbihlbmROb2RlLCBub2RlTWFwLCBzcGVlZCwgY2FsbGJhY2spIHtcbiAgICB2YXIgX2EsIF9iO1xuICAgIGNvbnN0IHNob3J0ZXN0UGF0aHNUb0FuaW1hdGUgPSBbXTtcbiAgICBsZXQgcHJldmlvdXNOb2RlID0gZW5kTm9kZS5wcmV2aW91cztcbiAgICB3aGlsZSAocHJldmlvdXNOb2RlICE9PSBudWxsKSB7XG4gICAgICAgIHNob3J0ZXN0UGF0aHNUb0FuaW1hdGUudW5zaGlmdChwcmV2aW91c05vZGUpO1xuICAgICAgICBwcmV2aW91c05vZGUgPSAoX2IgPSAoX2EgPSBub2RlTWFwLmdldChwcmV2aW91c05vZGUuaWQpKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EucHJldmlvdXMpICE9PSBudWxsICYmIF9iICE9PSB2b2lkIDAgPyBfYiA6IG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHRpbWVycyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hvcnRlc3RQYXRoc1RvQW5pbWF0ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aW1lcnMucHVzaChzdGFydFRpbWVyKHNob3J0ZXN0UGF0aHNUb0FuaW1hdGUsIGksIChpICsgMSkgKiBjb25zdGFudHNfMS5TUEVFRF9NQVBQSU5HW3NwZWVkXS5wYXRoVGltZSwgJ3Nob3J0ZXN0LXBhdGgnLCBjYWxsYmFjaykpO1xuICAgIH1cbiAgICByZXR1cm4gdGltZXJzO1xufVxuZXhwb3J0cy5zdGFydFNob3J0ZXN0UGF0aEFuaW1hdGlvbiA9IHN0YXJ0U2hvcnRlc3RQYXRoQW5pbWF0aW9uO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBoZWxwZXJzXzEgPSByZXF1aXJlKFwiLi9oZWxwZXJzXCIpO1xuZnVuY3Rpb24gYmZzQWxnb3JpdGhtKHN0YXJ0SWQsIGVuZElkLCBub2RlTWFwLCBub2Rlc1RvQW5pbWF0ZSkge1xuICAgIGNvbnN0IHF1ZXVlID0gW25vZGVNYXAuZ2V0KHN0YXJ0SWQpXTtcbiAgICBjb25zdCB2aXNpdGVkID0gbmV3IE1hcCgpO1xuICAgIHZpc2l0ZWQuc2V0KHN0YXJ0SWQsIHRydWUpO1xuICAgIHdoaWxlIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBub2Rlc1RvQW5pbWF0ZS5wdXNoKGN1cnJlbnQpO1xuICAgICAgICBjdXJyZW50LnN0YXR1cyA9ICd2aXNpdGVkJztcbiAgICAgICAgaWYgKGN1cnJlbnQuaWQgPT09IGVuZElkKSB7XG4gICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZWlnaGJvdXJzID0gKDAsIGhlbHBlcnNfMS5nZXROZWlnaGJvdXJzKShjdXJyZW50LmlkLCBub2RlTWFwKTtcbiAgICAgICAgZm9yIChjb25zdCBuZWlnaGJvdXIgb2YgbmVpZ2hib3Vycykge1xuICAgICAgICAgICAgaWYgKCF2aXNpdGVkLmhhcyhuZWlnaGJvdXIuaWQpKSB7XG4gICAgICAgICAgICAgICAgdmlzaXRlZC5zZXQobmVpZ2hib3VyLmlkLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBuZWlnaGJvdXIucHJldmlvdXMgPSBjdXJyZW50O1xuICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2gobmVpZ2hib3VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbmV4cG9ydHMuZGVmYXVsdCA9IGJmc0FsZ29yaXRobTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3Qgbm9kZV8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL25vZGVcIikpO1xuY29uc3QgZGZzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vZGZzXCIpKTtcbmNvbnN0IGJmc18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2Jmc1wiKSk7XG5jb25zdCBoZWxwZXJzXzEgPSByZXF1aXJlKFwiLi9oZWxwZXJzXCIpO1xuY2xhc3MgQm9hcmQge1xuICAgIGNvbnN0cnVjdG9yKF9ib2FyZE5vZGUpIHtcbiAgICAgICAgdGhpcy5ib2FyZE5vZGUgPSBfYm9hcmROb2RlO1xuICAgICAgICB0aGlzLnNldEluaXRpYWxDb29yZGluYXRlcygpO1xuICAgICAgICB0aGlzLmRyYWdnaW5nID0geyBzdGFydDogZmFsc2UsIGVuZDogZmFsc2UgfTtcbiAgICAgICAgdGhpcy5pc0NyZWF0aW5nV2FsbCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNyZWF0ZUdyaWQoKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVycygpO1xuICAgIH1cbiAgICBzZXRJbml0aWFsQ29vcmRpbmF0ZXMoKSB7XG4gICAgICAgIGNvbnN0IHsgaGVpZ2h0LCB3aWR0aCB9ID0gdGhpcy5ib2FyZE5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0IC8gMjg7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aCAvIDI4O1xuICAgICAgICBjb25zdCBzdGFydENvb3JkcyA9IFtcbiAgICAgICAgICAgIE1hdGguZmxvb3IodGhpcy5oZWlnaHQgLyAyKSxcbiAgICAgICAgICAgIE1hdGguZmxvb3IodGhpcy53aWR0aCAvIDQpLFxuICAgICAgICBdO1xuICAgICAgICB0aGlzLnN0YXJ0SWQgPSAoMCwgaGVscGVyc18xLmNyZWF0ZU5vZGVJZCkoc3RhcnRDb29yZHNbMF0sIHN0YXJ0Q29vcmRzWzFdKTtcbiAgICAgICAgY29uc3QgZW5kQ29vcmRzID0gW1xuICAgICAgICAgICAgTWF0aC5mbG9vcih0aGlzLmhlaWdodCAvIDIpLFxuICAgICAgICAgICAgMyAqIE1hdGguZmxvb3IodGhpcy53aWR0aCAvIDQpLFxuICAgICAgICBdO1xuICAgICAgICB0aGlzLmVuZElkID0gKDAsIGhlbHBlcnNfMS5jcmVhdGVOb2RlSWQpKGVuZENvb3Jkc1swXSwgZW5kQ29vcmRzWzFdKTtcbiAgICB9XG4gICAgY3JlYXRlR3JpZCgpIHtcbiAgICAgICAgdGhpcy5ub2RlTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLm5vZGVzVG9BbmltYXRlID0gW107XG4gICAgICAgIGxldCB0YWJsZUh0bWwgPSAnJztcbiAgICAgICAgZm9yIChsZXQgciA9IDA7IHIgPCB0aGlzLmhlaWdodDsgcisrKSB7XG4gICAgICAgICAgICBsZXQgY3VycmVudFJvdyA9ICcnO1xuICAgICAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCB0aGlzLndpZHRoOyBjKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlSWQgPSAoMCwgaGVscGVyc18xLmNyZWF0ZU5vZGVJZCkociwgYyk7XG4gICAgICAgICAgICAgICAgbGV0IG5vZGVTdGF0dXMgPSAndW52aXNpdGVkJztcbiAgICAgICAgICAgICAgICBpZiAobm9kZUlkID09PSB0aGlzLnN0YXJ0SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZVN0YXR1cyA9ICdzdGFydCc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhcnRJZCA9IG5vZGVJZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobm9kZUlkID09PSB0aGlzLmVuZElkKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVTdGF0dXMgPSAnZW5kJztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbmRJZCA9IG5vZGVJZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3VycmVudFJvdyArPSBgPHRkIGlkPSR7bm9kZUlkfSBjbGFzcz0ke25vZGVTdGF0dXN9PjwvdGQ+YDtcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlID0gbmV3IG5vZGVfMS5kZWZhdWx0KHIsIGMsIG5vZGVJZCwgbm9kZVN0YXR1cyk7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlTWFwLnNldChub2RlSWQsIG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGFibGVIdG1sICs9IGA8dHIgaWQ9XCJyb3cgJHtyfVwiPiR7Y3VycmVudFJvd308L3RyPmA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ib2FyZE5vZGUuaW5uZXJIVE1MID0gdGFibGVIdG1sO1xuICAgIH1cbiAgICBhZGRFdmVudExpc3RlbmVycygpIHtcbiAgICAgICAgdGhpcy5ib2FyZE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLm5vZGVNYXAuZ2V0KGVsZW1lbnQuaWQpO1xuICAgICAgICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vZGUuc3RhdHVzID09PSAnc3RhcnQnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdGFydCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChub2RlLnN0YXR1cyA9PT0gJ2VuZCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLmVuZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChub2RlLnN0YXR1cyA9PT0gJ3dhbGwnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VOb2RlRWxlbWVudChlbGVtZW50LmlkLCAndW52aXNpdGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzQ3JlYXRpbmdXYWxsID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYm9hcmROb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nID0geyBzdGFydDogZmFsc2UsIGVuZDogZmFsc2UgfTtcbiAgICAgICAgICAgIHRoaXMuaXNDcmVhdGluZ1dhbGwgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYm9hcmROb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZy5zdGFydCB8fCB0aGlzLmRyYWdnaW5nLmVuZCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nLnN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LmlkID09PSB0aGlzLmVuZElkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VOb2RlRWxlbWVudCh0aGlzLnN0YXJ0SWQsICd1bnZpc2l0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VOb2RlRWxlbWVudChlbGVtZW50LmlkLCAnc3RhcnQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5kcmFnZ2luZy5lbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuaWQgPT09IHRoaXMuc3RhcnRJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTm9kZUVsZW1lbnQodGhpcy5lbmRJZCwgJ3VudmlzaXRlZCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZU5vZGVFbGVtZW50KGVsZW1lbnQuaWQsICdlbmQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLmlzQ3JlYXRpbmdXYWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VOb2RlRWxlbWVudChlbGVtZW50LmlkLCAnd2FsbCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgY2hhbmdlTm9kZUVsZW1lbnQobm9kZUlkLCBuZXdTdGF0dXMpIHtcbiAgICAgICAgY29uc3QgY3VycmVudE5vZGUgPSB0aGlzLm5vZGVNYXAuZ2V0KG5vZGVJZCk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobm9kZUlkKTtcbiAgICAgICAgaWYgKCFjdXJyZW50Tm9kZSB8fCAhY3VycmVudEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmV3U3RhdHVzID09PSAnd2FsbCcgJiYgWydzdGFydCcsICdlbmQnXS5pbmNsdWRlcyhjdXJyZW50Tm9kZS5zdGF0dXMpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2hvcnRlc3QtcGF0aCcpO1xuICAgICAgICBjdXJyZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCd2aXNpdGVkJyk7XG4gICAgICAgIGN1cnJlbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2N1cnJlbnQnKTtcbiAgICAgICAgY3VycmVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgndW52aXNpdGVkJyk7XG4gICAgICAgIGN1cnJlbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3dhbGwnKTtcbiAgICAgICAgY3VycmVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZChuZXdTdGF0dXMpO1xuICAgICAgICBjdXJyZW50Tm9kZS5zdGF0dXMgPSBuZXdTdGF0dXM7XG4gICAgICAgIGlmIChuZXdTdGF0dXMgPT09ICdzdGFydCcpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRJZCA9IGN1cnJlbnROb2RlLmlkO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuZXdTdGF0dXMgPT09ICdlbmQnKSB7XG4gICAgICAgICAgICB0aGlzLmVuZElkID0gY3VycmVudE5vZGUuaWQ7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnc3RhcnQnKTtcbiAgICAgICAgY3VycmVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnZW5kJyk7XG4gICAgfVxuICAgIGNsZWFyQm9hcmQoKSB7XG4gICAgICAgIHRoaXMuc2V0SW5pdGlhbENvb3JkaW5hdGVzKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlR3JpZCgpO1xuICAgIH1cbiAgICBjbGVhcldhbGxzKCkge1xuICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2YgdGhpcy5ub2RlTWFwKSB7XG4gICAgICAgICAgICBpZiAocGFpclsxXS5zdGF0dXMgPT09ICd3YWxsJykge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTm9kZUVsZW1lbnQocGFpclswXSwgJ3VudmlzaXRlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNsZWFyUGF0aCgpIHtcbiAgICAgICAgZm9yIChjb25zdCBwYWlyIG9mIHRoaXMubm9kZU1hcCkge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudE5vZGVJZCA9IHBhaXJbMF07XG4gICAgICAgICAgICBpZiAoY3VycmVudE5vZGVJZCA9PT0gdGhpcy5zdGFydElkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VOb2RlRWxlbWVudChjdXJyZW50Tm9kZUlkLCAnc3RhcnQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGN1cnJlbnROb2RlSWQgPT09IHRoaXMuZW5kSWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZU5vZGVFbGVtZW50KGN1cnJlbnROb2RlSWQsICdlbmQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHBhaXJbMV0uc3RhdHVzID09PSAndmlzaXRlZCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZU5vZGVFbGVtZW50KHBhaXJbMF0sICd1bnZpc2l0ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGFydChhbGdvcml0aG0pIHtcbiAgICAgICAgdGhpcy5ub2Rlc1RvQW5pbWF0ZSA9IFtdO1xuICAgICAgICBsZXQgZW5kTm9kZSA9IG51bGw7XG4gICAgICAgIGlmIChhbGdvcml0aG0gPT09ICdkZnMnKSB7XG4gICAgICAgICAgICBlbmROb2RlID0gKDAsIGRmc18xLmRlZmF1bHQpKHRoaXMuc3RhcnRJZCwgdGhpcy5lbmRJZCwgdGhpcy5ub2RlTWFwLCB0aGlzLm5vZGVzVG9BbmltYXRlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhbGdvcml0aG0gPT09ICdiZnMnKSB7XG4gICAgICAgICAgICBlbmROb2RlID0gKDAsIGJmc18xLmRlZmF1bHQpKHRoaXMuc3RhcnRJZCwgdGhpcy5lbmRJZCwgdGhpcy5ub2RlTWFwLCB0aGlzLm5vZGVzVG9BbmltYXRlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQWxnb3JpdGhtIG5vdCBpbXBsZW1lbnRlZDogJHthbGdvcml0aG19YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgZW5kTm9kZSwgbm9kZXNUb0FuaW1hdGU6IHRoaXMubm9kZXNUb0FuaW1hdGUgfTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBCb2FyZDtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5XQUxLVEhST1VHSF9QT1NJVElPTlMgPSBleHBvcnRzLk5PREVfVE9fSURfTUFQUElORyA9IGV4cG9ydHMuU1BFRURfTUFQUElORyA9IGV4cG9ydHMuQUxHT1JJVEhNX01BUFBJTkcgPSB2b2lkIDA7XG5leHBvcnRzLkFMR09SSVRITV9NQVBQSU5HID0gT2JqZWN0LmZyZWV6ZSh7XG4gICAgZGZzOiB7XG4gICAgICAgIGlkOiAnZGZzLWFsZ29yaXRobScsXG4gICAgICAgIG5hbWU6ICdERlMnLFxuICAgIH0sXG4gICAgYmZzOiB7XG4gICAgICAgIGlkOiAnYmZzLWFsZ29yaXRobScsXG4gICAgICAgIG5hbWU6ICdCRlMnLFxuICAgIH0sXG59KTtcbmV4cG9ydHMuU1BFRURfTUFQUElORyA9IE9iamVjdC5mcmVlemUoe1xuICAgIGZhc3Q6IHtcbiAgICAgICAgaWQ6ICdmYXN0LXNwZWVkJyxcbiAgICAgICAgdGltZTogNSxcbiAgICAgICAgbmFtZTogJ0Zhc3QnLFxuICAgICAgICBwYXRoVGltZTogNTAsXG4gICAgfSxcbiAgICBhdmVyYWdlOiB7XG4gICAgICAgIGlkOiAnYXZlcmFnZS1zcGVlZCcsXG4gICAgICAgIHRpbWU6IDEwMCxcbiAgICAgICAgbmFtZTogJ0F2ZXJhZ2UnLFxuICAgICAgICBwYXRoVGltZTogMTUwLFxuICAgIH0sXG4gICAgc2xvdzoge1xuICAgICAgICBpZDogJ3Nsb3ctc3BlZWQnLFxuICAgICAgICB0aW1lOiAzMDAsXG4gICAgICAgIG5hbWU6ICdTbG93JyxcbiAgICAgICAgcGF0aFRpbWU6IDQwMCxcbiAgICB9LFxufSk7XG5leHBvcnRzLk5PREVfVE9fSURfTUFQUElORyA9IE9iamVjdC5mcmVlemUoe1xuICAgIGJvYXJkOiAnYm9hcmQnLFxuICAgIHZpc3VhbGl6ZUJ1dHRvbjogJ3Zpc3VhbGl6ZScsXG4gICAgcGxheVBhdXNlQnV0dG9uOiAncGxheS1wYXVzZScsXG59KTtcbmV4cG9ydHMuV0FMS1RIUk9VR0hfUE9TSVRJT05TID0gW1xuICAgIHtcbiAgICAgICAgcmVmZXJlbmNlOiAnI2FsZ29yaXRobXMnLFxuICAgICAgICB0b3A6IDI1LFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICB0aXRsZTogJ1BpY2sgYW4gYWxnb3JpdGhtJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdDaG9vc2UgYW4gYWxnb3JpdGhtIGZyb20gdGhpcyBtZW51LicsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHJlZmVyZW5jZTogJy5zdGFydCcsXG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgbGVmdDogMjAwLFxuICAgICAgICB0aXRsZTogJ0FkZCB3YWxscycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQ2xpY2sgb24gdGhlIGdyaWQgdG8gYWRkIGEgd2FsbC4gQSBwYXRoIGNhbm5vdCBjcm9zcyBhIHdhbGwuJyxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgcmVmZXJlbmNlOiAnLnN0YXJ0JyxcbiAgICAgICAgdG9wOiAxMCxcbiAgICAgICAgbGVmdDogLTIwLFxuICAgICAgICB0aXRsZTogJ0RyYWcgbm9kZXMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1lvdSBjYW4gZHJhZyB0aGUgc3RhcnQgYW5kIGVuZCB0YXJnZXQgdG8gYW55IHBsYWNlIGluIHRoZSBncmlkLicsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHJlZmVyZW5jZTogJyN2aXN1YWxpemUnLFxuICAgICAgICB0b3A6IDI1LFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICB0aXRsZTogJ0NvbnRyb2xzJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdZb3UgY2FuIHN0YXJ0IHRoZSB2aXN1YWxpemF0aW9uLCBwYXVzZS9yZXN1bWUgaXQgaW4gYmV0d2VlbiwgYWRqdXN0IHRoZSB2aXN1YWxpemF0aW9uIHNwZWVkLCBjbGVhciB0aGUgYm9hcmQgZnJvbSB0aGUgY29udHJvbHMgcGFuZWwgaGVyZS4nLFxuICAgIH0sXG4gICAge1xuICAgICAgICByZWZlcmVuY2U6ICcjcGFnZS10aXRsZScsXG4gICAgICAgIHRvcDogMzAsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHRpdGxlOiAnUmV2aXNpdCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnSWYgeW91IHdhbnQgdG8gc2VlIHRoaXMgdHV0b3JpYWwgYWdhaW4sIGNsaWNrIG9uIHRoaXMgdGl0bGUgYWdhaW4uJyxcbiAgICB9LFxuXTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgaGVscGVyc18xID0gcmVxdWlyZShcIi4vaGVscGVyc1wiKTtcbmZ1bmN0aW9uIGRmc0FsZ29yaXRobShzdGFydElkLCBlbmRJZCwgbm9kZU1hcCwgbm9kZXNUb0FuaW1hdGUpIHtcbiAgICBjb25zdCBxdWV1ZSA9IFtub2RlTWFwLmdldChzdGFydElkKV07XG4gICAgY29uc3QgdmlzaXRlZCA9IG5ldyBNYXAoKTtcbiAgICB3aGlsZSAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBjdXJyZW50ID0gcXVldWUucG9wKCk7XG4gICAgICAgIGlmICh0eXBlb2YgY3VycmVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHZpc2l0ZWQuc2V0KGN1cnJlbnQuaWQsIHRydWUpO1xuICAgICAgICBub2Rlc1RvQW5pbWF0ZS5wdXNoKGN1cnJlbnQpO1xuICAgICAgICBjdXJyZW50LnN0YXR1cyA9ICd2aXNpdGVkJztcbiAgICAgICAgaWYgKGN1cnJlbnQuaWQgPT09IGVuZElkKSB7XG4gICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZWlnaGJvdXJzID0gKDAsIGhlbHBlcnNfMS5nZXROZWlnaGJvdXJzKShjdXJyZW50LmlkLCBub2RlTWFwKS5yZXZlcnNlKCk7XG4gICAgICAgIGZvciAoY29uc3QgbmVpZ2hib3VyIG9mIG5laWdoYm91cnMpIHtcbiAgICAgICAgICAgIGlmICghdmlzaXRlZC5oYXMobmVpZ2hib3VyLmlkKSkge1xuICAgICAgICAgICAgICAgIG5laWdoYm91ci5wcmV2aW91cyA9IGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgcXVldWUucHVzaChuZWlnaGJvdXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuZXhwb3J0cy5kZWZhdWx0ID0gZGZzQWxnb3JpdGhtO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmdldE5laWdoYm91cnMgPSBleHBvcnRzLmNyZWF0ZU5vZGVJZCA9IHZvaWQgMDtcbmZ1bmN0aW9uIGNyZWF0ZU5vZGVJZChyLCBjKSB7XG4gICAgcmV0dXJuIGAke3J9LSR7Y31gO1xufVxuZXhwb3J0cy5jcmVhdGVOb2RlSWQgPSBjcmVhdGVOb2RlSWQ7XG5mdW5jdGlvbiBnZXROZWlnaGJvdXJzKGN1cnJlbnRJZCwgbm9kZU1hcCkge1xuICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gY3VycmVudElkLnNwbGl0KCctJyk7XG4gICAgY29uc3QgeCA9IHBhcnNlSW50KGNvb3JkaW5hdGVzWzBdLCAxMCk7XG4gICAgY29uc3QgeSA9IHBhcnNlSW50KGNvb3JkaW5hdGVzWzFdLCAxMCk7XG4gICAgY29uc3QgbmVpZ2hib3VycyA9IFtdO1xuICAgIGNvbnN0IGNvbWJpbmF0aW9ucyA9IFtcbiAgICAgICAgWy0xLCAwXSxcbiAgICAgICAgWzAsIDFdLFxuICAgICAgICBbMSwgMF0sXG4gICAgICAgIFswLCAtMV0sXG4gICAgXTtcbiAgICBmb3IgKGNvbnN0IGNvbWJpbmF0aW9uIG9mIGNvbWJpbmF0aW9ucykge1xuICAgICAgICBjb25zdCBuZXdYID0geCArIGNvbWJpbmF0aW9uWzBdO1xuICAgICAgICBjb25zdCBuZXdZID0geSArIGNvbWJpbmF0aW9uWzFdO1xuICAgICAgICBjb25zdCBuZWlnaGJvdXJOb2RlID0gbm9kZU1hcC5nZXQoY3JlYXRlTm9kZUlkKG5ld1gsIG5ld1kpKTtcbiAgICAgICAgaWYgKHR5cGVvZiBuZWlnaGJvdXJOb2RlICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAgICAgbmVpZ2hib3VyTm9kZS5zdGF0dXMgIT09ICd3YWxsJykge1xuICAgICAgICAgICAgbmVpZ2hib3Vycy5wdXNoKG5laWdoYm91ck5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZWlnaGJvdXJzO1xufVxuZXhwb3J0cy5nZXROZWlnaGJvdXJzID0gZ2V0TmVpZ2hib3VycztcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgYm9hcmRfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9ib2FyZFwiKSk7XG5jb25zdCBhbmltYXRlXzEgPSByZXF1aXJlKFwiLi9hbmltYXRlXCIpO1xuY29uc3QgbW9kYWxfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9tb2RhbFwiKSk7XG5jb25zdCB3YWxrdGhyb3VnaF8xID0gcmVxdWlyZShcIi4vd2Fsa3Rocm91Z2hcIik7XG5jb25zdCBjb25zdGFudHNfMSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50c1wiKTtcbmNvbnN0IHV0aWxzXzEgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcbmNvbnN0IGJvYXJkTm9kZSA9ICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKShjb25zdGFudHNfMS5OT0RFX1RPX0lEX01BUFBJTkcuYm9hcmQpO1xuY29uc3QgYm9hcmQgPSBuZXcgYm9hcmRfMS5kZWZhdWx0KGJvYXJkTm9kZSk7XG5jb25zdCB2aXN1YWxpemVCdXR0b24gPSAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoY29uc3RhbnRzXzEuTk9ERV9UT19JRF9NQVBQSU5HLnZpc3VhbGl6ZUJ1dHRvbik7XG5jb25zdCBwbGF5UGF1c2VCdXR0b24gPSAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoY29uc3RhbnRzXzEuTk9ERV9UT19JRF9NQVBQSU5HLnBsYXlQYXVzZUJ1dHRvbik7XG5jbGFzcyBWaXN1YWxpemVyU3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmFsZ29yaXRobSA9IG51bGw7XG4gICAgICAgIHRoaXMudGltZXJzID0gW107XG4gICAgfVxuICAgIHNldEFsZ29yaXRobShhbGdvcml0aG0pIHtcbiAgICAgICAgdGhpcy5hbGdvcml0aG0gPSBhbGdvcml0aG07XG4gICAgfVxuICAgIHNldFNwZWVkKHNwZWVkKSB7XG4gICAgICAgIHRoaXMuc3BlZWQgPSBzcGVlZDtcbiAgICB9XG4gICAgYXBwZW5kVGltZXJzKF90aW1lcnMpIHtcbiAgICAgICAgdGhpcy50aW1lcnMgPSBbLi4udGhpcy50aW1lcnMsIC4uLl90aW1lcnNdO1xuICAgIH1cbiAgICBjbGVhclRpbWVycygpIHtcbiAgICAgICAgdGhpcy50aW1lcnMuZm9yRWFjaChlYWNoVGltZXIgPT4gZWFjaFRpbWVyLmNsZWFyKCkpO1xuICAgICAgICB0aGlzLnRpbWVycyA9IFtdO1xuICAgIH1cbiAgICByZXN1bWVUaW1lcnMoKSB7XG4gICAgICAgIHRoaXMudGltZXJzLmZvckVhY2goZWFjaFRpbWVyID0+IGVhY2hUaW1lci5yZXN1bWUoKSk7XG4gICAgfVxuICAgIHBhdXNlVGltZXJzKCkge1xuICAgICAgICB0aGlzLnRpbWVycy5mb3JFYWNoKGVhY2hUaW1lciA9PiBlYWNoVGltZXIucGF1c2UoKSk7XG4gICAgfVxuICAgIHNldFN0YXJ0ZWQoaGFzU3RhcnRlZCkge1xuICAgICAgICB0aGlzLmhhc1N0YXJ0ZWQgPSBoYXNTdGFydGVkO1xuICAgICAgICBpZiAodGhpcy5oYXNTdGFydGVkKSB7XG4gICAgICAgICAgICB0aGlzLmlzUGxheWluZyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyVGltZXJzKCk7XG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZU5ld0RvbVN0YXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdmlzdWFsaXplQnV0dG9uLmRpc2FibGVkID0gdGhpcy5oYXNTdGFydGVkO1xuICAgIH1cbiAgICBjYWxjdWxhdGVOZXdEb21TdGF0ZSgpIHtcbiAgICAgICAgcGxheVBhdXNlQnV0dG9uLmlubmVyVGV4dCA9IHRoaXMuaXNQbGF5aW5nID8gJ1BhdXNlJyA6ICdSZXN1bWUnO1xuICAgICAgICBwbGF5UGF1c2VCdXR0b24uZGlzYWJsZWQgPSAhdGhpcy5oYXNTdGFydGVkO1xuICAgIH1cbiAgICBzdGFydE9yU3RvcFRpbWVyKG5ld1N0YXRlKSB7XG4gICAgICAgIHRoaXMuaXNQbGF5aW5nID0gbmV3U3RhdGU7XG4gICAgICAgIHRoaXMuY2FsY3VsYXRlTmV3RG9tU3RhdGUoKTtcbiAgICB9XG4gICAgcGxheU9yUGF1c2VUaW1lcigpIHtcbiAgICAgICAgdGhpcy5pc1BsYXlpbmcgPSAhdGhpcy5pc1BsYXlpbmc7XG4gICAgICAgIGlmICh0aGlzLmlzUGxheWluZykge1xuICAgICAgICAgICAgdGhpcy5yZXN1bWVUaW1lcnMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucGF1c2VUaW1lcnMoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbGN1bGF0ZU5ld0RvbVN0YXRlKCk7XG4gICAgfVxufVxuY29uc3QgdmlzdWFsaXplclN0YXRlID0gbmV3IFZpc3VhbGl6ZXJTdGF0ZSgpO1xuZnVuY3Rpb24gb25JbmRleEFuaW1hdGVkKGFuaW1hdGVkSW5kZXgpIHtcbiAgICB2aXN1YWxpemVyU3RhdGUudGltZXJzLnNoaWZ0KCk7XG4gICAgaWYgKGFuaW1hdGVkSW5kZXggPT09IDApIHtcbiAgICAgICAgdmlzdWFsaXplclN0YXRlLnNldFN0YXJ0ZWQodHJ1ZSk7XG4gICAgICAgIHZpc3VhbGl6ZXJTdGF0ZS5zdGFydE9yU3RvcFRpbWVyKHRydWUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIG9uUGF0aEFuaW1hdGVkKGFuaW1hdGVkSW5kZXgsIG5vZGVzVG9BbmltYXRlKSB7XG4gICAgdmlzdWFsaXplclN0YXRlLnRpbWVycy5zaGlmdCgpO1xuICAgIGlmIChhbmltYXRlZEluZGV4ID09PSBub2Rlc1RvQW5pbWF0ZS5sZW5ndGggLSAxKSB7XG4gICAgICAgIHZpc3VhbGl6ZXJTdGF0ZS5zZXRTdGFydGVkKGZhbHNlKTtcbiAgICAgICAgdmlzdWFsaXplclN0YXRlLnN0YXJ0T3JTdG9wVGltZXIoZmFsc2UpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGluaXRpYWxpemVCdXR0b25FdmVudHMoKSB7XG4gICAgKDAsIHV0aWxzXzEuYWRkSHRtbEV2ZW50KSh2aXN1YWxpemVCdXR0b24sICgpID0+IHtcbiAgICAgICAgaWYgKHZpc3VhbGl6ZXJTdGF0ZS5hbGdvcml0aG0gPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IGVuZE5vZGUsIG5vZGVzVG9BbmltYXRlIH0gPSBib2FyZC5zdGFydCh2aXN1YWxpemVyU3RhdGUuYWxnb3JpdGhtKTtcbiAgICAgICAgaWYgKGVuZE5vZGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICgwLCBtb2RhbF8xLmRlZmF1bHQpKCdFcnJvciEnLCAnQ2Fubm90IGZpbmQgcGF0aCB0byBnb2FsIGFzIHdlIGdvdCBibG9ja2VkIGJ5IHdhbGxzLiBLaW5kbHkgcmUtdHJ5LicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNwZWVkID0gdmlzdWFsaXplclN0YXRlLnNwZWVkO1xuICAgICAgICBjb25zdCB2aXNpdGVkVGltZXJzID0gKDAsIGFuaW1hdGVfMS5zdGFydFZpc2l0ZWROb2Rlc0FuaW1hdGlvbnMpKG5vZGVzVG9BbmltYXRlLCBzcGVlZCwgYW5pbWF0ZWRJbmRleCA9PiB7XG4gICAgICAgICAgICBvbkluZGV4QW5pbWF0ZWQoYW5pbWF0ZWRJbmRleCk7XG4gICAgICAgICAgICBpZiAoYW5pbWF0ZWRJbmRleCA9PT0gbm9kZXNUb0FuaW1hdGUubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGhUaW1lcnMgPSAoMCwgYW5pbWF0ZV8xLnN0YXJ0U2hvcnRlc3RQYXRoQW5pbWF0aW9uKShlbmROb2RlLCBib2FyZC5ub2RlTWFwLCBzcGVlZCwgaW5kZXggPT4gb25QYXRoQW5pbWF0ZWQoaW5kZXgsIHBhdGhUaW1lcnMpKTtcbiAgICAgICAgICAgICAgICB2aXN1YWxpemVyU3RhdGUuYXBwZW5kVGltZXJzKHBhdGhUaW1lcnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdmlzdWFsaXplclN0YXRlLmFwcGVuZFRpbWVycyh2aXNpdGVkVGltZXJzKTtcbiAgICB9KTtcbiAgICAoMCwgdXRpbHNfMS5nZXROb2RlcykoJyNjbGVhci1ib2FyZCcpLmZvckVhY2goZWFjaE5vZGUgPT4gKDAsIHV0aWxzXzEuYWRkSHRtbEV2ZW50KShlYWNoTm9kZSwgKCkgPT4ge1xuICAgICAgICBib2FyZC5jbGVhckJvYXJkKCk7XG4gICAgICAgIHZpc3VhbGl6ZXJTdGF0ZS5zZXRTdGFydGVkKGZhbHNlKTtcbiAgICB9KSk7XG4gICAgKDAsIHV0aWxzXzEuZ2V0Tm9kZXMpKCcjY2xlYXItd2FsbHMnKS5mb3JFYWNoKGVhY2hOb2RlID0+ICgwLCB1dGlsc18xLmFkZEh0bWxFdmVudCkoZWFjaE5vZGUsICgpID0+IHtcbiAgICAgICAgYm9hcmQuY2xlYXJXYWxscygpO1xuICAgICAgICB2aXN1YWxpemVyU3RhdGUuc2V0U3RhcnRlZChmYWxzZSk7XG4gICAgfSkpO1xuICAgICgwLCB1dGlsc18xLmdldE5vZGVzKSgnI2NsZWFyLXBhdGgnKS5mb3JFYWNoKGVhY2hOb2RlID0+ICgwLCB1dGlsc18xLmFkZEh0bWxFdmVudCkoZWFjaE5vZGUsICgpID0+IHtcbiAgICAgICAgYm9hcmQuY2xlYXJQYXRoKCk7XG4gICAgICAgIHZpc3VhbGl6ZXJTdGF0ZS5zZXRTdGFydGVkKGZhbHNlKTtcbiAgICB9KSk7XG4gICAgKDAsIHV0aWxzXzEuYWRkSHRtbEV2ZW50KShwbGF5UGF1c2VCdXR0b24sICgpID0+IHtcbiAgICAgICAgdmlzdWFsaXplclN0YXRlLnBsYXlPclBhdXNlVGltZXIoKTtcbiAgICB9KTtcbiAgICAoMCwgdXRpbHNfMS5hZGRIdG1sRXZlbnQpKCgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgncGFnZS10aXRsZScpLCAoKSA9PiB7XG4gICAgICAgICgwLCB3YWxrdGhyb3VnaF8xLnJlSW5pdGlhdGVXYWxrdGhyb3VnaCkoKTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGFwcGx5Q2hhbmdlc0ZvclNwZWVkRHJvcGRvd24oc3BlZWRJZCkge1xuICAgIGNvbnN0IHNwZWVkcyA9IE9iamVjdC5rZXlzKGNvbnN0YW50c18xLlNQRUVEX01BUFBJTkcpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3BlZWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG1hcHBpbmcgPSBjb25zdGFudHNfMS5TUEVFRF9NQVBQSU5HW3NwZWVkc1tpXV07XG4gICAgICAgIGlmIChtYXBwaW5nLmlkID09PSBzcGVlZElkKSB7XG4gICAgICAgICAgICB2aXN1YWxpemVyU3RhdGUuc2V0U3BlZWQoc3BlZWRzW2ldKTtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkobWFwcGluZy5pZCk7XG4gICAgICAgICAgICAoMCwgdXRpbHNfMS5jaGFuZ2VEcm9wZG93bkxhYmVsKShub2RlLCBgU3BlZWQ6ICR7bWFwcGluZy5uYW1lfWApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBpbml0aWFsaXplRHJvcGRvd25FdmVudHMoKSB7XG4gICAgKDAsIHV0aWxzXzEuZ2V0Tm9kZXMpKCcuZHJvcGRvd24nKS5mb3JFYWNoKGVhY2hOb2RlID0+ICgwLCB1dGlsc18xLmFkZEh0bWxFdmVudCkoZWFjaE5vZGUsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IGV2ZW50LmN1cnJlbnRUYXJnZXQ7XG4gICAgICAgIGlmIChub2RlLmNsYXNzTGlzdC5jb250YWlucygnb3BlbicpKSB7XG4gICAgICAgICAgICBub2RlLmNsYXNzTGlzdC5yZW1vdmUoJ29wZW4nKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG5vZGUuY2xhc3NMaXN0LmFkZCgnb3BlbicpO1xuICAgICAgICB9XG4gICAgfSkpO1xuICAgIGNvbnN0IGFsbEFsZ29yaXRobUlkcyA9IE9iamVjdC52YWx1ZXMoY29uc3RhbnRzXzEuQUxHT1JJVEhNX01BUFBJTkcpLm1hcChlYWNoVmFsdWUgPT4gZWFjaFZhbHVlLmlkKTtcbiAgICBjb25zdCBhbGxTcGVlZElkcyA9IE9iamVjdC52YWx1ZXMoY29uc3RhbnRzXzEuU1BFRURfTUFQUElORykubWFwKGVhY2hWYWx1ZSA9PiBlYWNoVmFsdWUuaWQpO1xuICAgIGFwcGx5Q2hhbmdlc0ZvclNwZWVkRHJvcGRvd24oY29uc3RhbnRzXzEuU1BFRURfTUFQUElORy5mYXN0LmlkKTtcbiAgICAoMCwgdXRpbHNfMS5nZXROb2RlcykoJy5kcm9wZG93bi1pdGVtJykuZm9yRWFjaChlYWNoTm9kZSA9PiAoMCwgdXRpbHNfMS5hZGRIdG1sRXZlbnQpKGVhY2hOb2RlLCBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBldmVudC5jdXJyZW50VGFyZ2V0O1xuICAgICAgICBPYmplY3QudmFsdWVzKGNvbnN0YW50c18xLkFMR09SSVRITV9NQVBQSU5HKS5mb3JFYWNoKGVhY2hDb25maWcgPT4ge1xuICAgICAgICAgICAgZWFjaENvbmZpZztcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGFsZ29yaXRobXMgPSBPYmplY3Qua2V5cyhjb25zdGFudHNfMS5BTEdPUklUSE1fTUFQUElORyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxnb3JpdGhtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gY29uc3RhbnRzXzEuQUxHT1JJVEhNX01BUFBJTkdbYWxnb3JpdGhtc1tpXV07XG4gICAgICAgICAgICBpZiAoY29uZmlnLmlkID09PSBub2RlLmlkKSB7XG4gICAgICAgICAgICAgICAgdmlzdWFsaXplclN0YXRlLnNldEFsZ29yaXRobShhbGdvcml0aG1zW2ldKTtcbiAgICAgICAgICAgICAgICAoMCwgdXRpbHNfMS5jaGFuZ2VEcm9wZG93bkxhYmVsKShub2RlLCBgQWxnb3JpdGhtOiAke2NvbmZpZy5uYW1lfWApO1xuICAgICAgICAgICAgICAgIHZpc3VhbGl6ZUJ1dHRvbi5pbm5lclRleHQgPSBgVmlzdWFsaXplICR7Y29uZmlnLm5hbWV9YDtcbiAgICAgICAgICAgICAgICB2aXN1YWxpemVCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFsbFNwZWVkSWRzLmluY2x1ZGVzKG5vZGUuaWQpKSB7XG4gICAgICAgICAgICBhcHBseUNoYW5nZXNGb3JTcGVlZERyb3Bkb3duKG5vZGUuaWQpO1xuICAgICAgICB9XG4gICAgfSkpO1xufVxuaW5pdGlhbGl6ZUJ1dHRvbkV2ZW50cygpO1xuaW5pdGlhbGl6ZURyb3Bkb3duRXZlbnRzKCk7XG4oMCwgd2Fsa3Rocm91Z2hfMS5zZXRVcFdhbGt0aHJvdWdoKSgpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG5mdW5jdGlvbiBzaG93TW9kYWwodGl0bGVUZXh0LCBkZXNjcmlwdGlvblRleHQpIHtcbiAgICBjb25zdCBvdmVybGF5Tm9kZSA9ICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnbW9kYWwtb3ZlcmxheScpO1xuICAgIG92ZXJsYXlOb2RlLmNsYXNzTGlzdC5hZGQoJ29wZW4nKTtcbiAgICAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ21vZGFsLXRpdGxlJykuaW5uZXJUZXh0ID0gdGl0bGVUZXh0O1xuICAgICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnbW9kYWwtZGVzY3JpcHRpb24nKS5pbm5lclRleHQgPSBkZXNjcmlwdGlvblRleHQ7XG4gICAgKDAsIHV0aWxzXzEuYWRkSHRtbEV2ZW50KSgoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ21vZGFsLWNsb3NlJyksICgpID0+IHtcbiAgICAgICAgb3ZlcmxheU5vZGUuY2xhc3NMaXN0LnJlbW92ZSgnb3BlbicpO1xuICAgIH0pO1xufVxuZXhwb3J0cy5kZWZhdWx0ID0gc2hvd01vZGFsO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBOb2RlIHtcbiAgICBjb25zdHJ1Y3RvcihfciwgX2MsIF9pZCwgX3N0YXR1cykge1xuICAgICAgICB0aGlzLnIgPSBfcjtcbiAgICAgICAgdGhpcy5jID0gX2M7XG4gICAgICAgIHRoaXMuaWQgPSBfaWQ7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gX3N0YXR1cztcbiAgICAgICAgdGhpcy5wcmV2aW91cyA9IG51bGw7XG4gICAgfVxuICAgIHNldFByZXZpb3VzKHByZXZpb3VzKSB7XG4gICAgICAgIHRoaXMucHJldmlvdXMgPSBwcmV2aW91cztcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBOb2RlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBUaW1lciB7XG4gICAgY29uc3RydWN0b3IoY2FsbGJhY2ssIGRlbGF5KSB7XG4gICAgICAgIHRoaXMuc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgICAgICB0aGlzLnJlbWFpbmluZyA9IGRlbGF5O1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIHRoaXMuaWQgPSBzZXRUaW1lb3V0KHRoaXMuY2FsbGJhY2ssIGRlbGF5KTtcbiAgICB9XG4gICAgcGF1c2UoKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmlkKTtcbiAgICAgICAgdGhpcy5yZW1haW5pbmcgPSB0aGlzLnJlbWFpbmluZyAtIChEYXRlLm5vdygpIC0gdGhpcy5zdGFydCk7XG4gICAgfVxuICAgIHJlc3VtZSgpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuaWQpO1xuICAgICAgICB0aGlzLnN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdGhpcy5pZCA9IHNldFRpbWVvdXQodGhpcy5jYWxsYmFjaywgdGhpcy5yZW1haW5pbmcpO1xuICAgIH1cbiAgICBjbGVhcigpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuaWQpO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IFRpbWVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmNoYW5nZURyb3Bkb3duTGFiZWwgPSBleHBvcnRzLmFkZEh0bWxFdmVudCA9IGV4cG9ydHMuZ2V0Tm9kZUJ5SWQgPSBleHBvcnRzLmdldE5vZGVzID0gdm9pZCAwO1xuZnVuY3Rpb24gZ2V0Tm9kZXMoc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG59XG5leHBvcnRzLmdldE5vZGVzID0gZ2V0Tm9kZXM7XG5mdW5jdGlvbiBnZXROb2RlQnlJZChzZWxlY3RvcklkKSB7XG4gICAgY29uc3Qgbm9kZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNlbGVjdG9ySWQpO1xuICAgIGlmICghbm9kZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNlbGVjdG9yIG5vdCBmb3VuZDogJHtzZWxlY3RvcklkfWApO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbn1cbmV4cG9ydHMuZ2V0Tm9kZUJ5SWQgPSBnZXROb2RlQnlJZDtcbmZ1bmN0aW9uIGFkZEh0bWxFdmVudChub2RlLCBjYWxsYmFjaywgZXZlbnROYW1lID0gJ2NsaWNrJykge1xuICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrKTtcbn1cbmV4cG9ydHMuYWRkSHRtbEV2ZW50ID0gYWRkSHRtbEV2ZW50O1xuZnVuY3Rpb24gY2hhbmdlRHJvcGRvd25MYWJlbChub2RlLCB0ZXh0KSB7XG4gICAgdmFyIF9hLCBfYjtcbiAgICBjb25zdCBjb250cm9scyA9IChfYiA9IChfYSA9IG5vZGUucGFyZW50RWxlbWVudCkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnBhcmVudEVsZW1lbnQpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5xdWVyeVNlbGVjdG9yKCcuZHJvcGRvd24tY29udHJvbHMnKTtcbiAgICBpZiAoIWNvbnRyb2xzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29udHJvbHMuaW5uZXJUZXh0ID0gdGV4dDtcbn1cbmV4cG9ydHMuY2hhbmdlRHJvcGRvd25MYWJlbCA9IGNoYW5nZURyb3Bkb3duTGFiZWw7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuc2V0VXBXYWxrdGhyb3VnaCA9IGV4cG9ydHMucmVJbml0aWF0ZVdhbGt0aHJvdWdoID0gdm9pZCAwO1xuY29uc3QgdXRpbHNfMSA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xuY29uc3QgY29uc3RhbnRzXzEgPSByZXF1aXJlKFwiLi9jb25zdGFudHNcIik7XG5sZXQgY3VycmVudEluZGV4ID0gMDtcbmZ1bmN0aW9uIGdvVG9JbmRleCgpIHtcbiAgICBjb25zdCBvdmVybGF5Tm9kZSA9ICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnd2Fsa3Rocm91Z2gtb3ZlcmxheScpO1xuICAgIGlmIChjdXJyZW50SW5kZXggPCAwKSB7XG4gICAgICAgIG92ZXJsYXlOb2RlLmNsYXNzTGlzdC5yZW1vdmUoJ29wZW4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBvdmVybGF5Tm9kZS5jbGFzc0xpc3QuYWRkKCdvcGVuJyk7XG4gICAgY29uc3QgY29udGFpbmVyTm9kZSA9ICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnd2Fsa3Rocm91Z2gtY29udGFpbmVyJyk7XG4gICAgY29uc3QgY3VycmVudFN0ZXAgPSBjb25zdGFudHNfMS5XQUxLVEhST1VHSF9QT1NJVElPTlNbY3VycmVudEluZGV4XTtcbiAgICBjb25zdCBwb3NpdGlvbnMgPSAoMCwgdXRpbHNfMS5nZXROb2RlcykoY3VycmVudFN0ZXAucmVmZXJlbmNlKVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb250YWluZXJOb2RlLnN0eWxlLnRvcCA9IGAke3Bvc2l0aW9ucy55ICsgcG9zaXRpb25zLmhlaWdodCArIGN1cnJlbnRTdGVwLnRvcH1weGA7XG4gICAgY29udGFpbmVyTm9kZS5zdHlsZS5sZWZ0ID0gYCR7cG9zaXRpb25zLnggKyBjdXJyZW50U3RlcC5sZWZ0fXB4YDtcbiAgICAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ3dhbGt0aHJvdWdoLXN0ZXBwZXInKS5pbm5lclRleHQgPSBgJHtjdXJyZW50SW5kZXggKyAxfSBvZiAke2NvbnN0YW50c18xLldBTEtUSFJPVUdIX1BPU0lUSU9OUy5sZW5ndGh9YDtcbiAgICAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ3dhbGt0aHJvdWdoLXRpdGxlJykuaW5uZXJUZXh0ID0gY3VycmVudFN0ZXAudGl0bGU7XG4gICAgKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCd3YWxrdGhyb3VnaC1kZXNjcmlwdGlvbicpLmlubmVyVGV4dCA9IGN1cnJlbnRTdGVwLmRlc2NyaXB0aW9uO1xufVxuZnVuY3Rpb24gcmVJbml0aWF0ZVdhbGt0aHJvdWdoKCkge1xuICAgIGN1cnJlbnRJbmRleCA9IDA7XG4gICAgZ29Ub0luZGV4KCk7XG59XG5leHBvcnRzLnJlSW5pdGlhdGVXYWxrdGhyb3VnaCA9IHJlSW5pdGlhdGVXYWxrdGhyb3VnaDtcbmZ1bmN0aW9uIHNldFVwV2Fsa3Rocm91Z2goKSB7XG4gICAgc2V0VGltZW91dCgoKSA9PiByZUluaXRpYXRlV2Fsa3Rocm91Z2goKSwgNjAwKTtcbiAgICAoMCwgdXRpbHNfMS5hZGRIdG1sRXZlbnQpKCgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnd2Fsa3Rocm91Z2gtc2tpcCcpLCAoKSA9PiB7XG4gICAgICAgIGN1cnJlbnRJbmRleCA9IC0xO1xuICAgICAgICBnb1RvSW5kZXgoKTtcbiAgICB9KTtcbiAgICAoMCwgdXRpbHNfMS5hZGRIdG1sRXZlbnQpKCgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnd2Fsa3Rocm91Z2gtbmV4dCcpLCAoKSA9PiB7XG4gICAgICAgIGN1cnJlbnRJbmRleCArPSAxO1xuICAgICAgICBpZiAoY3VycmVudEluZGV4ID09PSBjb25zdGFudHNfMS5XQUxLVEhST1VHSF9QT1NJVElPTlMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjdXJyZW50SW5kZXggPSAtMTtcbiAgICAgICAgfVxuICAgICAgICBnb1RvSW5kZXgoKTtcbiAgICB9KTtcbn1cbmV4cG9ydHMuc2V0VXBXYWxrdGhyb3VnaCA9IHNldFVwV2Fsa3Rocm91Z2g7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvaW5kZXgudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=