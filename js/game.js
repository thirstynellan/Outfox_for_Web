//Create a few constants
let LIGHT_BROWN = 1;
let DARK_BROWN = 2;
let NEUTRAL = 3;

//workaround for lack of 2D arrays in JS
function index(x,y) {
	return 10*y+x;
}

// Create the Cell class
class Cell {
	constructor(xx, yy, t, cellSize) {
		this.x = xx;
		this.y = yy;
		this.cellColor = t;
		this.left = this.x * cellSize;
		this.top = this.y * cellSize;
		this.right = (this.x+1)*cellSize;
		this.bottom = (this.y+1)*cellSize;
		this.occupied = false;
	}

	//TODO delete this method when you don't need it anymore
	debug(ctx) {
		ctx.fillStyle = "black";
		ctx.font = "24px Helvetica";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillText(""+this.x+","+this.y+(this.occupied ? " O" : " L"), this.left,this.top);
	}
	color() {
		return this.cellColor;
	}

	setOccupied() {
		//alert("setting cell "+this.x+","+this.y+" as occupied.");
		this.occupied = true;
	}

	liberate() {
		//alert("liberating cell "+this.x+","+this.y);
		this.occupied = false;
	}

	contains(xx,yy) {
		return (xx>this.left) && (xx<this.right) && (yy>this.top) && (yy<this.bottom);
	}

	drawHighlight(c) {
		c.fillStyle = "#ff0000";
		var w = this.right - this.left;
		var cx = this.left + w/2;
		var cy = this.top + (this.bottom-this.top)/2;
		c.beginPath();
		c.arc(cx, cy, w*0.2, 0, 2*Math.PI, false);
		c.fill();
	}

	isLegalMove(chippy) {
		var legal = true;
		//alert("inside isLegalMove, for cell "+this.x+","+this.y);

		//can't move onto an occupied cell
		if (this.occupied) {
			//alert("cell at "+this.x+","+this.y+" is occupied!");
			legal = false;
		}

		//can't move from "home" into a neutral cell
		else if (chippy.isHome() && this.cellColor == NEUTRAL) {
			//alert("chip at "+this.x+","+this.y+" is already home");
			legal = false;
		}

		//OK to move into a home cell
		else if (this.cellColor == chippy.getColor()) {
			//alert("cell at "+this.x+","+this.y+" is a home cell, OK!");
			legal = true;
		}

		//OK to move from neutral cell to neutral cell
		else if ( !chippy.isHome() && this.cellColor == NEUTRAL) {
			//alert("cell at "+this.x+","+this.y+" is neutral, OK");
			legal = true;
		}

		//can't move into a cell of the opposite team
		else if (this.cellColor != chippy.getColor()) {
			//alert("cell at "+this.x+","+this.y+" belongs to opposite team!");
			legal = false;
		}
		//alert("inside islegalmove");

		return legal;
	}
}

class Chip {
	//the count and id fields were added for debugging.
	//feel free to delete when no longer needed.
	static count = 0;

	constructor(t, p) {
		this.color = t;
		this.power = p;
		this.selected = false;
		this.left = 0;
		this.top = 0;
		this.right = 0;
		this.bottom = 0;
		this.currentCell = null;
		this.velocityX = 0;
		this.velocityY = 0;
		this.destination = null;
		this.id = Chip.count++;
	}

	static normal(t) {
		return new Chip(t, false);
	}

	static power(t) {
		return new Chip(t, true);
	}

	isHome() {
        return this.color == this.currentCell.color();
    }
	
	contains(xx,yy) {
		//return (xx>this.left) && (xx<this.right) && (yy>this.top) && (yy<this.bottom);
		return this.currentCell.contains(xx,yy);
	}

	select() {
		this.selected = true;
	}

	unselect() {
		this.selected = false;
	}

	getColor() {
		return this.color;
	}
	isMoving() {
		return (this.velocityX != 0 || this.velocityY!= 0);
	}

