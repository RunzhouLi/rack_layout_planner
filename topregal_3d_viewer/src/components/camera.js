import { PerspectiveCamera } from 'three';


function createCamera(viewerWidth, viewerHeight) {
    const camera = new PerspectiveCamera(
        40, // fov = field of view
        viewerWidth / viewerHeight, // aspect ratio (dummy value)
        0.1, // near clipping plane
        100, // far clipping plane
    );

    // move the camera back to view the scene
    camera.defaultPos = camera.position.set(-4, 1, 8);
    camera.lookAt(0, 0, 0);

    return camera;
}

export { createCamera };