var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'uniform mat4 u_xformMatrix;\n' +
    'void main() {\n' +
    ' gl_Position = u_xformMatrix * a_Position;\n' +
    '}\n';
var FSHADER_SOURCE =
    'void main() {\n' +
    ' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '}\n';

function main() {
    var canvas = document.getElementById('webgl');
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders');
        return;
    }
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }
    var xformMatrix = new Matrix4();
    var ANGLE = 90;
    xformMatrix.setRotate(ANGLE, 0, 0, 1);
    var u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
    if (!u_xformMatrix) {
        console.log('Failed to get the storage location of u_xformMatrix');
        return;
    }
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        0, 0.5, -0.5, -0.5, 0.5, -0.5
    ])
    var n = 3;
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return false;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    return n;
}