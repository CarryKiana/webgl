var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Normal;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    'uniform vec3 u_LightColor;\n' +
    'uniform vec3 u_LightPosition;\n' +
    'uniform vec3 u_AmbientLight;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    ' vec4 color = vec4(1.0, 1.0, 1.0, 1.0);\n' +
    ' gl_Position = u_MvpMatrix * a_Position;\n' +
    ' vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
    ' vec4 vertexPosition = u_ModelMatrix * a_Position;\n' +
    ' vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));\n' +
    ' float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
    ' vec3 diffuse = u_LightColor * color.rgb * nDotL;\n' +
    ' vec3 ambient = u_AmbientLight * color.rgb;\n' +
    ' v_Color = vec4(diffuse + ambient, color.a);\n' +
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

    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);

    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
    var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');

    if (!u_ModelMatrix || !u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition || !u_AmbientLight) {
        console.log('Failed to get the storage location');
        return;
    }

    gl.uniform3f(u_LightColor, 0.8, 0.8, 0.8);
    gl.uniform3f(u_LightPosition, 5.0, 8.0, 7.0);
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

    var modelMatrix = new Matrix4();
    var mvpMatrix = new Matrix4();
    var normalMatrix = new Matrix4();

    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    mvpMatrix.setPerspective(30, canvas.width / canvas.clientHeight, 1, 100);
    mvpMatrix.lookAt(0, 0, 6, 0, 0, 0, 0, 1, 0);
    mvpMatrix.multiply(modelMatrix);

    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();

    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
}

function initVertexBuffers(gl) {
    var SPHERE_DIV = 13;
    var i, ai, si, ci;
    var j, aj, sj, cj;
    var p1, p2;

    var positions = [];
    var indices = [];

    for (j = 0; j <= SPHERE_DIV; j++) {
        aj = j * Math.PI / SPHERE_DIV;
        sj = Math.sin(aj);
        cj = Math.cos(aj);
        for (i = 0; i <= SPHERE_DIV; i++) {
            ai = i * 2 * Math.PI / SPHERE_DIV;
            si = Math.sin(ai);
            ci = Math.cos(ai);

            positions.push(si * sj);
            positions.push(cj);
            positions.push(ci * sj);
        }
    }

    for (j = 0; j < SPHERE_DIV; j++) {
        for (i = 0; i < SPHERE_DIV; i++) {
            p1 = j * (SPHERE_DIV + 1) + i;
            p2 = p1 + (SPHERE_DIV + 1);

            indices.push(p1);
            indices.push(p2);
            indices.push(p1 + 1);

            indices.push(p1 + 1);
            indices.push(p2);
            indices.push(p2 + 1);
        }
    }

    if (!initArrayBuffer(gl, 'a_Position', new Float32Array(positions), gl.FLOAT, 3)) return -1;
    if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(positions), gl.FLOAT, 3)) return -1;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, attribute, data, type, num) {
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

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return true;
}