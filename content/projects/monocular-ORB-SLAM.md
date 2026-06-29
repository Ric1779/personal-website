---
title: "Monocular ORB-SLAM"
date: 2023-12-22T23:15:00+07:00
slug: monocular-SLAM
category: projects
summary:
description:
cover:
  image: "covers/cameraPlot_1638.png"
  alt:
  caption:
  relative: true
showtoc: true
draft: false
---

## Introduction

---

In this project I implemented monocular ORB-SLAM ( Simultaneous Localization and Mapping), I leveraged MATLAB's Computer Vision Toolbox to implement the ORB-SLAM pipeline, a powerful algorithm widely used in robotics, augmented reality, and autonomous systems. [Github Link](https://github.com/Ric1779/SLAM-MATLAB) for the implementation.

ORB-SLAM Pipeline:

- **Map Initialization:**
  The first step is to initialize a 3D map using two video frames. ORB-SLAM achieves this by triangulating 2D ORB feature correspondences, establishing a foundation for the spatial understanding of the environment. The computed 3D points and relative camera poses lay the groundwork for subsequent tracking and mapping stages.

- **Tracking:**
  With the map initialized, the algorithm continuously tracks the camera pose for each new frame. This is accomplished by matching features in the current frame with those in the last key frame. As the camera moves, the estimated pose is refined by tracking against the local map, ensuring a robust and accurate representation of the camera's position in the environment.

- **Local Mapping:**
  As frames are processed, the algorithm identifies key frames and uses them to create new 3D map points. Bundle adjustment comes into play at this stage, minimizing reprojection errors by adjusting both the camera pose and the 3D points in the map. This step enhances the overall accuracy and consistency of the reconstructed environment.

- **Loop Closure:**
  One of the features of ORB-SLAM is its ability to detect loops in the environment. This is achieved by comparing each key frame against all previous key frames using a bag-of-features approach. Once a loop closure is detected, the algorithm optimizes the pose graph, refining the camera poses of all key frames. This ensures a more coherent and accurate representation of the entire environment over time.

## Map Initialization

---

In this initial phase of the Monocular ORB-SLAM project, the journey begins with the initiation of the map, a fundamental step that shapes the accuracy and reliability of our SLAM results.

### Importance of Map Initialization

The ORB-SLAM pipeline is commenced by establishing a map housing 3D world points. This initiation is critical, as the accuracy of subsequent SLAM operations heavily relies on a robust starting point. To achieve this, initial ORB feature point correspondences are identified through the `matchFeatures` function, comparing pairs of images in the sequence.

### Geometric Transformation Models

Depending on the scene's characteristics, two geometric transformation models come into play during map initialization:

**Homography:** Ideal for planar scenes, a homography projective transformation is efficiently employed to describe feature point correspondences in such environments.

**Fundamental Matrix:** In non-planar scenes, precedence is given to a fundamental matrix computed using `estimateFundamentalMatrix`.

### RANSAC in Fundamental Matrix Estimation

Tthe Random Sample Consensus (RANSAC) algorithm serves an important role in the computation of the fundamental matrix. RANSAC is a robust iterative method designed to estimate model parameters in the presence of outliers. In this context, the model under consideration is the fundamental matrix, representing the geometric relationship between two frames based on feature correspondences. The RANSAC process initiates by randomly selecting a minimal subset of these correspondences, forming a minimal sample. Subsequently, the fundamental matrix is fitted to this sample, and inliers are identified by evaluating how well the matrix describes the remaining data points.

The iterative paradigm allows RANSAC to overcome the challenges posed by outliers, providing a more reliable estimate of the fundamental matrix. The termination of the RANSAC procedure is contingent upon reaching a predefined condition, ensuring that the algorithm outputs a model that best encapsulates the true geometric relationship between frames. In the Monocular ORB-SLAM context, the application of RANSAC to fundamental matrix estimation enhances the resilience of the SLAM pipeline, contributing to the accurate tracking, mapping, and ultimately, the successful initialization of the 3D map in diverse and challenging environments. The estimation of the fundamental matrix involves solving a constrained least square problem, achieved through singular value decomposition, where the last column vector of the right orthogonal matrix provides the parameters defining the geometric transformation. This meticulous approach ensures the robustness and accuracy of the fundamental matrix in the presence of noise and outliers.

### Model Selection and Pose Estimation

To determine the most suitable model, the algorithm evaluates the reprojection error for both the homography and fundamental matrix models. The model resulting in a smaller error is chosen. The relative rotation and translation between frames are then estimated using `estrelpose`.

