import { PlaneGeometry, MeshLambertMaterial, Mesh, DoubleSide, Vector3, BufferGeometry, LineBasicMaterial, Line, Shape, ShapeGeometry } from 'three';

/**
 * 仓库场景类 - 管理仓库外墙的创建和动态可见性
 */
class WarehouseScene {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.config = null;
        this.walls = {
            front: null,   // Z轴正方向墙 (+Z)
            back: null,    // Z轴负方向墙 (-Z)
            left: null,    // X轴负方向墙 (-X)
            right: null    // X轴正方向墙 (+X)
        };
        this.floorBorder = null; // 仓库地面边框(红色填充区域)
        this.warehouseGroup = null;
        
        // 可见性判断方法切换
        // true: 使用手动逻辑判断 (只显示距离相机最远的两面墙)
        // false: 让所有墙壁可见，依靠Three.js视锥体剔除
        this.useManualVisibility = true;
    }

    /**
     * 加载仓库配置并初始化仓库
     */
    async loadWarehouseConfig(configPath = '/warehouse-config.json') {
        try {
            const response = await fetch(configPath);
            const config = await response.json();
            this.config = config.warehouse;
            this.initializeWarehouse();
            console.log('仓库配置加载成功:', this.config);
        } catch (error) {
            console.error('加载仓库配置失败:', error);
            // 使用默认配置
            this.config = {
                dimensions: { length: 40, width: 15, height: 4.5 },
                wall: { color: "#7D7D7D", opacity: 0.8 },
                position: { x: 0, y: 0, z: 0 }
            };
            this.initializeWarehouse();
        }
    }

    /**
     * 初始化仓库 - 创建墙壁
     */
    initializeWarehouse() {
        if (!this.config) return;

        const { length, width, height } = this.config.dimensions;
        const { color, opacity } = this.config.wall;
        const { x: posX, y: posY, z: posZ } = this.config.position;

        // 创建墙壁材质
        const wallMaterial = new MeshLambertMaterial({
            color: color,
            side: DoubleSide,
            transparent: true,
            opacity: opacity
        });

        // 创建4面墙壁
        this.createWalls(length, width, height, posX, posY, posZ, wallMaterial);
        
        // 创建地面边框
        this.createFloorBorder(length, width, posX, posY, posZ);
        
        // 添加到场景
        this.addToScene();
        
        console.log(`仓库初始化完成: ${length}m x ${width}m x ${height}m`);
    }

    /**
     * 创建4面墙壁
     */
    createWalls(length, width, height, posX, posY, posZ, material) {
        // 后墙 (Z轴负方向) - 长度 x 高度
        const backGeometry = new PlaneGeometry(length, height);
        this.walls.back = new Mesh(backGeometry, material);
        this.walls.back.position.set(posX, posY + height/2, posZ - width/2);
        this.walls.back.name = 'warehouse-wall-back';

        // 前墙 (Z轴正方向) - 长度 x 高度
        const frontGeometry = new PlaneGeometry(length, height);
        this.walls.front = new Mesh(frontGeometry, material);
        this.walls.front.position.set(posX, posY + height/2, posZ + width/2);
        this.walls.front.rotation.y = Math.PI; // 旋转180度面向内部
        this.walls.front.name = 'warehouse-wall-front';

        // 左墙 (X轴负方向) - 宽度 x 高度
        const leftGeometry = new PlaneGeometry(width, height);
        this.walls.left = new Mesh(leftGeometry, material);
        this.walls.left.position.set(posX - length/2, posY + height/2, posZ);
        this.walls.left.rotation.y = Math.PI/2; // 旋转90度
        this.walls.left.name = 'warehouse-wall-left';

        // 右墙 (X轴正方向) - 宽度 x 高度  
        const rightGeometry = new PlaneGeometry(width, height);
        this.walls.right = new Mesh(rightGeometry, material);
        this.walls.right.position.set(posX + length/2, posY + height/2, posZ);
        this.walls.right.rotation.y = -Math.PI/2; // 旋转-90度
        this.walls.right.name = 'warehouse-wall-right';
    }

    /**
     * 创建仓库地面边框 - 10cm宽度的红色填充区域，位于墙体外侧
     */
    createFloorBorder(length, width, posX, posY, posZ) {
        const borderWidth = 0.1; // 10cm = 0.1m
        const yOffset = 0.02; // 稍微高于地面，避免z-fighting
        
        // 计算墙体位置（边框内侧）
        const wallHalfLength = length / 2;
        const wallHalfWidth = width / 2;
        
        // 计算边框外侧位置（墙体位置 + 边框宽度）
        const outerHalfLength = wallHalfLength + borderWidth;
        const outerHalfWidth = wallHalfWidth + borderWidth;
        
        // 创建外形状（边框外边界）
        const outerShape = new Shape();
        outerShape.moveTo(-outerHalfLength, -outerHalfWidth);
        outerShape.lineTo(outerHalfLength, -outerHalfWidth);
        outerShape.lineTo(outerHalfLength, outerHalfWidth);
        outerShape.lineTo(-outerHalfLength, outerHalfWidth);
        outerShape.lineTo(-outerHalfLength, -outerHalfWidth);
        
        // 创建内形状（墙体边界，作为孔洞）
        const innerShape = new Shape();
        innerShape.moveTo(-wallHalfLength, -wallHalfWidth);
        innerShape.lineTo(-wallHalfLength, wallHalfWidth);
        innerShape.lineTo(wallHalfLength, wallHalfWidth);
        innerShape.lineTo(wallHalfLength, -wallHalfWidth);
        innerShape.lineTo(-wallHalfLength, -wallHalfWidth);
        
        // 将内形状作为孔洞添加到外形状
        outerShape.holes.push(innerShape);

        // 创建几何体
        const geometry = new ShapeGeometry(outerShape);
        
        // 创建红色材质
        const material = new MeshLambertMaterial({ 
            color: 0xff0000, // 红色
            side: DoubleSide,
            transparent: true,
            opacity: 0.7 // 半透明效果
        });
        
        // 创建网格
        this.floorBorder = new Mesh(geometry, material);
        this.floorBorder.position.set(posX, posY + yOffset, posZ);
        this.floorBorder.rotation.x = -Math.PI / 2; // 旋转90度平铺在地面
        this.floorBorder.name = 'warehouse-floor-border';
        
        console.log(`仓库地面边框创建完成: 边框宽度${borderWidth}m, 墙体尺寸${length}x${width}m, 边框外围尺寸${length + borderWidth*2}x${width + borderWidth*2}m`);
    }

    /**
     * 添加墙壁到场景
     */
    addToScene() {
        Object.values(this.walls).forEach(wall => {
            if (wall) {
                this.scene.add(wall);
            }
        });
        
        // 添加地面边框
        if (this.floorBorder) {
            this.scene.add(this.floorBorder);
        }
    }

    /**
     * 更新墙壁可见性 - 支持两种模式切换
     */
    updateWallVisibility() {
        if (!this.camera || !this.config) return;

        if (this.useManualVisibility) {
            // 方案1: 手动逻辑判断 - 只显示距离相机最远的两面墙
            this.updateWallVisibilityManual();
        } else {
            // 方案2: 自动视锥体剔除 - 让所有墙壁可见，由Three.js自动处理
            this.updateWallVisibilityAuto();
        }
    }

    /**
     * 方案1: 手动逻辑判断可见性
     * 只显示距离相机最远的两面墙，避免遮挡内部货架
     */
    updateWallVisibilityManual() {
        const cameraPos = this.camera.position;
        const warehouseCenter = new Vector3(
            this.config.position.x,
            this.config.position.y,
            this.config.position.z
        );

        // 计算相机相对于仓库中心的位置
        const relativePos = cameraPos.clone().sub(warehouseCenter);

        // 根据相机位置决定显示哪两面墙
        // 显示距离相机最远的墙壁
        
        // X轴方向判断：相机在左侧则显示右墙，在右侧则显示左墙
        if (relativePos.x < 0) {
            // 相机在左侧，显示右墙
            this.walls.right.visible = true;
            this.walls.left.visible = false;
        } else {
            // 相机在右侧，显示左墙
            this.walls.left.visible = true;
            this.walls.right.visible = false;
        }

        // Z轴方向判断：相机在前方则显示后墙，在后方则显示前墙
        if (relativePos.z < 0) {
            // 相机在后方，显示前墙
            this.walls.front.visible = true;
            this.walls.back.visible = false;
        } else {
            // 相机在前方，显示后墙
            this.walls.back.visible = true;
            this.walls.front.visible = false;
        }
    }

    /**
     * 方案2: 自动视锥体剔除
     * 让所有墙壁都保持可见，依靠Three.js的视锥体剔除自动处理可见性
     */
    updateWallVisibilityAuto() {
        // 确保所有墙壁都设置为可见
        // Three.js会自动进行视锥体剔除，只渲染相机能看到的墙壁
        Object.values(this.walls).forEach(wall => {
            if (wall) {
                wall.visible = true;
            }
        });
    }

    /**
     * 切换可见性判断方法
     * @param {boolean} useManual - true使用手动判断，false使用自动剔除
     */
    setVisibilityMode(useManual) {
        this.useManualVisibility = useManual;
        this.updateWallVisibility(); // 立即应用新的可见性设置
        console.log(`仓库墙壁可见性模式切换为: ${useManual ? '手动逻辑判断' : '自动视锥体剔除'}`);
    }

    /**
     * 获取仓库边界信息
     */
    getBounds() {
        if (!this.config) return null;

        const { length, width, height } = this.config.dimensions;
        const { x, y, z } = this.config.position;

        return {
            minX: x - length/2,
            maxX: x + length/2,
            minY: y,
            maxY: y + height,
            minZ: z - width/2,
            maxZ: z + width/2,
            center: { x, y: y + height/2, z }
        };
    }

    /**
     * 更新仓库配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.removeFromScene();
        this.initializeWarehouse();
    }

    /**
     * 从场景中移除仓库
     */
    removeFromScene() {
        Object.values(this.walls).forEach(wall => {
            if (wall) {
                this.scene.remove(wall);
                wall.geometry.dispose();
                wall.material.dispose();
            }
        });
        
        // 移除地面边框
        if (this.floorBorder) {
            this.scene.remove(this.floorBorder);
            this.floorBorder.geometry.dispose();
            this.floorBorder.material.dispose();
            this.floorBorder = null;
        }
        
        // 重置墙壁引用
        this.walls = {
            front: null,
            back: null,
            left: null,
            right: null
        };
    }

    /**
     * 销毁仓库场景
     */
    dispose() {
        this.removeFromScene();
        this.config = null;
        this.scene = null;
        this.camera = null;
    }
}

export { WarehouseScene };
