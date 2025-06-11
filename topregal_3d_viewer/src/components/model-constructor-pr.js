import { Matrix4, Vector3, MathUtils } from 'three';
import { dynText } from "../components/dynamic-text.js";
import { addGrid } from "../components/grid.js";
import { addFog } from "../components/fog.js";


var measurementObjs = [];

function constructPR(scene, configurator, clonedObjects, sceneObject, loop) {
    // setup parts
    var stand = null;
    var traverse = null;
    var shelf = null;
    var protector = null;
    var protection = null;
    var widthOffset = 0;
    var totalWidth = 0;
    var outdoorPalette;
    var maxUnitsDisplayed = 16; // define max. displayed rack columns here
    var postHeightOffset = 0;
    var dynamicText;
    var dynamicText2;
    var dynamicText3;
    var standType = "Stand_";
    var standWidth = 0;
    var fontSize = 58;


    // create scene fog
    addFog(sceneObject, 0xffffff, 24, 48);

    // get type of pr for measurements
    if (configurator.rackType == "PR4500") {
        standType = "Stand_";
        standWidth = 9;
    }
    else if (configurator.rackType == "PR9000") {
        standType = "Stand_";
        standWidth = 9;
    }
    else {
        standType = "Stand_15000_";
        standWidth = 12.5;
    };

    // calculate total rack width
    for (let unitIndex = 0; (unitIndex < configurator.units.length && unitIndex < maxUnitsDisplayed); unitIndex++) {
        totalWidth += (configurator.units[unitIndex].width + standWidth) / 100;
    }

    totalWidth += (standWidth/100);

    var measurement = totalWidth * 100;

    // delete all existing measurements
    if (measurementObjs.length > 0) {
        for (let index = 0; index < measurementObjs.length; index++) {
            const element = measurementObjs[index].domElement;
            element.remove();
        }
    }

    measurementObjs = [];

    // add dynamic text for width
    dynamicText = new dynText(scene, measurement, fontSize, totalWidth, 0.01, new Vector3(0-(standWidth/200), 0.01, (configurator.depth / 200) + 0.8), 0, -MathUtils.degToRad(90), "#556879", 1, null, " cm", loop, 0);
    dynamicText.addText();
    measurementObjs.push(dynamicText);

    loop.updatables.push(dynamicText);

    var rackDepth;
    var depthOffset;

    if (configurator.doubleSided) {
        measurement = (configurator.depth) * 2 + 20;
        rackDepth = (20 + configurator.depth * 2) / 100;
        depthOffset = (20 + configurator.depth) / 200;
    }
    else {
        measurement = configurator.depth;
        rackDepth = configurator.depth / 100;
        depthOffset = 0;
    }
    
    // add dynamic text for depth
    dynamicText2 = new dynText(scene, measurement, fontSize, rackDepth, 0.01, new Vector3(-totalWidth / 2 -0.8, 0.01, 0 - depthOffset), -MathUtils.degToRad(90), 0, "#556879", 1, null, " cm", loop, 0);
    dynamicText2.addText();
    measurementObjs.push(dynamicText2);

    loop.updatables.push(dynamicText2);


    var increaseOffset = 0;
    var heightArray = [];

    for (let rackIndex = 0; rackIndex < configurator.units.length; rackIndex++) {
        if ((configurator.startPostIncrease && rackIndex == 0) || (configurator.endPostIncrease && rackIndex == configurator.units.length-1 && !configurator.addOnRack)) {
            increaseOffset = 50;
        }
        else increaseOffset = 0;

        heightArray.push(configurator.units[rackIndex].height + increaseOffset);
    }

    measurement = Math.max.apply(null, heightArray);

    // add dynamic text for height
    dynamicText3 = new dynText(scene, measurement, fontSize, measurement / 200 * 2, 0.01, new Vector3(totalWidth / 2 + 0.8, measurement/200 + 0.02, configurator.depth / 200), 0, 0, "#556879", 1, null, " cm", loop, 0);
    dynamicText3.addText();
    measurementObjs.push(dynamicText3);

    loop.updatables.push(dynamicText3);

    // get outdoor material palette
    outdoorPalette = scene.getObjectByName("Outdoorpalette");

    // configure stands
    for (let standIndex = 0; standIndex < configurator.units.length; standIndex++) {
        const unit = configurator.units[standIndex];
        var centerX = totalWidth / 2;
        var centerY = configurator.depth / 200;

        if (unit.height < 750 && standIndex == 0) {
            if (configurator.startPostIncrease === true) postHeightOffset = 50;
        } 
        else postHeightOffset = 0;

        // choose the units left stand model according to configuration
        if (standIndex == 0 || (configurator.units[standIndex-1] != null && unit.height > configurator.units[standIndex-1].height)) {
            stand = scene.getObjectByName(standType + (unit.height + postHeightOffset) + "_" + configurator.depth);
            addObject(stand, new Vector3(-centerX + widthOffset, 0, 0), scene, clonedObjects);

            if (configurator.doubleSided) {
                var spacer = scene.getObjectByName("Spacer_20");
                //stand = scene.getObjectByName(standType + (unit.height + postHeightOffset) + "_" + configurator.depth);
                addObject(spacer, new Vector3(-centerX + widthOffset, unit.height / 120, -centerY-0.1), scene);
                addObject(spacer, new Vector3(-centerX + widthOffset, unit.height / 200, -centerY-0.1), scene);
                addObject(spacer, new Vector3(-centerX + widthOffset, unit.height / 550, -centerY-0.1), scene);
            }
        }

        // configure rack protection left
        protection = addRackProtection(unit.protectionLeft, scene, configurator);

        if (protection) addObject(protection, new Vector3(-centerX + widthOffset, 0, centerY), scene, clonedObjects);

        // configure shelves for each rack unit
        for (let shelfIndex = 0; shelfIndex < unit.shelves.length; shelfIndex++) {
            var shelfYOffset = (unit.height / (unit.shelves.length + 1) / 100) * (unit.shelves.length - shelfIndex);
            var shelfUnit = unit.shelves[shelfIndex];

            // configure traverses
            switch (configurator.rackType) {
                case "PR4500": traverse = scene.getObjectByName("Traverse_pr4500_" + unit.width); break;
                case "PR9000": traverse = scene.getObjectByName("Traverse_pr9000_" + unit.width); break;
                case "PR15000": traverse = scene.getObjectByName("Traverse_pr15000_" + unit.width); break;
                default: traverse = scene.getObjectByName("Traverse_pr9000_" + unit.width); break;
            }
            
            if (traverse) {
                addObject(traverse, new Vector3(-centerX + widthOffset + (standWidth/200), shelfYOffset, centerY - 0.03), scene, clonedObjects);
                addObject(traverse, new Vector3(-centerX + widthOffset + (standWidth/200), shelfYOffset, -centerY + 0.03), scene, clonedObjects, false, false, true);
            }

            // configure shelves
            switch (shelfUnit.deck) {
                case "wood": shelf = scene.getObjectByName("Shelf_wood_" + unit.width + "_" + configurator.depth); break;
                case "empty": shelf = null; break;
                case "steel": shelf = scene.getObjectByName("Shelf_steel_" + unit.width + "_" + configurator.depth); break;
                case "mantar": shelf = scene.getObjectByName("Shelf_mesh_" + unit.width + "_" + configurator.depth); break;
                case "galvanized": shelf = scene.getObjectByName("Shelf_galvanized_" + unit.width + "_" + configurator.depth); break;
                case "grid": shelf = scene.getObjectByName("Shelf_grid_" + unit.width + "_" + configurator.depth); break;
                case "angle": shelf = scene.getObjectByName("Rack-support_" + unit.width + "_" + configurator.depth); break;
                default: shelf = null; break;
            }

            if (shelf) addObject(shelf, new Vector3(-centerX + widthOffset + (standWidth/200), shelfYOffset, 0), scene, clonedObjects);

            // configure shelf safety
            switch (shelfUnit.safe) {
                case "panel": protector = scene.getObjectByName("Backwall_" + unit.width); break;
                case "push": protector = scene.getObjectByName("Push-Protection_" + unit.width); break;
                case "panelpush": protector = scene.getObjectByName("Push-Protection_" + unit.width); break;
                default: protector = null; break;
            }

            if (protector) {
                addObject(protector, new Vector3(-centerX + widthOffset + (standWidth/200), shelfYOffset, -centerY ), scene);

                if (shelfUnit.safe === "panelpush") addObject(scene.getObjectByName("Backwall_" + unit.width), new Vector3(-centerX + widthOffset + (standWidth/200), shelfYOffset + 0.22, -centerY), scene);
            }
        }

        // set distance between rack units
        widthOffset += ((unit.width + standWidth) / 100);

        // configure increased endposts
        if (unit.height < 750 && standIndex == configurator.units.length-1) {
            if (configurator.endPostIncrease === true) postHeightOffset = 50;
        } 
        else postHeightOffset = 0;

        // rack unit right stand
        if ((configurator.units[standIndex + 1] != null && unit.height >= configurator.units[standIndex + 1].height) || standIndex == configurator.units.length - 1 && !configurator.addOnRack) {
            stand = scene.getObjectByName(standType + (unit.height + postHeightOffset) + "_" + configurator.depth);
            
            addObject(stand, new Vector3(-centerX + widthOffset, 0, 0), scene, clonedObjects);

            if (configurator.doubleSided && !(standIndex == configurator.units.length - 1 && configurator.addOnRack)) {
                var spacer = scene.getObjectByName("Spacer_20");
                addObject(spacer, new Vector3(-centerX + widthOffset, unit.height / 120, -centerY-0.1), scene);
                addObject(spacer, new Vector3(-centerX + widthOffset, unit.height / 200, -centerY-0.1), scene);
                addObject(spacer, new Vector3(-centerX + widthOffset, unit.height / 550, -centerY-0.1), scene);
            }
        }

        // rack unit right protection
        protection = addRackProtection(unit.protectionRight, scene, configurator);

        if (protection && standIndex == configurator.units.length - 1) addObject(protection, new Vector3(-centerX + widthOffset, 0, centerY), scene, clonedObjects, true);
    }

    // check if double sided and make a mirrored rack
    if (configurator.doubleSided) {
        clonedObjects.forEach(function (object) {
            if (!object.name.includes("Plank")) {
                var objectCopy = object.clone();

                objectCopy.applyMatrix4(new Matrix4().makeScale(1, 1, -1));
                addObject(objectCopy, new Vector3(objectCopy.position.x, objectCopy.position.y, objectCopy.position.z - centerY*2 - 0.2), scene, clonedObjects);
            }
        });
    }

    // change materials of rack composition if galvanized
    if (configurator.outdoorUse) {
        clonedObjects.forEach(function (object) {
            if (object) changeMaterial(configurator, object, outdoorPalette);
        });
    }
}