### Triangulation for 3D Point Generation

Given the relative camera pose and matched feature points, the algorithm employs triangulation to determine the 3D locations of these points. This ensures that the mapped points are deemed valid, positioned in front of both cameras, exhibit low reprojection error, and possess sufficient parallax between the two views. Since the RGB images are captured by a monocular camera without depth information, the relative translation can only be recovered up to a specific scale factor.

### Iterative Map Initialization Loop

The algorithm iteratively refines the map initialization, checking and adjusting parameters until a reliable 3D map is established. This dynamic approach ensures adaptability to diverse environments and varying scene complexities. The loop continues until the number of matched features exceeds a threshold of 100 correspondences, and the ratio of inliers to total matched features, using a particular fundamental matrix in a given loop, surpasses 0.9.

{{< rawhtml>}}

<p align="center">
  <img src="../images/ORB_SLAM/matchedFeatures_2.png" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 1: Point correspondence used for map initialization</em>
</p>
{{< /rawhtml>}}

## Storing Initial Key Frames and Map Points

---

Following the successful initialization of the 3D map using two frames, the Monocular ORB-SLAM project transitions into the phase of storing key frames and map points. It involves utilizing MATLAB's `imageviewset` and `worldpointset` objects to manage and store essential information about the key frames and the corresponding map points.

### `imageviewset`: Managing Key Frames

The `imageviewset` object serves as a comprehensive repository for key frames and their attributes. It encompasses crucial details such as ORB descriptors, feature points, camera poses, and connections between key frames. The object effectively builds and updates a pose graph, storing absolute and relative camera poses. This organized structure facilitates efficient handling of the visual data, enabling seamless transitions between frames and robust pose estimation.

### `worldpointset`: Handling 3D Map Points

On the other hand, the `worldpointset` object is responsible for managing the 3D positions of the map points and their correspondences. It stores essential information, such as the mean view direction, representative ORB descriptors, and the range of distances at which each map point can be observed. Additionally, it keeps track of the 3D-2D projection correspondences, specifying which map points are observed in a key frame and vice versa. This comprehensive data management ensures that the algorithm maintains a rich representation of the environment, essential for subsequent stages of the SLAM pipeline.

The process involves creating empty instances of both `imageviewset` and `worldpointset` objects, gradually populating them as key frames and map points are added. The algorithm carefully records connections between key frames, 3D map point information, and their corresponding projections in different frames. This meticulous organization of visual and spatial data sets the stage for robust tracking, mapping, and loop closure.

### ORB Features: A Key Element in the Process

ORB (Oriented FAST and Rotated BRIEF) ORB is a robust and computationally efficient feature extraction algorithm, well-suited for real-time applications. It combines the strengths of FAST (Features from Accelerated Segment Test) for keypoint detection and BRIEF (Binary Robust Independent Elementary Features) for feature description.

The intricacies of finding ORB features involve identifying key points in an image using FAST, ensuring they are well-distributed across the image. Then, BRIEF generates binary descriptors representing the intensity patterns around these keypoints. The orientation component in ORB ensures rotation invariance, making it particularly suitable for scenes with significant viewpoint changes.

### Other Classical Features in Computer Vision

Beyond ORB, classical feature extraction methods in computer vision include:

- **SIFT (Scale-Invariant Feature Transform):** SIFT features are scale-invariant and robust to changes in orientation and illumination. They are widely used for image matching and object recognition.

- **SURF (Speeded-Up Robust Features):** SURF is designed for efficiency and speed, offering comparable performance to SIFT. It utilizes integral images to accelerate feature computation.

- **Harris Corner Detector:** Harris corners are key features identified based on corner-like structures in an image. This detector is sensitive to changes in intensity in different directions.

- **Shi-Tomasi Corner Detector:** Similar to Harris, the Shi-Tomasi corner detector selects the most prominent corners in an image, often used for corner-based tracking.

- **FAST (Features from Accelerated Segment Test):** FAST is a corner detection algorithm known for its speed. It identifies keypoints based on intensity thresholds.

Each feature extraction method has its strengths and weaknesses, making them suitable for specific applications. ORB stands out in Monocular ORB-SLAM due to its balance between computational efficiency and robustness, making it well-suited for real-time visual odometry and mapping tasks. As the project advances, these features are strategically utilized to create a rich representation of the environment, ensuring accurate and consistent mapping over diverse scenes and conditions. Stay tuned for the upcoming sections, where we delve into the intricacies of the tracking and mapping processes, revealing the dynamic evolution of the 3D map over time.

