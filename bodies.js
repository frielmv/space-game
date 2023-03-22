// Sun
	// Mercury
	// Venus
	// Earth
		// Moon
	// Mars
		// Deimos
		// Phobos
	// Asteroid Belt
		// Ceres
		// Vesta
		// Pallas
		// Hygiea
	// Jupiter + Rings
		// Io
		// Ganymede
		// Callisto
		// Europa
	// Saturn + Rings
		// Titan
		// Mimas
		// Enceladus
		// Tethys
		// Dione
		// Rhea
		// Iapetus
	// Uranus + Rings
		// Ariel
		// Miranda
		// Titania
		// Oberon
		// Umbriel
	// Neptune + Rings
		// Triton
	// Pluto
		// Charon
	// Eris

class Body {
	static BODY_SCALE = 1/100000
	static DISTANCE_SCALE = 1/100000
	static GRAV_SCALE = 1/100000
	static ATMO_SCALE = 10
	static ATMO_GRADIENT = [
		['FF', 0],
		['FC', 0.8],
		['F3', 2.9],
		['E4', 6.4],
		['D2', 11],
		['BD', 16.6],
		['A5', 23.1],
		['8C', 30.4],
		['73', 38.3],
		['5A', 46.7],
		['42', 55.4],
		['2D', 64.4],
		['1B', 73.5],
		['0C', 82.5],
		['03', 91.4],
		['00', 100] // [alpha value, percent position]
	]
	static orbitalVel(coreGrav, orbit) {
		return Math.sqrt(coreGrav / orbit) * Body.GRAV_SCALE;
	}
	static orbitalPeriod(coreGrav, orbit) {
		return 2 * Math.PI * Math.sqrt(orbit ** 3 / coreGrav) / Body.GRAV_SCALE;
	}
	constructor(data) {
		/*
		 * name
		 * radius
		 * surface gravity
		 * orbit
		 * resources?
	 	 * marker color
		 * atmosphere altitude?
		 * atmosphere density?
		 * atmosphere color?
		 */
		this.name = data.name;
		this.radius = data.radius * Body.BODY_SCALE;
		this.surfGrav = data.surfGrav;
		this.coreGrav = this.surfGrav * ((this.radius / Body.GRAV_SCALE) ** 2);
		this.mass = this.coreGrav / G;
		this.orbit = data.orbit * Body.DISTANCE_SCALE;
		this.resources = data.resources;
		if(this.resources !== undefined) {
			this.resourceMap = [0, 360];
			// alternates true, false, true, false, etc.
			for(let i = 0; i < 4; i++) {
				this.resourceMap.push(randAngle());
			}
			this.resourceMap.sort((a, b) => a - b);
		}
		this.markerColor = data.markerColor;
		this.atmoAlt = data.atmoAlt;
		this.atmoDensity = data.atmoDensity;
		this.atmoColor = data.atmoColor;
		this.children = [];
	}
	init() {
		if(this.parent !== undefined) {
			this.period = Body.orbitalPeriod(this.parent.coreGrav, this.orbit);
			this.soiRadius = this.orbit * ((this.coreGrav / this.parent.coreGrav) ** (2/5));
		}

		// generating html
		const maskGradient = 'radial-gradient(closest-side, transparent calc(100% - var(--spacing)), black calc(100% - var(--spacing)))';
		this.resourceHTML = (new html('div'))
			.style({
				aspectRatio: '1 / 1',
				translate: '-50% -50%',
				borderRadius: '50%',
				maskImage: maskGradient,
				webkitMaskImage: maskGradient
			})
			.class('resourceOverlay');

		this.bodyHTML = (new html('div'))
			.style({
				width: '100%',
				aspectRatio: '1 / 1',
				translate: '-50% -50%',
				background: `url("assets/bodies/${this.name}.svg")`
			})
			.class('body');

		if(this.atmoAlt !== undefined) { // atmosphere gradient
			this.atmoAlt = this.atmoAlt * Body.BODY_SCALE * Body.ATMO_SCALE;
			this.atmoDensity = this.atmoDensity;
			this.bodyHTML.element.style.background += `, radial-gradient(closest-side, ${Body.ATMO_GRADIENT.map(el => `${this.atmoColor}${el[0]} ${el[1] / 2 * this.atmoAlt / this.radius + 50}%`).join(', ')})`;
		} else { // brightness glow gradient
			this.bodyHTML.element.style.background += `, radial-gradient(closest-side, ${Body.ATMO_GRADIENT.map(el => `#FFFFFF${el[0]} ${el[1] * 1.75 - 75}%`).join(', ')})`;
		}

		const vMarker = (new html('div'))
			.style({
				width: 'var(--line)',
				height: '8px',
				background: this.markerColor+'64',
				translate: '-50% -50%',
				zIndex: '-1'
			})
			.class('marker');

		this.html = (new html('div'))
			.append(this.bodyHTML, this.resourceHTML, vMarker, html.clone(vMarker).style({ rotate: '90deg' }))
			.appendTo(Bodies.html);

		if(this.parent !== undefined) {
			this.soiHTML = (new html('div'))
				.style({
					width: (2 * this.soiRadius / (this.radius * 4) * 100)+'%',
					aspectRatio: '1 / 1',
					borderRadius: '50%',
					border: `var(--line) solid ${this.markerColor}64`,
					translate: '-50% -50%'
				})
				.class('marker')
				.appendTo(this.html);
		}

		/*for(const body of this.children) {
			(new html('div'))
				.style({
					width: (2 * body.orbit / (this.radius * 4) * 100)+'%',
					aspectRatio: '1 / 1',
					borderRadius: '50%',
					border: `var(--line) solid ${body.markerColor}64`,
					translate: '-50% -50%'
				})
				.class('marker')
				.appendTo(this.html);
		}*/

		Bodies.flatList[this.name] = this;
	}
	child(body) {
		this.children.push(body);
		body.parent = this;
		body.orbitAngle = randAngle();
		body.init();
		return this;
	}
	get pos() { // position of body relative to parent
		if(this.parent === undefined) { // sun
			return new Point();
		} else { // all other Bodies
			return Point.fromVector(this.orbitAngle, this.orbit);
		}
	}
	get absolutePos() { // position of body relative to sun
		if(this.parent === undefined) { // sun
			return new Point();
		} else { // all other Bodies
			return Point.fromVector(this.orbitAngle, this.orbit).addedTo(this.parent.absolutePos);
		}
	}
	gravAt(orbit) { // point relative to parent
		return this.coreGrav / ((orbit / Body.GRAV_SCALE) ** 2); // 1/r^2 equation modified for correct scale
	}
	get vel() {
		if(this.parent !== undefined) {
			return Point.fromVector(rotate(this.orbitAngle, -90), Body.orbitalVel(this.parent.coreGrav, this.orbit));
		}
	}
	periodOf(orbit) {
		return Body.orbitalPeriod(this.coreGrav, orbit);
	}
	clock() {
		if(this.parent !== undefined) {
			this.orbitAngle = rotate(this.orbitAngle, -360 / this.period / Viewport.fps * TimeWarp.multiplier);
		}
		Viewport.position(
			this.html, // element
			this.absolutePos, // position
			this.radius * 4 // size
		);

		if(this.parent !== undefined) {
			this.soiHTML.style({
				opacity: Viewport.showMap ? '1' : '0',
			});
		}
		this.bodyHTML.style({
			filter: `brightness(${StarField.show ? StarField.OVERBRIGHTNESS : 1})`
		});

		this.resourceHTML.style({
			opacity: Resources.showOverlay ? '1' : '0',
			width: Resources.showOverlay ? 'calc(50% - (var(--spacing) * 2))' : '0',
			background:
				this.resources !== undefined
				? `conic-gradient(${this.resourceMap.map((el, i, arr) => `${i % 2 == 0 ? (Resources.lastMinedBody === this ? Resources.valueToColor(Resources.remaining) : Resources.valueToColor(this.resources)) : 'var(--background)'} ${el}deg ${arr[(i+1) % arr.length]}deg`).join(', ')})`
				: 'var(--background)'
		});

		for(const child of this.children) {
			child.clock();
		}
	}
}

