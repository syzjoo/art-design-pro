<template>
  <div class="todo-container">
    <h1 class="page-title">每日任务管理</h1>

    <!-- 统计卡片区域 -->
    <div class="stats-section">
      <ArtStatsCard
        :title="'今日任务总数'"
        :count="totalTasks"
        :icon="'ri:task-line'"
        :iconStyle="'bg-[#409EFF]'"
        :description="'今日所有任务数量'"
      />
      <ArtStatsCard
        :title="'已完成任务'"
        :count="completedTasks"
        :icon="'ri:check-double-line'"
        :iconStyle="'bg-[#67C23A]'"
        :description="'今日已完成的任务数量'"
      />
      <ArtStatsCard
        :title="'待完成任务'"
        :count="pendingTasks"
        :icon="'ri:time-line'"
        :iconStyle="'bg-[#E6A23C]'"
        :description="'今日待完成的任务数量'"
      />
      <ArtStatsCard
        :title="'延期任务'"
        :count="delayedTasks"
        :icon="'ri:alert-line'"
        :iconStyle="'bg-[#F56C6C]'"
        :description="'今日已延期的任务数量'"
      />
    </div>

    <!-- 进度图表区域 -->
    <div class="chart-section">
      <ArtDonutChartCard
        :title="'今日任务完成进度'"
        :data="progressData"
        :value="completedTasks"
        :percentage="progressPercentage"
        :label="'任务完成率'"
        :height="11"
      />
      <ArtBarChartCard
        :title="'最近7天已完成任务'"
        :value="completedTasks"
        :label="'今日已完成'"
        :percentage="progressPercentage"
        :chart-data="recentTasksData[0].data"
      />
      <ArtBarChartCard
        :title="'最近7天未完成任务'"
        :value="totalTasks - completedTasks"
        :label="'今日未完成'"
        :percentage="100 - progressPercentage"
        :chart-data="recentTasksData[1].data"
      />
    </div>

    <!-- 任务列表区域 -->
    <div class="task-list-section">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <span>今日任务列表</span>
              <div class="view-switch">
                <el-button
                  type="text"
                  :icon="List"
                  :class="{ active: listType === 'list' }"
                  @click="listType = 'list'"
                >
                  列表视图
                </el-button>
                <el-button
                  type="text"
                  :icon="Grid"
                  :class="{ active: listType === 'card' }"
                  @click="listType = 'card'"
                >
                  卡片视图
                </el-button>
              </div>
            </div>
            <el-button type="primary" size="small" @click="addTask">
              <el-icon><Plus /></el-icon>
              新增任务
            </el-button>
          </div>
        </template>

        <!-- 任务列表组件 -->
        <TableTodoList
          :list-type="listType"
          :tasks="todayTasks"
          :loading="loading"
          @complete="completeTask"
          @uncomplete="uncompleteTask"
          @edit="editTask"
          @delete="deleteTask"
          @selection-change="handleSelectionChange"
        />
      </el-card>
    </div>

    <!-- 任务编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="taskForm" :rules="rules" ref="taskFormRef" label-width="80px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="taskForm.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="所属项目" prop="projectName">
          <el-select v-model="taskForm.projectName" placeholder="请选择项目">
            <el-option
              v-for="project in projects"
              :key="project.id"
              :label="project.name"
              :value="project.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属节点" prop="nodeName">
          <el-select v-model="taskForm.nodeName" placeholder="请选择节点">
            <el-option
              v-for="node in nodes"
              :key="node.id"
              :label="node.title"
              :value="node.title"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="taskForm.priority" placeholder="请选择优先级">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="taskForm.status" placeholder="请选择状态">
            <el-option label="待开始" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已延期" value="delayed" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker
            v-model="taskForm.deadline"
            type="datetime"
            placeholder="请选择截止时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="任务成果">
          <ArtWangEditor
            ref="taskResultEditorRef"
            v-model="taskForm.resultContent"
            :height="'200px'"
            :placeholder="'请输入任务成果描述...'"
            class="mb-3"
          />
          <div class="mb-3">
            <el-upload
              ref="fileUploadRef"
              v-model:file-list="taskForm.resultFiles"
              :auto-upload="false"
              :multiple="true"
              :limit="5"
              :on-exceed="handleExceed"
              :before-upload="beforeUpload"
              class="mb-2"
            >
              <el-button type="primary" size="small">
                <el-icon><Plus /></el-icon>
                选择文件
              </el-button>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTask">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { Plus, List, Grid } from '@element-plus/icons-vue'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import ArtStatsCard from '@/components/core/cards/art-stats-card/index.vue'
  import ArtDonutChartCard from '@/components/core/cards/art-donut-chart-card/index.vue'
  import ArtBarChartCard from '@/components/core/cards/art-bar-chart-card/index.vue'
  import ArtWangEditor from '@/components/core/forms/art-wang-editor/index.vue'
  import { projectApi } from '@/api/item'
  import type { Project, ProjectNode } from '@/types/api/item'

  import TableTodoList from './modules/TableTodoList.vue'

  // 任务数据类型
  interface TodoTask {
    id: number
    name: string
    projectName: string
    nodeName: string
    priority: 'high' | 'medium' | 'low'
    status: 'completed' | 'in_progress' | 'pending' | 'delayed'
    deadline: string
    resultContent?: string
    resultFiles?: any[]
  }

  // 模拟数据
  const todayTasks = ref<TodoTask[]>([
    {
      id: 1,
      name: '完成项目架构设计',
      projectName: '每日学习自律打卡',
      nodeName: '需求分析',
      priority: 'high',
      status: 'completed',
      deadline: '2026-01-07 12:00:00'
    },
    {
      id: 2,
      name: '实现用户认证功能',
      projectName: '个人博客系统',
      nodeName: '前端开发',
      priority: 'high',
      status: 'in_progress',
      deadline: '2026-01-07 18:00:00'
    },
    {
      id: 3,
      name: '编写API文档',
      projectName: '个人博客系统',
      nodeName: '后端开发',
      priority: 'medium',
      status: 'pending',
      deadline: '2026-01-07 20:00:00'
    },
    {
      id: 4,
      name: '修复登录页面样式问题',
      projectName: '个人博客系统',
      nodeName: '前端开发',
      priority: 'low',
      status: 'pending',
      deadline: '2026-01-07 22:00:00'
    },
    {
      id: 5,
      name: '完成数据库优化',
      projectName: '个人博客系统',
      nodeName: '后端开发',
      priority: 'medium',
      status: 'delayed',
      deadline: '2026-01-06 20:00:00'
    },
    {
      id: 6,
      name: '设计用户界面原型',
      projectName: '个人博客系统',
      nodeName: 'UI设计',
      priority: 'high',
      status: 'pending',
      deadline: '2026-01-08 10:00:00'
    },
    {
      id: 7,
      name: '实现文章列表功能',
      projectName: '个人博客系统',
      nodeName: '前端开发',
      priority: 'medium',
      status: 'pending',
      deadline: '2026-01-08 15:00:00'
    },
    {
      id: 8,
      name: '实现文章详情功能',
      projectName: '个人博客系统',
      nodeName: '前端开发',
      priority: 'medium',
      status: 'pending',
      deadline: '2026-01-08 18:00:00'
    },
    {
      id: 9,
      name: '实现评论功能',
      projectName: '个人博客系统',
      nodeName: '后端开发',
      priority: 'low',
      status: 'pending',
      deadline: '2026-01-09 12:00:00'
    },
    {
      id: 10,
      name: '实现搜索功能',
      projectName: '个人博客系统',
      nodeName: '后端开发',
      priority: 'medium',
      status: 'pending',
      deadline: '2026-01-09 15:00:00'
    },
    {
      id: 11,
      name: '进行系统测试',
      projectName: '个人博客系统',
      nodeName: '测试',
      priority: 'high',
      status: 'pending',
      deadline: '2026-01-10 12:00:00'
    },
    {
      id: 12,
      name: '部署上线',
      projectName: '个人博客系统',
      nodeName: '运维',
      priority: 'high',
      status: 'pending',
      deadline: '2026-01-10 18:00:00'
    }
  ])

  // 列表视图类型
  const listType = ref<'list' | 'card'>('list')

  // 加载状态
  const loading = ref(false)

  // 项目和节点数据
  const projects = ref<Project[]>([])
  const nodes = ref<ProjectNode[]>([])

  // 统计数据计算
  const totalTasks = computed(() => todayTasks.value.length)
  const completedTasks = computed(
    () => todayTasks.value.filter((task) => task.status === 'completed').length
  )
  const pendingTasks = computed(
    () => todayTasks.value.filter((task) => task.status === 'pending').length
  )
  const delayedTasks = computed(
    () => todayTasks.value.filter((task) => task.status === 'delayed').length
  )

  // 进度数据
  const progressPercentage = computed(() => {
    if (totalTasks.value === 0) return 0
    return Math.round((completedTasks.value / totalTasks.value) * 100)
  })

  const progressData = computed<[number, number]>(() => [
    progressPercentage.value,
    100 - progressPercentage.value
  ])

  // 最近7天任务数据
  const recentTasksData = computed<
    {
      name: string
      type: string
      data: number[]
    }[]
  >(() => [
    {
      name: '已完成',
      type: 'bar',
      data: [5, 6, 4, 7, 3, 6, completedTasks.value]
    },
    {
      name: '未完成',
      type: 'bar',
      data: [3, 2, 5, 1, 4, 3, totalTasks.value - completedTasks.value]
    }
  ])

  // 任务编辑弹窗
  const dialogVisible = ref(false)
  const dialogTitle = ref('新增任务')
  const taskFormRef = ref()
  const taskResultEditorRef = ref()
  const fileUploadRef = ref()
  const taskForm = reactive({
    id: 0,
    name: '',
    projectName: '',
    nodeName: '',
    priority: 'medium',
    status: 'pending',
    deadline: '',
    resultContent: '',
    resultFiles: []
  })

  const rules = reactive({
    name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
    projectName: [{ required: true, message: '请选择所属项目', trigger: 'change' }],
    nodeName: [{ required: true, message: '请选择所属节点', trigger: 'change' }]
  })

  // 获取项目和节点数据
  onMounted(async () => {
    try {
      const projectsRes = await projectApi.getProjectList({ page: 1, pageSize: 10 })
      projects.value = projectsRes.list

      // 获取所有节点
      const allNodes: ProjectNode[] = []
      for (const project of projects.value) {
        const projectDetail = await projectApi.getProjectDetail(project.id)
        if (projectDetail.nodes) {
          allNodes.push(...projectDetail.nodes)
        }
      }
      nodes.value = allNodes
    } catch (error) {
      console.error('获取数据失败:', error)
    }
  })

  // 打开任务编辑弹窗
  const openDialog = (task?: TodoTask) => {
    dialogVisible.value = true
    if (task) {
      dialogTitle.value = '编辑任务'
      Object.assign(taskForm, task)
    } else {
      dialogTitle.value = '新增任务'
      resetForm()
    }
  }

  // 重置表单
  const resetForm = () => {
    Object.assign(taskForm, {
      id: 0,
      name: '',
      projectName: '',
      nodeName: '',
      priority: 'medium',
      status: 'pending',
      deadline: '',
      resultContent: '',
      resultFiles: []
    })
    if (taskFormRef.value) {
      taskFormRef.value.resetFields()
    }
  }

  // 新增任务
  const addTask = () => {
    openDialog()
  }

  // 编辑任务
  const editTask = (task: TodoTask) => {
    openDialog(task)
  }

  // 保存任务
  const saveTask = async () => {
    if (!taskFormRef.value) return

    try {
      await taskFormRef.value.validate()

      if (taskForm.id) {
        // 更新任务
        const index = todayTasks.value.findIndex((task) => task.id === taskForm.id)
        if (index !== -1) {
          todayTasks.value[index] = { ...(taskForm as TodoTask) }
          ElMessage.success('任务更新成功')
        }
      } else {
        // 新增任务
        const newTask: TodoTask = {
          ...(taskForm as TodoTask),
          id: Date.now()
        }
        todayTasks.value.push(newTask)
        ElMessage.success('任务新增成功')
      }

      dialogVisible.value = false
    } catch (error) {
      console.error('保存任务失败:', error)
      ElMessage.error('保存任务失败')
    }
  }

  // 完成任务
  const completeTask = (id: number) => {
    const task = todayTasks.value.find((task) => task.id === id)
    if (task) {
      task.status = 'completed'
      ElMessage.success('任务已完成')
    }
  }

  // 撤销完成任务
  const uncompleteTask = (id: number) => {
    const task = todayTasks.value.find((task) => task.id === id)
    if (task) {
      task.status = 'in_progress'
      ElMessage.success('已撤销完成状态')
    }
  }

  // 删除任务
  const deleteTask = (id: number) => {
    ElMessageBox.confirm('确定要删除这个任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        const index = todayTasks.value.findIndex((task) => task.id === id)
        if (index !== -1) {
          todayTasks.value.splice(index, 1)
          ElMessage.success('任务已删除')
        }
      })
      .catch(() => {
        // 取消删除
      })
  }

  // 文件上传处理函数
  const handleExceed = () => {
    ElMessage.warning(`最多只能上传5个文件`)
  }

  const beforeUpload = (file: File) => {
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      ElMessage.error('上传文件大小不能超过 2MB!')
    }
    return isLt2M
  }

  // 处理任务选择变化
  const handleSelectionChange = (selection: TodoTask[]) => {
    // 这里可以添加选择变化的处理逻辑
    console.log('选中的任务:', selection)
  }
</script>

<style scoped>
  .todo-container {
    min-height: calc(100vh - 80px);
    padding: 20px;
  }

  .page-title {
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: bold;
    color: #333;
  }

  .stats-section {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 30px;
  }

  .chart-section {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 30px;
  }

  .chart-section :deep(.art-card) {
    flex: 1;
    min-width: 300px;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
  }

  .task-list-section {
    margin-bottom: 30px;
  }

  .dialog-footer {
    text-align: right;
  }

  /* 响应式设计 */
  @media screen and (width <= 768px) {
    .todo-container {
      padding: 10px;
    }

    .stats-section {
      gap: 10px;
    }

    .stats-section :deep(.art-card) {
      flex: 1;
      min-width: calc(50% - 5px);
    }

    .chart-section {
      flex-direction: column;
    }

    .chart-section :deep(.art-card) {
      min-width: 100%;
    }
  }

  /* 表格行悬停效果 */
  :deep(.el-table__row:hover) {
    background-color: #f5f7fa;
  }

  /* 操作按钮间距 */
  :deep(.el-button) {
    margin-right: 8px;
  }

  :deep(.el-button:last-child) {
    margin-right: 0;
  }
</style>
