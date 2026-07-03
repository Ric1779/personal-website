---
title: "KITTI Dataset : Files and Formats"
date: 2024-03-10T23:17:00+09:00
slug: kitti
category: kitti
summary:
description:
cover:
  image:
  alt:
  caption:
  relative: true
showtoc: true
draft: true
---

## Introduction

---

In the field of computer vision and autonomous driving research, datasets play an important role in advancing the capabilities of artificial intelligence systems. One such cornerstone in this domain is the KITTI dataset, a comprehensive and widely-used benchmark in perception, localization, and object recognition. The KITTI project consists of multiple benchmarks, including object detection, tracking, stereo vision, optical flow, road detection, visual odometry, and depth estimation. Throughout this article we focus on the 3D Object Detection benchmark, which is the version most commonly used in LiDAR-based perception research. The dataset is freely available for download at this [link](http://www.cvlibs.net/datasets/kitti/).

The KITTI dataset, short for Karlsruhe Institute of Technology and Toyota Technological Institute, is a collection of sensor data gathered from a moving vehicle. It stands out for its rich diversity and high-quality recordings, making it an invaluable resource for researchers, engineers, and developers to enhance the robustness and efficiency of autonomous systems.

This dataset, initiated by the collaboration between academic and industrial institutions, addresses the critical need for real-world data to train and evaluate algorithms for autonomous vehicles. As we delve into the components of the KITTI dataset, including images from four distinct cameras, point cloud data from Velodyne LIDAR, IMU sensor readings, ground truth labels, and calibration information, it becomes evident that KITTI provides a holistic representation of the complexities encountered in real-world driving scenarios.

In the further sections of this blog, we will look into how each component contributes to a comprehensive understanding of the environment surrounding a vehicle. The KITTI dataset, with its **multi-modal nature**, allows researchers to push the boundaries of perception systems, paving the way for safer and more reliable autonomous vehicles.

## Understanding KITTI Dataset Components

---

To comprehend the KITTI dataset, focus on two main elements is important: the diverse data captured by different sensors and the **coordinate transformations** between different sensors. The dataset includes images from four cameras, two in color and two in grayscale. Calibration files detail how these cameras, Velodyne LIDAR, and IMU sensors align. Ground truth label files provide annotations for each frame, offering essential information like object type, position, and dimensions. This combination creates a comprehensive dataset for training and testing autonomous systems.

{{< rawhtml>}}

<p align="center">
  <img src="../images/kitti_dataset/kitti_setup.jpeg" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 1: KITTI data acquisition setup</em>
</p>
{{< /rawhtml>}}

### Data and Ground Truth

#### Camera Images

The setup includes two stereo camera pairs: one grayscale pair (Cam0/Cam1) and one color pair (Cam2/Cam3). In Figure 1, we can observe the locations of grayscale Cam0 (left) and Cam1 (right), and RGB Cam2 (left) and Cam3 (right). The `<label>.txt` file is provided with respect to the **rectified Cam2 coordinate system**. The calibration files also define a **reference camera coordinate system**, which represents the camera before rectification. The relationship between the reference and rectified coordinate systems is given by the rectification matrix \(R_0^{rect}\). Although KITTI stores \(R_0^{rect}\) as a \(3 \times 3\) rotation matrix, it is commonly expanded into a \(4 \times 4\) homogeneous transformation matrix by adding an extra row and column for homogeneous coordinate transformations.

$$
x_{rect} = R_0^{rect} \, x_{ref}
$$

Rectification is an important preprocessing step in stereo vision. Since the left and right cameras are mounted at slightly different positions and orientations, corresponding points in the two images generally do not lie on the same horizontal line. Instead, they lie along **epipolar lines**, which may be slanted depending on the relative orientation of the cameras. During stereo matching, the algorithm searches for the corresponding point along the epipolar line in the other image before using triangulation to estimate its depth.

Image rectification digitally warps both images so that they appear as if they were captured by perfectly parallel cameras separated only by a horizontal baseline. As a result, all epipolar lines become horizontal, meaning corresponding points have the same vertical pixel coordinate in both images. This reduces the stereo correspondence problem from a two-dimensional search to a one-dimensional search along each image row, making stereo matching both simpler and more computationally efficient. It is important to note that rectification does **not** change the stereo matching problem itself, it only changes the image geometry to simplify the search.

Even if your application does not use stereo images, understanding rectification is still important because the KITTI 3D object annotations and projection matrices are defined in the **rectified camera coordinate system**. Therefore, when transforming points between the LiDAR, camera, and image coordinate systems, the rectification transformation must still be applied.

<!-- The setup includes two stereo camera pairs: one grayscale pair (Cam0/Cam1) and one color pair (Cam2/Cam3). In Figure 1 we can observe the locations of grayscale Cam0 (left) and Cam1 (right), and locations of RGB Cam2 (left) and Cam3 (right). The \<label\>.txt file is provided wrt to the rectified Cam2 coordinate system, and the non-rectified coordinate system of Cam2 is called the reference coordinate system and the relation between both is given by the rectification matrix which is a 4x4 matrix with just the 3x3 rotation elements, with no translation.

$$
x_{rect} = R0 * x_{ref}
$$

Rectification is a crucial step in stereo imaging, wherein the goal is to align corresponding points in stereo images onto the same horizontal scan line. This process effectively eliminates any horizontal disparity between the images, simplifying stereo matching and depth estimation. It is necessary to ensure accurate depth perception and reconstruction in stereo vision applications, such as 3D mapping, object tracking, and scene understanding. Even though you might not be using stereo images for your project it's important to know that you still need to go through these transformation while changing coordinate systems. -->

#### LiDAR Point Cloud

The Velodyne LIDAR data in the KITTI dataset is stored in binary files that encapsulate the raw point cloud information. The LIDAR binary files follow a specific binary format, with each file containing a sequence of data points representing the 3D coordinates of the LIDAR measurements. The binary format ensures efficient storage and retrieval of large amounts of point cloud data. The point cloud is a $(x, y, z, r)$ point cloud, where $(x, y, z)$ is the 3D coordinates and r is the reflectance value. Each value is in 4-byte float. These 3D points are given wrt the velodyne coordinate system, and the transformation from the velodyne coordinate system to the reference camera coordinate system is as follow:

$$
x_{ref} = Tr\_velo\_to\_cam * x_{velo}
$$

The transformation matrices are provided in the KITTI's \<calib\>.txt file, which is explained in the following section.

#### Calibration Files

The calibration files serve as a bridge between different coordinate frames used for differnt sensors. These files include:

- Projection Matrix for Cameras: Specifies how 3D points are projected onto the 2D image plane in the rectified camera coordinate frame.
- Rectification Matrix: Transforms 3D points from the reference camera coordinate frame to the rectified camera coordinate frame, facilitating accurate perception.
- Velodyne-to-Camera Transformation Matrix: Describes the transformation from Velodyne LIDAR coordinate frame to the reference camera coordinate frame, aligning the LIDAR data with camera images.
- IMU-to-Velodyne Transformation Matrix: Governs the transformation from the IMU sensor coordinate frame to the Velodyne LIDAR coordinate frame, ensuring synchronization across sensors.

{{< rawhtml>}}

<p align="center">
  <img src="../images/kitti_dataset/sensor_transformation.jpg" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 70%"/>
</p>
<p align="center">
  <em>Figure 2: KITTI sensor transformation</em>
</p>
{{< /rawhtml>}}

$$
y_{image2} = P2 * R0 * Tr\_velo\_to\_cam * x_{velo}
$$

#### Ground Truth Label Files:

An integral component of the dataset is the label file, a plain text document typically denoted by the .txt extension, associated with each image in the collection. Each label file contains a series of lines, where each line encapsulates the annotation for an individual object within the corresponding image.

The line format is as follows:

`object_type` `truncation` `occlusion` `alpha` `left` `top` `right` `bottom` `height` `width` `length` `x` `y` `z` `rotation_y`

Breaking down the components:

- `object_type`: Identifies the type of the annotated object, such as 'Car', 'Van', 'Truck', 'Pedestrian', 'Person_sitting', 'Cyclist', 'Tram', 'Misc', or 'DontCare' (used for objects present but ignored during evaluation).
- `truncation`: Represents the fraction of the object visible, ranging from 0.0 (fully visible) to 1.0 (completely outside the image frame).
- `occlusion`: Indicates the level of occlusion, an integer denoting the degree where 0 signifies full visibility, and higher values denote increasing levels of occlusion.
- `alpha`: Represents the observation angle of the object in radians relative to the camera, depicting the angle between the object's heading direction and the positive x-axis of the rectified camera system.
- `left`, `top`, `right`, `bottom`: 2D bounding box coordinates of the object in image coordinate system, providing pixel locations for the top-left and bottom-right corners.
- `height`, `width`, `length`: Dimensions of the object (height, width, and length) in meters.
- `x`, `y`, `z`: Indicate the 3D location of the object's centroid in the rectified camera coordinate system (measured in meters).
- `rotation_y`: Denotes the rotation of the object around the y-axis in rectified camera coordinates, expressed in radians.

### Transformations

The following code is designed to transform a 3D bounding box from the rectified coordinate system used in the label.txt files to the velodyne LiDAR coordinate system. To accomplish this, we first need to convert the centroid location to the LiDAR's frame and determine the yaw angle or heading angle of the object within the LiDAR's frame.

The initial step involves multiplying the 3D points with the inverse of rectification matrix to transform them to the reference camera frame. Then, we multiply the result with the inverse of the transformation matrix from the Velodyne LiDAR to the camera (Tr_velo_to_cam) to further transform the points to the Velodyne's frame.

From examining Figure 1, it becomes apparent that the y-axis of the rectified camera frame corresponds to the z-axis of the LiDAR's frame. Therefore, the transformed heading angle can be obtained straightforwardly as $r_z = -r_y - \pi/2 $.

```python

def camera_to_lidar(x, y, z, V2C=None, R0=None, P2=None):
    p = np.array([x, y, z, 1])
    if V2C is None or R0 is None:
        p = np.matmul(cnf.R0_inv, p)
        p = np.matmul(cnf.Tr_velo_to_cam_inv, p)
    else:
        R0_i = np.zeros((4, 4))
        R0_i[:3, :3] = R0
        R0_i[3, 3] = 1
        p = np.matmul(np.linalg.inv(R0_i), p)
        p = np.matmul(inverse_rigid_trans(V2C), p)
    p = p[0:3]
    return tuple(p)

def camera_to_lidar_box(boxes, V2C=None, R0=None, P2=None):
    # (N, 7) -> (N, 7) x,y,z,h,w,l,r
    ret = []
    for box in boxes:
        x, y, z, h, w, l, ry = box
        (x, y, z), h, w, l, rz = camera_to_lidar(x, y, z, V2C=V2C, R0=R0, P2=P2),
         h, w, l, -ry - np.pi / 2
        # rz = angle_in_limit(rz)
        ret.append([x, y, z, h, w, l, rz])
    return np.array(ret).reshape(-1, 7)
```

In conclusion, understanding the components of the KITTI dataset is pivotal for leveraging its rich data resources in training and testing autonomous systems. By delving into the diverse data captured by various sensors and mastering the intricacies of coordinate transformations, developers and researchers can unlock the full potential of this comprehensive dataset. From the detailed calibration files facilitating alignment between different sensor frames to the ground truth label files providing essential annotations, each component plays a crucial role in enabling accurate perception and analysis of the environment. With this knowledge, practitioners can advance the development of cutting-edge technologies in areas such as 3D mapping, object tracking, and scene understanding, driving innovation and progress in autonomous systems research and development.
