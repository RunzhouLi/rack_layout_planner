import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Vector3 } from "three";


// import and setup viewer orbit controls like zoooming, turning, panning
function createControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);

    // 放宽距离与极角限制，使相机可以自由环绕
    controls.minDistance = 1;
    controls.maxDistance = 500;
    controls.minPolarAngle = 0.1;             // 略高于竖直向上，防止极端抖动
    controls.maxPolarAngle = Math.PI / 2;     // 仅能看到物体上方及水平，不可转到下方

    controls.target.set(0, 2.5, 0);
    controls.enablePan = true;
    controls.panSpeed = 1.0;
    controls.screenSpacePanning = true;
    // 默认关闭自动旋转，可在 UI 中开启
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.35;
    controls.enableDamping = true;
    controls.tick = () => controls.update();

    // 可选：如需限制平移范围，可在此根据场景包围盒动态计算

    return controls;
}

export { createControls };