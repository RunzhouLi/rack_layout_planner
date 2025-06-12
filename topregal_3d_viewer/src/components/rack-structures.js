import { Vector3, Group, Matrix4 } from 'three';
import { dynText } from "./dynamic-text.js";
import { addObject } from "./addObject.js";

/**
 * 货架单元类 - 表示单个货架unit
 */
class RackUnit {
    constructor(config, unitIndex, rackGroup) {
        this.width = config.width;
        this.height = config.height;
        this.shelves = config.shelves || [];
        this.count = config.count || 1;
        this.unitIndex = unitIndex;
        this.rackGroup = rackGroup;
        this.renderObjects = []; // 存储渲染的3D对象
        this.measurementObjs = []; // 存储测量对象
    }

    /**
     * 渲染单个unit的所有实例（考虑count属性）
     */
    render(scene, startPosition, standWidth, clonedObjects) {
        const expandedUnits = [];
        
        // 根据count属性创建多个实例
        for (let i = 0; i < this.count; i++) {
            const unitGroup = new Group();
            unitGroup.name = `RackUnit_${this.rackGroup.id}_${this.unitIndex}_${i}`;
            unitGroup.userData = {
                rackGroupId: this.rackGroup.id,
                unitIndex: this.unitIndex,
                instanceIndex: i,
                unitWidth: this.width,
                unitHeight: this.height
            };

            const xPos = startPosition.x + (i * (this.width + standWidth) / 100);
            const position = new Vector3(xPos, startPosition.y, startPosition.z);

            // 渲染立柱
            this.renderStand(scene, position, unitGroup, clonedObjects);
            
            // 渲染货架
            this.renderShelves(scene, position, unitGroup, clonedObjects);

            scene.add(unitGroup);
            this.renderObjects.push(unitGroup);
            expandedUnits.push({
                position: position,
                group: unitGroup,
                width: this.width,
                height: this.height
            });
        }

        return expandedUnits;
    }

    /**
     * 渲染立柱
     */
    renderStand(scene, position, unitGroup, clonedObjects) {
        const stand = scene.getObjectByName(`Stand_${this.height}_${this.rackGroup.depth}`);
        if (stand) {
            // Front stand at the original position
            addObject(stand, position, unitGroup, clonedObjects);
            
            if (this.rackGroup.doubleSided) {
                const spacer = scene.getObjectByName("Spacer_20");
                if (spacer) {
                    const singleSideDepthMeters = this.rackGroup.depth / 100;
                    const spacerWidthMeters = 20 / 100; // 20cm spacer width
                    
                    // Spacer应该位于两面货架之间的中心位置
                    // 从前面货架的后边缘开始，到后面货架的前边缘，spacer在正中间
                    const spacerZ = position.z + singleSideDepthMeters + (spacerWidthMeters / 2);

                    // 在不同高度添加spacers连接前后立柱
                    addObject(spacer, new Vector3(position.x, this.height/120, spacerZ), unitGroup, clonedObjects);
                    addObject(spacer, new Vector3(position.x, this.height/200, spacerZ), unitGroup, clonedObjects);
                    addObject(spacer, new Vector3(position.x, this.height/550, spacerZ), unitGroup, clonedObjects);
                    
                    // Add back stand - positioned after the spacer
                    const backStandZ = position.z + singleSideDepthMeters + spacerWidthMeters;
                    const backStandPos = new Vector3(position.x, 0, backStandZ);
                    addObject(stand, backStandPos, unitGroup, clonedObjects);
                }
            }
        }
    }

