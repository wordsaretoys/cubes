BED.mctest = {

	rng: SOAR.random.create(BED.seed()),
	
	/**
		create and init required objects
		
		@method init
	**/

	init: function() {
		var that = this;
		var rng = this.rng;
		var p = SOAR.vector.create();
		var mesh, tex;
		
		tex = SOAR.space.makeU8(64, 64);
		SOAR.pattern.walk(tex, 283742, 12, 0.05, 255, 0.5, 0.5, 0.5, 0.5);
		SOAR.pattern.normalize(tex, 0, 255);
		this.noise = SOAR.texture.create(BED.display, tex);
		
		// load shaders
		this.shader = SOAR.shader.create(
			BED.display,
			SOAR.textOf("vs-mctest"), 
			SOAR.textOf("fs-mctest"),
			["position", "normal"], 
			["projector", "modelview"],
			["noise"]
		); 

		// create mesh object
		var mesh = this.mesh = SOAR.mesh.create(BED.display, BED.display.gl.TRIANGLE);
		mesh.add(this.shader.position, 3);
		mesh.add(this.shader.normal, 3);

		var step = 0.2;
		var length = 10;
		var threshold = 0.5;
		
		var n = SOAR.vector.create();
		var hash = {};
		var indx = 0;

		// generates surface from 3D noise function
		var noise = SOAR.noise3D.create(1968103401, 1, 32, 0.5);
		var field = this.field = function(x, y, z) {
			return noise.get(x, y, z);
		};

		// generates surface normals for texture blending
		// (really a gradient function, but as it points 
		// toward wherever the field is strongest, it will
		// always point *away* from the local isosurface)
		var gradient = this.gradient = function(n, x, y, z) {
			n.x = field(x + step, y, z) - field(x - step, y, z);
			n.y = field(x, y + step, z) - field(x, y - step, z);
			n.z = field(x, y, z + step) - field(x, y, z - step);
			n.norm();
		};
		
		// callback for building surface mesh
		function polycb(p) {
			gradient(n, p.x, p.y, p.z);
			var key = Math.floor(p.x * 100) + "." + Math.floor(p.y * 100) + "." + Math.floor(p.z * 100);
			var ent = hash[key];
			if (ent !== undefined) {
				mesh.index(ent);
			} else {
				mesh.set(p.x, p.y, p.z, n.x, n.y, n.z);
				mesh.index(indx);
				hash[key] = indx++;
			}
		}
		
		// polygonize surface within specified volume
		SOAR.mcubes.poly( 
			{ x: 0, y: 0, z: 0 },
			{ x: length, y: length, z: length },
			step, 
			threshold,
			field,
			polycb
		);

		mesh.build();
		
		BED.player.camera.position.set(length * 0.5, length * 0.5, length * 0.5);
	},
	
	/**
		draw the peak
		
		@method draw
	**/
	 
	draw: function() {
		var gl = BED.display.gl;
		var camera = BED.player.camera;
		var shader;

		gl.disable(gl.BLEND);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);

		shader = this.shader;
		shader.activate();
		gl.uniformMatrix4fv(shader.projector, false, camera.matrix.projector);
		gl.uniformMatrix4fv(shader.modelview, false, camera.matrix.modelview);
		this.noise.bind(0, shader.noise);
		this.mesh.draw();
		
	}

};