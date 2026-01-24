<!-- 费用表单组件 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="500px"
    :close-on-click-modal="false"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px" class="mt-2">
      <ElFormItem label="日期" prop="date">
        <ElDatePicker
          v-model="formData.date"
          type="date"
          placeholder="选择日期"
          style="width: 100%"
        />
      </ElFormItem>

      <ElFormItem label="项目" prop="project_id">
        <ElSelect
          v-model="formData.project_id"
          placeholder="选择项目"
          style="width: 100%"
          filterable
          remote
          reserve-keyword
          :remote-method="handleRemoteSearch"
          :loading="projectLoading"
        >
          <ElOption
            v-for="project in projectList"
            :key="project.id"
            :label="project.name"
            :value="project.id"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="类型" prop="type">
        <ElSelect v-model="formData.type" placeholder="选择费用类型" style="width: 100%">
          <ElOption label="收入" value="income" />
          <ElOption label="支出" value="expense" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="描述" prop="description">
        <ElInput
          v-model="formData.description"
          type="textarea"
          placeholder="请输入费用描述"
          :rows="2"
        />
      </ElFormItem>

      <ElFormItem label="金额" prop="amount">
        <ElInputNumber
          v-model="formData.amount"
          :min="0"
          :step="100"
          :precision="2"
          style="width: 100%"
          :prefix="formData.type === 'income' ? '+' : '-'"
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">保存</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import type { FormInstance } from 'element-plus'

  import { getProjectList } from '@/api/project'
  import type { ProjectItem } from '@/types/api/project'

  defineOptions({ name: 'ExpenseForm' })

  interface Props {
    visible: boolean
    expenseData?: any
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    expenseData: undefined
  })

  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: any): void
  }>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogTitle = computed(() => (props.expenseData ? '编辑费用' : '创建费用'))

  interface FormData {
    date: string
    project_id: number
    type: string
    description: string
    amount: number
  }

  const formRef = ref<FormInstance>()

  const formData = ref<FormData>({
    date: new Date().toISOString().split('T')[0],
    project_id: 0,
    type: 'expense',
    description: '',
    amount: 0
  })

  const rules = {
    date: [{ required: true, message: '请选择日期', trigger: 'change' }],
    project_id: [{ required: true, message: '请选择项目', trigger: 'change' }],
    type: [{ required: true, message: '请选择费用类型', trigger: 'change' }],
    description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
    amount: [{ required: true, message: '请输入金额', trigger: 'blur' }]
  }

  // 项目列表
  const projectList = ref<ProjectItem[]>([])
  const projectLoading = ref(false)

  // 获取项目列表
  const loadProjects = async (keyword = '') => {
    projectLoading.value = true
    try {
      const response = await getProjectList({ keyword })
      projectList.value = response.data
    } catch (error) {
      console.error('获取项目列表失败:', error)
      projectList.value = []
    } finally {
      projectLoading.value = false
    }
  }

  // 远程搜索项目
  const handleRemoteSearch = (keyword: string) => {
    loadProjects(keyword)
  }

  // 监听 expenseData 变化，更新表单
  watch(
    () => props.expenseData,
    (newVal) => {
      if (newVal) {
        // 在编辑模式下，根据project_name查找对应的project_id
        const project = projectList.value.find((p) => p.name === newVal.project_name)
        formData.value = {
          ...newVal,
          project_id: project?.id || 0,
          amount: Math.abs(newVal.amount) // 转换为正数显示
        }
      } else {
        formData.value = {
          date: new Date().toISOString().split('T')[0],
          project_id: 0,
          type: 'expense',
          description: '',
          amount: 0
        }
      }
    },
    { immediate: true }
  )

  // 监听表单可见性变化，加载项目列表
  watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        loadProjects()
      }
    }
  )

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()

      // 处理金额：收入为正数，支出为负数
      const submitData = {
        ...formData.value,
        amount:
          formData.value.type === 'income'
            ? Math.abs(formData.value.amount)
            : -Math.abs(formData.value.amount)
      }

      emit('submit', submitData)
      dialogVisible.value = false
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }
</script>

<style scoped>
  .dialog-footer {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
</style>