    /**
     * 渲染货架层板
     */
    renderShelves(scene, position, unitGroup, clonedObjects) {
        const singleSideDepthCm = this.rackGroup.depth;
        const singleSideDepthMeters = singleSideDepthCm / 100;
        const singleSideHalfDepthMeters = singleSideDepthMeters / 2;
        
        for (let shelfIndex = 0; shelfIndex < this.shelves.length; shelfIndex++) {
            const shelfUnit = this.shelves[shelfIndex];
            // shelfYOffset is in meters
            const shelfYOffset = (this.height / (this.shelves.length + 1) / 100) * (this.shelves.length - shelfIndex);
            
            const traverse = scene.getObjectByName(`Traverse_${this.width}_angular`);
            const kanban = scene.getObjectByName(`Traverse_${this.width}_round`);

            const isInclinedDeck = shelfUnit.deck === 'inclined';
            
            // 对于倾斜货架，优先使用kanban（圆形横梁），否则使用普通横梁
            let activeTraverseObject = traverse;
            if (isInclinedDeck && kanban) {
                activeTraverseObject = kanban;
            }
            
            // Y position for front traverse (meters)
            const yPosForFrontTraverse = isInclinedDeck ? shelfYOffset + 0.15 : shelfYOffset;
            const yOffsetForFlippedInclinedTraverse = isInclinedDeck ? (this.rackGroup.depth === 60 ? 0.2 : 0.27) : 0;

            if (activeTraverseObject) {
                // Front side traverse - 位于前面货架深度的中心
                const frontTraverseZ = position.z + singleSideHalfDepthMeters;
                addObject(activeTraverseObject, new Vector3(position.x, yPosForFrontTraverse, frontTraverseZ), unitGroup, clonedObjects);

                // 如果是倾斜货架且需要额外的横梁，添加普通横梁
                if (isInclinedDeck && traverse && activeTraverseObject === kanban) {
                    addObject(traverse, new Vector3(position.x, shelfYOffset, frontTraverseZ), unitGroup, clonedObjects);
                }

                // Shelf object
                let shelfObj = null;
                switch (shelfUnit.deck) {
                    case 'wood': shelfObj = scene.getObjectByName(`Shelf_wood_${this.width}_${singleSideDepthCm}`); break;
                    case 'steel': shelfObj = scene.getObjectByName(`Shelf_steel_${this.width}_${singleSideDepthCm}`); break;
                    case 'inclined': shelfObj = scene.getObjectByName(`Shelf_kanban_${this.width}_${singleSideDepthCm}`); break;
                    case 'multiplex': shelfObj = scene.getObjectByName(`Shelf_multi_${this.width}_${singleSideDepthCm}`); break;
                    case 'grid': shelfObj = scene.getObjectByName(`Shelf_grid_${this.width}_${singleSideDepthCm}`); break;
                }

                if (shelfObj) {
                    // Front shelf - 放置在货架组的前边缘
                    addObject(shelfObj, new Vector3(position.x, shelfYOffset, position.z), unitGroup, clonedObjects);
                }

                // 双面货架：渲染后面的横梁和货架
                if (this.rackGroup.doubleSided) {
                    const spacerWidthMeters = 20 / 100; // 20cm spacer

                    // Back side traverse - 位于后面货架深度的中心
                    const backTraverseZ = position.z + singleSideDepthMeters + spacerWidthMeters + singleSideHalfDepthMeters;
                    const yPosForBackTraverse = isInclinedDeck ? shelfYOffset + yOffsetForFlippedInclinedTraverse : shelfYOffset;

                    // 添加后面的主横梁（翻转）
                    this.addFlippedObject(activeTraverseObject, new Vector3(position.x, yPosForBackTraverse, backTraverseZ), unitGroup, clonedObjects, false, false, true);

                    // 如果是倾斜货架且需要额外的横梁，也添加到后面
                    if (isInclinedDeck && traverse && activeTraverseObject === kanban) {
                        this.addFlippedObject(traverse, new Vector3(position.x, shelfYOffset, backTraverseZ), unitGroup, clonedObjects, false, false, true);
                    }

                    // Back side shelf
                    if (shelfObj) {
                        const backShelfFrontZ = position.z + singleSideDepthMeters + spacerWidthMeters;
                        
                        if (isInclinedDeck) {
                            // 倾斜货架需要翻转
                            this.addFlippedObject(shelfObj, new Vector3(position.x, shelfYOffset, backShelfFrontZ), unitGroup, clonedObjects, false, false, true);
                        } else {
                            // 对称货架只需要正确定位
                            addObject(shelfObj, new Vector3(position.x, shelfYOffset, backShelfFrontZ), unitGroup, clonedObjects);
                        }
                    }
                }
            } else {
                console.warn(`Traverse object not found for width ${this.width}, deck type: ${shelfUnit.deck}`);
            }
        }
    }

    /**
     * 获取unit的总宽度（包括count）
     */
    getTotalWidth(standWidth) {
        return (this.width + standWidth) * this.count / 100;
    }

    /**
     * 清理资源
     */
    dispose() {
        this.renderObjects.forEach(obj => {
            if (obj.parent) obj.parent.remove(obj);
        });
        this.measurementObjs.forEach(obj => {
            if (obj.domElement) obj.domElement.remove();
        });
        this.renderObjects = [];
        this.measurementObjs = [];
    }

