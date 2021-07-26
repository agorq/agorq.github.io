---
layout: post
title:  "Advanced Ray Tracing Homework 6 - BRDF"
date:  2021-07-20
categories: [Advanced_Ray_Tracing]
comments: true
---

Hello!

With the sixth step of this ray tracing adventure we were expected to add bidirectional reflectance distribution functions (BRDFs) to our ray tracer. BRDF's simulate the materials reflectance distribution for given incoming and outgoing raydirections for any given point. With the introduction of BRDFs we can define more complex materials to match our world. For this homework we were expected to implement 3 BRDF's.

- Phong BRDF
- Blinn-Phong BRDF 
- Torrance-Sparrow BRDF

For Phong and Blinn-Phong BRDF models we were expected to add their modified counterparts and ability to normalize their results for them to be energy conserving.

### BRDFs
______________________________
Before the intentional addition of BRDFs to our ray tracer we were using the modified Blinn-Phong BRDF unintentionally. To start the implementation I have created the BRDF class and moved the unintentional Blinn-Phong to its respective class. The BRDF base class basically holds its mode and exponent and return a response for the given directions. The basic brdf structure look like this:

{% highlight C %}
struct BRDF
{
    float exp;
    brdf_mode mode;
    virtual float response(const Vector3& w_in, const Vector3& w_out, const hit_record& rec, bool& normalized) = 0;
};
{% endhighlight %}

In the following sections I will be detailing each BRDF and their respective mods.
#### Phong BRDF
The main goal of Phong BRDF is finding the angle of deviance from ideal reflected ray. The amount of deviance changes the highlights caused by the specular coefficient. The brdf returns the coefficient we will using for changing the specular parameter of the material.
{% highlight C %}
float PhongBRDF::response(const Vector3& w_in, const Vector3& w_out, const hit_record& rec, bool& normalized)
{
    // Find the ideal reflected ray
    Vector3 a_r = (2 * dot(w_in, rec.normal) * rec.normal - w_in);
    // Find the deviance
    float ret = std::pow(std::max(float(0), dot(a_r, w_out * -1)), exp);
    switch (mode)
    {
    case original:
        return ret / dot(w_in, rec.normal);
        break;
    case modified:
        return ret;
        break;
    case modified_normalized:
        // Normalization is done in material class
        normalized = true;
        return (ret * (exp + 2) / 2);
        break;
    }
}

{% endhighlight %}

#### Blinn-Phong BRDF

In Blinn-Phong BRDF we use the deviance between half-vector and normal. The half vector is produced with the addition of $$w_{in}$$ and $$w_{out}$$. The main advantage of Blinn Phong model is more visible in forward rendering pipelines. It saves time as it can be calculated for each vertex and can be interpolated for intermediate results.

{% highlight C %}
float BlinnPhongBRDF::response(const Vector3& w_in, const Vector3& w_out, const hit_record& rec, bool& normalized)
{
    // Find the half vector
    Vector3 h = (unit_vector(w_out * -1) + unit_vector(w_in)) /
        (unit_vector(w_out * -1) + unit_vector(w_in)).length();
    // Find the deviance
    float ret = std::pow(std::max(float(0), dot(h, rec.normal)), exp);
    switch (mode)
    {
    case original:
        return ret / dot(w_in, rec.normal);
        break;
    case modified:
        return ret;
        break;
    case modified_normalized:
        normalized = true;
        return ret * (exp + 8) / 8;
        break;
    }
}
{% endhighlight %}

#### Torrance-Sparrow BRDF

In Torrance-Sparrow model the surface of the object is treat like it is made of micro-facets. The micro-facets have geometry term G to model their shadowing and masking and a Fresnel coefficient for their mirror like behaviours.

{% highlight C %}
float TorranceSparrowBRDF::response(const Vector3& w_in, const Vector3& w_out, const hit_record& rec, bool& normalized)
{
    normalized = true;

    Vector3 _w_out = -1 * w_out;
    Vector3 n = rec.normal;
    // Calculate the half vector
    Vector3 h = (unit_vector(_w_out) + unit_vector(w_in)) /
        (unit_vector(_w_out) + unit_vector(w_in)).length();
    // Micro-facet distribution function
    float D = (exp+2) * std::pow(std::max(float(0), dot(n, h)), exp) / 2;
    // Geometry Term
    float g = std::min(2 * dot(n, h) * dot(n, _w_out) / dot(h, _w_out), 2 * dot(n, h) * dot(n, w_in) / dot(h, _w_out));
    float G = std::min(g, 1.0f);
    float cost = dot(w_in, n), cosp = dot(_w_out, n);
    // Final coefficient Fresnel is added in material
    return D*G/(4*cosp*cost);
}
{% endhighlight %}
### Results:
_______________________________

