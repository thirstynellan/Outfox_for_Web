class Chip {

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
		//this.id = Chip.count++;
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

    areYouHere(cel) {
       	//alert("Looking for the chip at cell " + cel.x + "," + cel.y);
        return (this.currentCell == cel);
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
// 		this.left = this.currentCell.left;
// 		this.right = this.currentCell.right;
// 		this.top = this.currentCell.top;
// 		this.bottom = this.currentCell.bottom;
		this.resize();
		this.velocityX = 0;
		this.velocityY = 0;
	}

	resize() {
		this.left = this.currentCell.left;
		this.right = this.currentCell.right;
		this.top = this.currentCell.top;
		this.bottom = this.currentCell.bottom;
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
            c.closePath();
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
        c.closePath();
		c.strokeStyle = 'black';
		c.beginPath();
		c.arc(cx, cy, w*0.45, 0, 2*Math.PI, false);
        c.closePath();
		c.stroke();
		if (this.power) {
			//draw a little gold dot in the center
			c.fillStyle = "#cac006";
			c.beginPath();
			c.arc(cx, cy, w*0.2, 0, 2*Math.PI, false);
            c.closePath();
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
