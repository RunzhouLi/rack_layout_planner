import { Matrix4, Vector3, MathUtils } from 'three';
import { dynText } from "../components/dynamic-text.js";
import { addGrid } from "../components/grid.js";
import { addFog } from "../components/fog.js";


var measurementObjs = [];

function constructMFW(scene, configurator, clonedObjects, sceneObject, loop) {
    // setup parts
    var stand;
    var traverse;
    var backwall;
    var foot;
    var shelf;
    var tools;
    var modules = [];
    var heightOffset;
    var widthOffset = 0;
    var centerX = configurator.width/200;
    var centerY = configurator.depth/200;
    var centerZ = 0.26;
    var dynamicText;
    var dynamicText2;
    var dynamicText3;
    var dynamicText4;
    var yOffset = 0;

    
    // create scene fog
    addFog(sceneObject, 0xffffff, 12, 24);

    // delete all existing measurements
    if (measurementObjs.length > 0) {
        for (let index = 0; index < measurementObjs.length; index++) {
            const element = measurementObjs[index].domElement;
            element.remove();
        }
    }

    measurementObjs = [];

    // add dynamic text
    var measurement = configurator.width * 10 + 100;
    dynamicText = new dynText(scene, measurement, 26, configurator.width/100, 0.005, new Vector3(0, 0.01, centerY + 0.4), 0, -MathUtils.degToRad(90), "#556879", 1, null, " mm", loop, yOffset);
    dynamicText.addText();
    measurementObjs.push(dynamicText);

    loop.updatables.push(dynamicText);

    measurement = configurator.depth * 10;
    dynamicText2 = new dynText(scene, measurement, 26, configurator.depth/100, 0.005, new Vector3(-centerX - 0.4, 0.01, 0), -MathUtils.degToRad(90), 0, "#556879", 1, null, " mm", loop, yOffset);
    dynamicText2.addText();
    measurementObjs.push(dynamicText2);

    loop.updatables.push(dynamicText2);

    var maxHeight;

    if (configurator.mobile) {
        centerZ = 0.88/2;
        measurement = 890;
        maxHeight = 1290;
    }
    else {
        centerZ = 0.74/2;
        measurement = 750;
        maxHeight = 1150;
    }

    dynamicText3 = new dynText(scene, measurement, 26, centerZ * 2, 0.005, new Vector3(centerX + 0.4, centerZ + 0.01, centerY), 0, 0, "#556879", 1, maxHeight + " mm", " mm", loop, yOffset);
    dynamicText3.addText();
    measurementObjs.push(dynamicText3);

    loop.updatables.push(dynamicText3);

    if (configurator.frontPanel) {
        dynamicText4 = new dynText(scene, 500, 26, 0.5, 0.005, new Vector3(centerX + 0.4, centerZ*2 + 0.255, centerY), 0, 0, "#556879", 1, null, " mm", loop, yOffset);
        dynamicText4.addText();
        measurementObjs.push(dynamicText4);

        loop.updatables.push(dynamicText4);
    }

    modules.length = configurator.slots.length;

    if (configurator.depth == 60 && !configurator.frontPanel) {
        stand = scene.getObjectByName("Stand_750_600");
    }
    else if (configurator.depth == 60 && configurator.frontPanel) {
        stand = scene.getObjectByName("Stand_750_600_Backwall");
    }
    else if (configurator.depth == 80 && !configurator.frontPanel) {
        stand = scene.getObjectByName("Stand_750_800");
    }
    else if (configurator.depth == 80 && configurator.frontPanel) {
        stand = scene.getObjectByName("Stand_750_800_Backwall");
    }

    if (configurator.width == 110) {
        traverse = scene.getObjectByName("Traverse_1100");
        backwall = scene.getObjectByName("Backwall_1100");
        
        if (configurator.depth == 60) {
            switch (configurator.topLayer) {
                case "grid": shelf = scene.getObjectByName("Shelf1_1100_600"); break;
                case "wood": shelf = scene.getObjectByName("Shelf2_1100_600"); break;
                case "multiplex": shelf = scene.getObjectByName("Shelf3_1100_600"); break;
                case "empty": shelf = null; break;
                case "steel": shelf = scene.getObjectByName("Shelf5_1100_600"); break;
            }
        }
        else {
            switch (configurator.topLayer) {
                case "grid": shelf = scene.getObjectByName("Shelf1_1100_800"); break;
                case "wood": shelf = scene.getObjectByName("Shelf2_1100_800"); break;
                case "multiplex": shelf = scene.getObjectByName("Shelf3_1100_800"); break;
                case "empty": shelf = null; break;
                case "steel": shelf = scene.getObjectByName("Shelf5_1100_800"); break;
            }
        }

        if (configurator.toolHolders) {
            switch (configurator.toolHolders) {
                case "false": tools = null; break;
                case "base": tools = scene.getObjectByName("Tools_basic_1100"); break;
                case "expanded": tools = scene.getObjectByName("Tools_expanded_1100"); break;
                case "profi": tools = scene.getObjectByName("Tools_profi_1100"); break;
            }

        }
    }
    else if (configurator.width == 220) {
        traverse = scene.getObjectByName("Traverse_2200");
        backwall = scene.getObjectByName("Backwall_2200");

        if (configurator.depth == 60) {
            switch (configurator.topLayer) {
                case "grid": shelf = scene.getObjectByName("Shelf1_2200_600"); break;
                case "wood": shelf = scene.getObjectByName("Shelf2_2200_600"); break;
                case "multiplex": shelf = scene.getObjectByName("Shelf3_2200_600"); break;
                case "empty": shelf = null; break;
                case "steel": shelf = scene.getObjectByName("Shelf5_2200_600"); break;
            }
        }
        else {
            switch (configurator.topLayer) {
                case "grid": shelf = scene.getObjectByName("Shelf1_2200_800"); break;
                case "wood": shelf = scene.getObjectByName("Shelf2_2200_800"); break;
                case "multiplex": shelf = scene.getObjectByName("Shelf3_2200_800"); break;
                case "empty": shelf = null; break;
                case "steel": shelf = scene.getObjectByName("Shelf5_2200_800"); break;
            }
        }

        if (configurator.toolHolders) {
            switch (configurator.toolHolders) {
                case "false": tools = null; break;
                case "base": tools = scene.getObjectByName("Tools_basic_2200"); break;
                case "expanded": tools = scene.getObjectByName("Tools_expanded_2200"); break;
                case "profi": tools = scene.getObjectByName("Tools_profi_2200"); break;
            }

        }
    }

    if (!configurator.mobile) {
        foot = scene.getObjectByName("Foot");
        heightOffset = 0;
    }
    else {
        foot = scene.getObjectByName("Wheel");
        heightOffset = 0.13;
    }

    for (let index = 0; index < configurator.slots.length; index++) {
        const element = configurator.slots[index];
        
        if (configurator.depth == 60) {
            switch (element) {
                case "ws_4": modules[index] = scene.getObjectByName("Module2_600"); break;
                case "wst": modules[index] = scene.getObjectByName("Module1_600"); break;
                case "ws4_2": modules[index] = scene.getObjectByName("Module2_600_double"); break;
                case "wst_2": modules[index] = scene.getObjectByName("Module1_600_double"); break;
                case "grid": modules[index] = scene.getObjectByName("Shelf1_1100_600"); break;
                case "wood": modules[index] = scene.getObjectByName("Shelf2_550_600"); break;
                case "multiplex": modules[index] = scene.getObjectByName("Shelf3_1100_600"); break;
                case "empty": modules[index] = null; break;
                case "steel": modules[index] = scene.getObjectByName("Shelf5_1100_600"); break;
            }
        }
        else if (configurator.depth == 80) {
            switch (element) {
                case "ws_4": modules[index] = scene.getObjectByName("Module2_800"); break;
                case "wst": modules[index] = scene.getObjectByName("Module1_800"); break;
                case "ws4_2": modules[index] = scene.getObjectByName("Module2_800_double"); break;
                case "wst_2": modules[index] = scene.getObjectByName("Module1_800_double"); break;
                case "grid": modules[index] = scene.getObjectByName("Shelf1_1100_800"); break;
                case "wood": modules[index] = scene.getObjectByName("Shelf2_550_800"); break;
                case "multiplex": modules[index] = scene.getObjectByName("Shelf3_1100_800"); break;
                case "empty": modules[index] = null; break;
                case "steel": modules[index] = scene.getObjectByName("Shelf5_550_800"); break;
            }
        }
    }

    // stand setup
    if (stand) {
        addObject(stand, new Vector3(-centerX, 0 + heightOffset, 0), scene, false, clonedObjects);
        addObject(stand, new Vector3(centerX + 0.06, 0 + heightOffset, 0), scene, false, clonedObjects);
    }

    // traverse setup
    if (stand) {
        addObject(traverse, new Vector3(-centerX, 0 + heightOffset, centerY), scene, false, clonedObjects);
        addObject(traverse, new Vector3(-centerX, 0.6 + heightOffset, centerY), scene, false, clonedObjects);
        addObject(traverse, new Vector3(-centerX, 0 + heightOffset, -centerY), scene, true, clonedObjects);
        addObject(traverse, new Vector3(-centerX, 0.6 + heightOffset, -centerY), scene, true, clonedObjects);
    }

    // backwall setup
    if (configurator.frontPanel && backwall) {
        addObject(backwall, new Vector3(-centerX + 0.03, 1.2 + heightOffset, -centerY), scene, false, clonedObjects);
        if (tools) addObject(tools, new Vector3(-centerX + 0.03, 1.2 + heightOffset, -centerY + 0.04), scene, false, clonedObjects);
    }

    // foot setup
    if (foot) {
        addObject(foot, new Vector3(-centerX, 0 + heightOffset, centerY - 0.02), scene, false, clonedObjects);
        addObject(foot, new Vector3(centerX + 0.06, 0 + heightOffset, centerY - 0.02), scene, false, clonedObjects);
        addObject(foot, new Vector3(-centerX, 0 + heightOffset, -centerY + 0.02), scene, false, clonedObjects);
        addObject(foot, new Vector3(centerX + 0.06, 0 + heightOffset, -centerY + 0.02), scene, false, clonedObjects);
    }

    // shelf setup
    if (shelf) {
        addObject(shelf, new Vector3(-centerX, 0.725 + heightOffset, 0), scene, false, clonedObjects);
    }
    
    // module setup
    for (let index = 0; index < modules.length; index++) {
        if (modules[index]) addObject(modules[index], new Vector3(-centerX + widthOffset, 0.12 + heightOffset, 0), scene, false, clonedObjects);

        if (configurator.slots[index] == "ws_4" || configurator.slots[index] == "empty" || configurator.slots[index] == "wst" || configurator.slots[index] == "wood" || (configurator.slots[index] == "steel" && configurator.depth == 80)) widthOffset += 0.546;
        else widthOffset += 1.092;
    }
}

// add a model to the scene
function addObject(object, position, scene, flipZ, objArray) {
    var objectCopy = object.clone();

    if (objArray) objArray.push(objectCopy);

    objectCopy.traverse(function (item) {
        if (!item.visible) item.visible = true;
        item.castShadow = true;
    });

    if (flipZ) objectCopy.applyMatrix4(new Matrix4().makeScale(1, 1, -1));

    objectCopy.position.set(position.x, position.y, position.z);

    scene.add(objectCopy);
}

export { constructMFW };