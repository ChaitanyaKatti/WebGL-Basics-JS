export class Texture {
    constructor(GL, index, path) {
        this.GL = GL;
        this.path = path;
        this.index = index;
        this.texture = GL.createTexture();
        this.image = new Image();
        
        this.loadDefault(); // load default texture first, then load from source if path is provided, because the image.onload function is asynchronous
        if (path) {
            this.image.src = this.path;
            this.image.onload = () => {
                this.loadFromSource();
            }
        }
    }

    loadFromSource() {
        const GL = this.GL;
        // Flip the image's Y axis to match the WebGL texture coordinate space
        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
        // Bind the texture object to the target (TEXTURE_2D) of the active texture unit.
        GL.activeTexture(GL.TEXTURE0 + this.index);
        GL.bindTexture(GL.TEXTURE_2D, this.texture);
        // Send the image data to the texture object
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, this.image);
        // Mipmapping
        GL.generateMipmap(GL.TEXTURE_2D);
        // Texture filtering
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
        // UV wrapping
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.REPEAT); // u
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.REPEAT); // v
        // Unbind the texture object
        GL.bindTexture(GL.TEXTURE_2D, null);
    }

    loadDefault() {
        // Deafult textrue is a checkerboard pattern of size 2^repeatCount x 2^repeatCount
        // Minimum texture size must be 4x4 for mipmapping to work

        const GL = this.GL;
        var defaultImg = [];

        const repeatCount = 5; // should be strictly greater than 1 for mipmapping to work
        const subRepateCount = repeatCount - 3;
        const subRepeatBrightness = 0.8;
        var pattern = [255, 220]

        for (var i = 0; i < 2 ** repeatCount; i++) {
            var brightness = (i % (2 ** (subRepateCount + 1))) < (2 ** subRepateCount) ? subRepeatBrightness : 1.0;
            for (var j = 0; j < 2 ** (repeatCount - subRepateCount); j++) {
                for (var k = 0; k < 2 ** (subRepateCount - 1); k++) {
                    defaultImg.push(brightness * pattern[0], brightness * pattern[1]);
                }
                brightness = 1 + subRepeatBrightness - brightness;
            }
            pattern = pattern.reverse();
        }

        defaultImg = new Uint8Array(defaultImg);

        // Flip the image's Y axis to match the WebGL texture coordinate space
        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
        // Bind the texture object to the target (TEXTURE_2D) of the active texture unit.
        GL.activeTexture(GL.TEXTURE0 + this.index);
        GL.bindTexture(GL.TEXTURE_2D, this.texture);
        // Send the image data to the texture object
        GL.texImage2D(
            GL.TEXTURE_2D,
            0,                // mip level
            GL.LUMINANCE,     // internal format
            2 ** repeatCount, // width
            2 ** repeatCount, // height
            0,                // border
            GL.LUMINANCE,     // format
            GL.UNSIGNED_BYTE, // type
            defaultImg        // data
        );
        // Mipmapping
        GL.generateMipmap(GL.TEXTURE_2D);
        // Texture filtering
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
        // UV wrapping
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.REPEAT); // u
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.REPEAT); // v
        // Unbind the texture object
        GL.bindTexture(GL.TEXTURE_2D, null);
    }

    bind() {
        this.GL.activeTexture(this.GL.TEXTURE0 + this.index);
        this.GL.bindTexture(this.GL.TEXTURE_2D, this.texture);
    }
}