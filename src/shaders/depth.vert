#version 300 es
precision mediump float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTexCoord;
layout(location = 2) in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix; // Inverse transpose of uModelMatrix

out vec3 vPosition;
out vec2 vTexCoord;
out vec3 vNormal;

void main() {
    vPosition = (uViewMatrix * uModelMatrix * vec4(aPosition, 1.0)).xyz; // View space position
    vTexCoord = aTexCoord;
    vNormal = uNormalMatrix * aNormal; // World space normal

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0); // Clip space position
}
