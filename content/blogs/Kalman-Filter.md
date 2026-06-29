---
title: "Kalman Filter and EKF"
date: 2024-02-18T23:17:00+09:00
slug: KalmanFilter
category: KalmanFilter
tags:
  - control-systems
  - robotics
  - filters
summary:
description:
cover:
  image: "covers/kalman-filter.png"
  alt:
  caption:
  relative: true
showtoc: true
draft: false
---

## Introduction

---

In data-driven decision-making and autonomous systems, the need for accurate and reliable estimation is paramount. Whether it's predicting the position of a spacecraft, tracking the trajectory of a missile, or simply smoothing out noisy sensor measurements in a mobile robot, the ability to filter and refine data in real-time is a fundamental requirement. This is where the Kalman Filter, a powerful and versatile tool, comes into play.

**Filtering techniques** play a crucial role in various applications, acting as the invisible hand that sifts through noisy and uncertain measurements to uncover the true state of a system. In scenarios where sensors introduce errors, or where there's inherent uncertainty in the system dynamics, traditional methods of estimation fall short. This is where the Kalman Filter steps in, providing an elegant solution to the problem of state estimation by dynamically combining predictions from a mathematical model with real-world measurements.

The Kalman Filter owes its name to Rudolf Kalman, a Hungarian-American mathematician and electrical engineer who introduced the algorithm in a seminal paper published in 1960. Kalman's innovation was revolutionary, particularly for its ability to handle noisy measurements and dynamic systems with a level of elegance and efficiency that was unmatched at the time.

Since its inception, the Kalman Filter has become a ubiquitous tool in a wide array of fields. From guiding spacecraft during interplanetary missions to enabling smooth GPS navigation in our everyday devices, the Kalman Filter's versatility has made it a cornerstone of modern control and estimation theory.

## From Averages to Kalman Filters

---

Before diving into the Kalman Filter, it is useful to look at simpler filtering techniques and understand their limitations. The Kalman Filter can be viewed as the evolution of these ideas, addressing many of their shortcomings.

#### Batch Average

Suppose we have a sequence of noisy measurements:

$$
x_1, x_2, \dots, x_k
$$

The most straightforward estimate is the arithmetic mean:

$$
\bar{x}_k = \frac{1}{k}\sum_{i=1}^{k} x_i
$$

This approach works well when estimating a quantity that is constant but corrupted by random noise. For example, repeatedly measuring a battery voltage of (14.4V) with sensor noise would produce measurements that fluctuate around the true value. Averaging many measurements gradually converges toward the correct voltage.

However, this approach has an important drawback. Every time a new measurement arrives, we must recompute the average using all previous measurements. As the number of measurements grows, this becomes computationally inefficient, especially in embedded systems and real-time applications.

#### Recursive Average

Instead of storing and reprocessing all measurements, we can update the average incrementally:

$$
\bar{x}_k=\frac{k-1}{k}\bar{x}_{k-1}- \frac{1}{k}x_k
$$

This recursive formulation only requires:

1. The previous estimate $(\bar{x}_{k-1})$
2. The new measurement $(x_k)$
3. The number of measurements $(k)$

The estimate is updated on-the-fly without revisiting the entire dataset. This idea introduces an important principle that appears repeatedly in estimation theory: _The current estimate is obtained by combining the previous estimate with new information._ Despite its efficiency, the recursive average assumes that the underlying quantity is constant. It performs poorly when the true signal changes over time.

#### Moving Average Filter

Consider estimating the altitude of a drone using a noisy sonar sensor. The altitude changes continuously, making it undesirable to average all measurements since older measurements become increasingly irrelevant. A simple remedy is the moving average filter:

$$
\bar{x}_k=\frac{1}{n}\sum_{i=k-n+1}^{k}x_i
$$

where $(n)$ is the window size. The moving average smooths out measurement noise while still allowing the estimate to change over time. However, it introduces a trade-off:

- Larger $(n)$: smoother estimates but increased delay
- Smaller $(n)$: more responsive estimates but less noise suppression

Furthermore, every measurement within the window receives the same weight. A measurement collected several seconds ago is treated as equally important as the most recent one, which is often undesirable in dynamic systems.

