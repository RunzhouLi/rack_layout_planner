import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { RepeatWrapping, FloatType, TextureLoader, SRGBColorSpace, CircleGeometry } from "three";
import { Color, Mesh, PMREMGenerator, PlaneGeometry, ShadowMaterial, Vector3, Box3, VideoTexture, MeshBasicMaterial, FrontSide } from 'three';
import canvasBgtUrl from '../../../canvas-bgt.png';
import envmapHdrUrl from '../../../envmap.hdr';
import { addAnnotations } from "./annotations.js";
import { createColorMenue } from "./colorpicker.js";
import { createSlider } from "./slider.js";
import { createConfigurator } from "./configurator.js";
import { constructModel } from "./model-constructor.js";


// wait until model has been fully loaded
function modelLoader(fileName, loadingScreen, mainDir) {
    const loader = new GLTFLoader(loadingScreen).setPath(mainDir);

    return new Promise((resolve, reject) => {
        loader.load(fileName, data => resolve(data), null, reject);
    });
}

// load gltf model and annotation coordinates
async function loadModel(scene, renderer, loadingScreen, camera, loop, controls, mainDir, fileName, tooltipContent, appClassName, backgroundColor, configText, configurator, clonedObjects, videoContent, configMenueContent, composer, raycaster) {
    const pmremGenerator = new PMREMGenerator(renderer);
    var envMap = null;
    var colormenue = null;

    pmremGenerator.compileEquirectangularShader();

    // load environment map for scene lighting and realistic material reflections
    // load environment map with manager
    new RGBELoader(loadingScreen)
        .setDataType(FloatType)
        .load(envmapHdrUrl, function (texture) {
            envMap = pmremGenerator.fromEquirectangular(texture).texture;

            // to make the environment map visible, set it as scene background (scene.background = envMap;)
            scene.environment = envMap;
            texture.dispose();
            pmremGenerator.dispose();
        });

    // add ground
    const bgLoader = new TextureLoader(loadingScreen);
    var groundTexture = bgLoader.load(canvasBgtUrl);
    groundTexture.wrapS = RepeatWrapping;
    groundTexture.wrapT = RepeatWrapping;
    groundTexture.repeat.set( 12, 12 );

    const groundMaterial = new MeshBasicMaterial( { map: groundTexture, side: FrontSide, toneMapped: false, transparent: true } );
    groundMaterial.needsUpdate = true;

    const ground = new Mesh(new PlaneGeometry(32, 32), groundMaterial);

    ground.rotation.x = - Math.PI / 2;
    ground.receiveShadow = false;
    ground.castShadow = false;
    ground.name = "waterMark";

    scene.add(ground);

    const shadowCatcher = new Mesh(new PlaneGeometry(32, 32), new ShadowMaterial( { opacity: 0.08 } ));

    shadowCatcher.rotation.x = - Math.PI / 2;
    shadowCatcher.position.y += 0.01;
    shadowCatcher.receiveShadow = true;
    shadowCatcher.castShadow = false;
    shadowCatcher.name = "shadowCatcher";

    scene.add(shadowCatcher);

    // load object
    const gltf = await modelLoader(fileName, loadingScreen, mainDir);
    var markerArray = [];

    // go through every object in the scene
    gltf.scene.traverse(function (object) {
        if (object.isMesh) {
            // make sure every object in the scene casts shadows (sometimes not working out of the box)
            object.castShadow = true;
        
            // 
            if (object.material.name === "Video_wide" || object.material.name === "Video_tall") {
                const video = document.createElement('video');
                const filteredArray = videoContent.filter(function (el) {
                    return el != null;
                });

                if (object.material.name === "Video_wide") {
                    video.src = searchForVideo("video_wide");
                }
                else if (object.material.name === "Video_tall") {
                    video.src = searchForVideo("video_tall");
                }

                function searchForVideo (videoName) {
                    if (filteredArray.length > 0) {
                        for (let i = 0; i < filteredArray.length; i++) {
                            if (filteredArray[i].includes(videoName)) {
                                return filteredArray[i];
                            }
                        }
                    }
                }
                
                const videoTexture = new VideoTexture(video);

                if (object.material.name === "Video_tall") {
                    videoTexture.wrapS = RepeatWrapping;
                    videoTexture.repeat.x = 0.4;
                }

                videoTexture.needsUpdate = true;

                const videoMaterial =  new MeshBasicMaterial( { map: videoTexture, side: FrontSide, toneMapped: false } );

                object.material = videoMaterial;
                object.material.needsUpdate = true;

                video.controls = "true";
                video.loop = "true";
                video.play();
            }
        }

        // look for configurable materials and when they exist, call colorpicker configurator
        if (object.name === "Palette") colormenue = createColorMenue(gltf.scene, configText);

        // load blender coordinates of the annotations
        if (object.name.includes("Marker")) markerArray.push(object);

        // initially move to default cam position if it exist
        if (object.name === "Kamera") {
            var targetCam = object;
            if (targetCam) loop.target = targetCam.position;
        }

        // if loaded file is a configuration visualization, start construction
        if (object.name === "Constructor" && configurator && configurator.type) {
            constructModel(
              gltf.scene,
              configurator,
              clonedObjects,
              scene,
              loop,
              backgroundColor,
              appClassName,
              configMenueContent,
              controls,
              camera,
              raycaster,
              composer
            );
        }
    });

    // sort marker array in alphabetical order (ascending)
    function compare(a, b) {
        if (a.name < b.name){
            return -1;
        }
        if (a.name > b.name){
            return 1;
        }
        return 0;
    }
    if (markerArray != null) markerArray.sort(compare);

    // catch old version with empty marker objects
    if (markerArray.length == 1 && markerArray[0].type == "Object3D") {
        var marker = gltf.scene.getObjectByName("Marker");
        markerArray = [];

        if (marker) {
            marker.children.sort(compare);

            marker.children.forEach(function (item) {
                markerArray.push(item);
            });
        }
    }

    // make slider control possible for all slider-animations
    if (gltf.animations.length > 0) createSlider(loop, gltf, camera, controls, appClassName);

    // fix controls pivot to middle of object and adjust camera to show whole model
    var pivot = gltf.scene.getObjectByName("Pivot");
    var box = new Box3().setFromObject(gltf.scene);
    var height = box.getSize(new Vector3(0, 0, 0)).y;
    var width = box.getSize(new Vector3(0, 0, 0)).x;
    var length = box.getSize(new Vector3(0, 0, 0)).z;
    var size = height + width + length;

    // if pivot object is found in scene - set orbit center, else set it manually
    if (pivot != null) {
        pivot = pivot.position;
    }
    else {
        pivot = new Vector3(0, height / 2, 0);
    }

    controls.target.set(pivot.x, pivot.y, pivot.z);

    // set camera position deepending on object size
    camera.position.set(-4, 1, size / 2);
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);

    // add Annotations to scene (load blender coordinates)
    var displayedNumber = 1;

    // create headerinfobox
    var headerInfobox = document.createElement("div");
    var videoTooltip = document.createElement("video");
    var videoLoader = document.createElement("div");

    headerInfobox.id = "headerInfobox";
    videoTooltip.classList.add("video-tooltip");
    videoLoader.id = "videoloader";
    videoLoader.style.display = "none";  // hide unused video loader

    headerInfobox.appendChild(videoLoader);
    headerInfobox.appendChild(videoTooltip);

    document.querySelector(appClassName).appendChild(headerInfobox);

    // create configurator sidebar
    if (configText.length > 0) createConfigurator(colormenue, scene, gltf.animations, appClassName, backgroundColor, configText, headerInfobox);

    markerArray != [] ? setMarkerArray(markerArray, displayedNumber, renderer, camera, pivot, loop, tooltipContent, appClassName, controls, videoContent) : false;
    scene.add(gltf.scene);

    return gltf;
}

// add annotations to all marker array positions
function setMarkerArray(markerArray, displayedNumber, renderer, camera, pivot, loop, tooltipContent, appClassName, controls, videoContent) {
    var annotationContainer = document.createElement("div");

    annotationContainer.id = "annotations";
    document.querySelector(appClassName).appendChild(annotationContainer);

    for (var i = 0; i < markerArray.length; i++) {
        if (tooltipContent[i] != "") {
            addAnnotations(i, displayedNumber, markerArray[i].position, renderer, camera, markerArray, pivot, loop, tooltipContent, controls, annotationContainer, videoContent);
            displayedNumber++;
        }
    };
}

export { loadModel };