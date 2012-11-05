/**

	Test Bed
	
	initialization and frame pump
	
	@module bed
	@author cpgauthier

**/

var BED = {

	rng: SOAR.random.create(),
	
	/**
		generate a random number for seeding other RNGs

		used because seeding by time fails on startup--
		all seeds will be the same. you need a "master"
		seed RNG to drive all others.
		
		@method seed
		@return number, seed integet
	**/
	
	seed: function() {
		var seed = Math.round(BED.rng.get() * BED.rng.modu);
		return seed;
	},
	
	/**
		create GL context, set up game objects, load resources

		@method start
	**/

	start: function() {

		var gl, init, total, id;

		// create the GL display
		try {
			BED.display = SOAR.display.create("gl");
		} catch (e) {
			debugger;
		}
		
		// resize display & redraw if window size changes
		window.addEventListener("resize", BED.resize, false);
		
		// set initial display size
		BED.display.setSize(
			document.body.clientWidth, 
			document.body.clientHeight
		);
		
		// set up debugger element
		this.debugit = document.getElementById("debugit");
		
		// set up any webgl stuff that's not likely to change
		gl = BED.display.gl;
		gl.clearDepth(1.0);
		gl.depthFunc(gl.LEQUAL);
		gl.enable(gl.DEPTH_TEST);
		gl.clearColor(0.5, 0.5, 0.5, 1);
		
		// set up an array of all objects to be initialized
		inits = [ BED.player, BED.mctest ];
		total = inits.length;
		
		// set up a function to call for the next several animation frames
		// this will perform initialization, with progress bar animations
		id = SOAR.schedule(function() {
			var il = inits.length;
			var np = total - il;
			// as long as there are objects to init
			if (il > 0) {
				// init the next one
				inits.shift().init();
			} else {
				// unschedule the init function
				SOAR.unschedule(id);
				
				// schedule animation frame functions
				SOAR.schedule(BED.update, 0, true);
				SOAR.schedule(BED.draw, 0, true);
				SOAR.schedule(BED.debug, 100, true);
				
				// set display parameters
				BED.resize();
			}
		
		}, 0, true);

		// start capturing control events
		SOAR.capture.start();
		
		// start the message pump
		SOAR.run();
	},
	
	/**
		handle browser resizing
		
		@method resize
	**/
	
	resize: function() {
		BED.display.setSize(
			document.body.clientWidth, 
			document.body.clientHeight
		);
		BED.player.camera.projector();
		BED.draw();
	},
	
	/**
		update all game objects that require it
		
		@method update
	**/
	
	update: function() {
		SOAR.capture.update();
		BED.player.update();
	},

	/**
		draw all game objects that require it
		
		draw and update are separated so that the
		game can redraw the display when the game
		is paused (i.e., not updating) and resize
		events are being generated
		
		@method draw
	**/
	
	draw: function() {
		var gl = BED.display.gl;
		gl.disable(gl.BLEND);
		gl.disable(gl.CULL_FACE);
		
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		BED.mctest.draw();
	
	},
	
	dump: function(o) {
		BED.debugit.innerHTML = JSON.stringify(o);
	},
	
	n: SOAR.vector.create(),
	
	debug: function() {
		BED.debugit.innerHTML = SOAR.fps;
	}

};
