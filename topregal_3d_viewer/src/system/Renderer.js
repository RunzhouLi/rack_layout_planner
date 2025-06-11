import { VSMShadowMap, WebGLRenderer } from "three";
import { ReinhardToneMapping } from "three";


// renderer setup for device screen size with color encoding
function createRenderer(viewerWidth, viewerHeight) {
       const renderer = new WebGLRenderer({ antialias: false });
       
       renderer.setPixelRatio(window.devicePixelRatio);
       renderer.setSize(viewerWidth, viewerHeight);
       renderer.shadowMap.enabled = true;
       renderer.shadowMap.type = VSMShadowMap;
       renderer.toneMapping = ReinhardToneMapping;
       renderer.toneMappingExposure = 2;

       return renderer;
}

export { createRenderer };