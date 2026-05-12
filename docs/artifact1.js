"use strict";

var gl;
var points;
var uColorLoc;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    //
    //  
    //

    // making house

     points = new Float32Array([
          
    //base
        -0.5, -0.5,   
         0.5, -0.5,
        -0.5,  0.2,
        0.5, 0.2,   
  

        //roof
        -0.6,  0.2,
         0.6,  0.2,
         0.0,  0.8
        ]);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0, 0, 0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, points, gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var aPosition = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( aPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( aPosition );
    uColorLoc = gl.getUniformLocation(program, "uColor");

    render();
};


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.uniform4f(uColorLoc, 101 / 255, 67 / 255, 33 / 255, 1.0);
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

    gl.uniform4f(uColorLoc, 1.0, 0.0, 0.0, 1.0);
    gl.drawArrays( gl.TRIANGLES, 4, 3 );
}