    /**
     * 添加翻转的对象
     */
    addFlippedObject(object, position, parent, objArray, flipX, flipY, flipZ) {
        if (!object) {
            console.warn('addFlippedObject: object is undefined, skipping', position);
            return;
        }
        var objectCopy = object.clone();

        objectCopy.traverse(function (item) {
            if (!item.visible) item.visible = true;
            item.castShadow = true;
        });

        if (flipX) objectCopy.applyMatrix4(new Matrix4().makeScale(-1, 1, 1));
        if (flipY) objectCopy.applyMatrix4(new Matrix4().makeScale(1, -1, 1));
        if (flipZ) objectCopy.applyMatrix4(new Matrix4().makeScale(1, 1, -1));

        objectCopy.position.set(position.x, position.y, position.z);
        parent.add(objectCopy);
        if (objArray) objArray.push(objectCopy);
    }
}

/**
 * 货架组类 - 表示一组货架
 */
class RackGroup {
    constructor(config, groupId) {
        this.id = groupId;
        this.offsetX = config.offsetX || 0;
        this.offsetZ = config.offsetZ || 0;
        this.doubleSided = config.doubleSided || false;
        this.depth = config.depth || 120;
        this.units = [];
        this.renderObjects = [];
        this.measurementObjs = [];
        this.standWidth = 6; // 立柱宽度

        // 创建RackUnit实例
        config.units.forEach((unitConfig, index) => {
            const unit = new RackUnit(unitConfig, index, this);
            this.units.push(unit);
        });
    }

    /**
     * 渲染整个货架组
     */
    render(scene, clonedObjects, loop) {
        const groupWidth = this.calculateWidth();
        let widthOffset = 0;

        // 渲染每个unit - 从offsetX开始，不再使用中心点
        this.units.forEach((unit, index) => {
            const startPosition = new Vector3(
                this.offsetX + widthOffset,
                0,
                this.offsetZ
            );

            const renderedInstances = unit.render(scene, startPosition, this.standWidth, clonedObjects);
            
            // 更新位置偏移
            widthOffset += unit.getTotalWidth(this.standWidth);

            // 添加右侧立柱（在最后一个unit实例之后）
            if (index === this.units.length - 1) {
                this.addRightStand(scene, startPosition, widthOffset, clonedObjects);
            }
        });

        // 添加测量标注
        this.addMeasurements(scene, loop, groupWidth);
    }

    /**
     * 添加右侧立柱
     */
    addRightStand(scene, basePosition, widthOffset, clonedObjects) {
        // 找到最高的unit
        const maxHeight = Math.max(...this.units.map(unit => unit.height)); // maxHeight in cm
        const rightStand = scene.getObjectByName(`Stand_${maxHeight}_${this.depth}`);
        if (rightStand) {
            // Front right stand
            const rightStandPos = new Vector3(
                this.offsetX + widthOffset,
                0,
                this.offsetZ
            );
            addObject(rightStand, rightStandPos, scene, clonedObjects);

            if (this.doubleSided) {
                const spacer = scene.getObjectByName("Spacer_20");
                if (spacer) {
                    const singleSideDepthMeters = this.depth / 100;
                    const spacerWidthMeters = 20 / 100;
                    
                    // Spacer位于两面货架之间的中心位置
                    const spacerZ = rightStandPos.z + singleSideDepthMeters + (spacerWidthMeters / 2);
                    
                    // 在不同高度添加spacers
                    addObject(spacer, new Vector3(rightStandPos.x, maxHeight/120, spacerZ), scene, clonedObjects);
                    addObject(spacer, new Vector3(rightStandPos.x, maxHeight/200, spacerZ), scene, clonedObjects);
                    addObject(spacer, new Vector3(rightStandPos.x, maxHeight/550, spacerZ), scene, clonedObjects);
                    
                    // Add back right stand
                    const backRightStandZ = rightStandPos.z + singleSideDepthMeters + spacerWidthMeters;
                    const backRightStandPos = new Vector3(rightStandPos.x, 0, backRightStandZ);
                    addObject(rightStand, backRightStandPos, scene, clonedObjects);
                }
            }
        }
    }

    /**
     * 计算货架组宽度
     */
    calculateWidth() {
        let totalWidth = this.standWidth / 100; // 左侧立柱
        this.units.forEach(unit => {
            totalWidth += unit.getTotalWidth(this.standWidth);
        });
        return totalWidth;
    }

