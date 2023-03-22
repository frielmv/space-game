const Collisions = {
	colliding: false,
	collidedLastClock: false,
	COLLISION_TOLERANCE: 0.02, // how many meters off the ground to consider a collision
	BOUNCE_MULTIPLIER: 0.25, // 0 is no bounce, 1 is 100% bounce
	BOUNCE_THESHOLD: 3, // min impact velocity for a bounce
	SLIDE_MULTIPLIER: 0.1, // 1 is zero friction, 0 is immediate stop. Multiplied by this every second
	BODY_STRENGTH: 1/4, // multiplier for ship body impact vs landding legs
	clock() {
		function altOf(point) { // get altitude of a collider
			return Ship.pos.addedTo(point, -1).magnitude - Bodies.soi.radius;
		}
		function colliderPos(collider) { // get the position of an angled collider
			return Point.fromVector(rotate(Ship.angle, collider[0]), collider[1] * Ship.BASE_SCALE);
		}

		this.collider = Ship.ANGLE_COLLIDERS.reduce((prev, curr) =>
				altOf(colliderPos(curr)) < altOf(colliderPos(prev)) ? curr : prev
			);
		const currentColliderPos = colliderPos(this.collider); // position of current collider relative to ship

		this.collisionAngle = Ship.pos.addedTo(currentColliderPos).angle;

		this.colliding = altOf(currentColliderPos) < this.COLLISION_TOLERANCE;

		const velAngleDiff = angleDiff(
			Ship.vel.angle, // prograde angle
			this.collisionAngle // angle of line between ship and body
		);
		this.impactVel = Ship.vel.magnitude * -Math.cos(velAngleDiff / 180 * Math.PI); // portion of ship's velocity that's towards the body

		if(this.colliding) {
			const impactVelChange = Point.fromVector(this.collisionAngle, Math.max(0, this.impactVel)); // velocity change needed to cancel out impact velocity

			if(this.impactVel > this.BOUNCE_THESHOLD) {
				// bouncing
				if(altOf(currentColliderPos) < 0)
					Ship.vel.add(impactVelChange, 1 + this.BOUNCE_MULTIPLIER);
			} else {
				if(altOf(currentColliderPos) < 0)
					Ship.vel.add(impactVelChange);

				Ship.vel.multiply(this.SLIDE_MULTIPLIER ** (1 / Viewport.fps));

				// changing position to pivot on collider
				/*const pivotPoint = Ship.colliderPos(...this.collider);
				const newXY = vectorXY(
					rotate(Ship.angle, this.collider[0] + Ship.velRot / Viewport.fps * TimeWarp.multiplier),
					this.collider[1] * Ship.BASE_SCALE
				);
				Ship.velX = (newXY[0] - pivotPoint[0]) * Viewport.fps;
				Ship.velY = (newXY[1] - pivotPoint[1]) * Viewport.fps;*/
			}

			// pushing ship away from body (not strictly necessary but minimizes clipping)
			Ship.pos.add(Point.fromVector(this.collisionAngle, Math.max(0, -altOf(currentColliderPos))));

			// runs once on collision
			if(!this.collidedLastClock) {
				if(
					(!this.collider[2] && this.impactVel > Ship.CRASH_VEL * this.BODY_STRENGTH)
					||
					(this.impactVel > Ship.CRASH_VEL)
				) {
					resetAll();
				}
			}

			this.collidedLastClock = true;
		} else {
			this.collidedLastClock = false;
		}
	}
};
