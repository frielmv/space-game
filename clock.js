// game elements
StarField.init();
Aero.init();
Ship.init();
Collectibles.init();
Bodies.init();
// ui elements
Trajectory.init();
Markers.init();
Info.init();
TimeWarp.init();
Resources.init();
Save.init();

if(Viewport.height > Viewport.width) {
	alert('This game works better in a landscape orientation; please turn your device sideways');
}

resetAll();
function resetAll() {
	Viewport.reset();
	Resources.reset();
	Ship.reset();
	Collectibles.reset();
}

var lastClock;
var clockDelay;
clock();
function clock() {
	lastClock = Date.now();

	TimeWarp.clock();
	Aero.clock();
	Bodies.clock();
	StarField.clock();
	Trajectory.clock();
	Ship.clock();
	Collectibles.clock();
	Collisions.clock();
	Markers.clock();
	Info.clock();
	Resources.clock();
	Save.clock();
	if(!Viewport.paused) {
		clockDelay = Math.max(0, (1000 / Viewport.fps) - (Date.now() - lastClock));
		setTimeout(clock, clockDelay);
	}
}

onload = function() {
	Controls.afterLoad();
	Viewport.afterLoad();
	document.body.style.opacity = 1;
};
