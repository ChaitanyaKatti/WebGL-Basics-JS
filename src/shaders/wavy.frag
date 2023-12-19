#version 300 es
precision mediump float;
#define PI 3.1415926535897932384626433832795
in vec3 vPosition;
in vec2 vTexCoord;
in vec3 vNormal;
in float some;

uniform float uTime;

out vec4 fragColor;

void main() {
    vec3 a = abs(0.5 * sin(vTexCoord * 2.0 * PI).xyx + 0.5 * cos(vTexCoord * 2.0 * PI).yxy);
    fragColor = vec4(a + vNormal * ( some), 1.0);
    // fragColor = vec4(vTexCoord.x, vTexCoord.x, vTexCoord.x, 1.0);
}