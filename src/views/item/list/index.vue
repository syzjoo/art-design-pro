<template>
  <div class="item-list-container art-full-height flex flex-col">
    <!-- 搜索栏 -->
    <ArtSearchBar
      v-model="formFilters"
      :items="searchItems"
      :showExpand="true"
      @search="handleSearch"
      @reset="handleReset"
      class="search-bar"
    />

    <ElCard class="art-table-card flex-1" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader
        :showZebra="false"
        :loading="loading"
        v-model:columns="columnChecks"
        @refresh="handleRefresh"
      >
        <template #left>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增项目
          </el-button>
          <el-button type="warning" @click="handleBatchAddNode">
            <el-icon><Plus /></el-icon>
            批量添加节点
          </el-button>
          <el-button type="danger" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </template>
        <template #right>
          <div class="flex justify-end">
            <el-button-group>
              <el-button
                :type="listType === 'list' ? 'primary' : 'default'"
                @click="listType = 'list'"
              >
                <el-icon><List /></el-icon>
                列表
              </el-button>
              <el-button
                :type="listType === 'card' ? 'primary' : 'default'"
                @click="listType = 'card'"
              >
                <el-icon><Grid /></el-icon>
                卡片
              </el-button>
            </el-button-group>
          </div>
        </template>
      </ArtTableHeader>

      <!-- 表格组件 -->
      <TableItemList
        ref="tableItemListRef"
        :list-type="listType"
        :search-params="searchParams"
        :columns="columns"
        :loading="loading"
        @refresh="handleRefresh"
        @view="handleView"
        @edit="handleEdit"
        @delete="handleDelete"
        @add-node="handleAddNode"
        @selection-change="handleSelectionChange"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue'
  import { Plus, List, Grid } from '@element-plus/icons-vue'
  import { ElMessage, ElCard, ElButton } from 'element-plus'
  import ArtSearchBar from '@/components/core/forms/art-search-bar/index.vue'
  import TableItemList from './modules/TableItemList.vue'
  import ArtTableHeader from '@/components/core/tables/art-table-header/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { ProjectType, ProjectStatus } from '@/enums/itemEnum'
  import type { Project } from '@/types/api/item.d'

  // 状态管理
  const loading = ref(false)
  const tableItemListRef = ref<InstanceType<typeof TableItemList>>()
  const listType = ref<'list' | 'card'>('list')
  const selectedProjects = ref<Project[]>([])

  // 搜索表单数据
  const initialSearchState = {
    name: '',
    code: '',
    type: '',
    status: ''
  }

  const formFilters = reactive({ ...initialSearchState })
  const appliedFilters = reactive({ ...initialSearchState })

  // 搜索参数（传递给表格组件）
  const searchParams = computed(() => ({
    ...appliedFilters,
    page: 1,
    pageSize: 10
  }))

  // 搜索栏配置
  const searchItems = [
    {
      key: 'name',
      label: '项目名称',
      type: 'input',
      placeholder: '请输入项目名称',
      span: 8
    },
    {
      key: 'code',
      label: '项目编码',
      type: 'input',
      placeholder: '请输入项目编码',
      span: 8
    },
    {
      key: 'type',
      label: '项目类型',
      type: 'select',
      placeholder: '请选择项目类型',
      options: Object.entries(ProjectType).map(([key, value]) => ({
        label: key,
        value: value
      })),
      span: 8
    },
    {
      key: 'status',
      label: '项目状态',
      type: 'select',
      placeholder: '请选择项目状态',
      options: Object.entries(ProjectStatus).map(([key, value]) => ({
        label: key,
        value: value
      })),
      span: 8
    }
  ]

  // 表格列配置
  const { columns, columnChecks } = useTableColumns(() => [
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
      align: 'center'
    },
    {
      prop: 'status',
      label: '项目状态',
      width: 120,
      align: 'center'
    },
    {
      prop: 'progress',
      label: '进度',
      width: 150,
      align: 'center'
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
      align: 'right'
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

  // 搜索处理
  const handleSearch = () => {
    Object.assign(appliedFilters, { ...formFilters })
    handleRefresh()
  }

  // 重置处理
  const handleReset = () => {
    Object.assign(formFilters, { ...initialSearchState })
    Object.assign(appliedFilters, { ...initialSearchState })
    handleRefresh()
  }

  // 刷新处理
  const handleRefresh = () => {
    if (tableItemListRef.value) {
      loading.value = true
      tableItemListRef.value.refreshData().finally(() => {
        loading.value = false
      })
    }
  }

  // 新增项目
  const handleAdd = () => {
    ElMessage.info('新增项目功能开发中')
  }

  // 查看项目
  const handleView = (row: Project) => {
    console.log('查看项目:', row)
    ElMessage.info('查看项目功能开发中')
  }

  // 编辑项目
  const handleEdit = (row: Project) => {
    console.log('编辑项目:', row)
    ElMessage.info('编辑项目功能开发中')
  }

  // 删除项目
  const handleDelete = (row: Project) => {
    console.log('删除项目:', row)
    ElMessage.info('删除项目功能开发中')
  }

  // 添加节点
  const handleAddNode = (row: Project) => {
    console.log('添加节点:', row)
    ElMessage.info('添加节点功能开发中')
  }

  // 批量添加节点
  const handleBatchAddNode = async () => {
    if (tableItemListRef.value) {
      await tableItemListRef.value.batchAddNode(selectedProjects.value)
    }
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (tableItemListRef.value) {
      await tableItemListRef.value.batchDelete(selectedProjects.value)
    }
  }

  // 处理项目选择
  const handleSelectionChange = (selection: Project[]) => {
    selectedProjects.value = selection
  }
</script>

<style scoped>
  .item-list-container {
    padding: 16px;
  }
</style>
