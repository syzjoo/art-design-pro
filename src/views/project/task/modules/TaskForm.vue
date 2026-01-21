<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px" class="space-y-4">
      <ElFormItem label="任务名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入任务名称" />
      </ElFormItem>

      <ElFormItem label="任务描述" prop="description">
        <ElInput
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入任务描述"
        />
      </ElFormItem>

      <ElFormItem label="所属项目" prop="project_id">
        <ElSelect v-model="formData.project_id" placeholder="请选择项目">
          <ElOption
            v-for="project in projectList"
            :key="project.id"
            :label="project.name"
            :value="project.id"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="任务状态" prop="status">
        <ElSelect v-model="formData.status" placeholder="请选择任务状态">
          <ElOption label="待办" value="todo" />
          <ElOption label="进行中" value="in_progress" />
          <ElOption label="审核中" value="review" />
          <ElOption label="已完成" value="completed" />
          <ElOption label="已取消" value="cancelled" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="优先级" prop="priority">
        <ElSelect v-model="formData.priority" placeholder="请选择优先级">
          <ElOption label="紧急" value="urgent" />
          <ElOption label="高" value="high" />
          <ElOption label="中" value="medium" />
          <ElOption label="低" value="low" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="负责人" prop="assignee">
        <ElInput v-model="formData.assignee" placeholder="请输入负责人" />
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

      <ElFormItem label="截止日期" prop="end_date">
        <ElDatePicker
          v-model="formData.end_date"
          type="date"
          placeholder="请选择截止日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </ElFormItem>

      <ElFormItem label="任务进度" prop="progress">
        <ElSlider v-model="formData.progress" :min="0" :max="100" :step="5" show-input />
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
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { TaskItem } from '@/types/api/project'

  defineOptions({ name: 'TaskForm' })

  interface ProjectItem {
    id: number
    name: string
  }

  interface Props {
    visible: boolean
    taskData?: TaskItem
    projectList: ProjectItem[]
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    taskData: undefined,
    projectList: () => []
  })

  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: TaskItem): void
  }>()

  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })
  const isEdit = computed(() => !!props.taskData?.id)
  const dialogTitle = computed(() => (isEdit.value ? '编辑任务' : '创建任务'))

  const formData = ref<TaskItem>({
    name: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    progress: 0,
    assignee: '',
    project_id: 0,
    project_name: '',
    start_date: '',
    end_date: ''
  })

  const rules = computed<FormRules>(() => ({
    name: [
      { required: true, message: '请输入任务名称', trigger: 'blur' },
      { min: 2, max: 50, message: '任务名称长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    description: [
      { required: true, message: '请输入任务描述', trigger: 'blur' },
      { min: 5, max: 200, message: '任务描述长度在 5 到 200 个字符', trigger: 'blur' }
    ],
    project_id: [{ required: true, message: '请选择所属项目', trigger: 'change' }],
    status: [{ required: true, message: '请选择任务状态', trigger: 'change' }],
    priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
    assignee: [{ required: true, message: '请选择负责人', trigger: 'change' }],
    start_date: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
    end_date: [{ required: true, message: '请选择截止日期', trigger: 'change' }],
    progress: [
      { required: true, message: '请输入任务进度', trigger: 'blur' },
      { type: 'number', min: 0, max: 100, message: '任务进度必须在 0 到 100 之间', trigger: 'blur' }
    ]
  }))

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        if (props.taskData?.id) {
          formData.value = { ...props.taskData }
        } else {
          resetForm()
        }
        setTimeout(() => {
          formRef.value?.clearValidate()
        }, 100)
      }
    }
  )

  const resetForm = () => {
    formData.value = {
      name: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      progress: 0,
      assignee: '',
      project_id: 0,
      project_name: '',
      start_date: '',
      end_date: ''
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
      const project = props.projectList.find((p) => p.id === submitData.project_id)
      if (project) {
        submitData.project_name = project.name
      }

      if (isEdit.value) {
        emit('submit', submitData)
        ElMessage.success('任务更新成功')
      } else {
        submitData.id = Date.now()
        submitData.created_at = new Date().toISOString().split('T')[0]
        emit('submit', submitData)
        ElMessage.success('任务创建成功')
      }

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
