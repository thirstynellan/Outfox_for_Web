//Create a few constants
let LIGHT_BROWN = 1;
let DARK_BROWN = 2;
let NEUTRAL = 3;

//workaround for lack of 2D arrays in JS
function index(x,y) {
	return 10*y+x;
}

// Create the canvas
//var canvas = document.createElement("canvas");
let smaller = 0;
let cellsize = 0;
let gameboardwidth = 0;
let gameboardheight =0;
let dirty = true;
var canvas = document.getElementById("gameboard");
var ctx = canvas.getContext("2d");
var currentPlayer = (Math.random() < 0.5) ? LIGHT_BROWN : DARK_BROWN;
var selected = null;
var audio = new Audio('sneaky_snitch.ogg');
audio.loop = true;
var soundOn = false;
var imagesLoaded = 0;
var muteButton = new Image();
muteButton.onload = function() {
	imagesLoaded++;
}
muteButton.src = "mute.png";
var unmuteButton = new Image();
unmuteButton.onload = function() {
	imagesLoaded++;
}
unmuteButton.src = "unmute.png";
var undoButton = new Image();
undoButton.onload = function() {
	imagesLoaded++;
}
undoButton.src = "undo.png";
//document.body.appendChild(canvas);

const grid = new Map();
const chips = [];
const legalMoves = [];
const undoStack = [];

addEventListener("click", function(e) {
	onTouchEvent(e.pageX, e.pageY);
});

function respondToResize() {
	smaller = Math.min(window.innerWidth, window.innerHeight);
	cellsize = smaller/10;
	gameboardwidth = cellsize*10;
	gameboardheight = cellsize*9;
	canvas.width = cellsize*12;
	canvas.height = cellsize*10;
	for (var i=0; i<10; i++) {
		for (var j=0; j<9; j++) {
			grid.get(index(i,j)).resize(i,j,cellsize);
		}
	}
	for (const chippy of chips) {
		chippy.resize();
	}
}

// Reset the game; put all the chips back
function reset() {
	for (var i=0; i<10; i++) {
		for (var j=0; j<9; j++) {
			grid.get(index(i,j)).liberate();
		}
	}
	chips.length = 0;
	makeChips();
};

function swapPlayers() {
	if (currentPlayer == LIGHT_BROWN) {
		currentPlayer = DARK_BROWN;
	} else {
		currentPlayer = LIGHT_BROWN;
	}
	checkForWinner();
}

// Update game objects
function update(modifier) {
	for (const chippy of chips) {
		chippy.animate();
	}
}

function getChipAt(cel) {
	for (const ch of chips) {
		//alert("Looking for the chip at cell " + cel.x + "," + cel.y);
		if (ch.areYouHere(cel)) {
			//alert("found chip at cell " + cel.x + "," + cel.y);
			return ch;
		}
	}
	return null;//this should never happen
}

function submitMove(mv) {
	undoStack.push(mv);
	selected.setGoal(mv.dest);
	selected.unselect();
}

function undoLastMove() {

	if (selected != null) {
		if (selected.isMoving()) {
			//don't allow undo's while animating
			return;
		} else {
			//un-highlight the selected chip before undo-ing
			selected.unselect();
			legalMoves.length = 0;
		}
	}

	if (undoStack.length == 0) {
		swal("No moves to undo!");
	} else {
		const move = undoStack.pop();
		selected = getChipAt(move.dest);
		selected.setGoal(move.src);
		selected.unselect();
	}
}

function onTouchEvent(x,y) {
	var done = false;

	if (x > gameboardwidth) {
		if (y < cellsize) {
			if (soundOn) {
				soundOn = false;
				audio.pause();
			} else {
				soundOn = true;
				audio.play();
			}
		} else if (y < 2*cellsize) {
			undoLastMove();
		}
	}

	for (const cell of legalMoves) {
		if (cell.contains(x,y)) {
			const move = new Move(selected.currentCell, cell);
			submitMove(move);
// 			selected.setGoal(cell);
// 			selected.unselect();
			done = true;
			break;
		}
	}
	legalMoves.length=0;
	for (const chippy of chips) {
		chippy.unselect();
	}
	if (!done) {
		for (const chippy of chips) {
			if (chippy.contains(x, y) && currentPlayer == chippy.getColor()) {
				//if user taps the selected chip, unselect it
				if (selected == chippy) {
					selected.unselect();
					selected = null;
					break;
				}
				selected = chippy;
				chippy.select();
				for (const cell of chippy.possibleMoves(grid)) {
					legalMoves.push(cell);
				}
				break;
			}
		}
	}
	return true;
}

