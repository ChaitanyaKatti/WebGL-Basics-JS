import { Shader } from '../modules/shader.js';
import { Camera } from '../modules/camera.js';
import { vec2, vec3, vec4, mat3, mat4 } from '../modules/matrix.js';
import { Mesh, Sphere, Plane, Box, CornellBox } from '../modules/mesh.js';
import { Texture } from '../modules/texture.js';
import { UI } from '../modules/ui.js';
import { Object } from '../modules/object.js';


const a = (new vec2).scale(2.0).elements;
console.log(a);

// Set up canvas and gl variables
const canvas = createCanvas();

// Get the WebGL context
const GL = createContext(canvas);

// Camera
const myCamera = new Camera(90 * Math.PI / 180, window.innerWidth / window.innerHeight, 0.1, 130.0, true);

// Create shader program
const myShader = new Shader(GL, './shaders/shadows.vert',
    './shaders/shadows.frag');

// Create mesh
const sphereMesh = new Sphere(GL, 100, 100);
const cornellBoxMesh = new CornellBox(GL, 1, 1, 1);
const boxMesh = new Box(GL, 1, 1, 1);

// Create textures
const containerDiffuseTexture = new Texture(GL, 0, './assets/images/textures/containerDiffuse.jpg');
const containerSpecularTexture = new Texture(GL, 1, './assets/images/textures/containerSpecular.jpg');
const boxDiffuseTexture = new Texture(GL, 0, './assets/images/textures/cornellBox.jpg');
const boxSpecularTexture = new Texture(GL, 1);

const sphereObj = new Object(sphereMesh, [containerDiffuseTexture, containerSpecularTexture], myShader, null);
const boxObj = new Object(boxMesh, [containerDiffuseTexture, containerSpecularTexture], myShader, null);
const cornellBoxObj = new Object(cornellBoxMesh, [boxDiffuseTexture, boxSpecularTexture], myShader, null);

// Variables for mouse movement
let mousePos = [0, 0]; // Mouse position in normalized device coordinates, from -1 to +1
let activeKeys = {};
let lastFrameTime = performance.now();
let FPS = 60;
let frameCount = 0; // Frame count for time uniform

// Create UI
const ui = new UI();
ui.addSlider('FOV', 90, 0, 180, 1);
ui.addSlider('time', 1.6, 0, 6.3, 0.01);
ui.addSlider('sphereY', -0.5, -1, 1, 0.1);
ui.addSlider('sphereRadiusX', 0.5, 0.001, 1, 0.01);
ui.addSlider('sphereRadiusY', 0.5, 0.001, 1, 0.01);
ui.addSlider('sphereRadiusZ', 0.5, 0.001, 1, 0.01);
ui.addColorPicker('ambient', [0.0, 0.0, 0.0]);
ui.addColorPicker('lightColor', [1.0, 1.0, 1.0]);
ui.addSlider('lightIntensity', 1.0, 0.0, 10, 0.1);
ui.addCheckbox('orbitalCam', myCamera.orbitCam);
ui.elements['orbitalCam'].input.addEventListener('change', () => {
    myCamera.toggleOrbitCam();
});
ui.addFPSCounter();
ui.rack.addEventListener('mouseover', (event) => {
    document.removeEventListener('wheel', myCamera.wheelCameraListener);
});
ui.rack.addEventListener('mouseout', (event) => {
    document.addEventListener('wheel', myCamera.wheelCameraListener);
});

// Prevent the user from leaving the page
window.addEventListener('beforeunload', function (e) {
    // e.preventDefault();
    // e.returnValue = '';
});
// Handle keydown events, add key to activeKeys
document.addEventListener('keydown', (event) => {
    // Regex to check if the key is a letter or Shift or Control
    const regex = /^[a-zA-Z]|Shift|Control| $/;
    if (regex.test(event.key)) {
        // Lowercase the key
        activeKeys[event.key.toLowerCase()] = true;
    }
    else {
        event.preventDefault(); // Prevent the default action of the key
    }
});
// Handle keyup events, delete key from activeKeys
document.addEventListener('keyup', (event) => {
    delete activeKeys[event.key.toLowerCase()];
});
// On click and hold initialize active keys
document.addEventListener('mousedown', () => {
    activeKeys['click'] = true;
});
// On click release delete from active keys
document.addEventListener('mouseup', () => {
    activeKeys['click'] = false;
});
// Handle window blur, reset active keys
window.addEventListener('blur', () => { // Clear active keys when window loses focus  
    activeKeys = {};
});

// Returns canvas element 
function createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = "glCanvas";
    document.body.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return canvas;
}

// Returns  a WebGL context for the canvas element
function createContext(canvas) {
    // Initialize the GL context
    const GL = canvas.getContext("webgl2");
    if (!GL) {
        console.error("Unable to initialize WebGL. Your browser may not support it.");
        return;
    }
    // Canvas resize event
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        myCamera.aspect = window.innerWidth / window.innerHeight;
        GL.viewport(0, 0, canvas.width, canvas.height);
    });

    // Set the viewport to the canvas size
    GL.viewport(0, 0, canvas.width, canvas.height);
    setupPointerLock(canvas);
    return GL;
}

// Handle mouse movement
function updateMouse(event) {
    mousePos[0] += event.movementX / window.innerWidth;
    mousePos[1] += event.movementY / window.innerHeight;
    // mousePos[0] will be used for yaw and mousePos[1] is used for pitch
    // Clamp mousePos[1] to prevent the camera from flipping
    mousePos[1] = Math.min(Math.max(mousePos[1], -0.99), 0.99); // 0.99 to prevent gimbal lock
}