## Loop Closure Using Bags-of-Words

---

In this section, the focus shifts towards loop detection, a crucial aspect of maintaining robustness in visual mapping. This process relies on the bags-of-words approach, a well-established method in computer vision that enhances the algorithm's capability for recognizing places and closing loops in the trajectory.

### Bags-of-Words Approach

**Extracting Interesting Features**

In the realm of computer vision, the Bag-of-Words algorithm begins its journey with the crucial task of extracting the defining features from images. These features play a pivotal role in later stages as we seek to identify the most prevalent visual elements within our dataset. The flexibility of this approach allows us to choose from a myriad of feature extraction methods. For instance we could use techniques like corner detection or employing SIFT features to capture the essence of our images.

**Learning Visual Vocabulary**

Once our diverse set of features is in hand, the next challenge lies in transforming this expansive feature set into a concise set of "themes" analogous to the "words" in Natural Language Processing. In the context of Computer Vision, these "words" are referred to as textons. The process of identifying textons involves clustering our features using various techniques, with K-Means being the most prevalent choice, although Mean Shift or HAC ( Hierarchical Agglomerative Clustering ) are viable alternatives. The centers of these clusters become our textons, collectively forming a visual vocabulary.

**Quantize Features**

In the Bag-of-Words paradigm, textons are synonymous with codevectors, and the centers of feature clusters serve as these codevectors. Collectively, the ensemble of codevectors constitutes a codebook, a tool pivotal for quantizing features. This quantization process involves extracting features from new images using the same method applied to our dataset. Subsequently, the codebook is employed to map these feature vectors to the indexes of the closest codevectors.

The selection of the codebook's size, equivalent to the number of clusters in our clustering algorithm, holds paramount importance. A judicious choice is imperative, as an excessively small codebook may fail to capture the essence of the underlying data, while an excessively large one risks overfitting. This consideration is particularly crucial when determining the K value for K-Means, assuming it is the chosen clustering algorithm.

**Represent Images by Frequencies**

With our codebook in place, a multitude of possibilities unfolds. Firstly, we can represent each image in our dataset as a histogram of codevector frequencies.

Subsequently, we confront a branching path based on the nature of our problem. In supervised learning scenarios where data comes labeled, we can train a classifier on these histograms. This classifier becomes adept at distinguishing between classes based on the appearance of the textons, fostering robust categorization. In contrast, for unsupervised learning problems where labels are absent, further clustering of the histograms unravels visual themes or groups within our dataset, enriching our understanding of the inherent patterns.

### Large-Scale Image Search with Bag-of-Words

Imagine a scenario where a database houses tens of thousands of object instances, and the challenge is to efficiently match new images to this extensive repository. The Bag-of-Words model proves to be an invaluable ally in addressing this intricate problem.

**Building the Database**

To initiate the large-scale image matching process, the first step involves extracting distinctive features from the images within the database. Subsequently, a vocabulary is learned using the K-Means clustering algorithm, with a typical value for K being around 100,000. This vocabulary essentially encapsulates the unique visual elements present in the database images.

**Weighting the Words**

Once the vocabulary is established, the next crucial step is computing weights for each word, akin to assigning importance to words in a dictionary. This weighting process allows us to diminish the significance of less informative features, similar to assigning lower weights to common words like "the," "a," and "is" in textual analysis. In the context of images, this translates to assigning lower weights to less critical features and higher weights to more pivotal ones.

**Inverted File Mapping**

The weighted features contribute to the creation of an inverted file, mapping words to images. This inverted file serves as a powerful tool for rapidly computing the similarity between a new image and all images present in the database. The Term Frequency Inverse Document Frequency (TF-IDF) scoring methodology further refines the weighting process, taking into account the document frequency of each word.

The formula for calculating IDF, where NumDocs represents the total number of documents in the database and NumDocsjappears is the number of documents where the word j appears, is given by:

$$
IDF = \log\left(\frac{NumDocs}{NumDocsjappears}\right)
$$

To compute the value of bin j in an image I:

$$
Bin_j = \text{frequency}_j \cdot IDF
$$

**Sparse Histograms and Efficient Search**

With images typically having around 1000 features and a database containing around 100,000 visual words, each resulting histogram is incredibly sparse. This sparsity becomes advantageous in the search process, as we only need to consider images whose bins overlap with the new image, optimizing the search efficiency.

<!-- **Real-Time Performance and Limitations**

