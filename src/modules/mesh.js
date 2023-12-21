function Vertex() {
    return {
        position: [0, 0, 0],
        uv: [0, 0],
        normal: [0, 0, 0]
    }
}

export class Mesh {
    constructor(GL, path) {
        this.GL = GL;
        this.path = path;
        this.vertices = [];
        this.indices = [];

        this.vao = GL.createVertexArray();
        this.vbo = GL.createBuffer();
        this.ebo = GL.createBuffer();

        if (path) {
            this.parse(); // Parses an obj file and also calls setup()
        }
    }

    parse() {
        // Read the obj file and load the data into the vertices and indices arrays
        const request = new XMLHttpRequest();
        request.open('GET', this.path);
        request.send();

        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.status === 200) {
                const lines = request.responseText.split('\n');
                const positions = [];
                const uvs = [];
                const normals = [];
                const indices = [];
                const vertexMap = new Map();
                const vertexList = [];

                for (let line of lines) {
                    line = line.trim();
                    const tokens = line.split(/\s+/);
                    switch (tokens[0]) {
                        case 'v':
                            positions.push([parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])]);
                            break;
                        case 'vt':
                            uvs.push([parseFloat(tokens[1]), parseFloat(tokens[2])]);
                            break;
                        case 'vn':
                            normals.push([parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])]);
                            break;
                        case 'f':
                            const firstKey = tokens[1];
                            if (!vertexMap.has(firstKey)) {
                                const firstVertex = tokens[1].split('/');
                                vertexMap.set(firstKey, vertexList.length);
                                vertexList.push(Vertex());
                                vertexList[vertexList.length - 1].position = positions[parseInt(firstVertex[0]) - 1];
                                vertexList[vertexList.length - 1].uv = uvs[parseInt(firstVertex[1]) - 1];
                                vertexList[vertexList.length - 1].normal = normals[parseInt(firstVertex[2]) - 1];
                            }

                            var previousKey = tokens[2];
                            if (!vertexMap.has(previousKey)) {
                                const previousVertex = tokens[2].split('/');
                                vertexMap.set(previousKey, vertexList.length);
                                vertexList.push(Vertex());
                                vertexList[vertexList.length - 1].position = positions[parseInt(previousVertex[0]) - 1];
                                vertexList[vertexList.length - 1].uv = uvs[parseInt(previousVertex[1]) - 1];
                                vertexList[vertexList.length - 1].normal = normals[parseInt(previousVertex[2]) - 1];
                            }

                            for (let i = 3; i < tokens.length; i++) {
                                const key = tokens[i];
                                if (!vertexMap.has(key)) {
                                    const vertex = tokens[i].split('/');
                                    vertexMap.set(key, vertexList.length);
                                    vertexList.push(Vertex());
                                    vertexList[vertexList.length - 1].position = positions[parseInt(vertex[0]) - 1];
                                    vertexList[vertexList.length - 1].uv = uvs[parseInt(vertex[1]) - 1];
                                    vertexList[vertexList.length - 1].normal = normals[parseInt(vertex[2]) - 1];
                                }

                                // Triangle Fan
                                indices.push(vertexMap.get(firstKey));
                                indices.push(vertexMap.get(previousKey));
                                indices.push(vertexMap.get(key));
                                previousKey = key;
                            }
                            break;
                        default:
                            break;
                    }
                }
                this.vertices = new Float32Array(vertexList.length * 8);
                this.indices = new Uint16Array(indices.length);
                for (let i = 0; i < vertexList.length; i++) {
                    this.vertices[i * 8 + 0] = vertexList[i].position[0];
                    this.vertices[i * 8 + 1] = vertexList[i].position[1];
                    this.vertices[i * 8 + 2] = vertexList[i].position[2];
                    this.vertices[i * 8 + 3] = vertexList[i].uv[0];
                    this.vertices[i * 8 + 4] = vertexList[i].uv[1];
                    this.vertices[i * 8 + 5] = vertexList[i].normal[0];
                    this.vertices[i * 8 + 6] = vertexList[i].normal[1];
                    this.vertices[i * 8 + 7] = vertexList[i].normal[2];
                }
                for (let i = 0; i < indices.length; i++) {
                    this.indices[i] = indices[i];
                }
                // console.log("VAO data", this.vertices);
                // console.log("EBO data", this.indices);
                console.log("Finished parsing")
                this.setup();
            }
        }

    }

    setup() {
        const GL = this.GL;
        // VAO : Vertex Array Object
        GL.bindVertexArray(this.vao);
        // VBO : Vertices
        GL.bindBuffer(GL.ARRAY_BUFFER, this.vbo);
        GL.bufferData(GL.ARRAY_BUFFER, this.vertices, GL.STATIC_DRAW);
        // EBO : Indices
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.ebo);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, this.indices, GL.STATIC_DRAW);
        // Position
        GL.enableVertexAttribArray(0); // aPosition
        GL.vertexAttribPointer(0, 3, GL.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 0);
        // UV
        GL.enableVertexAttribArray(1); // aTexCoord
        GL.vertexAttribPointer(1, 2, GL.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        // Normal
        GL.enableVertexAttribArray(2); // aNormal
        GL.vertexAttribPointer(2, 3, GL.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT);

        GL.bindVertexArray(null);
    }

    draw() {
        const GL = this.GL;
        // shader.use();
        // GL.activeTexture(GL.TEXTURE0);
        // GL.uniform1i(GL.getUniformLocation(shader.program, "uTexture"), 0);
        // GL.bindTexture(GL.TEXTURE_2D, this.texture);

        // Bind the vertex array object
        GL.bindVertexArray(this.vao);
        // Bind the element buffer object
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.ebo);
        // Draw the trianGLes
        GL.drawElements(GL.TRIANGLES, this.indices.length, GL.UNSIGNED_INT, 0);
        // GL.drawElements(GL.TRIANGLES, this.indices.length, GL.UNSIGNED_SHORT, 0);
        GL.bindVertexArray(null);

    }
}