// change model material
function changeMaterial(configurator, object, outdoorPalette) {
    if (configurator.outdoorUse) {
        object.traverse(function (item) {
            if (item.name.includes("Traverse") && item.material) {
                if (item.name.includes("Traverse_1000") ) item.material = outdoorPalette.children[3].material;
                else if (item.name.includes("Traverse_2200") || item.name.includes("Traverse_4000") || item.name.includes("Traverse_4500")) item.material = outdoorPalette.children[5].material;
                else item.material = outdoorPalette.children[4].material;
            }
            else if (item.name.includes("Staender") && !item.name.includes("Strebe") &&item.material) item.material = outdoorPalette.children[0].material;
            else if (item.name.includes("Strebe")); // dont change material
        });
    }
}

// choose right model for rack protection
function addRackProtection(modelName, scene, configurator) {
    var protection;

    switch (modelName) {
        case "shapeL-40": protection = scene.getObjectByName("Guard_L_40"); break;
        case "shapeL-80": protection = scene.getObjectByName("Guard_L_80"); break;
        case "shapeU-40": protection = scene.getObjectByName("Guard_U_40"); break;
        case "shapeU-80": protection = scene.getObjectByName("Guard_U_80"); break;
        case "plank-40": if (configurator.doubleSided) {
            protection = scene.getObjectByName("Guard_Plank_" + (configurator.depth * 2 + 33) + "_40"); 
        } 
        else {
            protection = scene.getObjectByName("Guard_Plank_" + (configurator.depth + 13) + "_40");
        } break;
        case "plank-80": if (configurator.doubleSided) {
            protection = scene.getObjectByName("Guard_Plank_" + (configurator.depth * 2 + 33) + "_80");
        }
        else {
            protection = scene.getObjectByName("Guard_Plank_" + (configurator.depth + 13) + "_80");
        } break;
        case "empty": null; break;
        default: protection = null; break;
    }

    return protection;
}

// add a model to the scene
function addObject(object, position, scene, objArray, flipX, flipY, flipZ) {
    var objectCopy = object.clone();

    objectCopy.traverse(function (item) {
        if (!item.visible) item.visible = true;
        item.castShadow = true;
    });

    if (flipX) objectCopy.applyMatrix4(new Matrix4().makeScale(-1, 1, 1));
    if (flipY) objectCopy.applyMatrix4(new Matrix4().makeScale(1, -1, 1));
    if (flipZ) objectCopy.applyMatrix4(new Matrix4().makeScale(1, 1, -1));

    objectCopy.position.set(position.x, position.y, position.z);

    scene.getObjectByName("Scene").add(objectCopy);

    if (objArray) objArray.push(objectCopy);
}

export { constructPR };