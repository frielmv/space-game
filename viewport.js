const Viewport = {
	fps: 60,
	MIN_FPS: 10,
	FPS_INCREMENT: 10,
	scale: 20, // meters per px
	MAX_SCALE: 64,
	MAP_SCALE: 1/40,
	MIN_SCALE: 1/200000,
	SCALE_MULTIPLIER: 1.2, // how much to scale per scroll
	clickTarget: null,
	mousePos: new Point(),
	get width() {
		return window.innerWidth;
	},
	get height() {
		return window.innerHeight;
	},
	get showMap() {
		return this.scale < this.MAP_SCALE;
	},
	// pausing the game
	paused: false,
	pause() {
		document.body.style.filter = 'blur(4px)';
		this.paused = true;
	},
	unpause() {
		document.body.style.filter = 'none';
		this.paused = false;
		clock();
	},
	// positioning elements such as planets or trajectory dots
	position(el, point, size) {
		let relativePoint = point.copy().addedTo(Ship.pos, -1).addedTo(Bodies.soi.absolutePos, -1).multipliedBy(Viewport.scale);
		el.style({
			left: (relativePoint.x + (Viewport.width / 2))+'px',
			top: (-relativePoint.y + (Viewport.height / 2))+'px'
		});
		if(size !== undefined)
			el.style({
				width: (size * Viewport.scale)+'px'
			});
	},
	positionCenter(el) {
		el.style({
			left: (Viewport.width / 2)+'px',
			top: (Viewport.height / 2)+'px'
		});
	},
	reset() {
		this.clickTarget = null;
	},
	afterLoad() {
		// mouse controls
		window.oncontextmenu = event => event.preventDefault();
		
		window.onmousemove = event => {
			Viewport.mousePos.set(event.clientX - (Viewport.width / 2), (Viewport.height / 2) - event.clientY);
		};
		window.onmousedown = event => {
			if(!Viewport.paused) {
				if(!TimeWarp.controlLocked) {
					Ship.mouseDownAngle = Ship.targetAngle;
					Viewport.mouseDownAngle = Viewport.mousePos.angle;
					Viewport.clickTarget = event.target;
				} else if(!event.target.classList.contains('uiControl'))
					TimeWarp.index = 0;
			} else
				Viewport.unpause();
		};
		window.onmouseup = () => {
			Viewport.clickTarget = null;
		};
		window.onwheel = event => {
			if(!Viewport.paused) {
				Viewport.scale *= Viewport.SCALE_MULTIPLIER ** (-event.deltaY / 50);
			
				if(Viewport.scale > Viewport.MAX_SCALE)
					Viewport.scale = Viewport.MAX_SCALE;
				else if(Viewport.scale < Viewport.MIN_SCALE)
					Viewport.scale = Viewport.MIN_SCALE;
			}
		};
		window.onblur = () => {
			Viewport.pause();
		};
	},
	save() {
		return {
			scale: Viewport.scale
		};
	},
	loadSave(data) {
		this.scale = data.scale;
	}
};
