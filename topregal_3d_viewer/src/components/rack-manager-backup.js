class RackManager {
    constructor(engine, initialConfig = null) {
        this.engine = engine;
        this.rackGroups = [];
        this.nextRackId = 1;
        
        this.initializeUI();
        if (initialConfig) {
            this.loadInitialConfiguration(initialConfig);
        } else {
            this.initializeDefaultConfig();
        }
    }

    initializeUI() {
        // Get UI elements
        this.positionXInput = document.getElementById('positionX');
        this.positionZInput = document.getElementById('positionZ');
        this.rackUnitsInput = document.getElementById('rackUnits');
        this.unitWidthSelect = document.getElementById('unitWidth');
        this.doubleSidedCheckbox = document.getElementById('doubleSided');
        this.depthSelect = document.getElementById('rackDepth');
        this.addRackBtn = document.getElementById('addRackBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.rackList = document.getElementById('rackList');

        // Add event listeners
        this.addRackBtn.addEventListener('click', () => this.addRackGroup());
        this.clearAllBtn.addEventListener('click', () => this.clearAllRacks());
        
        // Auto-calculate next position
        this.positionZInput.addEventListener('input', () => {
            this.updateNextPosition();
        });
        
        // Initialize layout management controls
        this.addLayoutControls();
    }

    loadInitialConfiguration(config) {
        // 解析配置中的count属性，展开units
        const parsedConfig = this.parseConfiguration(config);
        this.baseConfig = parsedConfig;
        this.rackGroups = parsedConfig.rackGroups || [];
        
        // Add IDs to existing groups if they don't have them
        this.rackGroups.forEach((group, index) => {
            if (!group.id) {
                group.id = index + 1;
            }
        });
        this.nextRackId = this.rackGroups.length + 1;
        this.updateRackList();
        this.updateNextPosition();
        
        console.log('配置解析完成，支持count属性批量生成units:', parsedConfig);
    }

    initializeDefaultConfig() {
        this.baseConfig = {
            type: "lr",
            doubleSided: true,
            depth: 120,
            rackGroups: []
        };
        this.rackGroups = [];
    }

    createRackUnit(width, height = 400) {
        return {
            width: width,
            height: height,
            shelves: [
                { deck: "empty" },
                { deck: "empty" }
            ]
        };
    }

    addRackGroup() {
        const unitCount = parseInt(this.rackUnitsInput.value) || 7;
        const unitWidth = parseInt(this.unitWidthSelect.value) || 220;
        const doubleSided = this.doubleSidedCheckbox ? this.doubleSidedCheckbox.checked : false;
        const depth = this.depthSelect ? parseInt(this.depthSelect.value) || 120 : 120;
        
        // 使用count属性创建单个unit
        const unit = this.createRackUnit(unitWidth);
        unit.count = unitCount;

        // Create new rack group with initial position (will be managed by layout manager)
        const rackGroup = {
            id: this.nextRackId++,
            offsetX: 0, // 初始位置，将由布局管理器控制
            offsetZ: 0,
            units: [unit], // 使用带count属性的单个unit
            doubleSided: doubleSided,
            depth: depth
        };

        this.rackGroups.push(rackGroup);
        
        // 使用布局管理器自动计算位置
        this.layoutManager.addRackGroup(rackGroup);
        
        this.updateConfiguration();
        this.updateRackList();
        console.log('货架组已添加，布局管理器已自动分配位置:', rackGroup);
    }

    removeRackGroup(id) {
        this.rackGroups = this.rackGroups.filter(group => group.id !== id);
        this.layoutManager.removeRackGroup(id);
        this.updateConfiguration();
        this.updateRackList();
    }

    clearAllRacks() {
        this.rackGroups = [];
        this.nextRackId = 1;
        this.layoutManager = new LayoutManager({
            layoutType: this.layoutManager.layoutType,
            spacing: this.layoutManager.spacing,
            origin: this.layoutManager.origin
        });
        this.updateConfiguration();
        this.updateRackList();
    }

    updateNextPosition() {
        // Auto-calculate next position based on existing racks
        if (this.rackGroups.length > 0) {
            const maxZ = Math.max(...this.rackGroups.map(group => group.offsetZ));
            this.positionZInput.value = maxZ + 5; // 5 meters apart
        } else {
            this.positionZInput.value = 0;
        }
    }

    updateRackList() {
        this.rackList.innerHTML = '';
        
        if (this.rackGroups.length === 0) {
            this.rackList.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">No rack groups added</div>';
            return;
        }

        this.rackGroups.forEach(group => {
            const rackItem = document.createElement('div');
            rackItem.className = 'rack-item';
            
            // Calculate total units (accounting for count property)
            const totalUnits = group.units.reduce((total, unit) => {
                return total + (unit.count || 1);
            }, 0);
            
            const rackInfo = document.createElement('div');
            rackInfo.className = 'rack-info';
            rackInfo.innerHTML = `
                <strong>Rack ${group.id}</strong><br>
                Position: (${group.offsetX}, ${group.offsetZ})m<br>
                Units: ${totalUnits}<br>
                Double Sided: ${group.doubleSided ? 'Yes' : 'No'}<br>
                Depth: ${group.depth}cm
            `;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn btn-danger btn-small';
            removeBtn.textContent = 'Remove';
            removeBtn.addEventListener('click', () => this.removeRackGroup(group.id));
            
            rackItem.appendChild(rackInfo);
            rackItem.appendChild(removeBtn);
            this.rackList.appendChild(rackItem);
        });
    }

    updateConfiguration() {
        // Update the configuration and reload the scene
        const rawConfig = {
            ...this.baseConfig,
            rackGroups: this.rackGroups.map(group => ({
                offsetX: group.offsetX,
                offsetZ: group.offsetZ,
                units: group.units,
                doubleSided: group.doubleSided,
                depth: group.depth
            }))
        };
        
        console.log('Raw config before parsing:', JSON.stringify(rawConfig, null, 2));
        
        // Parse configuration to expand units with count property
        const expandedConfig = this.parseConfiguration(rawConfig);
        
        console.log('Expanded config after parsing:', JSON.stringify(expandedConfig, null, 2));

        // Use the engine's loadConfiguration method to update the scene
        this.engine.loadConfiguration(expandedConfig);
    }

    /**
     * 解析配置中的units，支持count属性批量生成
     * @param {Array} units - 原始units配置数组
     * @returns {Array} - 展开后的units数组
     */
    parseUnitsConfig(units) {
        const expandedUnits = [];
        
        units.forEach(unit => {
            if (unit.count && unit.count > 1) {
                // 如果有count属性，生成指定数量的相同unit
                for (let i = 0; i < unit.count; i++) {
                    const unitCopy = { ...unit };
                    // 移除count属性，避免递归处理
                    delete unitCopy.count;
                    expandedUnits.push(unitCopy);
                }
            } else {
                // 如果没有count属性或count为1，直接添加
                const unitCopy = { ...unit };
                delete unitCopy.count; // 清理count属性
                expandedUnits.push(unitCopy);
            }
        });
        
        return expandedUnits;
    }

    /**
     * 解析完整配置，处理所有rackGroups中的units
     * @param {Object} config - 原始配置对象
     * @returns {Object} - 处理后的配置对象
     */
    parseConfiguration(config) {
        const parsedConfig = { ...config };
        
        if (parsedConfig.rackGroups) {
            parsedConfig.rackGroups = parsedConfig.rackGroups.map(group => {
                const parsedGroup = { ...group };
                if (parsedGroup.units) {
                    parsedGroup.units = this.parseUnitsConfig(parsedGroup.units);
                }
                return parsedGroup;
            });
        }
        
        // 处理旧式配置（直接在根级别的units）
        if (parsedConfig.units) {
            parsedConfig.units = this.parseUnitsConfig(parsedConfig.units);
        }
        
        return parsedConfig;
    }

    /**
     * 优化units配置，将连续相同的unit压缩为带count属性的单个unit
     * @param {Array} units - 展开的units数组
     * @returns {Array} - 压缩后的units数组
     */
    optimizeUnitsConfig(units) {
        if (!units || units.length === 0) return [];
        
        const optimizedUnits = [];
        let currentUnit = { ...units[0] };
        let count = 1;
        
        // Helper function to check if two units are identical (ignoring count property)
        const areUnitsEqual = (unit1, unit2) => {
            // Create deep copies without the count property
            const u1 = { ...unit1 };
            const u2 = { ...unit2 };
            delete u1.count;
            delete u2.count;
            
            return JSON.stringify(u1) === JSON.stringify(u2);
        };
        
        // Process all units
        for (let i = 1; i < units.length; i++) {
            if (areUnitsEqual(currentUnit, units[i])) {
                // Units are identical, increment count
                count++;
            } else {
                // Units are different, add the previous unit with its count
                if (count > 1) {
                    currentUnit.count = count;
                }
                optimizedUnits.push(currentUnit);
                
                // Start tracking the new unit
                currentUnit = { ...units[i] };
                count = 1;
            }
        }
        
        // Add the last unit
        if (count > 1) {
            currentUnit.count = count;
        }
        optimizedUnits.push(currentUnit);
        
        return optimizedUnits;
    }

    /**
     * 优化整个配置，压缩所有rackGroups中的相同units
     * @param {Object} config - 原始配置对象
     * @returns {Object} - 优化后的配置对象
     */
    optimizeConfiguration(config) {
        const optimizedConfig = { ...config };
        
        if (optimizedConfig.rackGroups) {
            optimizedConfig.rackGroups = optimizedConfig.rackGroups.map(group => {
                const optimizedGroup = { ...group };
                if (optimizedGroup.units) {
                    optimizedGroup.units = this.optimizeUnitsConfig(optimizedGroup.units);
                }
                return optimizedGroup;
            });
        }
        
        // 处理旧式配置（直接在根级别的units）
        if (optimizedConfig.units) {
            optimizedConfig.units = this.optimizeUnitsConfig(optimizedConfig.units);
        }
        
        return optimizedConfig;
    }

    // Method to get current configuration for saving
    getCurrentConfiguration() {
        // Create raw configuration
        const rawConfig = {
            ...this.baseConfig,
            rackGroups: this.rackGroups.map(group => ({
                offsetX: group.offsetX,
                offsetZ: group.offsetZ,
                units: group.units,
                doubleSided: group.doubleSided,
                depth: group.depth
            }))
        };
        
        // Optimize configuration by compressing identical units
        const optimizedConfig = this.optimizeConfiguration(rawConfig);
        console.log('配置已优化，使用count属性压缩了相同units:', optimizedConfig);
        
        return optimizedConfig;
    }

    /**
     * 添加布局管理功能的方法
     */
    addLayoutControls() {
        // 添加布局模式选择
        const layoutControls = document.createElement('div');
        layoutControls.className = 'layout-controls';
        layoutControls.innerHTML = `
            <h4>布局管理</h4>
            <div class="form-group">
                <label for="layoutType">布局模式:</label>
                <select id="layoutType" class="form-control">
                    <option value="linear">线性布局</option>
                    <option value="grid">网格布局</option>
                    <option value="free">自由布局</option>
                </select>
            </div>
            <div class="form-group">
                <label for="spacingX">X轴间距 (米):</label>
                <input type="number" id="spacingX" class="form-control" value="2" min="0.5" step="0.5">
            </div>
            <div class="form-group">
                <label for="spacingZ">Z轴间距 (米):</label>
                <input type="number" id="spacingZ" class="form-control" value="5" min="0.5" step="0.5">
            </div>
            <div class="form-group">
                <button id="applyLayoutBtn" class="btn btn-primary">应用布局</button>
                <button id="resetLayoutBtn" class="btn btn-secondary">重置布局</button>
            </div>
            <div class="form-group">
                <label>预设布局:</label>
                <button id="warehousePresetBtn" class="btn btn-outline-primary btn-sm">仓库布局</button>
                <button id="compactPresetBtn" class="btn btn-outline-primary btn-sm">紧凑布局</button>
                <button id="showcasePresetBtn" class="btn btn-outline-primary btn-sm">展示布局</button>
            </div>
        `;
        
        // 插入到控制面板中
        const controlPanel = document.querySelector('.control-panel') || document.body;
        controlPanel.appendChild(layoutControls);
        
        // 添加事件监听器
        this.initializeLayoutControls();
    }

    initializeLayoutControls() {
        const layoutTypeSelect = document.getElementById('layoutType');
        const spacingXInput = document.getElementById('spacingX');
        const spacingZInput = document.getElementById('spacingZ');
        const applyLayoutBtn = document.getElementById('applyLayoutBtn');
        const resetLayoutBtn = document.getElementById('resetLayoutBtn');
        
        // 布局模式切换
        if (layoutTypeSelect) {
            layoutTypeSelect.addEventListener('change', (e) => {
                this.layoutManager.setLayoutType(e.target.value);
                this.updateConfiguration();
            });
        }
        
        // 应用布局设置
        if (applyLayoutBtn) {
            applyLayoutBtn.addEventListener('click', () => {
                const spacing = {
                    x: parseFloat(spacingXInput.value) || 2,
                    z: parseFloat(spacingZInput.value) || 5
                };
                this.layoutManager.setSpacing(spacing);
                this.updateConfiguration();
                console.log('布局设置已应用:', spacing);
            });
        }
        
        // 重置布局
        if (resetLayoutBtn) {
            resetLayoutBtn.addEventListener('click', () => {
                this.layoutManager = new LayoutManager({
                    layoutType: 'linear',
                    spacing: { x: 2, z: 5 },
                    origin: { x: 0, z: 0 }
                });
                // 重新添加所有货架组到布局管理器
                this.rackGroups.forEach(group => {
                    this.layoutManager.addRackGroup(group);
                });
                this.updateConfiguration();
                console.log('布局已重置');
            });
        }
        
        // 预设布局按钮
        const presetButtons = {
            warehousePresetBtn: 'warehouse',
            compactPresetBtn: 'compact', 
            showcasePresetBtn: 'showcase'
        };
        
        Object.entries(presetButtons).forEach(([buttonId, presetName]) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => {
                    this.applyLayoutPreset(presetName);
                });
            }
        });
    }

    applyLayoutPreset(presetName) {
        const preset = LayoutPresets[presetName];
        if (preset) {
            this.layoutManager = new LayoutManager(preset);
            // 重新添加所有货架组到布局管理器
            this.rackGroups.forEach(group => {
                this.layoutManager.addRackGroup(group);
            });
            this.updateConfiguration();
            console.log(`已应用 ${presetName} 布局预设`);
        }
    }
}

export { RackManager };
