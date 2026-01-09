<template>
  <div class="max-w-5xl mx-auto p-5">
    <div class="text-center mb-7">
      <h2 class="text-gray-800 mb-5">{{ isEditMode ? '编辑项目' : '创建新项目' }}</h2>
      <div class="max-w-2xl mx-auto mb-5">
        <el-button type="primary" @click="openTemplateModal" style="margin-bottom: 10px">
          从模板创建项目
        </el-button>
      </div>
      <div class="max-w-2xl mx-auto">
        <el-steps :active="currentStep" finish-status="success">
          <el-step title="基础信息" description="项目基本信息"></el-step>
          <el-step title="规划节点" description="目标和任务规划"></el-step>
          <el-step title="项目配置" description="项目类型配置"></el-step>
          <el-step
            :title="isEditMode ? '编辑完成' : '创建完成'"
            :description="isEditMode ? '确认并保存' : '确认并创建'"
          ></el-step>
        </el-steps>
      </div>
    </div>

    <div class="bg-white rounded-lg p-7 mb-5 shadow-md min-h-[500px]">
      <!-- 第一步：基础信息 -->
      <div v-show="currentStep === 0" class="animate-fadeIn">
        <el-form ref="basicFormRef" :model="basicForm" :rules="basicRules" label-width="120px">
          <div class="mb-7">
            <h3 class="text-gray-800 mb-5 pb-2 border-b-2 border-blue-500 text-base"
              >项目基本信息</h3
            >

            <el-form-item label="项目名称" prop="projectName">
              <el-input
                v-model="basicForm.projectName"
                placeholder="请输入2-50字符的项目名称"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="项目编码" prop="projectCode">
              <el-input
                v-model="basicForm.projectCode"
                placeholder="示例：CARD-2026-001（类型-年份-序号）"
                maxlength="20"
              />
            </el-form-item>

            <el-form-item label="项目类型" prop="projectType">
              <el-select
                v-model="basicForm.projectType"
                placeholder="请选择项目类型"
                @change="handleProjectTypeChange"
              >
                <el-option label="软件开发" value="dev" />
                <el-option label="自律打卡" value="checkin" />
                <el-option label="写作创作" value="write" />
                <el-option label="视频创作" value="video" />
                <el-option label="设计创作" value="design" />
                <el-option label="学习培训" value="learning" />
              </el-select>
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="计划开始日期" prop="startDate">
                  <el-date-picker
                    v-model="basicForm.startDate"
                    type="date"
                    placeholder="请选择开始日期"
                    :disabled-date="disabledPastDate"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="计划结束日期" prop="endDate">
                  <el-date-picker
                    v-model="basicForm.endDate"
                    type="date"
                    placeholder="请选择结束日期"
                    :disabled-date="(time: Date) => disabledEndDate(time, basicForm.startDate)"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="核心目标" prop="coreTarget">
              <el-input
                v-model="basicForm.coreTarget"
                type="textarea"
                placeholder="请输入50-200字符的项目核心目标"
                :rows="3"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="验收标准" prop="acceptanceCriteria">
              <el-checkbox-group v-model="basicForm.acceptanceCriteria">
                <el-checkbox label="功能完整，满足核心需求" />
                <el-checkbox label="数据可量化，达成预设指标" />
                <el-checkbox label="交付物完整，可正常使用" />
                <el-checkbox label="自定义标准" @change="handleCustomCriteriaChange" />
              </el-checkbox-group>
              <div v-if="showCustomCriteria" class="mt-2">
                <el-input
                  v-model="basicForm.customAcceptance"
                  placeholder="请输入自定义验收标准"
                  class="mt-2"
                />
              </div>
            </el-form-item>
          </div>
        </el-form>
      </div>

      <!-- 第二步：规划节点目标 -->
      <div v-show="currentStep === 1" class="animate-fadeIn">
        <el-form ref="milestoneFormRef" :model="planForm" :rules="planRules" label-width="120px">
          <div class="mb-7">
            <h3 class="text-gray-800 mb-5 pb-2 border-b-2 border-blue-500 text-base"
              >项目规划与目标</h3
            >

            <div class="mb-4">
              <el-button type="primary" @click="addMilestone">
                <Plus />
                添加里程碑
              </el-button>
            </div>
            <el-table :data="planForm.milestones" border style="width: 100%; margin-top: 0">
              <el-table-column prop="name" label="节点名称" min-width="200" align="center">
                <template #default="scope">
                  <el-input v-model="scope.row.name" placeholder="请输入里程碑名称" />
                </template>
              </el-table-column>
              <el-table-column prop="nodeTask" label="节点任务" min-width="300" align="center">
                <template #default="scope">
                  <el-input-tag
                    v-model="scope.row.nodeTask"
                    placeholder="输入任务后按Enter"
                    size="default"
                    class="w-full"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="deadline" label="截止日期" min-width="200" align="center">
                <template #default="scope">
                  <el-date-picker
                    v-model="scope.row.deadline"
                    type="date"
                    placeholder="请选择截止日期"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="status" label="节点状态" min-width="150" align="center">
                <template #default="scope">
                  <el-select v-model="scope.row.status" placeholder="请选择节点状态">
                    <el-option label="未开始" value="pending" />
                    <el-option label="进行中" value="in_progress" />
                    <el-option label="已完成" value="completed" />
                    <el-option label="已延期" value="delayed" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="priority" label="优先级" min-width="150" align="center">
                <template #default="scope">
                  <el-select v-model="scope.row.priority" placeholder="请选择优先级">
                    <el-option label="低" value="low" />
                    <el-option label="中" value="medium" />
                    <el-option label="高" value="high" />
                  </el-select>
                </template>
              </el-table-column>

              <el-table-column prop="description" label="节点描述" min-width="250" align="center">
                <template #default="scope">
                  <el-input
                    v-model="scope.row.description"
                    placeholder="请输入节点描述"
                    maxlength="200"
                    show-word-limit
                    type="textarea"
                    :rows="2"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template #default="scope">
                  <el-button
                    @click="deleteMilestone(scope.$index)"
                    :icon="Delete"
                    circle
                    type="danger"
                    size="small"
                    plain
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form>
      </div>

      <!-- 第三步：项目配置 -->
      <div v-show="currentStep === 2" class="animate-fadeIn">
        <el-form ref="planFormRef" :model="planForm" :rules="planRules" label-width="120px">
          <div class="mb-7">
            <h3 class="text-gray-800 mb-5 pb-2 border-b-2 border-blue-500 text-base"
              >{{ getProjectTypeTitle() }}配置</h3
            >

            <!-- 通用预算配置 -->
            <div class="mb-6">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="项目预算" prop="budget">
                    <el-input-number
                      v-model="planForm.budget"
                      :min="0"
                      :max="99999999"
                      :step="100"
                      placeholder="请输入项目预算"
                    />
                    <span class="ml-2 text-gray-500">元</span>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 动态加载项目类型配置模板 -->
            <component
              :is="currentTemplate"
              v-model="planForm"
              :project-type="basicForm.projectType"
            />
          </div>
        </el-form>
      </div>

      <!-- 第四步：创建完成 -->
      <div v-show="currentStep === 4" class="animate-fadeIn">
        <div class="text-center py-8">
          <el-icon class="text-6xl text-green-500 mb-4"><Check /></el-icon>
          <h3 class="text-xl font-bold text-gray-800 mb-4">项目创建完成！</h3>
          <p class="text-gray-600 mb-6">您的项目 "{{ basicForm.projectName }}" 已成功创建</p>
          <div class="flex justify-center space-x-4">
            <el-button type="primary" @click="resetForm">创建新项目</el-button>
            <el-button @click="goToProjectList">查看项目列表</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="flex justify-between">
      <el-button v-if="currentStep > 0 && currentStep < 4" @click="prevStep">
        <ArrowLeft />
        上一步
      </el-button>
      <div></div>

      <el-button v-if="currentStep < 3" type="primary" @click="nextStep" :loading="isSubmitting">
        {{ currentStep === 2 ? '创建项目' : '下一步' }}
        <ArrowRight />
      </el-button>
    </div>
  </div>

  <!-- 模板选择对话框组件 -->
  <ProjectTemplateSelector
    v-model="templateModalVisible"
    :project-type="basicForm.projectType"
    @template-selected="handleTemplateSelected"
  />
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, watch, computed } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { ElMessage, FormInstance, FormRules } from 'element-plus'
  import { Check, Delete, Plus, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
  import type { CheckboxValueType } from 'element-plus/es/components/checkbox/src/checkbox'
  import { projectApi } from '@/api/item'
  import type { ProjectDetail, ProjectNode } from '@/types/api/item'
  import { useItemStore } from '@/store/modules/item'

  // 导入模板选择组件
  import ProjectTemplateSelector from './components/ProjectTemplateSelector.vue'

  // 导入项目类型模板组件
  import DevProjectConfig from './modules/DevProjectConfig.vue'
  import CheckinProjectConfig from './modules/CheckinProjectConfig.vue'
  import WriteProjectConfig from './modules/WriteProjectConfig.vue'
  import VideoProjectConfig from './modules/VideoProjectConfig.vue'
  import DesignProjectConfig from './modules/DesignProjectConfig.vue'
  import LearningProjectConfig from './modules/LearningProjectConfig.vue'

  // 响应式状态
  const currentStep = ref(0)
  const isSubmitting = ref(false)
  const showCustomCriteria = ref(false)

  // 模板相关状态
  const templateModalVisible = ref(false)

  // 状态管理
  const projectStore = useItemStore()

  // 根据项目类型动态选择模板组件
  const currentTemplate = computed(() => {
    const templateMap: Record<string, any> = {
      dev: DevProjectConfig,
      checkin: CheckinProjectConfig,
      write: WriteProjectConfig,
      video: VideoProjectConfig,
      design: DesignProjectConfig,
      learning: LearningProjectConfig
    }
    return templateMap[basicForm.projectType] || null
  })

  // 表单引用
  const basicFormRef = ref<FormInstance>()
  const milestoneFormRef = ref<FormInstance>()
  const planFormRef = ref<FormInstance>()

  // 路由
  const router = useRouter()
  const route = useRoute()

  // 编辑模式
  const isEditMode = ref(false)
  const currentProjectId = ref<number | null>(null)

  // 基础信息表单
  const basicForm = reactive({
    projectName: '',
    projectCode: '',
    projectType: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    coreTarget: '',
    acceptanceCriteria: [] as string[],
    customAcceptance: ''
  })

  // 规划表单
  const planForm = ref({
    milestones: [] as Array<{
      name: string
      nodeTask: string[]
      deadline: Date | null
      status: string
      priority: string
      description: string
    }>,

    // 通用配置
    budget: 0,

    // 软件开发
    frontFramework: '',
    backFramework: '',
    database: '',
    dailyHours: 0,
    codeRepo: '',

    // 自律打卡
    checkinCycle: '',
    checkinTimeWindow: [] as string[],
    recheckinCount: 0,
    checkinDimensionCount: '1',
    checkinDimensions: [
      { name: '', requirement: '' },
      { name: '', requirement: '' }
    ],

    // 写作创作
    writeType: '',
    targetWords: 0,
    dailyWords: 0,
    expectedDays: 0,
    publishPlatforms: [] as string[],

    // 视频创作
    videoType: '',
    videoDuration: 0,
    videoCount: 0,
    equipmentType: '',
    editingSoftware: '',
    videoPublishPlatforms: [] as string[],

    // 设计创作
    designType: '',
    designSoftware: '',
    deliverableCount: 0,
    designSpec: '',

    // 学习培训
    learningField: '',
    learningMethod: '',
    targetCertificate: '',
    dailyLearningHours: 0,
    expectedMonths: 0,
    learningResources: [] as string[]
  })

  // 表单验证规则
  const basicRules: FormRules = {
    projectName: [
      { required: true, message: '请输入项目名称', trigger: 'blur' },
      { min: 2, max: 50, message: '项目名称长度为2-50字符', trigger: 'blur' }
    ],
    projectCode: [
      { required: true, message: '请输入项目编码', trigger: 'blur' },
      {
        pattern: /^[A-Z]+-\d{4}-\d{3}$/,
        message: '项目编码格式应为：类型-年份-序号（如：DEV-2026-001）',
        trigger: 'blur'
      },
      {
        validator: (_rule: any, value: string, callback: any) => {
          if (!value) return callback()
          // 模拟唯一性验证，实际项目中应调用API检查数据库
          // 由于没有实际的模拟数据，直接返回验证通过
          callback()
        },
        trigger: 'blur'
      }
    ],
    projectType: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
    startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
    endDate: [
      { required: true, message: '请选择结束日期', trigger: 'change' },
      {
        validator: (_rule: any, value: Date, callback: any) => {
          if (value && basicForm.startDate && value < basicForm.startDate) {
            callback(new Error('结束日期不能早于开始日期'))
          } else {
            callback()
          }
        },
        trigger: 'change'
      }
    ],
    coreTarget: [
      { required: true, message: '请输入核心目标', trigger: 'blur' },
      { min: 10, max: 200, message: '核心目标长度为10-200字符', trigger: 'blur' }
    ],
    acceptanceCriteria: [
      { type: 'array', required: true, message: '请至少选择一个验收标准', trigger: 'change' }
    ]
  }

  const planRules: FormRules = {
    milestones: [
      {
        validator: (_rule: any, value: any, callback: any) => {
          if (value.length === 0) {
            callback(new Error('请至少添加一个里程碑'))
          } else {
            // 检查每个里程碑的必填字段
            const invalidMilestones = value.filter(
              (m: any) =>
                !m.name || !m.nodeTask || m.nodeTask.length === 0 || !m.deadline || !m.status
            )
            if (invalidMilestones.length > 0) {
              callback(new Error('请完善所有里程碑的必填字段（名称、任务、截止日期、状态）'))
            } else {
              callback()
            }
          }
        },
        trigger: 'change'
      }
    ],
    // 通用配置验证规则
    budget: [
      { required: true, message: '请输入项目预算', trigger: 'change' },
      { type: 'number', min: 0, message: '项目预算不能小于0', trigger: 'change' },
      { type: 'number', max: 99999999, message: '项目预算不能超过99999999元', trigger: 'change' }
    ],
    // 软件开发验证规则
    frontFramework: [{ required: true, message: '请选择前端框架', trigger: 'change' }],
    backFramework: [{ required: true, message: '请选择后端技术', trigger: 'change' }],
    database: [{ required: true, message: '请选择数据库', trigger: 'change' }],
    dailyHours: [
      { required: true, message: '请输入每日投入工时', trigger: 'blur' },
      { type: 'number', min: 0.5, message: '每日投入工时不能小于0.5小时', trigger: 'blur' }
    ],
    codeRepo: [
      { required: true, message: '请输入代码仓库地址', trigger: 'blur' },
      { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
    ],
    // 自律打卡验证规则
    checkinCycle: [{ required: true, message: '请选择打卡周期', trigger: 'change' }],
    checkinTimeWindow: [
      { type: 'array', required: true, message: '请选择打卡时间范围', trigger: 'change' }
    ],
    recheckinCount: [
      { required: true, message: '请输入每月补卡次数', trigger: 'blur' },
      { type: 'number', min: 0, max: 10, message: '补卡次数范围为0-10次', trigger: 'blur' }
    ],
    checkinDimensionCount: [{ required: true, message: '请选择打卡维度数量', trigger: 'change' }],
    // 写作创作验证规则
    writeType: [{ required: true, message: '请选择写作类型', trigger: 'change' }],
    targetWords: [
      { required: true, message: '请输入目标字数', trigger: 'blur' },
      { type: 'number', min: 1000, message: '目标字数不能少于1000字', trigger: 'blur' }
    ],
    dailyWords: [
      { required: true, message: '请输入每日目标字数', trigger: 'blur' },
      { type: 'number', min: 100, message: '每日目标字数不能少于100字', trigger: 'blur' }
    ],
    expectedDays: [
      { required: true, message: '请输入预计完成天数', trigger: 'blur' },
      { type: 'number', min: 7, message: '预计完成天数不能少于7天', trigger: 'blur' }
    ],
    publishPlatforms: [
      { type: 'array', required: true, message: '请至少选择一个发布平台', trigger: 'change' }
    ],
    // 视频创作验证规则
    videoType: [{ required: true, message: '请选择视频类型', trigger: 'change' }],
    videoDuration: [
      { required: true, message: '请输入视频时长', trigger: 'blur' },
      { type: 'number', min: 1, message: '视频时长不能小于1分钟', trigger: 'blur' }
    ],
    videoCount: [
      { required: true, message: '请输入计划期数', trigger: 'blur' },
      { type: 'number', min: 1, message: '计划期数不能小于1', trigger: 'blur' }
    ],
    equipmentType: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
    editingSoftware: [{ required: true, message: '请选择剪辑软件', trigger: 'change' }],
    videoPublishPlatforms: [
      { type: 'array', required: true, message: '请至少选择一个发布平台', trigger: 'change' }
    ],
    // 设计创作验证规则
    designType: [{ required: true, message: '请选择设计类型', trigger: 'change' }],
    designSoftware: [{ required: true, message: '请选择设计软件', trigger: 'change' }],
    deliverableCount: [
      { required: true, message: '请输入计划交付文件数', trigger: 'blur' },
      { type: 'number', min: 1, message: '计划交付文件数不能小于1', trigger: 'blur' }
    ],
    designSpec: [
      { required: true, message: '请输入设计规范要求', trigger: 'blur' },
      { min: 10, message: '设计规范要求不能少于10个字符', trigger: 'blur' }
    ],
    // 学习培训验证规则
    learningField: [{ required: true, message: '请选择学习领域', trigger: 'change' }],
    learningMethod: [{ required: true, message: '请选择学习方式', trigger: 'change' }],
    targetCertificate: [
      { required: true, message: '请输入目标证书或认证', trigger: 'blur' },
      { min: 2, message: '目标证书或认证不能少于2个字符', trigger: 'blur' }
    ],
    dailyLearningHours: [
      { required: true, message: '请输入每日学习时长', trigger: 'blur' },
      { type: 'number', min: 0.5, message: '每日学习时长不能小于0.5小时', trigger: 'blur' }
    ],
    expectedMonths: [
      { required: true, message: '请输入预期完成时间', trigger: 'blur' },
      { type: 'number', min: 1, message: '预期完成时间不能小于1个月', trigger: 'blur' }
    ],
    learningResources: [
      { type: 'array', required: true, message: '请至少选择一个学习资源', trigger: 'change' }
    ]
  }

  // 日期禁用函数
  const disabledPastDate = (time: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return time.getTime() < today.getTime()
  }

  const disabledEndDate = (time: Date, startDate: Date | null) => {
    if (!startDate) return disabledPastDate(time)
    return time.getTime() <= startDate.getTime()
  }

  // 方法
  const handleProjectTypeChange = () => {
    // 根据项目类型初始化特定的配置
    resetProjectTypeConfig()
  }

  const resetProjectTypeConfig = () => {
    // 重置所有项目类型特定的配置
    Object.assign(planForm.value, {
      // 软件开发
      frontFramework: '',
      backFramework: '',
      database: '',
      dailyHours: 0,
      codeRepo: '',

      // 自律打卡
      checkinCycle: '',
      checkinTimeWindow: [],
      recheckinCount: 0,
      checkinDimensionCount: '1',
      checkinDimensions: [
        { name: '', requirement: '' },
        { name: '', requirement: '' }
      ],

      // 写作创作
      writeType: '',
      targetWords: 0,
      dailyWords: 0,
      expectedDays: 0,
      publishPlatforms: [],

      // 视频创作
      videoType: '',
      videoDuration: 0,
      videoCount: 0,
      equipmentType: '',
      editingSoftware: '',
      videoPublishPlatforms: [],

      // 设计创作
      designType: '',
      designSoftware: '',
      deliverableCount: 0,
      designSpec: '',

      // 学习培训
      learningField: '',
      learningMethod: '',
      targetCertificate: '',
      dailyLearningHours: 0,
      expectedMonths: 0,
      learningResources: []
    })
  }

  const handleCustomCriteriaChange = (value: CheckboxValueType) => {
    showCustomCriteria.value = Array.isArray(value)
      ? value.includes('自定义标准')
      : value === '自定义标准'
    if (!showCustomCriteria.value) {
      basicForm.customAcceptance = ''
    }
  }

  const addMilestone = () => {
    planForm.value.milestones.push({
      name: '',
      nodeTask: [],
      deadline: null,
      status: 'pending',
      priority: 'medium',
      description: ''
    })
  }

  const deleteMilestone = (index: number) => {
    planForm.value.milestones.splice(index, 1)
  }

  const getProjectTypeTitle = () => {
    const typeMap: Record<string, string> = {
      dev: '软件开发',
      checkin: '自律打卡',
      write: '写作创作',
      video: '视频创作',
      design: '设计创作',
      learning: '学习培训'
    }
    return typeMap[basicForm.projectType] || '项目'
  }

  const nextStep = async () => {
    try {
      if (currentStep.value === 0) {
        if (!basicFormRef.value) return

        const isValid = await basicFormRef.value.validate()
        if (isValid) {
          currentStep.value++
        } else {
          ElMessage.error('请完善基础信息')
        }
      } else if (currentStep.value === 1) {
        if (!milestoneFormRef.value) return

        const isValid = await milestoneFormRef.value.validate()
        if (isValid) {
          currentStep.value++
        } else {
          ElMessage.error('请完善项目规划信息')
        }
      } else if (currentStep.value === 2) {
        if (!planFormRef.value) return

        const isValid = await planFormRef.value.validate()
        if (isValid) {
          await createProject()
        } else {
          ElMessage.error('请完善项目配置信息')
        }
      }
    } catch {
      ElMessage.error('表单验证失败，请检查并修正错误后重试')
    }
  }

  const prevStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }

  const createProject = async () => {
    try {
      isSubmitting.value = true

      // 构建项目数据
      const projectData: any = {
        name: basicForm.projectName,
        code: basicForm.projectCode,
        type: basicForm.projectType,
        status: 'pending',
        progress: 0,
        startDate: basicForm.startDate?.toISOString().split('T')[0] || '',
        endDate: basicForm.endDate?.toISOString().split('T')[0] || '',
        coreTarget: basicForm.coreTarget,
        acceptanceCriteria: basicForm.acceptanceCriteria,
        customAcceptance: basicForm.customAcceptance,
        budget: planForm.value.budget,
        description: '',
        nodes: planForm.value.milestones.map((milestone: any, index: number) => ({
          id: index + 1,
          title: milestone.name,
          description: milestone.description || '',
          date: milestone.deadline?.toISOString().split('T')[0] || '',
          status: milestone.status,
          progress:
            milestone.status === 'completed' ? 100 : milestone.status === 'in_progress' ? 50 : 0,
          priority: milestone.priority,
          assignedTo: '',
          tasks: milestone.nodeTask.map((taskName: string, taskIndex: number) => ({
            id: taskIndex + 1,
            name: taskName,
            completed: false,
            priority: 'medium' as const
          }))
        }))
      }

      // 根据项目类型添加相应的配置信息
      if (basicForm.projectType === 'dev') {
        projectData.dev = {
          frontFramework: planForm.value.frontFramework,
          backFramework: planForm.value.backFramework,
          database: planForm.value.database,
          dailyHours: planForm.value.dailyHours,
          codeRepo: planForm.value.codeRepo
        }
      } else if (basicForm.projectType === 'checkin') {
        projectData.checkin = {
          cycle: planForm.value.checkinCycle,
          timeWindow: planForm.value.checkinTimeWindow,
          recheckinCount: planForm.value.recheckinCount,
          dimensionCount: planForm.value.checkinDimensionCount,
          dimensions: planForm.value.checkinDimensions
        }
      } else if (basicForm.projectType === 'write') {
        projectData.write = {
          type: planForm.value.writeType,
          targetWords: planForm.value.targetWords,
          dailyWords: planForm.value.dailyWords,
          expectedDays: planForm.value.expectedDays,
          publishPlatforms: planForm.value.publishPlatforms
        }
      } else if (basicForm.projectType === 'video') {
        projectData.video = {
          type: planForm.value.videoType,
          duration: planForm.value.videoDuration,
          count: planForm.value.videoCount,
          equipmentType: planForm.value.equipmentType,
          editingSoftware: planForm.value.editingSoftware,
          publishPlatforms: planForm.value.videoPublishPlatforms
        }
      } else if (basicForm.projectType === 'design') {
        projectData.design = {
          type: planForm.value.designType,
          software: planForm.value.designSoftware,
          deliverableCount: planForm.value.deliverableCount,
          spec: planForm.value.designSpec
        }
      } else if (basicForm.projectType === 'learning') {
        projectData.learning = {
          field: planForm.value.learningField,
          method: planForm.value.learningMethod,
          targetCertificate: planForm.value.targetCertificate,
          dailyLearningHours: planForm.value.dailyLearningHours,
          expectedMonths: planForm.value.expectedMonths,
          learningResources: planForm.value.learningResources
        }
      }

      // 根据模式调用不同的API
      if (isEditMode.value && currentProjectId.value) {
        await projectApi.updateProject(currentProjectId.value, projectData)
        ElMessage.success('项目更新成功！')
      } else {
        await projectApi.createProject(projectData)
        ElMessage.success('项目创建成功！')
      }

      currentStep.value = 4

      // 3秒后自动跳转到项目列表
      setTimeout(() => {
        router.push('/item/list')
      }, 3000)
    } catch (error) {
      console.error('项目操作失败:', error)
      ElMessage.error(isEditMode.value ? '项目更新失败，请重试' : '项目创建失败，请重试')
    } finally {
      isSubmitting.value = false
    }
  }

  const resetForm = () => {
    // 重置所有表单数据
    Object.assign(basicForm, {
      projectName: '',
      projectCode: '',
      projectType: '',
      startDate: null,
      endDate: null,
      coreTarget: '',
      acceptanceCriteria: [],
      customAcceptance: ''
    })

    Object.assign(planForm, {
      milestones: [],
      frontFramework: '',
      backFramework: '',
      database: '',
      dailyHours: 0,
      codeRepo: '',
      checkinCycle: '',
      checkinTimeWindow: [],
      recheckinCount: 0,
      checkinDimensionCount: '1',
      checkinDimensions: [
        { name: '', requirement: '' },
        { name: '', requirement: '' }
      ],
      writeType: '',
      targetWords: 0,
      dailyWords: 0,
      expectedDays: 0,
      publishPlatforms: [],
      videoType: '',
      videoDuration: 0,
      videoCount: 0,
      equipmentType: '',
      editingSoftware: '',
      videoPublishPlatforms: [],
      designType: '',
      designSoftware: '',
      deliverableCount: 0,
      designSpec: '',
      learningField: '',
      learningMethod: '',
      targetCertificate: '',
      dailyLearningHours: 0,
      expectedMonths: 0,
      learningResources: []
    })

    showCustomCriteria.value = false
    currentStep.value = 0
  }

  const goToProjectList = () => {
    // 跳转到项目列表页面
    router.push('/item/list')
  }

  // 监听项目类型变化
  watch(
    () => basicForm.projectType,
    () => {
      resetProjectTypeConfig()
    }
  )

  // 加载项目数据
  const loadProjectData = async (id: number) => {
    try {
      isSubmitting.value = true

      // 使用API获取项目详情
      const projectData: ProjectDetail = await projectApi.getProjectDetail(id)

      // 直接填充表单数据，确保响应式更新
      basicForm.projectName = projectData.name
      basicForm.projectCode = projectData.code
      basicForm.projectType = projectData.type
      basicForm.startDate = new Date(projectData.startDate)
      basicForm.endDate = new Date(projectData.endDate)
      basicForm.coreTarget = projectData.coreTarget
      basicForm.acceptanceCriteria = [...projectData.acceptanceCriteria]
      basicForm.customAcceptance = projectData.customAcceptance || ''

      // 处理里程碑数组，使用展开运算符确保响应式
      planForm.value.milestones = (projectData.nodes || []).map((node: ProjectNode) => ({
        name: node.title,
        nodeTask: [],
        deadline: new Date(node.date),
        status: node.status,
        priority: node.priority || 'medium',
        description: node.description
      }))
      planForm.value.budget = projectData.budget || 0

      // 根据项目类型填充相应的配置信息
      if (projectData.type === 'dev') {
        planForm.value.frontFramework = projectData.dev?.frontFramework || ''
        planForm.value.backFramework = projectData.dev?.backFramework || ''
        planForm.value.database = projectData.dev?.database || ''
        planForm.value.dailyHours = projectData.dev?.dailyHours || 0
        planForm.value.codeRepo = projectData.dev?.codeRepo || ''
      } else if (projectData.type === 'checkin') {
        planForm.value.checkinCycle = projectData.checkin?.cycle || 'daily'
        planForm.value.checkinTimeWindow = projectData.checkin?.timeWindow || []
        planForm.value.recheckinCount = projectData.checkin?.recheckinCount || 0
        planForm.value.checkinDimensionCount = projectData.checkin?.dimensionCount || '1'
        planForm.value.checkinDimensions = projectData.checkin?.dimensions || [
          { name: '', requirement: '' }
        ]
      } else if (projectData.type === 'write') {
        planForm.value.writeType = projectData.write?.type || ''
        planForm.value.targetWords = projectData.write?.targetWords || 0
        planForm.value.dailyWords = projectData.write?.dailyWords || 0
        planForm.value.expectedDays = projectData.write?.expectedDays || 0
        planForm.value.publishPlatforms = projectData.write?.publishPlatforms || []
      } else if (projectData.type === 'video') {
        planForm.value.videoType = projectData.video?.type || ''
        planForm.value.videoDuration = projectData.video?.duration || 0
        planForm.value.videoCount = projectData.video?.count || 0
        planForm.value.equipmentType = projectData.video?.equipmentType || ''
        planForm.value.editingSoftware = projectData.video?.editingSoftware || ''
        planForm.value.videoPublishPlatforms = projectData.video?.publishPlatforms || []
      } else if (projectData.type === 'design') {
        planForm.value.designType = projectData.design?.type || ''
        planForm.value.designSoftware = projectData.design?.software || ''
        planForm.value.deliverableCount = projectData.design?.deliverableCount || 0
        planForm.value.designSpec = projectData.design?.spec || ''
      } else if (projectData.type === 'learning') {
        planForm.value.learningField = projectData.learning?.field || ''
        planForm.value.learningMethod = projectData.learning?.method || ''
        planForm.value.targetCertificate = projectData.learning?.targetCertificate || ''
        planForm.value.dailyLearningHours = projectData.learning?.dailyHours || 0
        planForm.value.expectedMonths = projectData.learning?.expectedMonths || 0
        planForm.value.learningResources = projectData.learning?.resources || []
      }

      // 处理自定义验收标准显示
      if (basicForm.acceptanceCriteria.includes('自定义标准')) {
        showCustomCriteria.value = true
      }

      ElMessage.success('项目数据加载成功！')
    } catch (error) {
      console.error('加载项目数据失败:', error)
      ElMessage.error('项目数据加载失败，请重试')
    } finally {
      isSubmitting.value = false
    }
  }

  // 组件挂载时初始化
  onMounted(() => {
    // 检查是否处于编辑模式
    console.log('当前路由参数:', route.query)
    const mode = route.query.mode as string
    const id = route.query.id as string

    if (mode === 'edit' && id) {
      isEditMode.value = true
      currentProjectId.value = Number(id)
      console.log('进入编辑模式，项目ID:', currentProjectId.value)
      // 加载项目数据
      loadProjectData(Number(id))
    } else {
      console.log('进入创建模式')
    }
  })

  // 加载模板列表
  // 从模板创建项目
  const handleTemplateSelected = async (templateId: number) => {
    try {
      isSubmitting.value = true
      await projectStore.createProjectFromTemplate(templateId, {})
      ElMessage.success('项目创建成功！')
      router.push('/item/list')
    } catch {
      ElMessage.error('从模板创建项目失败')
    } finally {
      isSubmitting.value = false
    }
  }

  // 打开模板选择对话框
  const openTemplateModal = () => {
    templateModalVisible.value = true
  }

  // 表单验证规则
</script>