	width() {
		return this.right-this.left;
	}

	setGoal(c) {
		//alert("Goal! " + c.x + "," + c.y);
		this.destination = c;
		var dx = Math.sign(this.destination.left - this.left);
		var dy = Math.sign(this.destination.top - this.top);
		let fudge = this.width() * 0.333;
		this.velocityX = dx * fudge;
		this.velocityY = dy * fudge;
		//alert("Goal! " + this.velocityX + "," + this.velocityY);
	}

	animate() {
		//alert("inside animate()");
		if (this.isMoving()) {
			//alert("inside animate()");
			var dx = this.destination.left - this.left;
			var dy = this.destination.top - this.top;
			if (Math.sqrt(dx*dx+dy*dy) < this.width()/2) {
				this.setCell(this.destination);
				swapPlayers();
			}
			this.left += this.velocityX;
			this.right += this.velocityX;
			this.top += this.velocityY;
			this.bottom += this.velocityY; 
			//alert("moving the chip! left="+this.left);
		}
	}

	setCell(c) {
		if (this.currentCell != null) {
			this.currentCell.liberate();
		}
		this.currentCell = c;
		this.currentCell.setOccupied();
		this.left = this.currentCell.left;
		this.right = this.currentCell.right;
		this.top = this.currentCell.top;
		this.bottom = this.currentCell.bottom;
		this.velocityX = 0;
		this.velocityY = 0;
		//TODO how to call this properly? 
		//onAnimationFinished();
	}

	draw(c) {
		var w = this.right - this.left;
		var cx = this.left + w/2;
		var cy = this.top + (this.bottom-this.top)/2;
		if (this.selected) {
			//TODO draw a golden higlight
			c.fillStyle = "#cac006";
			c.beginPath();
			c.arc(cx, cy, w*0.6, 0, 2*Math.PI, false);
			c.fill();
		}

		c.lineWidth=1;
		if (this.color == DARK_BROWN) {
			c.fillStyle = "#624e1a";
		} else {
			c.fillStyle = "#fae9bc";
		}
		c.beginPath();
		c.arc(cx, cy, w*0.45, 0, 2*Math.PI, false);
		c.fill();
		c.strokeStyle = 'black';
		c.beginPath();
		c.arc(cx, cy, w*0.45, 0, 2*Math.PI, false);
		c.stroke();
		if (this.power) {
			//draw a little gold dot in the center
			c.fillStyle = "#cac006";
			c.beginPath();
			c.arc(cx, cy, w*0.2, 0, 2*Math.PI, false);
			c.fill();

		}
	}

