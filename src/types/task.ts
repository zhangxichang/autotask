/**
 * 任务状态类型
 */
export type TaskStatus = "pending" | "in_progress" | "completed";

/**
 * 任务优先级类型
 */
export type TaskPriority = "high" | "medium" | "low";

/**
 * 任务关系类型
 */
export type TaskRelationType = "depends_on" | "parallel" | "condition";

/**
 * 任务关系接口
 */
export interface TaskRelation {
  /** 源任务ID */
  from: string;
  /** 目标任务ID */
  to: string;
  /** 关系类型 */
  type: TaskRelationType;
  /** 条件表达式（仅 condition 类型有效） */
  condition?: string;
}

/**
 * 任务接口定义
 */
export interface Task {
  /** 任务唯一标识 */
  id: string;
  /** 任务名称 */
  name: string;
  /** 任务描述 */
  description: string;
  /** 运行镜像 */
  image: string;
  /** 前置任务ID列表 */
  prerequisites: string[];
  /** 执行脚本 */
  script: string;
}

/**
 * 任务节点在蓝图中的位置
 */
export interface TaskNodePosition {
  /** 任务ID */
  taskId: string;
  /** X坐标 */
  x: number;
  /** Y坐标 */
  y: number;
}

/**
 * 蓝图视图状态
 */
export interface BlueprintViewState {
  /** 中心任务ID（当前查看蓝图的根任务） */
  centerTaskId: string;
  /** 画布缩放比例 */
  scale: number;
  /** 画布偏移X */
  offsetX: number;
  /** 画布偏移Y */
  offsetY: number;
}

/**
 * 任务筛选选项
 */
export interface TaskFilterOptions {
  /** 搜索关键词 */
  query: string;
}
