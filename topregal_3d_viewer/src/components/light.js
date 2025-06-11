import { DirectionalLight, AmbientLight, CameraHelper } from "three";


// adds scene lighting and shadows
function createLight(scene) {
    // adds directional light for shadow casting
    const dirLight = new DirectionalLight(0xeeeeee, 3);
    dirLight.name = 'dirLight';
    var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    var screenHeight = (window.innerHeight > 0) ? window.innerHeight : screen.height;
    var res = 1024;

    dirLight.position.set(-1, 12, -1);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 64;
    dirLight.shadow.camera.bottom = - 64;
    dirLight.shadow.camera.left = - 64;
    dirLight.shadow.camera.right = 64;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 64;
    dirLight.shadow.radius = 4;
    dirLight.shadow.color = 0x111111;
    dirLight.shadow.bias = -0.0001;
    dirLight.shadow.blurSamples = 24;
    dirLight.shadow.mapSize.width = res;
    dirLight.shadow.mapSize.height = res;

    // adds additional ambient light for better scene illumination
    const ambiLight = new AmbientLight(0xdddddd, 2);
    ambiLight.name = 'ambiLight';

    scene.add(dirLight, ambiLight);

    return [dirLight, ambiLight];
}

export { createLight };