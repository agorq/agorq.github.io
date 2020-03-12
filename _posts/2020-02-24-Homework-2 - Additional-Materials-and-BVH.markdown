---
layout: post
title:  "Advanced Ray Tracing Homework 2 - Additional Materials and BVH"
date:  2020-03-11
categories: [Advanced_Ray_Tracing]
comments: true
---

Hello Again!

For the last 2 weeks we were expected to add:
- Additional materials like conductors and dielectrics to further improve the visual variance of our scenes
- An acceleration structure, for my case I have used the Bounded Volume Hierarchy (BVH)
- Some improvements to our XML parser to support fov based camera descriptions and PLY files.

In the following sections, I will briefly explain what I have done for each of these subjects, how they changed the structure of my ray tracer and conclude with results and some of the interesting results I got while working on them.

### Materials
______________________________
The first thing that was expected to add was the materials as our ray tracers were only capable of rendering materials with the Blinn-Phong material. In my first iteration, I had a *Material* class for this interaction. As we are required to add more materials I have changed my *Material* class to become a virtual base class and redefined the basic Blinn-Phong materials with the *Basic* class.

The following materials are added to our ray tracer :
- Mirror: These materials perfectly reflects our incoming ray with respect to the hit positions normal direction.
- Dielectric: These materials compute reflected and refracted light to the point. These materials support Beer's law, Total Internal Reflection and Fresnel Reflection for a physically correct rendering.
- Conductor: Conductors behave like metallic objects, their main difference with mirrors is that they consume some of the incoming light.

Each of these materials derives from our virtual *Material* class.

### Acceleration Structure 

Acceleration structures are one of the vital parts of a ray-tracing system. They reduce the complexity of the scene dramatically and increase our chances of testing our system. For Orb I have decided to use Bounding Volume Hierarchy (BVH) as an acceleration structure. I choose BVH's because of their *Hittable* based architecture, this architecture helps against the sparse structures and will be helpful in cases where the objects in the scene move as BVH's do not struggle a lot when against a problem like that.

For implementing BVH to my ray tracer I have drastically changed the main hittable structure. I have completely removed the meshes from the system as they increase the depth of my BVH. Another change I made to the system is the introduction of Axis Aligned Bounded Boxes (AABB)'s to the hittable. With the precomputation of these boxes, the ray tracer saves a considerable amount of time during the construction of the BVH.

The addition of the BVH changes the our main flow like this:

{% highlight C %}
function main:
 1. parse XML file and create the scene
 2. process each hittable and create their bounds
 3. construct BVH and assign it to the scene
 4. for each camera:
 5.     preprocess camera data
 6.     initialize image buffer
 7.     for each pixels:
 8.         create ray
 9.         send ray to the scene BVH
10.         if ray hits an object in scene:
11.             compute the color of the object
12.        else:
13.            return the background color
14.     write buffer to PNG file
15.     deallocate the image buffer
{% endhighlight %}

### XML Scene Descriptor Extensions

In this iteration, we had two major additions for scene descriptors.

The first one is the PLY files. The PLY files are needed for this project as we will be adding more objects to our XML files and some of these objects might be too big for an XML file to handle. This problem increases the cost of parsing the XML. I have used the happly for PLY parser, happly is pretty efficient and easy to use so it is an easy recommendation.

The other change we got introduced with is fov cameras. These cameras supply the fov instead of the near plane, which means that we need to construct our near plane with our data. The only problem I have had with these cameras is that they supply the gaze point instead of the gaze vector supplied by the default camera.

### Results:
_______________________________

For this homework we were provided with the following scenes:
-spheres.xml
-cornellbox_recursive.xml
-scienceTree.xml
-chinese_dragon.xml
-other_dragon.xml

The results of these scenes with their BVH construction time and rendering times are supplied below. The times are considerably fast in this week as I have included OpenMP for a multi-threaded faster rendering.

{:refdef: style="text-align: center;"}
![simple.xml rendering time : 0.324 seconds](/assets/img/advanced_ray_tracing_hw2/final_results/cornellbox_recursive.png)
{: refdef}
<center><b> spheres.xml </b></center>
<center>BVH construction time : 0.00013 seconds </center>
<center>rendering time : 0.257 seconds </center>

{:refdef: style="text-align: center;"}
![simple.xml rendering time : 0.324 seconds](/assets/img/advanced_ray_tracing_hw2/final_results/spheres.png)
{: refdef}
<center><b> spheres.xml </b></center>
<center>BVH construction time : 0.0001 seconds </center>
<center>rendering time : 0.162 seconds </center>

{:refdef: style="text-align: center;"}
![cornellbox.xml rendering time : 0.324 seconds](/assets/img/advanced_ray_tracing_hw2/final_results/scienceTree.png)
{: refdef}
<center><b> scienceTree.xml </b></center>
<center>BVH construction time : 0.0012 seconds </center>
<center>rendering time : 0.77 seconds </center>

In this scene I have a problem with the colors of the tree, which means that I probably add up some light that I am not supposed to add.

{:refdef: style="text-align: center;"}
![spheres.xml rendering time : 0.324 seconds](/assets/img/advanced_ray_tracing_hw2/final_results/chinese_dragon.png)
{: refdef}
<center><b> chinese_dragon.xml </b></center>
<center>BVH construction time : 1.074 seconds </center>
<center>rendering time : 0.353 seconds </center>

{:refdef: style="text-align: center;"}
![bunny.xml rendering time : 0.324 seconds](/assets/img/advanced_ray_tracing_hw2/final_results/other_dragon.png)
{: refdef}
<center><b> other_dragon.xml </b></center>
<center>BVH construction time : 2.9 seconds </center>
<center>rendering time : 0.87 seconds </center>

### Some of the errors

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw2/spheres.png)
{: refdef}

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw2/spheres+recursion.png)
{: refdef}

These problems occur when the intersection epsilon is not applied to the material ray construction.

#### Refractive Material

These results are some of the errors while I was trying to figure out the refraction in the cornell box scene.

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw2/cornellbox_cut.png)
{: refdef}

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw2/cornellbox_recursive_normalisation.png)
{: refdef}

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw2/cornellbox_recursive_wrong_dir.png)
{: refdef}

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw2/bvh_shadows.png)
{: refdef}


#### Triangle Intersection Error

These results happened because of the wrong triangle hit functions.

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw2/dot.png)
{: refdef}

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw2/treerefraction.png)
{: refdef}

#### BVH Error

{:refdef: style="text-align: center;"}
![](/assets/img/advanced_ray_tracing_hw2/bvh.png)
{: refdef}
