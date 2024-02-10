#version 300 es
precision mediump float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTexCoord;
layout(location = 2) in vec3 aNormal;

uniform uint uFrameCount;
uniform float uTime; // in seconds
uniform float uAspect;
uniform vec2 uResolution;
uniform vec2 uMousePos;
uniform vec3 uCameraPos;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

out vec3 vPosition;
out vec2 vTexCoord;
out vec3 vNormal;

void main() {
    vPosition = (uModelMatrix * vec4(aPosition, 1.0)).xyz; // World space position
    vTexCoord = aTexCoord;
    vNormal = normalize(uNormalMatrix * aNormal); // World space normal

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
}
