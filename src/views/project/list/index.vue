<template>
  <div class="project-page art-full-height flex flex-col">
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
          <ElButton type="primary" @click="handleAddProject" v-ripple>
            <el-icon><Plus /></el-icon>
            创建项目
          </ElButton>
          <ElButton type="warning" @click="handleBatchArchive" v-ripple>批量归档</ElButton>
          <ElButton type="danger" @click="handleBatchDelete" v-ripple>批量删除</ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        :data="projectList"
        :columns="columns"
        :loading="loading"
        v-loading="loading"
        stripe
        border
        :pagination="pagination"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handlePageChange"
        style="transition: opacity 0.3s ease"
      >
        <template #status="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
        </template>
        <template #priority="{ row }">
          <el-tag :type="getPriorityType(row.priority)">{{ getPriorityText(row.priority) }}</el-tag>
        </template>
        <template #progress="{ row }">
          <el-progress :percentage="row.progress" :color="getProgressColor(row.progress)" />
        </template>
        <template #action="{ row }">
          <ArtButtonTable type="view" @click="handleViewDetail(row)" />
          <ArtButtonTable type="edit" @click="handleEdit(row)" />
          <ArtButtonTable type="delete" @click="handleDelete(row)" />
        </template>
      </ArtTable>

      <ProjectForm
        v-model:visible="dialogVisible"
        :project-data="editProjectData"
        @submit="handleFormSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { Plus } from '@element-plus/icons-vue'
  import { ElMessage, ElButton, ElMessageBox } from 'element-plus'
  import { useRouter } from 'vue-router'
  import type { ColumnOption } from '@/types/component'
  import type {
    ProjectItem,
    ProjectListParams,
    ProjectStatus,
    ProjectPriority
  } from '@/types/api/project'
  import { getProjectList, archiveProject } from '@/api/project'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ProjectForm from './modules/ProjectForm.vue'

  defineOptions({ name: 'ProjectList' })

  const router = useRouter()
  const loading = ref(false)
  const tableRef = ref()
  const selectedProjects = ref<ProjectItem[]>([])
  const dialogVisible = ref(false)
  const editProjectData = ref<ProjectItem>()

  const initialSearchState = {
    keyword: '',
    status: '',
    priority: '',
    manager: '',
    start_date: '',
    end_date: ''
  }

  const formFilters = reactive({ ...initialSearchState })
  const appliedFilters = reactive({ ...initialSearchState })

  const formItems = computed(() => [
    {
      label: '',
      key: 'keyword',
      type: 'input',
      placeholder: '搜索项目名称或描述',
      clearable: true
    },
    {
      label: '项目状态',
      key: 'status',
      type: 'select',
      placeholder: '选择状态',
      options: [
        { value: '', label: '全部状态' },
        { value: 'pending', label: '未开始' },
        { value: 'in_progress', label: '进行中' },
        { value: 'completed', label: '已完成' },
        { value: 'on_hold', label: '已暂停' },
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
        { value: 'high', label: '高' },
        { value: 'medium', label: '中' },
        { value: 'low', label: '低' }
      ]
    },
    {
      label: '项目经理',
      key: 'manager',
      type: 'input',
      placeholder: '请输入项目经理',
      clearable: true
    },
    {
      label: '开始日期',
      key: 'start_date',
      type: 'date',
      placeholder: '选择开始日期'
    },
    {
      label: '结束日期',
      key: 'end_date',
      type: 'date',
      placeholder: '选择结束日期'
    }
  ])

  const projectList = ref<ProjectItem[]>([])

  const columns = ref<ColumnOption[]>([
    { type: 'selection', width: 55 },
    { prop: 'name', label: '项目名称', width: 200, sortable: true },
    { prop: 'description', label: '项目描述', minWidth: 200 },
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
    { prop: 'manager', label: '项目经理', width: 120, sortable: true },
    { prop: 'start_date', label: '开始日期', width: 150, sortable: true },
    { prop: 'end_date', label: '结束日期', width: 150, sortable: true },
    { prop: 'budget', label: '预算', width: 120, sortable: true },
    { prop: 'action', label: '操作', width: 200, fixed: 'right', slotName: 'action', useSlot: true }
  ])

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const getStatusType = (status: string): 'info' | 'primary' | 'warning' | 'success' | 'danger' => {
    const statusMap: Record<string, 'info' | 'primary' | 'warning' | 'success' | 'danger'> = {
      pending: 'info',
      in_progress: 'primary',
      completed: 'success',
      on_hold: 'warning',
      cancelled: 'danger'
    }
    return statusMap[status] || 'info'
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '未开始',
      in_progress: '进行中',
      completed: '已完成',
      on_hold: '已暂停',
      cancelled: '已取消'
    }
    return statusMap[status] || status
  }

  const getPriorityType = (
    priority: string
  ): 'info' | 'primary' | 'warning' | 'success' | 'danger' => {
    const priorityMap: Record<string, 'info' | 'primary' | 'warning' | 'success' | 'danger'> = {
      critical: 'danger',
      high: 'warning',
      medium: 'primary',
      low: 'success'
    }
    return priorityMap[priority] || 'info'
  }

  const getPriorityText = (priority: string) => {
    const priorityMap: Record<string, string> = {
      critical: '紧急',
      high: '高',
      medium: '中',
      low: '低'
    }
    return priorityMap[priority] || priority
  }

  const getProgressColor = (progress: number) => {
    if (progress < 30) {
      return '#F56C6C'
    }
    if (progress < 70) {
      return '#E6A23C'
    }
    return '#67C23A'
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
      const params: ProjectListParams = {
        keyword: appliedFilters.keyword || undefined,
        status: (appliedFilters.status as ProjectStatus) || undefined,
        priority: (appliedFilters.priority as ProjectPriority) || undefined,
        manager: appliedFilters.manager || undefined,
        start_date: appliedFilters.start_date || undefined,
        end_date: appliedFilters.end_date || undefined,
        page: pagination.current,
        page_size: pagination.size
      }

      const response = await getProjectList(params)
      if (response.code === 200) {
        projectList.value = response.data.data
        pagination.total = response.data.total
      } else {
        ElMessage.error(`获取项目列表失败: ${response.message}`)
      }
    } catch (error) {
      console.error('获取项目列表失败:', error)
      ElMessage.error('获取项目列表失败，请稍后重试')
    } finally {
      loading.value = false
    }
  }

  const handleAddProject = () => {
    editProjectData.value = undefined
    dialogVisible.value = true
  }

  const handleViewDetail = (row: ProjectItem) => {
    router.push({ name: 'ProjectDetail', params: { id: row.id.toString() } })
  }

  const handleEdit = (row: ProjectItem) => {
    editProjectData.value = { ...row }
    dialogVisible.value = true
  }

  const handleDelete = async (row: ProjectItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除项目「${row.name}」吗？删除后将无法恢复！`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      const index = projectList.value.findIndex((item: ProjectItem) => item.id === row.id)
      if (index > -1) {
        projectList.value.splice(index, 1)
        pagination.total = projectList.value.length
      }
      ElMessage.success('删除成功')
    } catch {
      ElMessage.info('已取消删除')
    }
  }

  const handleFormSubmit = (data: ProjectItem) => {
    if (data.id) {
      // 编辑模式
      const index = projectList.value.findIndex((item: ProjectItem) => item.id === data.id)
      if (index > -1) {
        projectList.value[index] = data
      }
    } else {
      // 新建模式
      projectList.value.unshift(data)
      pagination.total = projectList.value.length
    }
  }

  const handleSelectionChange = (selection: ProjectItem[]) => {
    selectedProjects.value = selection
  }

  const handleBatchArchive = async () => {
    if (selectedProjects.value.length === 0) {
      ElMessage.warning('请先选择要归档的项目')
      return
    }
    try {
      await ElMessageBox.confirm(
        `确定要归档选中的 ${selectedProjects.value.length} 个项目吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      )

      loading.value = true

      const archivePromises = selectedProjects.value.map(async (project) => {
        const response = await archiveProject(project.id)
        if (response.code === 200) {
          const index = projectList.value.findIndex((item: ProjectItem) => item.id === project.id)
          if (index > -1) {
            projectList.value[index].status = 'completed'
          }
        }
        return response
      })

      await Promise.all(archivePromises)

      selectedProjects.value = []
      tableRef.value?.elTableRef?.clearSelection()
      ElMessage.success('批量归档成功')
      handleRefresh()
    } catch (error) {
      console.error('批量归档失败:', error)
      if (error !== 'cancel') {
        ElMessage.error('批量归档失败，请稍后重试')
      } else {
        ElMessage.info('已取消归档')
      }
    } finally {
      loading.value = false
    }
  }

  const handleBatchDelete = async () => {
    if (selectedProjects.value.length === 0) {
      ElMessage.warning('请先选择要删除的项目')
      return
    }
    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedProjects.value.length} 个项目吗？删除后将无法恢复！`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      const idsToDelete = selectedProjects.value.map((p) => p.id)
      projectList.value = projectList.value.filter((item) => !idsToDelete.includes(item.id))
      pagination.total = projectList.value.length
      selectedProjects.value = []
      tableRef.value?.elTableRef?.clearSelection()
      ElMessage.success('批量删除成功')
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('批量删除失败')
        console.error('批量删除失败:', error)
      } else {
        ElMessage.info('已取消删除')
      }
    }
  }

  const handleRowClick = (row: ProjectItem) => {
    handleViewDetail(row)
  }

  const handleSizeChange = (val: number) => {
    pagination.size = val
  }

  const handlePageChange = (val: number) => {
    pagination.current = val
  }

  onMounted(() => {
    handleRefresh()
  })
</script>
