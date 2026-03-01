<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { Task, TaskRelation } from "../types/task";

/**
 * BlueprintCanvas 组件 - 可拖拽的蓝图画布
 * 支持拖拽平移、缩放、显示任务节点和关系连线
 */

interface Props {
  /** 中心任务 */
  centerTask: Task;
  /** 所有相关任务 */
  relatedTasks: Task[];
  /** 任务关系列表 */
  relations: TaskRelation[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** 点击任务节点 */
  (e: "selectTask", taskId: string): void;
  /** 关闭蓝图 */
  (e: "close"): void;
}>();

// ==================== 画布状态 ====================

/** 画布缩放比例 */
const scale = ref(1);
/** 画布偏移X */
const offsetX = ref(0);
/** 画布偏移Y */
const offsetY = ref(0);

/** 是否正在拖拽 */
const isDragging = ref(false);
/** 拖拽开始时的鼠标位置 */
const dragStartX = ref(0);
const dragStartY = ref(0);
/** 拖拽开始时的偏移量 */
const dragStartOffsetX = ref(0);
const dragStartOffsetY = ref(0);

/** 画布容器引用 */
// const canvasRef = ref<HTMLDivElement | null>(null);

// ==================== 节点位置计算 ====================

/**
 * 计算任务节点在画布上的位置
 * 使用简单的层级布局算法
 */
const nodePositions = computed<Map<string, { x: number; y: number }>>(() => {
  const positions = new Map<string, { x: number; y: number }>();
  // const taskMap = new Map(props.relatedTasks.map((t) => [t.id, t]));

  // 构建层级关系
  const levels = new Map<string, number>();
  const visited = new Set<string>();

  // 计算每个任务的层级（基于依赖深度）
  function calculateLevel(taskId: string): number {
    if (levels.has(taskId)) return levels.get(taskId)!;
    if (visited.has(taskId)) return 0;
    visited.add(taskId);

    // 查找当前任务依赖的上游任务
    const upstreamRelations = props.relations.filter(
      (r) => r.to === taskId && r.type === "depends_on",
    );

    if (upstreamRelations.length === 0) {
      levels.set(taskId, 0);
      return 0;
    }

    let maxUpstreamLevel = -1;
    for (const rel of upstreamRelations) {
      const upstreamLevel = calculateLevel(rel.from);
      maxUpstreamLevel = Math.max(maxUpstreamLevel, upstreamLevel);
    }

    const level = maxUpstreamLevel + 1;
    levels.set(taskId, level);
    return level;
  }

  // 计算所有任务的层级
  for (const task of props.relatedTasks) {
    calculateLevel(task.id);
  }

  // 按层级分组
  const levelGroups = new Map<number, string[]>();
  for (const [taskId, level] of levels.entries()) {
    if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    }
    levelGroups.get(level)!.push(taskId);
  }

  // 计算位置
  const levelWidth = 280; // 每个层级的宽度
  const nodeHeight = 100; // 节点高度
  const nodeGap = 40; // 节点间距

  for (const [level, taskIds] of levelGroups.entries()) {
    const totalHeight =
      taskIds.length * nodeHeight + (taskIds.length - 1) * nodeGap;
    const startY = -totalHeight / 2;

    for (let i = 0; i < taskIds.length; i++) {
      const taskId = taskIds[i];
      const x =
        level * levelWidth -
        (Math.max(...Array.from(levelGroups.keys())) * levelWidth) / 2;
      const y = startY + i * (nodeHeight + nodeGap) + nodeHeight / 2;
      positions.set(taskId, { x, y });
    }
  }

  // 确保中心任务在画布中心
  if (positions.has(props.centerTask.id)) {
    const centerPos = positions.get(props.centerTask.id)!;
    const centerOffsetX = -centerPos.x;
    const centerOffsetY = -centerPos.y;

    for (const [taskId, pos] of positions.entries()) {
      positions.set(taskId, {
        x: pos.x + centerOffsetX,
        y: pos.y + centerOffsetY,
      });
    }
  }

  return positions;
});

// ==================== 连线计算 ====================

/**
 * 计算连线路径 - 只显示依赖关系
 */
const connectionLines = computed<
  Array<{
    from: { x: number; y: number };
    to: { x: number; y: number };
  }>
>(() => {
  const lines = [];

  // 只显示 depends_on 关系
  for (const relation of props.relations) {
    if (relation.type !== "depends_on") continue;

    const fromPos = nodePositions.value.get(relation.from);
    const toPos = nodePositions.value.get(relation.to);

    if (fromPos && toPos) {
      lines.push({
        from: fromPos,
        to: toPos,
      });
    }
  }

  return lines;
});

// ==================== 事件处理 ====================

/**
 * 处理鼠标按下 - 开始拖拽
 */
function handleMouseDown(event: MouseEvent) {
  // 只有点击画布空白处才拖拽
  if ((event.target as HTMLElement).closest(".task-node")) return;

  isDragging.value = true;
  dragStartX.value = event.clientX;
  dragStartY.value = event.clientY;
  dragStartOffsetX.value = offsetX.value;
  dragStartOffsetY.value = offsetY.value;

  document.body.style.cursor = "grabbing";
}

/**
 * 处理鼠标移动 - 拖拽中
 */
