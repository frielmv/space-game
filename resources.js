const Resources = {
	FUEL_DRAIN_RATE: 0.02, // how much fuel (out of 1) drains every second
	RCS_FUEL_DRAIN_RATE: 0.02,
	MINING_ANGLE_TOLERANCE: 8, // how many degrees from straight up to continue mining
	MINING_MAX_VEL: 0.5,
	MINING_RATE: 0.1, // resources per second to mine
	toggleMining() {
		if(this.mining) {
			this.mining = false;
		} else {
			Resources.showOverlay = true;
			if(this.miningPossible)
				this.mining = true;
		}
	},
	valueToColor(value) {
		return `hsl(${value * 120}deg 100% 35%)`;
	},
	init() {
		this.fuelHTML = (new html('div'))
			.style({
				position: 'relative',
				height: 'calc(var(--spacing) * 2)',
				borderTopRightRadius: 'var(--spacing)',
				borderBottomRightRadius: 'var(--spacing)'
			});

		this.rcsFuelHTML = html.clone(this.fuelHTML)
			.style({
				marginTop: 'var(--spacing)'
			});

		(new html('div'))
			.class('background')
			.style({
				left: '50%',
				top: '0',
				translate: '-50%',
				width: '400px'
			}).append(
				(new html('div'))
					.style({
						position: 'relative',
						borderLeft: 'var(--line) solid',
						paddingTop: 'calc(var(--spacing) / 2)',
						paddingBottom: 'calc(var(--spacing) / 2)',
						marginTop: 'calc(var(--spacing) / -2)',
						marginBottom: 'calc(var(--spacing) / -2)'
					})
					.append(this.fuelHTML, this.rcsFuelHTML)
			)
			.create();

		// buttons
		const buttonHTML = (new html('div'))
			.class('background')
			.style({
				bottom: '0',
				left: '0'
			})
			.create();

		this.overlayButton = (new html('div'))
			.click(function() {
				Resources.showOverlay = !Resources.showOverlay;
			})
			.content('Resource Overlay')
			.class('uiControl', 'button')
			.appendTo(buttonHTML);

		this.miningButton = html.clone(this.overlayButton)
			.click(function() {
				Resources.toggleMining();
			})
			.content('Resource Mining')
			.appendTo(buttonHTML);
	},
	reset() {
		this.fuel = 1;
		this.rcsFuel = 1;
		this.mining = false;

		this.lastMinedBody = null;
		this.remaining = 1;

		this.showOverlay = false;
	},
	save() {
		return {
			fuel: this.fuel,
			rcsFuel: this.rcsFuel,
			mining: this.mining,
			lastMinedBody: this.lastMinedBody.name,
			remaining: this.remaining,
			showOverlay: this.showOverlay
		};
	},
	loadSave(data) {
		this.fuel = data.fuel;
		this.rcsFuel = data.rcsFuel;
		this.mining = data.mining;
		this.lastMinedBody = Bodies.flatList[data.lastMinedBody];
		this.remaining = data.remaining;
		this.showOverlay = data.showOverlay;
	},
	clock() {
		function barHTML(value) {
			return `linear-gradient(to right, ${Resources.valueToColor(value)} ${value * 100}%, rgba(180, 180, 180, 0.25) ${value * 100}%)`;
		}

		buttonStyle(Resources.overlayButton, Resources.showOverlay);
		buttonStyle(this.miningButton, Resources.mining, Resources.miningPossible);

		this.fuelHTML.style({
			background: barHTML(Resources.fuel)
		});
		this.rcsFuelHTML.style({
			background: barHTML(Resources.rcsFuel)
		});

		// whether you've landed in the correct zone to gather resources
		let inZone = false;
		if(Bodies.soi.resources !== undefined) {
			for(const [i, val] of Bodies.soi.resourceMap.entries()) {
				if(Collisions.collisionAngle < val) {
					inZone = i % 2 == 1;
					break;
				}
			}
		}

		// checking if mining is possible
		this.miningPossible =
			inZone &&
			this.remaining > 0 && // resources left to mine
			(this.fuel < 1 || this.rcsFuel < 1) && // fuel is not already at max
			Collisions.colliding && // landed
			Ship.vel.magnitude < this.MINING_MAX_VEL && // not moving
			Math.abs(angleDiff(Ship.angle, Collisions.collisionAngle)) < this.MINING_ANGLE_TOLERANCE; // pointed straight up and down

		if(Collisions.colliding) {
			if(this.lastMinedBody !== Bodies.soi) {
			this.remaining = Bodies.soi.resources;
			}
			this.lastMinedBody = Bodies.soi;
		}

		if(!this.miningPossible) {
			this.mining = false;
		} else if(this.mining) {
			if(this.fuel < 1) {
				this.fuel += this.MINING_RATE / Viewport.fps;
				this.remaining -= this.MINING_RATE / Viewport.fps;
			}
			if(this.rcsFuel < 1) {
				this.rcsFuel += this.MINING_RATE / Viewport.fps;
				this.remaining -= this.MINING_RATE / Viewport.fps;
			}
		}

		this.fuel = clamp(this.fuel);
		this.rcsFuel = clamp(this.rcsFuel);
	}
};
