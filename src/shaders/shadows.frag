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
    mat4 invModelMatrix;
};

struct Box {
    vec3 center;
    vec3 size;
    mat4 invModelMatrix;
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

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

uniform bool receiveShadow;
uniform sampler2D uColorTexture;
uniform sampler2D uDepthTexture;

uniform Sphere uSphere;
uniform Box uBox;
uniform Light uLight;
uniform Material uMaterial;

out vec4 fragColor;

float rayIntersetSphere(Sphere sphere, vec3 rayOrigin, vec3 rayDir, float tMax) {
    // Transform ray to sphere space
    rayOrigin = (sphere.invModelMatrix * vec4(rayOrigin, 1.0)).xyz;
    rayDir = (sphere.invModelMatrix * vec4(rayDir, 0.0)).xyz;
    
    // Calculate ray-sphere intersection using transformed ray
    vec3 oc = rayOrigin;
    float a = dot(rayDir, rayDir);
    float b = 2.0 * dot(oc, rayDir);
    float c = dot(oc, oc) - 1.0;
    float discriminant = b * b - 4.0 * a * c;
    if(discriminant < 0.0) {
        return 0.0;
    }
    float tNear = (-b - sqrt(discriminant)) / (2.0 * a);
    float tFar = (-b + sqrt(discriminant)) / (2.0 * a);
    if(tNear < 0.0) {// Ray origin is inside the sphere
        tNear = tFar;
        if(tNear < 0.0) {
            return 0.0;
        }
    }
    if(tNear > tMax) { // Ray hits the sphere but after the fragPos
        return 0.0;
    }
    return tNear;
}

float rayIntersectBox(Box box, vec3 rayOrigin, vec3 rayDir, float tMax) {
    // Transform ray to box space
    rayOrigin = (box.invModelMatrix * vec4(rayOrigin, 1.0)).xyz;
    rayDir = (box.invModelMatrix * vec4(rayDir, 0.0)).xyz;

    // Calculate ray-box intersection using transformed ray
    vec3 invDir = 1.0 / rayDir;
    vec3 t0 = (-0.5 - rayOrigin) * invDir;
    vec3 t1 = (+0.5 - rayOrigin) * invDir;
    vec3 tmin = min(t0, t1);
    vec3 tmax = max(t0, t1);
    float tNear = max(max(tmin.x, tmin.y), tmin.z);
    float tFar = min(min(tmax.x, tmax.y), tmax.z);

    // Check for intersection considering rotation
    if(tNear > tFar || tFar < 0.0 || tNear > tMax) {
        return 0.0;
    }
    return tNear;
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
        float tSphere = rayIntersetSphere(uSphere, rayOrigin + 0.01 * vNormal, rayDir, ligthDistance);
        float tBox = rayIntersectBox(uBox, rayOrigin + 0.01 * vNormal, rayDir, ligthDistance);
        if(tSphere > 0.0) {
            occlusion = 0.8;
        } else if(tBox > 0.0) {
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
    vec3 finalColor = attenuation * (ambient + (1.0 - occlusion) * (diffuse + specular));
    fragColor = vec4(finalColor, 1.0);
}