#### Exponential Smoothing (First-Order Low-Pass Filter)

A more sensible approach is to assign greater importance to recent measurements:

$$
\hat{x}_k=\alpha \hat{x}_{k-1}-(1-\alpha)x_k, \qquad 0 < \alpha < 1
$$

where:

- $(\hat{x}\_k)$ is the current estimate,
- $(x_k)$ is the new measurement,
- $(\alpha)$ determines how much trust we place in previous estimates.

This filter can be interpreted as an exponentially weighted moving average. Expanding the recursion shows that recent measurements receive larger weights, while older measurements contribute exponentially less. The parameter $(\alpha)$ controls the behavior:

- Small $(\alpha)$: more responsive but noisier estimates
- Large $(\alpha)$: smoother estimates but slower response

This approach significantly reduces the delay introduced by a moving average and often performs remarkably well in practice.

#### Where the Kalman Filter Fits In

The low-pass filter raises an important question: _Can the weighting factor adapt automatically instead of remaining fixed?_ The Kalman Filter answers this question. Conceptually, the Kalman Filter behaves similarly to an adaptive low-pass filter. Instead of using a constant weighting parameter, it dynamically determines how much trust should be placed in:

1. The prediction produced by a mathematical model of the system, and
2. The new measurement obtained from sensors.

If measurements become noisy, the filter relies more heavily on the model prediction. If measurements become reliable, it gives them greater importance. This adaptive balancing act allows the Kalman Filter to provide accurate state estimates even in the presence of uncertainty and changing system dynamics. In many ways, the Kalman Filter can be seen as the culmination of a progression:

$$
\text{Average}
\rightarrow
\text{Recursive Average}
\rightarrow
\text{Moving Average}
\rightarrow
\text{Low-Pass Filter}
\rightarrow
\text{Kalman Filter}
$$

Each step addresses a limitation of the previous one, eventually leading to a filter capable of estimating the state of dynamic systems in real time.

## Basics of Kalman Filter

---

At the heart of the Kalman Filter lies a vision crafted by Rudolf Kalman, a vision that aimed to address the challenges of _estimating the state of a dynamic system in the presence of noisy measurements_. Kalman's approach was grounded in the notion that combining predictions from a mathematical model with real-world measurements could yield a more accurate and reliable estimate of the system's true state.

### Key Concepts in State Estimation

#### State Vector

The fundamental concept in the Kalman Filter is the state vector, representing the current state of the system. This vector encapsulates all the information needed to describe the system at a specific point in time. For instance, in a navigation system, the state vector might include parameters like position, velocity, and acceleration.

#### State Transition Matrix (A)

The system's dynamics are controlled by the state transition matrix, dictating the progression from one state to another over time. This matrix captures the fundamental physics or behavior of the system, enabling the anticipation of its future state given the present one. Linear systems make use of the Kalman filter, but non-linear updates can disrupt the Gaussian properties of the state distribution. To address this issue, the Extended Kalman Filter is employed, involving a linearized approximation of the transition function, which will be elaborated on in subsequent sections.

#### Observation Matrix (C)

Coupled with the state transition matrix is the observation matrix or the mixing matrix. This matrix relates the true state of the system to the measurements obtained from sensors. It serves as a bridge between the abstract world of the state vector and the tangible realm of sensor readings, because not always the components of state vector are directly measured.

#### Covariance Matrices $\sum_p$ $\sum_m$

Uncertainty is inherent in any real-world system. The Kalman Filter addresses this uncertainty through the use of covariance matrices. These matrices quantify the uncertainty associated with the state vector, the process noise (perturbations in the system dynamics) usually represented with the letter _p_, and the measurement noise (inaccuracies in sensor readings) usually represented with the letter _m_.

### The Kalman Filter Algorithm Steps

#### Prediction Step

The prediction step involves projecting the current state forward in time using the state transition matrix. Simultaneously, the uncertainty in the state estimate is also propagated forward. This step essentially anticipates the system's behavior based on its current state and dynamics.

#### Update Step

The update step is where the Kalman Filter truly shines. It combines the predicted state with the actual measurements, giving more weight to the component with lower uncertainty. The result is a refined and more accurate estimate of the system's state. This adaptive nature of the Kalman Filter makes it particularly robust in handling noisy measurements.

