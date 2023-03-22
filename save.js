const Save = {
	FILE_EXTENSION: '.sgsave',
	quicksaves: [],
	create() {
		Save.quicksaves.push({
			Display: {
				timestamp: parseInt(Date.now() / 1000),
				soi: Bodies.soi.name,
				colliding: Collisions.colliding
			},
			Bodies: Bodies.save(),
			Collectibles: Collectibles.save(),
			Resources: Resources.save(),
			Ship: Ship.save(),
			Viewport: Viewport.save()
		});
	},
	download() {
		Viewport.pause();
	  const el = (new html('a')).attr({
			href: URL.createObjectURL(new Blob([JSON.stringify(Save.quicksaves)])),
			download: (new Date()).toJSON().slice(0, 19).replace(/:/g, '') + Save.FILE_EXTENSION
		});
	  el.element.click();
	},
	load(index) {
		Bodies.loadSave(this.quicksaves.at(index).Bodies);
		Collectibles.loadSave(this.quicksaves.at(index).Collectibles);
		Resources.loadSave(this.quicksaves.at(index).Resources);
		Ship.loadSave(this.quicksaves.at(index).Ship);
		Viewport.loadSave(this.quicksaves.at(index).Viewport);
	},
	upload(el) {
		let reader = new FileReader();
		reader.onload = event => {
			Save.quicksaves = JSON.parse(event.target.result);
			Save.load(-1);
			Viewport.unpause();
		};
		reader.readAsText(el.files[0]);
		el.value = null;
	},
	init() {
		const containerHTML = (new html('div'))
			.style({
				bottom: '0',
				right: '0'
			})
			.create();
		
		const buttonHTML = (new html('div'))
			.class('background')
			.style({
				position: 'relative',
				width: 'max-content',
				display: 'inline-block'
			})
			.appendTo(containerHTML);

		this.saveButton = (new html('div'))
			.content('Save Game')
			.click(Save.create)
			.class('uiControl', 'button')
			.appendTo(buttonHTML);

		this.downloadButton = (new html('div'))
			.content('Download')
			.click(function() {
				if(Save.quicksaves.length > 0)
					Save.download();
			})
			.class('uiControl', 'button')
			.appendTo(buttonHTML);

		this.uploadButton = (new html('label'))
			.content('Upload')
			.class('uiControl', 'button')
			.append(
				(new html('input'))
				.attr({
					type: 'file',
					accept: this.FILE_EXTENSION,
					hidden: true,
					onchange() {
						this.upload(this.fileHTML);
					}
				})
			)
			.appendTo(buttonHTML);

		this.listHTML = html.clone(buttonHTML)
			.style({
				marginLeft: '0'
			})
			.appendTo(containerHTML);
	},
	clock() {
		buttonStyle(this.downloadButton, false, this.quicksaves.length > 0);
		this.listHTML.content(
			this.quicksaves.map((data, i) => {
				const situation = data.Display.colliding ? 'Landed' : 'Orbiting';
	
				return (new html('span'))
					.click(function() {
						alert(1)
						Save.load(i);
					})
					.content(data.Display.soi + '/' + situation + '/' + (new Date((Date.now() / 1000 - data.Display.timestamp) * 1000).toISOString().substring(11, 19)))
					.element.outerHTML;
			}).join('<br>')
		);
	}
};
