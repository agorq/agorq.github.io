---
layout: post
title:  "Advanced Ray Tracing Homework 1 - Hello Ray Tracer"
date:  2020-02-24
categories: [Advanced Ray Tracing]
comments: true
---

### Introduction
______________________________

Greetings!

This post is first of the many to come posts about the raytracer I will be developing along the course "CENG 795 - Special Topics: Advanced Ray Tracing". Throughout the semester, I will be adding extra features to my ray tracer in intervals of once in two weeks. In this first iteration, we were expected to implement our basic math classes, XML parser, basic ray tracer classes (such as camera, shape, scene, etc.) and a basic shading model (Blinn-Phong).

In the following sections, I will briefly explain the basic capabilities of my ray tracer, show my results in the given scenes and some of the interesting results I have came across during the implementation with a brief discussion.

### What has been done so far
______________________________
To explain the capabilities of the current state of my ray tracer, one of the provided XML scene files is a great tool:

{% highlight xml %}
<Scene>
    <BackgroundColor>0 0 0</BackgroundColor>

    <ShadowRayEpsilon>1e-3</ShadowRayEpsilon>

    <IntersectionTestEpsilon>1e-6</IntersectionTestEpsilon>

    <Cameras>
        <Camera id="1">
            <Position>0 0 0</Position>
            <Gaze>0 0 -1</Gaze>
            <Up>0 1 0</Up>
            <NearPlane>-1 1 -1 1</NearPlane>
            <NearDistance>1</NearDistance>
            <ImageResolution>800 800</ImageResolution>
            <ImageName>simple.png</ImageName>
        </Camera>
    </Cameras>

    <Lights>
        <AmbientLight>25 25 25</AmbientLight>
        <PointLight id="1">
            <Position>0 0 0 </Position>
            <Intensity>1000 1000 1000</Intensity>
        </PointLight>
    </Lights>

    <Materials>
        <Material id="1">
            <AmbientReflectance>1 1 1</AmbientReflectance>
            <DiffuseReflectance>1 1 1</DiffuseReflectance>
            <SpecularReflectance>1 1 1</SpecularReflectance>
            <PhongExponent>1</PhongExponent>
        </Material>
    </Materials>

    <VertexData>
        -0.5 0.5 -2
        -0.5 -0.5 -2
        0.5 -0.5 -2
        0.5 0.5 -2
        0.75 0.75 -2
        1 0.75 -2
        0.875 1 -2
        -0.875 1 -2
    </VertexData>

    <Objects>
        <Mesh id="1">
            <Material>1</Material>
            <Faces>
                3 1 2
                1 3 4
            </Faces>
        </Mesh>
        <Triangle id="1">
            <Material>1</Material>
            <Indices>
                5 6 7
            </Indices>
        </Triangle>
        <Sphere id="1">
            <Material>1</Material>
            <Center>8</Center>
            <Radius>0.3</Radius>
        </Sphere>
    </Objects>
</Scene>

{% endhighlight %}

From the simple.xml we can see the basic requirements for our first iteration:
- a camera class with capabilities of rendering images.
- a point light class for the basic lighting of our scenes.
- a material class capable of calculating outgoing luminance based on Blinn-Phong shading model.
- implementations of basic shape classes : sphere, triangle and mesh.

The main structure of the system goes like this:

{% highlight C %}
function main:
 1. parse XML file and create the scene
 2. for each camera:
 3.     preprocess camera data
 4.     initialize image buffer
 5.     for each pixels:
 6.         create ray
 7.         send ray to the scene
 8.         if ray hits an object in scene:
 9.             compute the color of the object
10.        else:
11.            return the background color
12.     write buffer to PNG file
13.     deallocate the image buffer
{% endhighlight %}


As external resources for xml parsing I have used tinyxml and for saving the images as png files I have used lodepng.

### Results:
_______________________________

For this homework provided scenes can be sorted by their complexity like this :
-simple.xml
-cornellbox.xml
-spheres.xml
-bunny.xml
-scienceTree.xml

First three scenes are pretty straight forward as they have less objects and therefore fast rendering times:
{:refdef: style="text-align: center;"}
![simple.xml rendering time : 0.324 seconds](/assets/img/advanced_ray_tracing_hw1/simple.png)
{: refdef}
<center><b> simple.xml </b></center>
<center>rendering time : 0.324 seconds </center>

{:refdef: style="text-align: center;"}
![cornellbox.xml rendering time : 0.324 seconds](/assets/img/advanced_ray_tracing_hw1/cornellbox.png)
{: refdef}
<center><b> cornellbox.xml </b></center>
<center>rendering time : 0.849 seconds </center>

{:refdef: style="text-align: center;"}
![spheres.xml rendering time : 0.324 seconds](/assets/img/advanced_ray_tracing_hw1/spheres.png)
{: refdef}
<center><b> spheres.xml </b></center>
<center>rendering time : 0.417 seconds </center>

The bunny.xml and scienceTree.xml were the harder scenes as scienceTree had a higher resolution and bunny had the highest vertex count.

{:refdef: style="text-align: center;"}
![bunny.xml rendering time : 0.324 seconds](/assets/img/advanced_ray_tracing_hw1/bunny.png)
{: refdef}
<center><b> bunny.xml </b></center>
<center>rendering time : 65.142 seconds </center>

{:refdef: style="text-align: center;"}
![scienceTree.xml rendering time : 0.324 seconds](/assets/img/advanced_ray_tracing_hw1/scienceTree.png)
{: refdef}
<center><b> scienceTree.xml </b></center>
<center>rendering time : 94.343 seconds </center>

### Some of the errors

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw1/phong_exponent_negative_cos_wrong_records.png)
{: refdef}

This was the first result I rendered after the initial debugging of the system. The result caused by lack of multiple important operations such as : color clamping, phong exponent, hit_record errors, cos sign checks etc.

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw1/shadow_epsilon _and_wrong_hit_record.png)
{: refdef}

Another render of the scene with persisting hit_record errors and shadow exponent problems.

{:refdef: style="text-align: center;"}
![scienceTree.xml rendering time : 0.324 seconds](/assets/img/advanced_ray_tracing_hw1/simple_no_clamp.png)
{: refdef}

A render of simple scene without color clamping.

{:refdef: style="text-align: center;"}
![scienceTree.xml rendering time : 0.324 seconds](/assets/img/advanced_ray_tracing_hw1/triangle_bug.png)
{: refdef}

Another render of hit_record error in cornellbox scene.

{:refdef: style="text-align: center;"}
![scienceTree.xml rendering time : 0.324 seconds](/assets/img/advanced_ray_tracing_hw1/unitness.png)
{: refdef}

A wrong scienceTree render, the triangles extrude because of an error in the ray triangle intersection 