In the subsequent sections, we will look into the mathematical foundation of the Kalman Filter, providing a detailed look at the equations and principles that underpin its functionality. Additionally, we will explore real-world applications, showcasing how this elegant algorithm transforms raw data into invaluable insights across diverse domains.

## Mathematical Foundation

---

### Kalman Filter Equations

At its core, the Kalman Filter operates through a set of recursive equations that dynamically update the estimate of the system's state. The key equations governing the Kalman Filter process are as follows:

**1. Bayesian Modelling:**

- Discrete Linear Dynamical system of motion:

$$
x_{k+1} = A x_{k} + B u_{k}
$$

$$
z_t=C x_t
$$

This equation predicts the next state based on the previous state. $A$ is the state transition matrix . $u_k$ is any control input not dependant on $x$. $C$ is the mixing matrix, it tells us the relation between the measurement $z_t$ and the state $x_t$.

- Simple state vector $(x)$, position $(v)$ and velocity $(dv/dt)$:

$$
x_{k+1} := \begin{bmatrix} v & \frac{dv}{dt} \end{bmatrix}
$$

- State transition matrix:

$$
A = \begin{bmatrix} 1 & dt \\ 0 & 1 \end{bmatrix}
$$

- Model the state vector ($x_k$) with a gaussian:

$$
p(x_k) = \mathcal{N}(x_k, P_k)
$$

- Apply linear dynamics ($z$ is the measured value):

$$
p(x_{k+1}|x_k) = A p(x_k)
$$

$$
p(z_{k}|x_k) = C p(x_k)
$$

- Add noise for process and measurement ($v_p$ and $v_m$ are zero-mean gaussians):

$$
p(x_{k+1}|x_k) = A p(x_k)+v_p
$$

$$
p(z_{k}|x_k) = C p(x_k)+v_m
$$

- Introduce gaussian model for $x_t$:

$$
p(x_{k+1}|x_{k}) = A \mathcal{N}(x_k, P_k)+\mathcal{N}(0, Σ_p)
$$

$$
p(z_{k}|x_k) = C \mathcal{N}(x_k, P_k)+\mathcal{N}(0, Σ_m)
$$

- Apply linear transform to Gaussian Distribution:

$$
p(x_{k+1}|x_k) = \mathcal{N}(Ax_{k},\; AP_kA^T)+\mathcal{N}(0, Σ_p)
$$

$$
p(z_{k}|x_k) = \mathcal{N}(Cx_{k},\; CP_kC^T)+\mathcal{N}(0, Σ_m)
$$

- Apply summation:

$$
p(x_{k+1}|x_k) = \mathcal{N}(Ax_{k},\; AP_kA^T+Σ_p)
$$

$$
p(z_{k}|x_k) = \mathcal{N}(Cx_{k},\; CP_kC^T+Σ_m)
$$

2. **Bayesian Filtering using MAP:**

- Baye's Rule:

$$
P(\alpha|\beta) = \frac{P(\beta|\alpha) \cdot P(\alpha)}{P(\beta)}
$$

- Applying bayes rule to the Gaussian model in the previous step:

$$
p(x_{k+1}|z_{k+1}, x_{k}) = \frac{p(z_{k+1}|x_{k+1}, x_{k})p(x_{k+1}|x_{k})}{p(z_{k+1})}
$$

- Calculate the Maximum A Posterior Estimate:

$$
\hat{x}_{k+1} =\underset{x_{k+1}}{\text{argmax}} \left[ p(x_{k+1}|z_{k+1}, x_{k}) \right]
$$

$$
\hat{x}_{k+1} =\underset{x_{k+1}}{\text{argmax}} \left[ \frac{p(z_{k+1}|x_{k+1}, x_{k})p(x_{k+1}|x_{k})}{p(z_{k+1})} \right]
$$

$$
\hat{x}_{k+1} =\underset{x_{k+1}}{\text{argmax}} \left[ p(z_{k+1}|x_{k+1}, x_{k})p(x_{k+1}|x_{k}) \right]
$$

