import './topregal_3d_viewer/src/css/viewer-classes.css';
import Engine from './topregal_3d_viewer/src/system/Engine.js';
import { RackManager } from './topregal_3d_viewer/src/components/rack-manager.js';

// load configuration and model via Webpack imports
import lampRackConfig from './rack-config.json';
import lrConfigUrl from './lr-config.glb';

// 初始化并渲染货架配置
const engine = new Engine({
  appClassName: '#app',
  modalSelector: '#app',
  mainDir: '',
  fileName: lrConfigUrl,
  backgroundColor: '#ffffff',
  tooltipContent: [],
  configText: [],
  viewerWidth: window.innerWidth,
  viewerHeight: window.innerHeight,
  configurator: null,
  videoContent: [],
  configMenueContent: []
});

// Initialize rack manager for dynamic configuration
let rackManager;

// Load model with configuration then start rendering loop
engine.load(lampRackConfig)
  .then(() => {
    engine.start();
    // Initialize rack manager after engine is loaded with the initial configuration
    rackManager = new RackManager(engine, lampRackConfig);
    console.log('3D Viewer loaded successfully with rack management interface');
  })
  .catch(e => console.error("模型加载失败:", e));
