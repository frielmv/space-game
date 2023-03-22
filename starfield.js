const StarField = {
	OVERBRIGHTNESS: 2, // how much to brighten the planets when showing the starfield
	STARS_PER_PIXEL: 1/5000,
	MAX_STAR_SPEED: 1/16, // max star speed compared to the speed of the ship
	init() {
		this.stars = [];
		this.html = document.createElement('div');
		this.html = (new html('div'))
			.attr({
				id: 'starfield'
			})
			.create();

		for(let i = 0; i < Viewport.width * Viewport.height * this.STARS_PER_PIXEL; i++) {
			const zDepth = Math.random();
			this.stars.push({
				html: (new html('div'))
					.style({
						width: (zDepth * 2)+'px',
						borderRadius: '50%',
						aspectRatio: '1 / 1',
						background: `hsl(0deg 0% ${Math.random() * 100}%)`
					})
					.appendTo(this.html),
				pos: new Point(Math.random() * Viewport.width, Math.random() * Viewport.height),
				speed: zDepth * this.MAX_STAR_SPEED // how much the star moves compared to the ship (0 to 1)
			});
		}
	},
	clock() {
		this.show = !Viewport.showMap && !Object.values(Bodies.flatList).some(body => {
			const pos = body.absolutePos.addedTo(Ship.absolutePos, -1);
			let radius = body.radius;
			if(body.atmoAlt)
				radius += body.atmoAlt;

			return (Math.abs(pos.x) - radius) * Viewport.scale < Viewport.width / 2
			&&
			(Math.abs(pos.y) - radius) * Viewport.scale < Viewport.height / 2
		});

		this.html.style({
			filter: `brightness(${StarField.show ? 1 : 0})`
		});

		for(const star of this.stars) {
			const starPos = Ship.pos.multipliedBy(star.speed).addedTo(star.pos);
			star.html.style({
				left: (Viewport.width - ((starPos.x % Viewport.width + Viewport.width) % Viewport.width))+'px',
				top: ((starPos.y % Viewport.height + Viewport.height) % Viewport.height)+'px'
			});
		}
	}
};
