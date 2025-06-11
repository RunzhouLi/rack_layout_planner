import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Vector3 } from "three";


// import and setup viewer orbit controls like zoooming, turning, panning
function createControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);

    controls.minDistance = 2;
    controls.maxDistance = 20;
    controls.minPolarAngle = 0.1;
    controls.maxPolarAngle = 1.58;
    controls.target.set(0, 2.5, 0);
    controls.enablePan = true;
    controls.panSpeed = 0.5;
    controls.screenSpacePanning = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    controls.enableDamping = true;
    controls.tick = () => controls.update();

    // limit panning of the orbit controls
    var minPan = new Vector3(-2, -2, -2);
    var maxPan = new Vector3(2, 2, 2);
    var _v = new Vector3();

    controls.addEventListener("change", function() {
        _v.copy(controls.target);
        controls.target.clamp(minPan, maxPan);
        _v.sub(controls.target);
        camera.position.sub(_v);
    });

    return controls;
}

export { createControls };