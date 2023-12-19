import { Shader } from '../modules/shader.js';
import { mat4 } from '../modules/matrix.js';

let mousePos = [0, 0];
let orbitRadius = 10;
let camearPos = [0, 0, orbitRadius];

const colorImg = new Image();
const depthImg = new Image();
colorImg.src = './assets/images/textures/wallColor.jpg';
depthImg.src = './assets/images/textures/wallDepth.jpg';


const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


function recalculateCameraPos() {
    var phi = -mousePos[0] * Math.PI; // angle around the Y axis
    var theta = (1 - mousePos[1]) * Math.PI / 2; // angle between Y axis and position vector
    camearPos[0] = orbitRadius * Math.sin(phi) * Math.sin(theta);
    camearPos[1] = orbitRadius * Math.cos(theta);
    camearPos[2] = orbitRadius * Math.cos(phi) * Math.sin(theta);
}

document.addEventListener('mousemove', (event) => {
    mousePos[0] = 2 * (event.clientX - window.innerWidth / 2) / window.innerWidth;
    mousePos[1] = 2 * (event.clientY - window.innerHeight / 2) / window.innerHeight;
    recalculateCameraPos();
});

document.addEventListener('wheel', (event) => {
    orbitRadius += event.deltaY / 100;
    orbitRadius = Math.max(orbitRadius, 0.1);
    recalculateCameraPos();
});

function drawScene(gl, shader, vertexBuffer, indexBuffer, frameCount) {
    // Clear the canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    // Uniforms
    // Set uniforms for time and aspect ratio
    shader.setUniform('uResolution', [window.innerWidth, window.innerHeight], 'vec2')
    shader.setUniform('uFrameCount', frameCount, 'uint');
    shader.setUniform('uTime', performance.now() / 1000, 'float');
    shader.setUniform('uAspect', window.innerWidth / window.innerHeight, 'float');
    shader.setUniform('uMousePos', mousePos, 'vec2');

    // Create the MVP matrices
    const viewMatrix = mat4.lookAt(camearPos, [0, 0, 0], [0, 1, 0]);
    const projectionMatrix = mat4.perspective(45 * Math.PI / 180, window.innerWidth / window.innerHeight, 0.1, 100.0);
    // Set the uniforms for the matrices
    shader.setUniform('uViewMatrix', viewMatrix, 'mat4');
    shader.setUniform('uProjectionMatrix', projectionMatrix, 'mat4');
    
    for (let i = 0; i < 20; i++) {
        var modelMatrix = mat4.scale(0.5, 0.5, 0.5);
        modelMatrix = mat4.multiply(mat4.rotateX(performance.now() / 1000 + i * Math.PI / 2), modelMatrix);
        modelMatrix = mat4.multiply(mat4.rotateY(performance.now() / 1000 + i * Math.PI / 2), modelMatrix);
        modelMatrix = mat4.multiply(mat4.translate(5 * Math.sin(i*Math.PI/10), 5 * Math.cos(i*Math.PI/5), 5 * Math.cos(i*Math.PI/10)), modelMatrix);
        shader.setUniform('uModelMatrix', modelMatrix, 'mat4');
        // Draw the triangle
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    }
    
    gl.flush(); // Flush the buffer
}

function main() {
    // Initialize the GL context
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        console.error("Unable to initialize WebGL. Your browser may not support it.");
        return;
    }
    // Canvas resize event
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    });


    // Vertex and uv data for the triangles
    const vertices = new Float32Array([
        // X, Y, Z, u, v
        -1.0, -1.0, 1.0, 0.0, 0.0,
        1.0, -1.0, 1.0, 1.0, 0.0,
        1.0, 1.0, 1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0, 0.0, 1.0,
        -1.0, -1.0, -1.0, 0.0, 0.0,
        1.0, -1.0, -1.0, 1.0, 0.0,
        1.0, 1.0, -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0, 0.0, 1.0,
    ]);

    // Indices of the vertices
    const indices = new Uint16Array([
        0, 1, 2, // Front face
        2, 3, 0,
        6, 5, 4, // Back face
        4, 7, 6,
        7, 3, 2, // Top face
        2, 6, 7,
        5, 1, 0, // Bottom face
        0, 4, 5,
        6, 2, 1, // Right face
        1, 5, 6,
        4, 0, 3, // Left face
        3, 7, 4,
    ]);

    // Create vertex array object and bind it to the context
    const vertexArrayObject = gl.createVertexArray(); // Create vertex array object
    gl.bindVertexArray(vertexArrayObject); // Bind vertex array object

    // Create buffer object for vertices, then bind to ARRAY_BUFFER and fill with data
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Create buffer object for indices, then bind to ELEMENT_ARRAY_BUFFER and fill with data
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);


    var colorTexture = gl.createTexture();
    var depthTexture = gl.createTexture();

    colorImg.onload = function () {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, colorTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, colorImg);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // Prevents s-coordinate wrapping (repeating).
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // Prevents t-coordinate wrapping (repeating).
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }

    depthImg.onload = function () {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, depthTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, depthImg);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // Prevents s-coordinate wrapping (repeating).
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // Prevents t-coordinate wrapping (repeating).
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    // Create shader program
    const shader = new Shader(gl, './shaders/modelUV.vert', './shaders/modelUV.frag');

    // Initialize the shader program
    shader.init().then(() => {
        // Use the shader program
        shader.use();

        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        // gl.enable(gl.CULL_FACE); // Cull back facing triangles
        // gl.cullFace(gl.BACK); // Cull back facing triangles

        // Bind the vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        // Bind the index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        // Set the vertex attribute pointers
        // Specify the layout of the position data
        const vertexPositionLoc = gl.getAttribLocation(shader.program, 'aPosition'); // Get the attribute location
        gl.enableVertexAttribArray(vertexPositionLoc); // Enable the attribute
        gl.vertexAttribPointer(vertexPositionLoc, 3, gl.FLOAT, false, 5 * 4, 0); // Specify how to pull the data out

        // Specify the layout of texture coordinates
        const textureCoordLoc = gl.getAttribLocation(shader.program, 'aTexCoord');
        gl.enableVertexAttribArray(textureCoordLoc);
        gl.vertexAttribPointer(textureCoordLoc, 2, gl.FLOAT, false, 5 * 4, 3 * 4);

        // Set uniform for textures used by shader
        gl.uniform1i(gl.getUniformLocation(shader.program, "uColorTexture"), 0);
        gl.uniform1i(gl.getUniformLocation(shader.program, "uDepthTexture"), 1);

        let frameCount = 0; // Frame count for time uniform

        // Render loop
        function render(frameCount) {
            drawScene(gl, shader, vertexBuffer, indexBuffer, frameCount);
            requestAnimationFrame(function () { render(frameCount + 1); }); // Request the next frame
        }
        render(frameCount); // Start the render loop
    });
}

main();