const Info = {
	values: [
		{
			title: 'SOI',
			value() {
				return Bodies.soi.name;
			}
		},
		{
			title: 'Alt',
			value() {
				return Ship.alt;
			},
			units: ' m',
			precision: 1
		},
		{
			title: 'Mass',
			value() {
				return Bodies.soi.mass / Bodies.flatList['Earth'].mass;
			},
			units: ' M\u2295',
			precision: 2
		},
		{
			title: 'Grav',
			value() {
				return Bodies.soi.gravAt(Ship.pos.magnitude);
			},
			units: ' m/s&sup2;',
			precision: 2,
			danger: Ship.ACCEL
		},
		{
			title: 'Surf. Grav',
			value() {
				return Bodies.soi.surfGrav;
			},
			units: ' m/s&sup2;',
			precision: 2,
			danger: Ship.ACCEL
		},
		null,
		{
			title: '\u0394v',
			value() {
				return Ship.ACCEL * Resources.fuel / Resources.FUEL_DRAIN_RATE;
			},
			units: ' m/s',
			precision: 0
		},
		null,
		{
			title: 'Vel',
			value() {
				return Ship.vel.magnitude;
			},
			units: ' m/s',
			precision: 1
		},
		{
			title: 'Fall Vel',
			value() {
				return Collisions.impactVel;
			},
			units: ' m/s',
			precision: 1,
			danger: Ship.CRASH_VEL
		},
		{
			title: 'Trg. Angle',
			value() {
				return Ship.targetAngle;
			},
			units: '&deg;',
			precision: 0
		},
		{
			title: 'Act. Angle',
			value() {
				return Ship.angle;
			},
			units: '&deg;',
			precision: 0
		},
		{
			title: '\u0394 Rotation',
			value() {
				return Ship.velRot;
			},
			units: '&deg;/s',
			precision: 0
		},
		null,
		{
			title: 'Scale',
			value() {
				if(Viewport.scale > 1)
					return Viewport.scale;
				else
					return 1 / Viewport.scale;
			},
			get units() {
				if(Viewport.scale > 1)
					return ' px/m';
				else
					return ' m/px';
			},
			precision: 0
		},
		null,
		{
			title: 'FPS',
			value() {
				return Viewport.fps;
			}
		},
		{
			title: 'Clock Delay',
			value() {
				return clockDelay;
			},
			units: ' ms',
			precision: 0,
			danger: 0,
			reversed: true
		}
	],
	show: true,
	init() {
		this.html = (new html('div'))
			.attr({
				id: 'info'
			})
			.class('background')
			.create();

		let valueIndex = 0;
		for(const el of this.values) {
			if(el === null)
				new html('hr').appendTo(this.html);
			else {
				el.html = (new html('p'))
					.style({
						textAlign: 'left'
					})
					.attr({
						id: 'info'+valueIndex
					})
					.appendTo(this.html);
				valueIndex++;
			}
		}
	},
	clock() {
		if(this.show) {
			for(const [i, el] of this.values.filter(Boolean).entries()) {
				const value = el.value();
				el.html
					.content(el.title + ': ' + (el.precision === undefined ? value : (Math.round(value * (10 ** el.precision)) / (10 ** el.precision)).toFixed(el.precision)) + (el.units || ''))
					.style({
						color: ((!el.reversed && value >= el.danger) || (el.reversed && value <= el.danger)) ? 'var(--red)' : 'var(--ui)'
					});
			}
		}
		this.html.style({
			opacity: Info.show ? '1' : '0'
		});
	}
};
