import { World } from "./Engine";
import { Particles } from "./Particles";
export class Experience {
  private world: World;
  private particles: Particles;

  constructor(domElement: HTMLElement) {
    this.world = new World({ domElement });
    this.world.view.camera.position.set(0, 5, 8);

    this.particles = new Particles(100);
    this.world.scene.add(this.particles.particles);

    this.world.time.events.on("tick", ({ delta }) => {
      this.animate(delta);
    });
  }

  private animate(deltaTime: number) {
    this.particles.update(deltaTime);
  }

  public dispose() {
    this.world.dispose();
  }
}
