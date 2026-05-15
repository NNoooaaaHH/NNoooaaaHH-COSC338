"use strict";

let gl;


let iSquare;
let pSquare;

let iTri;
let pTri;

let iHex;
let pHex;

let iOct;
let pOct;

let bufferIdSQ;
let bufferIdTri;
let bufferIdHex;
let bufferIdOct;

let iBufferIdSQ;
let iBufferIdTri;
let iBufferIdHex;
let iBufferIdOct;
let program;


let mode = 'triangle';

window.onload = function init() {
    let canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');  // WebGL "rendering context"
    if (!gl) { alert("WebGL 2.0 isn't available"); }


    pTri = [
        vec2(0.0, 0.8),
        vec2(-0.8, -0.8 / 2),
        vec2(0.8, -0.8 / 2)
    ];

    pSquare = [
        vec2(0.7, 0.7),
        vec2(-0.7, 0.7),
        vec2(-0.7, -0.7),
        vec2(0.7, -0.7),
    ];

    pHex = [
        vec2(0.8, 0.0),       
        vec2(0.4, 0.6928),    
        vec2(-0.4, 0.6928),  
        vec2(-0.8, 0.0),      
        vec2(-0.4, -0.6928),  
        vec2(0.4, -0.6928) 
    ];

     pOct  = ([
        vec2(0.8, 0.3),
        vec2(0.3, 0.8),
        vec2(-0.3, 0.8),
        vec2(-0.8, 0.3),
        vec2(-0.8, -0.3),
        vec2(-0.3, -0.8),
        vec2(0.3, -0.8),
        vec2(0.8, -0.3)
    ]);


    iTri= new Float32Array([
        0, 1, 2,
    ]);

    iSquare = new Float32Array([
        0, 1, 2,
        0, 2, 3
    ]);

    iHex = new Float32Array([
        0, 1, 2,
        0, 2, 3,
        0, 3, 4,
        0, 4, 5,
        0, 5, 1
    ]);

    iOct = new Float32Array([
        0, 1, 2,
        0, 2, 3,
        0, 3, 4,
        0, 4, 5,
        0, 5, 6,
        0, 6, 7,
        0, 7, 1
    ]);


    //  Configure canvas and background color.
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //  Load shaders.
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    
    let aPosition = gl.getAttribLocation(program, "aPosition");
  

    // Load vertices to the GPU and associate shader variable.
    bufferIdSQ = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdSQ);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pSquare), gl.STATIC_DRAW);
    
    
    bufferIdTri = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdTri);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pTri), gl.STATIC_DRAW);

    bufferIdHex = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdHex);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pHex), gl.STATIC_DRAW);
    
    bufferIdOct = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdOct);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pOct), gl.STATIC_DRAW);


    // Load indices to the GPU.
    iBufferIdSQ = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBufferIdSQ);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(iSquare), gl.STATIC_DRAW);

    iBufferIdTri = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBufferIdTri);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(iTri), gl.STATIC_DRAW);

    iBufferIdHex = gl.createBuffer();   
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBufferIdHex);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(iHex), gl.STATIC_DRAW);

    iBufferIdOct = gl.createBuffer();      
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBufferIdOct);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(iOct), gl.STATIC_DRAW);

setInterval(() => {
    if (mode === "triangle") {
        mode = "square";
    } else if (mode === "square") {
        mode = "hexagon";
    } else if (mode === "hexagon") {
        mode = "octagon";
    } else if (mode === "octagon") {
        mode = "triangle";
    }
    }, 500);

    render();
};



function draw(p, i, length)
{
    gl.bindBuffer(gl.ARRAY_BUFFER, p);

    let aPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, i);

    gl.drawElements(gl.TRIANGLES, length, gl.UNSIGNED_BYTE, 0);
}

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (mode === "triangle") {
        draw(bufferIdTri, iBufferIdTri, iTri.length);
    } else  if (mode === "square") {
        draw(bufferIdSQ, iBufferIdSQ, iSquare.length);
    } else if (mode === "hexagon") {
        draw(bufferIdHex, iBufferIdHex, iHex.length);
    } else if (mode === "octagon") {
        draw(bufferIdOct, iBufferIdOct, iOct.length);
    }

    requestAnimationFrame(render);
}




