import { MeshBasicMaterial, Texture, Mesh, Vector3, CylinderGeometry } from 'three';


class dynText {
    constructor(scene, sizeValue, fontSize, objWidth, lineThickness, position, rotationX, rotationZ, textColor, textScale, additionalText, measureUnit, loop, offset) {
        this.scene = scene,
        this.sizeValue = sizeValue,
        this.fontSize = fontSize,
        this.objWidth = objWidth,
        this.lineThickness = lineThickness,
        this.position = position,
        this.rotationX = rotationX,
        this.rotationZ = rotationZ,
        this.textColor = textColor,
        this.meshText = null,
        this.counter = 0,
        this.canvas = null,
        this.textWidth = 0,
        this.textHeight = 0,
        this.measureLine = null,
        this.textScale = textScale,
        this.additionalText = additionalText,
        this.measureUnit = measureUnit,
        this.domElement = null,
        this.loop = loop,
        this.offset = offset
    }

    // add mesh in scene that holds dynamic text
    addText() {
        var texture = new Texture(this.canvas);
        texture.needsUpdate = true;
    
        var material = new MeshBasicMaterial({
            color: this.textColor,
            reflectivity: 0,
            toneMapped: false,
        });
    
        // create 3d objects as cylinders for measure lines
        var meshLine = new Mesh(new CylinderGeometry(this.lineThickness, this.lineThickness, this.objWidth), material);
        var meshLineLeft = new Mesh(new CylinderGeometry(this.lineThickness, this.lineThickness, 0.1), material);
        var meshLineRight = new Mesh(new CylinderGeometry(this.lineThickness, this.lineThickness, 0.1), material);
        var rotateEnds = (90 * Math.PI) / 180.0;
    
        this.transformObject(meshLine, this.position, this.rotationX, this.rotationZ);
        this.transformObject(meshLineLeft, new Vector3(0, -this.objWidth/2, 0), this.rotationX + rotateEnds, this.rotationZ + rotateEnds);
        this.transformObject(meshLineRight, new Vector3(0, this.objWidth/2, 0), this.rotationX + rotateEnds, this.rotationZ + rotateEnds);

        meshLine.scale.y = 0;
    
        meshLine.add(meshLineLeft);
        meshLine.add(meshLineRight);

        this.measureLine = meshLine;

        this.scene.add(this.measureLine);

        // create dom element for measurement text
        this.domElement = document.createElement("div");
        this.domElement.classList.add("measurement-text");
        this.domElement.innerText = Math.round(this.sizeValue * 10) / 10 + this.measureUnit;
        this.domElement.innerText = this.convertNumber(this.domElement.innerText);
        this.domElement.style.backgroundColor =  this.textColor;

        var loopObj = this.loop;
        var measurePos = new Vector3(this.position.x, this.position.y, this.position.z);
        var yOffset = this.offset;

        this.domElement.setPosition = function() {
            var posi = measurePos;
            const vector = new Vector3(posi.x, posi.y, posi.z);
            const canvas = loopObj.renderer.domElement;
            var distancePOI = new Vector3(loopObj.camera.position.x, loopObj.camera.position.y, loopObj.camera.position.z).distanceTo(new Vector3(posi.x, posi.y, posi.z+2));
            var distanceRef = new Vector3(loopObj.camera.position.x, loopObj.camera.position.y, loopObj.camera.position.z).distanceTo(new Vector3(0,0,0));
    
            // calculates the position of the annotation and places it with CSS according to screen size
            vector.project(loopObj.camera);

            vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
            vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));

            this.style.top = `${vector.y+yOffset}px`;
            this.style.left = `${vector.x-(this.clientWidth/2)}px`;

            // adjust dom object opacity based on its distance to the camera
            if (distancePOI >= distanceRef) {
                this.style.opacity = 0;
            }
            else {
                this.style.opacity = 1;
            }
        }

        var appContainer = document.querySelector(this.loop.appClassName);
        appContainer.appendChild(this.domElement);
    }
    
    // set object position and rotation
    transformObject(obj, targetPos, rotX, rotZ) {
        obj.rotation.set(rotX, 0, rotZ);
        
        if (targetPos) {
            obj.position.x = targetPos.x;
            obj.position.y = targetPos.y;
            obj.position.z = targetPos.z;
        }
    }

    // function for main animation loop that renders each frame
    tick() {
        if (this.measureLine.scale.y < 1) {
            // animate measure lines
            this.easeOutSine(this.measureLine.scale.y += 0.025);
        }
        else this.measureLine.scale.y = 1;

        this.domElement.setPosition();
    }

    easeOutSine(x) {
        return Math.sin((x * Math.PI) / 2);
    }

    convertNumber(n) {
        'use strict';
        n = n.replace('.',',');
        return n;
    }
}

export { dynText };