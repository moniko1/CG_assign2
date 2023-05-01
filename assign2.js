"use strict";

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // setup GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-3d", "fragment-shader-3d"]);

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");
  //var colorLocation = gl.getAttribLocation(program, "a_color");

  // lookup uniforms
  //var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  var colorLocation = gl.getUniformLocation(program, "u_color");
  var matrixLocation = gl.getUniformLocation(program, "u_matrix");
  //var translationLocation = gl.getUniformLocation(program, "u_translation");
  //var rotationLocation = gl.getUniformLocation(program, "u_rotation");

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setGeometry(gl);

  function radToDeg(r) {
    return r * 180 / Math.PI;
  }

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  var translation = [45, 150, 0];
  var rotation = [degToRad(40), degToRad(25), degToRad(325)];
  var scale = [1, 1, 1];
  var color = [Math.random(), Math.random(), Math.random(), 1];

  /*document.getElementById("Btn").onclick = function () {
    color = [Math.random(), Math.random(), Math.random(), 1];
    drawScene();  
    };*/

  drawScene();  

  // Setup a ui.
  webglLessonsUI.setupSlider("#x", {value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
  webglLessonsUI.setupSlider("#y", {value: translation[1], slide: updatePosition(1), max: gl.canvas.height});
  webglLessonsUI.setupSlider("#z", {value: translation[2], slide: updatePosition(2), max: gl.canvas.height});
  webglLessonsUI.setupSlider("#angleX", {value: radToDeg(rotation[0]), slide: updateRotation(0), max: 360});
  webglLessonsUI.setupSlider("#angleY", {value: radToDeg(rotation[1]), slide: updateRotation(1), max: 360});
  webglLessonsUI.setupSlider("#angleZ", {value: radToDeg(rotation[2]), slide: updateRotation(2), max: 360});
  webglLessonsUI.setupSlider("#scaleX", {value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2});
  webglLessonsUI.setupSlider("#scaleY", {value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2});
  webglLessonsUI.setupSlider("#scaleZ", {value: scale[2], slide: updateScale(2), min: -5, max: 5, step: 0.01, precision: 2});

  function updatePosition(index) {
    return function(event, ui) {
      translation[index] = ui.value;
      drawScene();
    };
  }

  function updateRotation(index) {
    return function(event, ui) {
      var angleInDegrees = ui.value;
      var angleInRadians = angleInDegrees * Math.PI / 180;
      rotation[index] = angleInRadians;
      drawScene();
    };
  }

  function updateScale(index) {
    return function(event, ui) {
      scale[index] = ui.value;
      drawScene();
    };
  }

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var size = 3;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

    gl.uniform4fv(colorLocation, color);

    var matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
    matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
    matrix = m4.xRotate(matrix, rotation[0]);
    matrix = m4.yRotate(matrix, rotation[1]);
    matrix = m4.zRotate(matrix, rotation[2]);
    matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 52 * 6;
    gl.drawArrays(primitiveType, offset, count);
  }
}

var m4 = {

  projection: function(width, height, depth) {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return [
       2 / width, 0, 0, 0,
       0, -2 / height, 0, 0,
       0, 0, 2 / depth, 0,
      -1, 1, 0, 1,
    ];
  },

  multiply: function(a, b) {
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  },

  translation: function(tx, ty, tz) {
    return [
       1,  0,  0,  0,
       0,  1,  0,  0,
       0,  0,  1,  0,
       tx, ty, tz, 1,
    ];
  },

  xRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ];
  },

  yRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ];
  },

  zRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
       c, s, 0, 0,
      -s, c, 0, 0,
       0, 0, 1, 0,
       0, 0, 0, 1,
    ];
  },

  scaling: function(sx, sy, sz) {
    return [
      sx, 0,  0,  0,
      0, sy,  0,  0,
      0,  0, sz,  0,
      0,  0,  0,  1,
    ];
  },

  translate: function(m, tx, ty, tz) {
    return m4.multiply(m, m4.translation(tx, ty, tz));
  },

  xRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.xRotation(angleInRadians));
  },

  yRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.yRotation(angleInRadians));
  },

  zRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.zRotation(angleInRadians));
  },

  scale: function(m, sx, sy, sz) {
    return m4.multiply(m, m4.scaling(sx, sy, sz));
  },

};

