import { mat4 } from './matrix.js';

export class Camera {
    constructor(fov, aspect, near, far, orbitCam = false) {
        // this.GL = GL;
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;

        this.position = [0, 0, 10];
        this.roll = 0.0; // Y axis is up
        this.yaw = Math.PI; // Looking along -Z axis
        this.pitch = Math.PI / 2; // Viewing perpendicular to Y axis

        this.speed = 0.0;
        this.normalSpeed = 0.01;
        this.sprintSpeed = 0.05;

        // Orbit camera variables
        this.orbitCam = orbitCam; // Boolean to toggle between orbit and FPV camera
        this.orbitRadius = 2.0;
        this.center = [0, 0, 0];

        this.wheelCameraListener = (event) => {
            this.orbitRadius -= event.deltaY * 0.01;
            this.orbitRadius = Math.max(this.orbitRadius, 0.1);
        }
        document.addEventListener('wheel', this.wheelCameraListener); // False to make sure the event is not captured by the canvas

        // Initialize matrices and the update() function
        if (orbitCam) {
            // this.mouseDelta = [0.0, 0.0];
            // this.previousMouseDelta = [0.0, 0.0];
            // this.lastMousePos = [0.0, 0.0];
            this.viewMatrix = mat4.lookAt(this.position, [0, 0, 0], [0, 1, 0]);
            this.update = this.updateOrbitCam;

        } else {
            this.viewMatrix = mat4.lookAtRPY(this.position, this.roll, this.pitch, this.yaw);
            this.update = this.updateFPV;
        }
        this.projectionMatrix = mat4.perspective(this.fov, this.aspect, this.near, this.far);
    }


    // First person camera
    updateFPV(mousePos, keys) {
        if (keys["shift"]) {
            this.speed = this.sprintSpeed;
        } else {
            this.speed = this.normalSpeed;
        }
        this.roll -= this.roll * 0.005;

        this.updateOrientationFPV(mousePos, keys);
        this.updatePositionFPV(mousePos, keys);
        this.updateMatricesFPV();
    }
    updateOrientationFPV(mousePos, keys) {
        this.yaw = (1 - mousePos[0]) * Math.PI % (2 * Math.PI); // angle around the Y axis, in ZX plane, zero yaw is facing along Z axis
        this.pitch = (1 + mousePos[1]) * Math.PI / 2; // angle between Y axis and position vector, zero pitch is facing along Y axis

        if (keys["q"]) { // Left
            this.roll -= 0.01;
        }
        else if (keys["e"]) { // Right
            this.roll += 0.01;
        }
    }
    updatePositionFPV(mousePos, keys) {
        if (keys["w"]) { // Forward
            this.position[0] += this.speed * Math.sin(this.yaw) * Math.sin(this.pitch);
            this.position[1] += this.speed * Math.cos(this.pitch);
            this.position[2] += this.speed * Math.cos(this.yaw) * Math.sin(this.pitch);
        }
        if (keys["s"]) { // Backward
            this.position[0] -= this.speed * Math.sin(this.yaw);// * Math.sin(this.pitch);
            // this.cameraPos[1] -= this.speed * Math.cos(this.pitch);
            this.position[2] -= this.speed * Math.cos(this.yaw);// * Math.sin(this.pitch);
        }
        if (keys["a"]) { // Left
            this.position[0] += this.speed * Math.cos(this.yaw);
            this.position[2] -= this.speed * Math.sin(this.yaw);
        }
        if (keys["d"]) { // Right
            this.position[0] -= this.speed * Math.cos(this.yaw);
            this.position[2] += this.speed * Math.sin(this.yaw);
        }
        if (keys[" "]) { // Up
            this.position[1] += this.speed;
        }
        if (keys["control"]) { // Down
            this.position[1] -= this.speed;
        }
    }
    updateMatricesFPV() {
        this.viewMatrix = mat4.lookAtRPY(this.position, this.roll, this.pitch, this.yaw);
        this.projectionMatrix = mat4.perspective(this.fov, this.aspect, this.near, this.far);
    }


