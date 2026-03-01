<script setup lang="ts">
import { ref, computed } from "vue";
import type { Task } from "./types/task";
import {
  mockTasks,
  mockTaskRelations,
  getRelatedTaskIds,
} from "./data/mockTasks";
import TaskCard from "./components/TaskCard.vue";
import TaskDetail from "./components/TaskDetail.vue";
import BlueprintCanvas from "./components/BlueprintCanvas.vue";

/**
 * Viewport 组件 - 任务看板主容器
 * 包含任务网格列表、详情面板和蓝图视图
 */

// ==================== 状态管理 ====================

/** 当前选中的任务ID */
const selectedTaskId = ref<string | null>(null);

/** 搜索关键词 */
const searchQuery = ref("");

/** 是否显示蓝图视图 */
const showBlueprint = ref(false);

/** 蓝图目标/最终任务ID */
const blueprintTargetTaskId = ref<string | null>(null);

// ==================== 计算属性 ====================

/** 所有任务列表 */
const allTasks = computed<Task[]>(() => mockTasks);

/** 当前选中的任务 */
const selectedTask = computed<Task | null>(() => {
  const id = selectedTaskId.value;
  if (id === null) return null;
  return allTasks.value.find((t) => t.id === id) ?? null;
});

/** 是否有选中的任务 */
const hasSelectedTask = computed<boolean>(() => selectedTask.value !== null);

/** 筛选后的任务列表 */
const filteredTasks = computed<Task[]>(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (query === "") return allTasks.value;

  return allTasks.value.filter((task) => {
    return (
      task.name.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query)
    );
  });
});

/** 蓝图目标/最终任务 */
const blueprintTargetTask = computed<Task | null>(() => {
  const id = blueprintTargetTaskId.value;
  if (id === null) return null;
  return allTasks.value.find((t) => t.id === id) ?? null;
});

/** 蓝图相关任务列表（目标任务的完整依赖链） */
const blueprintRelatedTasks = computed<Task[]>(() => {
  const targetId = blueprintTargetTaskId.value;
  if (targetId === null) return [];
  const relatedIds = getRelatedTaskIds(targetId);
  return allTasks.value.filter((t) => relatedIds.has(t.id));
});

/** 蓝图相关关系列表 */
const blueprintRelations = computed(() => {
  const targetId = blueprintTargetTaskId.value;
  if (targetId === null) return [];
  const relatedIds = getRelatedTaskIds(targetId);
  return mockTaskRelations.filter(
    (r) => relatedIds.has(r.from) && relatedIds.has(r.to),
  );
});

// ==================== 事件处理 ====================

/**
 * 选择任务
 * @param taskId - 要选中的任务ID
 */
function selectTask(taskId: string): void {
  selectedTaskId.value = taskId;
}

/**
 * 处理前置任务点击 - 切换到对应任务
 * @param prereqId - 前置任务ID
 */
function handleSelectPrerequisite(prereqId: string): void {
  selectTask(prereqId);
}

/**
 * 关闭详情面板
 */
function closeDetail(): void {
  selectedTaskId.value = null;
}

/**
 * 打开蓝图视图
 * @param taskId - 目标/最终任务ID
 */
function openBlueprint(taskId: string): void {
  blueprintTargetTaskId.value = taskId;
  showBlueprint.value = true;
}

/**
 * 关闭蓝图视图
 */
function closeBlueprint(): void {
  showBlueprint.value = false;
  blueprintTargetTaskId.value = null;
}
</script>

<template>
  <div class="viewport">
    <!-- 主区域：任务网格列表 -->
    <main class="task-main" :class="{ 'with-sidebar': hasSelectedTask }">
      <header class="main-header">
        <h1 class="main-title">任务看板</h1>
        <span class="task-count">共 {{ filteredTasks.length }} 个任务</span>
      </header>

      <!-- 搜索框 -->
      <div class="toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索任务..."
            class="search-input"
          />
        </div>
      </div>

      <!-- 任务网格 -->
      <div class="task-grid">
        <TaskCard
          v-for="task in filteredTasks"
          :key="task.id"
          :task="task"
          :is-active="selectedTaskId === task.id"
          @select="selectTask"
        />
      </div>
    </main>

    <!-- 右侧边栏：任务详情 -->
    <transition name="sidebar">
      <aside v-if="hasSelectedTask && !showBlueprint" class="task-sidebar">
        <button class="close-btn" @click="closeDetail" title="关闭">✕</button>
        <TaskDetail
          :task="selectedTask"
          :all-tasks="allTasks"
          @select-prerequisite="handleSelectPrerequisite"
          @view-blueprint="openBlueprint"
        />
      </aside>
    </transition>

    <!-- 蓝图视图（全屏覆盖） -->
    <transition name="blueprint">
      <BlueprintCanvas
        v-if="showBlueprint && blueprintTargetTask"
        :target-task="blueprintTargetTask"
        :related-tasks="blueprintRelatedTasks"
        :relations="blueprintRelations"
        @close="closeBlueprint"
      />
    </transition>
  </div>
</template>

<style scoped>
.viewport {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  width: 100dvw;
  height: 100dvh;
  display: flex;
  background: #f5f5f5;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
  overflow: hidden;
}

/* 主区域 - 任务网格 */
.task-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 24px 32px;
  overflow: hidden;
  transition: padding-right 0.3s ease;
}

.main-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 20px;
}

.main-title {
  margin: 0;
  font-size: 26px;
  font-weight: 600;
  color: #1a1a2e;
}

.task-count {
  font-size: 14px;
  color: #888;
}

/* 工具栏 */
.toolbar {
  margin-bottom: 20px;
}

.search-box {
  position: relative;
  max-width: 320px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #999;
}

.search-input {
  width: 100%;
  padding: 10px 14px 10px 36px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  background: #fff;
}

.search-input:focus {
  border-color: #409eff;
}

.search-input::placeholder {
  color: #aaa;
}

/* 任务网格 */
.task-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  overflow-y: auto;
  padding: 8px;
  margin: -8px;
  align-content: start;
}

/* 右侧边栏 */
.task-sidebar {
  width: 420px;
  min-width: 420px;
  background: #fff;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #999;
  font-size: 18px;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 1;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #666;
}

/* 侧边栏过渡动画 */
.sidebar-enter-active,
.sidebar-leave-active {
  transition: all 0.3s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* 蓝图过渡动画 */
.blueprint-enter-active,
.blueprint-leave-active {
  transition: all 0.3s ease;
}

.blueprint-enter-from,
.blueprint-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* 滚动条样式 */
.task-grid::-webkit-scrollbar,
.task-sidebar::-webkit-scrollbar {
  width: 6px;
}

.task-grid::-webkit-scrollbar-track,
.task-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.task-grid::-webkit-scrollbar-thumb,
.task-sidebar::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.task-grid::-webkit-scrollbar-thumb:hover,
.task-sidebar::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>
