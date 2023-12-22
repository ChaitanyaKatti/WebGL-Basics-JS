export class vec2 extends Float32Array {
	constructor(array) {
		if (array && array.length === 2) {
			super(array);
		}
		else {
			super([0.0, 0.0])
		}
	}
}


export class vec3 extends Float32Array {
	constructor(array) {
		if (array && array.length === 3) {
			super(array);
		}
		else {
			super(3);
		}
	}

	cross(vec) {
		const out = new Float32Array(3);
		out[0] = this[1] * vec[2] - this[2] * vec[1];
		out[1] = this[2] * vec[0] - this[0] * vec[2];
		out[2] = this[0] * vec[1] - this[1] * vec[0];
		return new vec3(out);
	}

	dot(vec) {
		return this[0] * vec[0] + this[1] * vec[1] + this[2] * vec[2];
	}

	mag() {
		return Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]);
	}

	normalize() {
		const out = new vec3();
		const len = this.mag();
		if (len > 0) { // Check if magnitude not equal to zero
			const invlen = 1 / len;
			out[0] = this[0] * invlen;
			out[1] = this[1] * invlen;
			out[2] = this[2] * invlen;
		}
		return out;
	}
}


export class vec4 extends Float32Array {
	constructor(array) {
		if (array && array.length === 4) {
			super(array)
		}
		else {
			super(4);
		}
	}

	toVec3() {
		return new vec3([this[0], this[1], this[2]])
	}
}


export class mat3 extends Float32Array {
	constructor(array) {
		if (array && array.length === 9) {
			super(array);
		}
		else {
			super(9);
			this[0] = 1.0;
			this[4] = 1.0;
			this[8] = 1.0;
		}
	}

	transpose() {
		const out = new Float32Array(9);
		out[0] = this[0];
		out[1] = this[3];
		out[2] = this[6];
		out[3] = this[1];
		out[4] = this[4];
		out[5] = this[7];
		out[6] = this[2];
		out[7] = this[5];
		out[8] = this[8];

		return new mat3(out);
	}

	inverse() {
		const out = new Float32Array(9);

		const a00 = this[0], a01 = this[1], a02 = this[2],
			a10 = this[3], a11 = this[4], a12 = this[5],
			a20 = this[6], a21 = this[7], a22 = this[8],

			b00 = a22 * a11 - a12 * a21,
			b01 = -a22 * a10 + a12 * a20,
			b02 = a21 * a10 - a11 * a20,

			d = a00 * b00 + a01 * b01 + a02 * b02;

		if (!d) {
			console.log("Matrix not invertible.");
			return null;
		}

		const id = 1 / d;

		out[0] = b00 * id;
		out[1] = (-a22 * a01 + a02 * a21) * id;
		out[2] = (a12 * a01 - a02 * a11) * id;
		out[3] = b01 * id;
		out[4] = (a22 * a00 - a02 * a20) * id;
		out[5] = (-a12 * a00 + a02 * a10) * id;
		out[6] = b02 * id;
		out[7] = (-a21 * a00 + a01 * a20) * id;
		out[8] = (a11 * a00 - a01 * a10) * id;

		return new mat3(out);
	}
}


export class mat4 extends Float32Array {
	constructor(array) {
		if (array && array.length === 16) {
			super(array);
		}
		else {
			super(16);
			this[0] = 1.0;
			this[5] = 1.0;
			this[10] = 1.0;
			this[15] = 1.0;
		}
	}

	// Camera Related Methods
	lookAt(eye, center, up) {
		const out = new Float32Array(16);
		let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;

		const eyex = eye[0],
			eyey = eye[1],
			eyez = eye[2],
			upx = up[0],
			upy = up[1],
			upz = up[2],
			centerx = center[0],
			centery = center[1],
			centerz = center[2];

		z0 = eyex - centerx;
		z1 = eyey - centery;
		z2 = eyez - centerz;

		len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
		z0 *= len;
		z1 *= len;
		z2 *= len;

		x0 = upy * z2 - upz * z1;
		x1 = upz * z0 - upx * z2;
		x2 = upx * z1 - upy * z0;
		len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);

		if (!len) {
			x0 = 0;
			x1 = 0;
			x2 = 0;
		}
		else {
			len = 1 / len;
			x0 *= len;
			x1 *= len;
			x2 *= len;
		}

		y0 = z1 * x2 - z2 * x1;
		y1 = z2 * x0 - z0 * x2;
		y2 = z0 * x1 - z1 * x0;