function handleMouseMove(event: MouseEvent) {
  if (!isDragging.value) return;

  const dx = event.clientX - dragStartX.value;
  const dy = event.clientY - dragStartY.value;

  offsetX.value = dragStartOffsetX.value + dx;
  offsetY.value = dragStartOffsetY.value + dy;
}

/**
 * 处理鼠标抬起 - 结束拖拽
 */
function handleMouseUp() {
  isDragging.value = false;
  document.body.style.cursor = "";
}

/**
 * 处理滚轮缩放
 */
function handleWheel(event: WheelEvent) {
  event.preventDefault();
  const delta = event.deltaY > 0 ? 0.9 : 1.1;
  scale.value = Math.max(0.5, Math.min(2, scale.value * delta));
}

/**
 * 处理任务节点点击
 */
function handleNodeClick(taskId: string) {
  emit("selectTask", taskId);
}

/**
 * 获取任务节点位置样式
 */
function getNodeStyle(taskId: string) {
  const pos = nodePositions.value.get(taskId);
  if (!pos) return {};

  return {
    transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`,
  };
}

/**
 * 获取连线SVG路径
 */
function getConnectionPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
): string {
  // 贝塞尔曲线
  const midX = (from.x + to.x) / 2;
  return `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
}

// ==================== 生命周期 ====================

onMounted(() => {
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
});

onUnmounted(() => {
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
});
</script>

<template>
  <div
    ref="canvasRef"
    class="blueprint-canvas"
    @mousedown="handleMouseDown"
    @wheel="handleWheel"
  >
    <!-- 工具栏 -->
    <div class="canvas-toolbar">
      <button class="toolbar-btn" @click="$emit('close')">← 返回</button>
      <span class="toolbar-title">{{ centerTask.name }} - 任务蓝图</span>
      <div class="toolbar-actions">
        <button class="toolbar-btn" @click="scale = Math.min(2, scale + 0.1)">
          +
        </button>
        <span class="scale-text">{{ Math.round(scale * 100) }}%</span>
        <button class="toolbar-btn" @click="scale = Math.max(0.5, scale - 0.1)">
          -
        </button>
        <button
          class="toolbar-btn"
          @click="
            scale = 1;
            offsetX = 0;
            offsetY = 0;
          "
        >
          重置
        </button>
      </div>
    </div>

    <!-- 图例 -->
    <div class="legend">
      <div class="legend-item">
        <span class="legend-line" style="background: #409eff"></span>
        <span>任务依赖</span>
      </div>
    </div>

    <!-- 画布内容 -->
    <div
      class="canvas-content"
      :style="{
        transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
      }"
    >
      <!-- SVG 连线层 -->
      <svg
        class="connections-layer"
        :width="4000"
        :height="4000"
        :viewBox="'-2000 -2000 4000 4000'"
      >
        <defs>
          <!-- 箭头标记 -->
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#409eff" />
          </marker>
        </defs>

        <!-- 连线 -->
        <g v-for="(line, index) in connectionLines" :key="index">
          <path
            :d="getConnectionPath(line.from, line.to)"
            fill="none"
            stroke="#409eff"
            stroke-width="2"
            marker-end="url(#arrowhead)"
          />
        </g>
      </svg>

      <!-- 任务节点层 -->
      <div
        v-for="task in relatedTasks"
        :key="task.id"
        class="task-node"
        :class="{ center: task.id === centerTask.id }"
        :style="getNodeStyle(task.id)"
        @click.stop="handleNodeClick(task.id)"
      >
        <div class="node-header">
          <span class="node-id">#{{ task.id }}</span>
          <span v-if="task.id === centerTask.id" class="node-badge">中心</span>
        </div>
        <div class="node-name">{{ task.name }}</div>
        <div class="node-image">{{ task.image }}</div>
      </div>
    </div>

    <!-- 提示文本 -->
    <div class="canvas-hint">拖动空白处移动画布 · 滚轮缩放</div>
  </div>
</template>

<style scoped>
.blueprint-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #f8f9fa;
  overflow: hidden;
  cursor: grab;
  user-select: none;
}

.blueprint-canvas:active {
  cursor: grabbing;
}

/* 工具栏 */
.canvas-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 100;
}

.toolbar-btn {
  padding: 6px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  color: #555;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.toolbar-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.scale-text {
  font-size: 13px;
  color: #666;
  min-width: 48px;
  text-align: center;
  font-family: monospace;
}

/* 图例 */
.legend {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 100;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #555;
}

.legend-line {
  width: 24px;
  height: 3px;
  border-radius: 2px;
}

/* 画布内容 */
.canvas-content {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  transform-origin: center center;
  transition: transform 0.1s ease-out;
}

.connections-layer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* 任务节点 */
.task-node {
  position: absolute;
  width: 220px;
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.task-node:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translate(-50%, -50%) scale(1.02);
}

.task-node.center {
  border-color: #409eff;
  background: #f0f7ff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.node-id {
  font-size: 12px;
  font-weight: 500;
  color: #aaa;
  font-family: "SF Mono", Monaco, monospace;
}

.node-badge {
  padding: 2px 8px;
  background: #409eff;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
}

.node-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-image {
  font-size: 12px;
  color: #888;
  font-family: "SF Mono", Monaco, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 提示文本 */
.canvas-hint {
  position: absolute;
  bottom: 20px;
  right: 20px;
  font-size: 12px;
  color: #999;
  background: rgba(255, 255, 255, 0.8);
  padding: 6px 12px;
  border-radius: 4px;
}
</style>
