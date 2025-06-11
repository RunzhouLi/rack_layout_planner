function addObject (object, position, scene, objArray, scale, rotation, selectableObjects, jsonPos) {
    if (!object) {
        console.warn('addObject: object is undefined, skipping', position);
        return;
    }
    resetRotation(object);

    var objectCopy = object.clone();

    // make object + object childs visible
    objectCopy.traverse(function (item) {
        if (!item.visible) item.visible = true;
        item.castShadow = true;
        item.layers.enable(23);
    });

    // set object properties
    if (scale) {
        objectCopy.scale.set(scale.x, scale.y, scale.z);
    }
    
    if (rotation) {
        objectCopy.rotation.setFromVector3(rotation);
    }

    objectCopy.position.set(position.x, position.y, position.z);

    if (jsonPos) Object.assign(objectCopy, {jsonPos: jsonPos});

    // add object to scene
    scene.add(objectCopy);

    // add object to object arrays
    if (objArray) objArray.push(objectCopy);
    if (selectableObjects) selectableObjects.push(objectCopy);
}

// reset object rotation
function resetRotation(object) {
    object.rotation.x = 0;
    object.rotation.y = 0;
    object.rotation.z = 0;
}

export { addObject };