import { Vector2, Raycaster } from 'three';
import { DeleteButton } from "../components/DeleteButton.js";

class Raycast {
    constructor(scene, camera, composer, renderer, loop) {
        this.scene = scene,
        this.camera = camera,
        this.composer = composer,
        this.renderer = renderer,
        this.loop = loop,
        this.selectedObjects = [],
        this.raycaster = new Raycaster(),
        this.mousePos = new Vector2(),
        this.yOffset = 176;
        this.deleteButton = new DeleteButton(this.scene, this.loop, this.renderer, this.camera, this.yOffset),
        this.intersects = [],
        this.dragIcon
    }

    init () {
        const appContainer = document.querySelector(this.loop.appClassName);
        const drawFunction = this.drawOutlines.bind(this);
        const scanFunction = this.getIntersects.bind(this);
        var canvas = this.renderer;
        var mouse = this.mousePos;

        this.dragIcon = document.createElement("div");
        this.dragIcon.classList.add("prefab-drag-icon");
        this.dragIcon.style.visibility = "hidden";
        appContainer.appendChild(this.dragIcon);
        var dragNDrop = this.dragIcon;

        this.raycaster.layers.set(23);

        this.deleteButton.init();

        var dragIconOffset = this.yOffset;

        // event listener for mouse click
        this.renderer.domElement.addEventListener("click", function(event){
            var rect = canvas.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / (rect.right - rect.left)) * 2 - 1;
            mouse.y = - ((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;
            drawFunction();
        }, false);

        window.addEventListener("mousemove", function(event){
            var rect = canvas.domElement.getBoundingClientRect(); 
            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;
            dragNDrop.style.top = `${y+dragIconOffset}px`;
            dragNDrop.style.left = `${x+1}px`;

            mouse.x = ((event.clientX - rect.left) / (rect.right - rect.left)) * 2 - 1;
            mouse.y = - ((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;
            scanFunction();
        }, false);
    }

    getIntersects () {
        // update the picking ray with the camera and pointer position
        this.raycaster.setFromCamera(this.mousePos, this.camera);

        // calculate objects intersecting the picking ray
        this.intersects = this.raycaster.intersectObjects(this.selectedObjects, true);

        var highlightedObj = null;
        
        if (this.intersects.length > 0) {
            highlightedObj = this.intersects[0].object.parent;
            this.composer.highlightedObjects = [highlightedObj];
        }
        else this.composer.highlightedObjects = [];

        this.composer.highlightObject();
    }

    drawOutlines () {
        // update the picking ray with the camera and pointer position
        this.raycaster.setFromCamera(this.mousePos, this.camera);

        // calculate objects intersecting the picking ray
        this.intersects = this.raycaster.intersectObjects(this.selectedObjects, true);

        var clickedObj = null;
        
        if (this.intersects.length > 0) {
            clickedObj = this.intersects[0].object.parent;
            this.composer.selectedObjects = [clickedObj];
        }
        else this.composer.selectedObjects = [];

        // draw delete button
        if (clickedObj) {
            if (clickedObj.name == "Roof_Panel" || clickedObj.name == "Roof_Panel_LED" || clickedObj.name == "Inner") this.deleteButton.clickedObj = null;
            else this.deleteButton.clickedObj = clickedObj;
        }
        else {
            this.deleteButton.hide();
            this.deleteButton.clickedObj = null;
        }

        this.composer.setObject();
    }
}

export { Raycast };