#version 300 es
precision mediump float;

in vec3 vPosition;
in vec2 vTexCoord;
in vec3 vNormal;

uniform uint uFrameCount;
uniform float uTime; // In seconds
uniform float uAspect;
uniform vec2 uResolution;
uniform vec2 uMousePos;
uniform vec3 uCameraPos;

uniform sampler2D uDiffuseTexture;
uniform sampler2D uSpecularTexture;

uniform bool uSkybox;

out vec4 fragColor;

struct Light {
    vec3 position;
    vec3 color;
    float intensity;
};

vec4 contrast(vec4 value, float c) {
    vec4 v2 = value * value;
    vec4 v3 = value * v2;
    vec4 v4 = value * v3;
    return clamp(c * v4 - 2.0 * (1.0 + c) * v3 + (c + 3.0) * v2, 0.0, 1.0);
}

void main() {
    vec4 objectCol = texture(uDiffuseTexture, vTexCoord);
    if(uSkybox) {
        fragColor = contrast(objectCol, 20.0);
        return;
    }

    // Light
    Light light = Light(vec3(0.0, 0.0, 0.0), vec3(0.91, 0.95, 0.99), 2.0);

    // Ambient
    float ambientStrength = 0.1;
    vec3 ambient = ambientStrength * light.color;

    // Diffuse
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(light.position - vPosition);
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * light.color;

    // Specular
    vec3 viewDir = normalize(uCameraPos - vPosition);
    float spec = pow(max(dot(reflect(-lightDir, normal), viewDir), 0.0), 16.0);
    vec3 specular = spec * light.color * texture(uSpecularTexture, vTexCoord).rgb;

    // Attenuation
    float ligthDistance = length(light.position - vPosition);
    float attenuation = light.intensity / (1.0 + 0.1 * ligthDistance + 0.01 * ligthDistance * ligthDistance);

    // Final color
    vec3 finalColor = attenuation * objectCol.rgb * (ambient + diffuse + specular);
    fragColor = vec4(finalColor, objectCol.a);
}