    /**
     * 添加测量标注 - 基于新的边界框坐标系统
     */
    addMeasurements(scene, loop, groupWidth) {
        const yOffset = 0;
        const bounds = this.getBounds();
        
        // 宽度测量 - 测量线沿着货架组的前边缘，标注在下方
        const widthMeasurement = Math.round(groupWidth * 100); // 转换为cm并四舍五入
        
        const widthText = new dynText(
            scene, 
            widthMeasurement, 
            48, 
            bounds.width, // 测量线长度使用实际宽度（米）
            0.01, 
            new Vector3(bounds.minX + bounds.width/2, 0.01, bounds.minZ - 0.5), // 位置在前边缘外侧
            0, 
            -Math.PI/2, 
            "#556879", 
            1, 
            `组${this.id}`, 
            " cm", 
            loop, 
            yOffset
        );
        widthText.addText();
        this.measurementObjs.push(widthText);
        loop.updatables.push(widthText);

        // 深度测量 - 测量线沿着货架组的左边缘，标注在左侧
        let depthMeasurement;
        if (this.doubleSided) {
            depthMeasurement = Math.round(this.depth * 2 + 20); // 双面货架：两面 + 间隔
        } else {
            depthMeasurement = Math.round(this.depth); // 单面货架
        }
        
        const depthText = new dynText(
            scene, 
            depthMeasurement, 
            48, 
            bounds.depth, // 测量线长度使用实际深度（米）
            0.01, 
            new Vector3(bounds.minX - 0.5, 0.01, bounds.minZ + bounds.depth/2), // 位置在左边缘外侧，深度中心
            -Math.PI/2, 
            0, 
            "#556879", 
            1, 
            `组${this.id}`, 
            " cm", 
            loop, 
            yOffset
        );
        depthText.addText();
        this.measurementObjs.push(depthText);
        loop.updatables.push(depthText);

        // 高度测量 - 测量线沿着货架组的右边缘，标注在右侧
        const maxHeight = Math.max(...this.units.map(unit => unit.height));
        const heightInMeters = maxHeight / 100; // 转换为米
        
        const heightText = new dynText(
            scene, 
            Math.round(maxHeight), // 显示值（cm）
            48, 
            heightInMeters, // 测量线长度（米）
            0.01, 
            new Vector3(bounds.maxX + 0.5, heightInMeters/2, bounds.minZ + bounds.depth/2), // 位置在右边缘外侧，高度中心，深度中心
            0, 
            0, 
            "#556879", 
            1, 
            `组${this.id}`, 
            " cm", 
            loop, 
            yOffset
        );
        heightText.addText();
        this.measurementObjs.push(heightText);
        loop.updatables.push(heightText);
    }

    /**
     * 清理资源
     */
    dispose() {
        this.units.forEach(unit => unit.dispose());
        this.measurementObjs.forEach(obj => {
            if (obj.domElement) obj.domElement.remove();
        });
        this.renderObjects = [];
        this.measurementObjs = [];
    }

    /**
     * 获取总的unit数量（考虑count属性）
     */
    getTotalUnitCount() {
        return this.units.reduce((total, unit) => total + unit.count, 0);
    }

    /**
     * 获取边界信息 - 使用offsetX,offsetZ作为边界框的最小值点
     */
    getBounds() {
        const groupWidth = this.calculateWidth(); // in meters
        
        // this.depth is the depth of a single side (e.g., 60cm)
        let actualGroupDepthCm = this.depth;
        if (this.doubleSided) {
            actualGroupDepthCm = (this.depth * 2) + 20; // e.g., (60 * 2) + 20 = 140cm (spacer is 20cm)
        }
        const groupDepthMeters = actualGroupDepthCm / 100;

        return {
            minX: this.offsetX,
            maxX: this.offsetX + groupWidth,
            minZ: this.offsetZ,
            maxZ: this.offsetZ + groupDepthMeters, // Use the correctly calculated total depth
            width: groupWidth,
            depth: groupDepthMeters, // This is the total depth in meters
            maxHeight: Math.max(...this.units.map(unit => unit.height)) // maxHeight is in cm
        };
    }

    /**
     * 设置位置（用于布局管理器）
     */
    setPosition(x, z) {
        this.offsetX = x;
        this.offsetZ = z;
    }

    /**
     * 获取当前位置
     */
    getPosition() {
        return { x: this.offsetX, z: this.offsetZ };
    }

    /**
     * 移动到新位置
     */
    moveTo(x, z) {
        const deltaX = x - this.offsetX;
        const deltaZ = z - this.offsetZ;
        
        this.offsetX = x;
        this.offsetZ = z;
        
        // 更新所有渲染对象的位置
        this.renderObjects.forEach(obj => {
            obj.position.x += deltaX;
            obj.position.z += deltaZ;
        });
        
        // 更新测量对象的位置
        this.measurementObjs.forEach(measurement => {
            if (measurement.position) {
                measurement.position.x += deltaX;
                measurement.position.z += deltaZ;
            }
        });
    }
}

export { RackGroup, RackUnit };