$$
\hat{x}_{k+1} =\underset{x_{k+1}}{\text{argmax}} \left[ \mathcal{N}(Cx_{k},\; CP_kC^T+Σ_m)\mkern 10mu\mathcal{N}(Ax_{k+1},\; AP_{k+1}A^T+Σ_p) \right]
$$

- Simplify with these equations:

$$
P = P_{k+1} = AP_{k}A^T+Σ_p
$$

$$
R = CP_{k+1}C^T+Σ_m
$$

- Simplify the exponential form of $\mathcal{N}$ using log:

$$
\hat{x}_{k+1} = \underset{x_{k+1}}{\text{argmin}} \left[ (z_{k+1} - Cx_{k+1})^T R^{-1} (z_{k+1} - Cx_{k+1}) + (x_{k+1} - Ax_{k})^T P^{-1} (x_{k+1} - Ax_{k}) \right]
$$

- Solve the optimization by setting the derivative to zero:

$$
\frac{d}{dx_{k+1}} \left[ (z_{k+1} - Cx_{k+1})^T R^{-1} (z_{k+1} - Cx_{k+1}) + (x_{k+1} - Ax_{k})^T P^{-1} (x_{k+1} - Ax_{k}) \right] = 0
$$

- Collect terms in the derivative:

$$
( C^T R^{-1} C + P^{-1} )\hat{x}_{k+1} = z^T_{k+1} R^{-1} C + P^{-1} A x_{k}
$$

$$
\hat{x}_{k+1} = ( C^T R^{-1} C + P^{-1} )^{-1} ( z^T_{k+1} R^{-1} C + P^{-1} A x_{k} )
$$

