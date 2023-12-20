import { Shader } from '../modules/shader.js';
import { Camera } from '../modules/camera.js';
import { vec3, vec4, mat3, mat4 } from '../modules/matrix.js';
import { Mesh, Sphere, Plane, Box, CornellBox } from '../modules/mesh.js';
import { Texture } from '../modules/texture.js';
import { UI } from '../modules/ui.js';

// Set up canvas and gl variables
const canvas = createCanvas();

// Get the WebGL context
const GL = createContext(canvas);

// Camera
const myCamera = new Camera(60 * Math.PI / 180, window.innerWidth / window.innerHeight, 0.1, 130.0, true);

// Create shader program
const myShader = new Shader(GL, './shaders/shadows.vert',
    './shaders/shadows.frag');

// Create mesh
const sphereMesh = new Sphere(GL, 100, 100);
const planeMesh = new Plane(GL, 1, 1);
const cornellBoxMesh = new CornellBox(GL, 1, 1, 1);
const boxMesh = new Box(GL, 1, 1, 1);

// Create textures
const defaultTexture = new Texture(GL, 0);
const boxTexture = new Texture(GL, 0, './assets/images/textures/cornellBox.jpg');

// Variables for mouse movement
let mousePos = [0, 0]; // Mouse position in normalized device coordinates, from -1 to +1
let activeKeys = {};
let lastFrameTime = performance.now();
let FPS = 60;
let frameCount = 0; // Frame count for time uniform

// Create UI
const ui = new UI();
ui.addSlider('FOV', 90, 0, 180, 1);
ui.addSlider('time', 0, 0, 6.3, 0.01);
ui.addSlider('sphereY', -0.5, -1, 1, 0.1);
ui.addSlider('sphereRadiusX', 0.5, 0.001, 1, 0.01);
ui.addSlider('sphereRadiusY', 0.3, 0.001, 1, 0.01);
ui.addSlider('sphereRadiusZ', 0.5, 0.001, 1, 0.01);
ui.addColorPicker('ambient', [0.0, 0.0, 0.0]);
ui.addColorPicker('diffuse', [1.0, 1.0, 1.0]);
ui.addColorPicker('specular', [1.0, 1.0, 1.0]);
ui.addColorPicker('lightColor', [1.0, 1.0, 1.0]);
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
function drawFrame(shader, boxModelMatrix, sphereModelMatrix, cornellBoxModelMatrix) {
    // Clear the canvas
    GL.clearColor(0, 0, 0, 1.0);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    // Sphere
    defaultTexture.bind();
    shader.setUniform('uModelMatrix', sphereModelMatrix, 'mat4');
    shader.setUniform('uNormalMatrix', mat3.modelToNormal(sphereModelMatrix), 'mat3');
    shader.setUniform('receiveShadow', true, 'bool')
    sphereMesh.draw();

    // Box
    defaultTexture.bind();
    shader.setUniform('uModelMatrix', boxModelMatrix, 'mat4');
    shader.setUniform('uNormalMatrix', mat3.modelToNormal(boxModelMatrix), 'mat3');
    shader.setUniform('receiveShadow', true, 'bool')
    boxMesh.draw();

    // Cornell Box
    boxTexture.bind();
    shader.setUniform('uModelMatrix', cornellBoxModelMatrix, 'mat4');
    shader.setUniform('uNormalMatrix', mat3.modelToNormal(cornellBoxModelMatrix), 'mat3');
    shader.setUniform('receiveShadow', true, 'bool')
    cornellBoxMesh.draw();

    GL.flush(); // Flush the buffer
}

// Render loop, updates variables and matrices and draw each frame
function renderLoop(shader) {
    // ui.variables.time = performance.now() / 1000; // Update time
    // Update camera
    myCamera.update(mousePos, activeKeys);
    myCamera.fov = ui.variables.FOV * Math.PI / 180;

    // Update Model Matrices
    var sphereModelMatrix = mat4.scale(ui.variables.sphereRadiusX, ui.variables.sphereRadiusY, ui.variables.sphereRadiusZ);
    sphereModelMatrix = mat4.multiplyMat(mat4.rotateX(ui.variables.time), sphereModelMatrix);
    sphereModelMatrix = mat4.multiplyMat(mat4.rotateY(ui.variables.time), sphereModelMatrix);
    sphereModelMatrix = mat4.multiplyMat(mat4.translate(0.4, ui.variables.sphereY, 0.1), sphereModelMatrix);
    var boxModelMatrix = mat4.scale(0.5, 1.2, 0.5);
    boxModelMatrix = mat4.multiplyMat(mat4.rotateY(ui.variables.time), boxModelMatrix);
    boxModelMatrix = mat4.multiplyMat(mat4.translate(-0.4, -0.4, -0.4), boxModelMatrix);
    var cornellBoxModelMatrix = mat4.scale(2.0, 2.0, 2.0);


    // Set the uniforms for the sphere and light
    const sphereData = {
        center: { value: [0.4, ui.variables.sphereY, 0.1], type: 'vec3' },
        radius: { value: ui.variables.sphereRadius, type: 'float' },
        invModelMatrix: { value: mat4.inverse(sphereModelMatrix), type: 'mat4' },
    }
    const boxData = {
        center: { value: vec4.toVec3(mat4.multiplyVec(boxModelMatrix, [0, 0, 0, 1])), type: 'vec3' },
        size: { value: vec4.toVec3(mat4.multiplyVec(boxModelMatrix, [1, 1, 1, 0])), type: 'vec3' },
        invModelMatrix: { value: mat4.inverse(boxModelMatrix), type: 'mat4' },
    }
    const ligtData = {
        position: { value: [0.9 * Math.cos(ui.variables.time), 0.9, 0.9 * Math.sin(ui.variables.time)], type: 'vec3' },
        color: { value: ui.variables.lightColor, type: 'vec3' },
        intensity: { value: 1.0, type: 'float' }
    }
    const materialData = {
        ambient: { value: ui.variables.ambient, type: 'vec3' },
        diffuse: { value: ui.variables.diffuse, type: 'vec3' },
        specular: { value: ui.variables.specular, type: 'vec3' },
        shininess: { value: 32.0, type: 'float' },
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
    shader.setUniform('receiveShadow', true, 'bool')
    shader.setUniform('uSphere', sphereData, 'struct');
    shader.setUniform('uBox', boxData, 'struct');
    shader.setUniform('uLight', ligtData, 'struct');
    shader.setUniform('uMaterial', materialData, 'struct');

    drawFrame(shader, boxModelMatrix, sphereModelMatrix, cornellBoxModelMatrix);

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

        // Set uniform for textures used by shader
        GL.uniform1i(GL.getUniformLocation(myShader.program, "uColorTexture"), 0);
        GL.uniform1i(GL.getUniformLocation(myShader.program, "uDepthTexture"), 1);

        renderLoop(myShader); // Start the render loop
    });
}

// Run the main function
main();