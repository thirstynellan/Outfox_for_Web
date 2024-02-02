//Create a few constants
let LIGHT_BROWN = 1;
let DARK_BROWN = 2;
let NEUTRAL = 3;

//workaround for lack of 2D arrays in JS
function index(x,y) {
	return 10*y+x;
}



// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var smaller = Math.min(window.innerWidth, window.innerHeight);
var cellsize = smaller/10;
var gameboardwidth = cellsize*10;
var gameboardheight = cellsize*9;
var currentPlayer = LIGHT_BROWN;
var selected = null;
canvas.width = cellsize*10;
canvas.height = cellsize*10;
document.body.appendChild(canvas);

const grid = new Map();
const chips = [];
const legalMoves = [];

addEventListener("click", function(e) {
	onTouchEvent(e.pageX, e.pageY);
});

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

var swapPlayers = function() {
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
};

function onTouchEvent(x,y) {
	var done = false;

	for (const cell of legalMoves) {
		if (cell.contains(x,y)) {
			selected.setGoal(cell);
			selected.unselect();
			done = true;
			break;
		}
	}
	legalMoves.length=0;
	//chips.forEach(chippy -> chippy.unselect());
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
	for (var chippy of chips) {
		if (chippy.isHome()) {
			if (chippy.getColor() == LIGHT_BROWN) {
				lightCount++;
			} else {
				darkCount++;
			}
		}
	}
	if (lightCount == 1 || darkCount == 1) {
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

	//blank out background
	ctx.beginPath();
	ctx.rect(0,0,gameboardwidth+cellsize,gameboardheight+cellsize);
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
	//ctx.fillText("Outfox!", 10,gameboardheight+10);
	if (currentPlayer == DARK_BROWN) {
		ctx.fillText("Dark Brown's Turn", 10, gameboardheight+10);//gameboardwidth+10, 100);
	} else {
		//ctx.fillText("Light Brown's Turn", gameboardwidth+10, 100);
		ctx.fillText("Light Brown's Turn", 10, gameboardheight+10);
	}
};

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

	// Request to do this again ASAP
	requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
init();
//reset();
main();
