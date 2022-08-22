precision mediump float;

uniform sampler2D uTexture; 

varying float vRandom;
varying vec2 vUv;

void main() {
    vec4 texture = texture2D(uTexture,vUv);

    // gl_FragColor = vec4(vRandom * 1.0, vRandom * 0.5, 0.5, vRandom * 1.0);
    // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    // gl_FragColor = vec4(vUv, 0.0,1.0);
    gl_FragColor = texture;



}