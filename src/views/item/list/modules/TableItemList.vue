<template>
  <div class="table-item-list-container" :style="containerHeight">
    <!-- 列表模式 -->
    <div class="w-full flex flex-col" v-if="listType === 'list'">
      <div style="flex: 1; min-height: 0">
        <ArtTable
          ref="tableRef"
          row-key="id"
          :loading="loading"
          :columns="columns"
          :data="tableData"
          :stripe="false"
          @selection-change="handleSelectionChange"
        >
          <!-- 进度条插槽 -->
          <template #progress="scope">
            <div class="flex items-center">
              <el-progress
                :percentage="scope.row.progress"
                :stroke-width="8"
                :color="getProgressColor(scope.row.progress)"
                :show-text="false"
                style="width: 80px; margin-right: 10px"
              />
              <span>{{ scope.row.progress }}%</span>
            </div>
          </template>

          <!-- 状态标签插槽 -->
          <template #status="scope">
            <el-tag :type="getStatusType(scope.row.status)" effect="light">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>

          <!-- 类型标签插槽 -->
          <template #type="scope">
            <el-tag :type="getTypeColor(scope.row.type)" effect="light">
              {{ getTypeLabel(scope.row.type) }}
            </el-tag>
          </template>

          <!-- 操作按钮插槽 -->
          <template #action="scope">
            <div class="flex space-x-2">
              <ArtButtonTable type="view" @click="handleView(scope.row)" />
              <ArtButtonTable type="edit" @click="handleEdit(scope.row)" />
              <ArtButtonTable type="add" @click="handleAddNode(scope.row)" />
              <ArtButtonTable type="delete" @click="handleDelete(scope.row)" />
            </div>
          </template>
        </ArtTable>
      </div>
      <!-- 分页组件 -->
      <div class="mt-4 flex justify-center">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 卡片模式 -->
    <div class="w-full flex flex-col" v-else-if="listType === 'card'">
      <div
        style="
          max-height: calc(100vh - 400px);
          margin-top: 10px;
          margin-bottom: 10px;
          overflow-y: auto;
        "
      >
        <div
          class="grid grid-cols-5 gap-5 max-2xl:grid-cols-4 max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1"
        >
          <div
            class="group overflow-hidden border border-gray-300/60 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
            v-for="item in tableData"
            :key="item.id"
          >
            <div class="flex justify-between items-start mb-3">
              <h3 class="text-lg font-medium text-gray-800">{{ item.name }}</h3>
              <el-tag :type="getTypeColor(item.type)" effect="light">
                {{ getTypeLabel(item.type) }}
              </el-tag>
            </div>

            <div class="mb-3">
              <div class="text-sm text-gray-500 mb-1">项目编码: {{ item.code }}</div>
              <div class="text-sm text-gray-500 mb-2"
                >状态:
                <el-tag :type="getStatusType(item.status)" effect="light" size="small">
                  {{ getStatusLabel(item.status) }}
                </el-tag>
              </div>
              <div class="flex items-center text-sm">
                <span class="text-gray-500 mr-2">进度:</span>
                <el-progress
                  :percentage="item.progress"
                  :stroke-width="6"
                  :color="getProgressColor(item.progress)"
                  :show-text="false"
                  style="width: 60px; margin-right: 8px"
                />
                <span>{{ item.progress }}%</span>
              </div>
            </div>

            <div class="text-sm text-gray-600 mb-4 line-clamp-2">{{
              item.description || '无描述'
            }}</div>

            <div class="flex justify-between items-center text-xs text-gray-500">
              <span>创建时间: {{ item.createTime }}</span>
              <span>预算: ¥{{ item.budget.toLocaleString() }}</span>
            </div>

            <div class="flex space-x-2 mt-4">
              <ArtButtonTable type="view" @click="handleView(item)" />
              <ArtButtonTable type="edit" @click="handleEdit(item)" />
              <ArtButtonTable type="add" @click="handleAddNode(item)" />
              <ArtButtonTable type="delete" @click="handleDelete(item)" />
            </div>
          </div>
        </div>
      </div>
      <!-- 分页组件 -->
      <div class="flex justify-center">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-if="!tableData.length && !loading">
      <el-empty description="未找到相关数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { useTableHeight } from '@/hooks/core/useTableHeight'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'

  import type { Project, ProjectListQuery } from '@/types/api/item.d'
  import { ProjectType, ProjectStatus } from '@/enums/itemEnum'
  import { projectApi } from '@/api/item'
  import type { ColumnOption } from '@/types/component'

  // Props定义
  const props = defineProps<{
    listType: 'list' | 'card'
    searchParams: ProjectListQuery
    columns?: any[]
    loading?: boolean
  }>()

  // Emits定义
  const emit = defineEmits<{
    (e: 'refresh'): void
    (e: 'view', row: Project): void
    (e: 'edit', row: Project): void
    (e: 'delete', row: Project): void
    (e: 'add-node', row: Project): void
    (e: 'selection-change', selection: Project[]): void
  }>()

  // 表格数据和分页
  const tableData = ref<Project[]>([])
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 加载状态
  const loading = ref(props.loading || false)

  // 计算表格高度
  const { containerHeight } = useTableHeight({
    showTableHeader: ref(true),
    tableHeaderHeight: ref(60),
    paginationHeight: ref(40),
    paginationSpacing: ref(16)
  })

  // 内部表格列配置
  const { columns: internalColumns } = useTableColumns(() => [
    {
      type: 'selection',
      width: 50,
      align: 'center',
      isFixed: true
    },
    {
      prop: 'id',
      label: 'ID',
      width: 80,
      align: 'center',
      isFixed: true
    },
    {
      prop: 'name',
      label: '项目名称',
      minWidth: 200,
      showOverflowTooltip: true
    },
    {
      prop: 'code',
      label: '项目编码',
      width: 120,
      align: 'center'
    },
    {
      prop: 'type',
      label: '项目类型',
      width: 120,
      align: 'center',
      useSlot: true,
      slotName: 'type'
    },
    {
      prop: 'status',
      label: '项目状态',
      width: 120,
      align: 'center',
      useSlot: true,
      slotName: 'status'
    },
    {
      prop: 'progress',
      label: '进度',
      width: 150,
      align: 'center',
      useSlot: true,
      slotName: 'progress'
    },
    {
      prop: 'startDate',
      label: '开始日期',
      width: 120,
      align: 'center'
    },
    {
      prop: 'endDate',
      label: '结束日期',
      width: 120,
      align: 'center'
    },
    {
      prop: 'budget',
      label: '预算',
      width: 120,
      align: 'right',
      formatter: (row: Project) => {
        return `¥${row.budget.toLocaleString()}`
      }
    },
    {
      prop: 'createTime',
      label: '创建时间',
      width: 160,
      align: 'center'
    },
    {
      prop: 'description',
      label: '项目描述',
      minWidth: 200,
      showOverflowTooltip: true
    },
    {
      prop: 'action',
      label: '操作',
      width: 200,
      align: 'center',
      fixed: 'right',
      useSlot: true,
      slotName: 'action'
    }
  ])

  // 合并外部列配置与内部列配置
  const columns = computed(() => {
    if (!props.columns) {
      return internalColumns.value
    }

    // 创建内部列的formatter和slot映射
    const columnMap = new Map()
    internalColumns.value.forEach((col: ColumnOption) => {
      if (col.prop) {
        columnMap.set(col.prop, col)
      }
    })

    // 合并外部列配置与内部列配置
    return props.columns.map((col: ColumnOption) => {
      const internalCol = columnMap.get(col.prop)
      if (internalCol) {
        return { ...col, ...internalCol }
      }
      return col
    })
  })

  // 获取项目类型标签颜色
  const getTypeColor = (
    type: string
  ): 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined => {
    const colorMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
      [ProjectType.SELF]: 'success',
      [ProjectType.FRONTEND]: 'primary',
      [ProjectType.BACKEND]: 'warning',
      [ProjectType.WRITING]: 'info',
      [ProjectType.COPY]: 'danger',
      [ProjectType.VIDEO]: 'info'
    }
    return colorMap[type]
  }

  // 获取项目类型标签
  const getTypeLabel = (type: string) => {
    const labelMap: Record<string, string> = {
      [ProjectType.SELF]: '个人项目',
      [ProjectType.FRONTEND]: '前端开发',
      [ProjectType.BACKEND]: '后端开发',
      [ProjectType.WRITING]: '写作项目',
      [ProjectType.COPY]: '文案策划',
      [ProjectType.VIDEO]: '视频制作'
    }
    return labelMap[type] || type
  }

  // 获取项目状态类型
  const getStatusType = (
    status: string
  ): 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined => {
    const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
      [ProjectStatus.PENDING]: 'info',
      [ProjectStatus.PROGRESS]: 'primary',
      [ProjectStatus.COMPLETED]: 'success',
      [ProjectStatus.PAUSED]: 'warning'
    }
    return typeMap[status]
  }

  // 获取项目状态标签
  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      [ProjectStatus.PENDING]: '待开始',
      [ProjectStatus.PROGRESS]: '进行中',
      [ProjectStatus.COMPLETED]: '已完成',
      [ProjectStatus.PAUSED]: '已暂停'
    }
    return labelMap[status] || status
  }

  // 获取进度条颜色
  const getProgressColor = (progress: number) => {
    if (progress < 30) return '#ff4d4f'
    if (progress < 70) return '#faad14'
    return '#52c41a'
  }

  // 加载表格数据
  const loadTableData = async () => {
    loading.value = true
    try {
      const params = {
        ...props.searchParams,
        page: pagination.current,
        pageSize: pagination.size
      }

      // 调用API获取项目列表
      const response = await projectApi.getProjectList(params)

      // 更新表格数据和分页信息
      tableData.value = response.list
      pagination.total = response.total
      pagination.current = response.page
      pagination.size = response.pageSize
    } catch (error) {
      console.error('获取项目列表失败:', error)
      ElMessage.error('获取项目列表失败，请重试')
    } finally {
      loading.value = false
    }
  }

  // 批量删除项目
  const batchDelete = async (selectedProjects: Project[]) => {
    if (selectedProjects.length === 0) {
      ElMessage.warning('请先选择要删除的项目')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的${selectedProjects.length}个项目吗？删除后将无法恢复。`,
        '批量删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      // 调用API批量删除项目
      await projectApi.batchDeleteProjects(selectedProjects.map((project) => project.id))

      ElMessage.success('批量删除成功')
      emit('refresh')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量删除失败:', error)
        ElMessage.error('批量删除失败，请重试')
      }
    }
  }

  // 批量添加节点
  const batchAddNode = async (selectedProjects: Project[]) => {
    if (selectedProjects.length === 0) {
      ElMessage.warning('请先选择要添加节点的项目')
      return
    }

    try {
      await ElMessageBox.prompt(
        `确定要为选中的${selectedProjects.length}个项目添加节点吗？`,
        '批量添加节点确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPlaceholder: '请输入节点名称（可选）',
          type: 'info'
        }
      )

      // 这里应该调用实际的API添加节点，当前API不存在，暂时模拟成功
      ElMessage.success('批量添加节点功能开发中')
      emit('refresh')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量添加节点失败:', error)
        ElMessage.error('批量添加节点失败，请重试')
      }
    }
  }

  // 暴露批量操作方法给父组件
  defineExpose({
    refreshData: loadTableData,
    batchDelete,
    batchAddNode
  })

  // 查看项目
  const handleView = (row: Project) => {
    emit('view', row)
  }

  // 编辑项目
  const handleEdit = (row: Project) => {
    emit('edit', row)
  }

  // 添加节点
  const handleAddNode = (row: Project) => {
    emit('add-node', row)
  }

  // 处理选择变更
  const handleSelectionChange = (selection: Project[]) => {
    emit('selection-change', selection)
  }

  // 删除项目
  const handleDelete = (row: Project) => {
    ElMessageBox.confirm(`确定要删除项目「${row.name}」吗？删除后将无法恢复。`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        emit('delete', row)
      })
      .catch(() => {
        // 取消删除
      })
  }

  // 页面大小变化
  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
    loadTableData()
  }

  // 当前页面变化
  const handleCurrentChange = (current: number) => {
    pagination.current = current
    loadTableData()
  }

  // 监听搜索参数变化，重新加载数据
  watch(
    () => props.searchParams,
    () => {
      pagination.current = 1
      loadTableData()
    },
    { deep: true }
  )

  // 页面加载时初始化数据
  onMounted(() => {
    loadTableData()
  })
</script>

<style scoped>
  .table-item-list-container {
    width: 100%;
  }
</style>