export class Sphere extends Mesh {
    constructor(GL, numDivisionsLat, numDivisionsLong) {
        super(GL, null);
        this.loadDefaultSphere(numDivisionsLat, numDivisionsLong);
        this.setup();
    }
    loadDefaultSphere(numDivisionsLat, numDivisionsLong) { // Unit sphere
        const positions = [];
        const uvs = [];
        const normals = [];
        const indices = [];
        const vertexList = [];

        const radius = 1.0;

        for (let latNumber = 0; latNumber <= numDivisionsLat; latNumber++) {
            const theta = latNumber * Math.PI / numDivisionsLat;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let longNumber = 0; longNumber <= numDivisionsLong; longNumber++) {
                const phi = longNumber * 2 * Math.PI / numDivisionsLong;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = sinPhi * sinTheta;
                const y = cosTheta;
                const z = cosPhi * sinTheta;
                const u = (longNumber / numDivisionsLong);
                const v = 1 - (latNumber / numDivisionsLat);

                positions.push([radius * x, radius * y, radius * z]);
                uvs.push([u, v]);
                normals.push([x, y, z]);
            }
        }

        for (let latNumber = 0; latNumber < numDivisionsLat; latNumber++) {
            for (let longNumber = 0; longNumber < numDivisionsLong; longNumber++) {
                const first = (latNumber * (numDivisionsLong + 1)) + longNumber;
                const second = first + numDivisionsLong + 1;

                indices.push(first);
                indices.push(second);
                indices.push(first + 1);

                indices.push(second);
                indices.push(second + 1);
                indices.push(first + 1);
            }
        }

        for (let i = 0; i < positions.length; i++) {
            vertexList.push(Vertex());
            vertexList[i].position = positions[i];
            vertexList[i].uv = uvs[i];
            vertexList[i].normal = normals[i];
        }

