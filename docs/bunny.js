"use strict";

var gl;
var points = [];
var uColorLoc;
var uModelViewLoc;
var uRotationLoc
var uNormalMatrixLoc;;
var uProjectionLoc;
var modelViewMatrix;

var bufferId;

var theta = 0.0;

var rotateButton = true;
var shadeButton = true;



var uMatAmbientLoc;
var uMatDiffuseLoc;
var uMatSpecularLoc;
var uShininessLoc;

var uLightAmbientLoc;
var uLightDiffuseLoc;
var uLightSpecularLoc;
var uLightPositionLoc;

var program;

//start and stop rotation
var spin = 1;
var uUsePhongLoc;   
var gorp = 0;

document.getElementById('fileInput').addEventListener('change', function selectedFileChanged() {
    if (this.files.length === 0) {
        console.log('No file selected.');
        return;
    }



    const reader = new FileReader();
    reader.onload = function fileReadCompleted() {

        const line = reader.result.trim().split(/\r?\n/);



        const count = line[1].split(/\s+/).map(Number);
        const numVertex = count[0];
        const numFace = count[1];
        const numEdge = count[2];



        //Arrray of vertices
        const vertices = [];

        for (let i = 2; i < numVertex + 2; i++) {
            const [v, f, e] = line[i].split(/\s+/).map(Number);

            vertices.push([v, f, e]);
        }

        normalizeVertices(vertices);
        //Array of faces, starting after the "vertices" section is done
        const faces = [];
        const startOfFace = numVertex + 2;

        for (let i = startOfFace; i < startOfFace + numFace; i++) {
            const facePoints = line[i].split(/\s+/).map(Number);
            const indices = [];
            // 3, a, b, c dropping the number of vertices just keeping the indices
            for (let j = 1; j < facePoints.length; j++) {

                indices.push(facePoints[j]);

            }
            faces.push(indices);
        }

        const vertexNormals = Array(vertices.length).fill(0).map(() => [0, 0, 0]);

        //this is the triangles (references from the WIKI and VS CODE)
        for (let i = 0; i < faces.length; i++) {
            const Norm = faces[i];
            const a = vertices[Norm[0]];
            const b = vertices[Norm[1]];
            const c = vertices[Norm[2]];

            const normal = calculateSurfaceNormal(a, b, c);
            for (let j = 0; j < Norm.length; j++) {
                const index = Norm[j];

                vertexNormals[index][0] += normal[0];
                vertexNormals[index][1] += normal[1];
                vertexNormals[index][2] += normal[2];
            }

        }

        for (let i = 0; i < vertexNormals.length; i++) {
            const n = vertexNormals[i];

            const s = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);

            if (s !== 0) {
                n[0] /= s;
                n[1] /= s;
                n[2] /= s;
            }
        }

        //building the surfaces
        const surfaces = [];
        for (let i = 0; i < faces.length; i++) {
            const triangle = faces[i];
            for (let j = 0; j < triangle.length; j++) {

                const vIndex = triangle[j];

                const v = vertices[vIndex];
                const n = vertexNormals[vIndex];
                surfaces.push(v[0], v[1], v[2], n[0], n[1], n[2]);
            }
        }

        points = new Float32Array(surfaces);

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);


        modelViewMatrix = setUpModelViewModel(vertices);
        const projectionMatrix = setUpProjectionMatrix(vertices);

        gl.uniformMatrix4fv(uModelViewLoc, false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(uProjectionLoc, false, flatten(projectionMatrix));


    };



    reader.readAsText(this.files[0]);

});




// calculating normal references from wiki and vs code
function calculateSurfaceNormal(a, b, c) {

    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];

    const normalX = u[1] * v[2] - u[2] * v[1];
    const normalY = u[2] * v[0] - u[0] * v[2];
    const normalZ = u[0] * v[1] - u[1] * v[0];



    return [normalX, normalY, normalZ];

}


// Bunny wasn't rendering and everything seemed correct to me so I looked this up and 
//added this and it worked
function normalizeVertices(vertices) {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (let i = 0; i < vertices.length; i++) {
        const [x, y, z] = vertices[i];

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);

        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);

        minZ = Math.min(minZ, z);
        maxZ = Math.max(maxZ, z);
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const cz = (minZ + maxZ) / 2;

    const size = Math.max(maxX - minX, maxY - minY, maxZ - minZ);

    const scale = 2.0 / size;

    for (let i = 0; i < vertices.length; i++) {
        vertices[i][0] = (vertices[i][0] - cx) * scale;
        vertices[i][1] = (vertices[i][1] - cy) * scale;
        vertices[i][2] = (vertices[i][2] - cz) * scale;
    }


}