function setGeometry(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([

          // D부분 
          // left column 앞
          0, 0, 0,
          20, 0, 0,
          0, 150, 0,
          0, 150, 0,
          20, 0, 0,
          20, 150, 0,

          // middle_top rung 앞
          20, 0, 0,
          20, 30, 0,
          60, 75, 0,
          60, 75, 0,
          20, 30, 0,
          40, 75, 0,

          // middle_bottom rung 앞
          20, 150, 0,
          20, 120, 0,
          60, 75, 0,
          60, 75, 0,
          20, 120, 0,
          40, 75, 0,

          // left column 뒤
          0, 0, 30,
          20, 0, 30,
          0, 150, 30,
          0, 150, 30,
          20, 0, 30,
          20, 150, 30,

          // middle_top rung 뒤
          20, 0, 30,
          20, 30, 30,
          60, 75, 30,
          60, 75, 30,
          20, 30, 30,
          40, 75, 30,

          // middle_bottom rung 뒤
          20, 150, 30,
          20, 120, 30,
          60, 75, 30,
          60, 75, 30,
          20, 120, 30,
          40, 75, 30,

          // top
          0, 0, 0,
          20, 0, 0,
          20, 0, 30,
          0, 0, 0,
          20, 0, 30,
          0, 0, 30,

          // top_right
          20, 0, 0,
          20, 0, 30,
          60, 75, 0,
          60, 75, 0,
          20, 0, 30,
          60, 75, 30,

          // bottom
          0, 150, 0,
          20, 150, 0,
          0, 150, 30,
          0, 150, 30,
          20, 150, 0,
          20, 150, 30,

          // bottom_right
          20, 150, 0,
          20, 150, 30,
          60, 75, 30,
          60, 75, 30,
          20, 150, 30,
          60, 75, 30,

          // left column 왼
          0, 0, 0,
          0, 150, 0,
          0, 150, 30,
          0, 150, 30,
          0, 150, 0,
          0, 0, 30,

          // middle_top rung 왼
          20, 30, 0,
          20, 30, 30,
          40, 75, 0,
          40, 75, 0,
          20, 30, 30,
          40, 75, 30,

          // middle_bottom rung 왼
          20, 120, 0,
          20, 120, 30,
          40, 75, 0,
          40, 75, 0,
          20, 120, 30,
          40, 75, 30,

          // right
          20, 30, 0,
          20, 30, 30,
          20, 120, 0,
          20, 120, 0,
          20, 30, 30,
          20, 120, 30,
          //////////////////////////////////////////////////////////////////////////////////

          // H부분 
          // left column 앞
          80, 0, 0,
          100, 0, 0,
          80, 150, 0,
          80, 150, 0,
          100, 0, 0,
          100, 150, 0,

          // right column 앞
          140, 0, 0,
          160, 0, 0,
          140, 150, 0,
          140, 150, 0,
          160, 0, 0,
          160, 150, 0,

          // middle rung 앞
          100, 60, 0,
          140, 60, 0,
          100, 90, 0,
          100, 90, 0,
          140, 60, 0,
          140, 90, 0,

          // left column 뒤
          80, 0, 30,
          100, 0, 30,
          80, 150, 30,
          80, 150, 30,
          100, 0, 30,
          100, 150, 30,

          // right column 뒤
          140, 0, 30,
          160, 0, 30,
          140, 150, 30,
          140, 150, 30,
          160, 0, 30,
          160, 150, 30,

          // middle rung 뒤
          100, 60, 30,
          140, 60, 30,
          100, 90, 30,
          100, 90, 30,
          140, 60, 30,
          140, 90, 30,

          // left top
          80, 0, 0,
          100, 0, 0,
          100, 0, 30,
          100, 0, 30,
          100, 0, 0,
          80, 0, 30,

          // right top
          140, 0, 0,
          160, 0, 0,
          160, 0, 30,
          160, 0, 30,
          160, 0, 0,
          140, 0, 30,

          // middle top
          100, 60, 0,
          140, 60, 0,
          140, 60, 30,
          140, 60, 30,
          140, 60, 0,
          100, 60, 30,

          // left bottom
          80, 150, 0,
          100, 150, 0,
          100, 150, 30,
          100, 150, 30,
          100, 150, 0,
          80, 150, 30,

          // right bottom
          140, 150, 0,
          160, 150, 0,
          160, 150, 30,
          160, 150, 30,
          160, 150, 0,
          140, 150, 30,

          // middle bottom
          100, 90, 0,
          140, 90, 0,
          140, 90, 30,
          140, 90, 30,
          140, 90, 0,
          100, 90, 30,
          
          // left
          80, 0, 0,
          80, 0, 30,
          80, 150, 0,
          80, 150, 0,
          80, 0, 30,
          80, 150, 30,

          // left_top
          140, 0, 0,
          140, 0, 30,
          140, 60, 0,
          140, 60, 0,
          140, 0, 30,
          140, 60, 30,

          // left_bottom
          140, 90, 0,
          140, 90, 30,
          140, 150, 0,
          140, 150, 0,
          140, 90, 30,
          140, 150, 30,

          // right
          160, 0, 0,
          160, 0, 30,
          160, 150, 0,
          160, 150, 0,
          160, 0, 30,
          160, 150, 30,

          // right_top
          100, 0, 0,
          100, 0, 30,
          100, 60, 0,
          100, 60, 0,
          100, 0, 30,
          100, 60, 30,

          // right_bottom
          100, 90, 0,
          100, 90, 30,
          100, 150, 0,
          100, 150, 0,
          100, 90, 30,
          100, 150, 30,
          //////////////////////////////////////////////////////////////////////////////////

          // M부분 
          // left column 앞
          180, 0, 0,
          200, 0, 0,
          180, 150, 0,
          180, 150, 0,
          200, 0, 0,
          200, 150, 0,

          // right column 앞
          250, 0, 0,
          270, 0, 0,
          250, 150, 0,
          250, 150, 0,
          270, 0, 0,
          270, 150, 0,

          // middle_left rung 앞
          200, 0, 0,
          200, 30, 0,
          225, 90, 0,
          225, 90, 0,
          200, 30, 0,
          225, 120, 0,

          // middle_left rung 앞
          225, 90, 0,
          225, 120, 0,
          250, 0, 0,
          250, 0, 0,
          225, 120, 0,
          250, 30, 0,

          // left column 뒤
          180, 0, 30,
          200, 0, 30,
          180, 150, 30,
          180, 150, 30,
          200, 0, 30,
          200, 150, 30,

          // right column 뒤
          250, 0, 30,
          270, 0, 30,
          250, 150, 30,
          250, 150, 30,
          270, 0, 30,
          270, 150, 30,

          // middle_left rung 뒤
          200, 0, 30,
          200, 30, 30,
          225, 90, 30,
          225, 90, 30,
          200, 30, 30,
          225, 120, 30,

          // middle_left rung 뒤
          225, 90, 30,
          225, 120, 30,
          250, 0, 30,
          250, 0, 30,
          225, 120, 30,
          250, 30, 30,

          // left top
          180, 0, 0,
          200, 0, 0,
          180, 0, 30,
          180, 0, 30,
          200, 0, 0,
          200, 0, 30,

          // right top
          250, 0, 0,
          270, 0, 0,
          250, 0, 30,
          250, 0, 30,
          270, 0, 0,
          270, 0, 30,

          // middle_left top
          200, 0, 0,
          200, 0, 30,
          225, 90, 0,
          225, 90, 0,
          200, 0, 30,
          225, 90, 30,

          // middle_right top
          250, 0, 0,
          250, 0, 30,
          225, 90, 0,
          225, 90, 0,
          250, 0, 30,
          225, 90, 30,

          // left bottom
          180, 150, 0,
          200, 150, 0,
          180, 150, 30,
          180, 150, 30,
          200, 150, 0,
          200, 150, 30,

          // right bottom
          250, 150, 0,
          270, 150, 0,
          250, 150, 30,
          250, 150, 30,
          270, 150, 0,
          270, 150, 30,

          // middle_left bottom
          200, 30, 0,
          200, 30, 30,
          225, 120, 0,
          225, 120, 0,
          200, 30, 30,
          225, 120, 30,

          // middle_right bottom
          250, 30, 0,
          250, 30, 30,
          225, 120, 0,
          225, 120, 0,
          250, 30, 30,
          225, 120, 30,

          // left_1
          180, 0, 0,
          180, 0, 30,
          180, 150, 30,
          180, 150, 30,
          180, 0, 30,
          180, 150, 30,

          // left_2
          250, 30, 0,
          250, 30, 30,
          250, 150, 0,
          250, 150, 0,
          250, 30, 30,
          250, 150, 30,

          // right_1
          270, 0, 0,
          270, 0, 30,
          270, 150, 30,
          270, 150, 30,
          270, 0, 30,
          270, 150, 30,

          // right_2
          200, 30, 0,
          200, 30, 30,
          200, 150, 0,
          200, 150, 0,
          200, 30, 30,
          200, 150, 30,
      ]),
      gl.STATIC_DRAW);
}

main();
