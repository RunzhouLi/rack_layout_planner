import { Vector2 } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { CustomBlending } from "three";


class Composer {
    constructor(scene, camera, renderer, loop) {
        this.scene = scene,
        this.camera = camera,
        this.renderer = renderer,
        this.loop = loop,
        this.selectedObjects = [],
        this.highlightedObjects = [],
        this.outlinePass = null,
        this.outlinePassThin = null,
        this.effectComposer = null,
        this.renderPass = null,
        this.effectFXAA = null,
        this.bokehPass = null
    }

    init () {
        var outlineColor = "rgb(255, 50, 0)";

        this.renderer.toneMappingExposure = 0;

        // add effect composer
        this.effectComposer = new EffectComposer(this.renderer);
        this.effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // add render pass
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.effectComposer.addPass(this.renderPass);

        // add outline pass for selected modules
        this.outlinePass = new OutlinePass(new Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
        this.outlinePass.renderToScreen = true;
        var params = {
            edgeStrength: 4,
            edgeThickness: 4,
        };
        this.outlinePass.overlayMaterial.blending = CustomBlending;
        
        this.outlinePass.edgeStrength = params.edgeStrength;
        this.outlinePass.edgeGlow = params.edgeGlow;
        this.outlinePass.visibleEdgeColor.set(outlineColor);
        this.outlinePass.hiddenEdgeColor.set(outlineColor);
        this.effectComposer.addPass(this.outlinePass);

        // add outline pass for hovered modules
        this.outlinePassThin = new OutlinePass(new Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
        this.outlinePassThin.renderToScreen = true;
        
        var params2 = {
            edgeStrength: 4,
            edgeThickness: 1,
        };

        this.outlinePassThin.overlayMaterial.blending = CustomBlending;
        this.outlinePassThin.edgeStrength = params2.edgeStrength;
        this.outlinePassThin.edgeGlow = params2.edgeGlow;
        this.outlinePassThin.visibleEdgeColor.set(outlineColor);
        this.outlinePassThin.hiddenEdgeColor.set(outlineColor);
        this.effectComposer.addPass(this.outlinePassThin);

        // add composer to loop
        this.loop.composer = this.effectComposer;

        // add gamma correction
        // const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
        // this.effectComposer.addPass(gammaCorrectionPass);
    }

    // draw outline on selected object
    setObject () {
        if (this.selectedObjects) {
            this.outlinePass.selectedObjects = this.selectedObjects;
        }
        else {
            this.outlinePass.selectedObjects = null;
        }
    }

    // draw highlight on selected object
    highlightObject () {
        if (this.highlightedObjects) {
            this.outlinePassThin.selectedObjects = this.highlightedObjects;
        }
        else {
            this.outlinePassThin.selectedObjects = null;
        }
    }

    // clear all outline effects
    clearObject () {
        this.selectedObjects = [];
        this.highlightedObjects = [];
        this.setObject();
        this.highlightObject();
    }
}

export { Composer };