//camera set up
function setUpModelViewModel(vertices) {


    // calculating min max for x, y, z
    var minX = Infinity, maxX = -Infinity;
    var minY = Infinity, maxY = -Infinity;
    var minZ = Infinity, maxZ = -Infinity;

    for (let i = 0; i < vertices.length; i++) {
        const [x, y, z] = vertices[i];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
    }



    const at = vec3((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2);

    const maxSize = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
    const distance = maxSize * 1.5;

    // in front and a little bit to the right of the model
    const eye = vec3(at[0] + distance, at[1], at[2] + distance);

    const up = vec3(0, 1, 0);

    //FROM MV FILE
    const matrix = lookAt(eye, at, up);

    return matrix;
}


// Also had to look some parts of this up but its caulations are very similar to the cameras calculations
function setUpProjectionMatrix(vertices) {
    var minX = Infinity, maxX = -Infinity;
    var minY = Infinity, maxY = -Infinity;
    var minZ = Infinity, maxZ = -Infinity;

    for (let i = 0; i < vertices.length; i++) {
        const [x, y, z] = vertices[i];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
    }

    const spaceBox = 1.5;

    //FROM MV FILE
    return ortho(minX * spaceBox, maxX * spaceBox, minY * spaceBox, maxY * spaceBox, -100, 100);

}


document.getElementById("btnRotate").onclick = function () {
    rotateButton = !rotateButton;
    if (rotateButton) {
        this.textContent = "Stop Rotation";
        spin = 1;

    } else {
        this.textContent = "Start Rotation";
        spin = 0;
    }

}

document.getElementById("btnShading").onclick = function () {
    shadeButton = !shadeButton;
    if (shadeButton) {
        this.textContent = "Switch to Phong";
        gorp = 1;
      // program = initShaders(gl, "pVertex-shader", "pFragment-shader");

    } else {
        this.textContent = "Switch to Gouraud";
        gorp = 0;
        //program = initShaders(gl, "gVertex-shader", "gFragment-shader");
        
    
    }
    
}

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) { alert("WebGL 2.0 isn't available"); }


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1.0);


    gl.enable(gl.DEPTH_TEST);


    //  Load shaders and initialize attribute buffers;
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);



    // Associate out shader variables with our data buffer

    var aPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(aPosition);


    var aNormal = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 24, 12);
    gl.enableVertexAttribArray(aNormal);


    uColorLoc = gl.getUniformLocation(program, "uColor");
    uModelViewLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    uProjectionLoc = gl.getUniformLocation(program, "uProjectionMatrix");
    uRotationLoc = gl.getUniformLocation(program, "uRotationMatrix");
    uNormalMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");

    uMatAmbientLoc = gl.getUniformLocation(program, "uMatAmbient");
    uMatDiffuseLoc = gl.getUniformLocation(program, "uMatDiffuse");
    uMatSpecularLoc = gl.getUniformLocation(program, "uMatSpecular");
    uShininessLoc = gl.getUniformLocation(program, "uShininess");

    uLightAmbientLoc = gl.getUniformLocation(program, "uLightAmbient");
    uLightDiffuseLoc = gl.getUniformLocation(program, "uLightDiffuse");
    uLightSpecularLoc = gl.getUniformLocation(program, "uLightSpecular");
    uLightPositionLoc = gl.getUniformLocation(program, "uLightPosition");



    // Basically the same as uColorLoc

    //Turquoise
    //gl.uniform4f(uColorLoc, 1.0, 0.0, 0.0, 1.0);
    uUsePhongLoc = gl.getUniformLocation(program, "uUsePhong");

    //moved outside of render so its not on everyframe
    gl.uniform4f(uMatAmbientLoc, 0.1, 0.18725, 0.1745, 0.8);
    gl.uniform4f(uMatDiffuseLoc, 0.396, 0.74151, 0.69102, 0.8);
    gl.uniform4f(uMatSpecularLoc, 0.297254, 0.30829, 0.306678, 0.8);
    gl.uniform1f(uShininessLoc, 12.8);
    // set up light
    gl.uniform4f(uLightAmbientLoc, 0.2, 0.2, 0.2, 1.0);
    gl.uniform4f(uLightDiffuseLoc, 1.0, 1.0, 1.0, 1.0);
    gl.uniform4f(uLightSpecularLoc, 1.0, 1.0, 1.0, 1.0);
    gl.uniform4f(uLightPositionLoc, 200.0, 300.0, 100.0, 0.0);


    render();



};

function render() {


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //start rotation
    if (spin === 1) {
        theta += 1.0;
    }

    //modeViewMatrix is undefined when trying to render befoer the OFF file has a chance to be read
    if (!modelViewMatrix || points.length === 0) {
        requestAnimationFrame(render);
        return;
    }


    //from MV file
    var rotationMatrix = rotateY(theta);
    var modelViewAndRotation = mult(modelViewMatrix, rotationMatrix);

    // direct reference to the link in step 7 
    var normalMatrix = inverse(transpose(modelViewAndRotation));
    gl.uniformMatrix4fv(uModelViewLoc, false, flatten(modelViewAndRotation));
    gl.uniformMatrix4fv(uRotationLoc, false, flatten(rotationMatrix));

    normalMatrix = mat3(
        normalMatrix[0][0], normalMatrix[0][1], normalMatrix[0][2],
        normalMatrix[1][0], normalMatrix[1][1], normalMatrix[1][2],
        normalMatrix[2][0], normalMatrix[2][1], normalMatrix[2][2]
    );



    gl.uniformMatrix3fv(uNormalMatrixLoc, false, flatten(normalMatrix));

    gl.useProgram(program);
    gl.uniform1i(uUsePhongLoc, gorp);
    gl.drawArrays(gl.TRIANGLES, 0, points.length / 6);
    requestAnimationFrame(render);
}


















