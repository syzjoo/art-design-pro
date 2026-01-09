<!-- 项目详情页面 -->
<template>
  <div :style="$props.style" :class="$props.class">
    <div class="item-detail page-content">
      <div class="max-w-7xl mx-auto mt-8">
        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-20">
          <el-icon class="text-4xl text-blue-500 animate-spin">
            <Loading />
          </el-icon>
          <p class="mt-4 text-gray-500">加载中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="text-center py-20">
          <el-icon class="text-4xl text-red-500">
            <CircleCloseFilled />
          </el-icon>
          <p class="mt-4 text-gray-500">{{ error }}</p>
          <el-button type="primary" @click="loadData" class="mt-6">重试</el-button>
        </div>

        <!-- 项目内容 -->
        <div v-else-if="item" class="item-content">
          <!-- 项目头部信息 -->
          <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div class="flex items-start justify-between mb-6">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-4">
                  <span
                    class="inline-block w-3 h-3 rounded-full"
                    :style="{ backgroundColor: getTypeColor(item.type) }"
                  ></span>
                  <span class="px-3 py-1 text-sm rounded-full" :style="getTypeStyle(item.type)">
                    {{ getTypeName(item.type) }}
                  </span>
                  <span class="px-3 py-1 text-sm rounded-full" :style="getStatusStyle(item.status)">
                    {{ getStatusName(item.status) }}
                  </span>
                </div>
                <h1 class="text-3xl font-bold text-gray-800 mb-4">{{ item.name }}</h1>
                <p class="text-gray-600 text-lg leading-relaxed">{{ item.description }}</p>
              </div>
              <div class="flex flex-col gap-3 ml-6">
                <el-button type="primary" size="large" @click="handleEdit">
                  <el-icon><Edit /></el-icon>
                  编辑项目
                </el-button>
                <el-button type="success" size="large" @click="handleExport">
                  <el-icon><Download /></el-icon>
                  导出报告
                </el-button>
              </div>
            </div>

            <!-- 项目统计信息 -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <ArtStatsCard
                icon="ri:progress-3-line"
                icon-style="bg-primary/10 text-primary"
                title="项目进度"
                :count="item.progress || 0"
                description="整体完成度"
                text-color="#409EFF"
              />
              <ArtStatsCard
                icon="ri:check-circle-line"
                icon-style="bg-success/10 text-success"
                title="已完成节点"
                :count="completedNodesCount"
                description="已完成的任务节点"
                text-color="#67C23A"
              />
              <ArtStatsCard
                icon="ri:time-line"
                icon-style="bg-warning/10 text-warning"
                title="进行中节点"
                :count="inProgressNodesCount"
                description="正在进行的任务节点"
                text-color="#E6A23C"
              />
              <ArtStatsCard
                icon="ri:calendar-line"
                icon-style="bg-info/10 text-info"
                title="剩余天数"
                :count="getDaysRemaining()"
                description="距离项目结束"
                text-color="#909399"
              />
            </div>

            <!-- 项目进度可视化 -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <!-- 进度仪表盘 -->
              <ArtDonutChartCard
                title="整体进度"
                :value="item.progress || 0"
                :percentage="0"
                :data="[item.progress || 0, 100 - (item.progress || 0)]"
                current-value="已完成"
                previous-value="未完成"
              />

              <!-- 状态分布饼图 -->
              <ArtDonutChartCard
                title="节点状态分布"
                :value="projectNodes.length"
                :percentage="0"
                :data="[completedNodesCount, inProgressNodesCount + pendingNodesCount]"
                current-value="已完成"
                previous-value="未完成"
              />

              <!-- 工时统计柱状图 -->
              <ArtBarChartCard
                :value="totalActualHours"
                label="实际总工时"
                :percentage="0"
                :chart-data="[20, 35, 15, 40, 25, 30]"
              />
            </div>
          </div>

          <!-- 项目节点时间轴（核心内容） -->
          <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <el-icon class="text-primary"><Clock /></el-icon>
                项目节点时间轴
              </h2>
              <div class="text-sm text-gray-500">
                共 {{ projectNodes.length }} 个节点 | 已完成 {{ completedNodesCount }} 个
              </div>
            </div>

            <!-- 进度概览 -->
            <div class="mb-6 p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">整体进度</span>
                <span class="text-sm font-bold" :class="getProgressTextClass(item.progress)">
                  {{ item.progress || 0 }}%
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div
                  class="h-3 rounded-full transition-all duration-300"
                  :style="getProgressBarStyle(item.progress)"
                ></div>
              </div>
            </div>

            <!-- 时间轴 -->
            <div class="relative">
              <el-timeline class="project-timeline">
                <el-timeline-item
                  v-for="(node, index) in projectNodes"
                  :key="index"
                  :timestamp="node.date"
                  :type="getTimelineNodeType(node.status)"
                  :color="getTimelineNodeColor(node.status)"
                  :size="getTimelineNodeSize(node.status)"
                  placement="top"
                >
                  <div class="timeline-content">
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-800 mb-1">
                          {{ node.title }}
                          <span
                            v-if="node.priority === 'high'"
                            class="ml-2 px-2 py-1 text-xs rounded-full bg-red-100 text-red-600"
                          >
                            高优先级
                          </span>
                          <span
                            v-else-if="node.priority === 'medium'"
                            class="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600"
                          >
                            中优先级
                          </span>
                        </h3>
                        <p class="text-gray-600 mb-2">{{ node.description }}</p>
                        <div class="flex items-center gap-4 text-sm text-gray-500">
                          <span class="flex items-center gap-1">
                            <el-icon><User /></el-icon>
                            {{ node.assignedTo }}
                          </span>
                          <span class="flex items-center gap-1">
                            <el-icon><Clock /></el-icon>
                            {{ node.estimatedHours }}小时
                          </span>
                          <span v-if="node.actualHours" class="flex items-center gap-1">
                            <el-icon><Timer /></el-icon>
                            实际: {{ node.actualHours }}小时
                          </span>
                        </div>
                      </div>
                      <div class="flex flex-col items-end gap-2 ml-4">
                        <span
                          class="px-3 py-1 text-sm rounded-full"
                          :class="getStatusBadgeClass(node.status)"
                        >
                          {{ getStatusText(node.status) }}
                        </span>
                        <div
                          v-if="node.status === 'completed'"
                          class="text-sm text-green-600 font-medium"
                        >
                          {{ node.completionRate }}%
                        </div>
                        <div
                          v-else-if="node.status === 'in_progress'"
                          class="text-sm text-blue-600 font-medium"
                        >
                          {{ node.progress || 0 }}%
                        </div>
                      </div>
                    </div>

                    <!-- 进度条 -->
                    <div v-if="node.status === 'in_progress'" class="mb-3">
                      <div class="w-full bg-gray-200 rounded-full h-2">
                        <div
                          class="h-2 bg-blue-500 rounded-full transition-all duration-300"
                          :style="`width: ${node.progress || 0}%`"
                        ></div>
                      </div>
                    </div>

                    <!-- 任务详情 -->
                    <div v-if="node.tasks && node.tasks.length" class="mt-3">
                      <div class="text-sm text-gray-600 mb-2">子任务:</div>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div
                          v-for="task in node.tasks"
                          :key="task.id"
                          class="flex items-center gap-2 p-2 bg-gray-50 rounded"
                        >
                          <el-checkbox
                            :model-value="task.completed"
                            @change="
                              (val) => handleTaskStatusChange(node.id, task.id, Boolean(val))
                            "
                          />
                          <span
                            class="text-sm"
                            :class="task.completed ? 'line-through text-gray-400' : 'text-gray-700'"
                          >
                            {{ task.name }}
                          </span>
                          <span
                            v-if="task.priority === 'high'"
                            class="ml-auto px-1 py-0.5 text-xs bg-red-100 text-red-600 rounded"
                          >
                            高
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- 任务成果提交 -->
                    <div
                      v-if="node.status === 'in_progress' || node.status === 'completed'"
                      class="mt-4"
                    >
                      <div class="text-sm font-medium text-gray-700 mb-2">任务成果:</div>
                      <div class="p-3 bg-white rounded border border-gray-200">
                        <!-- 富文本编辑器 -->
                        <ArtWangEditor
                          ref="taskResultEditorRef"
                          v-model="taskResultContent[node.id]"
                          :height="'200px'"
                          :placeholder="'请输入任务成果描述...'"
                          class="mb-3"
                        />

                        <!-- 上传组件 -->
                        <div class="mb-3">
                          <el-upload
                            ref="fileUploadRef"
                            v-model:file-list="taskResultFiles[node.id]"
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
                            <template #tip>
                              <div class="el-upload__tip text-xs text-gray-500 mt-1">
                                最多上传5个文件，支持JPG、PNG、PDF、DOC等格式
                              </div>
                            </template>
                          </el-upload>
                        </div>

                        <!-- 提交按钮 -->
                        <el-button
                          type="primary"
                          size="small"
                          @click="submitTaskResult(node.id)"
                          :loading="submitting[node.id]"
                          :disabled="
                            !taskResultContent[node.id] && taskResultFiles[node.id].length === 0
                          "
                        >
                          提交成果
                        </el-button>
                      </div>
                    </div>

                    <!-- 完成备注 -->
                    <div v-if="node.notes" class="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div class="text-sm text-blue-800">
                        <strong>备注:</strong> {{ node.notes }}
                      </div>
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>

          <!-- 项目信息 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- 基本信息 -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4">基本信息</h2>
              <div class="space-y-4">
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <span class="text-gray-500">项目名称</span>
                  <span class="font-medium text-gray-800">{{ item.name }}</span>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <span class="text-gray-500">项目类型</span>
                  <span class="font-medium text-gray-800">{{ getTypeName(item.type) }}</span>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <span class="text-gray-500">当前状态</span>
                  <span class="font-medium text-gray-800">{{ getStatusName(item.status) }}</span>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <span class="text-gray-500">项目进度</span>
                  <span class="font-medium text-gray-800">{{ item.progress || 0 }}%</span>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <span class="text-gray-500">项目预算</span>
                  <span class="font-medium text-gray-800"
                    >¥{{ (item.budget || 0).toLocaleString() }}</span
                  >
                </div>
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <span class="text-gray-500">创建时间</span>
                  <span class="font-medium text-gray-800">{{
                    item.createTime || '2025-12-01'
                  }}</span>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <span class="text-gray-500">开始时间</span>
                  <span class="font-medium text-gray-800">{{ item.startDate }}</span>
                </div>
                <div class="flex items-center justify-between py-3">
                  <span class="text-gray-500">结束时间</span>
                  <span class="font-medium text-gray-800">{{ item.endDate }}</span>
                </div>
              </div>
            </div>

            <!-- 节点统计 -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4">节点统计</h2>
              <div class="space-y-4">
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <span class="text-gray-500">总节点数</span>
                  <span class="font-medium text-gray-800">{{ projectNodes.length }} 个</span>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <span class="text-gray-500">已完成</span>
                  <span class="font-medium text-green-600">{{ completedNodesCount }} 个</span>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <span class="text-gray-500">进行中</span>
                  <span class="font-medium text-blue-600">{{ inProgressNodesCount }} 个</span>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <span class="text-gray-500">待开始</span>
                  <span class="font-medium text-gray-600">{{ pendingNodesCount }} 个</span>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <span class="text-gray-500">预计总工时</span>
                  <span class="font-medium text-gray-800">{{ totalEstimatedHours }} 小时</span>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <span class="text-gray-500">实际总工时</span>
                  <span class="font-medium text-gray-800">{{ totalActualHours }} 小时</span>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <span class="text-gray-500">任务完成率</span>
                  <span class="font-medium text-primary">{{ taskCompletionRate }}%</span>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <span class="text-gray-500">高优先级节点</span>
                  <span class="font-medium text-red-600"
                    >{{ projectNodes.filter((node) => node.priority === 'high').length }} 个</span
                  >
                </div>
                <div class="flex items-center justify-between py-3">
                  <span class="text-gray-500">平均节点完成时间</span>
                  <span class="font-medium text-gray-800">
                    {{
                      Math.round((totalActualHours / Math.max(completedNodesCount, 1)) * 10) / 10
                    }}
                    小时
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-center gap-4 mt-8">
            <el-button size="large" @click="handleBack">
              <el-icon><ArrowLeft /></el-icon>
              返回列表
            </el-button>
            <el-button type="primary" size="large" @click="handleEdit">
              <el-icon><Edit /></el-icon>
              编辑项目
            </el-button>
            <el-button type="success" size="large" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出报告
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import {
    Loading,
    CircleCloseFilled,
    Edit,
    Download,
    ArrowLeft,
    Clock,
    User,
    Timer,
    Plus
  } from '@element-plus/icons-vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { projectApi } from '@/api/item'
  import type { ProjectDetail, ProjectNode } from '@/types/api/item'
  import {
    getTypeName,
    getStatusName,
    getTypeColor,
    getTypeStyle,
    getStatusStyle,
    getProgressBarStyle,
    getProgressTextClass
  } from '@/utils/item'
  import ArtStatsCard from '@/components/core/cards/art-stats-card/index.vue'
  import ArtDonutChartCard from '@/components/core/cards/art-donut-chart-card/index.vue'
  import ArtBarChartCard from '@/components/core/cards/art-bar-chart-card/index.vue'
  import ArtWangEditor from '@/components/core/forms/art-wang-editor/index.vue'
  import type { UploadFile } from 'element-plus'

  // 定义组件属性
  defineProps<{
    style?: any
    class?: any
  }>()

  defineOptions({ name: 'ItemDetail' })

  const route = useRoute()
  const router = useRouter()

  // 状态
  const loading = ref(true)
  const error = ref('')
  const item = ref<ProjectDetail | null>(null)

  // 项目节点时间轴数据
  const projectNodes = ref<ProjectNode[]>([])

  // 任务成果相关状态
  const taskResultContent = ref<Record<number, string>>({})
  const taskResultFiles = ref<Record<number, UploadFile[]>>({})
  const submitting = ref<Record<number, boolean>>({})
  const taskResultEditorRef = ref()
  const fileUploadRef = ref()

  // 计算属性
  const completedNodesCount = computed(() => {
    return projectNodes.value.filter((node) => node.status === 'completed').length
  })

  const inProgressNodesCount = computed(() => {
    return projectNodes.value.filter((node) => node.status === 'in_progress').length
  })

  const pendingNodesCount = computed(() => {
    return projectNodes.value.filter((node) => node.status === 'pending').length
  })

  const totalEstimatedHours = computed(() => {
    return projectNodes.value.reduce((total, node) => total + (node.estimatedHours || 0), 0)
  })

  const totalActualHours = computed(() => {
    return projectNodes.value.reduce((total, node) => total + (node.actualHours || 0), 0)
  })

  const taskCompletionRate = computed(() => {
    const allTasks = projectNodes.value.flatMap((node) => node.tasks || [])
    if (allTasks.length === 0) return 0
    const completedTasks = allTasks.filter((task) => task.completed).length
    return Math.round((completedTasks / allTasks.length) * 100)
  })

  // 时间轴相关方法
  const getTimelineNodeType = (
    status: string
  ): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
    const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
      completed: 'success',
      'in-progress': 'primary',
      pending: 'info'
    }
    return typeMap[status] || 'info'
  }

  const getTimelineNodeColor = (status: string) => {
    const colorMap: Record<string, string> = {
      completed: '#00B42A',
      'in-progress': '#165DFF',
      pending: '#86909C'
    }
    return colorMap[status] || '#86909C'
  }

  const getTimelineNodeSize = (status: string): 'large' | 'normal' => {
    const sizeMap: Record<string, 'large' | 'normal'> = {
      completed: 'large',
      'in-progress': 'normal',
      pending: 'normal'
    }
    return sizeMap[status] || 'normal'
  }

  const getStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      completed: '已完成',
      'in-progress': '进行中',
      pending: '待开始'
    }
    return textMap[status] || status
  }

  const getStatusBadgeClass = (status: string) => {
    const classMap: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      pending: 'bg-gray-100 text-gray-800'
    }
    return classMap[status] || 'bg-gray-100 text-gray-800'
  }

  const getDaysRemaining = () => {
    if (!item.value?.endDate) return 0
    const endDate = new Date(item.value.endDate)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const loadData = async () => {
    loading.value = true
    error.value = ''

    try {
      const id = Number(route.params.id)
      const projectDetail = await projectApi.getProjectDetail(id)

      item.value = projectDetail
      projectNodes.value = projectDetail.nodes || []
    } catch (err) {
      error.value = '项目不存在或加载失败'
      console.error('加载项目详情失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 事件处理
  const handleEdit = () => {
    if (item.value) {
      router.push({
        path: '/item/create',
        query: {
          mode: 'edit',
          id: item.value.id
        }
      })
    }
  }

  const handleExport = async () => {
    if (item.value) {
      try {
        // 准备导出的数据
        const exportData = {
          project: item.value,
          nodes: projectNodes.value || [],
          exportedAt: new Date().toISOString(),
          exportVersion: '1.0'
        }

        // 转换为JSON字符串
        const jsonString = JSON.stringify(exportData, null, 2)

        // 创建下载链接
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${item.value.name}_${new Date().getTime()}.json`
        a.click()
        URL.revokeObjectURL(url)

        ElMessage.success('项目数据导出成功！')
      } catch (error) {
        ElMessage.error('项目导出失败，请重试')
        console.error('导出项目失败:', error)
      }
    }
  }

  const handleTaskStatusChange = async (nodeId: number, taskId: number, completed: boolean) => {
    try {
      const result = await projectApi.updateTaskStatus({
        nodeId,
        taskId,
        completed
      })

      // 更新本地数据
      const node = projectNodes.value.find((n) => n.id === nodeId)
      if (node && node.tasks) {
        const task = node.tasks.find((t) => t.id === taskId)
        if (task) {
          task.completed = completed
          node.progress = result.data.progress

          // 更新项目进度
          if (item.value) {
            const project = await projectApi.getProjectDetail(item.value.id)
            item.value.progress = project.progress
          }

          ElMessage.success(`任务 "${task.name}" ${completed ? '已完成' : '重新开始'}`)
        }
      }
    } catch (error) {
      ElMessage.error('任务状态更新失败，请重试')
      console.error('更新任务状态失败:', error)
    }
  }

  const handleBack = () => {
    router.push('/item')
  }

  // 文件上传相关方法
  const handleExceed = () => {
    ElMessage.warning(`最多只能上传5个文件`)
  }

  const beforeUpload = (file: File) => {
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      ElMessage.error('上传文件大小不能超过 2MB!')
      return false
    }
    return true
  }

  // 任务成果提交
  const submitTaskResult = async (nodeId: number) => {
    try {
      submitting.value[nodeId] = true

      const content = taskResultContent.value[nodeId]
      const files = taskResultFiles.value[nodeId]

      if (!content && (!files || files.length === 0)) {
        ElMessage.warning('请输入任务成果描述或上传文件')
        return
      }

      // 准备提交数据
      const submitData = {
        content: content || '',
        files: files?.filter((file) => file.raw).map((file) => file.raw!) || []
      }

      // 调用API提交任务成果
      await projectApi.submitTaskResult(nodeId, submitData)

      ElMessage.success('任务成果提交成功')

      // 清空表单
      taskResultContent.value[nodeId] = ''
      taskResultFiles.value[nodeId] = []
    } catch (error) {
      ElMessage.error('任务成果提交失败，请重试')
      console.error('提交任务成果失败:', error)
    } finally {
      submitting.value[nodeId] = false
    }
  }

  // 初始化
  onMounted(() => {
    loadData()
  })
</script>

<style scoped lang="scss">
  .item-detail {
    .page-content {
      min-height: calc(100vh - 64px);
      background-color: #f5f7fa;
    }

    .line-through {
      text-decoration: line-through;
    }

    .project-timeline {
      :deep(.el-timeline-item__wrapper) {
        padding-left: 50px;
      }

      :deep(.el-timeline-item__content) {
        width: 100%;
      }

      :deep(.el-timeline-item__timestamp) {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
      }
    }

    .timeline-content {
      width: 100%;
      padding: 16px;
      background: #fafafa;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
  }
</style>
