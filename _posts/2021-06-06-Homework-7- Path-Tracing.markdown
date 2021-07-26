---
layout: post
title:  "Advanced Ray Tracing Homework 7 - Object Lights and Path tracing"
date:  2021-07-23
categories: [Advanced_Ray_Tracing]
comments: true
---

Hello!

For this final step of our ray tracing journey we were expected to add object lights (MeshLights, SphereLights) and path tracing with the following techniques importance sampling, russian roulette and next event estimation.

### Object Lights
______________________________
Up to this point we have added point, area, directional and spot lights to our tracer. In this step we were expected to add the last part of this light source collection. Object lights are basically objects with a radiance parameter added to them. To add them to the system I have added a special light class for both mesh lights and sphere lights. I also added respective sampling methods for both mesh and sphere hitables. In the following sections I will give detailed explanation for each of these light sources.

#### Mesh Lights
For mesh lights the first thing I have added was addition of the sampling for triangles. 
{% highlight C %}
Vector3 Face::sample(const Scene& s) {
    // Sample the random numbers
    std::uniform_real_distribution<> rand(0, 1);
    float r1 = std::sqrt(rand(gen)),r2 = rand(gen);
    // Pull the vertex data from the scene
    const Vector3& v0 = s.vertex_data[v0_id - 1];
    const Vector3& v1 = s.vertex_data[v1_id - 1];
    const Vector3& v2 = s.vertex_data[v2_id - 1];
    // Return the sampled points
    return (1-r1) * v0 + r1 * (r2 * v1 + (1 - r2) * v2);
}
{% endhighlight %}

After the addition of the triangle sampling, next requirement is a triangle selection method based on triangle area. To do this I have added a vector to hold the cdf I will be creating to my mesh class. I modified the BVH generation to also calculate the CDF of the mesh. 

{% highlight C %}
void Mesh::constructBVH(const Scene &s){
    // CDF starts from 0
    float p_area = 0;
    for(Face face : faces) {
        
        cdf.push_back(p_area);
        // Calculate and cumulate the area of the triangle
        p_area = face.area(s);
        total_area += p_area;


        Triangle* a = new Triangle(face);
        a->t = std::make_unique<Transform>(Transform());
        a->bounding_box(s);
        tris.push_back(a);
    }
    // Accumulate the areas forward
    for (int i = 1; i < cdf.size(); i++)
    {
        cdf[i] += cdf[i - 1];
    }
    // Normalize the CDF
    for (int i = 1; i < cdf.size(); i++)
    {
        cdf[i] /= total_area;
    }
    bvh = new BVH_node(tris, tris.size(), 0);
}
{% endhighlight %}

With these preparations the sampling method for the meshes are done. The mesh sample method is pretty straight-forward after this and it looks like this.

{% highlight C %}
void Mesh::sample(const Scene& s, meshSample& sample) {
    // Sample a random number;
    std::uniform_real_distribution<> rand(0, 1);
    float r1 = rand(gen);
    // Find the which zone of the cdf our random number lies in
    int m = cdf.size()-1;
    for (int i = 0; i < cdf.size(); i++)
    {
        if (cdf[i] > r1)
        {
            m = i - 1;
            break;
        }
    }
    // Sample a random point from the chose triangle, and get its normal
    sample.sample = (*t)(faces[m].sample(s),2);
    sample.normal = (*t)(faces[m].normal(s),1);
    // Add the total area to struct for probability
    sample.total_area = total_area;
}
{% endhighlight %}

After these steps Mesh Lights response method looks like this:

{% highlight C %}
void MeshLight::response(const Scene& s, const hit_record& rec, light_response& ls)
{
    // Sample from the mesh
    meshSample sample;
    m->sample(s,sample);
    ls.dir = sample.sample - rec.p;
    // Set the distance for occlusion check with some epsilon to prevent occluding the light source
    ls.dist = ls.dir.length()-0.02;
    // Set the W_in for the material
    ls.dir = unit_vector(ls.dir);
    // Calculate the L value
    ls.color = radiance * dot(ls.dir * -1, sample.normal) * sample.total_area / (ls.dist*ls.dist);
}
{% endhighlight %}
#### Sphere Lights

