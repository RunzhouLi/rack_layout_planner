import { Fog, Color } from 'three';


// add a fog to the scene
function addFog(scene, fogColor, fogStart, fogEnd) {
    scene.background = new Color(fogColor);
    scene.fog = new Fog(fogColor, fogStart, fogEnd);
}

export { addFog };