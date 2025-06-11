import { Vector3, Color, MathUtils } from 'three';
import { dynText } from "../components/dynamic-text";
import { addObject } from "../components/addObject";
import { addFog } from "../components/fog";


var selectableObjects = [];
var roofTiles = [];
var measurementObjs = [];
var outerWallTiles = [];
var draggedItem = null;


function constructPREFAB(scene, configurator, clonedObjects, sceneObject, loop, appClassName, backgroundColor, configMenueContent, controls, camera, raycaster, composer) {
    // setup parts
    var wallPanel;
    var ceilingPanel;
    var cornerPiece = scene.getObjectByName("Corner_Edge");
    var roofRail = scene.getObjectByName("Rail_Long");
    var centerX = configurator.columns.length / 2;
    var centerY = 1.5;
    var centerZ = 1.25;
    var dynamicText;
    var dynamicText2;
    var dynamicText3;
    var yOffset = 176;
    

    // reset object arrays
    clonedObjects = [];
    selectableObjects = [];
    roofTiles = [];
    outerWallTiles = [];

    // custom lighting
    const lights = [];
    sceneObject.traverse((obj) => {
      if (
        obj.name === "dirLight" ||
        obj.name === "ambiLight"
      ) {
        lights.push(obj);
      }
    });
    for (let i = 0; i < lights.length; i++) {
        sceneObject.remove(lights[i]);
    }

    // set zoom and rotating min/max values
    controls.minDistance = 5;
    controls.maxDistance = 40;
    controls.maxPolarAngle = 1.55;
    camera.fov = 30;

    // create scene fog
    addFog(sceneObject, 0xffffff, 32, 64);

    // add dynamic text
    var measurement = configurator.columns.length * 98 + 11.5;

    // delete all existing measurements
    if (measurementObjs.length > 0) {
        for (let index = 0; index < measurementObjs.length; index++) {
            const element = measurementObjs[index].domElement;
            element.remove();
        }
    }

    measurementObjs = [];
    
    dynamicText = new dynText(scene, measurement, 54, centerX * 2, 0.01, new Vector3(0, 0.01, centerY + 0.8), 0, -MathUtils.degToRad(90), "#556879", 1, null, " cm", loop, yOffset);
    dynamicText.addText();

    loop.updatables.push(dynamicText);
    measurementObjs.push(dynamicText);

    measurement = 305.5;
    dynamicText2 = new dynText(scene, measurement, 54, centerY * 2, 0.01, new Vector3(-centerX - 0.6, 0.01, 0), -MathUtils.degToRad(90), 0, "#556879", 1, null, " cm", loop, yOffset);
    dynamicText2.addText();

    loop.updatables.push(dynamicText2);
    measurementObjs.push(dynamicText2);

    measurement = 255;
    dynamicText3 = new dynText(scene, measurement, 54, centerZ * 2, 0.01, new Vector3(centerX + 0.6, centerZ, centerY), 0, 0, "#556879", 1, null, " cm", loop, yOffset);
    dynamicText3.addText();

    loop.updatables.push(dynamicText3);
    measurementObjs.push(dynamicText3);

    // go through columns
    for (let columnsIndex = 0; columnsIndex < configurator.columns.length; columnsIndex++) {
        var cells = configurator.columns[columnsIndex].cells;

        // add ceiling panel
        if (configurator.columns[columnsIndex].lamp == true) {
            ceilingPanel = scene.getObjectByName("Roof_Panel_LED");
        }
        else ceilingPanel = scene.getObjectByName("Roof_Panel");

        if (ceilingPanel) {
            addObject(ceilingPanel, new Vector3(-centerX + columnsIndex, 0, centerY), scene, clonedObjects, new Vector3(1,1,1), new Vector3(0,0,0), selectableObjects, [columnsIndex,0,0]);
            roofTiles.push(clonedObjects[clonedObjects.length-1]);
        }

        // go through cells in column
        for (let cellsIndex = 0; cellsIndex < cells.length; cellsIndex++) {
            var cellCoordinatesX = [0, 1, 1, 0];
            var cellCoordinatesY = [0, 0, 1, 1];
            var rotateWall = [MathUtils.degToRad(0), MathUtils.degToRad(90), MathUtils.degToRad(180), MathUtils.degToRad(270)];
            var flipWall = [-1, -1, -1, -1];
            var walls = cells[cellsIndex].walls;


            // go through all 4 walls of one cell
            for (let wallsIndex = 0; wallsIndex < walls.length; wallsIndex++) {
                var panel = walls[wallsIndex];
                var posX = -centerX + cellCoordinatesX[wallsIndex] + columnsIndex;
                var posY = -centerY + cellCoordinatesY[wallsIndex] + cellsIndex;

                // choose model for wall
                switch (panel) {
                    case "wall": wallPanel = scene.getObjectByName("Wall_Panel"); break;
                    case "door": wallPanel = scene.getObjectByName("Door_Panel"); break;
                    case "window": wallPanel = scene.getObjectByName("Window_Panel"); break;
                    case "bigWindow": wallPanel = scene.getObjectByName("Studio_Panel"); break;
                    case "inner": wallPanel = scene.getObjectByName("Inner"); break;
                    default: wallPanel = null; break;
                }
                
                // add wall panel
                if (wallPanel) {
                    if (!cellsIndex == 0 && wallsIndex == 0) {}
                    else if (!columnsIndex == 0 &&  wallsIndex == 3) {}
                    else {
                        addObject(wallPanel, new Vector3(posX, 0, posY), scene, clonedObjects, new Vector3(1,1,flipWall[wallsIndex]), new Vector3(0,-rotateWall[wallsIndex],0), selectableObjects, [columnsIndex,cellsIndex,wallsIndex]);
                        // write all outer wall tiles to array
                        if (checkIfOuterPanel(clonedObjects[clonedObjects.length-1], configurator) == true) {
                            outerWallTiles.push(clonedObjects[clonedObjects.length-1]);
                        }
                    }
                }

                // add corner pieces
                if (cornerPiece) {
                    if (columnsIndex == 0 && cellsIndex == 0 && wallsIndex == 0) {
                        addObject(cornerPiece, new Vector3(-centerX, 0, -centerY), scene, clonedObjects, new Vector3(1,1,1), new Vector3(0,MathUtils.degToRad(-90),0));
                    }
                    else if (columnsIndex == configurator.columns.length-1 && cellsIndex == 0 && wallsIndex == 1) {
                        addObject(cornerPiece, new Vector3(-centerX + columnsIndex + wallsIndex, 0, -centerY), scene, clonedObjects, new Vector3(1,1,1), new Vector3(0,MathUtils.degToRad(-180),0));
                    }
                    else if (columnsIndex == configurator.columns.length-1 && cellsIndex == cells.length-1 && wallsIndex == 2) {
                        addObject(cornerPiece, new Vector3(-centerX + columnsIndex + 1, 0, -centerY + cellsIndex + 1), scene, clonedObjects, new Vector3(1,1,1), new Vector3(0,MathUtils.degToRad(-270),0));
                    }
                    else if (columnsIndex == 0 && cellsIndex == cells.length-1 && wallsIndex == 3) {
                        addObject(cornerPiece, new Vector3(-centerX, 0, -centerY + cellsIndex + 1), scene, clonedObjects, new Vector3(1,1,1), new Vector3(0,0,0));
                    }
                }

                // add rail to roof tile
                if (roofRail) {
                    if (columnsIndex == 0) {
                        addObject(roofRail, new Vector3(-centerX, 0, centerY), scene, clonedObjects, new Vector3(1,1,1), new Vector3(0,0,0));
                    }
                    else if (columnsIndex == configurator.columns.length-1) {
                        addObject(roofRail, new Vector3(centerX, 0, centerY), scene, clonedObjects, new Vector3(-1,1,1), new Vector3(0,0,0));
                    }
                }
            }
        }
    }

    // fill raycaster array of selectable objects
    raycaster.selectedObjects = selectableObjects;

    // change visibility of roof tiles dependened on polar angle
    /* controls.addEventListener("change", function() {
        // object fading when birds eye view
        for (let index = 0; index < roofTiles.length; index++) {
            const element = roofTiles[index];
            
            if (controls.getPolarAngle() < 0.5) {
                element.children.forEach((child) => {
                    child.visible = false;
                    child.layers.disable(23);
                });
            }
            else {
                element.children.forEach((child) => {
                    child.visible = true;
                    child.layers.enable(23);
                });
            }
        }
    }); */

    // check if menue is already there and if not, create one
    if (document.getElementsByClassName("prefab-config-menue").length == 0) {
        addConfigMenue(scene, configurator, clonedObjects, sceneObject, loop, appClassName, backgroundColor, configMenueContent, controls, camera, raycaster);
    }
}

