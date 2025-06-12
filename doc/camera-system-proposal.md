# 3D Viewer Camera System – 方案 C 需求文档

版本：v1.0  
作者：AI 生成，待团队评审  
更新日期：2025-06-12

---

## 目标
实现一套多模式（Orbit / Top-Down / FPS）的灵活摄像机交互系统，满足仓库 3D Viewer 场景下的多种观察与操作需求，同时保证易用性与性能。

## 总览
1. **模式一：Orbit 模式（默认）**
   * 传统轨道环绕视角，鼠标左键旋转、滚轮缩放、右键平移。
   * 支持自动旋转（可开关）。
   * 限制范围自适应模型尺寸。
2. **模式二：Top-Down / Bird-Eye 模式**
   * 正交（OrthographicCamera）或透视相机自上而下俯视。
   * 用于布置货架、测量平面关系。
   * 支持平移与缩放，无旋转。
3. **模式三：自由飞行 FPS 模式**
   * PointerLockControls 或 FlyControls，支持 WASD + 鼠标视角。
   * 可配置移动速度 & 加速键（Shift）。
   * ESC 退出指针锁定，返回 Orbit。
4. **平滑切换**
   * 模式切换时使用 Tween.js / GSAP 过渡相机位置与方向，避免跳帧。
   * 切换前保存当前模式的相机状态，切换回时恢复。
5. **UI / UX**
   * 右上角工具栏 3 个图标：Orbit、Top、FPS；当前模式高亮。
   * 键盘快捷键：`1` Orbit，`2` Top-Down，`3` FPS。
   * HUD/Toast 在首次进入 FPS 提示"按 ESC 退出"。
6. **配置持久化（可选）**
   * 使用 localStorage 记忆上次使用的模式和参数。

---

## 详细需求

### 1. Orbit 模式
| 功能 | 说明 |
|------|------|
| 相机类型 | `PerspectiveCamera` |
| 控制器 | `OrbitControls` |
| 距离限制 | `minDistance = modelBB.radius * 0.5`  <br/>`maxDistance = modelBB.radius * 5` |
| 极角限制 | `minPolarAngle = 0`，`maxPolarAngle = Math.PI` |
| 平移限制 | 基于模型包围盒 (BB) 外扩 30% 的 AABB |
| 自动旋转 | 默认关闭，用户可通过 UI 开启，速度 0.3-0.5 |

### 2. Top-Down 模式
| 功能 | 说明 |
|------|------|
| 相机类型 | `OrthographicCamera`（优先）或 `PerspectiveCamera` 大角度俯视 |
| 初始视角 | 相机在模型 BB 正上方 Y 轴，朝向 (0,0,0) |
| 控制器 | 自定义平移缩放（可基于 `OrbitControls` 禁用旋转） |
| 缩放限制 | `minZoom` = BB 尺寸 / 0.5，`maxZoom` 根据场景大小 |
| 旋转 | 禁用 XZ 旋转，保持俯视 |

### 3. FPS / Fly 模式
| 功能 | 说明 |
|------|------|
| 相机类型 | `PerspectiveCamera` |
| 控制器 | `PointerLockControls`（更沉浸）或 `FlyControls`（含上升/下降） |
| 移动 | `WASD` (前后左右)，`Space` 上升，`Shift` 快速前进 |
| 视角灵敏度 | 鼠标移动控制 yaw/pitch，灵敏度配置化 |
| 碰撞检测（可选） | 简易射线检测防止穿墙 |
| 退出方式 | `ESC` 解除指针锁定并切回 Orbit |

### 4. 控制器管理
* `ControlsManager` 负责：
  * 初始化各模式的控制器实例
  * 暴露 `switchMode(modeName)` API
  * 在主渲染循环中更新当前控制器
* 切换流程：
  1. 保存当前相机矩阵 & target（如适用）。
  2. 停用当前控制器 `enabled = false`。
  3. 恢复切换目标模式上次保存的相机状态。
  4. 启用目标控制器。
  5. 触发 UI 高亮 & 提示。

### 5. 动画过渡
* 采用 Tween.js 或 GSAP：
  * 0.6-1 秒过渡时间。
  * 同时插值 `camera.position`, `camera.quaternion`, 以及 `controls.target`（如需）。

### 6. UI 设计
* 工具栏组件：
  * React / Vanilla DOM，3 个按钮（Orbit ↺、Top ⬆、FPS 🎮）。
  * Tooltip：`Orbit (1)`, `Top View (2)`, `Fly (3)`。
  * 样式放置 `viewer-classes.css` 中，使用 `position: absolute; top:20px; right:20px`。

### 7. 配置 & 参数
| 参数 | 默认值 | 说明 |
|-------|--------|------|
| `autoRotate` | false | Orbit 自动旋转 |
| `flySpeed` | 5 | FPS 前进速度 (m/s) |
| `fastMultiplier` | 2 | 按 `Shift` 加速倍率 |
| `panLimitFactor` | 1.3 | Orbit 平移包围盒倍率 |
| `zoomFactorTop` | 1.5 | Top 模式相机边距倍率 |

### 8. 错误处理 & 性能
* 切换模式时捕获异常，防止控制器未定义报错。
* 关闭不活跃控制器的事件监听，减少性能开销。

### 9. 未来扩展（非必需）
* 保存用户自定义视角书签。
* 多人协同查看时同步相机。
* VR / AR 模式接入。

---

> **备注**：实施时可先完成方案 A；待验证体验后，再根据本文件逐步实现方案 C 功能模块。 