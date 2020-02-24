function GLContext(canvasID) {
    var canvas = document.getElementById(canvasID);
    var gl = canvas.getContext("webgl2");

    if(!gl){ console.error("WebGL context is not available."); return null;}

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.Clear = function(){ 
        // Clear color and the depth buffer
        this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT); 

        // Return self reference
        return this;
    }

    gl.SetSize = function(a,w,h){
        
        // Set width and height
        this.canvas.style.width = w + "px";
        this.canvas.style.height = h + "px";
        this.canvas.width = w;
        this.canvas.height = h;
        
        // Center align the canvas
        this.canvas.parentNode.style.textAlign = a;
        this.canvas.style.display = "inline";

        // Set the viewport
        this.viewport(0, 0, w, h);

        // Return self reference
        return this;
    }

    return gl;
}