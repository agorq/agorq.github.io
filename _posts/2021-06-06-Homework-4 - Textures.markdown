---
layout: post
title:  "Advanced Ray Tracing Homework 4 - Textures"
date:  2021-06-06
categories: [Advanced_Ray_Tracing]
comments: true
---

Hello!

For the fourth step of our ray tracer development journey we were expected to implement texturing capabilities for our ray tracer. In two weeks of time we were expected to add image textures and noise textures (perlin noise) to our ray tracer with the following mapping techniques:

- Background texture
- Response replacing textures
- Diffuse color maps
- Normal maps
- Bump maps

### Textures
______________________________
Texture mapping is a crucial technique for rendering. As it can be used to introduce color complexity and normal complexity without actually increasing the geometric complexity of the data. We were expected to add two sources of texture data: Image texture, Noise texture. Image textures as it can be understood from the name get their response from image files. Noise textures on the other hand can generate their response through a noise function. In the following subsections, I will give a more detailed explanation about how I added these textures to my raytracer.

#### Image Textures

As mentioned from the previous section, image textures depend on a image to sample for the production of responses. To add the image textures to my code I have added a Image struct array to my scene class which keeps the image data, width, height and a sampler method for later use.

#### Noise Textures

Noise textures on the other hand returns a response in the range of [0,1] for each location on the space. For the scope of this homework we were expected to implement perlin noise. For implementation I have followed the 3-D perlin noise description in the lecture videos.


### Texture Modes

After the implementation of the Texture response generators. I have added the mapping following techniques:

#### Background Mode
The most basic texture mapping operation. In case of missing rays texture is sampled with the uv coordinate of image plane.

#### Response Replacement Mode
Another straight forward texture mapping operation. Sampled texture overwrites the behaviour of the material of the hitable.

#### Diffuse Color Mode
The response of the texture is feeded into material as diffuse data. The diffuse data may replace the original diffuse value of the material or may be mixed with the original diffuse.

#### Normal Texture Mode
After the range correction and the normalization of the texture response, texture response gets corrected for the surfaces with TBN matrix. The corrected response replaces the normal supplied to the material class.

#### Bump Texture Mode
With bump texture mode we modify the normals supplied to the material by the hitable. The normals are modified as if the hitable surface is bumped by the texture response.

### Changes to the pipeline

For this homework I have added two base classes for the renderer. First is the image class as mentioned from the previous chapters it keeps the image data, width and height of it and sampling methods for it. Other base class introduced to the system is texture base class. Texture base class have two main derived classes noise texture and image texture. These classes hold related information for modifying the response gathered from their respective source of texture.

Another major change I have introduced for the system is source of color response after a successful hit. Before the introduction of textures the record used to held a reference to the material and the material was the one responsible for generation of color response. With the textures materials are not the only ones responsible for the color response of the hitables therefore I have carried the color response responsbility to the hitables.

The main loop of the renderer was like the following before the introduction of the textures.

{% highlight C %}
function main:
 1. parse XML file and create the scene
 2. for each camera:
 3.     preprocess camera data
 4.     initialize image buffer
 5.     for each pixel:
 6.         create ray
 7.         send ray to the scene
 8.         if ray hits an object in scene:
 9.             compute the color response of the material
10.         else:
11.             return the background color
12.     write buffer to PNG file
13.     deallocate the image buffer
{% endhighlight %}

With the addition of textures the main loop changed like this.

{% highlight C %}
function main:
 1. parse XML file and create the scene
 2. for each camera:
 3.     preprocess camera data
 4.     initialize image buffer
 5.     for each pixel:
 6.         create ray
 7.         send ray to the scene
 8.         if ray hits an object in scene:
 9.             rec.hitable.response()
 10.        else if background_texture > 0:
 11.            background_texture.response()
 12.        else:
 13.            return the background color
 14.    write buffer to PNG file
 15.    deallocate the image buffer
{% endhighlight %}

### Results:
_______________________________

For this homework, we were provided with 18 scenes. The scenes featured previously mentioned requirements in their xml files. The results I got from the scenes and their render times are supplied below.

{:refdef: style="text-align: center;"}
![bump_mapping_transformed.xml rendering time : 0.360 seconds](/assets/img/advanced_ray_tracing_hw4/final/bump_mapping_transformed.png)
{: refdef}
<center><b> bump_mapping_transformed.xml </b></center>
<center>rendering time : 0.360 seconds </center>

{:refdef: style="text-align: center;"}
![cube_cushion.xml rendering time : 0.188 seconds](/assets/img/advanced_ray_tracing_hw4/final/cube_cushion.png)
{: refdef}
<center><b> cube_cushion.xml </b></center>
<center>rendering time : 0.188 seconds </center>

{:refdef: style="text-align: center;"}
![cube_perlin_bump.xml rendering time : 0.896 seconds](/assets/img/advanced_ray_tracing_hw4/final/cube_perlin_bump.png)
{: refdef}
<center><b> cube_perlin_bump.xml </b></center>
<center>rendering time : 0.896 seconds </center>

{:refdef: style="text-align: center;"}
![cube_perlin.xml rendering time : 0.216 seconds](/assets/img/advanced_ray_tracing_hw4/final/cube_perlin.png)
{: refdef}
<center><b> cube_perlin.xml </b></center>
<center>rendering time : 0.216 seconds </center>

{:refdef: style="text-align: center;"}
![cube_wall_normal.xml rendering time : 0.206 seconds](/assets/img/advanced_ray_tracing_hw4/final/cube_wall_normal.png)
{: refdef}
<center><b> cube_wall_normal.xml </b></center>
<center>rendering time : 0.206 seconds </center>

