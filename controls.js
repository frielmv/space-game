// keyboard controls
const Controls = {
	KEYS: {
		a: false,
		d: false,
		w: false
	},
	ALIASES: {
		arrowleft: 'a',
		arrowright: 'd',
		arrowup: 'w'
	},
	afterLoad() {
		function setKey(key, isDown) {
			if(Controls.KEYS[key.toLowerCase()] !== undefined)
				Controls.KEYS[key.toLowerCase()] = isDown;
			else if(Controls.ALIASES[key.toLowerCase()] !== undefined)
				Controls.KEYS[Controls.ALIASES[key.toLowerCase()]] = isDown;
		}
		
		window.onkeyup = event => {
			if(event.key == 'Escape') {
				if(TimeWarp.index > 0)
					TimeWarp.index = 0;
				else if(Viewport.paused)
					Viewport.unpause();
				else
					Viewport.pause();
			} else if(!Viewport.paused) {
				switch(event.key.toLowerCase()) {
					// showing and hiding ui
					case 't':
						if(!Collisions.colliding && !Ship.landingMode)
							Trajectory.show = !Trajectory.show;
						break;
					case 'i':
						if(event.shiftKey)
							Info.show = !Info.show;
						else if(!Viewport.showMap)
							Markers.show = !Markers.show;
						break;
					// mining stuff
					case 'o':
						Resources.showOverlay = !Resources.showOverlay;
						break;
					case 'm':
						Resources.toggleMining();
						break;
					// timewarp controls
					case '.':
						if(TimeWarp.index < TimeWarp.maxIndex)
							TimeWarp.index++;
						break;
					case ',':
						if(TimeWarp.index > 0)
							TimeWarp.index--;
						break;
					case '/':
						TimeWarp.index = 0;
						break;
					// fps controls
					case '[':
						if(!Ship.rotating && Viewport.fps - Viewport.FPS_INCREMENT >= Viewport.MIN_FPS)
							Viewport.fps -= Viewport.FPS_INCREMENT;
						break;
					case ']':
						if(!Ship.rotating)
							Viewport.fps += Viewport.FPS_INCREMENT;
						break;
				}
			}
			setKey(event.key, false);
		};

		window.onkeydown = event => {
			setKey(event.key, true);
		};
	}
};
