// precision mediump float;
// uniform sampler2D uTexture; 

// varying float vZ;
// varying vec2 vUv;

// void main() {

//     vec4 texture = texture2D(uTexture,vUv);
//     // texture.g *= vZ;

//     gl_FragColor = texture;
//     // vec4 color = vec4(1., vZ, 1., 1.0);
//     // color.r *= vZ;
// // gl_FragColor = vec4(vZ * 1., vZ * 0.5, 0.4784, 1.0);
// // gl_FragColor = color;

// }

uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;

void main()
{
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);
    
    gl_FragColor = vec4(color, 1.0);
}