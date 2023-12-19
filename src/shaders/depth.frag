#version 300 es
precision mediump float;

in vec3 vPosition;

out vec4 fragColor;


float depthToLuminance1(float depth, float near, float far) {
    return (far - depth) / (far - near);
}

float depthToLuminance2(float depth, float middle){
    // Middle should ideally be point of interest

    // Zero depth has the 1.0 luminance
    // Middle depth has 0.5 luminance
    // Infinity depth has the 0.0 luminance

    return (middle ) / (middle + depth);

}

void main() {
    float depth = -vPosition.z;
    // Depth as grayscale
    fragColor = vec4(vec3(depthToLuminance1(depth, 0.1, 10.0)), 1.0);
    fragColor = vec4(vec3(depthToLuminance2(depth, 1.0)), 1.0);
}