- Apply the matrix inversion lemma or the [Woodbury matrix identity](https://en.wikipedia.org/wiki/Woodbury_matrix_identity):

$$
( C^T R^{-1} C + P^{-1} )^{-1} = P - P C^T( R + CPC^T)^{-1}CP
$$

- Define Kalman Gain as: $K = PC^T( R + CPC^T)^{-1}$

- Expand the terms:

$$
\hat{x}_{k+1} = ( C^T R^{-1} C + P^{-1} )^{-1} ( z^T_{k+1} R^{-1} C + P^{-1} A x_{k} )
$$

$$
\hat{x}_{k+1} = ( P - KCP ) ( z^T_{k+1} R^{-1} C + P^{-1} A x_{k} )
$$

$$
\hat{x}_{k+1} = A x_k + P C^TR^{-1} z_{k+1} - KCAx_{k} - KCPC^TR^{-1}z_{k+1}
$$

$$
\hat{x}_{k+1} = A x_k - KCAx_{k} + (P C^TR^{-1} - KCPC^TR^{-1})z_{k+1}
$$

$$
\hat{x}_{k+1} = A x_k - KCAx_{k} + (P C^TR^{-1} - KCPC^TR^{-1})z_{k+1}
$$

- rearraging some terms we get $K = PC^TR^{-1} - KCPC^TR^{-1}$

$$
\hat{x}_{k+1} = A x_k - KCAx_{k} + Kz_{k+1}
$$

$$
\hat{x}_{k+1} = A x_k + K( z_{k+1} - CAx_{k} )
$$

3. **Prediction Step Equations:**

- **State Prediction:**

$$
\hat{x}_{k+1|k} = A \hat{x}_{k|k} + B u_{k+1}
$$

This equation predicts the next state based on the previous state, the state transition matrix $A$, and any control input $u_{k+1}$.

- **Covariance Prediction:**

$$
P_{k+1|k} = A P_{k|k} A^T + Σ_p
$$

This equation predicts the uncertainty in the state estimate, considering the uncertainty in the previous estimate $P_{k}$ and the process noise covariance matrix $Σ_p$.

4. **Update Step Equations:**

- **Kalman Gain Calculation:**

$$
K_{k+1} = P_{k+1|k} C^T (C P_{k+1|k} C^T + R)^{-1}
$$

The Kalman Gain determines how much emphasis to give to the prediction and measurement during the update. It is influenced by the uncertainty in the prediction, the measurement, and their relationship.

- **State Update:**

$$
\hat{x}_{k+1|k+1} = \hat{x}_{k+1|k} + K_{k+1}(z_{k+1} - C \hat{x}_{k+1|k})
$$

This equation updates the state estimate based on the prediction, the Kalman Gain, and the difference between the actual measurement $z_{k+1}$ and the predicted measurement $C \hat{x}_{k+1|k}$.

- **Covariance Update:**

$$
P_{k+1|k+1} = (I - K_{k+1} C) P_{k+1|k}
$$

Finally, this equation updates the uncertainty in the state estimate based on the Kalman Gain and the uncertainty in the prediction.

### Interpretation of Covariance Matrices

The covariance matrices ($P$, $Σ_p$, $Σ_m$) play a crucial role in quantifying uncertainty:

- $P_{k+1|k+1}$: Covariance of the state estimate after the update. It represents the uncertainty in the estimate considering both the prediction and the measurement.
- $Σ_p$: Covariance matrix associated with the process noise. It captures the uncertainty introduced by unpredictable changes in the system dynamics.
- $Σ_m$: Covariance matrix associated with measurement noise. It characterizes the uncertainty in sensor readings.

Understanding and appropriately tuning these covariance matrices are essential steps in configuring the Kalman Filter for specific applications.

### Iterative Nature of the Algorithm

The Kalman Filter is an iterative algorithm, meaning it repeats the prediction and update steps as new measurements become available. Each iteration refines the state estimate, leading to progressively more accurate and reliable results. The ability to adapt to changing conditions and update estimates in real-time makes the Kalman Filter a powerful tool for dynamic systems.

### Benefits of the Kalman Filter

1. **Adaptability:** The Kalman Filter dynamically adjusts its estimates based on incoming measurements, providing a responsive and adaptive solution.

2. **Optimal Fusion:** By considering both prediction and measurement uncertainties, the Kalman Filter optimally fuses information, giving more weight to more reliable sources.

3. **Efficient Use of Resources:** The algorithm efficiently handles noisy measurements, allowing systems to operate effectively in the presence of uncertainty without being overly conservative.

## Limitations and Challenges

---

The Kalman Filter is most effective when dealing with linear systems and Gaussian noise due to the simplicity of mathematical computations and closed-form solutions. However, real-world systems often exhibit nonlinear behavior, and noise may not conform to Gaussian distributions. In such cases, the standard Kalman Filter may yield suboptimal results. To address this, the Extended Kalman Filter (EKF) extends Kalman Filter principles to handle nonlinear systems by linearizing them at each time step. Despite this adaptation, the EKF introduces challenges as the linearization process relies on the quality of approximations, particularly affecting performance in highly nonlinear systems. More advanced techniques like Unscented Kalman Filter (UKF) or Particle Filters may be preferred in such scenarios.

The Kalman Filter's sensitivity to initial conditions, especially in cases with poorly defined initial state estimates or covariance matrices, poses a challenge. Incorrectly chosen initial conditions may lead to divergence or convergence to an inaccurate solution. Additionally, the effectiveness of the Kalman Filter is contingent on accurately modeling covariances associated with system dynamics and measurements. Obtaining precise values for these covariances can be challenging, potentially resulting in suboptimal filtering performance.

Despite its conceptual elegance, the Kalman Filter's real-time implementation can be computationally intensive, especially in applications with frequent updates and large state vectors. To meet real-time constraints, optimization and parallelization techniques may be necessary. Furthermore, assuming perfect knowledge of system dynamics in the state transition matrix may lead to model mismatch, as real-world dynamics can deviate from the model, impacting prediction accuracy. The Kalman Filter is designed to handle internal system dynamics but may struggle with disturbances or uncertainties not accounted for in the model, such as external disturbances, unmodeled dynamics, or sudden changes in system behavior. Striking a balance between over-optimization and adaptability is crucial to ensure robust performance across varying conditions.

While the Kalman Filter is a powerful and widely applied tool, practitioners must be mindful of its assumptions and limitations. Understanding the characteristics of the system, appropriately modeling uncertainties, and choosing the right variant (e.g., EKF for nonlinear systems) are essential for achieving optimal filtering performance in diverse real-world scenarios.

In the upcoming sections, we will explore the Extended Kalman Filter (EKF), an extension that addresses some of the limitations of the standard Kalman Filter, providing a more robust solution for nonlinear systems.

## Introduction to Extended Kalman Filter

---

The Extended Kalman Filter (EKF) emerged as a natural extension of the Kalman Filter to address the challenges posed by nonlinear systems. While the Kalman Filter excels in linear scenarios, many real-world applications involve dynamic systems with nonlinear dynamics. The EKF was developed to extend the applicability of the Kalman Filter to such nonlinear systems, offering a solution to the limitations imposed by the linearity assumption.

#### Dynamic Systems

In various fields, ranging from robotics to aerospace, the dynamics of systems often exhibit nonlinear behavior. Linearizing such systems for use with the standard Kalman Filter might lead to inaccuracies, especially when dealing with large deviations from the linear model.

#### Sensor Measurements

Nonlinearities can also be present in sensor measurements. For example, the relationship between sensor readings and the true state of a system may not be linear. The EKF addresses this challenge by incorporating the nonlinearity directly into the estimation process.

#### Linearization Process

_The key innovation of the Extended Kalman Filter lies in the linearization of the nonlinear system at each time step._ Unlike the standard Kalman Filter, which assumes linear dynamics, the EKF linearizes the system by approximating its nonlinear functions through first-order Taylor series expansions.

#### Jacobian Matrices

In the linearization process, Jacobian matrices play a crucial role. These matrices capture the partial derivatives of the nonlinear functions with respect to the state variables. By using these matrices, the EKF effectively transforms the nonlinear system into a linearized representation that can be handled by the Kalman Filter.

#### Prediction Step

The prediction step in the EKF closely resembles the Kalman Filter, involving the projection of the current state forward in time using the state transition matrix and incorporating the uncertainty associated with the process noise. The equations for the prediction step in the EKF are adapted to handle the nonlinearity introduced by the system dynamics.

#### Update Step

In the update step, the EKF incorporates measurements to refine the state estimate. The Kalman Gain calculation and state update equations in the EKF, while similar in structure to the Kalman Filter, involve the use of Jacobian matrices to account for the nonlinearity.

## Mathematical Adaptations in EKF

---

### Linearization Process

#### Overview

The challenge in applying the EKF to nonlinear systems lies in accommodating the nonlinearity within the Kalman Filter framework. The EKF achieves this by employing a linearization process at each time step. Linearization involves approximating the nonlinear functions defining the system dynamics and measurements through first-order Taylor series expansions.

#### Taylor Series Expansion

For a scalar function $f(x)$ of a vector variable $x$, the first-order Taylor series expansion is given by:

$$
f(x) \approx f(\hat{x}) + \nabla f(\hat{x})^T (x - \hat{x})
$$

where $\hat{x}$ is a reference point, $\nabla f(\hat{x})$ is the gradient of $f$ at $\hat{x}$, and $T$ denotes the transpose.

For a vector function $g(x)$ of a vector variable $x$, the extension is:

$$
g(x) \approx g(\hat{x}) + J_g(\hat{x}) (x - \hat{x})
$$

where $J_g(\hat{x})$ is the Jacobian matrix of $g$ at $\hat{x}$.

### Jacobian Matrices

For a vector valued function $f(x)$ where $f(x) = [f_1(x), f_2(x), \dots, f_m(x)]^T$, the Jacobian matrix $J_f(x)$ is a matrix containing the partial derivatives of each element of $f$ with respect to each element of $x$:

$$
J_f(x) = \begin{bmatrix} \frac{\partial f_1}{\partial x_1} & \frac{\partial f_1}{\partial x_2} & \dots & \frac{\partial f_1}{\partial x_n} \\ \frac{\partial f_2}{\partial x_1} & \frac{\partial f_2}{\partial x_2} & \dots & \frac{\partial f_2}{\partial x_n} \\ \vdots & \vdots & \ddots & \vdots \\ \frac{\partial f_m}{\partial x_1} & \frac{\partial f_m}{\partial x_2} & \dots & \frac{\partial f_m}{\partial x_n} \end{bmatrix}
$$

### Adaptations in EKF Equations

#### Prediction Step in EKF

The prediction step in the Extended Kalman Filter closely follows the Kalman Filter's prediction equations. However, in the EKF, the state transition matrix $A$ is replaced with the Jacobian matrix $F_{k+1}$ to account for the <span style="color: #0084a5;">nonlinearity in the system dynamics</span>:

$$
\hat{x}_{k+1|k} = f(\hat{x}_{k|k}, u_{k+1})
$$

$$
P_{k+1|k} = F_{k+1} P_{k|k} F_{k+1}^T + Q_k
$$

where $F_{k+1} = J_f(\hat{x}_{k|k})$.

#### Update Step in EKF

Similarly, in the update step, the Kalman Gain ( $K_k$), state update, and covariance update equations are adapted to incorporate the Jacobian matrix $H_k$ reflecting the <span style="color: #0084a5;">nonlinearity in the measurement function</span>:

$$
K_{k+1} = P_{k+1|k} H_{k+1}^T (H_{k+1} P_{k+1|k} H_{k+1}^T + R_{k+1})^{-1}
$$

$$
\hat{x}_{k+1|k+1} = \hat{x}_{k+1|k} + K_{k+1}(z_{k+1} - h(\hat{x}_{k+1|k}))
$$

$$
P_{k+1|k+1} = (I - K_{k+1} H_{k+1}) P_{k+1|k}
$$

where $H_{k+1} = J_h(\hat{x}_{k+1|k})$ and $h(\hat{x}_{k+1|k})$ represents the measurement function.

### Challenges in Linearization

#### Accuracy Concerns

The accuracy of the Extended Kalman Filter heavily depends on the quality of the linearization process. In situations where the system dynamics are highly nonlinear or the linearization is not well-executed, the filter's performance may be compromised.

#### Consistency Checks

Practitioners often perform consistency checks to assess the validity of the linearization. This may involve comparing the estimated Jacobian matrices with numerical derivatives or utilizing additional techniques to validate the linearization accuracy.

In the subsequent sections, we will explore practical examples and applications of the Extended Kalman Filter, showcasing how the linearization process and Jacobian matrices enable the filter to handle nonlinearities and enhance its performance in a variety of real-world scenarios.

## Applications of EKF

---

EKF is widely employed in diverse applications within the field of robotics. In simultaneous localization and mapping (SLAM) for robots, EKF integrates sensor data, such as cameras and lidar, to estimate the robot's position and construct an environment map. Its effectiveness in dynamic scenarios, where nonlinearities arise from both robot motion and sensor measurements, makes EKF a preferred choice for enhancing robotic navigation capabilities. Additionally, EKF plays a crucial role in the control of robotic arms, managing nonlinearities originating from the intricate kinematics and dynamics of the robotic system. Through the estimation of joint angles and velocities using sensor feedback, EKF contributes to precise control and motion planning in robotic arm applications.

Beyond robotics, EKF is instrumental in various aerospace and transportation domains. In spacecraft navigation, EKF addresses the challenges posed by nonlinearities in the gravitational field and orbital dynamics. It integrates measurements from instruments like star trackers, gyros, and accelerometers to accurately determine the spacecraft's position and orientation. Similarly, in aviation, EKF is utilized for aircraft state estimation, including position, velocity, and attitude. This is crucial for autonomous flight systems and enhancing navigation accuracy, especially in challenging conditions.

EKF also plays a significant role in non-robotic applications, such as physiological signal processing and environmental monitoring. In biomechanics, EKF assists in tracking the motion of body segments, particularly in scenarios like gait analysis where human body dynamics are nonlinear. Moreover, in physiological signal processing, EKF aids in denoising and extracting relevant information from signals like electrocardiograms (ECG) and electroencephalograms (EEG), leveraging its suitability for nonlinear signal processing tasks. In environmental sensor networks, EKF is applied for tracking and predicting phenomena like pollutant concentrations, temperature, and humidity, where nonlinear dynamics are common. This wide-ranging utility showcases EKF's adaptability across various fields and its effectiveness in addressing nonlinear challenges in diverse applications.

### Summary

The Extended Kalman Filter, with its capability to handle nonlinear systems, is a versatile tool across various domains. Its applications range from navigation and control in robotics to state estimation in aerospace and automotive systems. In fields such as biomedical engineering and environmental monitoring, the EKF contributes to accurate signal processing and parameter estimation. Despite its challenges, the EKF remains a valuable asset for researchers and engineers working on systems with nonlinear dynamics and measurements.
