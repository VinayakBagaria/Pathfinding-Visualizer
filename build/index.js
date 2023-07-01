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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSx3QkFBd0I7Ozs7Ozs7VUMxRHhCO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy9hbmltYXRlLnRzIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uLy4vc3JjL2Jmcy50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy9ib2FyZC50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vLi9zcmMvZGZzLnRzIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uLy4vc3JjL2hlbHBlcnMudHMiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vLi9zcmMvbW9kYWwudHMiLCJ3ZWJwYWNrOi8vcGF0aC1maW5kaW5nLXZpc3VhbGl6YXRpb24vLi9zcmMvbm9kZS50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy90aW1lci50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy91dGlscy50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi8uL3NyYy93YWxrdGhyb3VnaC50cyIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3BhdGgtZmluZGluZy12aXN1YWxpemF0aW9uL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9wYXRoLWZpbmRpbmctdmlzdWFsaXphdGlvbi93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnN0YXJ0U2hvcnRlc3RQYXRoQW5pbWF0aW9uID0gZXhwb3J0cy5zdGFydFZpc2l0ZWROb2Rlc0FuaW1hdGlvbnMgPSB2b2lkIDA7XG5jb25zdCB0aW1lcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL3RpbWVyXCIpKTtcbmNvbnN0IGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4vY29uc3RhbnRzXCIpO1xuZnVuY3Rpb24gc3RhcnRUaW1lcihub2Rlc1RvQW5pbWF0ZSwgaW5kZXgsIHRpbWUsIGFuaW1hdGlvblR5cGUsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIG5ldyB0aW1lcl8xLmRlZmF1bHQoKCkgPT4ge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZXNUb0FuaW1hdGVbaW5kZXhdO1xuICAgICAgICBjb25zdCBjdXJyZW50RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG5vZGUuaWQpO1xuICAgICAgICBpZiAoIWN1cnJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZm91bmQgbm9kZScpO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3VudmlzaXRlZCcpO1xuICAgICAgICBpZiAoYW5pbWF0aW9uVHlwZSA9PT0gJ3RyYXZlbCcpIHtcbiAgICAgICAgICAgIGN1cnJlbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2N1cnJlbnQnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGN1cnJlbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3Nob3J0ZXN0LXBhdGgnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYW5pbWF0aW9uVHlwZSA9PT0gJ3RyYXZlbCcgJiYgaW5kZXggPj0gMSkge1xuICAgICAgICAgICAgY29uc3QgcHJldmlvdXMgPSBub2Rlc1RvQW5pbWF0ZVtpbmRleCAtIDFdO1xuICAgICAgICAgICAgY29uc3QgcHJldmlvdXNFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocHJldmlvdXMuaWQpO1xuICAgICAgICAgICAgaWYgKCFwcmV2aW91c0VsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZm91bmQgbm9kZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJldmlvdXNFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2N1cnJlbnQnKTtcbiAgICAgICAgICAgIHByZXZpb3VzRWxlbWVudC5jbGFzc0xpc3QuYWRkKCd2aXNpdGVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2sgPT09IG51bGwgfHwgY2FsbGJhY2sgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGNhbGxiYWNrKGluZGV4KTtcbiAgICB9LCB0aW1lLCBhbmltYXRpb25UeXBlKTtcbn1cbmZ1bmN0aW9uIHN0YXJ0VmlzaXRlZE5vZGVzQW5pbWF0aW9ucyhub2Rlc1RvQW5pbWF0ZSwgc3BlZWQsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgdGltZXJzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlc1RvQW5pbWF0ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aW1lcnMucHVzaChzdGFydFRpbWVyKG5vZGVzVG9BbmltYXRlLCBpLCAoaSArIDEpICogY29uc3RhbnRzXzEuU1BFRURfTUFQUElOR1tzcGVlZF0udGltZSwgJ3RyYXZlbCcsIGNhbGxiYWNrKSk7XG4gICAgfVxuICAgIHJldHVybiB0aW1lcnM7XG59XG5leHBvcnRzLnN0YXJ0VmlzaXRlZE5vZGVzQW5pbWF0aW9ucyA9IHN0YXJ0VmlzaXRlZE5vZGVzQW5pbWF0aW9ucztcbmZ1bmN0aW9uIHN0YXJ0U2hvcnRlc3RQYXRoQW5pbWF0aW9uKGVuZE5vZGUsIG5vZGVNYXAsIHNwZWVkLCBjYWxsYmFjaykge1xuICAgIHZhciBfYSwgX2I7XG4gICAgY29uc3Qgc2hvcnRlc3RQYXRoc1RvQW5pbWF0ZSA9IFtdO1xuICAgIGxldCBwcmV2aW91c05vZGUgPSBlbmROb2RlLnByZXZpb3VzO1xuICAgIHdoaWxlIChwcmV2aW91c05vZGUgIT09IG51bGwpIHtcbiAgICAgICAgc2hvcnRlc3RQYXRoc1RvQW5pbWF0ZS51bnNoaWZ0KHByZXZpb3VzTm9kZSk7XG4gICAgICAgIHByZXZpb3VzTm9kZSA9IChfYiA9IChfYSA9IG5vZGVNYXAuZ2V0KHByZXZpb3VzTm9kZS5pZCkpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5wcmV2aW91cykgIT09IG51bGwgJiYgX2IgIT09IHZvaWQgMCA/IF9iIDogbnVsbDtcbiAgICB9XG4gICAgY29uc3QgdGltZXJzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaG9ydGVzdFBhdGhzVG9BbmltYXRlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRpbWVycy5wdXNoKHN0YXJ0VGltZXIoc2hvcnRlc3RQYXRoc1RvQW5pbWF0ZSwgaSwgKGkgKyAxKSAqIGNvbnN0YW50c18xLlNQRUVEX01BUFBJTkdbc3BlZWRdLnBhdGhUaW1lLCAnc2hvcnRlc3QtcGF0aCcsIGNhbGxiYWNrKSk7XG4gICAgfVxuICAgIHJldHVybiB0aW1lcnM7XG59XG5leHBvcnRzLnN0YXJ0U2hvcnRlc3RQYXRoQW5pbWF0aW9uID0gc3RhcnRTaG9ydGVzdFBhdGhBbmltYXRpb247XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGhlbHBlcnNfMSA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XG5mdW5jdGlvbiBiZnNBbGdvcml0aG0oc3RhcnRJZCwgZW5kSWQsIG5vZGVNYXAsIG5vZGVzVG9BbmltYXRlKSB7XG4gICAgY29uc3QgcXVldWUgPSBbbm9kZU1hcC5nZXQoc3RhcnRJZCldO1xuICAgIGNvbnN0IHZpc2l0ZWQgPSBuZXcgTWFwKCk7XG4gICAgdmlzaXRlZC5zZXQoc3RhcnRJZCwgdHJ1ZSk7XG4gICAgd2hpbGUgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgIGlmICh0eXBlb2YgY3VycmVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG5vZGVzVG9BbmltYXRlLnB1c2goY3VycmVudCk7XG4gICAgICAgIGN1cnJlbnQuc3RhdHVzID0gJ3Zpc2l0ZWQnO1xuICAgICAgICBpZiAoY3VycmVudC5pZCA9PT0gZW5kSWQpIHtcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5laWdoYm91cnMgPSAoMCwgaGVscGVyc18xLmdldE5laWdoYm91cnMpKGN1cnJlbnQuaWQsIG5vZGVNYXApO1xuICAgICAgICBmb3IgKGNvbnN0IG5laWdoYm91ciBvZiBuZWlnaGJvdXJzKSB7XG4gICAgICAgICAgICBpZiAoIXZpc2l0ZWQuaGFzKG5laWdoYm91ci5pZCkpIHtcbiAgICAgICAgICAgICAgICB2aXNpdGVkLnNldChuZWlnaGJvdXIuaWQsIHRydWUpO1xuICAgICAgICAgICAgICAgIG5laWdoYm91ci5wcmV2aW91cyA9IGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgcXVldWUucHVzaChuZWlnaGJvdXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuZXhwb3J0cy5kZWZhdWx0ID0gYmZzQWxnb3JpdGhtO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBub2RlXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vbm9kZVwiKSk7XG5jb25zdCBkZnNfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9kZnNcIikpO1xuY29uc3QgYmZzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vYmZzXCIpKTtcbmNvbnN0IGhlbHBlcnNfMSA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XG5jbGFzcyBCb2FyZCB7XG4gICAgY29uc3RydWN0b3IoX2JvYXJkTm9kZSkge1xuICAgICAgICB0aGlzLmJvYXJkTm9kZSA9IF9ib2FyZE5vZGU7XG4gICAgICAgIHRoaXMuc2V0SW5pdGlhbENvb3JkaW5hdGVzKCk7XG4gICAgICAgIHRoaXMuZHJhZ2dpbmcgPSB7IHN0YXJ0OiBmYWxzZSwgZW5kOiBmYWxzZSB9O1xuICAgICAgICB0aGlzLmlzQ3JlYXRpbmdXYWxsID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY3JlYXRlR3JpZCgpO1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgfVxuICAgIHNldEluaXRpYWxDb29yZGluYXRlcygpIHtcbiAgICAgICAgY29uc3QgeyBoZWlnaHQsIHdpZHRoIH0gPSB0aGlzLmJvYXJkTm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQgLyAyODtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoIC8gMjg7XG4gICAgICAgIGNvbnN0IHN0YXJ0Q29vcmRzID0gW1xuICAgICAgICAgICAgTWF0aC5mbG9vcih0aGlzLmhlaWdodCAvIDIpLFxuICAgICAgICAgICAgTWF0aC5mbG9vcih0aGlzLndpZHRoIC8gNCksXG4gICAgICAgIF07XG4gICAgICAgIHRoaXMuc3RhcnRJZCA9ICgwLCBoZWxwZXJzXzEuY3JlYXRlTm9kZUlkKShzdGFydENvb3Jkc1swXSwgc3RhcnRDb29yZHNbMV0pO1xuICAgICAgICBjb25zdCBlbmRDb29yZHMgPSBbXG4gICAgICAgICAgICBNYXRoLmZsb29yKHRoaXMuaGVpZ2h0IC8gMiksXG4gICAgICAgICAgICAzICogTWF0aC5mbG9vcih0aGlzLndpZHRoIC8gNCksXG4gICAgICAgIF07XG4gICAgICAgIHRoaXMuZW5kSWQgPSAoMCwgaGVscGVyc18xLmNyZWF0ZU5vZGVJZCkoZW5kQ29vcmRzWzBdLCBlbmRDb29yZHNbMV0pO1xuICAgIH1cbiAgICBjcmVhdGVHcmlkKCkge1xuICAgICAgICB0aGlzLm5vZGVNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMubm9kZXNUb0FuaW1hdGUgPSBbXTtcbiAgICAgICAgbGV0IHRhYmxlSHRtbCA9ICcnO1xuICAgICAgICBmb3IgKGxldCByID0gMDsgciA8IHRoaXMuaGVpZ2h0OyByKyspIHtcbiAgICAgICAgICAgIGxldCBjdXJyZW50Um93ID0gJyc7XG4gICAgICAgICAgICBmb3IgKGxldCBjID0gMDsgYyA8IHRoaXMud2lkdGg7IGMrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVJZCA9ICgwLCBoZWxwZXJzXzEuY3JlYXRlTm9kZUlkKShyLCBjKTtcbiAgICAgICAgICAgICAgICBsZXQgbm9kZVN0YXR1cyA9ICd1bnZpc2l0ZWQnO1xuICAgICAgICAgICAgICAgIGlmIChub2RlSWQgPT09IHRoaXMuc3RhcnRJZCkge1xuICAgICAgICAgICAgICAgICAgICBub2RlU3RhdHVzID0gJ3N0YXJ0JztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFydElkID0gbm9kZUlkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChub2RlSWQgPT09IHRoaXMuZW5kSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZVN0YXR1cyA9ICdlbmQnO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVuZElkID0gbm9kZUlkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdXJyZW50Um93ICs9IGA8dGQgaWQ9JHtub2RlSWR9IGNsYXNzPSR7bm9kZVN0YXR1c30+PC90ZD5gO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgbm9kZV8xLmRlZmF1bHQociwgYywgbm9kZUlkLCBub2RlU3RhdHVzKTtcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGVNYXAuc2V0KG5vZGVJZCwgbm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0YWJsZUh0bWwgKz0gYDx0ciBpZD1cInJvdyAke3J9XCI+JHtjdXJyZW50Um93fTwvdHI+YDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJvYXJkTm9kZS5pbm5lckhUTUwgPSB0YWJsZUh0bWw7XG4gICAgfVxuICAgIGFkZEV2ZW50TGlzdGVuZXJzKCkge1xuICAgICAgICB0aGlzLmJvYXJkTm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBldmVudCA9PiB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMubm9kZU1hcC5nZXQoZWxlbWVudC5pZCk7XG4gICAgICAgICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm9kZS5zdGF0dXMgPT09ICdzdGFydCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0YXJ0ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUuc3RhdHVzID09PSAnZW5kJykge1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuZW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUuc3RhdHVzID09PSAnd2FsbCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZU5vZGVFbGVtZW50KGVsZW1lbnQuaWQsICd1bnZpc2l0ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNDcmVhdGluZ1dhbGwgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ib2FyZE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcgPSB7IHN0YXJ0OiBmYWxzZSwgZW5kOiBmYWxzZSB9O1xuICAgICAgICAgICAgdGhpcy5pc0NyZWF0aW5nV2FsbCA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ib2FyZE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nLnN0YXJ0IHx8IHRoaXMuZHJhZ2dpbmcuZW5kKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcuc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuaWQgPT09IHRoaXMuZW5kSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZU5vZGVFbGVtZW50KHRoaXMuc3RhcnRJZCwgJ3VudmlzaXRlZCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZU5vZGVFbGVtZW50KGVsZW1lbnQuaWQsICdzdGFydCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmRyYWdnaW5nLmVuZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5pZCA9PT0gdGhpcy5zdGFydElkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VOb2RlRWxlbWVudCh0aGlzLmVuZElkLCAndW52aXNpdGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTm9kZUVsZW1lbnQoZWxlbWVudC5pZCwgJ2VuZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuaXNDcmVhdGluZ1dhbGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZU5vZGVFbGVtZW50KGVsZW1lbnQuaWQsICd3YWxsJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjaGFuZ2VOb2RlRWxlbWVudChub2RlSWQsIG5ld1N0YXR1cykge1xuICAgICAgICBjb25zdCBjdXJyZW50Tm9kZSA9IHRoaXMubm9kZU1hcC5nZXQobm9kZUlkKTtcbiAgICAgICAgY29uc3QgY3VycmVudEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChub2RlSWQpO1xuICAgICAgICBpZiAoIWN1cnJlbnROb2RlIHx8ICFjdXJyZW50RWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuZXdTdGF0dXMgPT09ICd3YWxsJyAmJiBbJ3N0YXJ0JywgJ2VuZCddLmluY2x1ZGVzKGN1cnJlbnROb2RlLnN0YXR1cykpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdzaG9ydGVzdC1wYXRoJyk7XG4gICAgICAgIGN1cnJlbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3Zpc2l0ZWQnKTtcbiAgICAgICAgY3VycmVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnY3VycmVudCcpO1xuICAgICAgICBjdXJyZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCd1bnZpc2l0ZWQnKTtcbiAgICAgICAgY3VycmVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnd2FsbCcpO1xuICAgICAgICBjdXJyZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKG5ld1N0YXR1cyk7XG4gICAgICAgIGN1cnJlbnROb2RlLnN0YXR1cyA9IG5ld1N0YXR1cztcbiAgICAgICAgaWYgKG5ld1N0YXR1cyA9PT0gJ3N0YXJ0Jykge1xuICAgICAgICAgICAgdGhpcy5zdGFydElkID0gY3VycmVudE5vZGUuaWQ7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5ld1N0YXR1cyA9PT0gJ2VuZCcpIHtcbiAgICAgICAgICAgIHRoaXMuZW5kSWQgPSBjdXJyZW50Tm9kZS5pZDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdzdGFydCcpO1xuICAgICAgICBjdXJyZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdlbmQnKTtcbiAgICB9XG4gICAgY2xlYXJCb2FyZCgpIHtcbiAgICAgICAgdGhpcy5zZXRJbml0aWFsQ29vcmRpbmF0ZXMoKTtcbiAgICAgICAgdGhpcy5jcmVhdGVHcmlkKCk7XG4gICAgfVxuICAgIGNsZWFyV2FsbHMoKSB7XG4gICAgICAgIGZvciAoY29uc3QgcGFpciBvZiB0aGlzLm5vZGVNYXApIHtcbiAgICAgICAgICAgIGlmIChwYWlyWzFdLnN0YXR1cyA9PT0gJ3dhbGwnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VOb2RlRWxlbWVudChwYWlyWzBdLCAndW52aXNpdGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2xlYXJQYXRoKCkge1xuICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2YgdGhpcy5ub2RlTWFwKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50Tm9kZUlkID0gcGFpclswXTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50Tm9kZUlkID09PSB0aGlzLnN0YXJ0SWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZU5vZGVFbGVtZW50KGN1cnJlbnROb2RlSWQsICdzdGFydCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY3VycmVudE5vZGVJZCA9PT0gdGhpcy5lbmRJZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTm9kZUVsZW1lbnQoY3VycmVudE5vZGVJZCwgJ2VuZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAocGFpclsxXS5zdGF0dXMgPT09ICd2aXNpdGVkJykge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlTm9kZUVsZW1lbnQocGFpclswXSwgJ3VudmlzaXRlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXJ0KGFsZ29yaXRobSkge1xuICAgICAgICB0aGlzLm5vZGVzVG9BbmltYXRlID0gW107XG4gICAgICAgIGxldCBlbmROb2RlID0gbnVsbDtcbiAgICAgICAgaWYgKGFsZ29yaXRobSA9PT0gJ2RmcycpIHtcbiAgICAgICAgICAgIGVuZE5vZGUgPSAoMCwgZGZzXzEuZGVmYXVsdCkodGhpcy5zdGFydElkLCB0aGlzLmVuZElkLCB0aGlzLm5vZGVNYXAsIHRoaXMubm9kZXNUb0FuaW1hdGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFsZ29yaXRobSA9PT0gJ2JmcycpIHtcbiAgICAgICAgICAgIGVuZE5vZGUgPSAoMCwgYmZzXzEuZGVmYXVsdCkodGhpcy5zdGFydElkLCB0aGlzLmVuZElkLCB0aGlzLm5vZGVNYXAsIHRoaXMubm9kZXNUb0FuaW1hdGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBbGdvcml0aG0gbm90IGltcGxlbWVudGVkOiAke2FsZ29yaXRobX1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBlbmROb2RlLCBub2Rlc1RvQW5pbWF0ZTogdGhpcy5ub2Rlc1RvQW5pbWF0ZSB9O1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IEJvYXJkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLldBTEtUSFJPVUdIX1BPU0lUSU9OUyA9IGV4cG9ydHMuTk9ERV9UT19JRF9NQVBQSU5HID0gZXhwb3J0cy5TUEVFRF9NQVBQSU5HID0gZXhwb3J0cy5BTEdPUklUSE1fTUFQUElORyA9IHZvaWQgMDtcbmV4cG9ydHMuQUxHT1JJVEhNX01BUFBJTkcgPSBPYmplY3QuZnJlZXplKHtcbiAgICBkZnM6IHtcbiAgICAgICAgaWQ6ICdkZnMtYWxnb3JpdGhtJyxcbiAgICAgICAgbmFtZTogJ0RGUycsXG4gICAgfSxcbiAgICBiZnM6IHtcbiAgICAgICAgaWQ6ICdiZnMtYWxnb3JpdGhtJyxcbiAgICAgICAgbmFtZTogJ0JGUycsXG4gICAgfSxcbn0pO1xuZXhwb3J0cy5TUEVFRF9NQVBQSU5HID0gT2JqZWN0LmZyZWV6ZSh7XG4gICAgZmFzdDoge1xuICAgICAgICBpZDogJ2Zhc3Qtc3BlZWQnLFxuICAgICAgICB0aW1lOiA1LFxuICAgICAgICBuYW1lOiAnRmFzdCcsXG4gICAgICAgIHBhdGhUaW1lOiA1MCxcbiAgICB9LFxuICAgIGF2ZXJhZ2U6IHtcbiAgICAgICAgaWQ6ICdhdmVyYWdlLXNwZWVkJyxcbiAgICAgICAgdGltZTogMTAwLFxuICAgICAgICBuYW1lOiAnQXZlcmFnZScsXG4gICAgICAgIHBhdGhUaW1lOiAxNTAsXG4gICAgfSxcbiAgICBzbG93OiB7XG4gICAgICAgIGlkOiAnc2xvdy1zcGVlZCcsXG4gICAgICAgIHRpbWU6IDMwMCxcbiAgICAgICAgbmFtZTogJ1Nsb3cnLFxuICAgICAgICBwYXRoVGltZTogNDAwLFxuICAgIH0sXG59KTtcbmV4cG9ydHMuTk9ERV9UT19JRF9NQVBQSU5HID0gT2JqZWN0LmZyZWV6ZSh7XG4gICAgYm9hcmQ6ICdib2FyZCcsXG4gICAgdmlzdWFsaXplQnV0dG9uOiAndmlzdWFsaXplJyxcbiAgICBwbGF5UGF1c2VCdXR0b246ICdwbGF5LXBhdXNlJyxcbn0pO1xuZXhwb3J0cy5XQUxLVEhST1VHSF9QT1NJVElPTlMgPSBbXG4gICAge1xuICAgICAgICByZWZlcmVuY2U6ICcjYWxnb3JpdGhtcycsXG4gICAgICAgIHRvcDogMjUsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHRpdGxlOiAnUGljayBhbiBhbGdvcml0aG0nLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Nob29zZSBhbnkgdHJhdmVyc2FsIGFsZ29yaXRobSBmcm9tIHRoaXMgbWVudS4nLFxuICAgICAgICBpbWFnZTogJy4vcHVibGljL2FsZ29yaXRobS1zZWxlY3Rvci5wbmcnLFxuICAgIH0sXG4gICAge1xuICAgICAgICByZWZlcmVuY2U6ICcuc3RhcnQnLFxuICAgICAgICB0b3A6IC0xNTAsXG4gICAgICAgIGxlZnQ6IDEwMCxcbiAgICAgICAgdGl0bGU6ICdBZGQgd2FsbHMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0NsaWNrIG9uIHRoZSBncmlkIHRvIGFkZCBhIHdhbGwuIEEgcGF0aCBjYW5ub3QgY3Jvc3MgYSB3YWxsLicsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHJlZmVyZW5jZTogJy5zdGFydCcsXG4gICAgICAgIHRvcDogMTAsXG4gICAgICAgIGxlZnQ6IC0yMCxcbiAgICAgICAgdGl0bGU6ICdEcmFnIG5vZGVzJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdZb3UgY2FuIGRyYWcgdGhlIHN0YXJ0IGFuZCBlbmQgdGFyZ2V0IHRvIGFueSBwbGFjZSBpbiB0aGUgZ3JpZC4nLFxuICAgIH0sXG4gICAge1xuICAgICAgICByZWZlcmVuY2U6ICcjdmlzdWFsaXplJyxcbiAgICAgICAgdG9wOiAyNSxcbiAgICAgICAgbGVmdDogMCxcbiAgICAgICAgdGl0bGU6ICdDb250cm9scycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnWW91IGNhbiBzdGFydCB0aGUgdmlzdWFsaXphdGlvbiwgcGF1c2UvcmVzdW1lIGl0IGluIGJldHdlZW4sIGFkanVzdCB0aGUgdmlzdWFsaXphdGlvbiBzcGVlZCwgY2xlYXIgdGhlIGJvYXJkIGZyb20gdGhlIGNvbnRyb2xzIHBhbmVsIGhlcmUuJyxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgcmVmZXJlbmNlOiAnI3dhbGt0aHJvdWdoLXR1dG9yaWFsJyxcbiAgICAgICAgdG9wOiAzMCxcbiAgICAgICAgbGVmdDogLTI3NSxcbiAgICAgICAgdGl0bGU6ICdSZXZpc2l0JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdJZiB5b3Ugd2FudCB0byBzZWUgdGhpcyB0dXRvcmlhbCBhZ2FpbiwgY2xpY2sgb24gdGhpcyBpY29uLicsXG4gICAgICAgIGRpcmVjdGlvbjogJ3J0bCcsXG4gICAgfSxcbl07XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGhlbHBlcnNfMSA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XG5mdW5jdGlvbiBkZnNBbGdvcml0aG0oc3RhcnRJZCwgZW5kSWQsIG5vZGVNYXAsIG5vZGVzVG9BbmltYXRlKSB7XG4gICAgY29uc3QgcXVldWUgPSBbbm9kZU1hcC5nZXQoc3RhcnRJZCldO1xuICAgIGNvbnN0IHZpc2l0ZWQgPSBuZXcgTWFwKCk7XG4gICAgd2hpbGUgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IHF1ZXVlLnBvcCgpO1xuICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICB2aXNpdGVkLnNldChjdXJyZW50LmlkLCB0cnVlKTtcbiAgICAgICAgbm9kZXNUb0FuaW1hdGUucHVzaChjdXJyZW50KTtcbiAgICAgICAgY3VycmVudC5zdGF0dXMgPSAndmlzaXRlZCc7XG4gICAgICAgIGlmIChjdXJyZW50LmlkID09PSBlbmRJZCkge1xuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmVpZ2hib3VycyA9ICgwLCBoZWxwZXJzXzEuZ2V0TmVpZ2hib3VycykoY3VycmVudC5pZCwgbm9kZU1hcCkucmV2ZXJzZSgpO1xuICAgICAgICBmb3IgKGNvbnN0IG5laWdoYm91ciBvZiBuZWlnaGJvdXJzKSB7XG4gICAgICAgICAgICBpZiAoIXZpc2l0ZWQuaGFzKG5laWdoYm91ci5pZCkpIHtcbiAgICAgICAgICAgICAgICBuZWlnaGJvdXIucHJldmlvdXMgPSBjdXJyZW50O1xuICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2gobmVpZ2hib3VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbmV4cG9ydHMuZGVmYXVsdCA9IGRmc0FsZ29yaXRobTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5nZXROZWlnaGJvdXJzID0gZXhwb3J0cy5jcmVhdGVOb2RlSWQgPSB2b2lkIDA7XG5mdW5jdGlvbiBjcmVhdGVOb2RlSWQociwgYykge1xuICAgIHJldHVybiBgJHtyfS0ke2N9YDtcbn1cbmV4cG9ydHMuY3JlYXRlTm9kZUlkID0gY3JlYXRlTm9kZUlkO1xuZnVuY3Rpb24gZ2V0TmVpZ2hib3VycyhjdXJyZW50SWQsIG5vZGVNYXApIHtcbiAgICBjb25zdCBjb29yZGluYXRlcyA9IGN1cnJlbnRJZC5zcGxpdCgnLScpO1xuICAgIGNvbnN0IHggPSBwYXJzZUludChjb29yZGluYXRlc1swXSwgMTApO1xuICAgIGNvbnN0IHkgPSBwYXJzZUludChjb29yZGluYXRlc1sxXSwgMTApO1xuICAgIGNvbnN0IG5laWdoYm91cnMgPSBbXTtcbiAgICBjb25zdCBjb21iaW5hdGlvbnMgPSBbXG4gICAgICAgIFstMSwgMF0sXG4gICAgICAgIFswLCAxXSxcbiAgICAgICAgWzEsIDBdLFxuICAgICAgICBbMCwgLTFdLFxuICAgIF07XG4gICAgZm9yIChjb25zdCBjb21iaW5hdGlvbiBvZiBjb21iaW5hdGlvbnMpIHtcbiAgICAgICAgY29uc3QgbmV3WCA9IHggKyBjb21iaW5hdGlvblswXTtcbiAgICAgICAgY29uc3QgbmV3WSA9IHkgKyBjb21iaW5hdGlvblsxXTtcbiAgICAgICAgY29uc3QgbmVpZ2hib3VyTm9kZSA9IG5vZGVNYXAuZ2V0KGNyZWF0ZU5vZGVJZChuZXdYLCBuZXdZKSk7XG4gICAgICAgIGlmICh0eXBlb2YgbmVpZ2hib3VyTm9kZSAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgICAgIG5laWdoYm91ck5vZGUuc3RhdHVzICE9PSAnd2FsbCcpIHtcbiAgICAgICAgICAgIG5laWdoYm91cnMucHVzaChuZWlnaGJvdXJOb2RlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmVpZ2hib3Vycztcbn1cbmV4cG9ydHMuZ2V0TmVpZ2hib3VycyA9IGdldE5laWdoYm91cnM7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGJvYXJkXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vYm9hcmRcIikpO1xuY29uc3QgYW5pbWF0ZV8xID0gcmVxdWlyZShcIi4vYW5pbWF0ZVwiKTtcbmNvbnN0IG1vZGFsXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vbW9kYWxcIikpO1xuY29uc3Qgd2Fsa3Rocm91Z2hfMSA9IHJlcXVpcmUoXCIuL3dhbGt0aHJvdWdoXCIpO1xuY29uc3QgdXRpbHNfMSA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xuY29uc3QgY29uc3RhbnRzXzEgPSByZXF1aXJlKFwiLi9jb25zdGFudHNcIik7XG5jb25zdCBib2FyZE5vZGUgPSAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoY29uc3RhbnRzXzEuTk9ERV9UT19JRF9NQVBQSU5HLmJvYXJkKTtcbmNvbnN0IGJvYXJkID0gbmV3IGJvYXJkXzEuZGVmYXVsdChib2FyZE5vZGUpO1xuY29uc3QgdmlzdWFsaXplQnV0dG9uID0gKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKGNvbnN0YW50c18xLk5PREVfVE9fSURfTUFQUElORy52aXN1YWxpemVCdXR0b24pO1xuY29uc3QgcGxheVBhdXNlQnV0dG9uID0gKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKGNvbnN0YW50c18xLk5PREVfVE9fSURfTUFQUElORy5wbGF5UGF1c2VCdXR0b24pO1xuY2xhc3MgVmlzdWFsaXplclN0YXRlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5hbGdvcml0aG0gPSBudWxsO1xuICAgICAgICB0aGlzLnRpbWVycyA9IFtdO1xuICAgICAgICB0aGlzLmJvYXJkU3RhdHVzID0gbnVsbDtcbiAgICB9XG4gICAgc2V0QWxnb3JpdGhtKGFsZ29yaXRobSkge1xuICAgICAgICB0aGlzLmFsZ29yaXRobSA9IGFsZ29yaXRobTtcbiAgICB9XG4gICAgc2V0U3BlZWQobmV3U3BlZWQpIHtcbiAgICAgICAgaWYgKHRoaXMuc3BlZWQgPT09IG5ld1NwZWVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnNwZWVkID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhpcy5zcGVlZCA9IG5ld1NwZWVkO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZpc2l0ZWREaWZmZXJlbmNlID0gY29uc3RhbnRzXzEuU1BFRURfTUFQUElOR1tuZXdTcGVlZF0udGltZSAvIGNvbnN0YW50c18xLlNQRUVEX01BUFBJTkdbdGhpcy5zcGVlZF0udGltZTtcbiAgICAgICAgY29uc3QgcGF0aERpZmZlcmVuY2UgPSBjb25zdGFudHNfMS5TUEVFRF9NQVBQSU5HW25ld1NwZWVkXS5wYXRoVGltZSAvIGNvbnN0YW50c18xLlNQRUVEX01BUFBJTkdbdGhpcy5zcGVlZF0ucGF0aFRpbWU7XG4gICAgICAgIGZvciAoY29uc3QgdGltZXIgb2YgdGhpcy50aW1lcnMpIHtcbiAgICAgICAgICAgIGlmICh0aW1lci5hbmltYXRpb25UeXBlID09PSAnc2hvcnRlc3QtcGF0aCcpIHtcbiAgICAgICAgICAgICAgICB0aW1lci5zZXRSZW1haW5pbmdCeUZhY3RvcihwYXRoRGlmZmVyZW5jZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0aW1lci5hbmltYXRpb25UeXBlID09PSAndHJhdmVsJykge1xuICAgICAgICAgICAgICAgIHRpbWVyLnNldFJlbWFpbmluZ0J5RmFjdG9yKHZpc2l0ZWREaWZmZXJlbmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNwZWVkID0gbmV3U3BlZWQ7XG4gICAgfVxuICAgIGFwcGVuZFRpbWVycyhfdGltZXJzKSB7XG4gICAgICAgIHRoaXMudGltZXJzID0gWy4uLnRoaXMudGltZXJzLCAuLi5fdGltZXJzXTtcbiAgICB9XG4gICAgY2xlYXJUaW1lcnMoKSB7XG4gICAgICAgIHRoaXMudGltZXJzLmZvckVhY2goZWFjaFRpbWVyID0+IGVhY2hUaW1lci5jbGVhcigpKTtcbiAgICAgICAgdGhpcy50aW1lcnMgPSBbXTtcbiAgICB9XG4gICAgcmVzdW1lVGltZXJzKCkge1xuICAgICAgICB0aGlzLnRpbWVycy5mb3JFYWNoKGVhY2hUaW1lciA9PiBlYWNoVGltZXIucmVzdW1lKCkpO1xuICAgIH1cbiAgICBwYXVzZVRpbWVycygpIHtcbiAgICAgICAgdGhpcy50aW1lcnMuZm9yRWFjaChlYWNoVGltZXIgPT4gZWFjaFRpbWVyLnBhdXNlKCkpO1xuICAgIH1cbiAgICBzZXRCb2FyZFN0YXR1cyhuZXdCb2FyZFN0YXR1cykge1xuICAgICAgICB0aGlzLmJvYXJkU3RhdHVzID0gbmV3Qm9hcmRTdGF0dXM7XG4gICAgICAgIGlmICh0aGlzLmJvYXJkU3RhdHVzID09PSAnc3RhcnRlZCcpIHtcbiAgICAgICAgICAgIHRoaXMuaXNQbGF5aW5nID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJUaW1lcnMoKTtcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlTmV3RG9tU3RhdGUoKTtcbiAgICAgICAgfVxuICAgICAgICB2aXN1YWxpemVCdXR0b24uZGlzYWJsZWQgPVxuICAgICAgICAgICAgdGhpcy5hbGdvcml0aG0gPT09IG51bGwgfHwgdGhpcy5ib2FyZFN0YXR1cyA9PT0gJ3N0YXJ0ZWQnO1xuICAgIH1cbiAgICBjYWxjdWxhdGVOZXdEb21TdGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuYWxnb3JpdGhtID09PSBudWxsIHx8IHRoaXMuYm9hcmRTdGF0dXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHBsYXlQYXVzZUJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcGxheVBhdXNlQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLmlzUGxheWluZykge1xuICAgICAgICAgICAgcGxheVBhdXNlQnV0dG9uLmlubmVyVGV4dCA9ICdQYXVzZSc7XG4gICAgICAgICAgICBwbGF5UGF1c2VCdXR0b24uZGF0YXNldC5wbGF5c3RhdGUgPSAncGF1c2UnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuYm9hcmRTdGF0dXMgPT09ICdzdGFydGVkJykge1xuICAgICAgICAgICAgcGxheVBhdXNlQnV0dG9uLmlubmVyVGV4dCA9ICdSZXN1bWUnO1xuICAgICAgICAgICAgcGxheVBhdXNlQnV0dG9uLmRhdGFzZXQucGxheXN0YXRlID0gJ3Jlc3VtZSc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5ib2FyZFN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcpIHtcbiAgICAgICAgICAgIHBsYXlQYXVzZUJ1dHRvbi5pbm5lclRleHQgPSAnUmV2aXN1YWxpemUnO1xuICAgICAgICAgICAgcGxheVBhdXNlQnV0dG9uLmRhdGFzZXQucGxheXN0YXRlID0gJ3JldmlzdWFsaXplJztcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGFydE9yU3RvcFRpbWVyKG5ld1N0YXRlKSB7XG4gICAgICAgIHRoaXMuaXNQbGF5aW5nID0gbmV3U3RhdGU7XG4gICAgICAgIHRoaXMuY2FsY3VsYXRlTmV3RG9tU3RhdGUoKTtcbiAgICB9XG4gICAgcGxheU9yUGF1c2VUaW1lcigpIHtcbiAgICAgICAgdGhpcy5pc1BsYXlpbmcgPSAhdGhpcy5pc1BsYXlpbmc7XG4gICAgICAgIGlmICh0aGlzLmlzUGxheWluZykge1xuICAgICAgICAgICAgdGhpcy5yZXN1bWVUaW1lcnMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucGF1c2VUaW1lcnMoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbGN1bGF0ZU5ld0RvbVN0YXRlKCk7XG4gICAgfVxufVxuY29uc3QgdmlzdWFsaXplclN0YXRlID0gbmV3IFZpc3VhbGl6ZXJTdGF0ZSgpO1xuZnVuY3Rpb24gb25JbmRleEFuaW1hdGVkKGFuaW1hdGVkSW5kZXgpIHtcbiAgICB2aXN1YWxpemVyU3RhdGUudGltZXJzLnNoaWZ0KCk7XG4gICAgaWYgKGFuaW1hdGVkSW5kZXggPT09IDApIHtcbiAgICAgICAgdmlzdWFsaXplclN0YXRlLnNldEJvYXJkU3RhdHVzKCdzdGFydGVkJyk7XG4gICAgICAgIHZpc3VhbGl6ZXJTdGF0ZS5zdGFydE9yU3RvcFRpbWVyKHRydWUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIG9uUGF0aEFuaW1hdGVkKGFuaW1hdGVkSW5kZXgsIG5vZGVzVG9BbmltYXRlKSB7XG4gICAgdmlzdWFsaXplclN0YXRlLnRpbWVycy5zaGlmdCgpO1xuICAgIGlmIChhbmltYXRlZEluZGV4ID09PSBub2Rlc1RvQW5pbWF0ZS5sZW5ndGggLSAxKSB7XG4gICAgICAgIHZpc3VhbGl6ZXJTdGF0ZS5zZXRCb2FyZFN0YXR1cygnY29tcGxldGVkJyk7XG4gICAgICAgIHZpc3VhbGl6ZXJTdGF0ZS5zdGFydE9yU3RvcFRpbWVyKGZhbHNlKTtcbiAgICB9XG59XG5mdW5jdGlvbiBjYWxjdWxhdGVBbmRMYXVuY2hBbmltYXRpb25zKCkge1xuICAgIGlmICh2aXN1YWxpemVyU3RhdGUuYWxnb3JpdGhtID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgeyBlbmROb2RlLCBub2Rlc1RvQW5pbWF0ZSB9ID0gYm9hcmQuc3RhcnQodmlzdWFsaXplclN0YXRlLmFsZ29yaXRobSk7XG4gICAgaWYgKGVuZE5vZGUgPT09IG51bGwpIHtcbiAgICAgICAgKDAsIG1vZGFsXzEuZGVmYXVsdCkoJ0Vycm9yIScsICdDYW5ub3QgZmluZCBwYXRoIHRvIGdvYWwgYXMgd2UgZ290IGJsb2NrZWQgYnkgd2FsbHMuIEtpbmRseSByZS10cnkuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdmlzaXRlZFRpbWVycyA9ICgwLCBhbmltYXRlXzEuc3RhcnRWaXNpdGVkTm9kZXNBbmltYXRpb25zKShub2Rlc1RvQW5pbWF0ZSwgdmlzdWFsaXplclN0YXRlLnNwZWVkLCBhbmltYXRlZEluZGV4ID0+IHtcbiAgICAgICAgb25JbmRleEFuaW1hdGVkKGFuaW1hdGVkSW5kZXgpO1xuICAgICAgICBpZiAoYW5pbWF0ZWRJbmRleCA9PT0gbm9kZXNUb0FuaW1hdGUubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgY29uc3QgcGF0aFRpbWVycyA9ICgwLCBhbmltYXRlXzEuc3RhcnRTaG9ydGVzdFBhdGhBbmltYXRpb24pKGVuZE5vZGUsIGJvYXJkLm5vZGVNYXAsIHZpc3VhbGl6ZXJTdGF0ZS5zcGVlZCwgaW5kZXggPT4gb25QYXRoQW5pbWF0ZWQoaW5kZXgsIHBhdGhUaW1lcnMpKTtcbiAgICAgICAgICAgIHZpc3VhbGl6ZXJTdGF0ZS5hcHBlbmRUaW1lcnMocGF0aFRpbWVycyk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB2aXN1YWxpemVyU3RhdGUuYXBwZW5kVGltZXJzKHZpc2l0ZWRUaW1lcnMpO1xufVxuZnVuY3Rpb24gaW5pdGlhbGl6ZUJ1dHRvbkV2ZW50cygpIHtcbiAgICAoMCwgdXRpbHNfMS5hZGRIdG1sRXZlbnQpKHZpc3VhbGl6ZUJ1dHRvbiwgKCkgPT4ge1xuICAgICAgICBjYWxjdWxhdGVBbmRMYXVuY2hBbmltYXRpb25zKCk7XG4gICAgfSk7XG4gICAgKDAsIHV0aWxzXzEuYWRkSHRtbEV2ZW50KSgoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ2NsZWFyLWJvYXJkJyksICgpID0+IHtcbiAgICAgICAgYm9hcmQuY2xlYXJCb2FyZCgpO1xuICAgICAgICB2aXN1YWxpemVyU3RhdGUuc2V0Qm9hcmRTdGF0dXMobnVsbCk7XG4gICAgfSk7XG4gICAgKDAsIHV0aWxzXzEuYWRkSHRtbEV2ZW50KSgoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ2NsZWFyLXdhbGxzJyksICgpID0+IHtcbiAgICAgICAgYm9hcmQuY2xlYXJXYWxscygpO1xuICAgICAgICB2aXN1YWxpemVyU3RhdGUuc2V0Qm9hcmRTdGF0dXMobnVsbCk7XG4gICAgfSk7XG4gICAgKDAsIHV0aWxzXzEuYWRkSHRtbEV2ZW50KSgoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ2NsZWFyLXBhdGgnKSwgKCkgPT4ge1xuICAgICAgICBib2FyZC5jbGVhclBhdGgoKTtcbiAgICAgICAgdmlzdWFsaXplclN0YXRlLnNldEJvYXJkU3RhdHVzKG51bGwpO1xuICAgIH0pO1xuICAgICgwLCB1dGlsc18xLmFkZEh0bWxFdmVudCkocGxheVBhdXNlQnV0dG9uLCAoKSA9PiB7XG4gICAgICAgIGlmIChwbGF5UGF1c2VCdXR0b24uZGF0YXNldC5wbGF5c3RhdGUgPT09ICdyZXZpc3VhbGl6ZScpIHtcbiAgICAgICAgICAgIGJvYXJkLmNsZWFyUGF0aCgpO1xuICAgICAgICAgICAgdmlzdWFsaXplclN0YXRlLnNldEJvYXJkU3RhdHVzKG51bGwpO1xuICAgICAgICAgICAgY2FsY3VsYXRlQW5kTGF1bmNoQW5pbWF0aW9ucygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmlzdWFsaXplclN0YXRlLnBsYXlPclBhdXNlVGltZXIoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgICgwLCB1dGlsc18xLmFkZEh0bWxFdmVudCkoKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCd3YWxrdGhyb3VnaC10dXRvcmlhbCcpLCAoKSA9PiB7XG4gICAgICAgICgwLCB3YWxrdGhyb3VnaF8xLnJlSW5pdGlhdGVXYWxrdGhyb3VnaCkoKTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGFwcGx5Q2hhbmdlc0ZvclNwZWVkRHJvcGRvd24oc3BlZWRJZCkge1xuICAgIGNvbnN0IHNwZWVkcyA9IE9iamVjdC5rZXlzKGNvbnN0YW50c18xLlNQRUVEX01BUFBJTkcpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3BlZWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG1hcHBpbmcgPSBjb25zdGFudHNfMS5TUEVFRF9NQVBQSU5HW3NwZWVkc1tpXV07XG4gICAgICAgIGlmIChtYXBwaW5nLmlkID09PSBzcGVlZElkKSB7XG4gICAgICAgICAgICB2aXN1YWxpemVyU3RhdGUuc2V0U3BlZWQoc3BlZWRzW2ldKTtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkobWFwcGluZy5pZCk7XG4gICAgICAgICAgICAoMCwgdXRpbHNfMS5jaGFuZ2VEcm9wZG93bkxhYmVsKShub2RlLCBgU3BlZWQ6ICR7bWFwcGluZy5uYW1lfWApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBpbml0aWFsaXplRHJvcGRvd25FdmVudHMoKSB7XG4gICAgKDAsIHV0aWxzXzEuZ2V0Tm9kZXMpKCcuZHJvcGRvd24nKS5mb3JFYWNoKGVhY2hOb2RlID0+ICgwLCB1dGlsc18xLmFkZEh0bWxFdmVudCkoZWFjaE5vZGUsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IGV2ZW50LmN1cnJlbnRUYXJnZXQ7XG4gICAgICAgIGlmIChub2RlLmNsYXNzTGlzdC5jb250YWlucygnb3BlbicpKSB7XG4gICAgICAgICAgICBub2RlLmNsYXNzTGlzdC5yZW1vdmUoJ29wZW4nKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG5vZGUuY2xhc3NMaXN0LmFkZCgnb3BlbicpO1xuICAgICAgICB9XG4gICAgfSkpO1xuICAgIGNvbnN0IGFsbFNwZWVkSWRzID0gT2JqZWN0LnZhbHVlcyhjb25zdGFudHNfMS5TUEVFRF9NQVBQSU5HKS5tYXAoZWFjaFZhbHVlID0+IGVhY2hWYWx1ZS5pZCk7XG4gICAgYXBwbHlDaGFuZ2VzRm9yU3BlZWREcm9wZG93bihjb25zdGFudHNfMS5TUEVFRF9NQVBQSU5HLmZhc3QuaWQpO1xuICAgICgwLCB1dGlsc18xLmdldE5vZGVzKSgnLmRyb3Bkb3duLWl0ZW0nKS5mb3JFYWNoKGVhY2hOb2RlID0+ICgwLCB1dGlsc18xLmFkZEh0bWxFdmVudCkoZWFjaE5vZGUsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IGV2ZW50LmN1cnJlbnRUYXJnZXQ7XG4gICAgICAgIE9iamVjdC52YWx1ZXMoY29uc3RhbnRzXzEuQUxHT1JJVEhNX01BUFBJTkcpLmZvckVhY2goZWFjaENvbmZpZyA9PiB7XG4gICAgICAgICAgICBlYWNoQ29uZmlnO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgYWxnb3JpdGhtcyA9IE9iamVjdC5rZXlzKGNvbnN0YW50c18xLkFMR09SSVRITV9NQVBQSU5HKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGdvcml0aG1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSBjb25zdGFudHNfMS5BTEdPUklUSE1fTUFQUElOR1thbGdvcml0aG1zW2ldXTtcbiAgICAgICAgICAgIGlmIChjb25maWcuaWQgPT09IG5vZGUuaWQpIHtcbiAgICAgICAgICAgICAgICB2aXN1YWxpemVyU3RhdGUuc2V0QWxnb3JpdGhtKGFsZ29yaXRobXNbaV0pO1xuICAgICAgICAgICAgICAgICgwLCB1dGlsc18xLmNoYW5nZURyb3Bkb3duTGFiZWwpKG5vZGUsIGBBbGdvcml0aG06ICR7Y29uZmlnLm5hbWV9YCk7XG4gICAgICAgICAgICAgICAgdmlzdWFsaXplQnV0dG9uLmlubmVyVGV4dCA9IGBWaXN1YWxpemUgJHtjb25maWcubmFtZX1gO1xuICAgICAgICAgICAgICAgIHZpc3VhbGl6ZUJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoYWxsU3BlZWRJZHMuaW5jbHVkZXMobm9kZS5pZCkpIHtcbiAgICAgICAgICAgIGFwcGx5Q2hhbmdlc0ZvclNwZWVkRHJvcGRvd24obm9kZS5pZCk7XG4gICAgICAgIH1cbiAgICB9KSk7XG59XG5pbml0aWFsaXplQnV0dG9uRXZlbnRzKCk7XG5pbml0aWFsaXplRHJvcGRvd25FdmVudHMoKTtcbigwLCB3YWxrdGhyb3VnaF8xLnNldFVwV2Fsa3Rocm91Z2gpKCk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHV0aWxzXzEgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcbmZ1bmN0aW9uIHNob3dNb2RhbCh0aXRsZVRleHQsIGRlc2NyaXB0aW9uVGV4dCkge1xuICAgIGNvbnN0IG92ZXJsYXlOb2RlID0gKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCdtb2RhbC1vdmVybGF5Jyk7XG4gICAgb3ZlcmxheU5vZGUuY2xhc3NMaXN0LmFkZCgnb3BlbicpO1xuICAgICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnbW9kYWwtdGl0bGUnKS5pbm5lclRleHQgPSB0aXRsZVRleHQ7XG4gICAgKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCdtb2RhbC1kZXNjcmlwdGlvbicpLmlubmVyVGV4dCA9IGRlc2NyaXB0aW9uVGV4dDtcbiAgICAoMCwgdXRpbHNfMS5hZGRIdG1sRXZlbnQpKCgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnbW9kYWwtY2xvc2UnKSwgKCkgPT4ge1xuICAgICAgICBvdmVybGF5Tm9kZS5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuJyk7XG4gICAgfSk7XG59XG5leHBvcnRzLmRlZmF1bHQgPSBzaG93TW9kYWw7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIE5vZGUge1xuICAgIGNvbnN0cnVjdG9yKF9yLCBfYywgX2lkLCBfc3RhdHVzKSB7XG4gICAgICAgIHRoaXMuciA9IF9yO1xuICAgICAgICB0aGlzLmMgPSBfYztcbiAgICAgICAgdGhpcy5pZCA9IF9pZDtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBfc3RhdHVzO1xuICAgICAgICB0aGlzLnByZXZpb3VzID0gbnVsbDtcbiAgICB9XG4gICAgc2V0UHJldmlvdXMocHJldmlvdXMpIHtcbiAgICAgICAgdGhpcy5wcmV2aW91cyA9IHByZXZpb3VzO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IE5vZGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIFRpbWVyIHtcbiAgICBjb25zdHJ1Y3RvcihjYWxsYmFjaywgZGVsYXksIGFuaW1hdGlvblR5cGUpIHtcbiAgICAgICAgdGhpcy5zdGFydCA9IERhdGUubm93KCk7XG4gICAgICAgIHRoaXMucmVtYWluaW5nID0gZGVsYXk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgdGhpcy5pZCA9IHNldFRpbWVvdXQodGhpcy5jYWxsYmFjaywgZGVsYXkpO1xuICAgICAgICB0aGlzLmFuaW1hdGlvblR5cGUgPSBhbmltYXRpb25UeXBlO1xuICAgIH1cbiAgICBwYXVzZSgpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuaWQpO1xuICAgICAgICB0aGlzLnJlbWFpbmluZyA9IHRoaXMucmVtYWluaW5nIC0gKERhdGUubm93KCkgLSB0aGlzLnN0YXJ0KTtcbiAgICB9XG4gICAgcmVzdW1lKCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5pZCk7XG4gICAgICAgIHRoaXMuc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgICAgICB0aGlzLmlkID0gc2V0VGltZW91dCh0aGlzLmNhbGxiYWNrLCB0aGlzLnJlbWFpbmluZyk7XG4gICAgfVxuICAgIGNsZWFyKCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5pZCk7XG4gICAgfVxuICAgIHNldFJlbWFpbmluZ0J5RmFjdG9yKGZhY3Rvcikge1xuICAgICAgICB0aGlzLnJlbWFpbmluZyAqPSBmYWN0b3I7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gVGltZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuY2hhbmdlRHJvcGRvd25MYWJlbCA9IGV4cG9ydHMuYWRkSHRtbEV2ZW50ID0gZXhwb3J0cy5nZXROb2RlQnlJZCA9IGV4cG9ydHMuZ2V0Tm9kZXMgPSB2b2lkIDA7XG5mdW5jdGlvbiBnZXROb2RlcyhzZWxlY3Rvcikge1xuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbn1cbmV4cG9ydHMuZ2V0Tm9kZXMgPSBnZXROb2RlcztcbmZ1bmN0aW9uIGdldE5vZGVCeUlkKHNlbGVjdG9ySWQpIHtcbiAgICBjb25zdCBub2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0b3JJZCk7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgU2VsZWN0b3Igbm90IGZvdW5kOiAke3NlbGVjdG9ySWR9YCk7XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xufVxuZXhwb3J0cy5nZXROb2RlQnlJZCA9IGdldE5vZGVCeUlkO1xuZnVuY3Rpb24gYWRkSHRtbEV2ZW50KG5vZGUsIGNhbGxiYWNrLCBldmVudE5hbWUgPSAnY2xpY2snKSB7XG4gICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2spO1xufVxuZXhwb3J0cy5hZGRIdG1sRXZlbnQgPSBhZGRIdG1sRXZlbnQ7XG5mdW5jdGlvbiBjaGFuZ2VEcm9wZG93bkxhYmVsKG5vZGUsIHRleHQpIHtcbiAgICB2YXIgX2EsIF9iO1xuICAgIGNvbnN0IGNvbnRyb2xzID0gKF9iID0gKF9hID0gbm9kZS5wYXJlbnRFbGVtZW50KSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EucGFyZW50RWxlbWVudCkgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLnF1ZXJ5U2VsZWN0b3IoJy5kcm9wZG93bi1jb250cm9scycpO1xuICAgIGlmICghY29udHJvbHMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb250cm9scy5pbm5lclRleHQgPSB0ZXh0O1xufVxuZXhwb3J0cy5jaGFuZ2VEcm9wZG93bkxhYmVsID0gY2hhbmdlRHJvcGRvd25MYWJlbDtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5zZXRVcFdhbGt0aHJvdWdoID0gZXhwb3J0cy5yZUluaXRpYXRlV2Fsa3Rocm91Z2ggPSB2b2lkIDA7XG5jb25zdCB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG5jb25zdCBjb25zdGFudHNfMSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50c1wiKTtcbmxldCBjdXJyZW50SW5kZXggPSAwO1xuZnVuY3Rpb24gZ29Ub0luZGV4KCkge1xuICAgIHZhciBfYTtcbiAgICBjb25zdCBvdmVybGF5Tm9kZSA9ICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnd2Fsa3Rocm91Z2gtb3ZlcmxheScpO1xuICAgIGlmIChjdXJyZW50SW5kZXggPCAwKSB7XG4gICAgICAgIG92ZXJsYXlOb2RlLmNsYXNzTGlzdC5yZW1vdmUoJ29wZW4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBvdmVybGF5Tm9kZS5jbGFzc0xpc3QuYWRkKCdvcGVuJyk7XG4gICAgY29uc3QgY29udGFpbmVyTm9kZSA9ICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnd2Fsa3Rocm91Z2gtY29udGFpbmVyJyk7XG4gICAgY29uc3QgY3VycmVudFN0ZXAgPSBjb25zdGFudHNfMS5XQUxLVEhST1VHSF9QT1NJVElPTlNbY3VycmVudEluZGV4XTtcbiAgICBjb25zdCBwb3NpdGlvbnMgPSAoMCwgdXRpbHNfMS5nZXROb2RlcykoY3VycmVudFN0ZXAucmVmZXJlbmNlKVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb250YWluZXJOb2RlLnN0eWxlLnRvcCA9IGAke3Bvc2l0aW9ucy55ICsgcG9zaXRpb25zLmhlaWdodCArIGN1cnJlbnRTdGVwLnRvcH1weGA7XG4gICAgY29udGFpbmVyTm9kZS5zdHlsZS5sZWZ0ID0gYCR7cG9zaXRpb25zLnggKyBjdXJyZW50U3RlcC5sZWZ0fXB4YDtcbiAgICAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ3dhbGt0aHJvdWdoLXN0ZXBwZXInKS5pbm5lclRleHQgPSBgJHtjdXJyZW50SW5kZXggKyAxfSBvZiAke2NvbnN0YW50c18xLldBTEtUSFJPVUdIX1BPU0lUSU9OUy5sZW5ndGh9YDtcbiAgICAoMCwgdXRpbHNfMS5nZXROb2RlQnlJZCkoJ3dhbGt0aHJvdWdoLXRpdGxlJykuaW5uZXJUZXh0ID0gY3VycmVudFN0ZXAudGl0bGU7XG4gICAgKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCd3YWxrdGhyb3VnaC1kZXNjcmlwdGlvbicpLmlubmVyVGV4dCA9IGN1cnJlbnRTdGVwLmRlc2NyaXB0aW9uO1xuICAgIGNvbnN0IGltYWdlTm9kZSA9ICgwLCB1dGlsc18xLmdldE5vZGVCeUlkKSgnd2Fsa3Rocm91Z2gtaW1hZ2UnKTtcbiAgICBpZiAoY3VycmVudFN0ZXAuaW1hZ2UpIHtcbiAgICAgICAgaW1hZ2VOb2RlLmNsYXNzTGlzdC5hZGQoJ3ZhbGlkJyk7XG4gICAgICAgIGltYWdlTm9kZS5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBgdXJsKCR7Y3VycmVudFN0ZXAuaW1hZ2V9KWA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpbWFnZU5vZGUuY2xhc3NMaXN0LnJlbW92ZSgndmFsaWQnKTtcbiAgICB9XG4gICAgY29udGFpbmVyTm9kZS5kYXRhc2V0LmRpcmVjdGlvbiA9IChfYSA9IGN1cnJlbnRTdGVwLmRpcmVjdGlvbikgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogJ2x0cic7XG59XG5mdW5jdGlvbiByZUluaXRpYXRlV2Fsa3Rocm91Z2goKSB7XG4gICAgY3VycmVudEluZGV4ID0gMDtcbiAgICBnb1RvSW5kZXgoKTtcbn1cbmV4cG9ydHMucmVJbml0aWF0ZVdhbGt0aHJvdWdoID0gcmVJbml0aWF0ZVdhbGt0aHJvdWdoO1xuZnVuY3Rpb24gc2V0VXBXYWxrdGhyb3VnaCgpIHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHJlSW5pdGlhdGVXYWxrdGhyb3VnaCgpLCA2MDApO1xuICAgICgwLCB1dGlsc18xLmFkZEh0bWxFdmVudCkoKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCd3YWxrdGhyb3VnaC1za2lwJyksICgpID0+IHtcbiAgICAgICAgY3VycmVudEluZGV4ID0gLTE7XG4gICAgICAgIGdvVG9JbmRleCgpO1xuICAgIH0pO1xuICAgICgwLCB1dGlsc18xLmFkZEh0bWxFdmVudCkoKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCd3YWxrdGhyb3VnaC1uZXh0JyksICgpID0+IHtcbiAgICAgICAgY3VycmVudEluZGV4ICs9IDE7XG4gICAgICAgIGlmIChjdXJyZW50SW5kZXggPT09IGNvbnN0YW50c18xLldBTEtUSFJPVUdIX1BPU0lUSU9OUy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGN1cnJlbnRJbmRleCA9IC0xO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlzTGFzdFBvc2l0aW9uID0gY3VycmVudEluZGV4ID09PSBjb25zdGFudHNfMS5XQUxLVEhST1VHSF9QT1NJVElPTlMubGVuZ3RoIC0gMTtcbiAgICAgICAgKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCd3YWxrdGhyb3VnaC1za2lwJykuc3R5bGUudmlzaWJpbGl0eSA9IGlzTGFzdFBvc2l0aW9uXG4gICAgICAgICAgICA/ICdoaWRkZW4nXG4gICAgICAgICAgICA6ICd2aXNpYmxlJztcbiAgICAgICAgKDAsIHV0aWxzXzEuZ2V0Tm9kZUJ5SWQpKCd3YWxrdGhyb3VnaC1uZXh0JykuaW5uZXJUZXh0ID0gaXNMYXN0UG9zaXRpb25cbiAgICAgICAgICAgID8gJ0ZpbmlzaCEnXG4gICAgICAgICAgICA6ICdOZXh0JztcbiAgICAgICAgZ29Ub0luZGV4KCk7XG4gICAgfSk7XG59XG5leHBvcnRzLnNldFVwV2Fsa3Rocm91Z2ggPSBzZXRVcFdhbGt0aHJvdWdoO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2luZGV4LnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9