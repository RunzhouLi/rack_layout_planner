
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
    }

    loadInitialConfiguration(config) {
        this.baseConfig = config;
        this.rackGroups = config.rackGroups || [];
        // Add IDs to existing groups if they don't have them
        this.rackGroups.forEach((group, index) => {
            if (!group.id) {
                group.id = index + 1;
            }
        });
        this.nextRackId = this.rackGroups.length + 1;
        this.updateRackList();
        this.updateNextPosition();
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
        const positionX = parseFloat(this.positionXInput.value) || 0;
        const positionZ = parseFloat(this.positionZInput.value) || 0;
        const unitCount = parseInt(this.rackUnitsInput.value) || 7;
        const unitWidth = parseInt(this.unitWidthSelect.value) || 220;

        // Create units array
        const units = [];
        for (let i = 0; i < unitCount; i++) {
            units.push(this.createRackUnit(unitWidth));
        }

        // Create new rack group
        const rackGroup = {
            id: this.nextRackId++,
            offsetX: positionX,
            offsetZ: positionZ,
            units: units
        };

        this.rackGroups.push(rackGroup);
        this.updateConfiguration();
        this.updateRackList();
        this.updateNextPosition();
    }

    removeRackGroup(id) {
        this.rackGroups = this.rackGroups.filter(group => group.id !== id);
        this.updateConfiguration();
        this.updateRackList();
        this.updateNextPosition();
    }

    clearAllRacks() {
        this.rackGroups = [];
        this.nextRackId = 1;
        this.updateConfiguration();
        this.updateRackList();
        this.updateNextPosition();
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
            
            const rackInfo = document.createElement('div');
            rackInfo.className = 'rack-info';
            rackInfo.innerHTML = `
                <strong>Rack ${group.id}</strong><br>
                Position: (${group.offsetX}, ${group.offsetZ})m<br>
                Units: ${group.units.length}
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
        const newConfig = {
            ...this.baseConfig,
            rackGroups: this.rackGroups.map(group => ({
                offsetX: group.offsetX,
                offsetZ: group.offsetZ,
                units: group.units
            }))
        };

        // Clear the scene and rebuild with new configuration
        this.engine.clearScene();
        this.engine.loadConfiguration(newConfig);
    }

    // Method to get current configuration for saving
    getCurrentConfiguration() {
        return {
            ...this.baseConfig,
            rackGroups: this.rackGroups.map(group => ({
                offsetX: group.offsetX,
                offsetZ: group.offsetZ,
                units: group.units
            }))
        };
    }
}

export { RackManager };