const Bodies = {
	init() {
		this.html = (new html('div')).create();
		this.flatList = {};
		this.obj = (new Body({
			name: 'Sun',
			radius: 696340000,
			surfGrav: 274,
			atmoAlt: 20000000,
			atmoDensity: 0.1,
			atmoColor: '#ffc800',
			markerColor: '#fffadc'
		}))
			.child(new Body({
				name: 'Mercury',
				radius: 2439700,
				surfGrav: 3.7,
				markerColor: '#ffffff',
				orbit: 57909050000,
				resources: 0.3
			}))
			.child(new Body({
				name: 'Venus',
				radius: 6051800,
				surfGrav: 8.87,
				atmoAlt: 120000,
				atmoDensity: 65,
				atmoColor: '#fc7b03',
				markerColor: '#ffffff',
				orbit: 108210000000,
				resources: 0.1
			}))
			.child((new Body({
				name: 'Earth',
				radius: 6371000, // actual radius of the planet (irl) in meters
				surfGrav: 9.81, // surface gravity of planet in m/s^2
				atmoAlt: 100000, // actual altitude of atmosphere
				atmoDensity: 1.225, // density at sea level in kg/m^3
				atmoColor: '#4da0ff', // color of atmosphere
				markerColor: '#344598', // color of marker
				orbit: 149598023000, // semi-major axis in meters
				resources: 1
			}))
				.child(new Body({
					name: 'Moon',
					radius: 1737400,
					surfGrav: 1.62,
					markerColor: '#a7a9ac',
					orbit: 384400000,
					resources: 0.4
				})),
			randAngle())
			.child(new Body({
				name: 'Mars',
				radius: 3389500,
				surfGrav: 3.721,
				atmoAlt: 50000,
				atmoDensity: 0.02,
				atmoColor: '#ffb04f',
				markerColor: '#dd8e60',
				orbit: 227956000000,
				resources: 0.5
			}))
			.child(new Body({
				name: 'Jupiter',
				radius: 69911000,
				surfGrav: 24.79,
				markerColor: '#ab7f59',
				orbit: 778479000000
			}))
			.child(new Body({
				name: 'Saturn',
				radius: 58232000,
				surfGrav: 10.44,
				markerColor: '#ffffff',
				orbit: 1432041000000
			}))
			.child(new Body({
				name: 'Uranus',
				radius: 25362000,
				surfGrav: 8.87,
				markerColor: '#98dbed',
				orbit: 2867043000000
			}))
			.child(new Body({
				name: 'Neptune',
				radius: 24622000,
				surfGrav: 11.15,
				markerColor: '#ffffff',
				orbit: 4514953000000
			}))
			.child(new Body({
				name: 'Pluto',
				radius: 1188300,
				surfGrav: 0.62,
				markerColor: '#ffffff',
				orbit: 5906380000000,
				resources: 0.3
			}));

		this.obj.init();
		this.soi = this.flatList['Earth'];
	},
	save() {
		const saveData = {};
		for(const [k, v] of Object.entries(this.flatList)) {
			if(v.orbitAngle !== undefined) {
				saveData[k] = { orbitAngle: v.orbitAngle };

				if(v.resourceMap !== undefined)
					saveData[k].resourceMap = v.resourceMap.slice(1, -1);
			}
		}
		return saveData;
	},
	loadSave(data) {
		for(const [k, v] of Object.entries(data)) {
			if((v.orbitAngle || v.resourceMap) !== undefined) {
				this.flatList[k].orbitAngle = v.orbitAngle;
				if(v.resourceMap !== undefined)
					this.flatList[k].resourceMap = [0, ...v.resourceMap, 360];
			}
		}
	},
	clock() {
		this.obj.clock();

		const soiTmp = this.getSOI(Ship.pos, this.soi);
		if(soiTmp == -2) {
			Ship.vel.add(this.soi.vel);
			Ship.pos.add(this.soi.pos);
			this.soi = this.soi.parent;
		} else if(soiTmp >= 0) {
			this.soi = this.soi.children[soiTmp];
			Ship.vel.add(this.soi.vel, -1);
			Ship.pos.add(this.soi.pos, -1);
		}

		// changing ship velocity based on planet gravity
		Ship.vel.add(this.physics(Ship.pos), TimeWarp.multiplier / Viewport.fps);
	},
	getSOI(point, currentSOI) { // -2 == left soi, -1 == no change, other == entered soi
		if(currentSOI.soiRadius !== undefined && point.magnitude > currentSOI.soiRadius) { // leaving soi
			return -2;
		} else {
			for(const [i, body] of currentSOI.children.entries()) {
				if(point.addedTo(body.pos, -1).magnitude < body.soiRadius) { // entering soi
					return i;
				}
			}
			return -1;
		}
	},
	physics(point) {
		// physics for a one second timestep
		let vel = new Point();
		vel.add(Point.fromVector(point.angle, Bodies.soi.gravAt(point.magnitude)), -1); // soi
		for(const body of this.soi.children) { // soi children
			vel.add(Point.fromVector(body.pos.addedTo(point, -1).angle, body.gravAt(body.pos.addedTo(point, -1).magnitude)));
		}
		return vel;
	}
};
