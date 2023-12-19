export var mat4 = {
	identity: function () {
		var out = new Float32Array(16);
		out[0] = 1;
		out[5] = 1;
		out[10] = 1;
		out[15] = 1;
		return out;
	},

	lookAt: function (eye, center, up) {
		// y axis is up
		var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
			eyex = eye[0],
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

		var out = new Float32Array(16);
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
		return out;
	},

	lookAtRPY: function (eye, roll, pitch, yaw) {
		var out = new Float32Array(16),
			r = roll,
			p = pitch,
			y = yaw,
			sinr = Math.sin(r),
			cosr = Math.cos(r),
			sinp = Math.sin(p),
			cosp = Math.cos(p),
			siny = Math.sin(y),
			cosy = Math.cos(y);

		var Z = [-sinp * siny, -cosp, -sinp * cosy];
		var UP = [-sinr*cosy, cosr, sinr*siny];
		var X = vec3.cross(UP, Z);
		var X = vec3.normalize(X);
		var Y = vec3.cross(Z, X);
		var Y = vec3.normalize(Y);

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
		
		// Commented code is for zero roll => y axis is up
		// out[0] = -cosy;
		// out[1] = -siny * cosp;
		// out[2] = -siny * sinp;
		// out[3] = 0;

		// out[4] = 0;
		// out[5] = sinp;
		// out[6] = -cosp;
		// out[7] = 0;

		// out[8] = siny;
		// out[9] = -cosy * cosp;
		// out[10] = -cosy * sinp;
		// out[11] = 0;

		out[12] = -eye[0] * out[0] - eye[1] * out[4] - eye[2] * out[8];
		out[13] = -eye[0] * out[1] - eye[1] * out[5] - eye[2] * out[9];
		out[14] = -eye[0] * out[2] - eye[1] * out[6] - eye[2] * out[10];
		out[15] = 1;

		return out;
	},

	orthographic: function (left, right, bottom, top, near, far) {
		var out = new Float32Array(16),
			lr = 1 / (left - right),
			bt = 1 / (bottom - top),
			nf = 1 / (near - far);
		out[0] = -2 * lr;
		out[5] = -2 * bt;
		out[10] = 2 * nf;
		out[12] = (left + right) * lr;
		out[13] = (top + bottom) * bt;
		out[14] = (far + near) * nf;
		return out;
	},

	perspective: function (fovy, aspect, near, far) {
		var out = new Float32Array(16),
			f = 1.0 / Math.tan(fovy / 2),
			nf = 1 / (near - far);
		out[0] = f / aspect;
		out[5] = f;
		out[10] = (far + near) * nf;
		out[11] = -1;
		out[14] = (2 * far * near) * nf;
		return out;
	},

	rotateX: function (angle) {
		var out = new Float32Array(16),
			s = Math.sin(angle),
			c = Math.cos(angle);
		out[0] = 1;
		out[15] = 1;
		out[5] = c;
		out[10] = c;
		out[9] = -s;
		out[6] = s;
		return out;
	},

	rotateY: function (angle) {
		var out = new Float32Array(16),
			s = Math.sin(angle),
			c = Math.cos(angle);
		out[5] = 1;
		out[15] = 1;
		out[0] = c;
		out[2] = -s;
		out[8] = s;
		out[10] = c;
		return out;
	},

	rotateZ: function (angle) {
		var out = new Float32Array(16),
			s = Math.sin(angle),
			c = Math.cos(angle);
		out[10] = 1;
		out[15] = 1;
		out[0] = c;
		out[1] = s;
		out[4] = -s;
		out[5] = c;
		return out;
	},

	scale: function (x, y, z) {
		if (y === undefined) {
			y = x;
		}
		if (z === undefined) {
			z = x;
		}
		var out = new Float32Array(16);
		out[0] = x;
		out[5] = y;
		out[10] = z;
		out[15] = 1;
		return out;
	},

	translate: function (x, y, z) {
		var out = new Float32Array(16);
		out[0] = 1;
		out[5] = 1;
		out[10] = 1;
		out[12] = x;
		out[13] = y;
		out[14] = z;
		out[15] = 1;
		return out;
	},

	multiplyMat: function (a, b) {
		var out = new Float32Array(16),
			a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
			a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
			a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
			a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],
			b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];

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
	},

	multiplyVec: function (mat, vec) {
		var out = new Float32Array(4),
			x = vec[0], y = vec[1], z = vec[2], w = vec[3];
		out[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12] * w;
		out[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13] * w;
		out[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14] * w;
		out[3] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15] * w;
		return out;
	},

	toMat3: function (a) {
		var out = new Float32Array(9);
		out[0] = a[0];
		out[1] = a[1];
		out[2] = a[2];
		out[3] = a[4];
		out[4] = a[5];
		out[5] = a[6];
		out[6] = a[8];
		out[7] = a[9];
		out[8] = a[10];
		return out;
	}
};

export var mat3 = {
	identity: function () {
		var out = new Float32Array(9);
		out[0] = 1;
		out[4] = 1;
		out[8] = 1;
		return out;
	},

	transpose: function (a) {
		var out = new Float32Array(9);
		out[0] = a[0];
		out[1] = a[3];
		out[2] = a[6];
		out[3] = a[1];
		out[4] = a[4];
		out[5] = a[7];
		out[6] = a[2];
		out[7] = a[5];
		out[8] = a[8];
		return out;
	},

	inverse: function (a) {
		var a00 = a[0], a01 = a[1], a02 = a[2],
			a10 = a[3], a11 = a[4], a12 = a[5],
			a20 = a[6], a21 = a[7], a22 = a[8],

			b00 = a22 * a11 - a12 * a21,
			b01 = -a22 * a10 + a12 * a20,
			b02 = a21 * a10 - a11 * a20,

			d = a00 * b00 + a01 * b01 + a02 * b02,
			id;

		if (!d) {
			console.log("Matrix not invertible.");
			return null;
		}
		id = 1 / d;

		var out = new Float32Array(9);
		out[0] = b00 * id;
		out[1] = (-a22 * a01 + a02 * a21) * id;
		out[2] = (a12 * a01 - a02 * a11) * id;
		out[3] = b01 * id;
		out[4] = (a22 * a00 - a02 * a20) * id;
		out[5] = (-a12 * a00 + a02 * a10) * id;
		out[6] = b02 * id;
		out[7] = (-a21 * a00 + a01 * a20) * id;
		out[8] = (a11 * a00 - a01 * a10) * id;
		return out;
	},

	modelToNormal: function (modelMatrix) {
		var out = new Float32Array(16);
		out = mat3.transpose(mat3.inverse(mat4.toMat3(modelMatrix)));
		return out;
	}
};

export var vec3 = {
	cross: function (a, b) {
		var out = new Float32Array(3);
		out[0] = a[1] * b[2] - a[2] * b[1];
		out[1] = a[2] * b[0] - a[0] * b[2];
		out[2] = a[0] * b[1] - a[1] * b[0];
		return out;
	},

	dot: function (a, b) {
		return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	},

	length: function (a) {
		return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
	},

	normalize: function (a) {
		var out = new Float32Array(3),
			x = a[0],
			y = a[1],
			z = a[2],
			len = x * x + y * y + z * z;
		if (len > 0) {
			len = 1 / Math.sqrt(len);
			out[0] = a[0] * len;
			out[1] = a[1] * len;
			out[2] = a[2] * len;
		}
		return out;
	}
};