Large-scale image search, particularly effective for domains like CD covers and movie posters, can achieve real-time performance. However, a caveat surfaces as the database size grows. The Bag-of-Words model, while powerful, exhibits a degradation in performance as the database expands. This degradation is attributed to quantization errors and imperfect feature detection, sometimes leading to noisy image similarities. Acknowledging these limitations becomes crucial when deploying the Bag-of-Words model in large-scale image search applications.




### Incremental Database Building

The loop closure process involves building an incremental database, represented as an `invertedImageIndex` object. This database efficiently stores the mapping between visual words and images, based on the bag of ORB features. The offline-created bag of features data is loaded, initializing the place recognition database. -->

### Loop Closure Strategies

Using bags-of-words' efficient large scale image search, loop closure process aims to identify previously visited locations, enhancing the algorithm's ability to close loops in the trajectory. This is vital for addressing accumulated errors and ensuring the consistency of the map. By incorporating features from the first two key frames into the database, the algorithm establishes a foundation for recognizing places during the subsequent stages of SLAM.

## Refining the Initial Reconstruction

---

A refinement process is performed on the initial 3D reconstruction using bundle adjustment. This critical step optimizes both camera poses and world points, aiming to minimize overall reprojection errors. **Bundle adjustment** is a fundamental technique in computer vision and photogrammetry. In the context of Monocular ORB-SLAM, it addresses the inevitable imperfections and inaccuracies in the initial reconstruction. The adjustment simultaneously optimizes the estimated camera poses and 3D positions of map points to align with observed feature correspondences across multiple frames. By minimizing the reprojection errors — the disparities between observed and projected feature locations — the bundle adjustment ensures a more accurate and reliable representation of the environment.

### Optimization Process

The bundle adjustment process involves adjusting the parameters of the camera poses and 3D map points iteratively. The algorithm considers the reprojection errors associated with each feature across multiple frames, refining the estimates to achieve a more consistent and aligned reconstruction. This optimization contributes to the reduction of accumulated errors, providing a more reliable foundation for subsequent stages of the SLAM pipeline.

### Scaling and Updating

Following the bundle adjustment, the map is scaled using the median depth of the refined map points. This scaling ensures a consistent and meaningful representation of the environment. The key frames and map points are then updated with the refined poses and positions, respectively, ensuring the entire reconstruction aligns with the optimized parameters.

In conclusion, the bundle adjustment process in Monocular ORB-SLAM is a pivotal step for refining the accuracy of the 3D reconstruction. By optimizing both camera poses and world points, the algorithm enhances the consistency and reliability of the map, contributing to improved performance in subsequent stages of the SLAM pipeline. Stay tuned for the next sections, where further optimizations and loop closure strategies will be explored, providing a holistic understanding of the algorithm's capabilities.

{{< rawhtml>}}

<p align="center">
  <img src="../images/ORB_SLAM/cameraPlot_30.png" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 2: Point correspondence of the first frame.</em>
</p>
{{< /rawhtml>}}

{{< rawhtml>}}

<p align="center">
  <img src="../images/ORB_SLAM/cameraPlot.png" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 3: 3D points and camera after refinement.</em>
</p>
{{< /rawhtml>}}

## Tracking, Local Mapping, and Loop Closure

---

### Tracking

In the Tracking phase of Monocular ORB-SLAM, each frame undergoes a meticulous process to determine the camera's position and orientation in the environment. This phase is critical for maintaining the system's understanding of its surroundings and deciding when to insert a new key frame.

Firstly, ORB features are extracted from the current frame. These features are then matched with the features in the last key frame, establishing correspondences. The Perspective-n-Point algorithm is employed to estimate the camera pose based on the matched feature correspondences. This algorithm utilizes the known 3D positions of map points (from the last key frame) and their corresponding 2D image coordinates in the current frame to estimate the camera pose.

With the camera pose estimated, map points observed in the last key frame are projected into the current frame. A search for feature correspondences is conducted in the current frame using the projected 2D positions of map points. A motion-only bundle adjustment is performed to refine the camera pose. This adjustment considers only the motion of the camera, updating its position and orientation to minimize reprojection errors. The bundle adjustment is a crucial step for improving the accuracy of the camera pose and maintaining the consistency of the overall reconstruction.

The system evaluates whether the current frame should be considered a new key frame based on certain conditions. If at least 20 frames have passed since the last key frame or the current frame tracks fewer than 100 map points, and the number of map points tracked by the current frame is fewer than 90% of the points tracked by the reference key frame, the current frame is designated as a new key frame. These conditions ensure that key frames are inserted judiciously, preventing unnecessary redundancy.

