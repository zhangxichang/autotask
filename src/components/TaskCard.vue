<script setup lang="ts">
import type { Task } from "../types/task";

/**
 * TaskCard 组件 - 任务卡片
 * 在看板网格中显示单个任务的摘要信息
 */

interface Props {
  /** 任务数据 */
  task: Task;
  /** 是否被选中 */
  isActive: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  /** 点击卡片事件 */
  (e: "select", taskId: string): void;
}>();

/**
 * 处理卡片点击
 * @param taskId - 任务ID
 */
function handleClick(taskId: string) {
  emit("select", taskId);
}
</script>

<template>
  <div
    class="task-card"
    :class="{ active: isActive }"
    @click="handleClick(task.id)"
  >
    <div class="card-header">
      <span class="task-id">#{{ task.id }}</span>
    </div>
    <h3 class="task-name">{{ task.name }}</h3>
    <p class="task-desc">{{ task.description }}</p>
  </div>
</template>

<style scoped>
.task-card {
  background: #fff;
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  border-color: #e0e0e0;
}

.task-card.active {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
}

.card-header {
  margin-bottom: 10px;
}

.task-id {
  font-size: 12px;
  font-weight: 500;
  color: #aaa;
  font-family: "SF Mono", Monaco, Inconsolata, "Fira Code", monospace;
}

.task-name {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.task-desc {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