        this.vertices = new Float32Array(vertexList.length * 8);
        this.indices = new Uint32Array(indices.length);
        for (let i = 0; i < vertexList.length; i++) {
            this.vertices[i * 8 + 0] = vertexList[i].position[0];
            this.vertices[i * 8 + 1] = vertexList[i].position[1];
            this.vertices[i * 8 + 2] = vertexList[i].position[2];
            this.vertices[i * 8 + 3] = vertexList[i].uv[0];
            this.vertices[i * 8 + 4] = vertexList[i].uv[1];
            this.vertices[i * 8 + 5] = vertexList[i].normal[0];
            this.vertices[i * 8 + 6] = vertexList[i].normal[1];
            this.vertices[i * 8 + 7] = vertexList[i].normal[2];
        }

        for (let i = 0; i < indices.length; i++) {
            this.indices[i] = indices[i];
        }

        // log the memory size of the vertices and indices
        // console.log("vertices size", this.vertices.length * 4 / 1024 / 1024, "MB"); // 4 bytes per float
        // console.log("indices size", this.indices.length * 2 / 1024 / 1024, "MB"); // 2 bytes per unsigned short

    }
}

export class Plane extends Mesh {
    constructor(GL, numDivisionsHeight, numDivisionsWidth) {
        super(GL, null);
        this.loadDefaultPlane(numDivisionsHeight, numDivisionsWidth);
        this.setup();
    }


    loadDefaultPlane(numDivisionsHeight, numDivisionsWidth) {
        // Creates a plane Y up
        const positions = [];
        const uvs = [];
        const normals = [];
        const indices = [];
        const vertexList = [];

        const width = 1.0;
        const height = 1.0;

        const widthStep = width / numDivisionsWidth;
        const heightStep = height / numDivisionsHeight;

        for (let i = 0; i <= numDivisionsHeight; i++) {
            for (let j = 0; j <= numDivisionsWidth; j++) {
                positions.push([-width / 2 + j * widthStep, 0, -height / 2 + i * heightStep]);
                uvs.push([j / numDivisionsWidth, i / numDivisionsHeight]);
                normals.push([0, 1, 0]);
            }
        }


        for (let i = 0; i < numDivisionsHeight; i++) {
            for (let j = 0; j < numDivisionsWidth; j++) {
                const first = (i * (numDivisionsWidth + 1)) + j;
                const second = first + numDivisionsWidth + 1;

                indices.push(first);
                indices.push(second);
                indices.push(first + 1);

                indices.push(second);
                indices.push(second + 1);
                indices.push(first + 1);
            }
        }

        for (let i = 0; i < positions.length; i++) {
            vertexList.push(Vertex());
            vertexList[i].position = positions[i];
            vertexList[i].uv = uvs[i];
            vertexList[i].normal = normals[i];
        }


        this.vertices = new Float32Array(vertexList.length * 8);
        this.indices = new Uint32Array(indices.length);


        for (let i = 0; i < vertexList.length; i++) {
            this.vertices[i * 8 + 0] = vertexList[i].position[0];
            this.vertices[i * 8 + 1] = vertexList[i].position[1];
            this.vertices[i * 8 + 2] = vertexList[i].position[2];
            this.vertices[i * 8 + 3] = vertexList[i].uv[0];
            this.vertices[i * 8 + 4] = vertexList[i].uv[1];
            this.vertices[i * 8 + 5] = vertexList[i].normal[0];
            this.vertices[i * 8 + 6] = vertexList[i].normal[1];
            this.vertices[i * 8 + 7] = vertexList[i].normal[2];
        }

        for (let i = 0; i < indices.length; i++) {
            this.indices[i] = indices[i];
        }

        // log the memory size of the vertices and indices
        // console.log("vertices size", this.vertices.length * 4 / 1024 / 1024, "MB"); // 4 bytes per float
        // console.log("indices size", this.indices.length * 2 / 1024 / 1024, "MB"); // 2 bytes per unsigned short
    }
}

