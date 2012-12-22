<script id="vs-mctest" type="x-shader/x-vertex">

attribute vec3 position;
attribute vec3 normal;

uniform mat4 projector;
uniform mat4 modelview;

varying vec3 obj;
varying vec3 eye;
varying vec3 tex;

void main(void) {
	vec4 pos = modelview * vec4(position, 1.0);
	gl_Position = projector * pos;
	eye = pos.xyz;
	obj = position;
	tex = abs(normal);
}

</script>

<script id="fs-mctest" type="x-shader/x-fragment">

precision mediump float;

uniform sampler2D noise;

varying vec3 obj;
varying vec3 eye;
varying vec3 tex;

void main(void) {
	float c0 = tex.z * texture2D(noise, obj.xy).r + tex.x * texture2D(noise, obj.yz).r + tex.y * texture2D(noise, obj.xz).r;
	float c1 = tex.z * texture2D(noise, 2.0 * obj.xy).r + tex.x * texture2D(noise, 2.0 * obj.yz).r + tex.y * texture2D(noise, 2.0 * obj.xz).r;

	vec3 col = mix(vec3(0.12, 0.22, 0.57), vec3(0.91, 0.83, 0.27), (c0 + c1) * 0.25);
	
	float l = (10.0 - length(eye)) / 10.0;
	col = col * l;
	
	gl_FragColor = vec4(col, 1.0);
}

</script>

