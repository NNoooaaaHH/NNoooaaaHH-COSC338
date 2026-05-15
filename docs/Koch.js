"use strict";

let gl;
let points;
let n = 3 // number of levels of recursion for the Koch snowflake



//  Koch Snowflake recursive function
function koch_Snowflake(a, b, n, vrtx) {
    if (n === 0) {
        vrtx.push(a[0], a[1]);
        return;
    }

    // 3 points that subdevides the line into thirds plus the midpoint
    let p = mix(a, b, 1/3);
    let r = mix(a, b, 2/3);
    let M = mix(a, b, 0.5);


    //code from blackboard 
    let v = subtract(b, a);
    let perp =vec2(-v[1], v[0]);
    let k = Math.sqrt(3) / 6;
    let q = add(M, mult(k, perp));




    //recursive calls for the 4 segments
    koch_Snowflake(a, p, n-1, vrtx);
    koch_Snowflake(p, q, n-1, vrtx);
    koch_Snowflake(q, r, n-1, vrtx);
    koch_Snowflake(r, b, n-1, vrtx);
    
}



window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    
    let vrtx = [];
    let a = vec2(-0.5,-0.5);
    let b = vec2(0, 0.5);
    let c = vec2(0.5, -0.5);

    //trianlge sides
    koch_Snowflake(a, b, n, vrtx);
    koch_Snowflake(b, c, n, vrtx);
    koch_Snowflake(c, a, n, vrtx);
    points = new Float32Array(vrtx);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

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

    render();
};



function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINE_LOOP, 0, points.length/2 );
}