// add configuration menue to the scene
function addConfigMenue(scene, configurator, clonedObjects, sceneObject, loop, appClassName, backgroundColor, configMenueContent, controls, camera, raycaster) {
    // setup main menue element frames
    const appContainer = document.querySelector(appClassName);
    var configMenue = document.createElement("div");
    var configMenue2 = document.createElement("div");
    var configMenue3 = document.createElement("div");
    var configMenueWrap = document.createElement("div");
    var targetCam = scene.getObjectByName("Kamera");
    var targetCam2 = scene.getObjectByName("Kamera2");
    var targetCam3 = scene.getObjectByName("Kamera3");
    var cameraButtons = [];
    var isVisible = true;

    // setup menue elements & buttons
    var mainTitle = document.createElement("div");
    var horizontalLine = document.createElement("hr");
    var menueWrap = document.createElement("div");
    var menueWrap2 = document.createElement("div");
    var menueWrapOuter = document.createElement("div");
    var menueTitle = document.createElement("p");
    var menueButton = document.createElement("span");
    var menueButton1 = document.createElement("span");
    var textInput = document.createElement("input");
    var menueOptions = document.createElement("div");
    var menueText = document.createElement("p");
    var menueText2 = document.createElement("p");
    var menueText3 = document.createElement("p");

    // add classes to elements
    configMenueWrap.classList.add("prefab-config-container");
    configMenue.classList.add("prefab-config-menue");
    mainTitle.classList.add("config-main-title");
    menueWrap.classList.add("config-menue-inputwrap");
    menueWrap2.classList.add("config-menue-text-wrap");
    menueWrapOuter.classList.add("config-menue-outer-wrap");
    menueButton.classList.add("config-menue-button");
    menueButton.classList.add("plus");
    menueButton1.classList.add("config-menue-button");
    menueButton1.classList.add("minus");
    menueTitle.classList.add("menue-title");
    menueText.classList.add("menue-text");
    menueText2.classList.add("menue-text");
    menueText3.classList.add("config-menue-textinput-unit");
    textInput.classList.add("config-menue-textinput");
    menueOptions.classList.add("config-optionbar");

    // setup element content
    if (configMenueContent) {
        mainTitle.innerText = configMenueContent[0];
        menueTitle.innerText = configMenueContent[1];
        menueText.innerText = configMenueContent[2];
        menueText2.innerText = configMenueContent[3];
    }
    else {
        mainTitle.innerText = "Innenmaße";
        menueTitle.innerText = "Raumbreite";
        menueText.innerText = "Raumtiefe";
        menueText2.innerText = "Raumhöhe";
    }
    
    menueButton.innerText = "+";
    menueButton1.innerText = "-";
    //menueText3.innerText = " cm";
    textInput.value = configurator.columns.length * 98 + 1.5;
    textInput.min = "200";
    textInput.max = "5000";
    textInput.type = "number";

    // text input functions
    textInput.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            cameraButtonUI(null);

            if (textInput.value < 200) {
                textInput.value = 200;
                setModules();
            }
            else if (textInput.value >= 200 && textInput.value <= 5000) {
                var remainder = (textInput.value) % 100;
                var remainderH = textInput.value % 100;
                
                // check for correct inputs
                if (remainder == 0){
                    setModules();
                }
                // check if user inputs a factor of 100 and round up if correct
                else if (remainderH == 0) {
                    textInput.value = Number(textInput.value);

                    setModules();
                }
                // check nearest correct input
                else {
                    if (remainderH >= 50) textInput.value = Number(textInput.value) + (100 - remainderH);
                    else textInput.value = Number(textInput.value) - remainderH;

                    setModules();
                }
            }
            else if (textInput.value > 5000) {
                textInput.value = 5000;
                setModules();
            }
        }
    });

    function setModules() {
        var moduleCount = (textInput.value-200)/100;
    
        // clean modules
        configurator.columns.splice(1, configurator.columns.length-2);

        // add in new modules
        for (let module = 0; module < moduleCount; module++) {
            var newModule = {"id": 0, "lamp": false, "cells": [
                {"walls": ["wall", "inner", "inner", "inner"]}, 
                {"walls": ["inner", "inner", "inner", "inner"]}, 
                {"walls": ["inner", "inner", "wall", "inner"]}
            ]};
            configurator.columns.splice(configurator.columns.length-1, 0, newModule);
            configurator.columns[module+1].id = module+1;
        }

        textInput.value = configurator.columns.length * 98 + 1.5;

        cameraUpdate(configurator.columns.length, loop, targetCam);
        
        // reload scene
        reloadScene(scene, configurator, clonedObjects, sceneObject, loop, appClassName, backgroundColor, configMenueContent, controls, camera, raycaster);
    }

    // tooltip for menue buttons
    var tooltip = document.createElement("div");
    var tooltipBox = document.createElement("div");
    var tooltip2 = document.createElement("div");
    var tooltipBox2 = document.createElement("div");

    tooltip.classList.add("prefab-tooltip");
    tooltipBox.classList.add("prefab-tooltip-box");
    tooltip2.classList.add("prefab-tooltip");
    tooltipBox2.classList.add("prefab-tooltip-box");

    tooltip.innerText = "?";
    tooltip2.innerText = "?";

    tooltipBox.style.opacity = 0;
    tooltipBox2.style.opacity = 0;

    if (configMenueContent) {
        tooltipBox.innerText = configMenueContent[13];
        tooltipBox2.innerText = configMenueContent[14];
    }
    else {
        tooltipBox.innerText = "Wählen Sie hier die Anzahl der Module über den Minus-Button oder den Plus-Button. Die Gesamtlänge kann auch über das Zahlenfeld in der Mitte direkt eingegeben werden.";
        tooltipBox2.innerText = "Die Raumtiefe sowie Raumhöhe sind Fixwerte und können nicht geändert werden.";
    }

    // add tooltip functions
    tooltip.addEventListener("mouseover", (event) => {
        tooltipBox.style.opacity = 1;
    });
    tooltip.addEventListener("mouseout", (event) => {
        tooltipBox.style.opacity = 0;
    });
    tooltip2.addEventListener("mouseover", (event) => {
        tooltipBox2.style.opacity = 1;
    });
    tooltip2.addEventListener("mouseout", (event) => {
        tooltipBox2.style.opacity = 0;
    });

    menueWrap.appendChild(menueTitle);
    menueWrap.appendChild(menueButton1);
    menueWrap.appendChild(textInput);
    menueWrap.appendChild(menueButton);
    tooltip.appendChild(tooltipBox);
    menueWrap.appendChild(tooltip);
    menueWrap2.appendChild(menueText);
    menueWrap2.appendChild(menueText2);
    menueWrapOuter.appendChild(menueWrap2);
    tooltip2.appendChild(tooltipBox2);
    menueWrapOuter.appendChild(tooltip2);
    menueOptions.appendChild(menueWrap);
    menueOptions.appendChild(menueWrapOuter);
    configMenue.appendChild(mainTitle);
    configMenue.appendChild(horizontalLine);
    configMenue.appendChild(menueOptions);

    // add button functions
    menueButton.addEventListener('click', function () {
        var newModule = {"id": 0, "lamp": false, "cells": [
            {"walls": ["wall", "inner", "inner", "inner"]}, 
            {"walls": ["inner", "inner", "inner", "inner"]}, 
            {"walls": ["inner", "inner", "wall", "inner"]}
        ]};

        if (configurator.columns.length < 50) {
            // add new column before the last column
            configurator.columns.splice(configurator.columns.length-1, 0, newModule);
            textInput.value = configurator.columns.length * 98 + 1.5;
            cameraUpdate(configurator.columns.length, loop, targetCam);

            // reload scene
            reloadScene(scene, configurator, clonedObjects, sceneObject, loop, appClassName, backgroundColor, configMenueContent, controls, camera, raycaster);
            setMenueState(configMenue2, false);
            setMenueState(configMenue3, false);
        }
    });
    menueButton1.addEventListener('click', function () {
        if (configurator.columns.length > 2) {
            // delete the second last column
            configurator.columns.splice(configurator.columns.length-2, 1);
            textInput.value = configurator.columns.length * 98 + 1.5;
            cameraUpdate(configurator.columns.length, loop, targetCam);

            // reload scene
            reloadScene(scene, configurator, clonedObjects, sceneObject, loop, appClassName, backgroundColor, configMenueContent, controls, camera, raycaster);
            setMenueState(configMenue2, false);
            setMenueState(configMenue3, false);
        }
    });

    // setup menue 2 elements (wall buttons)
    var mainTitle2 = document.createElement("div");
    var horizontalLine2 = document.createElement("hr");
    var outerViewBtn = document.createElement("span");
    var innerViewBtn = document.createElement("span");
    var sideViewBtn = document.createElement("span");
    var topViewBtn = document.createElement("span");
    var viewBtnWrapWalls = document.createElement("div");
    var viewBtnWrapWalls2 = document.createElement("div");
    var itemImg = document.createElement("img");
    var itemImgCap = document.createElement("figcaption");
    var buttonWall = document.createElement("figure");
    var itemImg2 = document.createElement("img");
    var itemImg2Cap = document.createElement("figcaption");
    var buttonDoor = document.createElement("figure");
    var itemImg3 = document.createElement("img");
    var itemImg3Cap = document.createElement("figcaption");
    var buttonWindow = document.createElement("figure");
    var itemImg4 = document.createElement("img");
    var itemImg4Cap = document.createElement("figcaption");
    var buttonStudio = document.createElement("figure");
    var menueWrap3 = document.createElement("div");
    
    configMenue2.classList.add("prefab-config-menue");
    mainTitle2.classList.add("config-main-title");
    outerViewBtn.classList.add("camera-perspective-button");
    innerViewBtn.classList.add("camera-perspective-button");
    viewBtnWrapWalls.classList.add("config-menue-imgwrap");
    itemImg.classList.add("config-menue-img", "btn-wall");
    itemImg2.classList.add("config-menue-img", "btn-door");
    itemImg3.classList.add("config-menue-img", "btn-window");
    itemImg4.classList.add("config-menue-img", "btn-studio");
    buttonWall.classList.add("config-menue-imgwrap");
    buttonDoor.classList.add("config-menue-imgwrap");
    buttonWindow.classList.add("config-menue-imgwrap");
    buttonStudio.classList.add("config-menue-imgwrap");
    menueWrap3.classList.add("config-image-wrap");

    if (configMenueContent) {
        mainTitle2.innerText = configMenueContent[4];
        itemImgCap.innerText = configMenueContent[5];
        itemImg2Cap.innerText = configMenueContent[6];
        itemImg3Cap.innerText = configMenueContent[7];
        itemImg4Cap.innerText = configMenueContent[8];
        outerViewBtn.innerHTML = "<div class='outer-view-btn'></div>" + configMenueContent[15];
        innerViewBtn.innerHTML = "<div class='inner-view-btn'></div>" + configMenueContent[16];
    }
    else {
        mainTitle2.innerText = "Wandelemente";
        itemImgCap.innerText = "Wand";
        itemImg2Cap.innerText = "Tür";
        itemImg3Cap.innerText = "Fenster";
        itemImg4Cap.innerText = "Studiofenster";
        outerViewBtn.innerHTML = "<div class='outer-view-btn'></div>" + "Außen";
        innerViewBtn.innerHTML = "<div class='inner-view-btn'></div>" + "Innen";
    }

    // add new camera buttons to group
    cameraButtons.push(outerViewBtn);
    cameraButtons.push(innerViewBtn);
    
    // add button functions
    outerViewBtn.addEventListener('click', function () {
        // change to camera 1 position
        loop.target = targetCam.position;

        // make walls visible
        changeVisibility(false);

        // activate/deactivate button
        if(innerViewBtn.classList.contains("active")) {
            cameraButtonUI (innerViewBtn);

            // deactivate seccond menue
            setMenueState(configMenue3, false);
        }

        // change infotext content
        if (configMenueContent[19] != null) infoText.innerText = configMenueContent[19];
        else infoText.innerText = "Türöffnungsrichtung kann bei Aufbau angepasst werden (im Konfigurator 'nach links und außen öffnend' abgebildet; Türelement um 180° gedreht = Türöffnungsrichtung rechts und nach innen öffnend).";
        infoImg.classList.remove("inner-view");
    });

    innerViewBtn.addEventListener('click', function () {
        // change to camera 1 position
        loop.target = targetCam.position;

        // activate/deactivate button
        cameraButtonUI (innerViewBtn);

        // make walls & roof transparent
        if (isVisible) {
            changeVisibility(true);
            
            // activate seccond menue
            setMenueState(configMenue3, true);

            // change infotext content
            if (configMenueContent[20] != null) infoText.innerText = configMenueContent[20];
            else infoText.innerText = "Innere Trennwandpaneele müssen immer mit einer Außenwand verbunden sein. Fenster- und Türen benötigen für den Einbau im Innenraum stets ein Wandpaneel auf beiden Seiten.";
            infoImg.classList.add("inner-view");
        }
        else {
            changeVisibility(false);

            // deactivate seccond menue
            setMenueState(configMenue3, false);

            // change infotext content
            if (configMenueContent[19] != null) infoText.innerText = configMenueContent[19];
            else infoText.innerText = "Türöffnungsrichtung kann bei Aufbau angepasst werden (im Konfigurator 'nach links und außen öffnend' abgebildet; Türelement um 180° gedreht = Türöffnungsrichtung rechts und nach innen öffnend).";
            infoImg.classList.remove("inner-view");
        }

        // unselect current active tile
        raycaster.deleteButton.clickedObj = null;
        raycaster.composer.clearObject();       
    });

    buttonWall.addEventListener('click', function () {
        if (raycaster.composer.selectedObjects.length > 0) {
            changeSelectedModule(scene, buttonWall, raycaster.composer.selectedObjects[0]);
        }
    });

    buttonWall.addEventListener('mousedown', function() {
        draggedItem = buttonWall;
        raycaster.dragIcon.style.visibility = "visible";
        raycaster.dragIcon.classList.add("btn-wall");
        raycaster.dragIcon.classList.remove("btn-door", "btn-window", "btn-studio", "btn-roof", "btn-lamp");
    });

    buttonDoor.addEventListener('click', function () {
        if (raycaster.composer.selectedObjects.length > 0) {
            changeSelectedModule(scene, buttonDoor, raycaster.composer.selectedObjects[0]);
        }
    });

    buttonDoor.addEventListener('mousedown', function() {
        draggedItem = buttonDoor;
        raycaster.dragIcon.style.visibility = "visible";
        raycaster.dragIcon.classList.add("btn-door");
        raycaster.dragIcon.classList.remove("btn-wall", "btn-window", "btn-studio", "btn-roof", "btn-lamp");
    });

    buttonWindow.addEventListener('click', function () {
        if (raycaster.composer.selectedObjects.length > 0) {
            changeSelectedModule(scene, buttonWindow, raycaster.composer.selectedObjects[0]);
        }
    });

    buttonWindow.addEventListener('mousedown', function() {
        draggedItem = buttonWindow;
        raycaster.dragIcon.style.visibility = "visible";
        raycaster.dragIcon.classList.add("btn-window");
        raycaster.dragIcon.classList.remove("btn-door", "btn-wall", "btn-studio", "btn-roof", "btn-lamp");
    });

    buttonStudio.addEventListener('click', function () {
        if (raycaster.composer.selectedObjects.length > 0) {
            changeSelectedModule(scene, buttonStudio, raycaster.composer.selectedObjects[0]);
        }
    });

    buttonStudio.addEventListener('mousedown', function() {
        draggedItem = buttonStudio;
        raycaster.dragIcon.style.visibility = "visible";
        raycaster.dragIcon.classList.add("btn-studio");
        raycaster.dragIcon.classList.remove("btn-door", "btn-window", "btn-wall", "btn-roof", "btn-lamp");
    });

    buttonWall.appendChild(itemImg);
    buttonWall.appendChild(itemImgCap);
    buttonDoor.appendChild(itemImg2);
    buttonDoor.appendChild(itemImg2Cap);
    buttonWindow.appendChild(itemImg3);
    buttonWindow.appendChild(itemImg3Cap);
    buttonStudio.appendChild(itemImg4);
    buttonStudio.appendChild(itemImg4Cap);
    viewBtnWrapWalls.appendChild(outerViewBtn);
    viewBtnWrapWalls.appendChild(innerViewBtn);
    menueWrap3.appendChild(viewBtnWrapWalls);
    menueWrap3.appendChild(buttonWall);
    menueWrap3.appendChild(buttonDoor);
    menueWrap3.appendChild(buttonWindow);
    menueWrap3.appendChild(buttonStudio);
    configMenue2.appendChild(mainTitle2);
    configMenue2.appendChild(horizontalLine2);
    configMenue2.appendChild(menueWrap3);

    // menue elements
    var mainTitle3 = document.createElement("div");
    var horizontalLine3 = document.createElement("hr");
    var itemImg5 = document.createElement("img");
    var itemImg5Cap = document.createElement("figcaption");
    var buttonRoof = document.createElement("figure");
    var itemImg6 = document.createElement("img");
    var itemImg6Cap = document.createElement("figcaption");
    var buttonRoofLed = document.createElement("figure");
    var menueWrap4 = document.createElement("div");

    configMenue3.classList.add("prefab-config-menue");
    mainTitle3.classList.add("config-main-title");
    itemImg5.classList.add("config-menue-img", "btn-roof");
    itemImg6.classList.add("config-menue-img", "btn-roof-lamp");
    buttonRoof.classList.add("config-menue-imgwrap")
    buttonRoofLed.classList.add("config-menue-imgwrap")
    sideViewBtn.classList.add("camera-perspective-button");
    topViewBtn.classList.add("camera-perspective-button");
    viewBtnWrapWalls2.classList.add("config-menue-imgwrap");
    menueWrap4.classList.add("config-image-wrap");

    if (configMenueContent) {
        mainTitle3.innerText = configMenueContent[9];
        itemImg5Cap.innerText = configMenueContent[10];
        itemImg6Cap.innerText = configMenueContent[11];
        sideViewBtn.innerHTML = "<div class='side-view-btn'></div>" + configMenueContent[17];
        topViewBtn.innerHTML = "<div class='top-view-btn'></div>" + configMenueContent[18];
    }
    else {
        mainTitle3.innerText = "Deckenelemente";
        itemImg5Cap.innerText = "Decke";
        itemImg6Cap.innerText = "inkl. Licht";
        sideViewBtn.innerHTML = "<div class='side-view-btn'></div>" + "Seitlich";
        topViewBtn.innerHTML = "<div class='top-view-btn'></div>" + "Oben";
    }

    // add new camera buttons to group
    cameraButtons.push(sideViewBtn);
    cameraButtons.push(topViewBtn);

    // add button functions
    sideViewBtn.addEventListener('click', function () {
        // change to camera 3 position
        loop.target = targetCam3.position;

        // make walls visible
        changeVisibility(false);

        // activate/deactivate button
        cameraButtonUI (sideViewBtn);
    });
    topViewBtn.addEventListener('click', function () {
        // change to camera 2 position
        loop.target = targetCam2.position;

        // make walls visible
        changeVisibility(false);

        // activate/deactivate button
        cameraButtonUI (topViewBtn);
    });
    // add button functions
    buttonRoof.addEventListener('click', function () {
        if (raycaster.composer.selectedObjects.length > 0) {
            changeSelectedModule(scene, buttonRoof, raycaster.composer.selectedObjects[0]);
        }
    });
    buttonRoof.addEventListener('mousedown', function() {
        draggedItem = buttonRoof;
        raycaster.dragIcon.style.visibility = "visible";
        raycaster.dragIcon.classList.add("btn-roof");
        raycaster.dragIcon.classList.remove("btn-door", "btn-window", "btn-wall", "btn-lamp", "btn-studio");
    });
    buttonRoofLed.addEventListener('click', function () {
        if (raycaster.composer.selectedObjects.length > 0) {
            changeSelectedModule(scene, buttonRoofLed, raycaster.composer.selectedObjects[0]);
        }
    });
    buttonRoofLed.addEventListener('mousedown', function() {
        draggedItem = buttonRoofLed;
        raycaster.dragIcon.style.visibility = "visible";
        raycaster.dragIcon.classList.add("btn-lamp");
        raycaster.dragIcon.classList.remove("btn-door", "btn-window", "btn-wall", "btn-roof", "btn-studio");
    });

    buttonRoof.appendChild(itemImg5);
    buttonRoof.appendChild(itemImg5Cap);
    buttonRoofLed.appendChild(itemImg6);
    buttonRoofLed.appendChild(itemImg6Cap);
    viewBtnWrapWalls2.appendChild(sideViewBtn);
    viewBtnWrapWalls2.appendChild(topViewBtn);
    menueWrap4.appendChild(buttonRoof);
    menueWrap4.appendChild(buttonRoofLed);
    configMenue3.appendChild(mainTitle3);
    configMenue3.appendChild(horizontalLine3);
    configMenue3.appendChild(menueWrap4);

    // add info box menue
    var configMenue4 = document.createElement("div");
    var menueWrap5 = document.createElement("div");
    var infoImg = document.createElement("div");
    var infoText = document.createElement("div");

    configMenue4.classList.add("prefab-config-menue", "coloredBG-box");
    infoImg.classList.add("config-menue-infoimg");
    infoText.classList.add("config-menue-infotext");
    menueWrap5.classList.add("config-menue-infowrap");

    if (configMenueContent[19] != null) infoText.innerText = configMenueContent[19];
    else infoText.innerText = "Türöffnungsrichtung kann bei Aufbau angepasst werden (im Konfigurator 'nach links und außen öffnend' abgebildet; Türelement um 180° gedreht = Türöffnungsrichtung rechts und nach innen öffnend).";

    function changeVisibility(hideElement) {
        // make walls transparent
        for (let index = 0; index < outerWallTiles.length; index++) {
            const element = outerWallTiles[index];
            
            if (hideElement) {
                element.visible = false;
                element.children.forEach((child) => {
                    child.visible = false;
                    child.layers.disable(23);
                });
            }
            else {
                element.visible = true;
                element.children.forEach((child) => {
                    child.visible = true;
                    child.layers.enable(23);
                });
            }
        }

        // make roof transparent
        for (let index = 0; index < roofTiles.length; index++) {
            const element = roofTiles[index];

            if (hideElement) {
                element.children.forEach((child) => {
                    child.visible = false;
                    child.layers.disable(23);
                });
            }
            else {
                element.children.forEach((child) => {
                    child.visible = true;
                    child.layers.enable(23);
                });
            }
        }
        isVisible = !hideElement;
    }

    function cameraButtonUI (clickedButton) {
        cameraButtons.forEach(button => {
            if (button != clickedButton) button.classList.remove("active");
        });

        if (clickedButton != null) {
            if (clickedButton.classList.contains("active")) {
                clickedButton.classList.remove("active");
            }
            else {
                clickedButton.classList.add("active");
            }
        }
    }

    menueWrap5.appendChild(infoImg);
    menueWrap5.appendChild(infoText);
    configMenue4.appendChild(menueWrap5);

    // event listener for mouse up click (drop)
    document.addEventListener('mouseup', function() {
        if (raycaster.composer.highlightedObjects.length > 0 && draggedItem) changeSelectedModule(scene, draggedItem, raycaster.composer.highlightedObjects[0]);
        
        draggedItem = null;
        raycaster.dragIcon.style.visibility = "hidden";
    });

    // delete button event listener
    var buttonDelete = raycaster.deleteButton.button;

    raycaster.deleteButton.button.addEventListener('click', function () {
        if (raycaster.composer.selectedObjects.length > 0) {
            changeSelectedModule(scene, buttonDelete, raycaster.composer.selectedObjects[0]);
        }

        raycaster.deleteButton.clickedObj = null;
    });

    // module select event listener for menue activation
    raycaster.renderer.domElement.addEventListener("click", function(event){
        var activeModule = raycaster.composer.selectedObjects[0];
        
        if (activeModule) {
            if (activeModule.name == "Roof_Panel" || activeModule.name == "Roof_Panel_LED") {
                setMenueState(configMenue2, true);
                setMenueState(configMenue3, false);
            }
            else {
                setMenueState(configMenue2, false);
                setMenueState(configMenue3, true);
            }
        }
        else {
            setMenueState(configMenue2, false);
            if (isVisible) {
                setMenueState(configMenue3, false);
            }
        }
    });

    // adjust camera fov
    function cameraUpdate (unitCount, loop, targetCam) {
        if (unitCount > 0 && unitCount < 16) camera.fov = 30 + unitCount;
        camera.updateProjectionMatrix();
        if (targetCam) loop.target = targetCam.position;
    }

    // reconstruct model after configuration changes
    function reloadScene(scene, configurator, clonedObjects, sceneObject, loop, appClassName, backgroundColor, configMenueContent, controls, camera, raycaster) {
        var sceneGroup = scene.getObjectByName("Scene");
    
        // clear scene
        for (let i = sceneGroup.children.length - 1; i >= 0; i--) {
            if (sceneGroup.children[i].name != "Constructor")
                sceneGroup.remove(sceneGroup.children[i]);
        }

        raycaster.deleteButton.clickedObj = null;

        // update json structure
        for (let index = 0; index < configurator.columns.length; index++) {
            // renaming the columns in json
            configurator.columns[index].id = index;
        }

        // make an overwrite for last two roof tiles with lamps count according to array length
        if (configurator.columns.length % 2 === 0) {
            configurator.columns[configurator.columns.length-1].lamp = true;
        }
        else {
            if (configurator.columns.length > 2) {
                configurator.columns[configurator.columns.length-2].lamp = true;
                configurator.columns[configurator.columns.length-1].lamp = false;
            }
        }

        // reset camera buttons
        cameraButtonUI(null);
        isVisible = true;
    
        constructPREFAB(scene, configurator, clonedObjects, sceneObject, loop, appClassName, backgroundColor, configMenueContent, controls, camera, raycaster);
    }

    // function for deleting and changing selected modules
    function changeSelectedModule(scene, pressedButton, selectedModule) {
        // change selected object to menue item
        if (selectedModule) {
            var rotation = selectedModule.rotation;
            var scale = selectedModule.scale;
            var newModule;

            // get module type from pressed button
            switch (pressedButton) {
                case buttonWall: newModule = scene.getObjectByName("Wall_Panel"); break;
                case buttonDoor: newModule = scene.getObjectByName("Door_Panel"); break;
                case buttonWindow: newModule = scene.getObjectByName("Window_Panel"); break;
                case buttonStudio: newModule = scene.getObjectByName("Studio_Panel"); break;
                case buttonRoof: newModule = scene.getObjectByName("Roof_Panel"); break;
                case buttonRoofLed: newModule = scene.getObjectByName("Roof_Panel_LED"); break;
                case buttonDelete: newModule = scene.getObjectByName("Inner"); break;
                default: newModule = null; break;
            }

            // change roof panels
            if (selectedModule.name == "Roof_Panel" || selectedModule.name == "Roof_Panel_LED") {
                if (pressedButton == buttonRoof || pressedButton == buttonRoofLed) {
                    // add new module at selected objects position
                    addObject(newModule, selectedModule.position, scene, clonedObjects, scale, rotation, selectableObjects, selectedModule.jsonPos);
                    roofTiles.push(clonedObjects[clonedObjects.length-1]);

                    // write changes to json
                    var newState;

                    switch (pressedButton) {
                        case buttonRoof: newState = false; break;
                        case buttonRoofLed: newState = true; break;
                    }

                    if (selectedModule.jsonPos) {
                        var target = selectedModule.jsonPos;
            
                        configurator.columns[target[0]].lamp = newState;
                    }

                    deleteSelectedModule();
                }
            }
            else {
                // change wall panels
                if (pressedButton == buttonWall || pressedButton == buttonDoor || pressedButton == buttonWindow || pressedButton == buttonStudio || pressedButton == buttonDelete) {
                    var newName;

                    switch (pressedButton) {
                        case buttonWall: newName = "wall"; break;
                        case buttonDoor: newName = "door"; break;
                        case buttonWindow: newName = "window"; break;
                        case buttonStudio: newName = "bigWindow"; break;
                        case buttonDelete: newName = "inner"; break;
                        default: newName = ""; break;
                    }
                    
                    // check if selected panel is outer panel (delete only possible for inner panels)
                    if (pressedButton == buttonDelete) {
                        if (checkIfOuterPanel(selectedModule, configurator) == false) {
                            newModule = scene.getObjectByName("Inner");
                            newName = "inner";
                        }
                        else {
                            newModule = scene.getObjectByName("Wall_Panel");
                            newName = "wall";
                        }
                    }
                    
                    // add new module at selected objects position
                    addObject(newModule, selectedModule.position, scene, clonedObjects, scale, rotation, selectableObjects, selectedModule.jsonPos);

                    // write all outer wall tiles to array
                    if (checkIfOuterPanel(clonedObjects[clonedObjects.length-1], configurator) == true) {
                        outerWallTiles.push(clonedObjects[clonedObjects.length-1]);
                    }

                    // write changes to json                    
                    if (selectedModule.jsonPos) {
                        var target = selectedModule.jsonPos;
            
                        configurator.columns[target[0]].cells[target[1]].walls[target[2]] = newName;
                    }

                    deleteSelectedModule();
                }
            }

            setMenueState(configMenue2, false);
            if (isVisible) {
                setMenueState(configMenue3, false);
            }
            raycaster.deleteButton.clickedObj = null;
            raycaster.composer.selectedObjects = [];        
        }

        function deleteSelectedModule() {
            // update list of selectable object in scene
            var index = selectableObjects.findIndex(function(x) { 
                return x.uuid == selectedModule.uuid;
            });

            selectableObjects.splice(index, 1);

            // remove old object mesh
            for (let i = selectedModule.children.length - 1; i >= 0; i--) {
                selectedModule.remove(selectedModule.children[i]);
            }
            scene.remove(selectedModule);
        }
    }

    // function for making menues passive/active
    function setMenueState(menueElement, setPassive) {
        if (setPassive == true) menueElement.classList.add("passive");
        else menueElement.classList.remove("passive");
    }

    // build all menue elements together in one box (configMenue)
    configMenueWrap.appendChild(configMenue4);
    configMenueWrap.appendChild(configMenue3);
    configMenueWrap.appendChild(configMenue2);
    configMenueWrap.appendChild(configMenue);

    appContainer.appendChild(configMenueWrap);
}

