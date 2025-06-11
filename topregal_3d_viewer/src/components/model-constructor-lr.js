import { Matrix4, Vector3, MathUtils, Group } from 'three';
import { dynText } from "./dynamic-text.js";
import { addGrid } from "./grid.js";
import { addFog } from "./fog.js";


var measurementObjs = [];

function constructLR(scene, configurator, clonedObjects, sceneObject, loop) {
    // setup parts
    var stand = null;
    var traverse = null;
    var kanban = null;
    var shelf = null;
    var widthOffset = 0;
    var totalWidth = 0;
    var standWidth = 6;
    var postHeightOffset = 0;
    var dynamicText;
    var dynamicText2;
    var dynamicText3;
    var yOffset = 0;

    
    // create scene fog
    addFog(sceneObject, 0xffffff, 24, 48);

    // delete all existing measurements
    if (measurementObjs.length > 0) {
        for (let index = 0; index < measurementObjs.length; index++) {
            const element = measurementObjs[index].domElement;
            element.remove();
        }
    }

    measurementObjs = [];    // Support both single rack (legacy) and multiple rack groups (new)
    const rackGroups = configurator.rackGroups || [{ 
        doubleSided: configurator.doubleSided || false,
        depth: configurator.depth || 120,
        offsetX: 0, 
        offsetZ: 0, 
        units: configurator.units 
    }];
    
    // Calculate each group's width and overall scene bounds
    let groupWidths = [];
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    rackGroups.forEach(group => {
        // Ensure each group has default values
        group.doubleSided = group.doubleSided !== undefined ? group.doubleSided : false;
        group.depth = group.depth || 120;
        group.offsetX = group.offsetX || 0;
        group.offsetZ = group.offsetZ || 0;
        
        let groupWidth = 0;
        for (let unitIndex = 0; unitIndex < group.units.length; unitIndex++) {
            groupWidth += (group.units[unitIndex].width + standWidth) / 100;
        }
        groupWidth += (standWidth / 100);        groupWidths.push(groupWidth);
        
        // Calculate scene bounds
        const groupMinX = (group.offsetX || 0) - groupWidth / 2;
        const groupMaxX = (group.offsetX || 0) + groupWidth / 2;
        const groupZ = (group.offsetZ || 0);
        
        minX = Math.min(minX, groupMinX);
        maxX = Math.max(maxX, groupMaxX);
        minZ = Math.min(minZ, groupZ);
        maxZ = Math.max(maxZ, groupZ);
    });

    // Calculate total scene width for measurements
    totalWidth = maxX - minX;    var measurement = totalWidth * 100 + 6;
    
    dynamicText = new dynText(scene, measurement, 58, totalWidth, 0.01, new Vector3((minX + maxX) / 2, 0.01, maxZ + 1.2 + 0.8), 0, -MathUtils.degToRad(90), "#556879", 1, null, " cm", loop, yOffset);
    dynamicText.addText();
    measurementObjs.push(dynamicText);

    loop.updatables.push(dynamicText);

    // Add depth measurements for each group with different depths
    let depthMeasurements = new Map();
    rackGroups.forEach(group => {
        const depth = group.depth;
        const doubleSided = group.doubleSided;
        const key = `${depth}_${doubleSided}`;
        
        if (!depthMeasurements.has(key)) {
            let measurement, rackDepth, depthOffset;
            
            if (doubleSided) {
                measurement = depth * 2 + 20;
                rackDepth = (20 + depth * 2) / 100;
                depthOffset = (20 + depth) / 200;
            } else {
                measurement = depth;
                rackDepth = depth / 100;
                depthOffset = 0;
            }
            
            const dynamicText2 = new dynText(scene, measurement, 58, rackDepth, 0.01, new Vector3(minX - 0.8, 0.01, (group.offsetZ || 0) - depthOffset), -MathUtils.degToRad(90), 0, "#556879", 1, null, " cm", loop, yOffset);
            dynamicText2.addText();
            measurementObjs.push(dynamicText2);
            loop.updatables.push(dynamicText2);
            
            depthMeasurements.set(key, true);
        }
    });

    // add text for height measurement
    var heightArray = [];

    rackGroups.forEach(group => {
        for (let rackIndex = 0; rackIndex < group.units.length; rackIndex++) {
            heightArray.push(group.units[rackIndex].height);
        }
    });    measurement = Math.max.apply(null, heightArray);

    dynamicText3 = new dynText(scene, measurement, 58, measurement / 200 * 2, 0.01, new Vector3(maxX + 0.8, measurement/200 + 0.02, (minZ + maxZ) / 2), 0, 0, "#556879", 1, null, " cm", loop, yOffset);
    dynamicText3.addText();
    measurementObjs.push(dynamicText3);

    loop.updatables.push(dynamicText3);    // Position each rack group absolutely and build components
    rackGroups.forEach((group, i) => {
        const groupOffsetX = group.offsetX || 0;
        const groupOffsetZ = group.offsetZ || 0;
        const groupWidth = groupWidths[i];
        const centerXGroup = groupWidth / 2;
        const centerY = group.depth / 200;  // Use group-specific depth
        let groupWidthOffset = 0;

        group.units.forEach((unit, standIndex) => {
            const xPos = -centerXGroup + groupOffsetX + groupWidthOffset;

            // left stand
            stand = scene.getObjectByName(`Stand_${unit.height}_${group.depth}`);  // Use group-specific depth
            addObject(stand, new Vector3(xPos, 0, groupOffsetZ), scene, clonedObjects);
            if (group.doubleSided) {  // Use group-specific doubleSided
                const spacer = scene.getObjectByName("Spacer_20");
                addObject(spacer, new Vector3(xPos, unit.height/120, -centerY - 0.1 + groupOffsetZ), scene);
                addObject(spacer, new Vector3(xPos, unit.height/200, -centerY - 0.1 + groupOffsetZ), scene);
                addObject(spacer, new Vector3(xPos, unit.height/550, -centerY - 0.1 + groupOffsetZ), scene);
            }

            // shelves and traverses
            for (let shelfIndex = 0; shelfIndex < unit.shelves.length; shelfIndex++) {
                const shelfUnit = unit.shelves[shelfIndex];
                const shelfYOffset = (unit.height / (unit.shelves.length + 1) / 100) * (unit.shelves.length - shelfIndex);
                const traverse = scene.getObjectByName(`Traverse_${unit.width}_angular`);
                const kanban = scene.getObjectByName(`Traverse_${unit.width}_round`);
                let traverseOffset = 0;

                if (traverse) {
                    if (shelfUnit.deck === 'inclined') {
                        traverseOffset = group.depth === 60 ? 0.2 : 0.27;  // Use group-specific depth
                        addObject(kanban, new Vector3(xPos, shelfYOffset + 0.15, centerY + groupOffsetZ), scene, clonedObjects);
                    }
                    addObject(traverse, new Vector3(xPos, shelfYOffset, centerY + groupOffsetZ), scene, clonedObjects);
                    addObject(traverse, new Vector3(xPos, shelfYOffset + traverseOffset, -centerY + groupOffsetZ), scene, clonedObjects, false, false, true);
                }

                let shelfObj = null;
                switch (shelfUnit.deck) {
                    case 'wood': shelfObj = scene.getObjectByName(`Shelf_wood_${unit.width}_${group.depth}`); break;  // Use group-specific depth
                    case 'steel': shelfObj = scene.getObjectByName(`Shelf_steel_${unit.width}_${group.depth}`); break;
                    case 'inclined': shelfObj = scene.getObjectByName(`Shelf_kanban_${unit.width}_${group.depth}`); break;
                    case 'multiplex': shelfObj = scene.getObjectByName(`Shelf_multi_${unit.width}_${group.depth}`); break;
                    case 'grid': shelfObj = scene.getObjectByName(`Shelf_grid_${unit.width}_${group.depth}`); break;
                }
                if (shelfObj) addObject(shelfObj, new Vector3(xPos, shelfYOffset, groupOffsetZ), scene, clonedObjects);
            }

            // advance width offset
            groupWidthOffset += (unit.width + standWidth) / 100;

            // right stand
            if (standIndex === unit.shelves.length - 1 || (unit.height >= (group.units[standIndex+1]?.height || 0))) {
                const rightStand = scene.getObjectByName(`Stand_${unit.height}_${group.depth}`);  // Use group-specific depth
                addObject(rightStand, new Vector3(-centerXGroup + groupOffsetX + groupWidthOffset, 0, groupOffsetZ), scene, clonedObjects);
                if (group.doubleSided) {  // Use group-specific doubleSided
                    const spacer = scene.getObjectByName("Spacer_20");
                    addObject(spacer, new Vector3(-centerXGroup + groupOffsetX + groupWidthOffset, unit.height/120, -centerY - 0.1 + groupOffsetZ), scene);
                    addObject(spacer, new Vector3(-centerXGroup + groupOffsetX + groupWidthOffset, unit.height/200, -centerY - 0.1 + groupOffsetZ), scene);
                    addObject(spacer, new Vector3(-centerXGroup + groupOffsetX + groupWidthOffset, unit.height/550, -centerY - 0.1 + groupOffsetZ), scene);
                }
            }
        });
          // Handle double-sided mirror logic for each group independently
        if (group.doubleSided) {
            const centerY = group.depth / 200;
            clonedObjects.forEach(obj => {
                // Only mirror objects that belong to this group
                // Check if object is within this group's Z range (including front and back positions)
                const minZ = groupOffsetZ - centerY - 0.1;
                const maxZ = groupOffsetZ + centerY + 0.1;
                if (obj.position.z >= minZ && obj.position.z <= maxZ && !obj.name.includes('Plank')) {
                    const copy = obj.clone();
                    copy.applyMatrix4(new Matrix4().makeScale(1,1,-1));
                    copy.position.z = obj.position.z - centerY*2 - 0.2;
                    scene.getObjectByName('Scene').add(copy);
                }
            });
        }
    });

    // Skip old positioning code to prevent duplicate/scattered rendering
    return;
}

// add a model to the scene
function addObject(object, position, parent, objArray, flipX, flipY, flipZ) {
    if (!object) {
        console.warn('model-constructor-lr: addObject received undefined, skipping', position);
        return;
    }
    var objectCopy = object.clone();

    objectCopy.traverse(function (item) {
        if (!item.visible) item.visible = true;
        item.castShadow = true;
    });

    if (flipX) objectCopy.applyMatrix4(new Matrix4().makeScale(-1, 1, 1));
    if (flipY) objectCopy.applyMatrix4(new Matrix4().makeScale(1, -1, 1));
    if (flipZ) objectCopy.applyMatrix4(new Matrix4().makeScale(1, 1, -1));

    objectCopy.position.set(position.x, position.y, position.z);

    // Add to the provided parent group or scene
    parent.add(objectCopy);

    if (objArray) objArray.push(objectCopy);
}

export { constructLR };