import { Matrix4, Vector3, MathUtils } from 'three';
import { dynText } from "./dynamic-text.js";
import { addFog } from "./fog.js";
import { depth } from 'three/tsl';


var measurementObjs = [];

function constructPC(scene, configurator, clonedObjects, sceneObject, loop, appClassName, backgroundColor, configMenueContent, controls, camera, targetCam) {
    // setup parts
    var stand = null;
    var roof = null;
    var solarPanel = null;
    var gutter = null;
    var totalWidth = 0;
    var shelfYOffset = 0;
    var dynamicText;
    var dynamicText2;
    var dynamicText3;
    var dynamicText4;
    var widthOffset = 0;
    var depthOffset = 0;
    var yOffset = 95;

    //set zoom min/max
    controls.minDistance = 5;
    controls.maxDistance = 40;

    // create scene fog
    addFog(sceneObject, 0xffffff, 32, 64);

    // add text for total width measurement
    for (let unitIndex = 0; (unitIndex < configurator.units.length); unitIndex++) {
        totalWidth += (configurator.units[unitIndex].width) / 100;
    }

    // delete all existing measurements
    if (measurementObjs.length > 0) {
        for (let index = 0; index < measurementObjs.length; index++) {
            const element = measurementObjs[index].domElement;
            element.remove();
        }
    }

    measurementObjs = [];

    // set depth offset for depth measurement placement
    if (configurator.double) depthOffset = -configurator.depth/2 + 30;
    else depthOffset = 0;

    // add text for min-height measurement
    if (configurator.minHeight) measurement = configurator.minHeight;
    else measurement = 243;

    dynamicText4 = new dynText(scene, measurement, 58, measurement / 200 * 2, 0.01, new Vector3(-totalWidth / 2 + 3.09, measurement/200 + 0.02, 0), 0, 0, "#E64011", 1, null, " cm", loop, yOffset);
    dynamicText4.addText();

    loop.updatables.push(dynamicText4);
    measurementObjs.push(dynamicText4);

    // add text for width measurement
    var measurement = totalWidth * 100;
    
    dynamicText = new dynText(scene, measurement, 58, totalWidth, 0.01, new Vector3(0, 0.01, (configurator.depth + depthOffset)/100 + 0.1), 0, -MathUtils.degToRad(90), "#556879", 1, null, " cm", loop, yOffset);
    dynamicText.addText();

    loop.updatables.push(dynamicText);
    measurementObjs.push(dynamicText);

    // add text for depth measurement
    var rackDepth;

    measurement = configurator.depth;
    rackDepth = configurator.depth / 100;
    
    dynamicText2 = new dynText(scene, measurement, 58, rackDepth, 0.01, new Vector3(-totalWidth / 2 - 0.4, 0.01, (configurator.depth/2 + depthOffset)/100 - 0.3), -MathUtils.degToRad(90), 0, "#556879", 1, null, " cm", loop, yOffset);
    dynamicText2.addText();

    loop.updatables.push(dynamicText2);
    measurementObjs.push(dynamicText2);

    // add text for height measurement
    measurement = configurator.height;

    dynamicText3 = new dynText(scene, measurement, 58, measurement / 200 * 2, 0.01, new Vector3(-totalWidth / 2 - 0.4 , measurement/200 + 0.02, (configurator.depth + depthOffset)/100 - 0.1), 0, 0, "#556879", 1, null, " cm", loop, yOffset);
    dynamicText3.addText();

    loop.updatables.push(dynamicText3);
    measurementObjs.push(dynamicText3);

    // configure carport units
    for (let unitIndex = 0; unitIndex < configurator.units.length; unitIndex++) {
        const unit = configurator.units[unitIndex];
        var centerX = totalWidth / 2;

        // configure the units stand model according to configuration
        var standType = "single";

        if (configurator.double == false) {
            standType = "single";
        }
        else if (configurator.double == true) {
            standType = "double";
        }

        if (unitIndex == 0) {
            stand = scene.getObjectByName("Stand_" + standType);
            addObject(stand, new Vector3(-centerX + 0.2, 0, 0), scene, clonedObjects);
            addObject(stand, new Vector3(-centerX + unit.width / 100 - 0.18, 0, 0), scene, clonedObjects);
        }
        else {
            stand = scene.getObjectByName("Stand_" + standType);
            addObject(stand, new Vector3(-centerX + widthOffset + unit.width / 100, 0, 0), scene, clonedObjects);
        }

        // add a rain gutter to the canopy
        gutter = scene.getObjectByName("Gutter");
        addObject(gutter, new Vector3(-centerX + unit.width / 200 + widthOffset, 0, 0), scene, clonedObjects);
        
        // configure the units roof
        if (unitIndex == 0) roof = scene.getObjectByName("Roof");
        else roof = scene.getObjectByName("Roof_addon");
        
        if (roof) {
            addObject(roof, new Vector3(-centerX + unit.width / 200 + widthOffset, shelfYOffset, 0), scene, clonedObjects);
            if (configurator.double == true) {
                addObject(roof, new Vector3(-centerX + unit.width / 200 + widthOffset, shelfYOffset, 0), scene, clonedObjects,false,false,true);
            }
        }

        // configure the units solar panel
        if (configurator.units[unitIndex].solar) solarPanel = scene.getObjectByName("Roof_solar");

        if (configurator.units[unitIndex].solar == true) {
            addObject(solarPanel, new Vector3(-centerX + unit.width / 200 + widthOffset, shelfYOffset, 0), scene, clonedObjects);
            if (configurator.double == true) {
                addObject(solarPanel, new Vector3(-centerX + unit.width / 200 + widthOffset, shelfYOffset, 0), scene, clonedObjects,false,false,true);
            }
        }

        // set distance between carport units
        if (unitIndex == 0) widthOffset += 594 / 100;
        else if (unitIndex == 1) widthOffset += 577 / 100;
        else widthOffset += 577 / 100;
    }

    // check if menue is already there and if not, create one
    if (document.getElementsByClassName("canopy-config-menue").length == 0) addConfigMenue(scene, configurator, clonedObjects, sceneObject, loop, appClassName, backgroundColor, configMenueContent, controls, camera);
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

// add configuration menue to the scene
function addConfigMenue(scene, configurator, clonedObjects, sceneObject, loop, appClassName, backgroundColor, configMenueContent, controls, camera) {
    const appContainer = document.querySelector(appClassName);
    var configMenue = document.createElement("div");

    var targetCam = scene.getObjectByName("Kamera");

    configMenue.classList.add("canopy-config-menue");

    // add Title
    var mainTitle = document.createElement("div");

    mainTitle.classList.add("config-main-title");
    mainTitle.innerText = configMenueContent[0];

    // add horizontal line
    var horizontalLine = document.createElement("hr");

    // setup configurator switch menue for roof
    var menueWrap = document.createElement("div");
    var menueLabel1 = document.createElement("label");
    var menueLabel2 = document.createElement("label");
    var menueRadio1 = document.createElement("input");
    var menueRadio2 = document.createElement("input");
    var menueButton1 = document.createElement("span");
    var menueButton2 = document.createElement("span");

    menueWrap.classList.add("config-switch");
    menueButton1.innerText = configMenueContent[1];
    menueButton2.innerText = configMenueContent[2];
    menueRadio1.name = "radio";
    menueRadio2.name = "radio";
    menueRadio1.type = "radio";
    menueRadio2.type = "radio";
    menueButton1.classList.add("config-switch-button");
    menueButton2.classList.add("config-switch-button");

    menueLabel1.appendChild(menueRadio1);
    menueLabel1.appendChild(menueButton1);
    menueLabel2.appendChild(menueRadio2);
    menueLabel2.appendChild(menueButton2);
    menueWrap.appendChild(menueLabel2);
    menueWrap.appendChild(menueLabel1);

    if (configurator.units[0].solar == true) menueRadio2.checked = true;
    else menueRadio1.checked = true;

    menueRadio1.addEventListener('change', function () {
        // solar checked
        if (menueRadio1.checked) {
            // change configuration
            for (let unitIndex = 0; unitIndex < configurator.units.length; unitIndex++) {
                const unit = configurator.units[unitIndex];

                unit.solar = false;
            }
            configurator.height = configurator.height - 5;

            // reload scene
            reloadScene(scene, configurator, clonedObjects, sceneObject, loop, appClassName, backgroundColor, configMenueContent, controls, camera);
        }
    });
    menueRadio2.addEventListener('change', function () {
        // without solar checked
        if (menueRadio2.checked) {
            // change configuration
            for (let unitIndex = 0; unitIndex < configurator.units.length; unitIndex++) {
                const unit = configurator.units[unitIndex];

                unit.solar = true;
            }
            configurator.height = configurator.height + 5;

            // reload scene
            reloadScene(scene, configurator, clonedObjects, sceneObject, loop, appClassName, backgroundColor, configMenueContent, controls, camera);
        }
    });

    // setup configurator switch menue for single/double stand
    var menueWrap2 = document.createElement("div");
    var menueLabel3 = document.createElement("label");
    var menueRadio3 = document.createElement("input");
    var menueButton3 = document.createElement("span");
    var menueTitle3 = document.createElement("p");
    var menueOptions = document.createElement("div");

    menueLabel3.classList.add("config-toggle-switch");
    menueRadio3.type = "checkbox";
    menueButton3.classList.add("config-switch-slider");
    menueButton3.classList.add("round");
    menueTitle3.classList.add("menue-title");
    menueTitle3.innerText = configMenueContent[3];
    menueWrap2.classList.add("config-menue-wrap");
    menueOptions.classList.add("config-optionbar");

    menueLabel3.appendChild(menueRadio3);
    menueLabel3.appendChild(menueButton3);

    menueWrap2.appendChild(menueTitle3);
    menueWrap2.appendChild(menueLabel3);

    if (configurator.double) menueRadio3.checked = true;
    else menueRadio3.checked = false;

    menueRadio3.addEventListener('change', function () {
        // double stand checked
        if (menueRadio3.checked) {
            // change configuration
            configurator.double = true;
            configurator.depth = (configurator.depth * 2) - 63;
        
            // reload scene
            reloadScene(scene, configurator, clonedObjects, sceneObject, loop, appClassName, backgroundColor, configMenueContent, controls, camera);
        }
        // single stand checked
        else {
            // change configuration
            configurator.double = false;
            configurator.depth = (configurator.depth + 63) / 2 ;
            
            // reload scene
            reloadScene(scene, configurator, clonedObjects, sceneObject, loop, appClassName, backgroundColor, configMenueContent, controls, camera);
        }
    });

    // setup buttons for adding / deleting canopy addons
    var menueWrap3 = document.createElement("div");
    var menueTitle4 = document.createElement("p");
    var menueButton4 = document.createElement("span");
    var menueButton5 = document.createElement("span");

    menueWrap3.classList.add("config-menue-wrap");
    menueButton4.classList.add("config-menue-button");
    menueButton4.classList.add("plus");
    menueButton5.classList.add("config-menue-button");
    menueButton5.classList.add("minus");
    menueTitle4.classList.add("menue-title");
    menueTitle4.innerText = configMenueContent[4];
    menueButton4.innerText = "+";
    menueButton5.innerText = "-";

    menueWrap3.appendChild(menueTitle4);
    menueWrap3.appendChild(menueButton5);
    menueWrap3.appendChild(menueButton4);

    menueButton4.addEventListener('click', function () {
        if (configurator.units.length < 99) {
            // change configuration
            var newUnit = {
                "solar": false,
                "width": 577
            }

            var unitCount = configurator.units.length;

            // adjust zoom -
            if (unitCount <= 5) cameraUpdate(configurator.units.length, loop, targetCam, true);

            if (configurator.units.length == 1) newUnit.width = 578;
            if (configurator.units[0].solar) newUnit.solar = true;

            configurator.units.push(newUnit);

            // reload scene
            reloadScene(scene, configurator, clonedObjects, sceneObject, loop, appClassName, backgroundColor, configMenueContent, controls, camera);
        }
    });

    menueButton5.addEventListener('click', function () {
        if (configurator.units.length > 1) {
            // change configuration
            var unitCount = configurator.units.length;

            // adjust zoom +
            if (unitCount > 1 && unitCount <= 6) cameraUpdate(configurator.units.length, loop, targetCam, false);

            configurator.units.pop(configurator.units[unitCount-1]);

            // reload scene
            reloadScene(scene, configurator, clonedObjects, sceneObject, loop, appClassName, backgroundColor, configMenueContent, controls, camera);
        }
    });

    function cameraUpdate (unitCount, loop, targetCam, isZoomingIn) {
        if (isZoomingIn) targetCam.translateZ(2.5);
        else targetCam.translateZ(-2.5);

        camera.updateProjectionMatrix();
        if (targetCam) loop.target = targetCam.position;
    }

    // build all menue elements together in one box (configMenue)
    menueOptions.appendChild(menueWrap);
    menueOptions.appendChild(menueWrap2);
    menueOptions.appendChild(menueWrap3);

    configMenue.appendChild(mainTitle);
    configMenue.appendChild(horizontalLine);
    configMenue.appendChild(menueOptions);

    appContainer.appendChild(configMenue);
}

function reloadScene(scene, configurator, clonedObjects, sceneObject, loop, appClassName, backgroundColor, configMenueContent, controls, camera) {
    var sceneGroup = scene.getObjectByName("Scene");

    for (let i = sceneGroup.children.length - 1; i >= 0; i--) {
        if (sceneGroup.children[i].name != "Constructor")
            sceneGroup.remove(sceneGroup.children[i]);
    }

    constructPC(scene, configurator, clonedObjects, sceneObject, loop, backgroundColor, appClassName, configMenueContent, controls, camera);
}

export { constructPC };