// Setup pointer lock
function setupPointerLock(canvas) {
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock; // Lock the mouse to the canvas

    // Handle click events, request pointer lock on click
    canvas.addEventListener("click", async () => {
        await canvas.requestPointerLock({
            unadjustedMovement: true,
        });
    });

    // Handle pointer lock change events, bind mouse movement to updateMouse() when pointer is locked
    document.addEventListener("pointerlockchange", () => {
        if (document.pointerLockElement === canvas) {
            document.getElementById("crosshair").style.opacity = 0.9;
            document.addEventListener("mousemove", updateMouse);
        }
        else {
            document.getElementById("crosshair").style.opacity = 0.0;
            document.removeEventListener("mousemove", updateMouse);
            activeKeys = {};
        }
    });
}

// Draw a single frame
function drawFrame() {
    // Clear the canvas
    GL.clearColor(0, 0, 0, 1.0);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    // Sphere
    sphereObj.draw()
    // Box
    boxObj.draw();
    // Cornell Box
    cornellBoxObj.draw();
    GL.flush(); // Flush the buffer
}

// Render loop, updates variables and matrices and draw each frame
function renderLoop(shader) {
    // Update camera
    myCamera.update(mousePos, activeKeys);
    myCamera.fov = ui.variables.FOV * Math.PI / 180;

    // Update Model Matrices
    // Sphere
    var sphereModelMatrix = mat4.scale(ui.variables.sphereRadiusX, ui.variables.sphereRadiusY, ui.variables.sphereRadiusZ);
    sphereModelMatrix = mat4.multiplyMat(mat4.rotateX(ui.variables.time), sphereModelMatrix);
    sphereModelMatrix = mat4.multiplyMat(mat4.rotateY(ui.variables.time), sphereModelMatrix);
    sphereObj.modelMatrix = mat4.multiplyMat(mat4.translate(0.4, ui.variables.sphereY, 0.1), sphereModelMatrix);
    // Box
    boxObj.modelMatrix = mat4.multiplyMat(
        mat4.translate(-0.4, -0.4, -0.4),
        mat4.multiplyMat(
            mat4.rotateY(ui.variables.time),
            mat4.scale(0.5, 1.2, 0.5)));
    // CornellBox
    cornellBoxObj.modelMatrix = mat4.scale(2.0, 2.0, 2.0);

    // Set the uniforms for the sphere and light
    const sphereData = {
        center: { value: [0.4, ui.variables.sphereY, 0.1], type: 'vec3' },
        radius: { value: ui.variables.sphereRadius, type: 'float' },
        invModelMatrix: { value: mat4.inverse(sphereObj.modelMatrix), type: 'mat4' },
    }
    const boxData = {
        center: { value: vec4.toVec3(mat4.multiplyVec(boxObj.modelMatrix, [0, 0, 0, 1])), type: 'vec3' },
        size: { value: vec4.toVec3(mat4.multiplyVec(boxObj.modelMatrix, [1, 1, 1, 0])), type: 'vec3' },
        invModelMatrix: { value: mat4.inverse(boxObj.modelMatrix), type: 'mat4' },
    }
    const pointLightData = {
        position: { value: [0.9 * Math.cos(ui.variables.time), 0.9, 0.9 * Math.sin(ui.variables.time)], type: 'vec3' },
        color: { value: ui.variables.lightColor, type: 'vec3' },
        intensity: { value: ui.variables.lightIntensity, type: 'float' }
    }
    const materialData = {
        ambient: { value: ui.variables.ambient, type: 'vec3' },
        shininess: { value: 32.0, type: 'float' },
        diffuseTexture: { value: 0, type: 'int' }, // Sampler2D, at index 0, GL_TEXTURE0
        specularTexture: { value: 1, type: 'int' }, // Sampler2D, at index 1, GL_TEXTURE1
    }

    shader.use(); // Use the shader program
    // Set uniforms for time and aspect ratio
    shader.setUniform('uFrameCount', frameCount, 'uint');
    shader.setUniform('uTime', ui.variables.time, 'float');
    shader.setUniform('uAspect', window.innerWidth / window.innerHeight, 'float');
    shader.setUniform('uResolution', [window.innerWidth, window.innerHeight], 'vec2')
    shader.setUniform('uMousePos', mousePos, 'vec2');
    shader.setUniform('uCameraPos', myCamera.position, 'vec3');
    // Set the uniforms for the matrices
    shader.setUniform('uViewMatrix', myCamera.viewMatrix, 'mat4');
    shader.setUniform('uProjectionMatrix', myCamera.projectionMatrix, 'mat4');
    shader.setUniform('uSphere', sphereData, 'struct');
    shader.setUniform('uBox', boxData, 'struct');
    shader.setUniform('uPointLight', pointLightData, 'struct');
    shader.setUniform('uMaterial', materialData, 'struct');

    drawFrame();

    // FPS counter
    frameCount++;
    FPS = 0.95 * FPS + 0.05 * Math.round(1000 / (performance.now() - lastFrameTime));
    ui.elements['fpsCounter'].innerHTML = `FPS: ${FPS.toFixed(0)}`;
    lastFrameTime = performance.now();

    requestAnimationFrame(function () { renderLoop(shader); }); // Request the next frame
}

// Main function
function main() {
    // Initialize the shader program
    myShader.init().then(() => {
        // Use the shader program
        myShader.use();

        GL.enable(GL.DEPTH_TEST); // Enable depth testing
        GL.enable(GL.CULL_FACE); // Cull back facing triangles

        renderLoop(myShader); // Start the render loop
    });
}

// Run the main function
main();