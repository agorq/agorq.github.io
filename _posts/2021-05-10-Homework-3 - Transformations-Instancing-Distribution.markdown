---
layout: post
title:  "Advanced Ray Tracing Homework 3 - Transformation, Instancing and Distribution Ray Tracing"
date:  2021-05-09
categories: [Advanced_Ray_Tracing]
comments: true
---

Greetings!

In the third step of our ray tracer development we were expected to implement the following in two weeks:
- **Transformation:** Addition of transformation matrices and updated BVH traversals to support these changes.
- **Instancing:** As an addition to the transformations we were expected to add instancing for a better memory management.
- **Distribution Ray Tracing:** As a final addition we were expected to implement some distribution ray tracing effects including area light, motion blur, etc.

In the following sections, I will briefly explain what I have done for each of these subjects, how they changed the structure of my ray tracer and conclude with results and some of the interesting results I got while working on them.

### Transformations and Instancing
______________________________
For the introduction of the transformations to the tracer, first thing required is matrices especially 4x4 ones. With the introduction of the matrix struct and basic matrix operations like transpose, inverse, matmul etc. I implemented a transformation class. Transformations keep a matrix and its inverse. All leaf hitables hold a transformation. The transformations we were required to implemented were the most basic ones (transformation, rotation and scaling).

The biggest difficulty I had while implementing the transformations was correction of the misimplementation of meshes. In previous homeworks I was adding the triangles of the mesh to the hitable vector. The introduction of the transformations and instancing made this approach false as after adding the triangles it was impossible to instance them for different transformations and materials. To solve this I had to implement an actual mesh class which had its own bvh and other basic hitable variables.

#### Instancing 

Instancing is a straightforward technique used for the prevention of storage of the same mesh over and over. An instance of a mesh points toward another meshes geometry data while storing its unique data such as material and transformation to create modified versions of them.

### Distribution Ray Tracing

Distribution ray tracing refers to the effects we get with a little cost after the introduction of the multisampling to a ray tracer. For this step we were expected to implement 4 effects that can be counted as *Distribution Ray Tracing* effect. The effects are the following:

- **Motion Blur :** With the addition of the time parameter to rays this effect replicates a motion blur effect thanks to random sampling of time parameter for each ray send.
- **Depth of Field :** This effect imitates the focal distance effect caused by a lens by sampling points on the lens and making the ray pass through the lens.
- **Glossy Reflections :** This effect is achieved by altering the reflected ray with its basis vectors for a less homogenous reflected ray direction.
- **Area Lights :** The area light effect is gotten with an area light area where we sample the lights position. Because of the change in the position of area light in each iteration in cases of soft shadow the rays can not always reach to the light situation creates the forementioned effect.


### XML Scene Descriptor Extensions

In this iteration, there were a lot of changes to our XML scene descriptor.

The PLY files supported the quads, there was the introduction of the area lights, multisampling, transformations and instancing. Each of these changes brought their fair share of updates for our XML parser. Because of the extended time I spend on the parsing section I plan to reimplement some sections with a better hierarchy for a better modifiable parser for future works.

### Results:
_______________________________

For this homework we were provided with 8 scenes. The following list displays these scenes sorted by their complexity and with the required techniques for their rendering :
1. **simple_transform.xml :** Addition of transformations.
2. **ellipsoids.xml :** A more advanced transformation scene.
3. **spheres_dof.xml :** Addition of depth of field, multisampling.
4. **cornellbox_area.xml :** Addition of area lights.
5. **cornellbox_brushed_metal.xml :** Addition of Roughness
6. **metal_glass_plates.xml :** Addition of instancing, and second roughness based scene.
7. **cornellbox_boxes_dynamic.xml :** Addition of motion blur, quads.
8. **dragon_dynamic.xml :** A computationally expensive scene that uses motion blur and instancing.

The results of these scenes with their BVH construction time and rendering times are supplied below. The scenes take a little more time because of the introduction of multisampling. The last scene was the one that took the most time for rendering.

{:refdef: style="text-align: center;"}
![simple_transform.xml rendering time : 0.107 seconds](/assets/img/advanced_ray_tracing_hw3/final/simple_transform.png)
{: refdef}
<center><b> simple_transform.xml </b></center>
<center>rendering time : 0.107 seconds </center>

{:refdef: style="text-align: center;"}
![ellipsoids.xml rendering time : 0.324 seconds](/assets/img/advanced_ray_tracing_hw3/final/ellipsoids.png)
{: refdef}
<center><b> ellipsoids.xml </b></center>
<center>rendering time : 0.188 seconds </center>

{:refdef: style="text-align: center;"}
![spheres_dof.xml rendering time : 11.775 seconds](/assets/img/advanced_ray_tracing_hw3/final/spheres_dof.png)
{: refdef}
<center><b> spheres_dof.xml </b></center>
<center>rendering time : 11.775 seconds </center>

{:refdef: style="text-align: center;"}
![cornellbox_area.xml rendering time : 14.961 seconds](/assets/img/advanced_ray_tracing_hw3/final/cornellbox_area.png)
{: refdef}
<center><b> cornellbox_area.xml </b></center>
<center>rendering time : 14.961 seconds </center>

{:refdef: style="text-align: center;"}
![cornellbox_brushed_metal.xml rendering time : 47.731 seconds](/assets/img/advanced_ray_tracing_hw3/final/cornellbox_brushed_metal.png)
{: refdef}
<center><b> cornellbox_brushed_metal.xml </b></center>
<center>rendering time : 47.731 seconds </center>

{:refdef: style="text-align: center;"}
![metal_glass_plates.xml rendering time : 34.541 seconds](/assets/img/advanced_ray_tracing_hw3/final/metal_glass_plates.png)
{: refdef}
<center><b> metal_glass_plates.xml </b></center>
<center>rendering time : 34.541 seconds </center>

{:refdef: style="text-align: center;"}
![cornellbox_boxes_dynamic.xml rendering time : 91.357 seconds](/assets/img/advanced_ray_tracing_hw3/final/cornellbox_boxes_dynamic.png)
{: refdef}
<center><b> cornellbox_boxes_dynamic.xml </b></center>
<center>rendering time : 91.357 seconds </center>

{:refdef: style="text-align: center;"}
![dragon_dynamic.xml rendering time : 30.32 minutes](/assets/img/advanced_ray_tracing_hw3/final/dragon_dynamic.png)
{: refdef}
<center><b> dragon_dynamic.xml </b></center>
<center>rendering time : 30.32 minutes </center>

### Some of the errors

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw3/simple_transform.png)
{: refdef}

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw3/ellipsoids.png)
{: refdef}

During the correction of the mesh class I got some interesting results for the basic transformation scenes.

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw3/cornellbox_area.png)
{: refdef}

I also struggled a bit while trying to get the arealight to work. This error was caused by my dumb mistake of not multiplying the attenuation value by the luminance of the area light source.


{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw3/cornellbox_boxes_dynamic.png)
{: refdef}

This was the result that got me to remember including quads for the parser.


{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw3/darkcorn.png)
{: refdef}

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw3/darkdargon.png)
{: refdef}

These were the mistakes I got while trying to get the motion blur correct. The occlusion rays do not work as intended.