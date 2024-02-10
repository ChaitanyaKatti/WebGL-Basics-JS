import { Shader } from '../modules/shader.js';
import { Camera } from '../modules/camera.js';
import { vec3, mat3, mat4 } from '../modules/matrix.js';
import { Mesh, Sphere, Plane } from '../modules/mesh.js';
import { Texture } from '../modules/texture.js';
import { UI } from '../modules/ui.js';
import { Object } from '../modules/object.js';

// Set up canvas and gl variables
const canvas = createCanvas();

// Get the WebGL context
const GL = createContext(canvas);

// Camera
const myCamera = new Camera(60 * Math.PI / 180, window.innerWidth / window.innerHeight, 0.1, 130.0, true);

// Create shader program
const myShader = new Shader(GL, './shaders/phong.vert',
    './shaders/phong.frag');

// Create mesh
const sphereMesh = new Sphere(GL, 50, 50);// './assets/models/ball.obj');
const planeMesh = new Plane(GL, 1, 1);//, './assets/models/plane.obj');

// Create textures
const defaultTexture = new Texture(GL, 0);
const earthDiffuseTexture = new Texture(GL, 0, './assets/images/textures/earthDay.jpg');
const earthSpecularTexture = new Texture(GL, 1, './assets/images/textures/earthSpecular.jpg');
const moonDiffuseTexture = new Texture(GL, 0, './assets/images/textures/moon.jpg');
const moonSpecularTexture = new Texture(GL, 1);
const sunDiffuseTexture = new Texture(GL, 0, './assets/images/textures/sun.jpg');
const sunSpecularTexture = new Texture(GL, 1);
const skyBoxTexture = new Texture(GL, 0, './assets/images/textures/milkyway.jpg');

// Create Objects
const sun = new Object(sphereMesh, [sunDiffuseTexture, sunSpecularTexture], myShader);
const earth = new Object(sphereMesh, [earthDiffuseTexture, earthSpecularTexture], myShader);
const moon = new Object(sphereMesh, [moonDiffuseTexture, moonSpecularTexture], myShader);
const plane = new Object(planeMesh, [defaultTexture], myShader);
const skyBox = new Object(sphereMesh, [skyBoxTexture], myShader);

// Variables for mouse movement
let mousePos = [0, 0]; // Mouse position in normalized device coordinates, from -1 to +1
let activeKeys = {};
let lastFrameTime = performance.now();
let FPS = 60;
let frameCount = 0; // Frame count for time uniform

// Create UI
const ui = new UI();
// params(variableName, initial_value, min, max, step)
ui.addSlider('FOV', 60, 0, 180, 1);
ui.addSlider('timeDialation', 1, 0, 200, 0.01);
ui.addCheckbox('orbitalCam', myCamera.orbitCam);
ui.elements['orbitalCam'].input.addEventListener('change', () => {
    myCamera.toggleOrbitCam();
});
window.addEventListener('keydown', (event) => {
    if (event.key == 'v' || event.key == 'V') {
        myCamera.toggleOrbitCam();
        ui.elements['orbitalCam'].input.checked = myCamera.orbitCam;
    }
});
ui.addFPSCounter();

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
            document.addEventListener("mousemove", updateMouse);
        }
        else {
            document.removeEventListener("mousemove", updateMouse);
            activeKeys = {};
        }
    });
}

// Draw a single frame
function drawFrame(shader) {
    // Clear the canvas
    GL.clearColor(0.2, 0.5, 0.3, 1.0);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    shader.setUniform('uSkybox', false, 'bool');

    GL.bindTexture(GL.TEXTURE_2D, null);

    // Plane
    plane.modelMatrix = (new mat4).scale(20.0, 1.0, 20.0).translate(0.0, -2.0, 0.0);
    plane.shader.setUniform('uDiffuseTexture', 0, 'int');
    plane.draw();

    // Sun
    sun.modelMatrix = (new mat4);
    sun.shader.setUniform('uDiffuseTexture', 0, 'int');
    sun.draw();

    // Earth
    earth.modelMatrix = (new mat4).scale(0.3, 0.28, 0.3)
        .translate(0, 0, 5)
        .rotateY(ui.variables.timeDialation * performance.now() / (365.25 * 1000))
        .selfRotateY(ui.variables.timeDialation * performance.now() / 1000);
    earth.shader.setUniform('uDiffuseTexture', 0, 'int');
    earth.shader.setUniform('uSpecularTexture', 1, 'int');
    earth.draw();

    // Moon
    moon.modelMatrix = (new mat4).scale(0.1, 0.1, 0.1)
        .translate(0, 0, 5)
        .rotateY(ui.variables.timeDialation * performance.now() / (365.25 * 1000))
        .selfRotateY(ui.variables.timeDialation * performance.now() / (27.3 * 1000))
        .selfTranslate(0, 0, 5);
    moon.shader.setUniform('uDiffuseTexture', 0, 'int');
    moon.draw();

    // Skybox
    skyBox.modelMatrix = (new mat4).scale(100, 100, 100).translate(myCamera.position[0], myCamera.position[1], myCamera.position[2]);
    skyBox.shader.setUniform('uSkybox', true, 'bool');
    skyBox.shader.setUniform('uDiffuseTexture', 0, 'int');
    skyBox.draw();

    GL.flush(); // Flush the buffer
}

// Render loop, updates variables and matrices and draw each frame
function renderLoop(shader) {
    // Variables automatically updated by ui, just need to set the uniforms

    // Update camera
    myCamera.update(mousePos, activeKeys);
    myCamera.fov = ui.variables.FOV * Math.PI / 180;

    shader.use(); // Use the shader program

    // Set uniforms for time and aspect ratio
    shader.setUniform('uFrameCount', frameCount, 'uint');
    shader.setUniform('uTime', ui.variables.timeDialation * performance.now() / 1000, 'float');
    shader.setUniform('uAspect', window.innerWidth / window.innerHeight, 'float');
    shader.setUniform('uResolution', [window.innerWidth, window.innerHeight], 'vec2')
    shader.setUniform('uMousePos', mousePos, 'vec2');
    shader.setUniform('uCameraPos', myCamera.position, 'vec3');
    // Set the uniforms for the matrices
    shader.setUniform('uViewMatrix', myCamera.viewMatrix, 'mat4');
    shader.setUniform('uProjectionMatrix', myCamera.projectionMatrix, 'mat4');
    // shader.setUniform('uNormalMatrix', myCamera.normalMatrix, 'mat4');

    drawFrame(shader);

    frameCount++;
    // FPS counter
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
        // GL.enable(GL.CULL_FACE); // Cull back facing triangles
        // GL.cullFace(GL.BACK); // Cull back facing triangles

        // Set uniform for textures used by shader
        GL.uniform1i(GL.getUniformLocation(myShader.program, "uColorTexture"), 0);
        GL.uniform1i(GL.getUniformLocation(myShader.program, "uDepthTexture"), 1);

        renderLoop(myShader); // Start the render loop
    });
}

// Run the main function
main();