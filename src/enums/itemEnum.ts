/**
 * 节点状态枚举
 */
export enum NodeStatus {
  COMPLETED = 'completed',
  IN_PROGRESS = 'in_progress',
  PENDING = 'pending'
}

/**
 * 项目状态枚举
 */
export enum ProjectStatus {
  PENDING = 'pending',
  PROGRESS = 'progress',
  COMPLETED = 'completed',
  PAUSED = 'paused'
}

/**
 * 项目类型枚举
 */
export enum ProjectType {
  SELF = 'self',
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  WRITING = 'writing',
  COPY = 'copy',
  VIDEO = 'video'
}
