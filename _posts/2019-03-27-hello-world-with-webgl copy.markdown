---
layout: post
title:  "Hello World with WebGL2!"
date:   2019-01-09
categories: jekyll update
---
<script src="{{ "/assets/js/gl.js" }}"></script>
<script src="{{ "/assets/js/shader.js" }}"></script>

Hello!

This post will be the starting point of my blogging about my experiences with computer graphics related stuff. To make a basic start this post will be about rendering a basic RGB triangle with WebGL. Unfortunately, my experience with WebGL2 is too narrow but I believe I can make escalating examples as I port my experience in OpenGL to this platform. So let's kick in.

So firstly we will be needing a canvas to show our work so lets start with creating one:

{% highlight html %}
<div style="text-align:center;">
    <canvas id="glcanvas"></canvas>
</div>
{% endhighlight %}

After this we can create our WebGL instance. We will pass our canvas id to our js function which will be creating our context and setting up our most basic functionalities like clearing our display buffer and setting up our viewport.

### WebGL2 Instance
_______________________________

First things first we need to be grabbing our canvas with the id we given as a parameter which is `glcanvas` in our case. Then we will continue with creating a GL context on it.

{% highlight js %}
function GLContext(canvasID) {
    var canvas = document.getElementById(canvasID);
    var gl = canvas.getContext("webgl2");

    if(!gl){ 
        console.error("WebGL context is not available."); 
        return null;
    }
{% endhighlight %}

Then we will define our clear color. Clear color is the color we use while clearing the color buffer. We will be using normalized values in RGBA channels. Then we will declare our fClear function which will be clearing our color buffer and depth buffer (Which I will write about in future hopefully!) and returns a reference to out instance. We will be using this technique in future function declarations which will be helping us chain our methods back to back.

{% highlight js %}
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.Clear = function(){ 
        // Clear color and the depth buffer
        this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT); 

        // Return self reference
        return this;
    }
{% endhighlight %}

Lastly, we will be declaring our SetSize function which will be setting our canvas's width, height then manages its alignment which finally leads onto viewport setting. Viewport implies on which part of the canvas objects in our canonical viewing volume will be rendered on.

{% highlight js %}
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
{% endhighlight %}

Alright! We can now display our GL context using our declared functions which will create our GLInstance, set its size and clear buffers at a load event. We do this as follows:
{% highlight html %}
<script src="{{ "gl.js" }}"></script>
<script>
    var gl;

    window.addEventListener("load",function(){
        gl = GLContext("glcanvas").SetSize("center",500,500).Clear();
    });
</script> 
{% endhighlight %}

The result should look like this:

<script>
    var gl;

    window.addEventListener("load",function(){
        gl = GLContext("glcanvas1").SetSize("center",500,500).Clear();
    });
</script>
<div>
    <canvas id="glcanvas1"></canvas>
</div>

A pitch black box but we will fill it in our next section with our triangle and shader.

### Shader Program
_______________________________
Great, we created our first context now we will be needing our shaders and buffers to display an object in our canvas.

Before that lets briefly talk about how WebGL works, what is a shader and what is GLSL. 

Let's start with WebGL, WebGL is a state machine we use for rasterization. A state machine can be thought of as a mechanism where we have limited control through switches and handles. We can modify our input, production procedure or speed of our system but we cannot modify the main procedures. Main procedures are provided by the browser developers based on the specification given by Khronos Group. So as long as the browser and GPU on the computer supports WebGL we are good to go.

Shaders are one of the main ways we can use for modifying the rasterization pipeline. These programs are the parts of WebGL that work on GPU that we can modify. Shaders are required to be written in a language named GLSL ES (OpenGL ES Shading Language) which is a C like a language. There are 2 types of shaders vertex shaders and fragment shaders. Vertex shaders are the programs we use for manipulating geometry while also producing the byproducts which will be helping us determining the lighting in later steps of the rendering. Fragment shaders are the programs that work in the last part of the rendering pipeline. They work on per pixel basis and are used in determining output pixel value in each pixel.

So after this basic introduction, we can start by defining our vertex and fragment shader we will be using for our program:

<script>
    var gl;

    var vertexShaderSource = `#version 300 es
    in vec3 aPosition;
    in vec3 aColor;

    out vec3 vColor;

    void main(void){
        gl_Position = vec4(aPosition,1.0);
        vColor = aColor;
    }`;

    var fragmentShaderSource = `#version 300 es
    precision mediump float;
    out vec4 fragColor;
    in vec3 vColor;

    void main(void) {
        fragColor = vec4(vColor, 1.0);
    }`;
    
    window.addEventListener("load", function () {
        gl = GLContext("glcanvas2").SetSize("center", 500, 500).Clear();
        
        var vertexShader = Shader(gl,vertexShaderSource,gl.VERTEX_SHADER);
        var fragmentShader = Shader(gl,fragmentShaderSource,gl.FRAGMENT_SHADER);
        var shaderProgram = ShaderProgram(gl, vertexShader, fragmentShader);
        var aPositionLocation = gl.getAttribLocation(shaderProgram,"aPosition");
        var aColorLocation = gl.getAttribLocation(shaderProgram,"aColor");

        var aryVerts = new Float32Array([
             0.0,  0.6,
            -0.5, -0.4,
             0.5, -0.4,
        ]);

        var colorVerts = new Float32Array([
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
        ]);

        var aPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, aPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, aryVerts, gl.STATIC_DRAW);

        var aColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, aColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colorVerts, gl.STATIC_DRAW);

        gl.useProgram(shaderProgram);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, aPositionBuffer);
        gl.enableVertexAttribArray(aPositionLocation);
        gl.vertexAttribPointer(aPositionLocation,2,gl.FLOAT,false,0,0);

        gl.viewport(0,0,250,250);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, aColorBuffer);
        gl.enableVertexAttribArray(aColorLocation);
        gl.vertexAttribPointer(aColorLocation,3,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.drawArrays(gl.TRIANGLES, 0, 3); //Draw the points
    });
</script>
<div>
    <canvas id="glcanvas2"></canvas>
</div>


[jekyll-docs]: https://jekyllrb.com/docs/home
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-talk]: https://talk.jekyllrb.com/
