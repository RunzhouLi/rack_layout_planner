import { constructPR } from "../components/model-constructor-pr.js";
import { constructMFW } from "../components/model-constructor-mfw.js";
import { constructPREFAB } from "../components/model-constructor-prefab.js";
import { constructLR } from "../components/model-constructor-lr.js";
import { constructPC } from "../components/model-constructor-pc.js";


function constructModel(scene, configurator, clonedObjects, sceneObject, loop, backgroundColor, appClassName, configMenueContent, controls, camera, raycaster, composer) {
    // make construction parts invisible
    scene.traverse(function(object) {
        if (object.isMesh && object.name != "waterMark") {
            object.visible = false;
        }
    });

    clonedObjects = [];

    // build mfw1000 from json file
    if (configurator.type === "mfw1000") {
        constructMFW(scene, configurator, clonedObjects, sceneObject, loop);
    }
    
    // build pr shelf from json file
    if (configurator.type === "pr") {
        constructPR(scene, configurator, clonedObjects, sceneObject, loop);
    }

    // build prefab office from json file
    if (configurator.type === "prefab") {
        // start composer
        composer.init();
        raycaster.init();
        constructPREFAB(scene, configurator, clonedObjects, sceneObject, loop, appClassName, backgroundColor, configMenueContent, controls, camera, raycaster, composer);
    }

    // build lr shelf from json file
    if (configurator.type === "lr") {
        constructLR(scene, configurator, clonedObjects, sceneObject, loop);
    }

    // build parking lot canopy from json file
    if (configurator.type === "pc") {
        constructPC(scene, configurator, clonedObjects, sceneObject, loop, appClassName, backgroundColor, configMenueContent, controls, camera);
    }
}

export { constructModel };