<script setup lang="ts">
import type { Task } from "../types/task";

/**
 * TaskDetail 组件 - 任务详情面板
 * 在右侧边栏显示选中任务的完整信息
 */

interface Props {
  /** 选中的任务，null 表示未选中 */
  task: Task | null;
  /** 所有任务列表（用于查找前置任务名称） */
  allTasks: Task[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** 点击前置任务事件 */
  (e: "selectPrerequisite", taskId: string): void;
  /** 查看蓝图事件 */
  (e: "viewBlueprint", taskId: string): void;
}>();

/**
 * 获取任务名称
 * @param id - 任务ID
 * @returns 任务名称或未知标识
 */
function getTaskName(id: string): string {
  const task = props.allTasks.find((t) => t.id === id);
  return task ? task.name : `Unknown (${id})`;
}

/**
 * 处理前置任务点击
 * @param prereqId - 前置任务ID
 */
function handlePrerequisiteClick(prereqId: string) {
  emit("selectPrerequisite", prereqId);
}

/**
 * 处理查看蓝图按钮点击
 */
function handleViewBlueprint() {
  if (props.task) {
    emit("viewBlueprint", props.task.id);
  }
}
</script>

<template>
  <div v-if="task" class="detail-content">
    <header class="detail-header">
      <span class="detail-id">#{{ task.id }}</span>
      <h2 class="detail-name">{{ task.name }}</h2>
      <!-- 蓝图按钮 -->
      <button class="blueprint-btn" @click="handleViewBlueprint">
        <span class="blueprint-icon">🗺️</span>
        <span>蓝图</span>
      </button>
    </header>

    <section class="detail-section">
      <h3 class="section-title">描述</h3>
      <p class="section-text">{{ task.description }}</p>
    </section>

    <section class="detail-section">
      <h3 class="section-title">镜像</h3>
      <code class="image-tag">{{ task.image }}</code>
    </section>

    <section class="detail-section">
      <h3 class="section-title">前置任务</h3>
      <div v-if="task.prerequisites.length > 0" class="prereq-list">
        <span
          v-for="prereqId in task.prerequisites"
          :key="prereqId"
          class="prereq-tag"
          @click="handlePrerequisiteClick(prereqId)"
        >
          #{{ prereqId }} {{ getTaskName(prereqId) }}
        </span>
      </div>
      <p v-else class="section-empty">无前置任务</p>
    </section>

    <section class="detail-section">
      <h3 class="section-title">脚本</h3>
      <pre class="code-block"><code>{{ task.script }}</code></pre>
    </section>
  </div>

  <div v-else class="detail-empty">
    <div class="empty-icon">📋</div>
    <p class="empty-text">点击左侧任务卡片<br />查看详细信息</p>
  </div>
</template>

<style scoped>
.detail-content {
  padding: 24px;
}

.detail-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  padding-right: 40px;
  border-bottom: 1px solid #eee;
  position: relative;
}

.detail-id {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #aaa;
  margin-bottom: 8px;
  font-family: "SF Mono", Monaco, Inconsolata, "Fira Code", monospace;
}

.detail-name {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a2e;
  line-height: 1.4;
}

/* 蓝图按钮 */
.blueprint-btn {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #f0f7ff;
  border: 1px solid #409eff;
  border-radius: 8px;
  color: #409eff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.blueprint-btn:hover {
  background: #409eff;
  color: #fff;
}

.blueprint-icon {
  font-size: 14px;
}

.detail-section {
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: #888;
  letter-spacing: 0.5px;
}

.section-text {
  margin: 0;
  font-size: 14px;
  color: #444;
  line-height: 1.7;
}

.section-empty {
  margin: 0;
  font-size: 14px;
  color: #999;
  font-style: italic;
}

.image-tag {
  display: inline-block;
  padding: 6px 12px;
  background: #f0f0f0;
  border-radius: 6px;
  font-size: 13px;
  color: #555;
  font-family: "SF Mono", Monaco, Inconsolata, "Fira Code", monospace;
}

.prereq-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.prereq-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: #f0f0f0;
  border-radius: 6px;
  font-size: 13px;
  color: #555;
  font-family: "SF Mono", Monaco, Inconsolata, "Fira Code", monospace;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.prereq-tag:hover {
  background: #e6f2ff;
  border-color: #409eff;
  color: #409eff;
}

.code-block {
  margin: 0;
  padding: 16px;
  background: #1e1e1e;
  border-radius: 8px;
  overflow-x: auto;
}

.code-block code {
  font-family: "SF Mono", Monaco, Inconsolata, "Fira Code", Consolas, monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #d4d4d4;
  white-space: pre;
  word-wrap: normal;
  word-break: normal;
}

/* 空状态 */
.detail-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}
</style>