function checkIfOuterPanel (module, configurator) {
    var targetPanel = module.jsonPos;

    // check for first row
    if (targetPanel[0] == 0) {
        if (targetPanel[1] == 0) {
            if (targetPanel[2] == 0) return true;
            else if (targetPanel[2] == 3) return true;
            else return false;
        }
        else if (targetPanel[1] == 1) {
            if (targetPanel[2] == 3) return true;
            else return false;
        }
        else if (targetPanel[1] == 2) {
            if (targetPanel[2] == 2) return true;
            else if (targetPanel[2] == 3) return true;
            else return false;
        }
        else return false;
    }
    // check for last row
    else if (targetPanel[0] == configurator.columns.length-1) {
        if (targetPanel[1] == 0) {
            if (targetPanel[2] == 0) return true;
            else if (targetPanel[2] == 1) return true;
            else return false;
        }
        else if (targetPanel[1] == 1) {
            if (targetPanel[2] == 1) return true;
            else return false;
        }
        else if (targetPanel[1] == 2) {
            if (targetPanel[2] == 1) return true;
            else if (targetPanel[2] == 2) return true;
            else return false;
        }
        else return false;
    }
    // check else
    else {
        if (targetPanel[1] == 0) {
            if (targetPanel[2] == 0) return true;
            else return false;
        }
        else if (targetPanel[1] == 2) {
            if (targetPanel[2] == 2) return true;
            else return false;
        }
        else return false;
    }
}

export { constructPREFAB };