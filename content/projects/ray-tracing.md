---
title: "Ray Tracing Essentials in C++"
date: 2023-10-30T23:15:00+07:00
slug: ray-tracing
category: projects
summary:
description:
cover:
  image: "covers/final_render.png"
  alt:
  caption:
  relative: true
showtoc: true
draft: false
---

## Introduction

---

Peter Shirley's _Ray Tracing in One Weekend_ is one of the best places to start learning ray tracing and computer graphics. It takes a topic that often seems complicated and explains it in a simple, practical way. The code is easy to follow, and by the end of the tutorial, you're able to generate surprisingly realistic images, which makes the learning process very rewarding.

Although the series is called _Ray Tracing in One Weekend_, the renderer you build is actually a **path tracer**. Path tracing is a ray tracing technique that simulates how light bounces around a scene to produce realistic images. Instead of trying to cover every advanced rendering feature, the tutorial focuses on the core ideas behind ray tracing, making it easier to understand how modern renderers work.

Many professional rendering engines use the same underlying principles. For example, Blender's **Cycles** renderer is also based on path tracing, while **Eevee** focuses on fast real-time rendering using rasterization with a few ray tracing features. Shirley's renderer is much simpler than these production-ready engines, but it provides an excellent foundation for understanding how they work under the hood.

