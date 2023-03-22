class Point {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
	// returns a copy of the point
	copy() {
		let result = new Point();
		result.add(this);
		return result;
	}
	// sets the point to a specific value
	set(x, y = undefined) {
		this.x = x;
		if(this.y === undefined) {
			this.y = x;
		} else {
			this.y = y;
		}
	}
	// adds another point to the current point
	add(point, multiplier = 1) {
		this.x += point.x * multiplier;
		this.y += point.y * multiplier;
	}
	// returns the point with another point added
	addedTo(point, multiplier = 1) {
		let result = new Point();
		result.add(this);
		result.add(point, multiplier);
		return result;
	}
	// multiplies both directions of the point by the given value
	multiply(value) {
		this.x *= value;
		this.y *= value;
	}
	// returns the point multiplied by the given value
	multipliedBy(value) {
		let result = new Point();
		result.add(this);
		result.multiply(value);
		return result;
	}
	// returns the angle of the point
	get angle() {
		return (-Math.atan2(this.y, this.x) * 180 / Math.PI + 450) % 360;
	}
	// returns the magnitude of the point
	get magnitude() {
		return Math.hypot(this.x, this.y);
	}
	// returns a point from a given vector
	static fromVector(direction, magnitude) {
		return new Point(
			Math.sin(direction * Math.PI / 180) * magnitude,
			Math.cos(direction * Math.PI / 180) * magnitude
		);
	}
}

class html {
	constructor(el) {
		if(el instanceof HTMLElement) {
			this.element = el;
		} else {
			this.element = document.createElement(el);
		}
	}
	static clone(el, deep) {
		return new html(el.element.cloneNode(deep));
	}
	style(cssObj) {
		if(cssObj !== undefined) {
			for(const [k, v] of Object.entries(cssObj)) {
				this.element.style[k] = v;
			}
		}
		return this;
	}
	attr(obj) {
		for(const [k, v] of Object.entries(obj)) {
			this.element[k] = v;
		}
		return this;
	}
	content(str) {
		this.element.innerHTML = str;
		return this;
	}
	click(func) {
		this.element.onclick = func;
		return this;
	}
	class(...classes) {
		this.element.classList.add(...classes);
		return this;
	}
	append(...els) {
		for(const el of els) {
			this.element.appendChild(el.element);
		}
		return this;
	}
	appendTo(el) {
		el.element.appendChild(this.element);
		return this;
	}
	create() {
		document.body.appendChild(this.element);
		return this;
	}
}

function rotate(original, amount) {
	return (original + 360 + (amount % 360)) % 360;
}
function angleDiff(angle1, angle2) {
	return (angle1 - angle2 + 540) % 360 - 180;
}
function acos(val) {
	return (-Math.acos(val) * 180 / Math.PI + 450) % 360;
}
const G = 6.6743e-11; // gravitational constant

function randAngle() {
	return parseInt(Math.random() * 360);
}

function clamp(value, min = 0, max = 1) {
	if(value < min)
		value = min;
	else if(value > max)
		value = max;
	return value;
}

function buttonStyle(el, active, enabled = true) {
	el.style({
		borderColor: active ? 'var(--ui)' : 'transparent',
		opacity: enabled ? '1' : '0.25'
	});
}
