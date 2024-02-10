import { mat3 } from "./matrix.js";

export class Object {
    constructor(mesh, textures, shader, modelMatrix) {
        this.mesh = mesh;
        this.textures = textures; // List of texture
        this.shader = shader; // shader object
        this.modelMatrix = modelMatrix; // mat4
        this.receiveShadow = true
    }

    draw() {
        this.shader.use();
        this.textures.map((x) => x.bind())
        this.shader.setUniform('uModelMatrix', this.modelMatrix, 'mat4');
        this.shader.setUniform('uNormalMatrix', this.modelMatrix.modelToNormal(), 'mat3');
        this.shader.setUniform('receiveShadow', this.receiveShadow, 'bool')
        this.mesh.draw();
    }
}