// import other three.js libraries for additional functions (model loader, mouse controls, labels etc.)
import { createRenderer } from "./Renderer.js";
import { Loop } from "./Loop.js";
import { Raycast } from "./Raycast.js";

// import three.js features as modules
import { createCamera } from "../components/camera.js";
import { createControls } from "../components/controls.js";
import { createScene } from "../components/scene.js";
import { loadApp } from "../components/loading-screen.js";
import { loadModel } from "../components/model-loader.js";
import { createLight } from "../components/light.js";
import { constructModel } from "../components/model-constructor.js";
import { windowResize } from "../components/windowResize.js";
import { Composer } from "../system/Composer.js";


export default class Engine {
    constructor(params) {
        this.appClassName = params.appClassName;
        this.modalSelector = params.modalSelector;
        this.mainDir = params.mainDir;
        this.fileName = params.fileName;
        this.backgroundColor = params.backgroundColor;
        this.tooltipContent = params.tooltipContent;
        this.configText = params.configText;
        this.viewerWidth = params.viewerWidth;
        this.viewerHeight = params.viewerHeight;
        this.configurator = params.configurator;
        this.videoContent = params.videoContent;
        this.configMenueContent = params.configMenueContent;

        // setup camera & scene objects from modules (make a comment to deactivate module)
        this.camera = createCamera(this.viewerWidth, this.viewerHeight);
        this.scene = createScene(this.appClassName);
        this.renderer = createRenderer(this.viewerWidth, this.viewerHeight);
        this.controls = createControls(this.camera, this.renderer);
        this.loadingScreen = loadApp(this.modalSelector);
        this.loop = new Loop(this.camera, this.scene, this.renderer, this.controls, this.viewerWidth, this.viewerHeight, this.appClassName);
        this.light = createLight(this.scene);
        this.renderWindow = document.querySelector(this.appClassName);
        this.composer = new Composer(this.scene, this.camera, this.renderer, this.loop);
        this.raycaster = new Raycast(this.scene, this.camera, this.composer, this.renderer, this.loop);
        this.windowResize = windowResize(this.camera, this.renderer, this.renderWindow, this.viewerWidth, this.viewerHeight, this.composer);

        // build dom with renderer and annotations
        document.querySelector(this.appClassName).appendChild(this.renderer.domElement);

        // event listener for control interactions
        this.controls.addEventListener("start", this.cancel.bind(this), false);
        this.controls.addEventListener("end", this.pause.bind(this), false);

        // push controls to the loop function
        this.loop.updatables.push(this.controls);
    }

    // start main animation/ update loop
    start() {
        this.loop.start();
    }

    // stop main animation/ update loop
    stop() {
        this.loop.stop();
    }

    // pause orbit controls
    pause() {
        this.controls.autoRotate = false;
    }

    // cancel the automatic cam tween
    cancel() {
        this.loop.target = null;
    }

    load(configurator) {
        // load the model file into the scene
        if (!this.model) {
            this.model = loadModel(
                this.scene,
                this.renderer,
                this.loadingScreen,
                this.camera,
                this.loop,
                this.controls,
                this.mainDir,
                this.fileName,
                this.tooltipContent,
                this.appClassName,
                this.backgroundColor,
                this.configText,
                configurator,
                this.clonedObjects = [],
                this.videoContent,
                this.configMenueContent,
                this.composer,
                this.raycaster
            );
        }
        // for the configurator visualisation reload the json into the scene after something has changed
        else if (this.model && this.configurator) {
            this.clearSceneObjects();
            constructModel(this.scene, configurator, this.clonedObjects, this.scene, this.loop, this.backgroundColor, this.configMenueContent, this.controls, this.camera, this.raycaster, this.composer);
        }

        // resize scene
        this.camera.aspect = this.renderWindow.clientWidth / this.viewerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.renderWindow.clientWidth, this.viewerHeight);

        return this.model;
    }

    // Clear scene objects (helper method)
    clearSceneObjects() {
        var sceneGroup = this.scene.getObjectByName("Scene");
        if (sceneGroup) {
            for (let i = sceneGroup.children.length - 1; i >= 0; i--) {
                if (sceneGroup.children[i].name != "Constructor")
                    sceneGroup.remove(sceneGroup.children[i]);
            }
        }
        // Clear cloned objects array
        this.clonedObjects = [];
    }

    // Clear entire scene for rebuilding
    clearScene() {
        this.clearSceneObjects();
    }

    // Load new configuration
    loadConfiguration(configurator) {
        this.configurator = configurator;
        if (this.model) {
            this.clearSceneObjects();
            constructModel(this.scene, configurator, this.clonedObjects, this.scene, this.loop, this.backgroundColor, this.configMenueContent, this.controls, this.camera, this.raycaster, this.composer);
        }
    }
}