Sphere light sources go pretty similar to mesh sources. The sampling method goes likes this:

{% highlight C %}
void Sphere::sample(const Scene& s, const hit_record& rec, sphereSample& sample)
{
    // Change the given point to the local coordinate system
    Vector3 lp = Inverse(*t)(rec.p, 2);
    // Calculate the direction towards the sphere center and generate the orthonormal basis
    Vector3 d = s.vertex_data[center_vertex_id-1] - lp;
    Vector3 w = unit_vector(d);
    Vector3 v = unit_vector(cross(w, Vector3(0, 1, 0)));
    Vector3 u = unit_vector(cross(v, w));
    // Calculate the biggest angle for our angle theta
    float d_len = d.length();
    float cos_theta_m = std::sqrt(1 - radius * radius / d_len * d_len );

    // Generate the vector in the intended region
    std::uniform_real_distribution<> rand(0, 1);
    float r1 = rand(gen), r2 = rand(gen);
    float theta = std::acosf(1 - r1 + r1 * cos_theta_m);
    float phi = 2 * PI * r2;
    sample.prob = 1 / (2 * PI * (1 - cos_theta_m));
    Vector3 l = unit_vector(w * std::cos(theta) + v * std::sin(theta) * std::cos(phi) + u * std::sin(theta) * std::sin(phi));
    // Calculate the hit location on the sphere
    Ray r = Ray(lp, l);
    hit_record re;
    float fmax = std::numeric_limits<float>().max();
    hit(r, s, 0, fmax, re);
    // Fill up the sample data structure
    sample.p = (*t)(re.p,2);
    sample.dir = (*t)(l);
}
{% endhighlight %}

After the collection of the sample the sphere light response method looks like this:

{% highlight C %}
void SphereLight::response(const Scene& s, const hit_record& rec, light_response& ls)
{
    // Get the sample from the sphere
    sphereSample sample;
    sph->sample(s, rec, sample);
    ls.dir = sample.dir;
    // Set the distance for occlusion check with some epsilon to prevent occluding the light source
    ls.dist = (sample.p - rec.p).length() - 0.01;
    // Set the W_in for the material
    ls.dir = unit_vector(ls.dir);
    // Calculate and set the response of the light
    ls.color = radiance / (ls.dist * ls.dist * sample.prob);
}
{% endhighlight %}


### Path Tracing

Up to this point, we have used the direct lighting method for our renderings. In the direct lighting, we were finding the object our ray was hitting, and then we were calculating the object's interaction with light sources to find its final color. While this method helps in rendering most of the effects it does not support rendering of the bounce lights. Path tracing is an algorithm that counts in those effects for our rendering. The main difference it offers between the classic direct lighting on the most basic version we do not aim for the light sources for color information. Instead, we sent our rays randomly and obtain the color of objects that we hit randomly for our object. This procedure is a recursive one as we will not be knowing the color of the object we are hitting. We keep on sending rays until we hit max depth (for the most basic implementation) and calculate the final color we send to our camera. This is the most basic summary of the path tracing procedure in the following sections I will be detailing the additional methods we have used to improve upon this idea.

#### Importance Sampling
The first improvement we can make to our raytracer is the addition of importance sampling. In the most naive approach we sent our uniformly sampled rays to the scene and hope for good results. While we are sure about that will converge to perfect answer in time due to the behaviour of the Monte Carlo integration we can help it reach to the conclusion faster. With importance sampling we can give high weight to the rays that will have lower attenuation values. With this sample advantage we will have higher probability to find light sources that can solve our problem with a higher probability. To prevent the bias we of course reduce the effect of oversampled regions but still through forcing those samples more we get a more stable renderer.

