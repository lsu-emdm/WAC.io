// Nexus Traversal UI Widget
//	Jesse Allison (2014)
//


function traversal(target, transmitCommand, uiIndex) {
					
	//self awareness
	var self = this;
	if (!isNaN(uiIndex)) {
		self.uiIndex = uiIndex;
	}
	this.defaultSize = { width: 300, height: 200 };
	
	//get common attributes and methods
	this.getTemplate = getTemplate;
	this.getTemplate(self, target, transmitCommand);
	
	//this.line_width = 3;
	this.nodeSize = 15;		// radius of the node.
	this.values = [0,0];
	
	this.default_text = "touch to control";	
	this.throttle = nx.throttle;
	this.clip = nx.clip;
	
		// Blits
	this.numBlits = 3;
	this.tempoBlits = 8000;
	this.blits = [[new nx.point(10,10),""], [new nx.point(30,30),""], [new nx.point(50,50),""]];
	
		// Blot
	this.blotPosition = new nx.point(0,0);
	this.blotScope = 0.0;		// [0.-1.] radiates out and layers.

		// Connect
	this.connectBasePosition = new nx.point(self.width * 0.5, self.height-self.padding);
	this.connectOtherBasePosition = new nx.point(self.width * 0.5, self.padding);
	this.connectPosition = new nx.point(self.width * 0.5, self.height-self.padding);
	this.connectOtherPosition = new nx.point(self.width * 0.5, 100);
	this.connectDrift = 5;		// pixels for other to drift by
	this.connectLineWidth = 3;
	this.connecting = false;
	this.connection = 0.;		// ramps up if you stay connected.
	this.connectName = "User 2";
	
	var traversalTimer;

	this.init = function() {

		self.setInteraction("connect");
		self.generateBlits();
		self.draw();
	}
	
// ************************************** //
// ********** DRAW COMMANDS ************* //
// ************************************** //
	
	this.drawBlits = function() {
		self.erase();
		self.makeRoundedBG();
		with (self.context) {
			strokeStyle = self.colors.border;
			fillStyle = self.colors.fill;
			lineWidth = self.lineWidth;
			stroke();
			fill();
			if(self.blits) {
				for(i=0;i<self.blits.length; i++) {
					self.drawBlit(self.blits[i]);
				}
			} else {
				fillStyle = self.colors.border;
				font = "14px courier";
				fillText(self.default_text, 10, 20);
			}
		}
		
		self.drawLabel();
	}
	
	this.drawBlit = function(blit) {
		//stay within right/left bounds
		if (blit[0].x<(self.bgLeft+self.nodeSize)) {
			blit[0].x = self.bgLeft + self.nodeSize;
		} else if (blit[0].x>(self.bgRight-self.nodeSize)) {
			blit[0].x = self.bgRight - self.nodeSize;
		}
		//stay within top/bottom bounds
		if (blit[0].y<(self.bgTop+self.nodeSize)) {
			blit[0].y = self.bgTop + self.nodeSize;
		} else if (blit[0].y>(self.bgBottom-self.nodeSize)) {
			blit[0].y = self.bgBottom - self.nodeSize;
		}
	
		with (self.context) {
			globalAlpha=0.2;
			beginPath();
				strokeStyle = self.colors.accent;
				//lineWidth = self.lineWidth;
				lineWidth = 2;
				moveTo(blit[0].x,0+self.padding);
				lineTo(blit[0].x,self.height-self.padding);
				moveTo(0+self.padding,blit[0].y);
				lineTo(self.width-self.padding,blit[0].y);					
				stroke();
			closePath();
			globalAlpha=1;
			beginPath();
				fillStyle = self.colors.accent;
				strokeStyle = self.colors.border;
				lineWidth = self.lineWidth;
				arc(blit[0].x, blit[0].y, self.nodeSize, 0, Math.PI*2, true);					
				fill();
			closePath();
			
			fillStyle = self.colors.border;
			font = "10px courier";
			fillText(blit[1], blit[0].x, blit[0].y);
		}

	}
	
	this.drawBlot = function() {
		self.erase();
		self.makeRoundedBG();
		with (self.context) {
			strokeStyle = self.colors.border;
			fillStyle = self.colors.fill;
			lineWidth = self.lineWidth;
			stroke();
			fill();
			if(self.blotScope > 0.0) {
				var blotSize = self.blotScope * 3;
					// outer circle
				var ocBlotSize = Math.max(Math.min(1.0,blotSize-2.0), 0);
				globalAlpha=ocBlotSize * 0.5;
				beginPath();
					fillStyle = self.colors.accent;
					strokeStyle = self.colors.border;
					lineWidth = self.lineWidth;
					arc(self.blotPosition.x, self.blotPosition.y, (self.nodeSize * 3) + (self.nodeSize * ocBlotSize), 0, Math.PI*2, true);					
					fill();
				closePath();
					// middle circle
				var mcBlotSize = Math.max(Math.min(1.0,blotSize-1.0), 0.);
				globalAlpha=mcBlotSize * 0.75;
				beginPath();
					fillStyle = self.colors.accent;
					strokeStyle = self.colors.border;
					lineWidth = self.lineWidth;
					arc(self.blotPosition.x, self.blotPosition.y, (self.nodeSize * 1.5) + (self.nodeSize * mcBlotSize), 0, Math.PI*2, true);					
					fill();
				closePath();
					// inner circle
				var icBlotSize = Math.min(1.0,blotSize);
				globalAlpha=icBlotSize;
				beginPath();
					fillStyle = self.colors.accent;
					strokeStyle = self.colors.border;
					lineWidth = self.lineWidth;
					arc(self.blotPosition.x, self.blotPosition.y, self.nodeSize * icBlotSize, 0, Math.PI*2, true);					
					fill();
				closePath();
			} else {
				fillStyle = self.colors.border;
				font = "14px courier";
				fillText(self.default_text, 10, 20);
			}
		}
		
		self.drawLabel();
	}
	
	this.drawConnect = function() {
		self.erase();
		self.makeRoundedBG();
		with (self.context) {
			strokeStyle = self.colors.border;
			fillStyle = self.colors.fill;
			lineWidth = self.lineWidth;
			stroke();
			fill();
			
				// Draw Blot Bases
			globalAlpha=0.3;
			beginPath();		// Draw Blot Base
				fillStyle = self.colors.accent;
				strokeStyle = self.colors.border;
				lineWidth = self.lineWidth;
				arc(self.connectBasePosition.x, self.connectBasePosition.y, (self.nodeSize * 3), 0, Math.PI, true);					
				fill();
			closePath();
			beginPath();		// Draw Stretch Line
				strokeStyle = self.colors.accent;
				lineWidth = self.connectLineWidth + ((self.connectPosition.y / self.height) * self.nodeSize);
				moveTo(self.connectBasePosition.x,self.connectBasePosition.y);
				lineTo(self.connectPosition.x,self.connectPosition.y);					
				stroke();
			closePath();
			beginPath();		// Draw Other Blot Base
				lineWidth = self.lineWidth;
				arc(self.connectOtherBasePosition.x, self.connectOtherBasePosition.y, (self.nodeSize * 3), 0, Math.PI, false);					
				fill();
			closePath();
			globalAlpha=0.1;
			beginPath();		// Draw Other Stretch Line
				strokeStyle = self.colors.accent;
				lineCap = 'round';
				lineWidth = self.connectLineWidth + (((self.height - self.connectOtherPosition.y) / self.height) * self.nodeSize);
				moveTo(self.connectOtherBasePosition.x,self.connectOtherBasePosition.y);
				lineTo(self.connectOtherPosition.x,self.connectOtherPosition.y);					
				stroke();
			closePath();
			
					// Draw Lines if Actively Connecting
			if (self.connecting) {
				globalAlpha=0.2;
				beginPath();
					strokeStyle = self.colors.accent;
					//lineWidth = self.lineWidth;
					lineWidth = 2;
					moveTo(self.connectOtherPosition.x,0+self.padding);
					lineTo(self.connectOtherPosition.x,self.height-self.padding);
					moveTo(0+self.padding,self.connectOtherPosition.y);
					lineTo(self.width-self.padding,self.connectOtherPosition.y);					
					stroke();
				closePath();
			}
			
				// Draw other node
			globalAlpha=0.25+ (0.75*self.connection);
			beginPath();
				lineWidth = self.lineWidth;
				if(self.connecting) {
					arc(self.connectOtherPosition.x, self.connectOtherPosition.y, (self.nodeSize * 2 ) + (self.nodeSize*self.connection), 0, Math.PI*2, true);
				} else {
					arc(self.connectOtherPosition.x, self.connectOtherPosition.y, self.nodeSize + (self.nodeSize*self.connection), 0, Math.PI*2, true);
				}				
				fill();
			closePath();
			
			if(self.connectPosition) {
					// Draw Nodes to Connect
				globalAlpha=1.0;
				beginPath();
					lineWidth = self.lineWidth;
					arc(self.connectPosition.x, self.connectPosition.y, self.nodeSize, 0, Math.PI*2, true);					
					fill();
				closePath();
			} else {
				fillStyle = self.colors.border;
				font = "14px courier";
				fillText(self.default_text, 10, 20);
			}
				// Draw Connect Name
			fillStyle = self.colors.border;
			font = "12px courier";
			fillText(self.connectName, self.connectOtherPosition.x, self.connectOtherPosition.y);
		}
		
		self.drawLabel();
	}
	
	this.drawPosition = function() {
		self.erase();
		self.makeRoundedBG();
		with (self.context) {
			strokeStyle = self.colors.border;
			fillStyle = self.colors.fill;
			lineWidth = self.lineWidth;
			stroke();
			fill();
			if (self.nodePos[0] != null) {
				self.drawNode();
			}
			else {
				fillStyle = self.colors.border;
				font = "14px courier";
				fillText(self.default_text, 10, 20);
			}
		}
		
		self.drawLabel();
	}

	this.drawNode = function() {
		//stay within right/left bounds
		if (self.nodePos[0] < (self.bgLeft + self.nodeSize) ) {
			self.nodePos[0] = self.bgLeft + self.nodeSize;
		} else if (self.nodePos[0]>(self.bgRight-self.nodeSize)) {
			self.nodePos[0] = self.bgRight - self.nodeSize;
		}
		//stay within top/bottom bounds
		if (self.nodePos[1]<(self.bgTop+self.nodeSize)) {
			self.nodePos[1] = self.bgTop + self.nodeSize;
		} else if (self.nodePos[1]>(self.bgBottom-self.nodeSize)) {
			self.nodePos[1] = self.bgBottom - self.nodeSize;
		}
	
		with (self.context) {
			globalAlpha=0.2;
			beginPath();
				strokeStyle = self.colors.accent;
				//lineWidth = self.lineWidth;
				lineWidth = 2;
				moveTo(self.nodePos[0],0+self.padding);
				lineTo(self.nodePos[0],self.height-self.padding);
				moveTo(0+self.padding,self.nodePos[1]);
				lineTo(self.width-self.padding,self.nodePos[1]);					
				stroke();
			closePath();
			globalAlpha=1;
			beginPath();
				fillStyle = self.colors.accent;
				strokeStyle = self.colors.border;
				lineWidth = self.lineWidth;
				arc(self.nodePos[0], self.nodePos[1], self.nodeSize, 0, Math.PI*2, true);					
				fill();
			closePath();
		}

	}

// ************************************** //
// ********** MISCELLANEOUS ************* //
// ************************************** //

	this.scaleNode = function() {
		var actualWid = self.width - self.lineWidth*2 - self.padding*2 - self.nodeSize*2;
		var actualHgt = self.height - self.lineWidth*2 - self.padding*2 - self.nodeSize*2;
		var actualX = self.nodePos[0] - self.nodeSize - self.lineWidth - self.padding;
		var actualY = self.nodePos[1] - self.nodeSize - self.lineWidth - self.padding;
		var clippedX = nx.clip(actualX/actualWid, 0, 1);
		var clippedY = nx.clip(actualY/actualHgt, 0, 1);
		self.values = [ nx.prune(clippedX, 3), nx.prune(clippedY, 3) ];
		return self.values;
	}

	this.generateBlits = function() {
		for(i=0;i<self.numBlits;i++) {
			//self.makeBlit(Math.floor(Math.random() * self.width),Math.floor(Math.random() * self.height));
			self.blits[i] = [new nx.point(Math.floor(Math.random() * self.width),Math.floor(Math.random() * self.height)), ""];
		}
		self.draw();
	}
	
	this.makeBlit = function(x,y, name) {
		console.log("Traversal Make Blit! ", x,y, name);
		self.blits.push([new nx.point(x*self.width, y*self.height), name]);
		self.draw();
	}
	
	this.addBlit = function() {
		self.blits.push([new nx.point(Math.floor(Math.random() * self.width),Math.floor(Math.random() * self.height)), ""])
	}
	
	this.removeBlit = function(blit) {
		// console.log("Remove Blit " + blit);
		self.blits.splice(blit,1);
	}
	
	this.setupConnect = function() {
		self.connectBasePosition = new nx.point(self.width * 0.5, self.height-self.padding);
		self.connectOtherBasePosition = new nx.point(self.width * 0.5, self.padding);
		self.connectPosition = new nx.point(self.width * 0.5, self.height-self.padding);
		self.connectOtherPosition = new nx.point(Math.floor(Math.random() * self.width),Math.floor(Math.random() * self.height * 0.25) + self.padding);
	}
	
	this.checkConnecting = function() {
		if (self.connectPosition.x < self.connectOtherPosition.x + self.nodeSize && 
			self.connectPosition.x > self.connectOtherPosition.x - self.nodeSize &&
			self.connectPosition.y < self.connectOtherPosition.y + self.nodeSize &&
			self.connectPosition.y > self.connectOtherPosition.y - self.nodeSize) {
			self.connecting = true;
		} else {
			self.connecting = false;
		}
	}
	
// ***************************** //
// ******  Interactions ******** //
// ***************************** //

	this.setInteraction = function(interaction) {
		if(interaction == "blits") {
			self.default_text = "Touch Space to Send Blits";
			self.animate("none");
			self.draw = self.drawBlits;
			self.click = self.clickBlit;
			self.touch = self.clickBlit;
			self.move = function(){};
			self.touchMove = function(){};
			self.release = function(){};
			self.draw();
		} else if(interaction == "blots") {
			self.default_text = "Touch & Hold";
			self.animate("none");
			// self.animate("blot");  // only activate on hold...
			self.draw = self.drawBlot;
			self.click = self.clickBlot;
			self.move = self.clickMoveBlot;
			self.release = self.clickReleaseBlot;
			self.touch = self.clickBlot;
			self.touchMove = self.clickMoveBlot;
			self.touchRelease = self.clickReleaseBlot;
			self.draw();
		} else if(interaction == "connect") {
			self.setupConnect();
			self.default_text = "Drag to Connect";
			self.animate("none");
			self.draw = self.drawConnect;
			self.click = self.clickConnect;
			self.move = self.clickMoveConnect;
			self.release = self.clickReleaseConnect;
			self.touch = self.clickConnect;
			self.touchMove = self.clickMoveConnect;
			self.touchRelease = self.clickReleaseConnect;
			self.animate("connect");
			self.connecting = false;
			self.draw();
		} else if(interaction == "contactThree") {
			self.default_text = "Touch 3 Fingers to Contact";
			self.animate("none");
			self.draw();
		} else if(interaction == "position") {
			self.default_text = "Touch to Control";
			self.animate("none");
			self.animate("bounce");
			self.draw = self.drawPosition;
			self.click = self.clickPosition;
			self.move = self.clickMovePosition;
			self.touch = self.touchPosition;
			self.touchMove = self.touchMovePosition;
			self.draw();
		} else if(interaction == "scribble") {
			
		} else if(interaction == "none") {
			self.default_text = "::Traversal:: " + performerName;
			self.animate("none");
			self.draw = self.drawPosition;
			self.click = function(){};
			self.move = function(){};
			self.touch = function(){};
			self.touchMove = function(){};
			self.draw();
		}
	}

	this.clickBlit = function() {
		var popped = 0;
		for(i=0;i<self.blits.length; i++) {
			// console.log("clicked at: " + self.clickPos.x, self.clickPos.y);
			// console.log("blips at: " + self.blits[i].x, self.blits[i].y);
			var blit = self.blits[i];
			if (blit[0].x < self.clickPos.x + self.nodeSize && 
				blit[0].x > self.clickPos.x - self.nodeSize &&
				blit[0].y < self.clickPos.y + self.nodeSize &&
				blit[0].y > self.clickPos.y - self.nodeSize) {
				// console.log("Remove Blit " + i);
				self.removeBlit(i);
				self.nxTransmit("popBlit");	
				var popped = 1;
				if (!self.blits.length) {
					// #Fixme: Why does this not get delayed?
					setTimeout(function(){self.generateBlits();}, self.tempoBlits);
				}
				break;			
			}
		}
		if(!popped) {
			self.nxTransmit(["noPopBlit", (self.clickPos.x/self.width), (self.clickPos.y / self.height)]);	
		}
		self.draw();
	}
	// #Todo: Create touchBlit
	
	this.clickBlot = function() {
		self.blotPosition.x = self.clickPos.x;
		self.blotPosition.y = self.clickPos.y;
		self.animate("blot");
		self.blotScope = 0.01;
		self.draw();
	}
	this.clickMoveBlot = function() {
		self.blotPosition.x = self.clickPos.x;
		self.blotPosition.y = self.clickPos.y;
		
		if (self.blotScope < 1.0 && self.blotScope > 0.0) {
			self.blotScope = self.blotScope + 0.01;
		}
		self.draw();
	}
	this.clickReleaseBlot = function() {
		self.animate("none");
		self.blotScope = 0.0;
		self.draw();
	}
	
	this.connectWith = function(name) {
		self.connectName = name;
	}
	
	this.clickConnect = function() {
		// self.connectPosition = new nx.point(self.clickPos.x, self.clickPos.y);
		self.draw();
	}

	this.clickMoveConnect = function() {
		if (self.clicked) {
			// Now Updates position on each animation.
			//self.connectPosition = new nx.point(self.clickPos.x, self.clickPos.y);
			//self.checkConnecting();
			if (self.connecting) {

			}
			self.draw();
		}
	}
	
	this.clickReleaseConnect = function() {
		// self.connectPosition = null;
	}
	
	this.clickPosition = function() {
		self.nodePos[0] = self.clickPos.x;
		self.nodePos[1] = self.clickPos.y;
		self.draw();
		//FIXME: how to send two values?
		self.nxTransmit(self.scaleNode());
	}

	this.movePosition = function() {
		if (self.clicked) {
			self.nodePos[0] = self.clickPos.x;
			self.nodePos[1] = self.clickPos.y;
			self.draw();
			self.nxTransmit(self.scaleNode());
		}
	}
	

	this.release = function() {
		
	}
	
	this.touchPosition = function() {
		self.nodePos[0] = self.clickPos.x;
		self.nodePos[1] = self.clickPos.y;
		self.draw();
		self.nxTransmit(self.scaleNode());
	}

	this.touchMovePosition = function() {
		if (self.clicked) {
			self.nodePos[0] = self.clickPos.x;
			self.nodePos[1] = self.clickPos.y;
			self.draw();
			self.nxTransmit(self.scaleNode());
		}
	}

	this.touchRelease = function() {
		
	}
	
// ************************************** //
// ************  Animations ************* //
// ************************************** //
	
	this.animate = function(aniType) {
		
		switch (aniType) {
			case "bounce":
				nx.aniItems.push(self.aniBounce);
				break;
			case "none":
				nx.aniItems.splice(nx.aniItems.indexOf(self.aniBounce));
				nx.aniItems.splice(nx.aniItems.indexOf(self.aniBlot));
				nx.aniItems.splice(nx.aniItems.indexOf(self.aniConnect));
				break;
			case "blot":
				nx.aniItems.push(self.aniBlot);
				break;
			case "connect":
				nx.aniItems.push(self.aniConnect);
				break;
		}
		
	}
	
	this.aniBounce = function() {
					// Only animate if not clicked and the delta movement is above 0
		if (!self.clicked && self.nodePos[0] && (self.deltaMove.x || self.deltaMove.y)) {
					// Change position
			self.nodePos[0] += (self.deltaMove.x/2);
			self.nodePos[1] += (self.deltaMove.y/2);
					// Check to see if it has bounced and adjust the deltaMove values accordingly
			var bounceX = nx.bounce(self.nodePos[0], self.bgLeft + self.nodeSize, self.width - self.bgLeft- self.nodeSize, self.deltaMove.x)
			self.deltaMove.x = bounceX.delta;
			var bounceY = nx.bounce(self.nodePos[1], self.bgTop + self.nodeSize, self.height - self.bgTop - self.nodeSize, self.deltaMove.y)
			self.deltaMove.y = bounceY.delta;
					// redraw and transmit
			self.draw();
			self.nxTransmit(self.scaleNode());
			if(bounceX.bounce || bounceY.bounce) {
				self.nxTransmit("bounce");
				// console.log("bounce");
			}
			//console.log("ScaleNode?: ", self.scaleNode());
		}
	}
	
	this.aniBlot = function() {
		// console.log("Blotting!", self.blotScope);
		if (self.blotScope < 1.0 && self.blotScope > 0.0) {
			self.blotScope = self.blotScope + 0.005;
			self.nxTransmit(["blotScope",self.blotScope]);
		} else if (self.blotScope >= 1.0) {
			self.nxTransmit("explodeBlot",self.blotScope);
			self.blotScope = 0.0;
		}
		self.draw();
	}
	
	this.aniConnect = function() {
		// console.log("Connecteroo...");
		
			// **** Move Other Position Randomly
		self.connectOtherPosition = new nx.point(
				self.clip(self.connectOtherPosition.x + (Math.random() * self.connectDrift) - (self.connectDrift * 0.5), self.padding, self.width - self.padding), 
				self.clip(self.connectOtherPosition.y + (Math.random() * self.connectDrift) - (self.connectDrift * 0.5), self.padding, self.height - self.padding)
			);
			
			// **** Check Connection
		self.checkConnecting();
		if (self.connecting) {
			self.connection = self.connection + 0.01;
			if(self.connection >=1.0) {
				// console.log("Connected!");
				self.connection = 0.;
				self.connectOtherPosition = new nx.point(Math.floor(Math.random() * self.width),Math.floor(Math.random() * self.height * 0.25) + self.padding);	// Generate new location for other position.
				self.connectPosition = self.connectPosition = new nx.point(self.width * 0.5, self.height-self.padding);	// Reset to start position
				self.nxTransmit("connected");
			}
		}
		
			// **** go back to center if released
		if(self.clicked) {
			self.connectPosition = new nx.point(
				self.connectPosition.x + ((self.clickPos.x - self.connectPosition.x) * 0.075),
				self.connectPosition.y + ((self.clickPos.y - self.connectPosition.y) * 0.075)
				);
		} else if (!self.clicked && (self.connectPosition.x != self.connectBasePosition.x || self.connectPosition.y != self.connectBasePosition.y)) {
			self.connectPosition = new nx.point(
				self.connectBasePosition.x - ((self.connectBasePosition.x - self.connectPosition.x) * 0.95),
				self.connectBasePosition.y - ((self.connectBasePosition.y - self.connectPosition.y) * 0.95)
				);
		}
		
		self.draw();		// FYI, it seems that when a transmit happens, it doesn't return to finish the function... therefor draw() has to be here...
		
			// **** Transmit connecting activity for pitch shifts
		self.nxTransmit(["connecting", ((self.connectPosition.x / self.width) -0.5) * 2.0, ((self.height - self.connectPosition.y) / self.height) * 0.5]);
		
	}
	
	this.init();
}