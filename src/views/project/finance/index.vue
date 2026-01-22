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
        <template #right>
          <div class="flex gap-2">
            <el-button type="info" @click="showBudgetAnalysis = true">
              <el-icon><DataAnalysis /></el-icon>
              预算分析
            </el-button>
          </div>
        </template>
      </ArtTableHeader>

      <div class="mb-4">
        <el-row :gutter="20">
          <el-col :span="6" v-for="stat in financialStats" :key="stat.label">
            <el-card :body-style="{ padding: '15px' }">
              <div class="text-center">
                <div class="text-gray-400 text-sm">{{ stat.label }}</div>
                <div
                  class="text-2xl font-bold"
                  :class="stat.amount > 0 ? 'text-success' : 'text-danger'"
                >
                  {{ stat.amount > 0 ? '+' : '' }}¥{{ formatNumber(Math.abs(stat.amount)) }}
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

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
        style="transition: opacity 0.3s ease"
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

      <!-- 预算分析对话框 -->
      <ElDialog v-model="showBudgetAnalysis" title="预算分析" width="80%" destroy-on-close>
        <div class="budget-analysis">
          <div v-if="budgetAnalysisData.length === 0" class="text-center py-10">
            <el-empty description="暂无预算数据" />
          </div>
          <div v-else>
            <el-table :data="budgetAnalysisData" stripe border>
              <el-table-column prop="project_name" label="项目名称" width="200" />
              <el-table-column prop="budget" label="预算" width="120">
                <template #default="{ row }"> ¥{{ formatNumber(row.budget) }} </template>
              </el-table-column>
              <el-table-column prop="actual_cost" label="实际支出" width="120">
                <template #default="{ row }"> ¥{{ formatNumber(row.actual_cost) }} </template>
              </el-table-column>
              <el-table-column prop="remaining" label="剩余预算" width="120">
                <template #default="{ row }"> ¥{{ formatNumber(row.remaining) }} </template>
              </el-table-column>
              <el-table-column prop="usage_rate" label="使用率" width="100">
                <template #default="{ row }">
                  <div class="flex items-center">
                    <el-progress
                      :percentage="row.usage_rate"
                      :color="getUsageRateColor(row.usage_rate)"
                      :stroke-width="10"
                      :show-text="false"
                      class="mr-2"
                      style="flex: 1"
                    />
                    <span>{{ row.usage_rate }}%</span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </ElDialog>
    </ElCard>
  </div>
</template>
<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { Plus, DataAnalysis } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox, ElButton, ElEmpty } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import type { ExpenseItem, ProjectItem } from '@/types/api/project'
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
  const showBudgetAnalysis = ref(false)
  const editExpenseData = ref<any>(undefined)

  const expenseList = ref<ExpenseItem[]>([])
  const projectList = ref<ProjectItem[]>([])
  const budgetAnalysisData = ref<any[]>([])

  // 财务统计数据
  const financialStats = computed(() => {
    const totalIncome = expenseList.value
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0)

    const totalExpense = Math.abs(
      expenseList.value.filter((e) => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
    )

    const netIncome = totalIncome - totalExpense

    return [
      { label: '总收入', amount: totalIncome },
      { label: '总支出', amount: -totalExpense },
      { label: '净利润', amount: netIncome }
    ]
  })

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

  const getUsageRateColor = (rate: number) => {
    if (rate < 70) return '#67C23A' // 绿色
    if (rate < 90) return '#E6A23C' // 黄色
    return '#F56C6C' // 红色
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

      if (response.code === 200) {
        expenseList.value = response.data.data
        pagination.total = response.data.total
      } else {
        ElMessage.error(`获取费用列表失败: ${response.message}`)
      }

      // 加载项目列表用于预算分析
      await loadProjects()
      calculateBudgetAnalysis()
    } catch (error) {
      console.error('获取费用列表失败:', error)
      ElMessage.error('获取费用列表失败，请稍后重试')
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

  const calculateBudgetAnalysis = () => {
    budgetAnalysisData.value = projectList.value.map((project) => {
      // 计算项目的实际支出
      const projectExpenses = expenseList.value.filter(
        (expense) => expense.project_name === project.name && expense.type === 'expense'
      )

      const actualCost = Math.abs(projectExpenses.reduce((sum, expense) => sum + expense.amount, 0))

      const remaining = project.budget - actualCost
      const usageRate = project.budget > 0 ? Math.round((actualCost / project.budget) * 100) : 0

      return {
        project_name: project.name,
        budget: project.budget,
        actual_cost: actualCost,
        remaining: remaining,
        usage_rate: usageRate
      }
    })
  }

  onMounted(async () => {
    await loadProjects()
    await handleRefresh()
  })
</script>