{:refdef: style="text-align: center;"}
![cube_wall.xml rendering time : 0.201 seconds](/assets/img/advanced_ray_tracing_hw4/final/cube_wall.png)
{: refdef}
<center><b> cube_wall.xml </b></center>
<center>rendering time : 0.201 seconds </center>

{:refdef: style="text-align: center;"}
![cube_waves.xml rendering time : 0.152 seconds](/assets/img/advanced_ray_tracing_hw4/final/cube_waves.png)
{: refdef}
<center><b> cube_waves.xml </b></center>
<center>rendering time : 0.152 seconds </center>

{:refdef: style="text-align: center;"}
![ellipsoids_texture.xml rendering time : 0.244 seconds](/assets/img/advanced_ray_tracing_hw4/final/ellipsoids_texture.png)
{: refdef}
<center><b> ellipsoids_texture.xml </b></center>
<center>rendering time : 0.244 seconds </center>

{:refdef: style="text-align: center;"}
![galactica_dynamic.xml rendering time : 163.00 seconds](/assets/img/advanced_ray_tracing_hw4/final/galactica_dynamic.png)
{: refdef}
<center><b> galactica_dynamic.xml </b></center>
<center>rendering time : 163.00 seconds </center>

{:refdef: style="text-align: center;"}
![galactica_static.xml rendering time : 1.9 seconds](/assets/img/advanced_ray_tracing_hw4/final/galactica_static.png)
{: refdef}
<center><b> galactica_static.xml </b></center>
<center>rendering time : 1.9 seconds </center>

{:refdef: style="text-align: center;"}
![killeroo_bump_walls.xml rendering time : 8.123 seconds](/assets/img/advanced_ray_tracing_hw4/final/killeroo_bump_walls.png)
{: refdef}
<center><b> killeroo_bump_walls.xml </b></center>
<center>rendering time : 8.123 seconds </center>

{:refdef: style="text-align: center;"}
![sphere_nearest_bilinear.xml rendering time : 0.103 seconds](/assets/img/advanced_ray_tracing_hw4/final/sphere_nearest_bilinear.png)
{: refdef}
<center><b> sphere_nearest_bilinear.xml </b></center>
<center>rendering time : 0.103 seconds </center>

{:refdef: style="text-align: center;"}
![sphere_nobump_bump.xml rendering time : 0.150 seconds](/assets/img/advanced_ray_tracing_hw4/final/sphere_nobump_bump.png)
{: refdef}
<center><b> sphere_nobump_bump.xml </b></center>
<center>rendering time : 0.150 seconds </center>

{:refdef: style="text-align: center;"}
![sphere_nobump_justbump.xml rendering time : 0.134 seconds](/assets/img/advanced_ray_tracing_hw4/final/sphere_nobump_justbump.png)
{: refdef}
<center><b> sphere_nobump_justbump.xml </b></center>
<center>rendering time : 0.134 seconds </center>

{:refdef: style="text-align: center;"}
![sphere_normal.xml rendering time : 9.151 seconds](/assets/img/advanced_ray_tracing_hw4/final/sphere_normal.png)
{: refdef}
<center><b> sphere_normal.xml </b></center>
<center>rendering time : 9.151 seconds </center>

{:refdef: style="text-align: center;"}
![sphere_perlin_bump.xml rendering time : 0.798 seconds](/assets/img/advanced_ray_tracing_hw4/final/sphere_perlin_bump.png)
{: refdef}
<center><b> sphere_perlin_bump.xml </b></center>
<center>rendering time : 0.798 seconds </center>

{:refdef: style="text-align: center;"}
![sphere_perlin_scale.xml rendering time : 0.306 seconds](/assets/img/advanced_ray_tracing_hw4/final/sphere_perlin_scale.png)
{: refdef}
<center><b> sphere_perlin_scale.xml </b></center>
<center>rendering time : 0.306 seconds </center>

{:refdef: style="text-align: center;"}
![sphere_perlin.xml rendering time : 0.314 seconds](/assets/img/advanced_ray_tracing_hw4/final/sphere_perlin.png)
{: refdef}
<center><b> sphere_perlin.xml </b></center>
<center>rendering time : 0.314 seconds </center>

### Some of the errors

The following images are produced during the debuggin of noise textures.

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw4/sphere_perlin.png)
{: refdef}

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw4/sphere_perlin_bump.png)
{: refdef}

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw4/cube_perlin_bump.png)
{: refdef}


The normalization of normals was another problem I have forgotten to remember during implementation.

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw4/sphere_nobump_bump.png)
{: refdef} 

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw4/sphere_nobump_justbump.png)
{: refdef}

For a good amount of time I did not notice there was a shift value in xml files these problems got solved after adding the feature.

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw4/galactica_static.png)
{: refdef}

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw4/killeroo_bump_walls.png)
{: refdef}

These problems arised because of me forgetting that my inplace sorting during bvh creating mixing up my hitable indexing.

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw4/ellipsoids_texture.png)
{: refdef}

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw4/cube_wall_normal.png)
{: refdef}

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw4/bump_mapping_transformed.png)
{: refdef}

### Conclusion

In this step of the project we were expected to implement a multitude of texture mapping modes for 2 different texture sources. The most challenging part of the implementation was the replanning of the color method after a successful hit. The remaining parts of the implementation was straightforward as they were mostly calculated through minimal basic operations.