	possibleMoves(grid) {
        	const BOARD_WIDTH = 10;
        	const BOARD_HEIGHT = 9;
        	var results = [];
        	var newX, newY;
        	if (this.power) {
            	//can we go right?
				for (newX = this.currentCell.x+1; newX < BOARD_WIDTH; newX++) {
					var candidate = grid.get(index(newX,this.currentCell.y));
					if (candidate.isLegalMove(this)) {
						//alert("checking "+newX+","+candidate.y+"...valid!");
						results.push(candidate);
					} else {
						//alert("checking "+newX+","+candidate.y+"...bad!");
						break;
					}
				}
            	//can we go left?
				for (newX = this.currentCell.x-1; newX >= 0; newX--) {
					var candidate = grid.get(index(newX,this.currentCell.y));
					if (candidate.isLegalMove(this)) {
						//alert("checking "+newX+","+candidate.y+"...valid!");
						results.push(candidate);
					} else {
						//alert("checking "+newX+","+candidate.y+"...bad!");
						break;
					}
				}
            //can we go up?
				for (newY = this.currentCell.y-1; newY >= 0; newY--) {
					var candidate = grid.get(index(this.currentCell.x,newY));
					if (candidate.isLegalMove(this)) {
						//alert("checking "+candidate.x+","+newY+"...valid!");
						results.push(candidate);
					} else {
						//alert("checking "+candidate.x+","+newY+"...bad!");
						break;
					}
				}
            //can we go down?
				for (newY = this.currentCell.y+1; newY < BOARD_HEIGHT; newY++) {
					var candidate = grid.get(index(this.currentCell.x,newY));
					if (candidate.isLegalMove(this)) {
						results.push(candidate);
							//alert("checking "+candidate.x+","+newY+"...valid!");
					} else {
						//alert("checking "+candidate.x+","+newY+"...bad!");
						break;
					}
				}
            	//can we go up/right diagonal?
				newX = this.currentCell.x+1;
				newY = this.currentCell.y-1;
				//alert("before first while loop: "+newX+","+newY+"...");
				while (newX < BOARD_WIDTH && newY >= 0) {
					var candidate = grid.get(index(newX,newY));
					//alert("checking "+newX+","+newY+"...");
					if (candidate.isLegalMove(this)) {
							results.push(candidate);
							newX++;
							newY--;
					} else {
							break;
					}
				}
            //can we go up/left diagonal?
				newX = this.currentCell.x-1;
				newY = this.currentCell.y-1;
				//alert("before second while loop: "+newX+","+newY+"...");
				while (newX >= 0 && newY >= 0) {
					var candidate = grid.get(index(newX,newY));
					//alert("checking "+newX+","+newY+"...");
					if (candidate.isLegalMove(this)) {
							results.push(candidate);
							newX--;
							newY--;
					} else {
							break;
					}
				}
            	//can we go down/right diagonal?
				newX = this.currentCell.x+1;
				newY = this.currentCell.y+1;
				//alert("before third while loop: "+newX+","+newY+"...");
				while (newX < BOARD_WIDTH && newY < BOARD_HEIGHT) {
					var candidate = grid.get(index(newX,newY));
					//alert("checking "+newX+","+newY+"...");
					if (candidate.isLegalMove(this)) {
							results.push(candidate);
							newX++;
							newY++;
					} else {
							break;
					}
				}
				//can we go down/left diagonal?
				newX = this.currentCell.x-1;
				newY = this.currentCell.y+1;
				//alert("before fourth while loop: "+newX+","+newY+"...");
				while (newX >= 0 && newY < BOARD_HEIGHT) {
					var candidate = grid.get(index(newX,newY));
					//alert("checking "+newX+","+newY+"...");
					if (candidate.isLegalMove(this)) {
							results.push(candidate);
							newX--;
							newY++;
					} else {
							break;
					}
				}
        	//REGULAR CHIPS (not power chips)
        	} else {
            	//can we go right?
				//alert("checking to the right!");
            		var vettedCandidate = null;
            		for (newX = this.currentCell.x+1; newX < BOARD_WIDTH; newX++) {
                		var candidate = grid.get(index(newX,this.currentCell.y));
                		if (candidate.isLegalMove(this)) {
							//alert("checking "+newX+","+candidate.y+"...valid!");
							vettedCandidate = candidate;
                		} else {
							//alert("checking "+newX+","+candidate.y+"...nope!");
							break;
                		}
            		}
            		if (vettedCandidate != null) {
                		results.push(vettedCandidate);
            		}

            //can we go left?
				//alert("checking to the left!");
            		vettedCandidate = null;
            		for (newX = this.currentCell.x-1; newX >= 0; newX--) {
                		var candidate = grid.get(index(newX,this.currentCell.y));
                		if (candidate.isLegalMove(this)) {
							//alert("checking "+newX+","+this.currentCell.y+"...valid!");
                    			vettedCandidate = candidate;
                		} else {
							//alert("checking "+newX+","+this.currentCell.y+"...nope!");
                    			break;
                		}
            		}
            		if (vettedCandidate != null) {
                		results.push(vettedCandidate);
            		}

            //can we go up?
				//alert("checking to the up!");
            		vettedCandidate = null;
            		for (newY = this.currentCell.y-1; newY >= 0; newY--) {
                		var candidate = grid.get(index(this.currentCell.x,newY));
                		if (candidate.isLegalMove(this)) {
							//alert("checking "+this.currentCell.x+","+newY+"...valid!");
							vettedCandidate = candidate;
                		} else {
							//alert("checking "+this.currentCell.x+","+newY+"...nope!");
							break;
                		}
            		}
            		if (vettedCandidate != null) {
                		results.push(vettedCandidate);
            		}

            //can we go down?
				//alert("checking to the down!");
            		vettedCandidate = null;
            		for (newY = this.currentCell.y+1; newY < BOARD_HEIGHT; newY++) {
                		var candidate = grid.get(index(this.currentCell.x,newY));
                		if (candidate.isLegalMove(this)) {
							//alert("checking "+this.currentCell.x+","+newY+"...valid!");
							vettedCandidate = candidate;
                		} else {
							//alert("checking "+this.currentCell.x+","+newY+"...nope!");
							break;
                		}
            		}
            		if (vettedCandidate != null) {
                		results.push(vettedCandidate);
            		}
        	}
        	//alert("found " + results.length + " possible moves");

        	return results;
    }

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

/*if (document.getElementById) {
	// Swap the native alert for the custom
	// alert
	window.alert = function (alert_message) {
		custom_alert(alert_message);
	}
}

function custom_alert(alert_message) {

	const ALERT_TITLE = "Game Over!";
	const ALERT_BUTTON_TEXT = "Play Again";

	// Check if there is an HTML element with
	// an ID of "alert_container".If true, abort
	// the creation of the custom alert.
	let is_alert_container_exist = document.getElementById("alert_container");
	if (is_alert_container_exist) {
		return;
	}

	// Create a div to serve as the alert
	// container. Afterward, attach it to the body
	// element.
	let get_body_element = document.querySelector("body");
	let div_for_alert_container = document.createElement("div");
	let alert_container = get_body_element.appendChild(div_for_alert_container);

	// Add an HTML ID and a class name for the
	// alert container
	alert_container.id = "alert_container";
	alert_container.className = "alert_container"

	// Create the div for the alert_box and attach
	// it to the alert container.
	let div_for_alert_box = document.createElement("div")
	let alert_box = alert_container.appendChild(div_for_alert_box);
	alert_box.className = "alert_box";

	// Set the position of the alert box using
	// scrollTop, scrollWidth, and offsetWidth
	alert_box.style.top = document.documentElement.scrollTop + "px";
	alert_box.style.left = (document.documentElement.scrollWidth - alert_box.offsetWidth) / 2 + "px";

	// Create h1 to hold the alert title
	let alert_header_tag = document.createElement("h1");
	let alert_title_text = document.createTextNode(ALERT_TITLE)
	let alert_title= alert_box.appendChild(alert_header_tag);
	alert_title.appendChild(alert_title_text);

	// Create a paragraph element to hold the
	// alert message
	let alert_paragraph_tag = document.createElement("p");
	let alert_message_container = alert_box.appendChild(alert_paragraph_tag);
	alert_message_container.textContent = alert_message;

	// Create the OK button
	let ok_button_tag = document.createElement("button");
	let ok_button_text = document.createTextNode(ALERT_BUTTON_TEXT)
	let ok_button = alert_box.appendChild(ok_button_tag);
	ok_button.className = "close_btn";
	ok_button.appendChild(ok_button_text);

	// Add an event listener that'll close the
	// custom alert
	ok_button.addEventListener("click", function () {
		remove_custom_alert();
	}, false);
}

function remove_custom_alert() {
	let HTML_body = document.querySelector("body");
	let alert_container = document.getElementById("alert_container");
	HTML_body.removeChild(alert_container);
}*/

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
