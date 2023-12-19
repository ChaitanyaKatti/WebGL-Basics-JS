#version 300 es
precision mediump float;

#define PI 3.1415926535897932384626433832795

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTexCoord;
layout(location = 2) in vec3 aNormal;

uniform float uTime;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

out vec3 vPosition;
out vec2 vTexCoord;
out vec3 vNormal;
out float some;

float rand(vec2 c) {
    return fract(sin(dot(c.xy, vec2(12.9898, 78.233))) * 43758.5453);
}
float noise(vec2 p, float freq) {
    float unit = 1. / freq;
    vec2 ij = floor(p / unit);
    vec2 xy = mod(p, unit) / unit;
	//xy = 3.*xy*xy-2.*xy*xy*xy;
    xy = .5 * (1. - cos(PI * xy));
    float a = rand((ij + vec2(0., 0.)));
    float b = rand((ij + vec2(1., 0.)));
    float c = rand((ij + vec2(0., 1.)));
    float d = rand((ij + vec2(1., 1.)));
    float x1 = mix(a, b, xy.x);
    float x2 = mix(c, d, xy.x);
    return mix(x1, x2, xy.y);
}
float pNoise(vec2 p, int res) {
    float persistance = .5;
    float n = 0.;
    float normK = 0.;
    float f = 4.;
    float amp = 1.;
    int iCount = 0;
    for(int i = 0;i < 50;i++) {
        n += amp * noise(p, f);
        f *= 2.;
        normK += amp;
        amp *= persistance;
        if(iCount == res)
            break;
        iCount++;
    }
    float nf = n / normK;
    return nf * nf * nf * nf;
}

void main() {
    vPosition = (uModelMatrix * vec4(aPosition, 1.0)).xyz; // World space position
    vTexCoord = aTexCoord; // UV coordinates
    vNormal = normalize(uNormalMatrix * aNormal); // World space normals, with fixed scaling issues

    // vec3 distortion = 0.1 * aNormal.xyz * sin(aPosition.x * 3.0 * PI + 9.0 * uTime) +
    //     0.1 * aNormal.yzx * cos(aPosition.y * 4.0 * PI + uTime) +
    //     0.1 * aNormal.zxy * cos(aPosition.z * 4.0 * PI + uTime);
    // vec3 displacement = uNormalMatrix * aNormal * vec3(sin(uTime + aPosition.x), cos(uTime + aPosition.y), sin(uTime + aPosition.z) * cos(uTime + aPosition.z));
    // displacement = 0.05 * normalize(displacement);

    vec3 distortion = 0.2 * vNormal * pNoise(aPosition.xz + 0.1*uTime, 1) +
        0.2 * vNormal * pNoise(aPosition.yz + 0.1*uTime, 2) +
        0.2 * vNormal * pNoise(aPosition.xy + 0.1*uTime, 3);
    some = dot(vNormal, distortion);
    vec3 newPostion = aPosition + distortion;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(newPostion, 1.0);
}