If tracking is lost due to an insufficient number of feature points being matched, the system considers inserting new key frames more frequently to regain tracking stability. This meticulous tracking process ensures a continuous and accurate estimation of the camera's pose as it navigates through the environment. By leveraging ORB features, advanced pose estimation techniques, and bundle adjustment, the system adapts to changing scenes while maintaining a robust and coherent 3D map. The tracking phase sets the stage for subsequent Local Mapping and Loop Closure processes, contributing to the overall resilience and effectiveness of Monocular ORB-SLAM.

### Local Mapping

The Local Mapping phase is performed whenever a new key frame is determined. In this phase the existing map is updated using the attributes of the map points observed by the new key frame, ensuring the map remains accurate and representative of the environment.

When a new key frame is added, information such as the camera pose, ORB descriptors, feature points, and other relevant attributes are integrated into the system. The camera pose associated with the new key frame is placed at the origin and oriented along the Z-axis, forming the foundation for subsequent operations.

The removal of outliers is a critical step in maintaining a reliable map. Outlier map points, observed in fewer than three key frames, are identified and removed, enhancing the overall accuracy of the map by retaining only well-observed points. This process ensures that the map reflects the true structure of the environment.

Triangulation is then employed to create new map points. This involves determining the 3D positions of ORB feature points in the current key frame and its connected key frames. Unmatched feature points in the current key frame are matched with other unmatched points in the connected key frames, utilizing feature matching techniques to ensure the creation of accurate and reliable map points.

A local bundle adjustment is a pivotal step in the Local Mapping phase. This adjustment refines the poses of the current key frame, the poses of connected key frames, and all map points observed in these key frames. By optimizing the overall structure of the local map, this adjustment reduces errors and inconsistencies, ensuring a cohesive and accurate representation of the environment.

The map points are then updated with the refined positions obtained from the bundle adjustment. Other attributes of the map points, such as view direction and depth range, are also updated, ensuring a comprehensive representation of the environment. The system visualizes the updated 3D world points and the trajectory of the camera, providing a clear overview of the evolving map structure and the camera's path through the environment.

### Loop Closure

Loop closure detection is a critical component to correct accumulated errors over time. The algorithm queries a place recognition database, identifying potential loop candidates similar to the current key frame. Valid loop candidates must satisfy conditions, including not being connected to the last key frame and having three neighboring key frames as loop candidates. When a valid loop candidate is detected, the relative pose between the candidate and the current key frame is computed, and loop connections are added. This step effectively closes loops in the map, refining the overall structure.

The interplay of these three phases ensures the Monocular ORB-SLAM system's adaptability and accuracy in mapping dynamic environments. The continuous refinement through tracking, local mapping, and loop closure creates a robust and consistent 3D map representation.

## Pose Graph Optimization

---

In the final phase we correct any potential drift in the camera poses. This is achieved through a similarity pose graph optimization process, which operates on the essential graph extracted from the key frame set (`vSetKeyFrames`). The essential graph is constructed by removing connections with fewer than a specified minimum number of matches in the covisibility graph. The goal of this optimization is to refine and enhance the accuracy of camera poses, addressing any accumulated errors or drift that may have occurred during the mapping process.

Once the similarity pose graph optimization is applied, the 3D locations of the map points are updated using the optimized poses and the associated scales. This step ensures that the entire map, including the positions of observed features and their relationships to the camera poses, is aligned more accurately with the real-world environment. By optimizing the poses globally, the system mitigates drift and improves the overall consistency of the reconstructed scene.

The conditional check, "if isLoopClosed," ensures that this optimization process is only executed when a loop closure has been successfully detected. Loop closures play a pivotal role in improving the global consistency of the map, and applying pose graph optimization specifically after a loop closure further enhances the system's resilience to drift.

The optimized camera trajectory and updated map points are visualized to provide a clear representation of the refined reconstruction. The system plots the optimized camera poses, showcasing the corrected trajectory, and updates the legend to provide additional context for the visualized information.

In essence, this final step in the Monocular ORB-SLAM pipeline serves as a crucial refinement process, ensuring that the reconstructed map accurately reflects the real-world environment by addressing and correcting any inaccuracies or drift in the estimated camera poses.

{{< rawhtml>}}

<p align="center">
  <img src="../images/ORB_SLAM/cameraTrajectory.gif" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 4: Estimated Camera Trajectory.</em>
</p>
{{< /rawhtml>}}
