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

        <ElDropdown @command="handleExport">
          <ElButton>
            <el-icon><Download /></el-icon>
            导出报告
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </ElButton>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem command="excel">导出Excel</ElDropdownItem>
              <ElDropdownItem command="pdf">导出PDF</ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>
    </div>

    <!-- 关键指标卡片 -->
    <div class="mb-6">
      <ElRow :gutter="20" class="flex">
        <ElCol v-for="(item, index) in cardDataList" :key="index" :xs="24" :sm="12" :md="6" :lg="6">
          <div
            v-if="!loading"
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
          <div v-else class="art-card h-35 px-5 mb-5 max-sm:mb-4">
            <ElSkeleton :rows="3" animated />
          </div>
        </ElCol>
      </ElRow>
    </div>

    <!-- 财务概览 -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-4">财务概览</h2>
      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="24" :md="12" :lg="12">
          <div v-if="!loading" class="art-card p-5 h-full">
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
                  totalBudget > 0 ? ((totalActualCost / totalBudget) * 100).toFixed(1) : '0.0'
                }}%)
              </div>
            </div>

            <el-progress
              :percentage="totalBudget > 0 ? (totalActualCost / totalBudget) * 100 : 0"
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
                  >{{
                    totalBudget > 0 ? ((totalActualCost / totalBudget) * 100).toFixed(1) : '0.0'
                  }}%</div
                >
              </div>
            </div>
          </div>
          <div v-else class="art-card p-5 h-full">
            <ElSkeleton :rows="6" animated />
          </div>
        </ElCol>

        <ElCol :xs="24" :sm="24" :md="12" :lg="12">
          <div v-if="!loading" class="art-card p-5 h-full">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-medium">财务收支分析</h3>
              <el-button type="text" size="small" @click="showFinanceDetail = true">
                详情 <el-icon class="ml-1"><ArrowRight /></el-icon>
              </el-button>
            </div>

            <div class="space-y-4 mb-4">
              <!-- 第一行：总收入、总支出、净利润 -->
              <div class="grid grid-cols-3 gap-4 h-40">
                <!-- 总收入 -->
                <div class="text-center p-3 bg-success/5 rounded-lg flex flex-col justify-center">
                  <div class="text-sm text-g-600">总收入</div>
                  <div class="text-2xl font-bold text-success my-2"
                    >¥{{ formatNumber(totalRevenue) }}</div
                  >
                  <div class="text-xs text-success">
                    <el-icon class="mr-1"><TrendCharts /></el-icon>
                    较上月 +12.5%
                  </div>
                </div>

                <!-- 总支出 -->
                <div class="text-center p-3 bg-danger/5 rounded-lg flex flex-col justify-center">
                  <div class="text-sm text-g-600">总支出</div>
                  <div class="text-2xl font-bold text-danger my-2"
                    >¥{{ formatNumber(totalActualCost) }}</div
                  >
                  <div class="text-xs text-danger">
                    <el-icon class="mr-1"><TrendCharts /></el-icon>
                    较上月 +8.2%
                  </div>
                </div>

                <!-- 净利润 -->
                <div class="text-center p-3 bg-primary/5 rounded-lg flex flex-col justify-center">
                  <div class="text-sm text-g-600">净利润</div>
                  <div class="text-2xl font-bold text-primary my-2"
                    >¥{{ formatNumber(totalRevenue - totalActualCost) }}</div
                  >
                  <div class="text-xs text-primary">
                    <el-icon class="mr-1"><TrendCharts /></el-icon>
                    利润率
                    {{
                      totalActualCost > 0
                        ? (((totalRevenue - totalActualCost) / totalActualCost) * 100).toFixed(1)
                        : '0.0'
                    }}%
                  </div>
                </div>
              </div>

              <!-- 第二行：项目净利润排行 -->
              <div class="bg-white rounded-lg border border-gray-100 p-4 h-40">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-medium">项目净利润排行</h4>
                  <el-button type="text" size="small" @click="showProfitRankingDetail = true">
                    详情 <el-icon class="ml-1"><ArrowRight /></el-icon>
                  </el-button>
                </div>
                <div class="space-y-2 h-[calc(100%-40px)] overflow-y-auto pr-2">
                  <div
                    v-for="(item, index) in projectProfitRanking"
                    :key="index"
                    class="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                  >
                    <div class="flex items-center">
                      <div
                        class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-primary font-medium"
                      >
                        {{ index + 1 }}
                      </div>
                      <div class="flex-1">
                        <div class="font-medium">{{ item.name }}</div>
                        <div class="text-xs text-g-600"> ¥{{ formatNumber(item.profit) }} </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="projectProfitRanking.length === 0" class="text-center text-g-600 py-4">
                    暂无数据
                  </div>
                </div>
              </div>
            </div>

            <div ref="financeChart.chartRef" style="height: 200px"></div>
          </div>
          <div v-else class="art-card p-5 h-full">
            <ElSkeleton :rows="8" animated />
          </div>
        </ElCol>
      </ElRow>
    </div>

    <!-- 项目状态和进度 -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-4">项目状态分析</h2>
      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="24" :md="12" :lg="12">
          <div v-if="!loading" class="art-card p-5 h-full">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-medium">项目状态分布</h3>
              <ElSelect
                v-model="statusViewMode"
                placeholder="视图模式"
                @change="updateStatusChart"
                style="width: 120px"
              >
                <ElOption label="饼图" value="pie" />
                <ElOption label="条形图" value="bar" />
              </ElSelect>
            </div>
            <div ref="statusChart.chartRef" style="height: 300px"></div>
          </div>
          <div v-else class="art-card p-5 h-full">
            <ElSkeleton :rows="4" animated />
          </div>
        </ElCol>

        <ElCol :xs="24" :sm="24" :md="12" :lg="12">
          <div v-if="!loading" class="art-card p-5 h-full">
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
              <div v-if="projectHealthList.length === 0" class="text-center text-g-600 py-4">
                暂无数据
              </div>
            </div>
          </div>
          <div v-else class="art-card p-5 h-full">
            <ElSkeleton :rows="6" animated />
          </div>
        </ElCol>
      </ElRow>
    </div>

    <!-- 风险预警和建议 -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-4">风险预警与建议</h2>
      <div v-if="!loading" class="art-card p-5">
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
              <div v-if="riskList.length === 0" class="text-center text-g-600 py-4"> 暂无数据 </div>
            </div>
          </div>

          <div>
            <div class="flex items-center mb-3">
              <div class="size-8 rounded-full bg-info/10 flex-cc mr-2">
                <el-icon class="text-info"><InfoFilled /></el-icon>
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
              <div v-if="suggestionList.length === 0" class="text-center text-g-600 py-4">
                暂无数据
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
              <div v-if="excellentProjects.length === 0" class="text-center text-g-600 py-4">
                暂无数据
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="art-card p-5">
        <ElSkeleton :rows="12" animated />
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

    <!-- 项目净利润排行详情弹窗 -->
    <ElDialog v-model="showProfitRankingDetail" title="项目净利润排行详情" width="800px">
      <div class="max-h-[500px] overflow-y-auto">
        <ElTable :data="projectProfitRanking" style="width: 100%">
          <ElTableColumn label="排名" width="80">
            <template #default="{ $index }">
              <div
                class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-medium"
              >
                {{ $index + 1 }}
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="name" label="项目名称" width="200" />
          <ElTableColumn label="总收入" width="150">
            <template #default="{ row }"> ¥{{ formatNumber(row.revenue || 0) }} </template>
          </ElTableColumn>
          <ElTableColumn label="总支出" width="150">
            <template #default="{ row }"> ¥{{ formatNumber(row.cost || 0) }} </template>
          </ElTableColumn>
          <ElTableColumn label="净利润" width="150">
            <template #default="{ row }">
              <div class="font-bold text-primary"> ¥{{ formatNumber(row.profit) }} </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="利润率" width="120">
            <template #default="{ row }">
              {{ row.cost > 0 ? ((row.profit / row.cost) * 100).toFixed(1) : '0.0' }}%
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, watch, computed } from 'vue'
  import {
    Refresh,
    Download,
    ArrowRight,
    TrendCharts,
    Warning,
    Trophy,
    InfoFilled,
    ArrowDown
  } from '@element-plus/icons-vue'
  import { ElMessage, ElSkeleton, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from '@/plugins/echarts'
  import ArtCountTo from '@/components/core/text-effect/art-count-to/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { getProjectStatistics } from '@/api/project'

  // TypeScript接口定义
  interface ProjectStatistics {
    totalProjects: number
    activeProjects: number
    completedProjects: number
    overdueProjects: number
    totalBudget: number
    totalActualCost: number
    totalRevenue: number
    statusDistribution: {
      in_progress: number
      completed: number
      pending: number
      on_hold: number
      cancelled: number
    }
    projectHealthList: ProjectHealth[]
    projectProfitRanking: ProjectProfit[]
    trendData: any[]
    riskList: Risk[]
    excellentProjects: ExcellentProject[]
    suggestionList: Suggestion[]
  }

  interface ProjectHealth {
    id: number
    name: string
    progress: number
    healthScore: number
    endDate: string
    budget?: number
    actualCost?: number
    riskLevel?: string
  }

  interface ProjectProfit {
    id?: number
    name: string
    revenue?: number
    cost?: number
    profit: number
  }

  interface Risk {
    id: number
    title: string
    description: string
    level: 'high' | 'medium' | 'low'
  }

  interface ExcellentProject {
    id: number
    name: string
    onTimeRate: number
    budgetDeviation: number
    score: number
  }

  interface Suggestion {
    id: number
    title: string
    description: string
  }

  interface DataCache {
    lastParams: string | null
    data: ProjectStatistics | null
  }

  defineOptions({ name: 'ProjectStatistics' })

  // 响应式数据
  const loading = ref(false)
  const dateRange = ref<[string, string]>(['', ''])
  const projectType = ref('')
  const statusViewMode = ref<'pie' | 'bar'>('pie')
  const showBudgetDetail = ref(false)
  const showFinanceDetail = ref(false)
  const showHealthDetail = ref(false)
  const showProfitRankingDetail = ref(false)

  // 数据缓存
  const dataCache = ref<DataCache>({
    lastParams: null,
    data: null
  })

  // 图表引用

  // 图表实例 - 为每个图表创建独立实例
  const financeChart = useChart()
  const statusChart = useChart()

  // 核心数据
  const statisticsData = ref<ProjectStatistics>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    overdueProjects: 0,
    totalBudget: 0,
    totalActualCost: 0,
    totalRevenue: 0,
    statusDistribution: {
      in_progress: 0,
      completed: 0,
      pending: 0,
      on_hold: 0,
      cancelled: 0
    },
    projectHealthList: [],
    projectProfitRanking: [],
    trendData: [],
    riskList: [],
    excellentProjects: [],
    suggestionList: []
  })

  // 计算属性
  /**
   * 总预算
   */
  const totalBudget = computed(() => statisticsData.value.totalBudget || 0)

  /**
   * 总支出
   */
  const totalActualCost = computed(() => statisticsData.value.totalActualCost || 0)

  /**
   * 总收入
   */
  const totalRevenue = computed(() => statisticsData.value.totalRevenue || 0)

  // 卡片数据
  /**
   * 关键指标卡片数据
   */
  const cardDataList = computed(() => [
    {
      des: '总项目数',
      icon: 'ri:folder-chart-line',
      num: statisticsData.value.totalProjects || 0,
      change: '+12',
      compareText: '较上月',
      color: '#409EFF'
    },
    {
      des: '进行中',
      icon: 'ri:play-circle-line',
      num: statisticsData.value.activeProjects || 0,
      change: '+8',
      compareText: '较上月',
      color: '#E6A23C'
    },
    {
      des: '已完成',
      icon: 'ri:check-double-line',
      num: statisticsData.value.completedProjects || 0,
      change: '+15',
      compareText: '较上月',
      color: '#67C23A'
    },
    {
      des: '逾期项目',
      icon: 'ri:alert-line',
      num: statisticsData.value.overdueProjects || 0,
      change: '-3',
      compareText: '较上月',
      color: '#F56C6C'
    }
  ])

  // 项目预算数据
  /**
   * 项目预算数据，用于预算详情弹窗
   */
  const projectBudgetList = computed(() => {
    return statisticsData.value.projectHealthList.map((project: ProjectHealth) => ({
      id: project.id,
      name: project.name,
      manager: '项目经理', // 模拟数据
      budget: project.budget || 0,
      actual_cost: project.actualCost || 0
    }))
  })

  // 项目健康度数据
  /**
   * 项目健康度数据，用于项目健康度分析和详情弹窗
   */
  const projectHealthList = computed(() => statisticsData.value.projectHealthList)

  // 财务详情数据
  /**
   * 财务详情数据，用于财务详情弹窗
   * 注意：这里使用的是模拟数据，实际项目中应该从后端API获取
   */
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
  /**
   * 风险预警数据，用于风险预警与建议部分
   */
  const riskList = computed(() => statisticsData.value.riskList)

  // 优化建议数据
  /**
   * 优化建议数据，用于风险预警与建议部分
   */
  const suggestionList = computed(() => statisticsData.value.suggestionList)

  // 优秀项目数据
  /**
   * 优秀项目数据，用于风险预警与建议部分
   */
  const excellentProjects = computed(() => statisticsData.value.excellentProjects)

  // 项目净利润排行
  /**
   * 项目净利润排行数据，用于财务收支分析部分
   * 从后端API获取数据并按净利润排序
   */
  const projectProfitRanking = computed(() => {
    // 从后端API获取数据
    const projects = statisticsData.value.projectProfitRanking || []

    // 确保数据格式正确并按净利润排序
    return projects
      .filter((project) => project && typeof project.profit === 'number')
      .sort((a, b) => (b.profit || 0) - (a.profit || 0))
      .slice(0, 5)
  })

  // 方法
  const getBudgetColor = (actual: number, budget: number) => {
    if (budget <= 0) return '#67C23A'
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

  const formatNumber = (num: any) => {
    // 确保输入是数字类型
    let numberValue = num
    if (typeof num === 'string') {
      // 处理可能的字符串拼接问题
      if (num.includes('.')) {
        // 只保留第一个小数点
        const parts = num.split('.')
        numberValue = parseFloat(`${parts[0]}.${parts.slice(1).join('')}`)
      } else {
        numberValue = parseFloat(num)
      }
    }
    // 检查是否是有效数字
    if (isNaN(numberValue)) {
      return '0'
    }
    return numberValue.toLocaleString()
  }

  const handleDateChange = () => {
    handleRefresh()
  }

  const handleFilterChange = () => {
    handleRefresh()
  }

  const handleRefresh = async () => {
    loading.value = true
    try {
      const params: Record<string, string | number> = {}
      if (dateRange.value && dateRange.value.length === 2) {
        params.start_date = dateRange.value[0]
        params.end_date = dateRange.value[1]
      }
      if (projectType.value) {
        params.project_type = projectType.value
      }

      // 检查缓存
      const paramsString = JSON.stringify(params)
      if (dataCache.value.lastParams === paramsString && dataCache.value.data) {
        // 使用缓存数据
        statisticsData.value = dataCache.value.data
        ElMessage.success('数据刷新成功（使用缓存）')
        initCharts()
      } else {
        // 请求新数据
        try {
          const data = await getProjectStatistics(params)
          // 验证数据结构
          if (data && typeof data === 'object') {
            statisticsData.value = data as ProjectStatistics
            // 更新缓存
            dataCache.value = {
              lastParams: paramsString,
              data: data as ProjectStatistics
            }
            ElMessage.success('数据刷新成功')
            initCharts()
          } else {
            throw new Error('无效的数据结构')
          }
        } catch (apiError: any) {
          console.error('API请求失败:', apiError)
          let errorMessage = '获取统计数据失败，请稍后重试'
          if (apiError.response) {
            // 服务器返回错误状态码
            const status = apiError.response.status
            if (status === 401) {
              errorMessage = '未授权，请重新登录'
            } else if (status === 403) {
              errorMessage = '无权限访问此资源'
            } else if (status === 404) {
              errorMessage = '请求的资源不存在'
            } else if (status >= 500) {
              errorMessage = '服务器内部错误，请稍后重试'
            }
          } else if (apiError.request) {
            // 请求已发送但没有收到响应
            errorMessage = '网络连接失败，请检查您的网络'
          }
          ElMessage.error(errorMessage)
        }
      }
    } catch (error: any) {
      console.error('处理数据时发生错误:', error)
      ElMessage.error('处理数据时发生错误，请稍后重试')
    } finally {
      loading.value = false
    }
  }

  const handleExport = (format: string) => {
    if (format === 'excel') {
      // 实现Excel导出功能
      exportToExcel()
    } else if (format === 'pdf') {
      // PDF导出功能开发中
      ElMessage.info('PDF导出功能开发中')
    }
  }

  const exportToExcel = () => {
    // 准备导出数据
    const exportData = {
      title: '项目统计分析报告',
      date: new Date().toLocaleString(),
      summary: {
        totalProjects: statisticsData.value.totalProjects || 0,
        activeProjects: statisticsData.value.activeProjects || 0,
        completedProjects: statisticsData.value.completedProjects || 0,
        overdueProjects: statisticsData.value.overdueProjects || 0,
        totalBudget: statisticsData.value.totalBudget || 0,
        totalActualCost: statisticsData.value.totalActualCost || 0,
        totalRevenue: statisticsData.value.totalRevenue || 0
      },
      projectRanking: projectProfitRanking.value,
      projectHealth: projectHealthList.value
    }

    // 生成CSV内容
    let csvContent = '项目统计分析报告\n'
    csvContent += `生成日期: ${exportData.date}\n\n`

    // 添加摘要信息
    csvContent += '一、项目摘要\n'
    csvContent += '项目总数,进行中,已完成,逾期项目\n'
    csvContent += `${exportData.summary.totalProjects},${exportData.summary.activeProjects},${exportData.summary.completedProjects},${exportData.summary.overdueProjects}\n\n`

    csvContent += '二、财务概览\n'
    csvContent += '总预算,总支出,总收入,净利润\n'
    const netProfit = exportData.summary.totalRevenue - exportData.summary.totalActualCost
    csvContent += `${exportData.summary.totalBudget},${exportData.summary.totalActualCost},${exportData.summary.totalRevenue},${netProfit}\n\n`

    // 添加项目净利润排行
    csvContent += '三、项目净利润排行\n'
    csvContent += '排名,项目名称,净利润\n'
    exportData.projectRanking.forEach((project: any, index: number) => {
      csvContent += `${index + 1},${project.name},${project.profit}\n`
    })
    csvContent += '\n'

    // 添加项目健康度
    csvContent += '四、项目健康度\n'
    csvContent += '项目名称,健康度,进度\n'
    exportData.projectHealth.forEach((project: any) => {
      csvContent += `${project.name},${project.healthScore},${project.progress || 0}\n`
    })

    // 创建Blob对象并下载
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `项目统计分析报告_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success('报告导出成功')
  }

  const viewProjectDetail = (projectId: number) => {
    ElMessage.info(`查看项目 ${projectId} 详情`)
  }

  // 图表初始化
  const initCharts = () => {
    // 使用requestAnimationFrame实现延迟加载，提升页面性能
    requestAnimationFrame(() => {
      initFinanceChart()
      updateStatusChart()
    })
  }

  const initFinanceChart = () => {
    financeChart.initChart({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: function (params: any) {
          let result = params[0].name + '<br/>'
          params.forEach((item: any) => {
            result += `${item.marker} ${item.seriesName}: ¥${item.value.toLocaleString()}<br/>`
          })
          return result
        }
      },
      legend: {
        data: ['收入', '支出'],
        top: '0%'
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月'],
        axisLabel: {
          rotate: 0
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '¥{value}'
        }
      },
      animationDuration: 1000,
      animationEasing: 'cubicOut',
      series: [
        {
          name: '收入',
          type: 'bar',
          data: [200000, 250000, 300000, 280000, 350000, 400000],
          itemStyle: { color: '#67C23A' },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(103, 194, 58, 0.5)'
            }
          }
        },
        {
          name: '支出',
          type: 'bar',
          data: [150000, 180000, 200000, 220000, 250000, 280000],
          itemStyle: { color: '#F56C6C' },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(245, 108, 108, 0.5)'
            }
          }
        }
      ]
    })
  }

  const updateStatusChart = () => {
    const statusData = [
      {
        value: statisticsData.value.statusDistribution?.in_progress || 0,
        name: '进行中',
        itemStyle: { color: '#409EFF' }
      },
      {
        value: statisticsData.value.statusDistribution?.completed || 0,
        name: '已完成',
        itemStyle: { color: '#67C23A' }
      },
      {
        value: statisticsData.value.statusDistribution?.pending || 0,
        name: '未开始',
        itemStyle: { color: '#909399' }
      },
      {
        value: statisticsData.value.statusDistribution?.on_hold || 0,
        name: '已暂停',
        itemStyle: { color: '#E6A23C' }
      },
      {
        value: statisticsData.value.statusDistribution?.cancelled || 0,
        name: '已取消',
        itemStyle: { color: '#F56C6C' }
      }
    ].filter((item) => item.value > 0)

    // 检查是否为空数据
    const isEmpty = statusData.length === 0

    if (isEmpty) {
      // 处理空数据情况
      statusChart.initChart({}, true)
      return
    }

    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          return `${params.name}: ${params.value} (${params.percent}%)`
        }
      },
      legend: {
        orient: statusViewMode.value === 'pie' ? 'vertical' : 'horizontal',
        left: statusViewMode.value === 'pie' ? 'left' : 'center',
        top: statusViewMode.value === 'pie' ? 'center' : '0%'
      },
      animationDuration: 1000,
      animationEasing: 'cubicOut',
      series: [
        {
          name: '项目状态',
          type: statusViewMode.value === 'pie' ? 'pie' : 'bar',
          radius: statusViewMode.value === 'pie' ? '55%' : undefined,
          center: statusViewMode.value === 'pie' ? ['50%', '60%'] : undefined,
          data: statusData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            },
            label: {
              show: true,
              fontSize: '14',
              fontWeight: 'bold'
            }
          },
          label: {
            show: statusViewMode.value === 'pie',
            formatter: '{b}: {c} ({d}%)'
          }
        }
      ]
    }

    if (statusViewMode.value === 'bar') {
      option.xAxis = {
        type: 'category',
        data: statusData.map((item) => item.name),
        axisLabel: {
          rotate: 0
        }
      }
      option.yAxis = {
        type: 'value',
        axisLabel: {
          formatter: '{value}'
        }
      }
      if (option.series && Array.isArray(option.series) && option.series[0]) {
        option.series[0].data = (statusData as Array<any>).map((item) => ({
          value: item.value,
          itemStyle: item.itemStyle
        }))
        // 使用类型断言解决 label 属性类型问题
        ;(option.series[0] as any).label = {
          show: true,
          position: 'top',
          formatter: '{c}'
        }
      }
    }

    statusChart.initChart(option)
  }

  // 生命周期
  onMounted(() => {
    handleRefresh()
  })

  // 监听视图模式变化
  watch(statusViewMode, updateStatusChart)
</script>

<style scoped>
  .statistics-page {
    /* 辅助类 */
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

    /* 统一卡片样式 */
    .art-card {
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .art-card:hover {
      box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
    }

    /* 标题样式 */
    h1 {
      font-size: 24px;
      font-weight: 700;
      color: var(--el-color-primary-dark-2);
    }

    h2 {
      font-size: 20px;
      font-weight: 600;
      color: var(--el-color-primary-dark-2);
    }

    h3 {
      font-size: 16px;
      font-weight: 500;
      color: var(--el-color-primary-dark-2);
    }

    h4 {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-color-primary-dark-2);
    }

    /* 文本样式 */
    .text-g-600 {
      color: var(--el-text-color-secondary);
    }

    .text-g-700 {
      color: var(--el-text-color-primary);
    }

    /* 动画效果 */
    .transition {
      transition: all 0.3s ease;
    }

    .transition-shadow {
      transition: box-shadow 0.3s ease;
    }

    /* 响应式调整 */
    @media (width <= 768px) {
      h1 {
        font-size: 20px;
      }

      h2 {
        font-size: 18px;
      }

      h3 {
        font-size: 14px;
      }

      .art-card {
        padding: 16px !important;
      }
    }
  }
</style>
