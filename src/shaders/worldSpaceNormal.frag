#version 300 es
precision mediump float;

in vec3 vPosition;
in vec2 vTexCoord;
in vec3 vNormal;

out vec4 fragColor;

void main() {
    fragColor = vec4(normalize(vNormal), 1.0);
}