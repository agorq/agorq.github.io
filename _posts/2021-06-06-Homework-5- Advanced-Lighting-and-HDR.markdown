---
layout: post
title:  "Advanced Ray Tracing Homework 5 - Advanced Lighting and HDR"
date:  2021-06-25
categories: [Advanced_Ray_Tracing]
comments: true
---

Hello!

With the fifth step of our ray tracer adventure we were given two tasks:

- Addition of advanced lighting methods
- Addition of HDR I/O and tonemapping.

With advanced lighting we were expected to add directional light, spot lights and spherical light maps. For the introduction of HDR we were expected to handle EXR image inputs, capability of saving rendered images in HDR format and tonemapping support for our HDR images. When compared to the other steps the requirements for this step was less than the average as most of the lighting problem was handled before this homework. The procedure I have followed for the tasks are detailed in the sections below.

### Lighting Methods
______________________________
For this step we were expected to add directional light, spot light and spherical light maps to the light collection which was consisting of ambient light, point light and area light. Before the implementation of the light sources I have started this task with refactoring of the basic light class I have written for the previous steps. For a basic limited interaction with the light sources I have defined a light_response structure which has data slots for lights direction, distance, lighting value and an attenuation flag which was needed for the special case handling of directional lights which is not attenuated. After the addition of light response struct and uniformation of light sources I have implemented the required sources as explained in subsections below

#### Directional Light
Directional lights response fills the structure in the following way.
{% highlight C %}
void DirectionalLight::response(const Scene& s,const hit_record& rec, light_response& ls)
{
    // Direction from hit position to light.
    ls.dir = unit_vector(-1*direction);
    // INF distance as the light source theoritically comes from infinity.
    ls.dist = std::numeric_limits<float>().max();
    // Surface area * radiance
    ls.color = dot(rec.normal,ls.dir) * radiance;
    // No attenuation for Directional lights
    ls.attenuate = false;
}

{% endhighlight %}

#### Spot Light

Spot lights response fills the structure in the following way.
{% highlight C %}
void SpotLight::response(const Scene& s,const hit_record& rec, light_response& ls)
{
    // Direction from hit position to light.
    ls.dir = position - rec.p;
    // Distance from hit position to light.
    ls.dist = ls.dir.length();
    // Normalize the direction
    ls.dir = unit_vector(ls.dir);
    // Fill the response based on the zone
    float angle = std::abs(dot(unit_vector(direction),ls.dir));
    if(angle >= coverage)
    {
        ls.color = intensity/(ls.dist*ls.dist);
    }
    else if(angle >= falloff)
    {
        float f = (angle-falloff)/(coverage-falloff);
        ls.color = f * intensity / (ls.dist*ls.dist);
    }
    else
    {
        ls.color = 0;
    }
}

{% endhighlight %}

#### Spherical Light Map

Spherical light map response fills the structure in the following way.

{% highlight C %}
void EnvLight::response(const Scene& s,const hit_record& rec, light_response& ls)
{
    // Sample a vector from the hemisphere with random rejection sampling
    std::uniform_real_distribution<> rand(-1,1);
    Vector3 l;
    float l_len;
    do
    {
        l.x = rand(gen);
        l.y = rand(gen);
        l.z = rand(gen);
    } while ((l_len = l.length()) > 1 || dot(l,rec.normal) <= 0);
    l = l/l_len;
    // Calculate u,v coordinate to sample from
    float theta = std::acos(l.y);
    float phi = std::atan2(l.z,l.x);
    float u = (-phi + PI)/(2 * PI);
    float v = theta/PI;
    // Fill up the structure with respective data
    ls.color = s.images[image-1]->sample_uv(u,v) * 2 * PI;
    ls.dir = l;
    ls.dist = std::numeric_limits<float>().max();    
}
{% endhighlight %}
### High Dynamic Range Imaging

Up to this step, the raytracer of ours was only outputting PNG images as a result and PNG/JPG textures as inputs. With this step we were expected to handle exr texture inputs, exr image outputs and internal tonemapping system.

First step for the introduction of HDR for my renderer was finding a suitable library for EXR file extension. I have decided to use TinyEXR library of the syoyo which worked perfectly. After the introduction of the exr I/O I have added boolean flag for output format in camera and moved the clamping and quantization operations to save_png method. I also created the save EXR format generates the EXR image from the result without modifying the data. I also have changed the image class into a pure virtual one and derivated PNG_Image and EXR_Image classes from it as their data is saved in different kind of arrays.

After the introduction of EXR I/O I have started to implement tonemapping operator. For tonemapper I have implemented Reinhard's global tone mapping operator. For implementation I have used the article and banterle's hdrtoolbox as reference.

### Results:
_______________________________

For this homework, we were provided with 7 scenes. The following list displays these scenes sorted by their complexity and with the required techniques for their rendering :
1. **cube_point.xml** 
2. **cornellbox_area.xml**
3. **cube_directional.xml**
4. **dragon_spot_light_msaa.xml**
5. **cube_point_hdr.xml** 
6. **sphere_point_hdr_texture.xml** 
7. **head_env_light.xml**

{:refdef: style="text-align: center;"}
![cube_point.xml rendering time : 0.188 seconds](/assets/img/advanced_ray_tracing_hw5/final/cube_point.png)
{: refdef}
<center><b> cube_point.xml </b></center>
<center>rendering time : 0.188 seconds </center>

{:refdef: style="text-align: center;"}
![cube_directional.xml rendering time : 0.130 seconds](/assets/img/advanced_ray_tracing_hw5/final/cube_directional.png)
{: refdef}
<center><b> cube_directional.xml </b></center>
<center>rendering time : 0.130 seconds </center>

{:refdef: style="text-align: center;"}
![cornellbox_area.xml rendering time : 14.522 seconds](/assets/img/advanced_ray_tracing_hw5/final/cornellbox_area.png)
{: refdef}
<center><b> cornellbox_area.xml </b></center>
<center>rendering time : 14.522 seconds </center>

{:refdef: style="text-align: center;"}
![dragon_spot_light_msaa.xml rendering time : 25.914 seconds](/assets/img/advanced_ray_tracing_hw5/final/dragon_spot_light_msaa.png)
{: refdef}
<center><b> dragon_spot_light_msaa.xml </b></center>
<center>rendering time : 25.914 seconds </center>

{:refdef: style="text-align: center;"}
![cube_point_hdr.xml rendering time : 0.205 seconds](/assets/img/advanced_ray_tracing_hw5/final/cube_point_hdr.png)
{: refdef}
<center><b> cube_point_hdr.xml </b></center>
<center>rendering time : 0.205 seconds </center>

{:refdef: style="text-align: center;"}
![sphere_point_hdr_texture.xml rendering time : 0.204 seconds](/assets/img/advanced_ray_tracing_hw5/final/sphere_point_hdr_texture.png)
{: refdef}
<center><b> sphere_point_hdr_texture.xml </b></center>
<center>rendering time : 0.204 seconds </center>

{:refdef: style="text-align: center;"}
![head_env_light.xml rendering time : 267.122 seconds](/assets/img/advanced_ray_tracing_hw5/final/head_env_light.png)
{: refdef}
<center><b> head_env_light.xml </b></center>
<center>rendering time : 267.122 seconds </center>