    // Orbit camera
    updateOrbitCam(mousePos, keys) {
        if (keys["shift"]) {
            this.speed = this.sprintSpeed;
        } else {
            this.speed = this.normalSpeed;
        }

        // if (keys['click']) { // If mouse is clicked
        //     this.mouseDelta = [this.previousMouseDelta[0] + mousePos[0] - this.lastMousePos[0],
        //                         this.previousMouseDelta[1] + mousePos[1] - this.lastMousePos[1]];
        // }
        // else {
        //     console.log('reset');
        //     this.lastMousePos[0] = mousePos[0];
        //     this.lastMousePos[1] = mousePos[1];
        //     this.previousMouseDelta[0] = this.mouseDelta[0];
        //     this.previousMouseDelta[1] = this.mouseDelta[1];
        // }

        this.updateOrientationOrbitCam(mousePos, keys);
        this.updatePositionOrbitCam(mousePos, keys);
        this.updateMatricesOrbitCam();
    }
    updateOrientationOrbitCam(mousePos, keys) {
        this.yaw = (1 - mousePos[0]) * Math.PI % (2 * Math.PI); // angle around the Y axis, in ZX plane, zero yaw is facing along Z axis
        this.pitch = (1 + mousePos[1]) * Math.PI / 2; // angle between Y axis and position vector, zero pitch is facing along Y axis
    }
    updatePositionOrbitCam(mousePos, keys) {
        const positionYaw = this.yaw + Math.PI; // The camera is always looking at the center, so positional Yaw is the opposite of viewing Yaw
        const positionPitch = Math.PI - this.pitch; // Same for pitch

        // Update center position
        if (keys["w"]) { // Forward
            this.center[0] += this.speed * Math.sin(this.yaw);
            this.center[2] += this.speed * Math.cos(this.yaw);
        }
        if (keys["s"]) { // Backward
            this.center[0] -= this.speed * Math.sin(this.yaw);
            this.center[2] -= this.speed * Math.cos(this.yaw);
        }
        if (keys["a"]) { // Left
            this.center[0] += this.speed * Math.cos(this.yaw);
            this.center[2] -= this.speed * Math.sin(this.yaw);
        }
        if (keys["d"]) { // Right
            this.center[0] -= this.speed * Math.cos(this.yaw);
            this.center[2] += this.speed * Math.sin(this.yaw);
        }
        if (keys[" "]) { // Up
            this.center[1] += this.speed;
        }
        if (keys["control"]) { // Down
            this.center[1] -= this.speed;
        }

        // Update camera position
        this.position[0] = this.center[0] + this.orbitRadius * Math.sin(positionYaw) * Math.sin(positionPitch);
        this.position[1] = this.center[1] + this.orbitRadius * Math.cos(positionPitch);
        this.position[2] = this.center[2] + this.orbitRadius * Math.cos(positionYaw) * Math.sin(positionPitch);
    }
    updateMatricesOrbitCam() {
        this.viewMatrix = mat4.lookAt(this.position, this.center, [0, 1, 0]);
        this.projectionMatrix = mat4.perspective(this.fov, this.aspect, this.near, this.far);
    }


    toggleOrbitCam() {
        if (this.orbitCam) {
            this.update = this.updateFPV;
            this.orbitCam = false;
        } else {
            // Make sure the camera is looking along the same FPV direction
            this.center[0] = this.position[0] + this.orbitRadius * Math.sin(this.yaw) * Math.sin(this.pitch);
            this.center[1] = this.position[1] + this.orbitRadius * Math.cos(this.pitch);
            this.center[2] = this.position[2] + this.orbitRadius * Math.cos(this.yaw) * Math.sin(this.pitch);
            this.update = this.updateOrbitCam;
            this.orbitCam = true;
        }
    }
}