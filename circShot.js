function circShot() {
	this.initShot = function(origx,origy,origvx,origvy,radius,expRadius) {
		this.x = origx;
		this.y = origy;
		this.vx = origvx;
		this.vy = origvy;
		this.r = radius;
		this.eStep = expRadius/4;
		this.dr = expRadius;
		this.explode = 0;
	}

	this.update = function(height,debris){
		if(this.explode == 0)
		{
			try {
				ctx.fillStyle = "rgb(120,120,120)";
				ctx.beginPath();
				ctx.arc(Math.round(this.x),Math.round(this.y),this.r, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.fill();
			} catch(e) {}
			
			var abs_vx = Math.abs(this.vx);
			var abs_vy = Math.abs(this.vy);
			if(abs_vx == 0 && abs_vy == 0)
			{
				this.vy = this.vy+1;
				return 0;
			}
			var singledy, singledx;
			

			if(abs_vx >= abs_vy)
			{
				singledx = this.vx / abs_vx;
				singledy = this.vy / abs_vx;
				
				for(var dx=1;dx <= abs_vx;dx++)
				{
					this.x += singledx;
					this.y += singledy;
					if(height[this.x] <= this.y)
					{
						var collision = 1;
						for(debIndex = 0;0 <= this.x && this.x < height.length &&
							debIndex < debris[this.x].length && collision == 1;debIndex++)
							if(debris[this.x][debIndex][1] <= this.y && this.y < debris[this.x][debIndex][0])
								collision = 0;
						if(collision == 1 && 0 < this.x && this.x < height.length)
						{
							this.explode = 1;
							break;
						}
					}
				}
			}
			else
			{
				singledx = this.vx / abs_vy;
				singledy = this.vy / abs_vy;
				var xind;
				for(var dy=1;dy <= abs_vy;dy++)
				{
					this.y += singledy;
					this.x += singledx;
					xind = Math.round(this.x);
					if(height[xind] <= this.y)
					{
						var collision = 1;
						for(debIndex = 0;0 <= xind && xind < height.length && 
								debIndex < debris[xind].length && collision == 1;debIndex++)
							if(debris[xind][debIndex][1] <= this.y && this.y < debris[xind][debIndex][0])
								collision = 0;
						if(collision == 1 && 0 <= xind && xind < height.length)
						{
							this.explode = 1;
							break;
						}
					}
				}
			}
			
			this.y = Math.round(this.y);
			this.x = Math.round(this.x);
			this.vy = this.vy + 1;
			
			if(!(0 < this.x && this.x < c.width))
				return -1;
			
			
			/*
			this.x = this.x + this.vx;
			this.y = this.y + this.vy;
			this.vy = this.vy + .5;
			
			//It's horizontally out of bounds
			if(!(0 < this.x && this.x < c.width))
				return -1;
			
			//If it collided with the ground, jump back to the pervious position and 
			//linearly look for the colission coordinate
			if(this.y >= (height[Math.round(this.x)]))
			{
				var oldx = this.x - this.vx;
				var oldy = this.y - this.vy + .5;
				for(var i = 0;i<=this.vx;i++)
				{
					oldx = Math.round(oldx + i);
					oldy = Math.round(oldy + (this.vy - .5)*(i/this.vx));
					if(oldy >= (height[Math.round(oldx)]))
					{
						this.x = Math.round(oldx+i);
						this.y = Math.round(oldy+i);
						break;
					}
				}
				this.explode = 1;
			}*/		
		}
		else
		{
			if(this.explode > 4)
			{	
				ctx.fillStyle = "rgb(255,69,0)";
				ctx.beginPath();
				ctx.arc(this.x,this.y,this.eStep*(5-2*((this.explode)%4)), 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.fill();
				this.explode = this.explode + 1;
				if(this.explode == 7)
					return 1;
			}
			else
			{
				ctx.fillStyle = "rgb(255,69,0)";
				ctx.beginPath();
				ctx.arc(this.x,this.y,this.eStep*this.explode, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.fill();
				this.explode = this.explode + 1;
				if(this.explode == 5)
					return 2;//bg.addDamage(this.getDamage());
			}
		}
		return 0;
	}
	
	//Returns an array of the damage done by the bullet. An entry is of the form
	//[column index, upper destroyed pixel, lower destroyed pixel]
	this.getDamage = function() {
		var r = this.dr;
		var rr = r*r;
		var height = new Array(2*r);
		for(var i = 1;i<=r ;i++)
		{
			height[r+i] = Math.floor(Math.sqrt(rr - i*i));
			height[r-i] = height[r+i];
		}
		height[r] = r;
		var res = new Array(2*r+1);
		for(var i = 1;i<=r;i++)
		{
			res[r+i] = [this.x+i,this.y-height[r+i],this.y+height[r+i]];
			res[r-i] = [this.x-i,this.y-height[r-i],this.y+height[r-i]];
		}
		res[r] = [this.x,this.y-r,this.y+r];
		return res;
	}
}