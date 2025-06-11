import { Clock } from 'three';


const clock = new Clock();

// main update loop setup
class Loop {
    constructor(camera, scene, renderer, controls, viewerWidth, viewerHeight, appClassName) {
        this.camera = camera,
        this.scene = scene,
        this.renderer = renderer,
        this.controls = controls,
        this.target = null,
        this.pivotTarget = null,
        this.updatables = [],
        this.interval = 0,
        this.delta = 0,
        this.viewerWidth = viewerWidth, 
        this.viewerHeight = viewerHeight,
        this.appClassName = appClassName,
        this.composer = null
    }

    // starts the main animation/ update loop
    start() {
        // set frames to limit 60fps
        this.interval = 1/60;

        this.renderer.setAnimationLoop(() => {
            this.update();
        });
    }

    // stops the loop and animations
    stop() {
        this.renderer.setAnimationLoop(null);
        this.controls.autoRotate = false;
    }

    // makes the camera lerp to a given position
    camTween() {
        this.camera.position.lerp(this.target, 0.03);
    }

    update() {
        this.delta += clock.getDelta();
      
        if (this.delta > this.interval) {
            // render scene
            this.renderer.render(this.scene, this.camera);

            // render all object updates for each frame
            for (const object of this.updatables) {
                object.tick(this.delta);
            }

            // render camera changes each frame as a tween
            if (this.target != null) this.camTween();

            // render orbit focus point each frame
            if (this.pivotTarget != null) this.controls.target.set(this.pivotTarget.x, this.pivotTarget.y, this.pivotTarget.z);

            // render the effect composer
            if (this.composer != null) this.composer.render();

            this.delta = this.delta % this.interval;
        }
    }
}

export { Loop };