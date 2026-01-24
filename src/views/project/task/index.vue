<template>
  <div class="task-page art-full-height flex flex-col">
    <ArtSearchBar
      v-model="formFilters"
      :items="formItems"
      :showExpand="true"
      @reset="handleReset"
      @search="handleSearch"
      class="search-bar"
    />

    <ElCard class="art-table-card flex-1" shadow="never">
      <ArtTableHeader
        :showZebra="false"
        :loading="loading"
        v-model:columns="columns"
        @refresh="handleRefresh"
      >
        <template #left>
          <ElButton type="primary" @click="handleAddTask" v-ripple>
            <el-icon><Plus /></el-icon>
            创建任务
          </ElButton>
          <ElButton type="danger" @click="handleBatchDelete" v-ripple>批量删除</ElButton>
        </template>
        <template #right>
          <div class="flex gap-2">
            <el-button-group>
              <el-button
                :type="viewMode === 'list' ? 'primary' : 'default'"
                @click="viewMode = 'list'"
              >
                <el-icon><List /></el-icon>
              </el-button>
              <el-button
                :type="viewMode === 'kanban' ? 'primary' : 'default'"
                @click="viewMode = 'kanban'"
              >
                <el-icon><Grid /></el-icon>
              </el-button>
            </el-button-group>
          </div>
        </template>
      </ArtTableHeader>

      <div v-if="viewMode === 'list'">
        <ArtTable
          :data="taskList"
          :columns="columns"
          :loading="loading"
          v-loading="loading"
          stripe
          border
          ref="tableRef"
          style="transition: opacity 0.3s ease"
        >
          <template #status="{ row }">
            <el-tag :type="getStatusType(row?.status || '')">{{
              getStatusText(row?.status || '')
            }}</el-tag>
          </template>
          <template #priority="{ row }">
            <el-tag :type="getPriorityType(row?.priority || '')">{{
              getPriorityText(row?.priority || '')
            }}</el-tag>
          </template>
          <template #progress="{ row }">
            <el-progress
              :percentage="row?.progress || 0"
              :color="getProgressColor(row?.progress || 0)"
            />
          </template>
          <template #assignee="{ row }">
            <div class="flex items-center gap-2">
              <el-avatar :size="32">{{ (row?.assignee || '').charAt(0) }}</el-avatar>
              <span>{{ row?.assignee || '未分配' }}</span>
            </div>
          </template>
          <template #action="{ row }">
            <ArtButtonTable type="view" @click="handleViewDetail(row)" />
            <ArtButtonTable type="edit" @click="handleEdit(row)" />
            <ArtButtonTable type="delete" @click="handleDelete(row)" />
          </template>
        </ArtTable>

        <div class="flex justify-end mt-4">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>

      <div v-else class="kanban-view">
        <ElRow :gutter="20">
          <ElCol :span="6" v-for="status in kanbanStatuses" :key="status.value">
            <div class="art-card h-full">
              <div class="flex items-center justify-between mb-4">
                <div class="font-medium text-lg">{{ status.label }}</div>
                <el-tag :type="status.type">{{ getTasksByStatus(status.value).length }}</el-tag>
              </div>
              <div class="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                <div
                  v-for="task in getTasksByStatus(status.value)"
                  :key="task.id"
                  class="p-3 bg-white rounded-lg shadow-sm hover:shadow-md cursor-pointer transition"
                  @click="handleViewDetail(task)"
                >
                  <div class="flex items-start justify-between mb-2">
                    <span class="font-medium">{{ task?.name || '' }}</span>
                    <el-tag :type="getPriorityType(task?.priority || '')" size="small">
                      {{ getPriorityText(task?.priority || '') }}
                    </el-tag>
                  </div>
                  <div class="text-sm text-g-600 mb-2">{{ task?.description || '' }}</div>
                  <div class="flex items-center gap-2 text-sm text-g-500">
                    <el-avatar :size="24">{{ (task?.assignee || '').charAt(0) }}</el-avatar>
                    <span>{{ task?.assignee || '未分配' }}</span>
                  </div>
                  <div class="mt-2">
                    <el-progress
                      :percentage="task?.progress || 0"
                      :color="getProgressColor(task?.progress || 0)"
                      :stroke-width="6"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ElCol>
        </ElRow>
      </div>

      <TaskForm
        v-model:visible="dialogVisible"
        :task-data="editTaskData"
        :project-list="projectList"
        @submit="handleFormSubmit"
      />

      <TaskDetailDrawer
        v-model:visible="detailVisible"
        :task-data="selectedTask"
        :project-list="projectList"
        @complete="handleCompleteTask"
        @delete="handleDeleteTask"
        @update="handleUpdateTask"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { Plus, List, Grid } from '@element-plus/icons-vue'
  import { ElMessage, ElButton, ElMessageBox } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import type { TaskItemWithDependencies, ProjectItem } from '@/types/api/project'
  import {
    getTaskList,
    getProjectList,
    createTask,
    updateTask,
    deleteTask,
    batchDeleteTasks,
    completeTask
  } from '@/api/project'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import TaskForm from './modules/TaskForm.vue'
  import TaskDetailDrawer from './modules/TaskDetailDrawer.vue'

  defineOptions({ name: 'ProjectTask' })

  const loading = ref(false)
  const viewMode = ref<'list' | 'kanban'>('list')
  const dialogVisible = ref(false)
  const detailVisible = ref(false)
  const editTaskData = ref<TaskItemWithDependencies | undefined>(undefined)
  const selectedTask = ref<TaskItemWithDependencies>({
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
    created_at: '',
    dependencies: []
  })
  const tableRef = ref<any>(null)

  const initialSearchState = {
    keyword: '',
    project_id: '',
    status: '',
    priority: '',
    assignee: '',
    start_date: '',
    end_date: ''
  }

  const formFilters = reactive({ ...initialSearchState })
  const appliedFilters = reactive({ ...initialSearchState })

  const projectList = ref<ProjectItem[]>([])

  const formItems = computed(() => [
    {
      label: '',
      key: 'keyword',
      type: 'input',
      placeholder: '搜索任务名称或描述',
      clearable: true
    },
    {
      label: '所属项目',
      key: 'project_id',
      type: 'select',
      placeholder: '选择项目',
      options: [
        { value: '', label: '全部项目' },
        ...projectList.value.map((project) => ({
          value: project.id,
          label: project.name
        }))
      ]
    },
    {
      label: '任务状态',
      key: 'status',
      type: 'select',
      placeholder: '选择状态',
      options: [
        { value: '', label: '全部状态' },
        { value: 'todo', label: '待办' },
        { value: 'in_progress', label: '进行中' },
        { value: 'review', label: '审核中' },
        { value: 'completed', label: '已完成' },
        { value: 'cancelled', label: '已取消' }
      ]
    },
    {
      label: '优先级',
      key: 'priority',
      type: 'select',
      placeholder: '选择优先级',
      options: [
        { value: '', label: '全部优先级' },
        { value: 'urgent', label: '紧急' },
        { value: 'high', label: '高' },
        { value: 'medium', label: '中' },
        { value: 'low', label: '低' }
      ]
    },
    {
      label: '负责人',
      key: 'assignee',
      type: 'input',
      placeholder: '请输入负责人',
      clearable: true
    },
    {
      label: '开始日期',
      key: 'start_date',
      type: 'date',
      placeholder: '选择开始日期'
    },
    {
      label: '截止日期',
      key: 'end_date',
      type: 'date',
      placeholder: '选择截止日期'
    }
  ])

  const taskList = ref<TaskItemWithDependencies[]>([])
  const columns = ref<ColumnOption[]>([
    { type: 'selection', width: 55 },
    { prop: 'name', label: '任务名称', width: 200, sortable: true },
    { prop: 'description', label: '任务描述', minWidth: 200 },
    {
      prop: 'status',
      label: '状态',
      width: 120,
      slotName: 'status',
      useSlot: true,
      sortable: true
    },
    {
      prop: 'priority',
      label: '优先级',
      width: 100,
      slotName: 'priority',
      useSlot: true,
      sortable: true
    },
    { prop: 'progress', label: '进度', width: 150, slotName: 'progress', useSlot: true },
    {
      prop: 'assignee',
      label: '负责人',
      width: 120,
      slotName: 'assignee',
      useSlot: true,
      sortable: true
    },
    { prop: 'project_name', label: '所属项目', width: 150, sortable: true },
    { prop: 'start_date', label: '开始日期', width: 150, sortable: true },
    { prop: 'end_date', label: '截止日期', width: 150, sortable: true },
    { prop: 'action', label: '操作', width: 200, fixed: 'right', slotName: 'action', useSlot: true }
  ])

  const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 6
  })

  const kanbanStatuses = [
    { value: 'todo', label: '待办', type: 'info' as const },
    { value: 'in_progress', label: '进行中', type: 'primary' as const },
    { value: 'review', label: '审核中', type: 'warning' as const },
    { value: 'completed', label: '已完成', type: 'success' as const }
  ]

  const getStatusType = (status: string) => {
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

  const getPriorityType = (priority: string) => {
    const priorityMap: Record<string, 'danger' | 'warning' | 'primary' | 'success'> = {
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

  const getTasksByStatus = (status: string) => {
    return taskList.value.filter((task) => task && task.status === status)
  }

  const handleSearch = () => {
    Object.assign(appliedFilters, formFilters)
    handleRefresh()
  }

  const handleReset = () => {
    Object.assign(formFilters, initialSearchState)
    Object.assign(appliedFilters, initialSearchState)
    handleRefresh()
  }

  const handleRefresh = async () => {
    loading.value = true
    try {
      const params = {
        page: pagination.currentPage,
        page_size: pagination.pageSize,
        keyword: appliedFilters.keyword,
        project_id: appliedFilters.project_id ? Number(appliedFilters.project_id) : undefined,
        status: appliedFilters.status as any,
        priority: appliedFilters.priority as any,
        assignee: appliedFilters.assignee,
        start_date: appliedFilters.start_date,
        end_date: appliedFilters.end_date
      }

      const response = await getTaskList(params)
      // 直接使用返回的数据，因为HTTP工具已经处理了响应结构
      if (response && response.data && Array.isArray(response.data)) {
        taskList.value = response.data
        pagination.total = response.total || 0
      } else {
        taskList.value = []
        pagination.total = 0
      }
    } catch (error) {
      console.error('获取任务列表失败:', error)
      ElMessage.error('获取任务列表失败，请稍后重试')
      taskList.value = []
      pagination.total = 0
    } finally {
      loading.value = false
    }
  }

  const handleAddTask = () => {
    editTaskData.value = undefined
    dialogVisible.value = true
  }

  const handleViewDetail = (row: TaskItemWithDependencies) => {
    selectedTask.value = { ...row }
    detailVisible.value = true
  }

  const handleEdit = (row: TaskItemWithDependencies) => {
    editTaskData.value = { ...row }
    dialogVisible.value = true
  }

  const handleDelete = async (row: TaskItemWithDependencies) => {
    try {
      // 检查任务状态，如果已完成则禁止删除
      if (row.status === 'completed') {
        ElMessage.warning('已完成的任务禁止删除')
        return
      }

      await ElMessageBox.confirm(`确定要删除任务「${row.name}」吗？`, '提示', {
        type: 'warning'
      })
      await deleteTask(row.id)
      const index = taskList.value.findIndex((t: TaskItemWithDependencies) => t.id === row.id)
      if (index > -1) {
        taskList.value.splice(index, 1)
        pagination.total = taskList.value.length
      }
      ElMessage.success('删除成功')
      handleRefresh()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
        console.error('任务删除失败:', error)
      } else {
        ElMessage.info('已取消删除')
      }
    }
  }

  const handleFormSubmit = async (data: TaskItemWithDependencies) => {
    try {
      if (data.id && data.id < 10000) {
        // 编辑模式（ID 是数据库生成的小数字）
        const updatedTask = await updateTask(data.id, data)
        if (updatedTask) {
          const index = taskList.value.findIndex((t: TaskItemWithDependencies) => t.id === data.id)
          if (index > -1) {
            taskList.value[index] = updatedTask
          }
          ElMessage.success('任务更新成功')
        }
      } else {
        // 新建模式（ID 是时间戳或不存在）
        const newTask = await createTask(data)
        if (newTask) {
          taskList.value.unshift(newTask)
          pagination.total++
          ElMessage.success('任务创建成功')
        }
      }
      handleRefresh()
    } catch (error) {
      ElMessage.error('操作失败')
      console.error('任务操作失败:', error)
    }
  }

  const handleBatchDelete = async () => {
    const selectedRows = tableRef.value?.elTableRef?.getSelectionRows() || []
    if (selectedRows.length === 0) {
      ElMessage.warning('请先选择要删除的任务')
      return
    }

    // 检查选中的任务是否有已完成的任务
    const completedTasks = selectedRows.filter(
      (r: TaskItemWithDependencies) => r.status === 'completed'
    )
    if (completedTasks.length > 0) {
      ElMessage.warning(
        `选中的任务中有 ${completedTasks.length} 个已完成的任务，已完成的任务禁止删除`
      )
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.length} 个任务吗？删除后将无法恢复！`,
        '警告',
        {
          type: 'warning'
        }
      )
      const ids = selectedRows.map((r: TaskItemWithDependencies) => r.id)
      await batchDeleteTasks(ids)
      ElMessage.success('批量删除成功')
      handleRefresh()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('批量删除失败')
        console.error('批量删除失败:', error)
      } else {
        ElMessage.info('已取消操作')
      }
    }
  }

  const handleCompleteTask = async (taskId: number, achievement?: string, attachments?: any[]) => {
    try {
      await completeTask(taskId, { achievement, attachments })
      ElMessage.success('任务已完成')
      handleRefresh()
    } catch (error) {
      ElMessage.error('操作失败')
      console.error('任务完成失败:', error)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId)
      ElMessage.success('任务已删除')
      handleRefresh()
    } catch (error) {
      ElMessage.error('操作失败')
      console.error('任务删除失败:', error)
    }
  }

  const handleUpdateTask = async (data: TaskItemWithDependencies) => {
    try {
      await updateTask(data.id, data)
      ElMessage.success('任务已更新')
      handleRefresh()
    } catch (error) {
      ElMessage.error('操作失败')
      console.error('任务更新失败:', error)
    }
  }

  const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    handleRefresh()
  }

  const handlePageChange = (page: number) => {
    pagination.currentPage = page
    handleRefresh()
  }

  const loadProjects = async () => {
    try {
      // 获取所有项目
      const response = await getProjectList()

      // 处理 API 响应
      if (response && response.data && Array.isArray(response.data)) {
        projectList.value = response.data
      } else {
        projectList.value = []
      }
    } catch (error) {
      console.error('获取项目列表失败:', error)
      ElMessage.error('获取项目列表失败')
      projectList.value = []
    }
  }

  onMounted(async () => {
    await loadProjects()
    await handleRefresh()
  })
</script>
