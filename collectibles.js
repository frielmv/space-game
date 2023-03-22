const Collectibles = {
	COLLECTION_RADIUS: Markers.RING_SIZE / 2,
	DISPLAY_HEIGHT: 32, // height in pixels to display the collectible once collected
	LIST: {
		'Sputnik': {
			parent: 'Earth',
			size: 3, // size of image in meters
			orbitAlt: 50 // altitude of orbit in meters
		},
		'S-IVB': {
			parent: 'Earth',
			size: 6,
			orbitAlt: 500
		},
		'Amogus': {
			parent: 'Moon',
			size: 3,
			groundPos: 1
		},
		'Juno': {
			parent: 'Jupiter',
			size: 5,
			orbitAlt: 1000
		},
		'Sputnik2': {
			parent: 'Mars',
			size: 10,
			orbitAlt: 50
		},
		'Sputnik3': {
			parent: 'Mars',
			size: 10, // size of image in meters
			orbitAlt: 50
		},
		'Sputnik4': {
			parent: 'Earth',
			size: 10, // size of image in meters
			groundPos: 1 // depth of the ground, as a fraction of the image, for landed objects
		}
	},
	init() {
		this.backgroundHTML = (new html('div'))
			.style({
				height: `calc(${Collectibles.DISPLAY_HEIGHT}px + (var(--spacing) * 2))`,
				right: '0',
				top: '0',
				zIndex: '1',
				transition: 'width 0.25s'
			})
			.class('background')
			.create();

		this.html = (new html('div'))
			.attr({
				id: 'collectibles'
			})
			.create();

		for(const [k, v] of Object.entries(this.LIST)) {
			v.html = (new html('img'))
				.style({
					aspectRatio: '1 / 1',
					borderRadius: 'var(--spacing)',
					transitionProperty: 'top, left, rotate, width, border-color',
					border: 'var(--line) solid'
				})
				.attr({
					src: `assets/collectibles/${k}.svg`
				})
				.appendTo(this.html);
		
			v.angle = randAngle();
			if(v.groundPos !== undefined) { // landed
				v.rotation = v.angle; // rotation = rotation of object, angle = rotation around parent
				v.velRot = 0;
			} else { // not landed
				v.rotation = randAngle();
				v.velRot = (randAngle() - 180) / 2;
			}
		}
	},
	reset() {
		for(const v of Object.values(this.LIST)) {
			v.collected = false;
		}
	},
	save() {
		const saveData = {};
		for(const [k, v] of Object.entries(this.LIST)) {
			saveData[k] = {
				angle: v.angle,
				collected: v.collected
			};
		}
		return saveData;
	},
	loadSave(data) {
		for(const [k, v] of Object.entries(data)) {
			Collectibles.LIST[k].angle = v.angle;
			Collectibles.LIST[k].collected = v.collected;
		}
	},
	clock() {
		const collectedCount = Object.values(this.LIST).filter(el => el.collected).length;
		this.backgroundHTML.style({
			width: `calc(${Collectibles.DISPLAY_HEIGHT * collectedCount}px + (var(--spacing) * 2))`
		});

		for(const v of Object.values(this.LIST)) {
			if(!v.collected) {
				if(v.groundPos === undefined) {
					v.rotation = rotate(v.rotation, v.velRot / Viewport.fps * TimeWarp.multiplier);
					v.angle = rotate(v.angle, 360 / Bodies.flatList[v.parent].periodOf(Bodies.flatList[v.parent].radius + v.orbitAlt) / Viewport.fps * TimeWarp.multiplier);
				}
				const pos = Point.fromVector(v.angle, Bodies.flatList[v.parent].radius + (v.orbitAlt || (v.size * v.groundPos / 2)));
				Viewport.position(v.html, pos.addedTo(Bodies.flatList[v.parent].absolutePos), v.size);

				v.html.style({
					transitionDuration: '0s',
					borderColor: 'transparent',
					zIndex: '0',
					rotate: v.rotation+'deg'
				});

				if(Bodies.soi.name == v.parent && Ship.pos.addedTo(pos, -1).magnitude < this.COLLECTION_RADIUS) {
					v.collected = true;
					v.html.style({
						transitionDuration: 'var(--uiFade)',
						rotate: '0deg',
						width: Collectibles.DISPLAY_HEIGHT+'px',
						top: `calc(${Collectibles.DISPLAY_HEIGHT / 2}px + (var(--spacing) * 2))`,
						left: `calc(100vw - (var(--spacing) * 2) - ${collectedCount * Collectibles.DISPLAY_HEIGHT + (Collectibles.DISPLAY_HEIGHT / 2)}px)`,
						zIndex: '1'
					});
					setTimeout(() => {
						v.html.style({
							borderColor: Bodies.flatList[v.parent].markerColor
						});
					}, 500);
				}
			}
		}
	}
};