export class Box extends Mesh {
    constructor(GL) {
        super(GL, null);
        this.loadBox();
        this.setup();
    }
    loadBox() {
        const positions = [];
        const normals = [];
        const vertexList = [];

        const width = 1.0;
        const height = 1.0;
        const depth = 1.0;

        // Front
        positions.push([-width / 2, -height / 2, depth / 2]);
        positions.push([width / 2, -height / 2, depth / 2]);
        positions.push([width / 2, height / 2, depth / 2]);
        positions.push([-width / 2, height / 2, depth / 2]);
        // Back
        positions.push([-width / 2, -height / 2, -depth / 2]);
        positions.push([width / 2, -height / 2, -depth / 2]);
        positions.push([width / 2, height / 2, -depth / 2]);
        positions.push([-width / 2, height / 2, -depth / 2]);
        // Right
        positions.push([width / 2, -height / 2, depth / 2]);
        positions.push([width / 2, -height / 2, -depth / 2]);
        positions.push([width / 2, height / 2, -depth / 2]);
        positions.push([width / 2, height / 2, depth / 2]);
        // Left
        positions.push([-width / 2, -height / 2, depth / 2]);
        positions.push([-width / 2, -height / 2, -depth / 2]);
        positions.push([-width / 2, height / 2, -depth / 2]);
        positions.push([-width / 2, height / 2, depth / 2]);
        // Top
        positions.push([-width / 2, height / 2, depth / 2]);
        positions.push([width / 2, height / 2, depth / 2]);
        positions.push([width / 2, height / 2, -depth / 2]);
        positions.push([-width / 2, height / 2, -depth / 2]);
        // Bottom
        positions.push([-width / 2, -height / 2, depth / 2]);
        positions.push([width / 2, -height / 2, depth / 2]);
        positions.push([width / 2, -height / 2, -depth / 2]);
        positions.push([-width / 2, -height / 2, -depth / 2]);

        const uvs = [
            // Front
            [1 / 4, 2 / 3],
            [2 / 4, 2 / 3],
            [2 / 4, 1 / 3],
            [1 / 4, 1 / 3],

            // Back
            [4 / 4, 2 / 3],
            [3 / 4, 2 / 3],
            [3 / 4, 1 / 3],
            [4 / 4, 1 / 3],

            // Right
            [2 / 4, 2 / 3],
            [3 / 4, 2 / 3],
            [3 / 4, 1 / 3],
            [2 / 4, 1 / 3],

            // Left
            [1 / 4, 2 / 3],
            [0 / 4, 2 / 3],
            [0 / 4, 1 / 3],
            [1 / 4, 1 / 3],

            // Top
            [1 / 4, 1 / 3],
            [2 / 4, 1 / 3],
            [2 / 4, 0 / 3],
            [1 / 4, 0 / 3],

            // Bottom
            [1 / 4, 2 / 3],
            [2 / 4, 2 / 3],
            [2 / 4, 3 / 3],
            [1 / 4, 3 / 3],
        ]

        // Front
        normals.push([0, 0, 1]);
        normals.push([0, 0, 1]);
        normals.push([0, 0, 1]);
        normals.push([0, 0, 1]);
        // Back
        normals.push([0, 0, -1]);
        normals.push([0, 0, -1]);
        normals.push([0, 0, -1]);
        normals.push([0, 0, -1]);
        // Right
        normals.push([1, 0, 0]);
        normals.push([1, 0, 0]);
        normals.push([1, 0, 0]);
        normals.push([1, 0, 0]);
        // Left
        normals.push([-1, 0, 0]);
        normals.push([-1, 0, 0]);
        normals.push([-1, 0, 0]);
        normals.push([-1, 0, 0]);
        // Top
        normals.push([0, 1, 0]);
        normals.push([0, 1, 0]);
        normals.push([0, 1, 0]);
        normals.push([0, 1, 0]);
        // Bottom
        normals.push([0, -1, 0]);
        normals.push([0, -1, 0]);
        normals.push([0, -1, 0]);
        normals.push([0, -1, 0]);

        const indices = [
            // Front
            0, 1, 2, 2, 3, 0,
            // Back
            6, 5, 4, 4, 7, 6,
            // Right
            8, 9, 10, 10, 11, 8,
            // Left
            14, 13, 12, 12, 15, 14,
            // Top
            16, 17, 18, 18, 19, 16,
            // Bottom
            22, 21, 20, 20, 23, 22
        ];

        for (let i = 0; i < positions.length; i++) {
            vertexList.push(Vertex());
            vertexList[i].position = positions[i];
            vertexList[i].uv = uvs[i];
            vertexList[i].normal = normals[i];
        }

        this.vertices = new Float32Array(vertexList.length * 8);
        this.indices = new Uint32Array(indices.length);

        for (let i = 0; i < vertexList.length; i++) {
            this.vertices[i * 8 + 0] = vertexList[i].position[0];
            this.vertices[i * 8 + 1] = vertexList[i].position[1];
            this.vertices[i * 8 + 2] = vertexList[i].position[2];
            this.vertices[i * 8 + 3] = vertexList[i].uv[0];
            this.vertices[i * 8 + 4] = vertexList[i].uv[1];
            this.vertices[i * 8 + 5] = vertexList[i].normal[0];
            this.vertices[i * 8 + 6] = vertexList[i].normal[1];
            this.vertices[i * 8 + 7] = vertexList[i].normal[2];
        }

        for (let i = 0; i < indices.length; i++) {
            this.indices[i] = indices[i];
        }

        // log the memory size of the vertices and indices
        // console.log("vertices size", this.vertices.length * 4 / 1024 / 1024, "MB"); // 4 bytes per float
        // console.log("indices size", this.indices.length * 2 / 1024 / 1024, "MB"); // 2 bytes per unsigned short
    }
}

