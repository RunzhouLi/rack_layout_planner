import { Vector3 } from "three";


// add interactive POI's to scene as new DOM elements
function addAnnotations(id, content, position, renderer, camera, markerArray, pivot, loop, tooltipContent, controls, annotationContainer, videoContent) {
    var annotation = document.createElement("div");
    let text = document.createTextNode("" + content);
    var tooltip = document.createElement("div");
    var headerInfobox = document.querySelector("#headerInfobox");
    var videoContainer = document.createElement('video');

    // setup annotation DOM elements
    annotation.classList.add("annotation");
    tooltip.classList.add("annotation-tooltip");
    headerInfobox.classList.add("boxClosed");
    annotation.appendChild(tooltip);
    annotation.appendChild(text);
    annotation.pos = new Vector3(position.x, position.y, position.z);
    annotation.id = id;
    annotation.isActive = false;
    annotation.addEventListener("mouseover", mouseOver);
    annotation.addEventListener("mouseout", mouseOut);
    annotation.addEventListener("touchstart", touchStart);

    // each annotation gets its own positioning method that places it according to the model rotation
    annotation.setPosition = function() {
        var target = new Vector3();
        var posi = markerArray[this.id].getWorldPosition(target);
        var distancePOI = new Vector3(camera.position.x, camera.position.y, camera.position.z).distanceTo(new Vector3(posi.x, posi.y, posi.z));
        var distanceRef = new Vector3(camera.position.x, camera.position.y, camera.position.z).distanceTo(pivot);
        const vector = new Vector3(posi.x, posi.y, posi.z);
        const canvas = renderer.domElement;

        // calculates the position of the annotation and places it with CSS according to screen size
        vector.project(camera);
        vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
        vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));

        this.style.top = `${vector.y - 20}px`;
        this.style.left = `${vector.x - 20}px`;

        // adjust dom object opacity based on its distance to the camera
        if (distancePOI >= distanceRef) {
            if(!this.isActive)this.style.opacity = 0.2;
        }
        else {
            this.style.opacity = 1;
        }
    };
    annotation.setPosition();

    // sets the annotation text content
    annotation.setText = function(text) {
        let ttext = document.createTextNode(text);
        
        tooltip.appendChild(ttext);
    };

    annotation.setText(tooltipContent[id]);

    // sets the annotation loop function to work with main animation loop
    annotation.tick = function() {
        annotation.setPosition();
    };

    // add created annotation to a global annotation array and to an container in the DOM
    annotationContainer.appendChild(annotation);

    // show tooltip when hovering over annotation
    function mouseOver() {
        this.classList.add("active");
        this.children[0].classList.add("active");

        headerInfoUpdate();
        
        this.isActive = true;
        this.style.opacity = 1;
        controls.autoRotate = false;

        for (var i = 0; i < this.parentNode.children.length; i++) {
            if (this.parentNode.children[i] != this) {
                this.parentNode.insertBefore(this.parentNode.children[i], this);
            }
        }
    }

    // hide tooltip when not hovering over annotation
    function mouseOut() {
        this.classList.remove("active");
        this.children[0].classList.remove("active");
        headerInfobox.style.opacity = 0;
        this.isActive = false;
    }

    // mobile interaction with annotations
    function touchStart() {
        if (!this.isActive) {
            this.classList.add("active");
            this.children[0].classList.add("active");
            this.isActive = true;
            this.style.opacity = 1;
            controls.autoRotate = false;

            headerInfoUpdate();
        }
        else if (this.isActive) {
            this.classList.remove("active");
            this.children[0].classList.remove("active");
            this.isActive = false;
            headerInfobox.style.opacity = 0;
        }
    }

    const stringsToExclude = ["video_wide", "video_tall"];

    function headerInfoUpdate() {
        if (videoContent[id] && (!videoContent[id].includes("video_wide") && !videoContent[id].includes("video_tall"))) {
            headerInfobox.style.opacity = 1;
            headerInfobox.children[1].controls = "false";
            headerInfobox.children[1].classList.remove("hide");
            headerInfobox.children[1].src = videoContent[id]; // point to array here
            headerInfobox.children[1].loop = "true";
            headerInfobox.children[1].play();
            headerInfobox.children[0].innerHTML = "";
        }
        else {
            headerInfobox.children[0].classList.add("hide");
            headerInfobox.children[1].classList.add("hide");
        }
    }

    loop.updatables.push(annotation);
}

export { addAnnotations };