For this homework, we were provided with 9 scenes. 3 for each Phong and Blinn-Phong to represent each option (original, modified, modified_normalized) 1 for basic Torrance-Sparrow and 2 for showcasing Blinn-Phong and Blinn-Phong on killeroo scene:
1. **brdf_phong_original.xml** 
2. **brdf_phong_modified.xml**
3. **brdf_phong_modified_normalized.xml**
4. **brdf_blinnphong_original.xml**
5. **brdf_blinnphong_modified.xml** 
6. **brdf_blinnphong_modified_normalized.xml** 
7. **brdf_torrancesparrow.xml** 
8. **killeroo_blinnphong.xml**
9. **killeroo_torrancesparrow.xml**

{:refdef: style="text-align: center;"}
![brdf_phong_original.xml rendering time : 0.1 seconds](/assets/img/advanced_ray_tracing_hw6/final/brdf_phong_original.png)
{: refdef}
<center><b> brdf_phong_original.xml </b></center>
<center>rendering time : 0.1 seconds </center>

{:refdef: style="text-align: center;"}
![brdf_phong_modified.xml rendering time : 0.096 seconds](/assets/img/advanced_ray_tracing_hw6/final/brdf_phong_modified.png)
{: refdef}
<center><b> brdf_phong_modified.xml </b></center>
<center>rendering time : 0.096 seconds </center>

{:refdef: style="text-align: center;"}
![brdf_phong_modified_normalized.xml rendering time : 0.094 seconds](/assets/img/advanced_ray_tracing_hw6/final/brdf_phong_modified_normalized.png)
{: refdef}
<center><b> brdf_phong_modified_normalized.xml </b></center>
<center>rendering time : 0.094 seconds </center>

{:refdef: style="text-align: center;"}
![brdf_blinnphong_original.xml rendering time : 0.093 seconds](/assets/img/advanced_ray_tracing_hw6/final/brdf_blinnphong_original.png)
{: refdef}
<center><b> brdf_blinnphong_original.xml </b></center>
<center>rendering time : 0.093 seconds </center>

{:refdef: style="text-align: center;"}
![brdf_blinnphong_modified.xml rendering time : 0.095 seconds](/assets/img/advanced_ray_tracing_hw6/final/brdf_blinnphong_modified.png)
{: refdef}
<center><b> brdf_blinnphong_modified.xml </b></center>
<center>rendering time : 0.095 seconds </center>

{:refdef: style="text-align: center;"}
![brdf_blinnphong_modified_normalized.xml rendering time : 1.07 seconds](/assets/img/advanced_ray_tracing_hw6/final/brdf_blinnphong_modified_normalized.png)
{: refdef}
<center><b> brdf_blinnphong_modified_normalized.xml </b></center>
<center>rendering time : 1.07 seconds </center>

{:refdef: style="text-align: center;"}
![brdf_torrancesparrow.xml rendering time : 1.11 seconds](/assets/img/advanced_ray_tracing_hw6/final/brdf_torrancesparrow.png)
{: refdef}
<center><b> brdf_torrancesparrow.xml </b></center>
<center>rendering time : 1.11 seconds </center>

{:refdef: style="text-align: center;"}
![killeroo_blinnphong.xml rendering time : 11.456 seconds](/assets/img/advanced_ray_tracing_hw6/final/killeroo_blinnphong.png)
{: refdef}
<center><b> killeroo_blinnphong.xml </b></center>
<center>rendering time : 11.456 seconds </center>

{:refdef: style="text-align: center;"}
![killeroo_blinnphong.xml - closeup rendering time : 23.578 seconds](/assets/img/advanced_ray_tracing_hw6/final/killeroo_blinnphong_closeup.png)
{: refdef}
<center><b> killeroo_blinnphong.xml - closeup </b></center>
<center>rendering time : 23.578 seconds </center>

{:refdef: style="text-align: center;"}
![killeroo_torrancesparrow.xml rendering time : 12.374 seconds](/assets/img/advanced_ray_tracing_hw6/final/killeroo_torrancesparrow.png)
{: refdef}
<center><b> killeroo_torrancesparrow.xml </b></center>
<center>rendering time : 12.374 seconds </center>

{:refdef: style="text-align: center;"}
![killeroo_torrancesparrow.xml - closeup rendering time : 23.436 seconds](/assets/img/advanced_ray_tracing_hw6/final/killeroo_torrancesparrow_closeup.png)
{: refdef}
<center><b> killeroo_torrancesparrow.xml - closeup </b></center>
<center>rendering time : 23.436 seconds </center>



