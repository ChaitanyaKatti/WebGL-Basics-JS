#version 300 es
precision mediump float;

#define PI 3.1415926535897932384626433832795

struct Light {
    vec3 position;
    vec3 color;
    float intensity;
};

struct Sphere {
    vec3 center;
    float radius;
};

struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
};

in vec3 vPosition;
in vec2 vTexCoord;
in vec3 vNormal;

uniform uint uFrameCount;
uniform float uTime; // In seconds
uniform float uAspect;
uniform vec2 uResolution;
uniform vec2 uMousePos;
uniform vec3 uCameraPos;

uniform bool receiveShadow;
uniform sampler2D uColorTexture;
uniform sampler2D uDepthTexture;

uniform Sphere uSphere;
uniform Light uLight;
uniform Material uMaterial;

out vec4 fragColor;

float intersetSphere(Sphere sphere, vec3 rayOrigin, vec3 rayDir, float tMax) {
    vec3 oc = rayOrigin - sphere.center;
    float a = dot(rayDir, rayDir);
    float b = 2.0 * dot(oc, rayDir);
    float c = dot(oc, oc) - sphere.radius * sphere.radius;
    float discriminant = b * b - 4.0 * a * c;
    if(discriminant < 0.0) {
        return 0.0;
    }
    else{
        float t = (-b - sqrt(discriminant)) / (2.0 * a);
        // return float(t > 0.0 && t < tMax);
        if(t > tMax || t < 0.0) {
            return 0.0;
        }
        float delta = sqrt(discriminant) / a;
        return delta;
    }
}

vec4 contrast(vec4 value, float c) {
    vec4 v2 = value * value;
    vec4 v3 = value * v2;
    vec4 v4 = value * v3;
    return clamp(c * v4 - 2.0 * (1.0 + c) * v3 + (c + 3.0) * v2, 0.0, 1.0);
}

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
    vec3 vparallel = axis * dot(axis, v);
    vec3 vperp = v - vparallel;
    vec3 vperp2 = cross(axis, vperp);
    return vparallel + vperp * cos(angle) + vperp2 * sin(angle);
}

void main() {
    // Ray
    vec3 rayOrigin = uLight.position;
    vec3 rayDir = normalize(vPosition - uLight.position);

    // Ambient
    vec3 ambient = uLight.color * uMaterial.ambient;

    // Attenuation
    float ligthDistance = length(uLight.position - vPosition);
    float attenuation = uLight.intensity / (1.0 + 0.1 * ligthDistance + 0.01 * ligthDistance * ligthDistance);

    // Intersection
    float occlusion = 0.0;
    if(receiveShadow) {
        float delta = intersetSphere(uSphere, rayOrigin, rayDir, ligthDistance);
        // occlusion = delta / (2.0 * uSphere.radius);
        // occlusion = pow(occlusion, 3.0);
        if (delta > 0.0) {
            occlusion = 0.8;
        }
    }

    // Diffuse
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(uLight.position - vPosition);
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * uLight.color * uMaterial.diffuse;

    // Specular
    vec3 viewDir = normalize(uCameraPos - vPosition);
    vec3 relfectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(relfectDir, viewDir), 0.0), uMaterial.shininess);
    vec3 specular = spec * uLight.color * uMaterial.specular;

    // Final color
    vec3 finalColor =  attenuation * (ambient + (1.0 - occlusion) * (diffuse + specular));
    fragColor = vec4(finalColor, 1.0);
}