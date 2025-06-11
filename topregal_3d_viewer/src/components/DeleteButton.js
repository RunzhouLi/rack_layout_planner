import { Vector3, Box3 } from "three";


class DeleteButton {
    constructor(scene, loop, renderer, camera, yOffset) {
        this.scene = scene,
        this.loop = loop,
        this.renderer = renderer,
        this.camera = camera,
        this.clickedObj = null,
        this.button = null,
        this.yOffset = yOffset
    }

    init() {
        var appContainer = document.querySelector(this.loop.appClassName);

        this.button = document.createElement("div");
        this.button.classList.add("raycast-delete-button");
        this.button.innerText = "-";
        appContainer.appendChild(this.button);

        // set element position every frame
        this.loop.updatables.push(this);
    }

    show() {
        this.button.style.opacity = 1;
    }

    hide() {
        this.button.style.opacity = 0;
    }

    tick() {
        if (this.clickedObj) {
            var bbox = new Box3().setFromObject(this.clickedObj);

            const vector = new Vector3(bbox.max.x, bbox.max.y, bbox.max.z);
            const canvas = this.renderer.domElement;

            this.show();
    
            // calculates the position of the annotation and places it with CSS according to screen size
            vector.project(this.camera);

            vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
            vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));

            this.button.style.top = `${vector.y-20 + this.yOffset}px`;
            this.button.style.left = `${vector.x-20}px`;
        }
        else this.hide();
    }
}

export { DeleteButton }