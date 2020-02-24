function Shader(gl, src, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
}

function ShaderProgram(gl, v, f) {
    program = gl.createProgram();
    gl.attachShader(program, v);
    gl.attachShader(program, f);
    gl.linkProgram(program);

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    gl.detachShader(program, v);
    gl.detachShader(program, f);
    gl.deleteShader(v);
    gl.deleteShader(f);
    
    return program;
}