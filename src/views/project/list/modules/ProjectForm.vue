<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px" class="space-y-4">
      <ElFormItem label="项目名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入项目名称" />
      </ElFormItem>

      <ElFormItem label="项目描述" prop="description">
        <ElInput
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入项目描述"
        />
      </ElFormItem>

      <ElFormItem label="项目状态" prop="status">
        <ElSelect v-model="formData.status" placeholder="请选择项目状态">
          <ElOption label="未开始" value="pending" />
          <ElOption label="进行中" value="in_progress" />
          <ElOption label="已完成" value="completed" />
          <ElOption label="已暂停" value="on_hold" />
          <ElOption label="已取消" value="cancelled" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="项目优先级" prop="priority">
        <ElSelect v-model="formData.priority" placeholder="请选择项目优先级">
          <ElOption label="高" value="high" />
          <ElOption label="中" value="medium" />
          <ElOption label="低" value="low" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="项目经理" prop="manager">
        <ElInput v-model="formData.manager" placeholder="请输入项目经理" />
      </ElFormItem>

      <ElFormItem label="开始日期" prop="start_date">
        <ElDatePicker
          v-model="formData.start_date"
          type="date"
          placeholder="请选择开始日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </ElFormItem>

      <ElFormItem label="结束日期" prop="end_date">
        <ElDatePicker
          v-model="formData.end_date"
          type="date"
          placeholder="请选择结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </ElFormItem>

      <ElFormItem label="项目预算" prop="budget">
        <ElInputNumber
          v-model="formData.budget"
          :min="0"
          :step="1000"
          :precision="0"
          placeholder="请输入项目预算"
          style="width: 100%"
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit" :loading="loading">
        {{ isEdit ? '保存' : '创建' }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'

  import type { FormInstance, FormRules } from 'element-plus'
  import type { ProjectItem } from '@/types/api/project'

  defineOptions({ name: 'ProjectForm' })

  interface Props {
    visible: boolean
    projectData?: ProjectItem
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    projectData: undefined
  })

  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: ProjectItem): void
  }>()

  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })
  const isEdit = computed(() => !!props.projectData?.id)
  const dialogTitle = computed(() => (isEdit.value ? '编辑项目' : '创建项目'))

  const formData = ref<ProjectItem>({
    id: 0,
    name: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    progress: 0,
    manager: '',
    start_date: '',
    end_date: '',
    budget: 0,
    actual_cost: 0,
    created_at: ''
  })

  const rules = computed<FormRules>(() => ({
    name: [
      { required: true, message: '请输入项目名称', trigger: 'blur' },
      { min: 2, max: 50, message: '项目名称长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    description: [
      { required: true, message: '请输入项目描述', trigger: 'blur' },
      { min: 5, max: 200, message: '项目描述长度在 5 到 200 个字符', trigger: 'blur' }
    ],
    status: [{ required: true, message: '请选择项目状态', trigger: 'change' }],
    priority: [{ required: true, message: '请选择项目优先级', trigger: 'change' }],
    manager: [{ required: true, message: '请输入项目经理', trigger: 'blur' }],
    start_date: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
    end_date: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
    budget: [
      { required: true, message: '请输入项目预算', trigger: 'blur' },
      { type: 'number', min: 0, message: '项目预算必须大于等于 0', trigger: 'blur' }
    ]
  }))

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        if (props.projectData?.id) {
          // 编辑模式，复制数据并转换类型
          formData.value = {
            ...props.projectData,
            // 将字符串类型的数值转换为数字类型
            budget:
              typeof props.projectData.budget === 'string'
                ? parseFloat(props.projectData.budget)
                : props.projectData.budget,
            actual_cost:
              typeof props.projectData.actual_cost === 'string'
                ? parseFloat(props.projectData.actual_cost)
                : props.projectData.actual_cost,
            progress:
              typeof props.projectData.progress === 'string'
                ? parseInt(props.projectData.progress)
                : props.projectData.progress,
            id:
              typeof props.projectData.id === 'string'
                ? parseInt(props.projectData.id)
                : props.projectData.id
          }
        } else {
          // 新建模式，重置表单
          resetForm()
        }
        // 等待 DOM 更新后验证
        setTimeout(() => {
          formRef.value?.clearValidate()
        }, 100)
      }
    }
  )

  const resetForm = () => {
    formData.value = {
      id: 0,
      name: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      progress: 0,
      manager: '',
      start_date: '',
      end_date: '',
      budget: 0,
      actual_cost: 0,
      created_at: ''
    }
    formRef.value?.clearValidate()
  }

  const handleClose = () => {
    emit('update:visible', false)
  }

  const handleSubmit = async () => {
    try {
      await formRef.value?.validate()

      loading.value = true

      const submitData = { ...formData.value }

      emit('submit', submitData)
      handleClose()
    } catch (error) {
      console.error('表单验证失败:', error)
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped lang="scss">
  .space-y-4 {
    & > * {
      margin-bottom: 16px;
    }
  }
</style>
