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
        c.closePath();
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