export class CornellBox extends Mesh {
    constructor(GL) {
        super(GL, null);
        this.loadBox();
        this.setup();
    }

    loadBox() {
        const positions = [];
        const normals = [];
        const vertexList = [];

        const width = 1.0;
        const height = 1.0;
        const depth = 1.0;

        // Front
        positions.push([-width / 2, -height / 2, depth / 2]);
        positions.push([width / 2, -height / 2, depth / 2]);
        positions.push([width / 2, height / 2, depth / 2]);
        positions.push([-width / 2, height / 2, depth / 2]);
        // Back
        positions.push([-width / 2, -height / 2, -depth / 2]);
        positions.push([width / 2, -height / 2, -depth / 2]);
        positions.push([width / 2, height / 2, -depth / 2]);
        positions.push([-width / 2, height / 2, -depth / 2]);
        // Right
        positions.push([width / 2, -height / 2, depth / 2]);
        positions.push([width / 2, -height / 2, -depth / 2]);
        positions.push([width / 2, height / 2, -depth / 2]);
        positions.push([width / 2, height / 2, depth / 2]);
        // Left
        positions.push([-width / 2, -height / 2, depth / 2]);
        positions.push([-width / 2, -height / 2, -depth / 2]);
        positions.push([-width / 2, height / 2, -depth / 2]);
        positions.push([-width / 2, height / 2, depth / 2]);
        // Top
        positions.push([-width / 2, height / 2, depth / 2]);
        positions.push([width / 2, height / 2, depth / 2]);
        positions.push([width / 2, height / 2, -depth / 2]);
        positions.push([-width / 2, height / 2, -depth / 2]);
        // Bottom
        positions.push([-width / 2, -height / 2, depth / 2]);
        positions.push([width / 2, -height / 2, depth / 2]);
        positions.push([width / 2, -height / 2, -depth / 2]);
        positions.push([-width / 2, -height / 2, -depth / 2]);

        const uvs = [
            // Front
            [1 / 4, 2 / 3],
            [2 / 4, 2 / 3],
            [2 / 4, 1 / 3],
            [1 / 4, 1 / 3],

            // Back
            [4 / 4, 2 / 3],
            [3 / 4, 2 / 3],
            [3 / 4, 1 / 3],
            [4 / 4, 1 / 3],

            // Right
            [2 / 4, 2 / 3],
            [3 / 4, 2 / 3],
            [3 / 4, 1 / 3],
            [2 / 4, 1 / 3],

            // Left
            [1 / 4, 2 / 3],
            [0 / 4, 2 / 3],
            [0 / 4, 1 / 3],
            [1 / 4, 1 / 3],

            // Top
            [1 / 4, 1 / 3],
            [2 / 4, 1 / 3],
            [2 / 4, 0 / 3],
            [1 / 4, 0 / 3],

            // Bottom
            [1 / 4, 2 / 3],
            [2 / 4, 2 / 3],
            [2 / 4, 3 / 3],
            [1 / 4, 3 / 3],
        ]

        // Front
        normals.push([0, 0, -1]);
        normals.push([0, 0, -1]);
        normals.push([0, 0, -1]);
        normals.push([0, 0, -1]);
        // Back
        normals.push([0, 0, 1]);
        normals.push([0, 0, 1]);
        normals.push([0, 0, 1]);
        normals.push([0, 0, 1]);
        // Right
        normals.push([-1, 0, 0]);
        normals.push([-1, 0, 0]);
        normals.push([-1, 0, 0]);
        normals.push([-1, 0, 0]);
        // Left
        normals.push([1, 0, 0]);
        normals.push([1, 0, 0]);
        normals.push([1, 0, 0]);
        normals.push([1, 0, 0]);
        // Top
        normals.push([0, -1, 0]);
        normals.push([0, -1, 0]);
        normals.push([0, -1, 0]);
        normals.push([0, -1, 0]);
        // Bottom
        normals.push([0, 1, 0]);
        normals.push([0, 1, 0]);
        normals.push([0, 1, 0]);
        normals.push([0, 1, 0]);

        const indices = [
            // Front
            // 2, 1, 0, 0, 3, 2, // Let the box be open from the front
            // Back
            4, 5, 6, 6, 7, 4,
            // Right
            10, 9, 8, 8, 11, 10,
            // Left
            12, 13, 14, 14, 15, 12,
            // Top
            18, 17, 16, 16, 19, 18,
            // Bottom
            20, 21, 22, 22, 23, 20
        ];

        for (let i = 0; i < positions.length; i++) {
            vertexList.push(Vertex());
            vertexList[i].position = positions[i];
            vertexList[i].uv = uvs[i];
            vertexList[i].normal = normals[i];
        }

        this.vertices = new Float32Array(vertexList.length * 8);
        this.indices = new Uint32Array(indices.length);

        for (let i = 0; i < vertexList.length; i++) {
            this.vertices[i * 8 + 0] = vertexList[i].position[0];
            this.vertices[i * 8 + 1] = vertexList[i].position[1];
            this.vertices[i * 8 + 2] = vertexList[i].position[2];
            this.vertices[i * 8 + 3] = vertexList[i].uv[0];
            this.vertices[i * 8 + 4] = vertexList[i].uv[1];
            this.vertices[i * 8 + 5] = vertexList[i].normal[0];
            this.vertices[i * 8 + 6] = vertexList[i].normal[1];
            this.vertices[i * 8 + 7] = vertexList[i].normal[2];
        }

        for (let i = 0; i < indices.length; i++) {
            this.indices[i] = indices[i];
        }

        // log the memory size of the vertices and indices
        // console.log("vertices size", this.vertices.length * 4 / 1024 / 1024, "MB"); // 4 bytes per float
        // console.log("indices size", this.indices.length * 2 / 1024 / 1024, "MB"); // 2 bytes per unsigned short
    }
}