		len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);

		if (!len) {
			y0 = 0;
			y1 = 0;
			y2 = 0;
		} else {
			len = 1 / len;
			y0 *= len;
			y1
		}

		out[0] = x0;
		out[1] = y0;
		out[2] = z0;
		out[3] = 0;

		out[4] = x1;
		out[5] = y1;
		out[6] = z1;
		out[7] = 0;

		out[8] = x2;
		out[9] = y2;
		out[10] = z2;
		out[11] = 0;

		out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
		out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
		out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
		out[15] = 1;
		return new mat4(out);
	}

	lookAtRPY(eye, roll, pitch, yaw) {
		const out = new Float32Array(16);
		const sinr = Math.sin(roll), cosr = Math.cos(roll),
			sinp = Math.sin(pitch), cosp = Math.cos(pitch),
			siny = Math.sin(yaw), cosy = Math.cos(yaw);

		const Z = [-sinp * siny, -cosp, -sinp * cosy];
		const UP = [-sinr * cosy, cosr, sinr * siny];
		const X = (new vec3(UP)).cross(Z).normalize();
		const Y = (new vec3(Z)).cross(X).normalize();

		out[0] = X[0];
		out[1] = Y[0];
		out[2] = Z[0];
		out[3] = 0;
		out[4] = X[1];
		out[5] = Y[1];
		out[6] = Z[1];
		out[7] = 0;
		out[8] = X[2];
		out[9] = Y[2];
		out[10] = Z[2];
		out[11] = 0;
		out[12] = -eye[0] * out[0] - eye[1] * out[4] - eye[2] * out[8];
		out[13] = -eye[0] * out[1] - eye[1] * out[5] - eye[2] * out[9];
		out[14] = -eye[0] * out[2] - eye[1] * out[6] - eye[2] * out[10];
		out[15] = 1;

		return new mat4(out);
	}

	orthographic(left, right, bottom, top, near, far) {
		const out = new Float32Array(16);
		const lr = 1 / (left - right),
			bt = 1 / (bottom - top),
			nf = 1 / (near - far);
		out[0] = -2 * lr;
		out[5] = -2 * bt;
		out[10] = 2 * nf;
		out[12] = (left + right) * lr;
		out[13] = (top + bottom) * bt;
		out[14] = (far + near) * nf;
		return new mat4(out)
	}

	perspective(fovy, aspect, near, far) {
		const out = new Float32Array(16);
		const f = 1.0 / Math.tan(fovy / 2),
			nf = 1 / (near - far);
		out[0] = f / aspect;
		out[5] = f;
		out[10] = (far + near) * nf;
		out[11] = -1;
		out[14] = (2 * far * near) * nf;
		return new mat4(out)
	}

	modelToNormal() {
		return this.toMat3().inverse().transpose()
	}

	// Model Matrix Related Methods
	scale(x, y, z) {
		if (y === undefined) {
			y = x;
		}
		if (z === undefined) {
			z = x;
		}
		const out = new mat4();
		out[0] = x;
		out[5] = y;
		out[10] = z;
		return out.multiplyMat(this);
	}

	translate(x, y, z) {
		const out = new mat4();
		out[12] = x;
		out[13] = y;
		out[14] = z;
		return out.multiplyMat(this);
	}

	rotateX(angle) {
		const out = new mat4();
		const s = Math.sin(angle),
			c = Math.cos(angle);
		out[0] = 1;
		out[15] = 1;
		out[5] = c;
		out[10] = c;
		out[9] = -s;
		out[6] = s;
		return out.multiplyMat(this);
	}

	rotateY(angle) {
		const out = new mat4();
		const s = Math.sin(angle),
			c = Math.cos(angle);
		out[5] = 1;
		out[15] = 1;
		out[0] = c;
		out[2] = -s;
		out[8] = s;
		out[10] = c;
		return out.multiplyMat(this);
	}

	rotateZ(angle) {
		const out = new mat4();
		const s = Math.sin(angle),
			c = Math.cos(angle);
		out[10] = 1;
		out[15] = 1;
		out[0] = c;
		out[1] = s;
		out[4] = -s;
		out[5] = c;
		return out.multiplyMat(this);
	}

	rotateAxis(angle, axis) {
		axis = (new vec3(axis)).normalize();
		const x = axis[0], y = axis[1], z = axis[2],
			c = Math.cos(angle), s = Math.sin(angle);

		const rotationMatrix = new mat4();
		rotationMatrix[0] = c + x * x * (1 - c);
		rotationMatrix[1] = y * x * (1 - c) + z * s;
		rotationMatrix[2] = z * x * (1 - c) - y * s;

		rotationMatrix[4] = x * y * (1 - c) - z * s;
		rotationMatrix[5] = c + y * y * (1 - c);
		rotationMatrix[6] = z * y * (1 - c) + x * s;

		rotationMatrix[8] = x * z * (1 - c) + y * s;
		rotationMatrix[9] = y * z * (1 - c) - x * s;
		rotationMatrix[10] = c + z * z * (1 - c);

		rotationMatrix[15] = 1;
		return rotationMatrix.multiplyMat(this);
	}

	selfScale(x, y, z) {
		if (y === undefined) {
			y = x;
		}
		if (z === undefined) {
			z = x;
		}
		const out = new mat4();
		out[0] = x;
		out[5] = y;
		out[10] = z;
		return this.multiplyMat(out);
	}

	selfTranslate(x, y, z) {
		const selfDisplacement = new vec4([x, y, z, 0.0]);
		const worldDisplacement = this.multiplyVec4(selfDisplacement);
		return this.translate(worldDisplacement[0], worldDisplacement[1], worldDisplacement[2])
	}

	selfRotateX(angle) {
		let out = new mat4(this);
		const selfXaxis = new vec4([1.0, 0.0, 0.0, 0.0]);
		const worldXaxis = this.multiplyVec4(selfXaxis).toVec3();
		out = out.rotateAxis(angle, worldXaxis);
		out[12] = this[12];
		out[13] = this[13];
		out[14] = this[14];
		return out;
	}

	selfRotateY(angle) {
		let out = new mat4(this);
		const selfYaxis = new vec4([0.0, 1.0, 0.0, 0.0]);
		const worldYaxis = this.multiplyVec4(selfYaxis).toVec3();
		out = out.rotateAxis(angle, worldYaxis);
		out[12] = this[12];
		out[13] = this[13];
		out[14] = this[14];
		return out;
	}

	selfRotateZ(angle) {
		let out = new mat4(this);
		const selfZaxis = new vec4([0.0, 0.0, 1.0, 0.0]);
		const worldZaxis = this.multiplyVec4(selfZaxis).toVec3();
		out = out.rotateAxis(angle, worldZaxis);
		out[12] = this[12];
		out[13] = this[13];
		out[14] = this[14];
		return out;
	}

	// Basic Matrix math
	multiplyMat(b) {
		const out = new mat4();

		const a00 = this[0], a01 = this[1], a02 = this[2], a03 = this[3],
			a10 = this[4], a11 = this[5], a12 = this[6], a13 = this[7],
			a20 = this[8], a21 = this[9], a22 = this[10], a23 = this[11],
			a30 = this[12], a31 = this[13], a32 = this[14], a33 = this[15];

		let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];

		out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

		b0 = b[4];
		b1 = b[5];
		b2 = b[6];
		b3 = b[7];
		out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

		b0 = b[8];
		b1 = b[9];
		b2 = b[10];
		b3 = b[11];
		out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

		b0 = b[12];
		b1 = b[13];
		b2 = b[14];
		b3 = b[15];
		out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
		out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
		out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
		out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

		return out;
	}

	multiplyVec4(vec) {
		const out = new vec4();
		const x = vec[0], y = vec[1], z = vec[2], w = vec[3];
		out[0] = this[0] * x + this[4] * y + this[8] * z + this[12] * w;
		out[1] = this[1] * x + this[5] * y + this[9] * z + this[13] * w;
		out[2] = this[2] * x + this[6] * y + this[10] * z + this[14] * w;
		out[3] = this[3] * x + this[7] * y + this[11] * z + this[15] * w;

		return out;
	}

	inverse() {
		const out = new mat4();
		const a00 = this[0], a01 = this[1], a02 = this[2], a03 = this[3],
			a10 = this[4], a11 = this[5], a12 = this[6], a13 = this[7],
			a20 = this[8], a21 = this[9], a22 = this[10], a23 = this[11],
			a30 = this[12], a31 = this[13], a32 = this[14], a33 = this[15],

			b00 = a00 * a11 - a01 * a10,
			b01 = a00 * a12 - a02 * a10,
			b02 = a00 * a13 - a03 * a10,
			b03 = a01 * a12 - a02 * a11,
			b04 = a01 * a13 - a03 * a11,
			b05 = a02 * a13 - a03 * a12,
			b06 = a20 * a31 - a21 * a30,
			b07 = a20 * a32 - a22 * a30,
			b08 = a20 * a33 - a23 * a30,
			b09 = a21 * a32 - a22 * a31,
			b10 = a21 * a33 - a23 * a31,
			b11 = a22 * a33 - a23 * a32,

			d = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

		if (!d) {
			console.log("Matrix not invertible.");
			return null;
		}

		const id = 1 / d;

		out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * id;
		out[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * id;
		out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * id;
		out[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * id;
		out[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * id;
		out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * id;
		out[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * id;
		out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * id;
		out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * id;
		out[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * id;
		out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * id;
		out[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * id;
		out[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * id;
		out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * id;
		out[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * id;
		out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * id;

		return out;
	}

	toMat3() {
		const out = new mat3();
		out[0] = this[0];
		out[1] = this[1];
		out[2] = this[2];
		out[3] = this[4];
		out[4] = this[5];
		out[5] = this[6];
		out[6] = this[8];
		out[7] = this[9];
		out[8] = this[10];
		return out;
	}
}