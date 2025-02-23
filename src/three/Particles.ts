import * as THREE from "three";

export class Particles {
  public particles: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private count: number;
  private squareSize = 5;

  private gravity = 9.81;
  private collisionDamping = 0.8;
  private velocities: Float32Array;

  constructor(count: number) {
    this.count = count;

    this.geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * this.squareSize;
      positions[i * 3 + 1] = Math.random() * this.squareSize;
      positions[i * 3 + 2] = 0;

      this.velocities[i * 3 + 0] = 0;
      this.velocities[i * 3 + 1] = 0;
      this.velocities[i * 3 + 2] = 0;
    }

    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    this.material = new THREE.ShaderMaterial({
      vertexShader: Particles.vertexShader,
      fragmentShader: Particles.fragmentShader,
      uniforms: {
        size: new THREE.Uniform(0.5),
      },
      transparent: true,
      depthWrite: false,
    });
    this.particles = new THREE.Points(this.geometry, this.material);
  }

  static get vertexShader() {
    return /* glsl */ `
      uniform float size;

      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;
  }

  static get fragmentShader() {
    return /* glsl */ `
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        float alpha = 1.0 - smoothstep(0.45, 0.5, dist);
        gl_FragColor = vec4(0.0, 0.0, 1.0, alpha);
      }
    `;
  }

  public update(deltaTime: number) {
    for (let i = 0; i < this.count; i++) {
      this.applyGravity(deltaTime, i);
      this.moveParticles(deltaTime, i);
      this.resolveCollisions(i);
    }
    this.geometry.attributes.position.needsUpdate = true;
  }

  private applyGravity(deltaTime: number, index: number) {
    const vyIndex = index * 3 + 1;
    this.velocities[vyIndex] -= this.gravity * deltaTime;
  }

  private moveParticles(deltaTime: number, index: number) {
    const positions = this.geometry.attributes.position;
    const vx = this.velocities[index * 3 + 0];
    const vy = this.velocities[index * 3 + 1];
    const vz = this.velocities[index * 3 + 2];

    const x = positions.getX(index) + vx * deltaTime;
    const y = positions.getY(index) + vy * deltaTime;
    const z = positions.getZ(index) + vz * deltaTime;

    positions.setXYZ(index, x, y, z);
  }

  private resolveCollisions(index: number) {
    const positions = this.geometry.attributes.position;
    const half = this.squareSize / 2;

    let x = positions.getX(index);
    let y = positions.getY(index);
    let z = positions.getZ(index);

    let vx = this.velocities[index * 3 + 0];
    let vy = this.velocities[index * 3 + 1];
    let vz = this.velocities[index * 3 + 2];

    if (x < -half) {
      x = -half;
      vx *= -this.collisionDamping;
    } else if (x > half) {
      x = half;
      vx *= -this.collisionDamping;
    }

    if (y < 0) {
      y = 0;
      vy *= -this.collisionDamping;
    } else if (y > this.squareSize) {
      y = this.squareSize;
      vy *= -this.collisionDamping;
    }

    if (z < -half) {
      z = -half;
      vz *= -this.collisionDamping;
    } else if (z > half) {
      z = half;
      vz *= -this.collisionDamping;
    }

    positions.setXYZ(index, x, y, z);
    this.velocities[index * 3 + 0] = vx;
    this.velocities[index * 3 + 1] = vy;
    this.velocities[index * 3 + 2] = vz;
  }
}
