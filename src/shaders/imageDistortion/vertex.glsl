#pragma glslify: curlNoise = require(../noise.glsl)

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform float uTime;
uniform float uDistortionMultiplier;

attribute vec3 position;
attribute float aRandom;
attribute vec2 uv;

varying float vRandom;
varying vec2 vUv;



float timeFrac = uTime * 0.2;

void main() {
    vec3 distortion = curlNoise(vec3(position.x + timeFrac ,position.y + timeFrac,0.0));
    // vec3 finalPosition = position + distortion *  (uDistortionMultiplier / uTime ) ;
    vec3 finalPosition = position + (distortion * uDistortionMultiplier) ;

    
    vec4 modelPosition = modelMatrix * vec4(finalPosition, 1.);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_PointSize = 1.0;
    gl_Position = projectedPosition;

    vUv = uv;
    vRandom = aRandom;
}