The tutorial is written in C++, a language widely used for high-performance graphics applications, game engines, and film production renderers. The code avoids unnecessary complexity while introducing important C++ features such as classes, inheritance, and operator overloading, making it a great learning resource for both computer graphics and modern C++. [Github Link](https://github.com/Ric1779/Ray-tracing) for the implementation.

## Output an Image

---

The first chapter has you write pixels to a **Portable Pixmap (PPM)** file, one of the simplest image formats, with no external libraries needed. A PPM file begins with a small header. The first line specifies the file type (`P3`), indicating that the pixel values are stored as ASCII text. This is followed by the image width and height, and then the maximum color value, which is usually `255` for 8-bit color. After the header comes the actual image data.

Each pixel is represented by three numbers corresponding to its **red**, **green**, and **blue (RGB)** color components. These values range from `0` to `255`, where `0` means no intensity and `255` means full intensity. The pixels are written one after another, row by row, starting from the top-left corner of the image and moving left to right.

Although PPM files are much larger than formats like PNG or JPEG because they do not use compression, their simplicity makes them perfect for learning. Since the file is just plain text, you can even open it in a text editor and see exactly how every pixel is represented. This makes PPM an excellent choice for beginners who want to understand how a renderer converts computed pixel colors into an actual image.

The snippet below is from the book's first program. It prints a gradient, red horizontally, green vertically, yellow in the corner:

```cpp
#include <iostream>

int main() {

    // Image

    int image_width = 256;
    int image_height = 256;

    // Render

    std::cout << "P3\n" << image_width << ' ' << image_height << "\n255\n";

    for (int j = 0; j < image_height; ++j) {
        for (int i = 0; i < image_width; ++i) {
            auto r = double(i) / (image_width-1);
            auto g = double(j) / (image_height-1);
            auto b = 0;

            int ir = static_cast<int>(255.999 * r);
            int ig = static_cast<int>(255.999 * g);
            int ib = static_cast<int>(255.999 * b);

            std::cout << ir << ' ' << ig << ' ' << ib << '\n';
        }
    }
}
```

{{< rawhtml>}}

<p align="center">
  <img src="../images/ray_tracing/first-ppm-image.png" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 1: First PPM Image</em>
</p>
{{< /rawhtml>}}

## The vec3 class

---

The book then introduces a `vec3` class, the basic 3D type used throughout the series. Shirley reuses it for points, directions, and RGB colors to keep the code small. Two type aliases make the intent clearer:

- `point3` for positions in 3D space
- `color` for RGB values

## Rays, a Simple Camera, and Background

---

The next chapter introduces **rays** and a minimal camera. A ray is a line through space:

$$
P(t) = A + t b
$$

Here $A$ is the origin, $b$ is the direction, and $t$ moves the point along the ray.

The book implements this as a `ray` class. Rendering works by shooting rays from the camera through each pixel, finding the closest hit, and choosing a color from that hit.

Shirley also sets up a simple camera with a 16:9 viewport so images are not stretched, then maps each ray's vertical direction to a white-to-blue gradient for a sky background, the first image that feels three-dimensional even with no objects in the scene.

{{< rawhtml>}}

<p align="center">
  <img src="../images/ray_tracing/blue-to-white.png" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 2: A blue-to-white gradient depending on ray Y coordinate</em>
</p>
{{< /rawhtml>}}

## Adding Geometric Primitives

---

The book's next step is adding **spheres**. A ray hits a sphere when $P(t) = A + tb$ satisfies the sphere equation. At the origin with radius $r$: $x^2 + y^2 + z^2 = r^2$. For a sphere at $(C_x, C_y, C_z)$, Shirley rewrites this in vector form as a **quadratic in $t$**, zero, one, or two solutions mean a miss, tangent hit, or pass-through.

Later in the series, **quads** (parallelograms) are added with three values:

- $Q$: one corner (lower-left in the book's convention)
- $u$: vector along one edge
- $v$: vector along the other edge

The opposite corner is $Q + u + v$. The surface is flat, but all definitions live in 3D.

## Surface Normals and Multiple Objects

---

With multiple objects in the scene, the book introduces **surface normals** : vectors perpendicular to the surface at each hit point.

Shirley stores **unit-length normals** (length 1). Normalizing costs a `sqrt`, but unit normals are needed for lighting later anyway. For spheres, dividing by the radius gives a unit normal without calling `sqrt`.

Before adding lights, the book visualizes normals as colors:

```cpp
color = 0.5*color(N.x()+1, N.y()+1, N.z()+1);
```

Each component (between $-1$ and $1$) maps to RGB in $[0, 1]$, a quick check that intersection and normals work.
{{< rawhtml>}}

<p align="center">
  <img src="../images/ray_tracing/normals-sphere.png" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 3: A sphere colored according to its normals</em>
</p>
{{< /rawhtml>}}

## Antialiasing

---

One ray per pixel produces jagged edges (**aliasing**). The book fixes this with **antialiasing**: shoot several rays in a small region around each pixel and average the colors.
{{< rawhtml>}}

<p align="center">
  <img src="../images/ray_tracing/antialias-before-after.png" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 4: Before and after antialiasing</em>
</p>
{{< /rawhtml>}}

## Materials

---

The materials chapter separates **geometry** from **materials** instead of one giant struct. Each material answers two questions on a hit:

1. Does the ray scatter or get absorbed?
2. If it scatters, how much color does the material remove?

Details go into a `hit_record` shared between geometry and material code.

#### Diffuse Materials

**Lambertian** (diffuse) materials do not emit light, they absorb some incoming color and scatter the rest randomly, biased toward the surface normal.

The book picks a bounce direction by placing a unit sphere tangent to the hit point, choosing a random point on that sphere, and casting a ray from the hit toward it.
{{< rawhtml>}}

<p align="center">
  <img src="../images/ray_tracing/lambertian.png" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 5: Lambertian Sphere</em>
</p>
{{< /rawhtml>}}

#### Metal

**Metal** reflects in a fixed direction instead of scattering randomly. The book gives:

$$
\text{Reflected ray} = v + 2b
$$

where $v$ is the incoming direction and $b$ is the bisector between $-v$ and the surface normal $n$ (all unit vectors).

{{< rawhtml>}}

<p align="center">
  <img src="../images/ray_tracing/reflection.jpg" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 6: Ray Reflection</em>
</p>
{{< /rawhtml>}}
{{< rawhtml>}}

<p align="center">
  <img src="../images/ray_tracing/metal-sphere.png" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 7: Metal Sphere</em>
</p>
{{< /rawhtml>}}

#### Dielectric

**Dielectric** materials (glass, water, diamond) split a ray into reflected and refracted parts. Shirley uses **Snell's law** with indices like air ($\eta \approx 1.0$), glass ($1.3$–$1.7$), and diamond ($\approx 2.4$). At steep angles into a denser medium, **total internal reflection** occurs when Snell's law has no real solution.

For angle-dependent reflectivity, the book uses the **Schlick approximation** instead of full Fresnel equations.
{{< rawhtml>}}

<p align="center">
  <img src="../images/ray_tracing/refraction.jpg" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 8: Snell's Law</em>
</p>
{{< /rawhtml>}}

## Positionable Camera

---

The book then makes the camera **positionable** with three inputs:

- **lookfrom**: where the camera sits
- **lookat**: what it points at
- **vup**: which way is "up" (controls roll)

From those Shirley builds an orthonormal basis $(u, v, w)$: camera right, up, and backward view direction. Rays are cast from `lookfrom` through a pixel grid on the view plane.
{{< rawhtml>}}

<p align="center">
  <img src="../images/ray_tracing/view-distant.png" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 9: Distant View</em>
</p>
{{< /rawhtml>}}
{{< rawhtml>}}
<p align="center">
  <img src="../images/ray_tracing/zoom-in.png" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 10: Zoomed In</em>
</p>
{{< /rawhtml>}}

## Defocus Blur

---

The last feature in the book is **defocus blur**. (Photographers call this _depth of field_ — Shirley jokes you should save that term for your ray tracing friends.)

Real cameras need a wide opening to gather enough light. A pinhole keeps everything sharp but is too dark; a large hole without a lens would blur everything. A lens bends rays so that light from one point in the scene, at a chosen distance, lands on a single point on the sensor. Objects at that distance look sharp; objects nearer or farther look progressively blurrier.

**Focus distance** is the distance from the camera center to the plane where everything is in perfect focus. In a physical camera, moving the lens changes that distance. The **aperture** is the opening that controls how much of the lens is used, a wider aperture gathers more light and blurs objects away from the focus plane more. In our virtual camera we do not need more light, so the aperture exists only to control blur.

### Thin lens approximation

A real camera has a compound lens. You could model sensor, lens, and aperture in order and flip the image afterward. Shirley instead uses a **thin lens approximation**: skip the inside of the camera and treat the lens as an infinitely thin circle.

The key modeling choice is to put the **viewport on the focus plane**, the image plane sits exactly where the world is in focus, at `focus_distance` from the camera center. In this setup, **focus distance and focal length are the same**: the pixel grid lies on the plane of perfect focus, not on a separate sensor behind the lens.

How a ray is cast with defocus blur:

1. The focus plane is **orthogonal** to the camera view direction.
2. The **viewport** lies on that plane, centered on the view direction.
3. The **pixel grid** sits inside the viewport in 3D space.
4. For each pixel, pick a **random sample point** in a small region around it (antialiasing).
5. Fire the ray from a **random point on the lens disk** (the aperture) **through** that sample point on the focus plane.

Everything on the focus plane projects to a sharp point on the viewport, because rays from the lens through those points stay consistent. Objects in front of or behind that plane hit slightly different directions on the sensor for different lens samples, so their colors average out into blur. A wider aperture (larger lens disk) means more spread and more blur off the focus plane, the same averaging idea as antialiasing, but over ray origins instead of pixel offsets.
{{< rawhtml>}}

<p align="center">
  <img src="../images/ray_tracing/defocus-blur.png" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 11: Depth Field</em>
</p>
{{< /rawhtml>}}

## Motion Blur

---

A camera shutter stays open for a short time, so moving objects look smeared. Shirley approximates that by tracing each ray at a **random time** between $t = 0$ and $t = 1$ while the shutter is open.

Objects can move between those times (for example, a sphere whose center shifts each frame). One random time sample per ray gives a cheap motion-blur estimate, similar to how multiple pixel samples approximate antialiasing.
{{< rawhtml>}}

<p align="center">
  <img src="../images/ray_tracing/motion-blur.png" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 12: Motion Blur</em>
</p>
{{< /rawhtml>}}

## BVH

---

Testing every ray against every object is slow ($O(n)$). The second book introduces a **Bounding Volume Hierarchy (BVH)** to bring that down to roughly $O(\log n)$.

The idea: wrap groups of objects in bounding volumes. If a ray misses the volume, skip everything inside. If it hits, only check the children. Each object ends up in one leaf node.

Shirley uses **axis-aligned bounding boxes (AABBs)** because they are simple and fast to test. Ray–box intersection uses the **slab method**: treat the box as the overlap of three axis-aligned intervals (one per axis), find where the ray enters and exits each slab, and keep the overlapping $t$ range.

For BVH culling you only need "did the ray hit the box?" - not exact surface normals or UVs. Each `hittable` exposes a `bounding_box()` method. The scene list merges child boxes as objects are added. Animated objects return a box that covers their full motion over $t \in [0, 1]$.

```cpp
...
#include "aabb.h"
...

class hittable_list : public hittable {
  public:
    std::vector<shared_ptr<hittable>> objects;

    ...
    void add(shared_ptr<hittable> object) {
        objects.push_back(object);
        bbox = aabb(bbox, object->bounding_box());
    }

    bool hit(const ray& r, double ray_tmin, double ray_tmax, hit_record& rec) const override {
        ...
    }

    aabb bounding_box() const override { return bbox; }

  private:
    aabb bbox;
};
```

A `bvh_node` is itself a `hittable`. It stores left and right children plus a bounding box. On `hit()`, test the node's box first; only recurse into children if the ray passes through. BVH construction happens in the node constructor. The book picks a random axis, sorts primitives by their center on that axis, and splits the list in half. Recurse until each leaf has one primitive (or two split across children). The split does not have to be perfect, it only needs to group nearby objects so rays skip large empty regions.

## Textures

---

Flat colors are not enough for interesting scenes. The next book adds **textures**, mappings from a 3D surface point to a color. Every texture implements a `value()` method that returns that color. Texture coordinates are usually $(u, v)$ in $[0, 1]$. Even a solid color texture uses the same interface so materials stay uniform.

A **checker texture** colors space by position: take `floor` of each coordinate, add them, and use even/odd to pick between two colors. A scale parameter controls checker size. No $(u, v)$ unwrap is needed, the pattern exists in 3D space. For image mapping on a sphere Shirley converts the hit point to **spherical coordinates**:

- $\theta$: angle from the bottom pole (up from $-Y$)
- $\phi$: angle around the $Y$ axis

Then map $\theta$ and $\phi$ to $(u, v)$ in $[0, 1]$. The book uses `atan2()` for stable angle math.

Image textures load files with **stb_image** into an RGB byte buffer. A small `rtw_image` helper wraps loading and sampling.

{{< rawhtml>}}

<p align="center">
  <img src="../images/ray_tracing/earth-sphere.png" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 13: Earth Mapped Sphere</em>
</p>
{{< /rawhtml>}}

## Perlin Noise

---

**Perlin noise** (Ken Perlin) gives smooth, random-looking values that repeat cleanly for integer inputs. Nearby 3D points get similar values, useful for marble, clouds, and terrain.

The book follows Andrew Kensler's breakdown: start with a 3D grid of random values, then **permute** indices so the pattern does not look like obvious tiles. Random **unit vectors** on grid corners and dot products smooth the result further.

```cpp
class perlin {
  public:
    perlin() {
        ranfloat = new double[point_count];
        for (int i = 0; i < point_count; ++i) {
            ranfloat[i] = random_double();
        }

        perm_x = perlin_generate_perm();
        perm_y = perlin_generate_perm();
        perm_z = perlin_generate_perm();
    }

    ~perlin() {
        delete[] ranfloat;
        delete[] perm_x;
        delete[] perm_y;
        delete[] perm_z;
    }

    double noise(const point3& p) const {
        auto i = static_cast<int>(4*p.x()) & 255;
        auto j = static_cast<int>(4*p.y()) & 255;
        auto k = static_cast<int>(4*p.z()) & 255;

        return ranfloat[perm_x[i] ^ perm_y[j] ^ perm_z[k]];
    }

  private:
    static const int point_count = 256;
    double* ranfloat;
    int* perm_x;
    int* perm_y;
    int* perm_z;

    static int* perlin_generate_perm() {
        auto p = new int[point_count];

        for (int i = 0; i < perlin::point_count; i++)
            p[i] = i;

        permute(p, point_count);

        return p;
    }

    static void permute(int* p, int n) {
        for (int i = n-1; i > 0; i--) {
            int target = random_int(0, i);
            int tmp = p[i];
            p[i] = p[target];
            p[target] = tmp;
        }
    }
};
```

{{< rawhtml>}}
<br/>

<p align="center">
  <img src="../images/ray_tracing/perlin-turb.png" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 14: Perlin noise with turbulence</em>
</p>
{{< /rawhtml>}}

**Turbulence** sums noise at several frequencies (octaves) for more detail. For a marble look, Shirley drives a sine wave's phase with turbulence so color bands ripple instead of staying straight.
{{< rawhtml>}}

<p align="center">
  <img src="../images/ray_tracing/Perlin_final.png" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 15: Perlin noise with adjusted phase</em>
</p>
{{< /rawhtml>}}

## Quadrilaterals

---

Quads use the same $(Q, u, v)$ definition as earlier. The trick is **ray–plane intersection** first, then checking whether the hit lies inside the parallelogram. A plane satisfies $n \cdot v = D$ (normal $n$, point $v$ on the plane). For ray $R(t) = P + td$, solve for $t$. If the ray is parallel to the plane, there is no hit.

The hit point lies on the plane but may be outside the quad. Shirley expresses the point in **$(\alpha, \beta)$** coordinates along $u$ and $v$ from corner $Q$. If both coefficients are in $[0, 1]$, the hit is inside.

Quads that are axis-aligned in one dimension can produce paper-thin bounding boxes; the book **pads** the AABB slightly to avoid numerical issues without changing the intersection math.
{{< rawhtml>}}

<p align="center">
  <img src="../images/ray_tracing/quads.png" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 16: Quads</em>
</p>
{{< /rawhtml>}}

## Lights

---

Light comes from **emissive materials**: objects that return a color from an `emitted()` method instead of only reflecting incoming light. Any geometry with an emissive material becomes a light source in the scene.

## Cornell Box

---

The **Cornell box** is a standard test scene: a small room with colored walls and a bright ceiling panel. It is good for checking diffuse interreflection, color bleeding, and soft shadows without a complicated model. The book builds the box from quads and one emissive rectangle on the ceiling.
{{< rawhtml>}}

<p align="center">
  <img src="../images/ray_tracing/cornell-empty.png" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 17: Cornell Box</em>
</p>
{{< /rawhtml>}}

## Volumes

---

**Participating media** (smoke, fog, mist) scatter light inside a region instead of only on surfaces. Shirley adds a constant-density volume: as a ray travels through it, it may scatter at random distances. Higher density means more scattering. Volumes are implemented as another `hittable` type so they plug into the same intersection pipeline as spheres and quads.
{{< rawhtml>}}

<p align="center">
  <img src="../images/ray_tracing/cornell-smoke.png" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 18: Cornell box with blocks of smoke</em>
</p>
{{< /rawhtml>}}

{{< rawhtml>}}
<br/>

<p align="center">
  <img src="../images/ray_tracing/final-render-2.png" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 19: Final Render</em>
</p>
{{< /rawhtml>}}
