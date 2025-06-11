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

    // Support both single rack (legacy) and multiple rack groups (new)
    const rackGroups = configurator.rackGroups || [{ 
        doubleSided: configurator.doubleSided || false,
        depth: configurator.depth || 120,
        offsetX: 0, 
        offsetZ: 0, 
        units: configurator.units 
    }];
    
    // Ensure each group has default values
    rackGroups.forEach(group => {
        group.doubleSided = group.doubleSided !== undefined ? group.doubleSided : false;
        group.depth = group.depth || 120;
        group.offsetX = group.offsetX || 0;
        group.offsetZ = group.offsetZ || 0;
    });

    // get type of pr for measurements
    if (configurator.rackType == "PR4500") {
        standType = "Stand_";
        standWidth = 9;
    }
    else if (configurator.rackType == "PR9000") {
        standType = "Stand_";
        standWidth = 9;
    }    else {
        standType = "Stand_15000_";
        standWidth = 12.5;
    };

    // Calculate total width from all groups
    rackGroups.forEach(group => {
        for (let unitIndex = 0; (unitIndex < group.units.length && unitIndex < maxUnitsDisplayed); unitIndex++) {
            totalWidth += (group.units[unitIndex].width + standWidth) / 100;
        }
        totalWidth += (standWidth/100);
    });

    var measurement = totalWidth * 100;

    // delete all existing measurements
    if (measurementObjs.length > 0) {
        for (let index = 0; index < measurementObjs.length; index++) {
            const element = measurementObjs[index].domElement;
            element.remove();
        }
    }    measurementObjs = [];

    // Calculate each group's width and overall scene bounds
    let groupWidths = [];
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    
    rackGroups.forEach(group => {
        let groupWidth = 0;
        for (let unitIndex = 0; unitIndex < group.units.length; unitIndex++) {
            groupWidth += (group.units[unitIndex].width + standWidth) / 100;
        }
        groupWidth += (standWidth / 100);
        groupWidths.push(groupWidth);
        
        // Calculate scene bounds
        const groupMinX = (group.offsetX || 0) - groupWidth / 2;
        const groupMaxX = (group.offsetX || 0) + groupWidth / 2;
        const groupZ = (group.offsetZ || 0);
        
        minX = Math.min(minX, groupMinX);
        maxX = Math.max(maxX, groupMaxX);
        minZ = Math.min(minZ, groupZ);
        maxZ = Math.max(maxZ, groupZ);
    });

    // Add independent measurements for each rack group
    rackGroups.forEach((group, groupIndex) => {
        const groupWidth = groupWidths[groupIndex];
        const groupOffsetX = group.offsetX || 0;
        const groupOffsetZ = group.offsetZ || 0;
        
        // Group width measurement
        const widthMeasurement = groupWidth * 100;
        const groupCenterX = groupOffsetX;
        const widthText = new dynText(scene, widthMeasurement, 48, groupWidth, 0.01, 
            new Vector3(groupCenterX, 0.01, groupOffsetZ + (group.doubleSided ? (group.depth * 2 + 20) / 200 : group.depth / 200) + 0.8), 
            0, -MathUtils.degToRad(90), "#556879", 1, `组${groupIndex + 1}`, " cm", loop, 0);
        widthText.addText();
        measurementObjs.push(widthText);
        loop.updatables.push(widthText);
        
        // Group depth measurement
        let depthMeasurement, rackDepth, depthOffset;
        if (group.doubleSided) {
            depthMeasurement = group.depth * 2 + 20;
            rackDepth = (20 + group.depth * 2) / 100;
            depthOffset = (20 + group.depth) / 200;
        } else {
            depthMeasurement = group.depth;
            rackDepth = group.depth / 100;
            depthOffset = 0;
        }
        
        const depthText = new dynText(scene, depthMeasurement, 48, rackDepth, 0.01, 
            new Vector3(groupCenterX - groupWidth/2 - 0.8, 0.01, groupOffsetZ - depthOffset), 
            -MathUtils.degToRad(90), 0, "#556879", 1, `组${groupIndex + 1}`, " cm", loop, 0);
        depthText.addText();
        measurementObjs.push(depthText);
        loop.updatables.push(depthText);
        
        // Group height measurement
        const groupHeights = group.units.map(unit => unit.height);
        const maxHeight = Math.max(...groupHeights);
        const heightText = new dynText(scene, maxHeight, 48, maxHeight / 200 * 2, 0.01, 
            new Vector3(groupCenterX + groupWidth/2 + 0.8, maxHeight/200 + 0.02, groupOffsetZ), 
            0, 0, "#556879", 1, `组${groupIndex + 1}`, " cm", loop, 0);
        heightText.addText();
        measurementObjs.push(heightText);
        loop.updatables.push(heightText);
    });

    // Add overall scene measurements (smaller, secondary)
    measurement = totalWidth * 100;
    dynamicText = new dynText(scene, measurement, 36, totalWidth, 0.01, new Vector3((minX + maxX) / 2, 0.01, maxZ + 1.2 + 1.5), 0, -MathUtils.degToRad(90), "#8899AA", 1, "总宽", " cm", loop, 0);
    dynamicText.addText();
    measurementObjs.push(dynamicText);
    loop.updatables.push(dynamicText);

    // Overall height measurement  
    var heightArray = [];
    rackGroups.forEach(group => {
        for (let rackIndex = 0; rackIndex < group.units.length; rackIndex++) {
            heightArray.push(group.units[rackIndex].height);
        }
    });
    measurement = Math.max.apply(null, heightArray);

    dynamicText3 = new dynText(scene, measurement, 36, measurement / 200 * 2, 0.01, new Vector3(maxX + 1.5, measurement/200 + 0.02, (minZ + maxZ) / 2), 0, 0, "#8899AA", 1, "总高", " cm", loop, 0);
    dynamicText3.addText();
    measurementObjs.push(dynamicText3);
    loop.updatables.push(dynamicText3);

    // get outdoor material palette
    outdoorPalette = scene.getObjectByName("Outdoorpalette");

    // Process each rack group independently
    let globalWidthOffset = 0;
    rackGroups.forEach((group, groupIndex) => {
        const groupOffsetX = group.offsetX || 0;
        const groupOffsetZ = group.offsetZ || 0;
        const centerY = group.depth / 200;  // Use group-specific depth
        
        // configure stands for this group
        for (let standIndex = 0; standIndex < group.units.length; standIndex++) {
            const unit = group.units[standIndex];
            var centerX = totalWidth / 2;

            if (unit.height < 750 && standIndex == 0) {
                if (configurator.startPostIncrease === true) postHeightOffset = 50;
            } 
            else postHeightOffset = 0;

            // choose the units left stand model according to configuration
            if (standIndex == 0 || (group.units[standIndex-1] != null && unit.height > group.units[standIndex-1].height)) {
                stand = scene.getObjectByName(standType + (unit.height + postHeightOffset) + "_" + group.depth);  // Use group-specific depth
                addObject(stand, new Vector3(-centerX + globalWidthOffset + groupOffsetX, 0, groupOffsetZ), scene, clonedObjects);

                if (group.doubleSided) {  // Use group-specific doubleSided
                    var spacer = scene.getObjectByName("Spacer_20");
                    addObject(spacer, new Vector3(-centerX + globalWidthOffset + groupOffsetX, unit.height / 120, -centerY-0.1 + groupOffsetZ), scene);
                    addObject(spacer, new Vector3(-centerX + globalWidthOffset + groupOffsetX, unit.height / 200, -centerY-0.1 + groupOffsetZ), scene);
                    addObject(spacer, new Vector3(-centerX + globalWidthOffset + groupOffsetX, unit.height / 550, -centerY-0.1 + groupOffsetZ), scene);
                }
            }

            // configure rack protection left  
            protection = addRackProtection(unit.protectionLeft, scene, group);  // Pass group instead of configurator

            if (protection) addObject(protection, new Vector3(-centerX + globalWidthOffset + groupOffsetX, 0, centerY + groupOffsetZ), scene, clonedObjects);            // configure shelves for each rack unit
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
                    addObject(traverse, new Vector3(-centerX + globalWidthOffset + groupOffsetX + (standWidth/200), shelfYOffset, centerY - 0.03 + groupOffsetZ), scene, clonedObjects);
                    addObject(traverse, new Vector3(-centerX + globalWidthOffset + groupOffsetX + (standWidth/200), shelfYOffset, -centerY + 0.03 + groupOffsetZ), scene, clonedObjects, false, false, true);
                }

                // configure shelves
                switch (shelfUnit.deck) {
                    case "wood": shelf = scene.getObjectByName("Shelf_wood_" + unit.width + "_" + group.depth); break;
                    case "empty": shelf = null; break;
                    case "steel": shelf = scene.getObjectByName("Shelf_steel_" + unit.width + "_" + group.depth); break;
                    case "mantar": shelf = scene.getObjectByName("Shelf_mesh_" + unit.width + "_" + group.depth); break;
                    case "galvanized": shelf = scene.getObjectByName("Shelf_galvanized_" + unit.width + "_" + group.depth); break;
                    case "grid": shelf = scene.getObjectByName("Shelf_grid_" + unit.width + "_" + group.depth); break;
                    case "angle": shelf = scene.getObjectByName("Rack-support_" + unit.width + "_" + group.depth); break;
                    default: shelf = null; break;
                }
                
                if (shelf) addObject(shelf, new Vector3(-centerX + globalWidthOffset + groupOffsetX + (standWidth/200), shelfYOffset, groupOffsetZ), scene, clonedObjects);

                // configure shelf safety
                switch (shelfUnit.safe) {
                    case "panel": protector = scene.getObjectByName("Backwall_" + unit.width); break;
                    case "push": protector = scene.getObjectByName("Push-Protection_" + unit.width); break;
                    case "panelpush": protector = scene.getObjectByName("Push-Protection_" + unit.width); break;
                    default: protector = null; break;
                }

                if (protector) {
                    addObject(protector, new Vector3(-centerX + globalWidthOffset + groupOffsetX + (standWidth/200), shelfYOffset, -centerY + groupOffsetZ), scene);
                    if (shelfUnit.safe === "panelpush") addObject(scene.getObjectByName("Backwall_" + unit.width), new Vector3(-centerX + globalWidthOffset + groupOffsetX + (standWidth/200), shelfYOffset + 0.22, -centerY + groupOffsetZ), scene);
                }
            }

            // set distance between rack units
            globalWidthOffset += ((unit.width + standWidth) / 100);

            // configure increased endposts
            if (unit.height < 750 && standIndex == group.units.length-1) {
                if (configurator.endPostIncrease === true) postHeightOffset = 50;
            } 
            else postHeightOffset = 0;

            // rack unit right stand
            if ((group.units[standIndex + 1] != null && unit.height >= group.units[standIndex + 1].height) || standIndex == group.units.length - 1 && !configurator.addOnRack) {
                stand = scene.getObjectByName(standType + (unit.height + postHeightOffset) + "_" + group.depth);
                
                addObject(stand, new Vector3(-centerX + globalWidthOffset + groupOffsetX, 0, groupOffsetZ), scene, clonedObjects);

                if (group.doubleSided && !(standIndex == group.units.length - 1 && configurator.addOnRack)) {
                    var spacer = scene.getObjectByName("Spacer_20");
                    addObject(spacer, new Vector3(-centerX + globalWidthOffset + groupOffsetX, unit.height / 120, -centerY-0.1 + groupOffsetZ), scene);
                    addObject(spacer, new Vector3(-centerX + globalWidthOffset + groupOffsetX, unit.height / 200, -centerY-0.1 + groupOffsetZ), scene);
                    addObject(spacer, new Vector3(-centerX + globalWidthOffset + groupOffsetX, unit.height / 550, -centerY-0.1 + groupOffsetZ), scene);
                }
            }

            // rack unit right protection
            protection = addRackProtection(unit.protectionRight, scene, group);

            if (protection && standIndex == group.units.length - 1) addObject(protection, new Vector3(-centerX + globalWidthOffset + groupOffsetX, 0, centerY + groupOffsetZ), scene, clonedObjects, true);
        }          // Handle double-sided mirror logic for each group independently
        if (group.doubleSided) {
            const centerY = group.depth / 200;
            clonedObjects.forEach(function (object) {
                // Only mirror objects that belong to this group
                // Check if object is within this group's Z range (including front and back positions)
                const minZ = groupOffsetZ - centerY - 0.1;
                const maxZ = groupOffsetZ + centerY + 0.1;
                if (object.position.z >= minZ && object.position.z <= maxZ && !object.name.includes("Plank")) {
                    var objectCopy = object.clone();
                    objectCopy.applyMatrix4(new Matrix4().makeScale(1, 1, -1));
                    addObject(objectCopy, new Vector3(objectCopy.position.x, objectCopy.position.y, objectCopy.position.z - centerY*2 - 0.2), scene, clonedObjects);
                }
            });
        }
    });

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
function addRackProtection(modelName, scene, group) {
    var protection;

    switch (modelName) {
        case "shapeL-40": protection = scene.getObjectByName("Guard_L_40"); break;
        case "shapeL-80": protection = scene.getObjectByName("Guard_L_80"); break;
        case "shapeU-40": protection = scene.getObjectByName("Guard_U_40"); break;
        case "shapeU-80": protection = scene.getObjectByName("Guard_U_80"); break;
        case "plank-40": if (group.doubleSided) {
            protection = scene.getObjectByName("Guard_Plank_" + (group.depth * 2 + 33) + "_40"); 
        } 
        else {
            protection = scene.getObjectByName("Guard_Plank_" + (group.depth + 13) + "_40");
        } break;
        case "plank-80": if (group.doubleSided) {
            protection = scene.getObjectByName("Guard_Plank_" + (group.depth * 2 + 33) + "_80");
        }
        else {
            protection = scene.getObjectByName("Guard_Plank_" + (group.depth + 13) + "_80");
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