#### Russian Roulette
The second method we add to our ray tracer is russian roulette termination. In naive method we finish tracing after we reach to a level of depth while this approach may be better for our performance we may skip an important light source. To prevent this issue russian roulette termination helps a lot. With russian roulette instead of hardcoded termination we use randomness for the death of rays. Of course we are not using total randomness for termination as it would increase our variation tremendously. Instead we weight towards killing the rays that lost its power through the rendering. Of course like our last method we solve the bias with lowering the effect of oversampled regions. This effect actually increases the variance of our results but in for some cases it also brings the solution.
#### Next Event Estimation

The last method we add for improvement is next event estimation. This method is like a direct improvement upon direct lighting. The method can be summarized as direct lighting but we add an additional ray that does not target light sources and add its effect to our scene. This addition improves our results drastically as we know the basic expected result for our objects and we still also think for the caustics.

### Results:
_______________________________

For this homework, we were provided with 9 scenes. First 7 scenes were for the addition of the object lights. Last 2 scenes are actually megascenes for path tracing. The following list displays these scenes sorted by their complexity and with the required techniques for their rendering :
1. **cornellbox_jaroslav_diffuse.xml** 
2. **cornellbox_jaroslav_diffuse_area.xml**
3. **cornellbox_jaroslav_glossy.xml**
4. **cornellbox_jaroslav_glossy_area.xml**
5. **cornellbox_jaroslav_glossy_area_small.xml** 
6. **cornellbox_jaroslav_glossy_area_sphere.xml** 
7. **cornellbox_jaroslav_glossy_area_ellipsoid.xml**
8. **cornellbox_jaroslav_path_diffuse.xml**
9. **cornellbox_jaroslav_path_glass.xml**

{:refdef: style="text-align: center;"}
![cornellbox_jaroslav_diffuse.xml rendering time : 5.758 seconds](/assets/img/advanced_ray_tracing_hw7/final/cornellbox_jaroslav_diffuse.png)
{: refdef}
<center><b> cornellbox_jaroslav_diffuse.xml </b></center>
<center>rendering time : 5.758 seconds </center>

{:refdef: style="text-align: center;"}
![cornellbox_jaroslav_diffuse_area.xml rendering time : 8.183 seconds](/assets/img/advanced_ray_tracing_hw7/final/cornellbox_jaroslav_diffuse_area.png)
{: refdef}
<center><b> cornellbox_jaroslav_diffuse_area.xml </b></center>
<center>rendering time : 8.183 seconds </center>

{:refdef: style="text-align: center;"}
![cornellbox_jaroslav_glossy.xml rendering time : 5.685 seconds](/assets/img/advanced_ray_tracing_hw7/final/cornellbox_jaroslav_glossy.png)
{: refdef}
<center><b> cornellbox_jaroslav_glossy.xml </b></center>
<center>rendering time : 5.685 seconds </center>

{:refdef: style="text-align: center;"}
![cornellbox_jaroslav_glossy_area.xml rendering time : 8.367 seconds](/assets/img/advanced_ray_tracing_hw7/final/cornellbox_jaroslav_glossy_area.png)
{: refdef}
<center><b> cornellbox_jaroslav_glossy_area.xml </b></center>
<center>rendering time : 8.367 seconds </center>

{:refdef: style="text-align: center;"}
![cornellbox_jaroslav_glossy_area_small.xml rendering time : 23.950 seconds](/assets/img/advanced_ray_tracing_hw7/final/cornellbox_jaroslav_glossy_area_small.png)
{: refdef}
<center><b> cornellbox_jaroslav_glossy_area_small.xml </b></center>
<center>rendering time : 23.950 seconds </center>