function checkForWinner() {

	var lightCount = 0;
	var darkCount = 0;
	for (const chippy of chips) {
		if (chippy.isHome()) {
			if (chippy.getColor() == LIGHT_BROWN) {
				lightCount++;
			} else {
				darkCount++;
			}
		}
	}
	if (lightCount == 9 || darkCount == 9) {
		const winner = (lightCount > darkCount) ? "Light Brown wins!" : "Dark Brown wins!";
		showVictoryMessage(winner);
	}
}

function showVictoryMessage(msg) {
	swal({
		title: "Game Over",
		text: msg,
		button: "Play Again"
	}).then(() => {reset()});
}


// Draw everything
function render() {

	if (dirty) {
		respondToResize();
		dirty = false;
	}

	//blank out background
	ctx.beginPath();
	ctx.rect(0,0,canvas.width, canvas.height);
	ctx.fillStyle = "white";
	ctx.fill();

	ctx.beginPath();
	ctx.rect(0,0,gameboardwidth, gameboardheight);
	ctx.fillStyle = "#e7af1c";
	ctx.fill();

	ctx.beginPath();
	ctx.rect(0,0,cellsize*3,cellsize*3);
	ctx.fillStyle = "#d9c695";
	ctx.fill();

	ctx.beginPath();
	ctx.rect(cellsize*7,cellsize*6,cellsize*3,cellsize*3);
	ctx.fillStyle = "#856206";
	ctx.fill();

	ctx.strokeStyle = 'black';
	ctx.lineWidth = cellsize * 0.03;
	ctx.beginPath();
	//draw vertical lines
	for (var i=1; i<=9; i++) {
		ctx.moveTo(i*cellsize, 0);
		ctx.lineTo(i*cellsize, cellsize*9);
	}
	//draw horizontal lines
	for (var i=1; i<=8; i++) {
		ctx.moveTo(0, i*cellsize);
		ctx.lineTo(cellsize*10, cellsize*i);
	}
	ctx.stroke();

	for (const chippy of chips) {
		chippy.draw(ctx);
	}

	for (const cell of legalMoves) {
		cell.drawHighlight(ctx);
	}

	if (imagesLoaded > 2) {
		ctx.lineWidth = cellsize * 0.03;
		ctx.drawImage(soundOn ? unmuteButton : muteButton, gameboardwidth+5, 5, cellsize-10, cellsize-10);
		ctx.drawImage(undoButton, gameboardwidth+5, cellsize+5, cellsize-10, cellsize-10);
		ctx.beginPath();
		ctx.roundRect(gameboardwidth+5, 5, cellsize-10, cellsize-10, 10);
		ctx.roundRect(gameboardwidth+5, cellsize+5, cellsize-10, cellsize-10, 10);
		ctx.closePath();
		ctx.stroke();
		//ctx.beginPath();
		//ctx.closePath();
		//ctx.stroke();
	}

	/*for (var i=0; i<10; i++) {
		for (var j=0; j<9; j++) {
			grid.get(index(i,j)).debug(ctx);
		}
	}*/

	// whose turn is it
	ctx.fillStyle = "black";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	if (currentPlayer == DARK_BROWN) {
		ctx.fillText("Dark Brown's Turn", 10, gameboardheight+10);
	} else {
		ctx.fillText("Light Brown's Turn", 10, gameboardheight+10);
	}

	//ctx.fillText("Toggle Sound", gameboardwidth+10, 10);

}

function makeCells() {
	for (var i=0; i<10; i++) {
		for (var j=0; j<9; j++) {
			var color = NEUTRAL;
			if (i<3 && j<3) {
				color = LIGHT_BROWN;
			} else if (i>6 && j>5) {
				color = DARK_BROWN;
			}
			grid.set(index(i,j), new Cell(i,j,color,cellsize));
		}
	}
}

function makeChips() {
	var j=8;
	for (var i=0; i<9; i++) {
		var dark = null;
		var light = null;
		if (j==4) {
			dark = Chip.power(DARK_BROWN);
			light = Chip.power(LIGHT_BROWN);
		} else {
			dark = Chip.normal(DARK_BROWN);
			light = Chip.normal(LIGHT_BROWN);
		}
		dark.setCell(grid.get(index(i,j)));
		light.setCell(grid.get(index(i+1,j)));
		chips.push(dark);
		chips.push(light);
		j--;
	}
}

function init() {
	makeCells();
	makeChips();
}

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;

	//I think "ResizeObserver" is supposedly a better way of doing this,
	//but I did not succeed at getting it to work.
	if (smaller != Math.min(window.innerWidth, window.innerHeight)){
		dirty = true;
	}

	// Request to do this again ASAP
	requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
init();

main();
