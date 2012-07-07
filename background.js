function background() {

	this.randomNumber = function() {
		this.randomNum = (1103515245*this.randomNum + 12345) % 0x80000000;
		return ((this.randomNum & 0x7fffffff)/0x7fffffff);
	}
	
	this.genTerrain = function(height) {

		var sectionWidth = 30;
		//The random changes in terrain height
		var tempHeight = new Array(c.width);
		var bias = .15*c.height*this.randomNumber()-.06*c.height;
		var period = 12.56 * this.randomNumber();
		for(index=0;index<c.width;index++)
		{
			tempHeight[index] = bias + .3 * c.height + .2*c.height*Math.sin(period*index/c.width);
			
			//Update the bias at the section boundaries
			if(index % sectionWidth == 0)
				bias = bias + (.12*c.height * this.randomNumber()) - .06*c.height;
			
			//Don't want to go too high or too low on the map
			if(tempHeight[index] < .10 * c.height)
			{
				if(tempHeight[index] < 0)
					bias = bias + (.06 * c.height * this.randomNumber());
				else
					bias = bias + (.09 * c.height * this.randomNumber()) - .03 * c.height;
			}
			else if(tempHeight[index] > c.height*.65)
			{
				if(tempHeight[index] > c.height*.75)
					bias = bias - (.06 * c.height * this.randomNumber());
				else
					bias = bias - (.09 * c.height * this.randomNumber()) + .03 * c.height;
			}
		}
		
		for(i = 1;i<10;i+=2)
		{
			var tempHeight2 = new Array(c.width);
			
			var accum, numAccum;
			for(index = 0; index < c.width; index++)
			{
				accum = 0;
				numAccum = 0;
				for(j = -1*i;j<=i;j++)
					if(0 <= index + j && index+j < c.width)
					{
						accum += tempHeight[index+j];
						numAccum++;
					}
				
				tempHeight2[index] = accum/numAccum;
			}
			tempHeight = tempHeight2;
		}
		
		
		for(index = 0;index < c.width;index++)
			height[index] = Math.round(c.height-tempHeight[index]);
			
	//		height[index] = 200; 
	//	for(index = 280;index < 320; index++)
		//	height[index] -= 2.00*(20 - Math.abs(index - 300));
			/*
		for(index = 310;index < 320;index++)
			height[index] -= (5 - Math.abs(index - 315));
		*/
		/*
		for(index = 0; index < c.width; index++)
			if(index > 200)
				height[index] = 200;
			else
				height[index] = 400;*/
	};
	
	this.initBG = function(ctx,c,seed) {
		console.log(seed);
		this.height = new Array(c.width);
		this.unbreakable = c.height-2;
		this.randomNum = seed;
		this.colDebris = new Array(c.width);
		for(i = 0;i < c.width; i++)
			this.colDebris[i] = [];
		this.colsWDebris = [];
		this.ground = "rgb(139,69,19)";
		this.sky = '#d0e7f9';
		this.howManyCircles = 8;
		this.circles = [];
		
		this.genTerrain(this.height);
		/*
		for(i = 0;i<c.width;i++)
			if(i>c.width*.35)
				this.height[i] = Math.round(c.height*.2);
			else
				this.height[i] = Math.round(c.height*.8);*/
		
		ctx.fillStyle = this.sky;
		ctx.clearRect(0, 0, c.width, c.height);
		ctx.beginPath();
		ctx.rect(0, 0, c.width, c.height);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = this.ground;
		for(index=0;index<c.width;index++)
		{
			ctx.fillRect(index,this.height[index],1,c.height-this.height[index]);
		}
		this.imageData = ctx.getImageData(0,0,c.width,c.height);
	
		//A circle has the form [horizontal center, vertical center, radius, speed ,opacity]
		for (var i = 0; i < this.howManyCircles; i++) 
			this.circles.push([this.randomNumber() * c.width, this.randomNumber() * c.height * .25,
				this.randomNumber() * 75, Math.floor(4*Math.random())+1 ,(this.randomNumber() / 2) + .2]);
	}

	this.drawCircles = function(){
	  for (var i = 0; i < this.howManyCircles; i++) {
		ctx.fillStyle = 'rgba(255, 255, 255, ' + this.circles[i][4] + ')';
		ctx.beginPath();
		ctx.arc(this.circles[i][0], this.circles[i][1], this.circles[i][2], 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();
	  }
	};

	this.moveCircles = function(){
	  for (var i = 0; i < this.howManyCircles; i++) {
		if (this.circles[i][0] - this.circles[i][2] > c.width) {
		  this.circles[i][2] = this.randomNumber() * 75;
		  this.circles[i][0] = 0 - this.circles[i][2];
		  this.circles[i][1] = this.randomNumber() * c.height * .25;
		  this.circles[i][3] = Math.floor(4 * Math.random()) + 1;
		  this.circles[i][4] = this.randomNumber() / 2 + .2;
		}
		else {
		  this.circles[i][0] += this.circles[i][3];
		}
	  }
	};
	
	//colDebris entries are [dirt below impact, air at top of impact, dirt below impact above,fall speed]
	this.addDamage = function(damage) {
		//console.log("adding damage!!!!!");
		//console.log(damage);
		//console.log(this.colDebris);
		for(i in damage)
		{
			x = damage[i][0];
			if(x < 0 || x >= this.colDebris.length)
				continue;
			if(damage[i][2] >= this.unbreakable)
				damage[i][2] = this.unbreakable;
			//TODO move this around for efficiency
			for(index=damage[i][1];index<=damage[i][2];index++)
			{
				this.imageData.data[x*4 + c.width*index*4] = 208;
				this.imageData.data[x*4 + c.width*index*4 + 1] = 231;
				this.imageData.data[x*4 + c.width*index*4 + 2] = 249;
			}
			if(this.colDebris[x].length == 0)
			{
			//	console.log("start");
				if(this.height[x] > damage[i][2])
				{					
				//	console.log("skip");
					continue; 
				}
				else if(this.height[x] >= damage[i][1])
				{
					//console.log("sb");
					this.height[x] = damage[i][2]+1;
				}
				else
				{
					//console.log("sc");
					//console.log("start " + x);
//					console.log(this.colDebris[x].length);
					//console.log(this.colDebris[x]);
					this.colsWDebris.push(x);
					this.colDebris[x].push([damage[i][2]+1,damage[i][1],this.height[x],0]);
					//console.log(this.colDebris[x]);
//					console.log(x + " " + this.colDebris[x]);
					//console.log(this.colDebris[x]);
				}
			}
			else
			{
				//Index of the array where the lower and upper damages fit
				lDebIndex = 0;
				uDebIndex = 0;
				while(lDebIndex < this.colDebris[x].length && this.colDebris[x][lDebIndex][0] <= damage[i][2])
					lDebIndex++;
				while(uDebIndex < this.colDebris[x].length && this.colDebris[x][uDebIndex][0] < damage[i][1])
					uDebIndex++;
				//if(!(lDebIndex == this.colDebris[x].length && damage[i][2] <= this.colDebris[x][lDebIndex-1][0]))
					//lDebIndex--;
				//if(!(uDebIndex == this.colDebris[x].length && damage[i][1] <= this.colDebris[x][uDebIndex-1][0]))
					//uDebIndex--;
				//console.log(x + " " + lDebIndex + " " + uDebIndex + " " + damage[i] + " " + this.colDebris[x]);
				if(lDebIndex == 0)
				{
				//	console.log("a");
					if(this.height[x] > damage[i][2])
						continue;
					if(this.colDebris[x][0][1] > damage[i][2] + 1)
					{
						if(this.height[x] >= damage[i][1])
						{
							//console.log("a");
							this.height[x] = damage[i][2]+1;
							this.colDebris[x][0][2] = this.height[x];
						}
						else
						{
						//	console.log("b");
							var newHole = [damage[i][2]+1,damage[i][1],this.height[x],this.colDebris[x][0][3]];
							this.colDebris[x][0][2] = newHole[0];
							this.colDebris[x].splice(0,0,newHole);
						}
					}
					else
					{
						if(this.colDebris[x][0][1] <= damage[i][1])
							continue;
						else if(this.height[x] >= damage[i][1])
						{
						//	console.log("ac");
							this.height[x] = this.colDebris[x][0][0];
//							console.log(this.colDebris[x]);
							this.colDebris[x].splice(0,1);
	//						console.log(this.colDebris[x]);
						}
						else
						{
				//			console.log("d");
							this.colDebris[x][0][1] = damage[i][1];
						}
					}
			//		console.log(this.colDebris[x]);
				}
				else if(lDebIndex == this.colDebris[x].length)
				{
				//	console.log("b");
					if(uDebIndex == this.colDebris[x].length)
					{
						//console.log("ba");
						var newHole = [damage[i][2]+1,damage[i][1],0,0];
						newHole[2] = this.colDebris[x][lDebIndex-1][0];
						this.colDebris[x].push(newHole);
					}
					else if(this.height[x] >= damage[i][1])
					{
						//console.log("bb");
						//console.log(x);
						this.height[x] = damage[i][2];
						//console.log(this.height[x]);
						this.colDebris[x] = [];
						//console.log(this.colDebris[x]);
						//console.log(this.colDebris[x]);
					}
					else
					{
						//console.log("bc");
						if(this.colDebris[x][uDebIndex][1] <= damage[i][1])
						{
							//console.log("bca");
							this.colDebris[x][uDebIndex][0] = damage[i][2]+1;
							this.colDebris[x].splice(uDebIndex+1,lDebIndex-uDebIndex-1);
						}
						else
						{
							//console.log("bcb");
							this.colDebris[x][uDebIndex][0] = damage[i][2]+1;
							this.colDebris[x][uDebIndex][1] = damage[i][1];
							this.colDebris[x].splice(uDebIndex+1,lDebIndex-uDebIndex-1);
						}
					}
				}
				else
				{
					//console.log("c");
					//console.log(x + " " + lDebIndex + " " + uDebIndex);
					//console.log(this.colDebris[x]);
					//console.log(damage[i]);
					if(this.colDebris[x][lDebIndex][1] > damage[i][2] + 1)
					{
	//					console.log("ca");
						//console.log(this.colDebris[x][uDebIndex][1] + " " + damage[i][1]);
						if(this.colDebris[x][uDebIndex][1] <= damage[i][1])
						{
						//	console.log("caa");
							this.colDebris[x][uDebIndex][0] = damage[i][2]+1;
							this.colDebris[x][lDebIndex][2] = damage[i][2]+1;
							this.colDebris[x].splice(uDebIndex+1,lDebIndex-uDebIndex-1);
						}
						else
						{
							if(this.height[x] >= damage[i][1])
							{
							//	console.log("cba");
								this.height[x] = damage[i][2]+1;
								this.colDebris[x][lDebIndex][2] = this.height[x];
								this.colDebris[x].splice(0,lDebIndex);
							}
							else if(uDebIndex == lDebIndex)
							{
//								console.log("cbb");
								var newHole = [damage[i][2]+1,damage[i][1],0,this.colDebris[x][0][3]];
								newHole[2] = this.colDebris[x][lDebIndex][2];
								this.colDebris[x][lDebIndex][2] = newHole[0];
								this.colDebris[x].splice(lDebIndex,0,newHole);
							}
							else
							{
	//							console.log("cbc");
								this.colDebris[x][uDebIndex][0] = damage[i][2]+1;
								this.colDebris[x][uDebIndex][1] = damage[i][1];
								this.colDebris[x][lDebIndex][2] = this.colDebris[x][uDebIndex][0];
								this.colDebris[x].splice(uDebIndex+1,lDebIndex-uDebIndex-1);
							}
						}
					}
					else
					{
						//console.log("cb");
						if(this.colDebris[x][uDebIndex][1] <= damage[i][1]) //Deals with the equal case silently
						{
		//					console.log("cba");
							this.colDebris[x][uDebIndex][0] = this.colDebris[x][lDebIndex][0];
							this.colDebris[x].splice(uDebIndex+1,lDebIndex-uDebIndex);
						}
						else
						{
			//				console.log("cbb");
							if(this.height[x] >= damage[i][1])
							{
			//					console.log("cbba");
								this.height[x] = this.colDebris[x][lDebIndex][0];
								this.colDebris[x].splice(0,lDebIndex+1);
							}
							else if(uDebIndex == lDebIndex)
							{
				//				console.log("cbbb");
								this.colDebris[x][lDebIndex][1] = damage[i][1];
							}
							else
							{
					//			console.log("cbbc");
								this.colDebris[x][uDebIndex][0] = this.colDebris[x][lDebIndex][0];
								this.colDebris[x][uDebIndex][1] = damage[i][1];
								this.colDebris[x].splice(uDebIndex+1,lDebIndex-uDebIndex);
							}
						}
					}
//					console.log(this.colDebris[x]);
				}
			
/*
				if(lDebIndex == 0 && this.colDebris[x][0])// || this.colDebris[x][0][1] > damage[i][1] + 1) //The damage is at the top
				{
					console.log("a");
					//console.log(this.colDebris[x]);
					//console.log(damage[i] + " " + lDebIndex + " " + uDebIndex);
 					if(this.height[x] > damage[i][2]) //Above the ground
						continue;
					if(this.colDebris[x][0][1] > damage[i][2]+1)
					{
						if(uDebIndex == -1)
						{
							this.colDebris[x][0][2] = damage[i][2]+1;
							this.height[x] = damage[i][2]+1;
						}
						else
						{
							this.colDebris[x][0][2] = damage[i][2]+1;
							this.colDebris[x].splice(0,0,[damage[i][2]+1,damage[i][1],this.height[x],2]);
						}
					}
					else
					{
						if(uDebIndex == -1)
						{
							this.height[x] = this.colDebris[x][0][0];
							this.colDebris[x].splice(0,1);
						}
						else if(this.colDebris[x][0][1] <= damage[i][1])
							continue;
						else
							this.colDebris[x][lDebIndex][1] = damage[i][1];
					}
					
				}
				else if(lDebIndex == this.colDebris[x].length)// && this.colDebris[x][lDebIndex][0] <= damage[i][2]) //The damage starts at the bottom
				{
					console.log("b");
					if(this.colDebris[x][lDebIndex][0] < damage[i][1])
					{
					//	console.log("ba");
						//console.log(this.colDebris[x]);
						this.colDebris[x].splice(lDebIndex+1,0,[damage[i][2]+1,damage[i][1],this.colDebris[x][lDebIndex][0],2]);
						//console.log(this.colDebris[x]);

					}
					else
					{
				//		console.log("bb");
						this.colDebris[x][lDebIndex][0] = damage[i][2]+1;
						this.colDebris[x].splice(uDebIndex,uDebIndex-uDebIndex);
					}
				}
				else
				{
					console.log("c");
					if(lDebIndex == uDebIndex) //within a block
					{
						//console.log("ca");
						if(this.colDebris[x][lDebIndex][1] <= damage[i][1]) //Within a hole
							continue;
						if(this.colDebris[x][lDebIndex][1] > damage[i][2])
							this.colDebris[x][lDebIndex][1] = damage[i][2]+1;
						else
						{
							var newHole = [damage[i][2]+1,damage[i][1],this.colDebris[x][lDebIndex-1][0],2];
							this.colDebris[x][lDebIndex][2] = newHole[0];
							this.colDebris[x].splice(lDebIndex-1,0,newHole);
						}
					}
					else
					{
						//console.log("cb");
						if(this.colDebris[x][lDebIndex][1] <= damage[i][2])
						{
							//console.log("cba");
							if(this.colDebris[x][uDebIndex][1] <= damage[i][1])
							{
								//console.log("cbaa");
								this.colDebris[x][uDebIndex][0] = this.colDebris[x][lDebIndex][0];
								this.colDebris[x].splice(uDebIndex+1,lDebIndex-uDebIndex);
								console.log(this.colDebris[x]);
							}
							else
							{
								//console.log("cbab");
								this.colDebris[x][uDebIndex][0] = this.colDebris[x][lDebIndex][0];
								this.colDebris[x][uDebIndex][1] = damage[i][1];
								this.colDebris[x].splice(uDebIndex+1,lDebIndex-uDebIndex);
							}
						}
						else
						{
							//console.log("cbb");
							if(this.colDebris[x][uDebIndex][1] <= damage[i][1])
							{
								//console.log("cbba");
								this.colDebris[x][lDebIndex][2] = damage[i][2]+1;
								this.colDebris[x][uDebIndex][0] = damage[i][2]+1;
								this.colDebris[x].splice(uDebIndex+1,lDebIndex-uDebIndex-1);
							}
							else
							{
								//console.log("cbbb");
								this.colDebris[x][lDebIndex][2] = damage[i][2]+1;
								this.colDebris[x][uDebIndex][1] = damage[i][1];
								this.colDebris[x][uDebIndex][0] = damage[i][2]+1;
								this.colDebris[x].splice(uDebIndex+1,lDebIndex-uDebIndex-1);
							}
						}
					}
				}
	*/			
			}
		//console.log(this.colsWDebris.length);
		}
		
		for(searchI = 0; searchI < this.colsWDebris.length; searchI++)
			if(this.colDebris[this.colsWDebris[searchI]].length == 0)
			{
				this.colsWDebris.splice(searchI,1);
				searchI--;
			}

//		for(z = 0; z < this.colsWDebris.length;z++)
	//		console.log(this.colsWDebris[z] + " " + this.colDebris[this.colsWDebris[z]]);
		//console.log(this.colDebris);
	}
	
	this.updateDamage = function() {
		//for(coli in this.colsWDebris)
		//console.log(this.colDebris);
	//	console.log("update damage");
		//console.log(this.colsWDebris);
		for(coli = 0;coli < this.colsWDebris.length; coli++)
		{
			//if(coli == 0)
//				console.log(this.colDebris);
			x = this.colsWDebris[coli];
			damage = this.colDebris[x];
			for(j = damage.length - 1;j >= 0;j--)
			{	
				//If the falling debris will close the hole
				if(damage[j][3] > (damage[j][0] - damage[j][1]))
				{
					//Draw the debris
					for(delta = 0;delta < (damage[j][0]-damage[j][1]);delta++)
					{
						this.imageData.data[x*4 + c.width*(damage[j][2]+delta)*4] = 208;
						this.imageData.data[x*4 + c.width*(damage[j][2]+delta)*4 + 1] = 231;
						this.imageData.data[x*4 + c.width*(damage[j][2]+delta)*4 + 2] = 249;
						this.imageData.data[x*4 + c.width*(damage[j][1]+delta)*4] = 139;
						this.imageData.data[x*4 + c.width*(damage[j][1]+delta)*4 + 1] = 69;
						this.imageData.data[x*4 + c.width*(damage[j][1]+delta)*4 + 2] = 19;
					}
					//If this is the top hole, update the height of the column
					if(j == 0)
						this.height[x] += (damage[0][0] - damage[0][1]);
					else
						damage[j-1][0] += (damage[j][0] - damage[j][1]);
					//If there's a hole below this one, update its index of dirt below impact above
					if(j < damage.length - 1)
						damage[j+1][2] = damage[j][2] + (damage[j][0] - damage[j][1]);
					//Remove the hole
					damage.splice(j,1);
					if(damage.length == 0) //If it was the last hole, remove the col from that list
					{
						this.colsWDebris.splice(coli,1);
						coli--;
					}
				}
				else
				{
					for(delta = 0;delta < damage[j][3];delta++)
					{
						this.imageData.data[x*4 + c.width*(damage[j][2]+delta)*4] = 208;
						this.imageData.data[x*4 + c.width*(damage[j][2]+delta)*4 + 1] = 231;
						this.imageData.data[x*4 + c.width*(damage[j][2]+delta)*4 + 2] = 249;
						this.imageData.data[x*4 + c.width*(damage[j][1]+delta)*4] = 139;
						this.imageData.data[x*4 + c.width*(damage[j][1]+delta)*4 + 1] = 69;
						this.imageData.data[x*4 + c.width*(damage[j][1]+delta)*4 + 2] = 19;
					}
					damage[j][1]+=damage[j][3];
					damage[j][2]+=damage[j][3];
					//If this is the top hole, update the height of the column
					if(j == 0)
						this.height[x] = damage[j][2];
					//If there's a hole above this one, update its index of dirt below impact above
					else if(j > 0)
						damage[j-1][0] = damage[j][2];
					damage[j][3]+=1;
				}
			}
		}
		//console.log(this.colsWDebris);
		//console.log("update");
		for(z = 0; z < this.colsWDebris.length;z++)
		{
		//	console.log(this.colsWDebris[z]);
			//console.log(this.colDebris[this.colsWDebris[z]]);
		}
	};
	
	this.draw = function(){
		ctx.putImageData(this.imageData,0,0);
		this.updateDamage();
		this.moveCircles();
		this.drawCircles();
	}
		
}
