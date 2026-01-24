<template>
  <ElDrawer
    v-model="drawerVisible"
    :title="taskData.name"
    size="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="task-detail-drawer">
      <div class="flex justify-between items-start mb-4">
        <div class="flex-1">
          <p class="text-g-600">{{ taskData.description }}</p>
        </div>
        <div class="flex gap-2 ml-4">
          <el-tag :type="getStatusType(taskData.status)" class="px-3 py-1">
            {{ getStatusText(taskData.status) }}
          </el-tag>
          <el-tag :type="getPriorityType(taskData.priority)" class="px-3 py-1">
            {{ getPriorityText(taskData.priority) }}
          </el-tag>
        </div>
      </div>

      <el-divider />

      <ElRow :gutter="20" class="mt-4">
        <ElCol :span="12">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-full bg-primary/10 flex-cc">
              <el-icon class="text-lg text-primary"><User /></el-icon>
            </div>
            <div>
              <div class="text-sm text-g-600">负责人</div>
              <div class="font-medium">{{ taskData.assignee }}</div>
            </div>
          </div>
        </ElCol>
        <ElCol :span="12">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-full bg-success/10 flex-cc">
              <el-icon class="text-lg text-success"><OfficeBuilding /></el-icon>
            </div>
            <div>
              <div class="text-sm text-g-600">所属项目</div>
              <div class="font-medium">{{ taskData.project_name }}</div>
            </div>
          </div>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20" class="mt-4">
        <ElCol :span="12">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-full bg-info/10 flex-cc">
              <el-icon class="text-lg text-info"><Calendar /></el-icon>
            </div>
            <div>
              <div class="text-sm text-g-600">开始日期</div>
              <div class="font-medium">{{ taskData.start_date }}</div>
            </div>
          </div>
        </ElCol>
        <ElCol :span="12">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-full bg-warning/10 flex-cc">
              <el-icon class="text-lg text-warning"><Clock /></el-icon>
            </div>
            <div>
              <div class="text-sm text-g-600">截止日期</div>
              <div class="font-medium">{{ taskData.end_date }}</div>
            </div>
          </div>
        </ElCol>
      </ElRow>

      <div class="mt-6">
        <div class="text-sm text-g-600 mb-2">任务进度</div>
        <el-progress
          :percentage="taskData.progress"
          :color="getProgressColor(taskData.progress)"
          :stroke-width="16"
          :show-text="true"
        />
      </div>

      <div class="mt-6">
        <div class="text-sm text-g-600 mb-2">创建时间</div>
        <div class="font-medium">{{ taskData.created_at }}</div>
      </div>

      <!-- 成果描述和附件，仅当任务已完成时显示 -->
      <template v-if="taskData.status === 'completed'">
        <el-divider />

        <div class="mt-6">
          <div class="text-sm text-g-600 mb-2">成果描述</div>
          <div class="font-medium bg-gray-50 p-4 rounded-md" v-html="taskData.achievement || '无'">
          </div>
        </div>

        <div class="mt-6" v-if="taskData.attachments && taskData.attachments.length > 0">
          <div class="text-sm text-g-600 mb-3">成果附件</div>
          <div class="flex flex-wrap gap-3">
            <el-tag
              v-for="(file, index) in taskData.attachments"
              :key="index"
              class="cursor-pointer"
              @click="handleAttachmentClick(file)"
            >
              <el-icon><Document /></el-icon>
              {{ file.name || `附件${index + 1}` }}
            </el-tag>
          </div>
        </div>
      </template>
    </div>

    <template #footer>
      <div class="flex gap-2">
        <el-button @click="handleEdit" v-ripple>
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
        <el-button
          type="success"
          @click="handleComplete"
          v-ripple
          :disabled="taskData.status === 'completed'"
        >
          <el-icon><Check /></el-icon>
          标记完成
        </el-button>
        <el-button type="danger" @click="handleDelete" v-ripple>
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
        <el-button @click="handleClose" v-ripple>关闭</el-button>
      </div>
    </template>

    <TaskForm
      v-model:visible="formVisible"
      :task-data="editTaskData"
      :project-list="projectList"
      @submit="handleFormSubmit"
    />

    <TaskCompleteForm
      v-model:visible="completeFormVisible"
      :task-id="taskData.id"
      @submit="handleCompleteSubmit"
    />
  </ElDrawer>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    User,
    OfficeBuilding,
    Calendar,
    Clock,
    Edit,
    Check,
    Delete,
    Document
  } from '@element-plus/icons-vue'
  import type { TaskItem } from '@/types/api/project'
  import TaskForm from './TaskForm.vue'
  import TaskCompleteForm from './TaskCompleteForm.vue'

  defineOptions({ name: 'TaskDetailDrawer' })

  interface Props {
    visible: boolean
    taskData: TaskItem
    projectList: Array<{ id: number; name: string }>
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    taskData: () => ({
      id: 0,
      name: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      progress: 0,
      assignee: '',
      project_id: 0,
      project_name: '',
      start_date: '',
      end_date: '',
      created_at: ''
    }),
    projectList: () => []
  })

  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'complete', taskId: number, achievement: string, attachments: any[]): void
    (e: 'delete', taskId: number): void
    (e: 'update', data: TaskItem): void
  }>()

  const drawerVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const formVisible = ref(false)
  const completeFormVisible = ref(false)
  const editTaskData = ref<TaskItem | undefined>(undefined)

  const getStatusType = (status: string): 'info' | 'primary' | 'warning' | 'success' | 'danger' => {
    const statusMap: Record<string, 'info' | 'primary' | 'warning' | 'success' | 'danger'> = {
      todo: 'info',
      in_progress: 'primary',
      review: 'warning',
      completed: 'success',
      cancelled: 'danger'
    }
    return statusMap[status] || 'info'
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      todo: '待办',
      in_progress: '进行中',
      review: '审核中',
      completed: '已完成',
      cancelled: '已取消'
    }
    return statusMap[status] || status
  }

  const getPriorityType = (
    priority: string
  ): 'info' | 'primary' | 'warning' | 'success' | 'danger' => {
    const priorityMap: Record<string, 'info' | 'primary' | 'warning' | 'success' | 'danger'> = {
      urgent: 'danger',
      high: 'warning',
      medium: 'primary',
      low: 'success'
    }
    return priorityMap[priority] || 'info'
  }

  const getPriorityText = (priority: string) => {
    const priorityMap: Record<string, string> = {
      urgent: '紧急',
      high: '高',
      medium: '中',
      low: '低'
    }
    return priorityMap[priority] || priority
  }

  const getProgressColor = (progress: number) => {
    if (progress < 30) return '#F56C6C'
    if (progress < 70) return '#E6A23C'
    return '#67C23A'
  }

  const handleClose = () => {
    emit('update:visible', false)
  }

  const handleEdit = () => {
    editTaskData.value = { ...props.taskData }
    formVisible.value = true
  }

  const handleComplete = () => {
    completeFormVisible.value = true
  }

  const handleCompleteSubmit = (data: {
    taskId: number
    achievement: string
    attachments: any[]
  }) => {
    console.log('任务完成提交:', data)
    emit('complete', data.taskId, data.achievement, data.attachments)
    ElMessage.success('任务已标记为完成')
    handleClose()
  }

  const handleDelete = async () => {
    try {
      // 检查任务状态，如果已完成则禁止删除
      if (props.taskData.status === 'completed') {
        ElMessage.warning('已完成的任务禁止删除')
        return
      }

      await ElMessageBox.confirm(
        `确定要删除任务「${props.taskData.name}」吗？删除后将无法恢复！`,
        '警告',
        {
          type: 'warning'
        }
      )
      emit('delete', props.taskData.id)
      ElMessage.success('任务已删除')
      handleClose()
    } catch {
      ElMessage.info('已取消操作')
    }
  }

  const handleFormSubmit = (data: TaskItem) => {
    emit('update', data)
    formVisible.value = false
    ElMessage.success('任务更新成功')
  }

  // 处理附件点击事件
  const handleAttachmentClick = (file: any) => {
    console.log('附件点击:', file)
    // 这里可以添加附件下载或预览逻辑
    ElMessage.info('附件功能开发中...')
  }

  watch(
    () => formVisible.value,
    (val) => {
      if (!val) {
        editTaskData.value = undefined
      }
    }
  )
</script>

<style scoped lang="scss">
  .task-detail-drawer {
    .flex-cc {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
