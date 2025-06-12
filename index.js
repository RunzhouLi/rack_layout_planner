import './topregal_3d_viewer/src/css/viewer-classes.css';
// import configurator styles
import './topregal_3d_viewer/src/css/config-menue.css';
import './topregal_3d_viewer/src/css/media-queries.css';
import './topregal_3d_viewer/src/css/annotations.css';
import './topregal_3d_viewer/src/css/animation-slider.css';
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

// 仓库墙壁可见性模式控制
// true: 手动逻辑判断 (只显示距离相机最远的两面墙)
// false: 自动视锥体剔除 (让所有墙壁可见，依靠Three.js自动处理)
window.warehouseVisibilityMode = true; // 默认使用手动判断模式

// 切换仓库墙壁可见性模式的全局函数
window.toggleWarehouseVisibility = function() {
  window.warehouseVisibilityMode = !window.warehouseVisibilityMode;
  if (engine) {
    engine.setWarehouseVisibilityMode(window.warehouseVisibilityMode);
  }
  console.log(`仓库墙壁可见性模式已切换为: ${window.warehouseVisibilityMode ? '手动逻辑判断' : '自动视锥体剔除'}`);
};

// Load model with configuration then start rendering loop
engine.load(lampRackConfig)
  .then(() => {
    engine.start();
    // Load warehouse scene
    return engine.loadWarehouse('./warehouse-config.json');
  })
  .then(() => {
    // Initialize rack manager after engine is loaded with the initial configuration
    rackManager = new RackManager(engine, lampRackConfig);
    
    // 设置初始的仓库墙壁可见性模式
    engine.setWarehouseVisibilityMode(window.warehouseVisibilityMode);
    
    console.log('3D Viewer loaded successfully with rack management interface and warehouse scene');
    console.log(`当前仓库墙壁可见性模式: ${window.warehouseVisibilityMode ? '手动逻辑判断' : '自动视锥体剔除'}`);
    console.log('使用 toggleWarehouseVisibility() 函数切换可见性模式');

    // Add collapse/expand functionality to the controls-panel
    const controlsPanel = document.querySelector('.controls-panel');
    if (controlsPanel) {
        const panelHeader = controlsPanel.querySelector('h3');

        if (panelHeader) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'panel-toggle-button';
            toggleBtn.title = '展开/折叠面板';
            toggleBtn.innerHTML = '▼';

            panelHeader.style.display = 'flex';
            panelHeader.style.justifyContent = 'space-between';
            panelHeader.style.alignItems = 'center';
            panelHeader.appendChild(toggleBtn);

            const togglePanel = () => {
                const isClosed = controlsPanel.classList.toggle('closed');
                toggleBtn.innerHTML = isClosed ? '▶' : '▼';
            };

            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                togglePanel();
            });

            panelHeader.style.cursor = 'pointer';
            panelHeader.addEventListener('click', (e) => {
                if (e.target === panelHeader) {
                    togglePanel();
                }
            });
        }
    }
  })
  .catch(e => console.error("模型加载失败:", e));
