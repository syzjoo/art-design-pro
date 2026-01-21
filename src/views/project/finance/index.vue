<template>
  <div class="finance-page art-full-height flex flex-col">
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
          <ElButton type="primary" @click="handleAddExpense" v-ripple>
            <el-icon><Plus /></el-icon>
            新增费用
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :data="expenseList"
        :columns="columns"
        :loading="loading"
        v-loading="loading"
        stripe
        border
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handlePageChange"
      >
        <template #type="{ row }">
          <el-tag :type="getExpenseType(row.type)">{{ getExpenseTypeName(row.type) }}</el-tag>
        </template>
        <template #amount="{ row }">
          <span :class="row.amount > 0 ? 'text-success' : 'text-danger'" class="font-medium">
            {{ row.amount > 0 ? '+' : '' }}¥{{ formatNumber(Math.abs(row.amount)) }}
          </span>
        </template>
        <template #status>
          <el-tag type="success"> 已确认 </el-tag>
        </template>
        <template #action="{ row }">
          <ArtButtonTable type="edit" @click="handleEditExpense(row)" />
          <ArtButtonTable type="delete" @click="handleDelete(row)" />
        </template>
      </ArtTable>

      <ExpenseForm
        v-model:visible="dialogVisible"
        :expense-data="editExpenseData"
        @submit="handleFormSubmit"
      />
    </ElCard>
  </div>
</template>
<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { Plus } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox, ElButton } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import type { ExpenseItem } from '@/types/api/project'
  import {
    getExpenseList,
    createExpense,
    updateExpense,
    deleteExpense,
    getProjectList
  } from '@/api/project'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtSearchBar from '@/components/core/forms/art-search-bar/index.vue'
  import ArtTableHeader from '@/components/core/tables/art-table-header/index.vue'
  import ExpenseForm from './modules/ExpenseForm.vue'

  defineOptions({ name: 'ProjectFinance' })

  const loading = ref(false)
  const dialogVisible = ref(false)
  const editExpenseData = ref<any>(undefined)

  const expenseList = ref<ExpenseItem[]>([])
  const projectList = ref<any[]>([])

  // 搜索表单
  const formFilters = reactive({
    keyword: '',
    project: '',
    type: '',
    dateRange: undefined as [string, string] | undefined
  })

  const formItems = computed(() => [
    {
      label: '',
      key: 'keyword',
      type: 'input',
      placeholder: '搜索描述或项目',
      clearable: true
    },
    {
      label: '项目',
      key: 'project',
      type: 'select',
      placeholder: '选择项目',
      options: [
        { value: '', label: '全部项目' },
        ...projectList.value.map((project) => ({
          value: project.name,
          label: project.name
        }))
      ]
    },
    {
      label: '类型',
      key: 'type',
      type: 'select',
      placeholder: '选择费用类型',
      options: [
        { value: '', label: '全部类型' },
        { value: 'income', label: '收入' },
        { value: 'expense', label: '支出' }
      ]
    },
    {
      label: '日期范围',
      key: 'dateRange',
      type: 'daterange',
      placeholder: '选择日期范围'
    }
  ])

  const columns = ref<ColumnOption[]>([
    { prop: 'date', label: '日期', width: 150, sortable: true },
    { prop: 'project_name', label: '项目名称', width: 200, sortable: true },
    { prop: 'type', label: '费用类型', width: 120, slotName: 'type', useSlot: true },
    { prop: 'description', label: '描述', minWidth: 200 },
    {
      prop: 'amount',
      label: '金额',
      width: 150,
      slotName: 'amount',
      useSlot: true,
      sortable: true
    },
    { prop: 'status', label: '状态', width: 120, slotName: 'status', useSlot: true },
    { prop: 'created_by', label: '创建人', width: 120, sortable: true },
    { prop: 'action', label: '操作', width: 200, fixed: 'right', slotName: 'action', useSlot: true }
  ])

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0,
    pageSizes: [10, 20, 50, 100],
    layout: 'total, sizes, prev, pager, next, jumper',
    background: true
  })

  const getExpenseType = (type: string) => {
    const typeMap: Record<string, 'primary' | 'warning' | 'info' | 'success'> = {
      income: 'success',
      expense: 'warning'
    }
    return typeMap[type] || 'info'
  }

  const getExpenseTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      income: '收入',
      expense: '支出'
    }
    return typeMap[type] || type
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('zh-CN')
  }

  const handleAddExpense = () => {
    editExpenseData.value = undefined
    dialogVisible.value = true
  }

  const handleEditExpense = (row: ExpenseItem) => {
    // 处理金额显示（转换为正数）
    const editData = {
      ...row,
      amount: Math.abs(row.amount)
    }
    editExpenseData.value = editData
    dialogVisible.value = true
  }

  const handleFormSubmit = async (data: any) => {
    try {
      if (editExpenseData.value) {
        // 编辑模式
        await updateExpense(editExpenseData.value.id, data)
        ElMessage.success('编辑成功')
      } else {
        // 新增模式
        await createExpense(data)
        ElMessage.success('创建成功')
      }
      handleRefresh()
    } catch (error) {
      ElMessage.error('操作失败')
      console.error('操作失败:', error)
    }
  }

  const handleRefresh = async () => {
    loading.value = true
    try {
      const params: any = {
        page: pagination.current,
        page_size: pagination.size,
        keyword: formFilters.keyword,
        type: formFilters.type
      }

      if (formFilters.project) {
        params.project_name = formFilters.project
      }

      if (formFilters.dateRange && formFilters.dateRange.length === 2) {
        params.start_date = formFilters.dateRange[0]
        params.end_date = formFilters.dateRange[1]
      }

      const response = await getExpenseList(params)
      expenseList.value = response.data.data
      pagination.total = response.data.total
    } catch (error) {
      ElMessage.error('获取费用列表失败')
      console.error('获取费用列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const handleDelete = async (row: ExpenseItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除费用记录「${row.description}」吗？`, '提示', {
        type: 'warning'
      })
      await deleteExpense(row.id)
      ElMessage.success('删除成功')
      handleRefresh()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
        console.error('删除失败:', error)
      } else {
        ElMessage.info('已取消删除')
      }
    }
  }

  const handleSearch = () => {
    pagination.current = 1
    handleRefresh()
  }

  const handleReset = () => {
    formFilters.keyword = ''
    formFilters.project = ''
    formFilters.type = ''
    formFilters.dateRange = undefined
    pagination.current = 1
    handleRefresh()
  }

  const handleSizeChange = (size: number) => {
    pagination.size = size
    handleRefresh()
  }

  const handlePageChange = (current: number) => {
    pagination.current = current
    handleRefresh()
  }

  const loadProjects = async () => {
    try {
      const response = await getProjectList()
      projectList.value = response.data.data
    } catch (error) {
      ElMessage.error('获取项目列表失败')
      console.error('获取项目列表失败:', error)
    }
  }

  onMounted(async () => {
    await loadProjects()
    await handleRefresh()
  })
</script>
