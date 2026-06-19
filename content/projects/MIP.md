---
title: "Mobile Inverted Pendulam : Control and Dynamics"
date: 2024-02-20T23:15:00+09:00
slug: MIP
category: projects
summary:
description:
cover:
  image: "covers/cuteRobot.png"
  alt:
  caption:
  relative: true
showtoc: true
draft: false
---

## Introduction

---

The Mobile Inverted Pendulum (MIP) serves as an excellent introduction in the understanding of control systems and robotics. Comprising an inverted pendulum mounted on a wheel, the MIP exemplifies an inherently unstable system that constantly seeks equilibrium. This characteristic instability necessitates the application of advanced control methodologies to ensure stability and enable precise maneuvering. This project was implemented as part of the [<span style="color: #ffa700">Robotics Specialization in Coursera</span>](https://www.coursera.org/specializations/robotics?utm_medium=sem&utm_source=gg&utm_campaign=b2c_emea_meta-front-end-developer_meta_ftcof_professional-certificates_arte_feb_24_dr_geo-multi_pmax_gads_lg-all&campaignid=21045376738&adgroupid=&device=c&keyword=&matchtype=&network=x&devicemodel=&adposition=&creativeid=&hide_mobile_promo&gad_source=1&gclid=Cj0KCQjwltKxBhDMARIsAG8KnqW6-NwVWxao-B5xSPRXH8JHQLgJzT3Kc6nCuY218nqBH32jBKM3Tg4aAn5wEALw_wcB).

In the broader context of robotics and automation, mastering control systems is crucial for achieving desired outcomes in various applications. The MIP, with its dynamic and unpredictable nature, serves as an ideal testbed for exploring sophisticated control strategies that can be extended to other complex robotic systems.

This post delves into the world of control systems applied to the MIP, with a particular focus on the integration of an [<span style="color: #ffa700;">Extended Kalman Filter (EKF)</span>]({{< ref "blogs/Kalman-Filter" >}}) for state estimation and a <span style="color: #0084a5">Proportional-Integral-Derivative (PID)</span> controller for stabilization. Through the lens of <span style="color: #0084a5;">Lagrangian mechanics</span>, the fundamental principles governing the motion of the MIP are explored, laying the groundwork for the subsequent design and implementation of a robust control system.

As we navigate through the various components of the control system, from deriving the equation of motion using Lagrangian mechanics to employing MATLAB's ode45 function to solve the differential equation for simulation, we aim to provide a comprehensive understanding of the intricacies involved. This post seeks to not only elucidate the theoretical foundations but also guide readers through the practical implementation, showcasing the synergy between mathematical modeling and real-world application.

The journey begins with an exploration of Lagrangian mechanics and the derivation of the equation of motion, providing a solid foundation for understanding the dynamics of the MIP. Subsequently, we delve into the world of control systems, introducing the PID controller as a powerful tool for stabilizing the MIP.

Recognizing the significance of accurate state estimation, the Extended Kalman Filter is introduced as a key element in the control system architecture. The synergy between the PID controller and the EKF is then exemplified through meticulous MATLAB implementation, highlighting the step-by-step process of integrating these components to achieve a well-coordinated and stable control system.

The utilization of MATLAB's ode45 function for solving the differential equation derived from Lagrangian mechanics adds a practical dimension to the theoretical concepts, enabling readers to visualize and comprehend the system's behavior in a simulated environment.

{{< rawhtml>}}

<p align="center">
  <img src="../images/MIP/MIP.png" alt="Image description" class="img-fluid" style="max-width: 50%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 1: Free Body Diagram</em>
</p>
{{< /rawhtml>}}

## Modelling a MIP

---

### Explanation of the Physical Principles using Lagrangian Mechanics

Lagrangian mechanics offers a fresh perspective on understanding motion, departing from the conventional Newtonian mechanics which relies on forces to a focus on energy and optimization. In this framework, motion is conceptualized as an optimization process, with the Lagrangian (L), defined as the difference between kinetic energy (T) and potential energy (V), playing a central role. The <span style="color: #0084a5">principle of stationary action</span> dictates that physical systems follow trajectories that minimize the action, computed as the integral over time of the Lagrangian along a given trajectory. This optimization process allows for the prediction of motion by effectively balancing kinetic and potential energies.

The Lagrangian, specifically expressed as L = T - V in classical mechanics, is chosen for its ability to succinctly encapsulate information about the dynamics of a system. The preference for T - V over T + V is justified by the dynamic nature of potential energy, capturing changes in the system rather than its absolute influence on motion. The Lagrangian formulation consistently produces Newton's second law, F = ma, showcasing its effectiveness in predicting the trajectories of physical systems through energy considerations and the principle of stationary action.

The principle of stationary action is elucidated as the foundational concept underlying Lagrangian mechanics. The action, defined as the integral of the Lagrangian over time, is a measure of a system's trajectory through space and time. The principle dictates that the real trajectory a system takes is the one where the action is stationary, expressed mathematically as the functional differential δA = 0. This means that slight variations in the action, or infinitesimal changes in the trajectory, do not affect the overall value of the action. While the mathematical formulation is precise, the intuitive understanding of stationarity draws parallels to stationary points in basic calculus.

<span style="color: #0084a5">The motivation behind why physical systems adhere to the principle of stationary action remains a fascinating yet unanswered question.</span> Despite the lack of a definitive answer, there is a sense of reason in the idea that the universe tends to optimize its behavior, striving towards equilibrium states. In a similar vein to thermodynamics, where systems evolve towards thermal equilibrium, the principle of stationary action suggests that physical systems tend to evolve towards a state where the action is at a stationary point or equilibrium. Though somewhat abstract, this principle is observed across various phenomena in the universe, prompting its acceptance as a postulate in Lagrangian mechanics.

Lagrangian mechanics provides a powerful framework for understanding the dynamics of mechanical systems, emphasizing the concept of generalized coordinates and the principle of least action. In the case of the MIP, we will explore the Lagrangian formulation to derive the equation of motion.

- **Generalized Coordinates:**
  The first step in Lagrangian mechanics involves defining a set of generalized coordinates that uniquely describe the system's configuration. For the MIP, let's denote the wheel/body angle as $\phi$ and body roll angle as $\theta$. Therefore, we get the following state vector:

$$
q:=\begin{bmatrix} \theta \\ \phi \end{bmatrix}
$$

- **Position of Center of Mass relative to drawn coordinate frame:**

$$
p = r\begin{bmatrix} \theta+\phi \\ 0 \end{bmatrix} + l\begin{bmatrix} sin(\phi) \\ cos(\phi) \end{bmatrix}
$$

- **Kinetic Energy:**
  The kinetic energy _T_ of the system is expressed as the sum of translational and rotational kinetic energies:

$$
T = \frac{1}{2}m_b (\dot{p}^T\dot{p}) + \frac{1}{2}i_b\dot{\phi}^2
$$

- **Potential Energy:**
  The potential energy (_V_) is associated with the gravitational potential energy of the pendulum:

$$
V = m_bglcos(\phi)
$$

where _g_ is the acceleration due to gravity.

- **Lagrangian (L):**

  The Lagrangian (_L_) is defined as the difference between kinetic and potential energy:

$$
L = T - V
$$

Substituting the expressions for _T_ and _V_, we obtain:

$$
L = \frac{1}{2}m_b (\dot{p}^T\dot{p}) + \frac{1}{2}i_b\dot{\phi}^2 - m_bglcos(\phi)
$$

- **Euler-Lagrange Equation:**

  The dynamics of the system are determined by the Euler-Lagrange equation:

$$
\frac{d}{dt} \left( \frac{\partial L}{\partial \dot{q}_i} \right) - \frac{\partial L}{\partial q_i} = 0
$$

where $q_i$ represents the generalized coordinates. Applying this equation to $\phi$ and $\theta$, we obtain two coupled second-order differential equations.

For example, the equation for $\theta$ would be:

$$
\frac{d}{dt} \left( \frac{\partial L}{\partial \dot{\theta}} \right) - \frac{\partial L}{\partial \theta} = \tau
$$

$\tau$ represents the wheel torque/input between wheel and the body. This equation, once solved, provides the equation of motion for the inverted pendulum.

- **First Derivative of position vector p with time:**

$$
\dot{p} = \begin{bmatrix} r(\dot{\phi} + \dot{\theta}) + lcos(\phi)\dot{\phi} \\ -lsin(\phi)\dot{\phi} \end{bmatrix}
$$

- **Finding $\dot{p}^T\dot{p}$:**

$$
\dot{p}^T\dot{p} = r^2(\dot{\theta} + \dot{\phi})^2 + 2r(\dot{\theta} + \dot{\phi})lcos(\phi)\dot{\phi} + l^2cos^2(\phi)\dot{\phi}^2 + l^2sin^2(\phi)\dot{\phi}^2
$$

- **Solving Euler-Lagrange Equation for $\theta$:**

$$
\frac{d}{dt} \left( \frac{\partial L}{\partial \dot{\theta}} \right) - \frac{\partial L}{\partial \theta} = \tau
$$

Finding each component of the Euler-Lagrange Equation:

$$
\frac{\partial L}{\partial \theta} = 0
$$

$$
\frac{\partial L}{\partial \dot{\theta}} = \frac{1}{2}m \left[  r^2(2\dot{\theta} + 2\dot{\phi}) + 2rlcos(\phi)\dot{\phi} \right]
$$

$$
\frac{d}{dt} \left( \frac{\partial L}{\partial \dot{\theta}} \right) = \frac{1}{2}m \left[ r^2(2\ddot{\theta} + 2\ddot{\theta}) + 2rl\ddot{\phi}cos(\phi) + 2rl(-sin(\phi))\dot{\phi}^2 \right]
$$

Substituting the component values in the Euler-Lagrange Equation:

$$
\Rightarrow m \left[2 r^2(\ddot{\theta} + \ddot{\theta}) + 2rl\ddot{\phi}cos(\phi) - 2rlsin(\phi)\dot{\phi}^2 \right] = 2\tau
$$

$$
\Rightarrow \left(mr^2+lcos(\phi) \right)\ddot{\phi} + mr^2\ddot{\theta} = \tau + mrlsin(\phi)\dot{\phi}^2
$$

- **Solving Euler-Lagrange Equation for $\phi$:**

$$
\frac{d}{dt} \left( \frac{\partial L}{\partial \dot{\phi}} \right) - \frac{\partial L}{\partial \phi} = 0
$$

Finding each component of the Euler-Lagrange Equation:

$$
\frac{\partial L}{\partial \phi} = mglsin(\phi) + \frac{1}{2} \left[-2r(\dot{\theta}+\dot{\phi})lsin(\phi)\dot{\phi} + 2l^2\dot{\phi}^2sin(\phi)cos(\phi) - 2l^2cos(\phi)sin(\phi)\dot{\phi}^2 \right]
$$

$$
\Rightarrow \frac{\partial l}{\partial \phi} = mglsin(\phi)\dot{\phi} - mr( \dot{\theta} + \dot{\phi})lsin(\phi)
$$

$$
\frac{\partial L}{\partial \dot{\phi}} = \frac{1}{2}m \left[  r^2(2\dot{\theta} + 2\dot{\phi}) + 2rlcos(\phi)\dot{\theta} +4rlcos(\phi)\dot{\phi} +2l^2\dot{\phi} \right] + i_b\dot{\phi}
$$

$$
\frac{d}{dt} \left( \frac{\partial L}{\partial \dot{\phi}} \right) = \frac{1}{2}m \left[ r^2(2\ddot{\theta} + 2\ddot{\theta}) + 2rl\ddot{\theta}cos(\phi) - 2rlsin(\phi)\dot{\phi}\dot{\theta} + 4rlcos(\phi)\ddot{\phi} - 4rlsin(\phi)\dot{\phi}^2 + 2l^2\ddot{\phi} \right] + i_b\ddot{\phi}
$$

Substituting the component values in the Euler-Lagrange Equation:

$$
\Rightarrow (mr^2 + mrlcos(\phi))\ddot{\theta} + (2mrlcos(\phi) + i_b + ml^2 + mr^2)\ddot{\phi} = mlsin(\phi)(g + r\dot{\phi}^2)
$$

- **Writing the equation of motion in $Ax=b$ form:**

$$
\begin{bmatrix} mr^2 & mr^2 + mrlcos(\phi) \\ mrlcos(\phi) + mr^2 & 2mrlcos(\phi) + i_b + mr^2 + ml^2 \end{bmatrix} \begin{bmatrix} \ddot{\theta} \\ \ddot{\phi} \end{bmatrix} = \begin{bmatrix} mrl\dot{\phi}^2 + sin(\phi) + \tau \\ mlsin(\phi)(g + r\dot{\phi}^2) \end{bmatrix}
$$

Once we have derived the equation of motion for the Mobile Inverted Pendulum using Lagrangian mechanics, the next step is to translate this theoretical framework into a practical MATLAB implementation. Let's walk through the MATLAB code that achieves this.

```Matlab
function qdd = eom(params, th, phi, dth, dphi, u)
  % This function computes the acceleration (qdd) of the system based on the
  % provided parameters and current state.

  % Extracting parameters
  g = params.g;
  m = params.mr;
  i = params.ir;
  l = params.d;
  r = params.r;
  tau = u;

  % Building the coefficient matrix A
  A = sym(zeros(2,2));
  A(1,1) = m*r^2;
  A(1,2) = m*r^2 + m*r*l*cos(phi);
  A(2,1) = m*r*l*cos(phi) + m*r^2;
  A(2,2) = 2*m*r*l*cos(phi) + i + m*r^2 + m*l^2;

  % Building the input vector b
  b = sym(zeros(2,1));
  b(1,1) = m*r*l*dphi^2*sin(phi) + tau;
  b(2,1) = m*l*sin(phi)*(g + r*dphi^2);

  % Solving for the accelerations (qdd) using the linear system Ax = b
  qdd = A\b;
end
```

## Control System Design

---

The control system design involves the development of a controller that utilizes noisy IMU measurements ($z = [a_y, a_z, \dot{\phi}]$, where $a_y$ and $a_z$ are the accelerometer readings in units of g's and $\dot{\phi}$ is the gyroscope reading in units of rad/s) and employs an Extended Kalman Filter (EKF) to estimate the state. The ultimate goal is to control the system to follow a desired trajectory, which is provided by the displacement along the horizontal direction as a function of time.
{{< rawhtml>}}

<p align="center">
  <img src="../images/MIP/IMU.png" alt="Image description" class="img-fluid" style="max-width: 50%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 2: Measurements from IMU</em>
</p>
{{< /rawhtml>}}

### Measurements from the IMU:

The measurement function or the mixing matrix is a non-linear function, which is as follows:

$$
z_k = \begin{bmatrix} sin(\phi) \\ cos(\phi) \\ \dot\phi \end{bmatrix} =:h(x_k)
$$

### Extended Kalman Filter (EKF) Update:

We use EKF algorithm considering the non-linearity in the observation to perform state estimation. The jacobian matrix H is as follows:

$$
H := \frac{\partial h}{\partial x} = \begin{bmatrix} cos(\phi) & 0\\ -sin(\phi) & 0 \\ 0 & 1 \end{bmatrix}
$$

For a detailed understanding of EKF and the parameters used in the below code check out [<span style="color: #ffa700;">Kalman Filter and EKF</span>]({{< ref "blogs/Kalman-Filter" >}}) blog post.

```matlab
function xhatOut = EKFupdate(params, t, z)
    % Noise covariance matrices
    Q = diag([0.01, 0.01]);  % Process noise
    R = diag([0.1, 0.1, 0.1]);  % Measurement noise

    persistent xhat P t_ekf
    if isempty(P)
        P = eye(2);
        t_ekf = 0;
        xhat = [0; 0];
    end

    dt = t - t_ekf;
    A = [1, dt; 0, 1];
    xhat = A * xhat;
    P = A * P * A' + Q;

    phi = xhat(1);
    phidot = xhat(2);

    H = [cos(phi), -sin(phi), 0; 0, 0, 1]';  % Jacobian matrix
    K = P * H' / (H * P * H' + R);

    h = [sin(phi), cos(phi), phidot]';  % Measurement function
    xhat = xhat + K * (z - h);
    P = (eye(2) - K * H) * P;

    t_ekf = t;
    xhatOut = xhat;
end
```

{{< rawhtml>}}

<p align="center">
  <img src="../images/MIP/EKF.png" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 3: An example of EKF state estimation</em>
</p>
{{< /rawhtml>}}

### Cascade Control Strategy:

MIP is a type of coupled non-linear system. For such systems changes in one variable can affect others, leading to a system with interdependencies. Modeling and controlling such coupled systems require considering these interactions, making the analysis more challenging compared to uncoupled systems. In order to overcome this issue we perform approximation close to equilibrium, which results in $\phi$ and $\dot{\phi}$ to be zero, substituting the results in the equation of motion of MIP results in the following results:

$$
\ddot{\phi}|_{\phi=0,\dot{\phi}=0} = \alpha\tau
$$

$$
\ddot{\theta}|_{\phi=0,\dot{\phi}=0} = \beta\sin(\phi)
$$

Approximately this suggests a cascade problem. A cascade system refers to a configuration where there is an influence of one subsystem on another, but there is no direct return influence from the second subsystem to the first one. In a cascade control system for an inverted pendulum, the primary objective is to stabilize the pendulum in the upright position. This is typically done by employing two layers of control:

- **Inner Loop (Fast Control):** The inner loop is responsible for stabilizing the pendulum body. It reacts quickly to changes in the pendulum's angle and works to keep it balanced.

- **Outer Loop (Slow Control):** The outer loop is concerned with controlling the position of the cart. It adjusts the cart's position to counteract disturbances and maintain the overall stability of the system.

The controllerNoisyEnc function integrates the EKF estimate into the control law for trajectory tracking. The control law uses a PD controller to determine the control input _u_ based on the estimated state and the desired trajectory. The sine function is used in $\phi$'s PD controller to saturate u_phi when the angle error is large.

```matlab
function u = controllerNoisyEnc(params, t, obs, th, dth)
    % EKF Update for state estimation
    xhat = EKFupdate(params, t, obs);
    phi = xhat(1);
    phidot = xhat(2);

    % Task-space control based on PD controller
    x = params.r * (th + phi);
    xdot = params.r * (dth + phidot);

    kp_x = 0.2;
    kd_x = 0.5;
    e_x = params.traj(t) - x;
    edot_x = 0 - xdot;

    u_x = kp_x * e_x + kd_x * edot_x;
    phi_des = asin(u_x);

    % Joint-space control based on PD controller
    kp_phi = 0.1;
    kd_phi = 0.01;
    e_phi = phi_des - phi;
    edot_phi = 0 - phidot;

    u_phi = kp_phi * sin(e_phi) + kd_phi * edot_phi;
    u = -u_phi;
end
```

This controller design incorporates sensor fusion through the EKF, enabling the system to mitigate the impact of noisy sensor measurements and accurately estimate the state for improved trajectory tracking performance. The cascade PD control law adjusts the joint and task-space velocities to achieve the desired trajectory, providing robustness in the face of sensor uncertainties. The gains $k_{px}$, $k_{dx}$, $k_{p\phi}$, and $k_{d\phi}$ can be tuned to achieve the desired trade-off between tracking accuracy and control effort.

## ode45 for Solving Differential Equations

---

The `ode45` function in MATLAB is a versatile and widely used solver for ordinary differential equations (ODEs). The term "ODE" refers to equations that involve one independent variable and its derivatives. In the context of control systems and robotics, ODEs often describe the dynamic behavior of systems over time.

The `ode45` function uses an adaptive time-stepping Runge-Kutta method to numerically solve initial value problems (IVPs) of the form:

$$
\frac{dy}{dt} = f(t, y)
$$

where $y$ is the dependent variable, _t_ is the independent variable (time), and $f(t, y)$ is a given function representing the rate of change of _y_ with respect to _t_.

The basic syntax for using `ode45` is:

```matlab
[T, Y] = ode45(@odeFunction, tspan, y0);
```

- `@odeFunction`: The ODE function, which is a MATLAB function file or an anonymous function that specifies the system of ODEs. It takes _t_ and _y_ as input arguments and returns the derivative $dy/dt$.

- `tspan`: A vector specifying the time span over which the ODEs should be solved.

- `y0`: The initial conditions for the dependent variables.

- `T`: Output time vector.

- `Y`: Output solution matrix where each column corresponds to a different dependent variable.

The adaptive nature of `ode45` adjusts the time step during integration to maintain accuracy, making it suitable for a wide range of ODE problems.

**Integration of the Equation of Motion using ODE45 for Simulation:**

In the context of control system for MIP, the equation of motion is a set of coupled second-order ODEs derived from the Lagrangian mechanics, governing the dynamics of the system.

The simulation results, obtained using `ode45`, can then be visualized through plots or animations to understand how the system evolves over time under the influence of the control input. This process is crucial for assessing the performance and stability of your control system design.

{{< rawhtml>}}

<p align="center">
  <img src="../images/MIP/MIPGIF.gif" alt="Image description" class="img-fluid" style="max-width: 100%; height: auto; border-radius: 10px; width: 100%"/>
</p>
<p align="center">
  <em>Figure 4: Feedback Motion Planning Output</em>
</p>
{{< /rawhtml>}}
