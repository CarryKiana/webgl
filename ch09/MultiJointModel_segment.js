var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Normal;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    ' gl_Position = u_MvpMatrix * a_Position;\n' +
    ' vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));\n' +
    ' vec4 color = vec4(1.0, 0.4, 0.0, 1.0);\n' +
    ' vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);\n' +
    ' float nDotL = max(dot(normal, lightDirection), 0.0);\n' +
    ' v_Color = vec4(color.rgb * nDotL + vec3(0.1), color.a);\n' +
    '}\n';

var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    ' gl_FragColor = v_Color;\n' +
    '}\n';

function main() {
    var canvas = document.getElementById('webgl');
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders');
        return;
    }

    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (a_Position < 0 || !u_MvpMatrix || !u_NormalMatrix) {
        console.log('Failed to get the storage location of attribute or uniform variable');
        return;
    }

    var viewProjMatrix = new Matrix4();
    viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
    viewProjMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    document.onkeydown = function (ev) {
        keydown(ev, gl, n, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
    };
    draw(gl, n, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
}

var ANGLE_STEP = 3.0;
var g_arm1Abgle = 90.0;
var g_joint1Angle = 45.0;
var g_joint2Angle = 0.0;
var g_joint3Angle = 0.0;

function keydown(ev, gl, o, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix) {
    switch (ev.keyCode) {
        case 40:
            if (g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP;
            break;
        case 38:
            if (g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP;
            break;
        case 39:
            g_arm1Abgle = (g_arm1Abgle + ANGLE_STEP) % 360;
            break;
        case 37:
            g_arm1Abgle = (g_arm1Abgle - ANGLE_STEP) % 360;
            break;
        case 90:
            g_joint2Angle = (g_joint2Angle + ANGLE_STEP) % 360;
            break;
        case 88:
            g_joint2Angle = (g_joint2Angle - ANGLE_STEP) % 360;
            break;
        case 86:
            if (g_joint3Angle < 60.0) g_joint3Angle = (g_joint3Angle + ANGLE_STEP) % 360;
            break;
        case 67:
            if (g_joint3Angle > -60.0) g_joint3Angle = (g_joint3Angle - ANGLE_STEP) % 360;
            break;
        default:
            return;
    }
    draw(gl, o, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
}

var g_baseBuffer = null;
var g_arm1Buffer = null;
var g_arm2Buffer = null;
var g_palmBuffer = null;
var g_fingerBuffer = null;

function initVertexBuffers(gl) {
    var vertices_base = new Float32Array([
        5.0, 2.0, 5.0, -5.0, 2.0, 5.0, -5.0, 0.0, 5.0, 5.0, 0.0, 5.0,
        5.0, 2.0, 5.0, 5.0, 0.0, 5.0, 5.0, 0.0, -5.0, 5.0, 2.0, -5.0,
        5.0, 2.0, 5.0, 5.0, 2.0, -5.0, -5.0, 2.0, -5.0, -5.0, 2.0, 5.0,
        -5.0, 2.0, 5.0, -5.0, 2.0, -5.0, -5.0, 0.0, -5.0, -5.0, 0.0, 5.0,
        -5.0, 0.0, -5.0, 5.0, 0.0, -5.0, 5.0, 0.0, 5.0, -5.0, 0.0, 5.0,
        5.0, 0.0, -5.0, -5.0, 0.0, -5.0, -5.0, 2.0, -5.0, 5.0, 2.0, -5.0
    ]);
    var vertices_arm1 = new Float32Array([
        1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5, 0.0, 1.5, 1.5, 0.0, 1.5,
        1.5, 10.0, 1.5, 1.5, 0.0, 1.5, 1.5, 0.0, -1.5, 1.5, 10.0, -1.5,
        1.5, 10.0, 1.5, 1.5, 10.0, -1.5, -1.5, 10.0, -1.5, -1.5, 10.0, 1.5,
        -1.5, 10.0, 1.5, -1.5, 10.0, -1.5, -1.5, 0.0, -1.5, -1.5, 0.0, 1.5,
        -1.5, 0.0, -1.5, 1.5, 0.0, -1.5, 1.5, 0.0, 1.5, -1.5, 0.0, 1.5,
        1.5, 0.0, -1.5, -1.5, 0.0, -1.5, -1.5, 10.0, -1.5, 1.5, 10.0, -1.5
    ]);
    var vertices_arm2 = new Float32Array([
        2.0, 10.0, 2.0, -2.0, 10.0, 2.0, -2.0, 0.0, 2.0, 2.0, 0.0, 2.0,
        2.0, 10.0, 2.0, 2.0, 0.0, 2.0, 2.0, 0.0, -2.0, 2.0, 10.0, -2.0,
        2.0, 10.0, 2.0, 2.0, 10.0, -2.0, -2.0, 10.0, -2.0, -2.0, 10.0, 2.0,
        -2.0, 10.0, 2.0, -2.0, 10.0, -2.0, -2.0, 0.0, -2.0, -2.0, 0.0, 2.0,
        -2.0, 0.0, -2.0, 2.0, 0.0, -2.0, 2.0, 0.0, 2.0, -2.0, 0.0, 2.0,
        2.0, 0.0, -2.0, -2.0, 0.0, -2.0, -2.0, 10.0, -2.0, 2.0, 10.0, -2.0
    ]);
    var vertices_palm = new Float32Array([
        1.0, 2.0, 3.0, -1.0, 2.0, 3.0, -1.0, 0.0, 3.0, 1.0, 0.0, 3.0,
        1.0, 2.0, 3.0, 1.0, 0.0, 3.0, 1.0, 0.0, -3.0, 1.0, 2.0, -3.0,
        1.0, 2.0, 3.0, 1.0, 2.0, -3.0, -1.0, 2.0, -3.0, -1.0, 2.0, 3.0,
        -1.0, 2.0, 3.0, -1.0, 2.0, -3.0, -1.0, 0.0, -3.0, -1.0, 0.0, 3.0,
        -1.0, 0.0, -3.0, 1.0, 0.0, -3.0, 1.0, 0.0, 3.0, -1.0, 0.0, 3.0,
        1.0, 0.0, -3.0, -1.0, 0.0, -3.0, -1.0, 2.0, -3.0, 1.0, 2.0, -3.0
    ]);
    var vertices_finger = new Float32Array([
        0.5, 2.0, 0.5, -0.5, 2.0, 0.5, -0.5, 0.0, 0.5, 0.5, 0.0, 0.5,
        0.5, 2.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, -0.5, 0.5, 2.0, -0.5,
        0.5, 2.0, 0.5, 0.5, 2.0, -0.5, -0.5, 2.0, -0.5, -0.5, 2.0, 0.5,
        -0.5, 2.0, 0.5, -0.5, 2.0, -0.5, -0.5, 0.0, -0.5, -0.5, 0.0, 0.5,
        -0.5, 0.0, -0.5, 0.5, 0.0, -0.5, 0.5, 0.0, 0.5, -0.5, 0.0, 0.5,
        0.5, 0.0, -0.5, -0.5, 0.0, -0.5, -0.5, 2.0, -0.5, 0.5, 2.0, -0.5
    ]);
    var normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0
    ]);
    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23
    ]);
    g_baseBuffer = initArrayBufferForLaterUse(gl, vertices_base, 3, gl.FLOAT);
    g_arm1Buffer = initArrayBufferForLaterUse(gl, vertices_arm1, 3, gl.FLOAT);
    g_arm2Buffer = initArrayBufferForLaterUse(gl, vertices_arm2, 3, gl.FLOAT);
    g_palmBuffer = initArrayBufferForLaterUse(gl, vertices_palm, 3, gl.FLOAT);
    g_fingerBuffer = initArrayBufferForLaterUse(gl, vertices_finger, 3, gl.FLOAT);
    if (!g_baseBuffer || !g_arm1Buffer || !g_arm2Buffer || !g_palmBuffer || !g_fingerBuffer) return -1;

    if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBufferForLaterUse(gl, data, num, type) {
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return null;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    buffer.num = num;
    buffer.type = type;

    return buffer;
}

function initArrayBuffer(gl, attribute, data, num, type) {
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return false;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
        console.log('Failed to get the storage location of ' + attribute);
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
    return true;
}

var g_modelMatrix = new Matrix4(),
    g_mvpMatrix = new Matrix4();

function draw(gl, n, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var baseHeight = 2.0;
    g_modelMatrix.setTranslate(0.0, -12.0, 0.0);
    drawSegment(gl, n, g_baseBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);

    var arm1Length = 10.0;
    g_modelMatrix.translate(0.0, baseHeight, 0.0);
    g_modelMatrix.rotate(g_arm1Abgle, 0.0, 1.0, 0.0);
    drawSegment(gl, n, g_arm2Buffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);

    var arm2length = 10.0;
    g_modelMatrix.translate(0.0, arm1Length, 0.0);
    g_modelMatrix.rotate(g_joint1Angle, 0.0, 0.0, 1.0);
    drawSegment(gl, n, g_arm2Buffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);

    var palmLength = 2.0;
    g_modelMatrix.translate(0.0, arm2length, 0.0);
    g_modelMatrix.rotate(g_joint2Angle, 0.0, 1.0, 0.0);
    drawSegment(gl, n, g_palmBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);

    g_modelMatrix.translate(0.0, palmLength, 0.0);

    pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0.0, 0.0, 2.0);
    g_modelMatrix.rotate(g_joint3Angle, 1.0, 0.0, 0.0);
    drawSegment(gl, n, g_fingerBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
    g_modelMatrix = popMatrix();

    g_modelMatrix.translate(0.0, 0.0, -2.0);
    g_modelMatrix.rotate(-g_joint3Angle, 1.0, 0.0, 0.0);
    drawSegment(gl, n, g_fingerBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
}

var g_matrixStack = [];

function pushMatrix(m) {
    var m2 = new Matrix4(m);
    g_matrixStack.push(m2);
}

function popMatrix() {
    return g_matrixStack.pop();
}

var g_normalMatrix = new Matrix4();

function drawSegment(gl, n, buffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_Position, buffer.num, buffer.type, false, 0, 0)
    gl.enableVertexAttribArray(a_Position);

    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);

    g_normalMatrix.setInverseOf(g_modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}