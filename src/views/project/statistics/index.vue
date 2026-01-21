<template>
  <div class="statistics-page art-full-height flex flex-col">
    <!-- 页面标题和筛选器 -->
    <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-g-900">项目统计分析</h1>
        <p class="text-sm text-g-600 mt-1">全面了解项目进度、财务状况和团队绩效</p>
      </div>

      <div class="flex flex-wrap gap-3">
        <ElDatePicker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleDateChange"
        />

        <ElSelect
          v-model="projectType"
          placeholder="项目类型"
          clearable
          @change="handleFilterChange"
        >
          <ElOption label="全部类型" value="" />
          <ElOption label="内部项目" value="internal" />
          <ElOption label="客户项目" value="client" />
          <ElOption label="研发项目" value="research" />
        </ElSelect>

        <ElButton type="primary" @click="handleRefresh" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </ElButton>

        <ElButton @click="handleExport">
          <el-icon><Download /></el-icon>
          导出报告
        </ElButton>
      </div>
    </div>

    <!-- 关键指标卡片 -->
    <div class="mb-6">
      <ElRow :gutter="20" class="flex">
        <ElCol v-for="(item, index) in cardDataList" :key="index" :sm="12" :md="6" :lg="6">
          <div
            class="art-card relative flex flex-col justify-center h-35 px-5 mb-5 max-sm:mb-4 hover:shadow-md transition-shadow"
          >
            <span class="text-g-700 text-sm">{{ item.des }}</span>
            <ArtCountTo class="text-[26px] font-medium mt-2" :target="item.num" :duration="1300" />
            <div class="flex-c mt-1">
              <span class="text-xs text-g-600">{{ item.compareText }}</span>
              <span
                class="ml-1 text-xs font-semibold"
                :class="[item.change.indexOf('+') === -1 ? 'text-danger' : 'text-success']"
              >
                {{ item.change }}
              </span>
            </div>
            <div
              class="absolute top-0 bottom-0 right-5 m-auto size-12.5 rounded-xl flex-cc"
              :style="{ backgroundColor: item.color + '20' }"
            >
              <ArtSvgIcon :icon="item.icon" :style="{ color: item.color, fontSize: '20px' }" />
            </div>
          </div>
        </ElCol>
      </ElRow>
    </div>

    <!-- 财务概览 -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-4">财务概览</h2>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <div class="art-card p-5 h-full">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-medium">预算使用情况</h3>
              <el-button type="text" size="small" @click="showBudgetDetail = true">
                详情 <el-icon class="ml-1"><ArrowRight /></el-icon>
              </el-button>
            </div>

            <div class="text-center mb-4">
              <div class="text-sm text-g-600">总预算</div>
              <div class="text-3xl font-bold mt-1">¥{{ formatNumber(totalBudget) }}</div>
              <div class="text-sm text-g-600 mt-1">
                已使用: ¥{{ formatNumber(totalActualCost) }} ({{
                  ((totalActualCost / totalBudget) * 100).toFixed(1)
                }}%)
              </div>
            </div>

            <el-progress
              :percentage="(totalActualCost / totalBudget) * 100"
              :color="getBudgetColor(totalActualCost, totalBudget)"
              :stroke-width="24"
            />

            <div class="grid grid-cols-3 gap-4 mt-4">
              <div class="text-center">
                <div class="text-sm text-g-600">已支出</div>
                <div class="text-lg font-medium text-primary"
                  >¥{{ formatNumber(totalActualCost) }}</div
                >
              </div>
              <div class="text-center">
                <div class="text-sm text-g-600">剩余预算</div>
                <div class="text-lg font-medium text-success"
                  >¥{{ formatNumber(totalBudget - totalActualCost) }}</div
                >
              </div>
              <div class="text-center">
                <div class="text-sm text-g-600">预算使用率</div>
                <div class="text-lg font-medium"
                  >{{ ((totalActualCost / totalBudget) * 100).toFixed(1) }}%</div
                >
              </div>
            </div>
          </div>
        </ElCol>

        <ElCol :span="12">
          <div class="art-card p-5 h-full">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-medium">财务收支分析</h3>
              <el-button type="text" size="small" @click="showFinanceDetail = true">
                详情 <el-icon class="ml-1"><ArrowRight /></el-icon>
              </el-button>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="text-center p-3 bg-success/5 rounded-lg">
                <div class="text-sm text-g-600">总收入</div>
                <div class="text-2xl font-bold text-success mt-1"
                  >¥{{ formatNumber(totalRevenue) }}</div
                >
                <div class="text-xs text-success mt-1">
                  <el-icon class="mr-1"><TrendCharts /></el-icon>
                  较上月 +12.5%
                </div>
              </div>

              <div class="text-center p-3 bg-primary/5 rounded-lg">
                <div class="text-sm text-g-600">净利润</div>
                <div class="text-2xl font-bold text-primary mt-1"
                  >¥{{ formatNumber(totalRevenue - totalActualCost) }}</div
                >
                <div class="text-xs text-primary mt-1">
                  <el-icon class="mr-1"><Percentage /></el-icon>
                  利润率
                  {{ (((totalRevenue - totalActualCost) / totalActualCost) * 100).toFixed(1) }}%
                </div>
              </div>
            </div>

            <div ref="financeChart.chartRef" style="height: 200px"></div>
          </div>
        </ElCol>
      </ElRow>
    </div>

    <!-- 项目状态和进度 -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-4">项目状态分析</h2>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <div class="art-card p-5 h-full">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-medium">项目状态分布</h3>
              <ElSelect v-model="statusViewMode" placeholder="视图模式" @change="updateStatusChart">
                <ElOption label="饼图" value="pie" />
                <ElOption label="条形图" value="bar" />
              </ElSelect>
            </div>
            <div ref="statusChart.chartRef" style="height: 300px"></div>
          </div>
        </ElCol>

        <ElCol :span="12">
          <div class="art-card p-5 h-full">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-medium">项目健康度分析</h3>
              <el-button type="text" size="small" @click="showHealthDetail = true">
                详情 <el-icon class="ml-1"><ArrowRight /></el-icon>
              </el-button>
            </div>

            <div class="space-y-4">
              <div
                v-for="project in projectHealthList"
                :key="project.id"
                class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
              >
                <div class="flex-1">
                  <div class="font-medium">{{ project.name }}</div>
                  <div class="text-sm text-g-600">
                    <span class="mr-3">进度: {{ project.progress }}%</span>
                    <span>截止: {{ project.endDate }}</span>
                  </div>
                </div>
                <div class="text-right mr-4">
                  <div class="font-medium" :class="getHealthColorClass(project.healthScore)">
                    {{ project.healthScore }}/100
                  </div>
                  <div class="text-xs text-g-600">健康度</div>
                </div>
                <div class="w-24">
                  <el-progress
                    :percentage="project.healthScore"
                    :color="getHealthColor(project.healthScore)"
                    :stroke-width="10"
                  />
                </div>
              </div>
            </div>
          </div>
        </ElCol>
      </ElRow>
    </div>

    <!-- 资源利用和趋势分析 -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-4">资源利用与趋势</h2>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <div class="art-card p-5 h-full">
            <h3 class="font-medium mb-4">团队资源利用</h3>
            <div ref="resourceChart.chartRef" style="height: 300px"></div>
          </div>
        </ElCol>

        <ElCol :span="12">
          <div class="art-card p-5 h-full">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-medium">项目趋势分析</h3>
              <ElSelect v-model="trendType" placeholder="趋势类型" @change="updateTrendChart">
                <ElOption label="项目数量" value="count" />
                <ElOption label="完成率" value="completion" />
                <ElOption label="预算执行" value="budget" />
              </ElSelect>
            </div>
            <div ref="trendChart.chartRef" style="height: 300px"></div>
          </div>
        </ElCol>
      </ElRow>
    </div>

    <!-- 风险预警和建议 -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-4">风险预警与建议</h2>
      <div class="art-card p-5">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div class="flex items-center mb-3">
              <div class="size-8 rounded-full bg-warning/10 flex-cc mr-2">
                <el-icon class="text-warning"><Warning /></el-icon>
              </div>
              <h3 class="font-medium">风险预警</h3>
            </div>
            <div class="space-y-3">
              <div
                v-for="risk in riskList"
                :key="risk.id"
                class="p-3 border-l-4 border-warning bg-warning/5 rounded-r-lg"
              >
                <div class="font-medium text-sm">{{ risk.title }}</div>
                <div class="text-xs text-g-600 mt-1">{{ risk.description }}</div>
                <div class="text-xs font-medium mt-1" :class="getRiskLevelClass(risk.level)">
                  {{ getRiskLevelText(risk.level) }}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div class="flex items-center mb-3">
              <div class="size-8 rounded-full bg-info/10 flex-cc mr-2">
                <el-icon class="text-info"><Lightbulb /></el-icon>
              </div>
              <h3 class="font-medium">优化建议</h3>
            </div>
            <div class="space-y-3">
              <div
                v-for="suggestion in suggestionList"
                :key="suggestion.id"
                class="p-3 border-l-4 border-info bg-info/5 rounded-r-lg"
              >
                <div class="font-medium text-sm">{{ suggestion.title }}</div>
                <div class="text-xs text-g-600 mt-1">{{ suggestion.description }}</div>
                <el-button type="text" size="small" class="mt-1 p-0">
                  查看详情 <el-icon class="ml-1"><ArrowRight /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <div>
            <div class="flex items-center mb-3">
              <div class="size-8 rounded-full bg-success/10 flex-cc mr-2">
                <el-icon class="text-success"><Trophy /></el-icon>
              </div>
              <h3 class="font-medium">优秀项目</h3>
            </div>
            <div class="space-y-3">
              <div
                v-for="project in excellentProjects"
                :key="project.id"
                class="p-3 border-l-4 border-success bg-success/5 rounded-r-lg"
              >
                <div class="font-medium text-sm">{{ project.name }}</div>
                <div class="text-xs text-g-600 mt-1">
                  <span class="mr-3">按时完成率: {{ project.onTimeRate }}%</span>
                  <span>预算偏差: {{ project.budgetDeviation }}%</span>
                </div>
                <div class="flex items-center mt-1">
                  <el-rate :value="project.score" :max="5" disabled size="small" />
                  <span class="text-xs text-g-600 ml-2">团队评分</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预算详情弹窗 -->
    <ElDialog v-model="showBudgetDetail" title="预算详情" width="800px">
      <div class="max-h-[500px] overflow-y-auto">
        <ElTable :data="projectBudgetList" style="width: 100%">
          <ElTableColumn prop="name" label="项目名称" width="200" />
          <ElTableColumn prop="manager" label="项目经理" width="120" />
          <ElTableColumn prop="budget" label="预算" width="150">
            <template #default="{ row }">
              {{ formatNumber(row.budget) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="actual_cost" label="实际支出" width="150">
            <template #default="{ row }">
              {{ formatNumber(row.actual_cost) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="预算使用率" width="180">
            <template #default="{ row }">
              <div class="flex flex-col">
                <div class="text-right mb-1"
                  >{{ ((row.actual_cost / row.budget) * 100).toFixed(1) }}%</div
                >
                <el-progress
                  :percentage="(row.actual_cost / row.budget) * 100"
                  :color="getBudgetColor(row.actual_cost, row.budget)"
                  :stroke-width="8"
                />
              </div>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </ElDialog>

    <!-- 财务详情弹窗 -->
    <ElDialog v-model="showFinanceDetail" title="财务详情" width="800px">
      <div class="max-h-[500px] overflow-y-auto">
        <ElTable :data="financeDetailList" style="width: 100%">
          <ElTableColumn prop="date" label="日期" width="120" />
          <ElTableColumn prop="project" label="项目" width="150" />
          <ElTableColumn prop="category" label="类别" width="100" />
          <ElTableColumn prop="amount" label="金额" width="120">
            <template #default="{ row }">
              {{ formatNumber(row.amount) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="description" label="描述" />
          <ElTableColumn prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'approved' ? 'success' : 'warning'">
                {{ row.status === 'approved' ? '已审批' : '待审批' }}
              </el-tag>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </ElDialog>

    <!-- 健康度详情弹窗 -->
    <ElDialog v-model="showHealthDetail" title="项目健康度详情" width="800px">
      <div class="max-h-[500px] overflow-y-auto">
        <ElTable :data="projectHealthList" style="width: 100%">
          <ElTableColumn prop="name" label="项目名称" width="200" />
          <ElTableColumn label="健康度" width="150">
            <template #default="{ row }">
              <div class="flex flex-col">
                <div class="text-right mb-1" :class="getHealthColorClass(row.healthScore)">
                  {{ row.healthScore }}/100
                </div>
                <el-progress
                  :percentage="row.healthScore"
                  :color="getHealthColor(row.healthScore)"
                  :stroke-width="8"
                />
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="关键指标">
            <template #default="{ row }">
              <div class="space-y-1">
                <div class="text-xs">
                  <span class="text-g-600">进度: </span>
                  <span>{{ row.progress }}%</span>
                </div>
                <div class="text-xs">
                  <span class="text-g-600">预算: </span>
                  <span>{{ ((row.actualCost / row.budget) * 100).toFixed(1) }}%</span>
                </div>
                <div class="text-xs">
                  <span class="text-g-600">风险: </span>
                  <span :class="getRiskLevelClass(row.riskLevel)">{{
                    getRiskLevelText(row.riskLevel)
                  }}</span>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="120">
            <template #default="{ row }">
              <ElButton type="primary" size="small" @click="viewProjectDetail(row.id)">
                查看详情
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, watch } from 'vue'
  import {
    Refresh,
    Download,
    ArrowRight,
    TrendCharts,
    Warning,
    Trophy
  } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from '@/plugins/echarts'
  import ArtCountTo from '@/components/core/text-effect/art-count-to/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'ProjectStatistics' })

  // 响应式数据
  const loading = ref(false)
  const dateRange = ref<any>([])
  const projectType = ref('')
  const statusViewMode = ref('pie')
  const trendType = ref('count')
  const showBudgetDetail = ref(false)
  const showFinanceDetail = ref(false)
  const showHealthDetail = ref(false)

  // 图表引用

  // 图表实例 - 为每个图表创建独立实例
  const financeChart = useChart()
  const statusChart = useChart()
  const resourceChart = useChart()
  const trendChart = useChart()

  // 核心数据
  const totalBudget = 2450000
  const totalActualCost = 1260000
  const totalRevenue = 1850000

  // 卡片数据
  const cardDataList = reactive([
    {
      des: '总项目数',
      icon: 'ri:folder-chart-line',
      num: 128,
      change: '+12',
      compareText: '较上月',
      color: '#409EFF'
    },
    {
      des: '进行中',
      icon: 'ri:play-circle-line',
      num: 45,
      change: '+8',
      compareText: '较上月',
      color: '#E6A23C'
    },
    {
      des: '已完成',
      icon: 'ri:check-double-line',
      num: 72,
      change: '+15',
      compareText: '较上月',
      color: '#67C23A'
    },
    {
      des: '逾期项目',
      icon: 'ri:alert-line',
      num: 11,
      change: '-3',
      compareText: '较上月',
      color: '#F56C6C'
    }
  ])

  // 项目预算数据
  const projectBudgetList = reactive([
    { id: 1, name: '电商平台重构', manager: '张三', budget: 500000, actual_cost: 350000 },
    { id: 2, name: '移动应用开发', manager: '李四', budget: 800000, actual_cost: 280000 },
    { id: 3, name: '数据分析系统', manager: '王五', budget: 600000, actual_cost: 0 },
    { id: 4, name: '客户管理系统', manager: '赵六', budget: 400000, actual_cost: 380000 },
    { id: 5, name: '云服务迁移', manager: '张三', budget: 300000, actual_cost: 150000 },
    { id: 6, name: '企业官网建设', manager: '李四', budget: 150000, actual_cost: 100000 }
  ])

  // 项目健康度数据
  const projectHealthList = reactive([
    {
      id: 1,
      name: '电商平台重构',
      progress: 75,
      healthScore: 85,
      riskLevel: 'low',
      endDate: '2024-06-30',
      budget: 500000,
      actualCost: 350000
    },
    {
      id: 2,
      name: '移动应用开发',
      progress: 60,
      healthScore: 72,
      riskLevel: 'medium',
      endDate: '2024-07-15',
      budget: 800000,
      actualCost: 280000
    },
    {
      id: 3,
      name: '数据分析系统',
      progress: 30,
      healthScore: 65,
      riskLevel: 'medium',
      endDate: '2024-08-20',
      budget: 600000,
      actualCost: 0
    },
    {
      id: 4,
      name: '客户管理系统',
      progress: 90,
      healthScore: 92,
      riskLevel: 'low',
      endDate: '2024-05-10',
      budget: 400000,
      actualCost: 380000
    }
  ])

  // 财务详情数据
  const financeDetailList = reactive([
    {
      id: 1,
      date: '2024-02-28',
      project: '电商平台重构',
      category: '支出',
      amount: -150000,
      description: '2月工资发放',
      status: 'approved'
    },
    {
      id: 2,
      date: '2024-02-25',
      project: '移动应用开发',
      category: '支出',
      amount: -35000,
      description: '云服务费用',
      status: 'approved'
    },
    {
      id: 3,
      date: '2024-02-20',
      project: '客户管理系统',
      category: '支出',
      amount: -80000,
      description: '服务器采购',
      status: 'approved'
    },
    {
      id: 4,
      date: '2024-02-18',
      project: '电商平台重构',
      category: '支出',
      amount: -50000,
      description: '项目奖金',
      status: 'approved'
    },
    {
      id: 5,
      date: '2024-02-15',
      project: '企业官网建设',
      category: '支出',
      amount: -12000,
      description: '域名和服务费',
      status: 'approved'
    },
    {
      id: 6,
      date: '2024-02-10',
      project: '电商平台重构',
      category: '收入',
      amount: 500000,
      description: '项目回款',
      status: 'approved'
    },
    {
      id: 7,
      date: '2024-02-08',
      project: '移动应用开发',
      category: '收入',
      amount: 300000,
      description: '预付款',
      status: 'approved'
    },
    {
      id: 8,
      date: '2024-02-05',
      project: '云服务迁移',
      category: '支出',
      amount: -45000,
      description: '迁移服务费',
      status: 'pending'
    }
  ])

  // 风险预警数据
  const riskList = reactive([
    {
      id: 1,
      title: '电商平台重构项目延期风险',
      description: '项目进度滞后15%，可能无法按时交付',
      level: 'medium'
    },
    {
      id: 2,
      title: '移动应用开发预算超支',
      description: '当前支出已达预算的35%，但进度仅完成25%',
      level: 'high'
    },
    {
      id: 3,
      title: '数据分析系统资源不足',
      description: '团队成员同时参与多个项目，资源分配紧张',
      level: 'low'
    }
  ])

  // 优化建议数据
  const suggestionList = reactive([
    { id: 1, title: '优化资源分配', description: '建议重新评估团队成员工作量，合理分配资源' },
    { id: 2, title: '加强预算监控', description: '建议每周审查预算执行情况，及时调整支出计划' },
    { id: 3, title: '改进项目规划', description: '建议在项目启动前进行更详细的风险评估' }
  ])

  // 优秀项目数据
  const excellentProjects = reactive([
    { id: 1, name: '客户管理系统', onTimeRate: 95, budgetDeviation: -2, score: 5 },
    { id: 2, name: '企业官网建设', onTimeRate: 100, budgetDeviation: 0, score: 4.5 },
    { id: 3, name: '云服务迁移', onTimeRate: 85, budgetDeviation: -5, score: 4 }
  ])

  // 方法
  const getBudgetColor = (actual: number, budget: number) => {
    const percentage = (actual / budget) * 100
    if (percentage > 100) return '#F56C6C'
    if (percentage > 80) return '#E6A23C'
    return '#67C23A'
  }

  const getHealthColor = (score: number) => {
    if (score < 60) return '#F56C6C'
    if (score < 80) return '#E6A23C'
    return '#67C23A'
  }

  const getHealthColorClass = (score: number) => {
    if (score < 60) return 'text-danger'
    if (score < 80) return 'text-warning'
    return 'text-success'
  }

  const getRiskLevelClass = (level: string) => {
    if (level === 'high') return 'text-danger'
    if (level === 'medium') return 'text-warning'
    return 'text-info'
  }

  const getRiskLevelText = (level: string) => {
    const levelMap = { high: '高风险', medium: '中风险', low: '低风险' }
    return levelMap[level as keyof typeof levelMap] || level
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const handleDateChange = () => {
    ElMessage.info('日期范围已更新')
    handleRefresh()
  }

  const handleFilterChange = () => {
    ElMessage.info('筛选条件已更新')
    handleRefresh()
  }

  const handleRefresh = () => {
    loading.value = true
    setTimeout(() => {
      loading.value = false
      ElMessage.success('数据刷新成功')
      initCharts()
    }, 1000)
  }

  const handleExport = () => {
    ElMessage.info('报告导出功能开发中')
  }

  const viewProjectDetail = (projectId: number) => {
    ElMessage.info(`查看项目 ${projectId} 详情`)
  }

  // 图表初始化
  const initCharts = () => {
    initFinanceChart()
    updateStatusChart()
    initResourceChart()
    updateTrendChart()
  }

  const initFinanceChart = () => {
    financeChart.initChart({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月']
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '收入',
          type: 'bar',
          data: [200000, 250000, 300000, 280000, 350000, 400000],
          itemStyle: { color: '#67C23A' }
        },
        {
          name: '支出',
          type: 'bar',
          data: [150000, 180000, 200000, 220000, 250000, 280000],
          itemStyle: { color: '#F56C6C' }
        }
      ]
    })
  }

  const updateStatusChart = () => {
    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '项目状态',
          type: statusViewMode.value === 'pie' ? 'pie' : 'bar',
          radius: statusViewMode.value === 'pie' ? '55%' : undefined,
          center: statusViewMode.value === 'pie' ? ['50%', '60%'] : undefined,
          data: [
            { value: 45, name: '进行中', itemStyle: { color: '#409EFF' } },
            { value: 72, name: '已完成', itemStyle: { color: '#67C23A' } },
            { value: 8, name: '未开始', itemStyle: { color: '#909399' } },
            { value: 3, name: '已暂停', itemStyle: { color: '#E6A23C' } }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }

    if (statusViewMode.value === 'bar') {
      option.xAxis = { type: 'category', data: ['进行中', '已完成', '未开始', '已暂停'] }
      option.yAxis = { type: 'value' }
      if (option.series && Array.isArray(option.series) && option.series[0]) {
        option.series[0].data = [
          { value: 45, itemStyle: { color: '#409EFF' } },
          { value: 72, itemStyle: { color: '#67C23A' } },
          { value: 8, itemStyle: { color: '#909399' } },
          { value: 3, itemStyle: { color: '#E6A23C' } }
        ]
      }
    }

    statusChart.initChart(option)
  }

  const initResourceChart = () => {
    resourceChart.initChart({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['张三', '李四', '王五', '赵六', '钱七']
      },
      yAxis: { type: 'value', max: 100 },
      series: [
        {
          name: '工作负载',
          type: 'bar',
          data: [85, 75, 90, 65, 70],
          itemStyle: {
            color: new (window as any).echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#409EFF' },
              { offset: 1, color: '#66B1FF' }
            ])
          }
        }
      ]
    })
  }

  const updateTrendChart = () => {
    let seriesData: any[] = []
    let yAxisName = ''

    switch (trendType.value) {
      case 'count':
        seriesData = [10, 15, 20, 28, 35, 45, 55, 65, 75, 85, 95, 128]
        yAxisName = '项目数量'
        break
      case 'completion':
        seriesData = [65, 68, 72, 75, 78, 82, 85, 88, 90, 92, 94, 95]
        yAxisName = '完成率 (%)'
        break
      case 'budget':
        seriesData = [85, 82, 78, 75, 72, 70, 68, 65, 62, 60, 58, 55]
        yAxisName = '预算执行率 (%)'
        break
    }

    trendChart.initChart({
      tooltip: {
        trigger: 'axis'
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: [
          '1月',
          '2月',
          '3月',
          '4月',
          '5月',
          '6月',
          '7月',
          '8月',
          '9月',
          '10月',
          '11月',
          '12月'
        ]
      },
      yAxis: {
        type: 'value',
        name: yAxisName
      },
      series: [
        {
          name: yAxisName,
          type: 'line',
          data: seriesData,
          smooth: true,
          itemStyle: { color: '#409EFF' },
          areaStyle: {
            color: new (window as any).echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ])
          }
        }
      ]
    })
  }

  // 生命周期
  onMounted(() => {
    initCharts()
  })

  // 监听视图模式变化
  watch(statusViewMode, updateStatusChart)
  watch(trendType, updateTrendChart)
</script>

<style scoped>
  .statistics-page {
    .flex-c {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .flex-cc {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
