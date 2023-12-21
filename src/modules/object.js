import { mat3 } from "./matrix.js";

export class Object {
    constructor(mesh, textures, shader, modelMatrix) {
        this.mesh = mesh;
        this.textures = textures; // List of texture
        this.shader = shader;
        this.modelMatrix = modelMatrix;
        this.receiveShadow = true
    }

    draw() {
        this.textures.map((x) => x.bind())
        this.shader.setUniform('uModelMatrix', this.modelMatrix, 'mat4');
        this.shader.setUniform('uNormalMatrix', mat3.modelToNormal(this.modelMatrix), 'mat3');
        this.shader.setUniform('receiveShadow', this.receiveShadow, 'bool')
        this.mesh.draw();
    }
}