{:refdef: style="text-align: center;"}
![cornellbox_jaroslav_glossy_area_sphere.xml rendering time : 7.092 seconds](/assets/img/advanced_ray_tracing_hw7/final/cornellbox_jaroslav_glossy_area_sphere.png)
{: refdef}
<center><b> cornellbox_jaroslav_glossy_area_sphere.xml </b></center>
<center>rendering time : 7.092 seconds </center>

{:refdef: style="text-align: center;"}
![cornellbox_jaroslav_glossy_area_ellipsoid.xml rendering time : 7.698 seconds](/assets/img/advanced_ray_tracing_hw7/final/cornellbox_jaroslav_glossy_area_ellipsoid.png)
{: refdef}
<center><b> cornellbox_jaroslav_glossy_area_ellipsoid.xml </b></center>
<center>rendering time : 7.698 seconds </center>

{:refdef: style="text-align: center;"}
![cornellbox_jaroslav_path_diffuse.xml rendering time : 12.163 seconds](/assets/img/advanced_ray_tracing_hw7/final/diffuse.png)
{: refdef}
<center><b> cornellbox_jaroslav_path_diffuse.xml </b></center>
<center>rendering time : 12.163 seconds </center>

{:refdef: style="text-align: center;"}
![cornellbox_jaroslav_path_diffuse.xml (importance) rendering time : 13.403 seconds](/assets/img/advanced_ray_tracing_hw7/final/diffuse_importance.png)
{: refdef}
<center><b> cornellbox_jaroslav_path_diffuse.xml (importance) </b></center>
<center>rendering time : 13.403 seconds </center>

{:refdef: style="text-align: center;"}
![cornellbox_jaroslav_path_diffuse.xml (russian) rendering time : 26.398 seconds](/assets/img/advanced_ray_tracing_hw7/final/diffuse_russian.png)
{: refdef}
<center><b> cornellbox_jaroslav_path_diffuse.xml (russian) </b></center>
<center>rendering time : 26.398 seconds </center>

{:refdef: style="text-align: center;"}
![cornellbox_jaroslav_path_diffuse.xml (importance, russian) rendering time : 22.908 seconds](/assets/img/advanced_ray_tracing_hw7/final/diffuse_importance_russian.png)
{: refdef}
<center><b> cornellbox_jaroslav_path_diffuse.xml (importance, russian) </b></center>
<center>rendering time : 22.908 seconds </center>

{:refdef: style="text-align: center;"}
![cornellbox_jaroslav_path_diffuse.xml (next) rendering time : 35.456 seconds](/assets/img/advanced_ray_tracing_hw7/final/diffuse_next.png)
{: refdef}
<center><b> cornellbox_jaroslav_path_diffuse.xml (next) </b></center>
<center>rendering time : 35.456 seconds </center>

{:refdef: style="text-align: center;"}
![cornellbox_jaroslav_path_diffuse.xml (next, importance) rendering time : 39.364 seconds](/assets/img/advanced_ray_tracing_hw7/final/diffuse_next_importance.png)
{: refdef}
<center><b> cornellbox_jaroslav_path_diffuse.xml (next, importance) </b></center>
<center>rendering time : 39.364 seconds </center>

{:refdef: style="text-align: center;"}
![cornellbox_jaroslav_path_diffuse.xml (next, russian) rendering time : 34.524 seconds](/assets/img/advanced_ray_tracing_hw7/final/diffuse_next_russian.png)
{: refdef}
<center><b> cornellbox_jaroslav_path_diffuse.xml (next, russian) </b></center>
<center>rendering time : 34.524 seconds </center>

{:refdef: style="text-align: center;"}
![cornellbox_jaroslav_path_diffuse.xml (next, importance, russian) rendering time : 35.067 seconds](/assets/img/advanced_ray_tracing_hw7/final/diffuse_next_importance_russian.png)
{: refdef}
<center><b> cornellbox_jaroslav_path_diffuse.xml (next, importance, russian) </b></center>
<center>rendering time : 35.067 seconds </center>