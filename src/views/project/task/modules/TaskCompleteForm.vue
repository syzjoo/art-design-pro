<!-- 任务完成表单组件 -->
<template>
  <ElDialog v-model="dialogVisible" title="完成任务" width="800px" :close-on-click-modal="false">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px" class="mt-2">
      <ElFormItem label="成果表述" prop="achievement">
        <ArtWangEditor
          v-model="formData.achievement"
          :height="'300px'"
          placeholder="请详细描述任务完成情况..."
        />
      </ElFormItem>

      <ElFormItem label="成果附件">
        <ElUpload
          v-model:file-list="fileList"
          class="upload-demo"
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          multiple
          :limit="5"
          :on-exceed="handleExceed"
        >
          <el-button type="primary">
            <el-icon><Upload /></el-icon>
            点击上传
          </el-button>
          <template #tip>
            <div class="el-upload__tip"> 支持上传最多5个文件，单个文件不超过20MB </div>
          </template>
        </ElUpload>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确认完成</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { ElMessage, type FormInstance } from 'element-plus'
  import { Upload } from '@element-plus/icons-vue'
  import ArtWangEditor from '@/components/core/forms/art-wang-editor/index.vue'

  defineOptions({ name: 'TaskCompleteForm' })

  interface Props {
    visible: boolean
    taskId: number
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    taskId: 0
  })

  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: { taskId: number; achievement: string; attachments: any[] }): void
  }>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  interface FormData {
    achievement: string
  }

  const formRef = ref<FormInstance>()
  const fileList = ref<any[]>([])

  const formData = ref<FormData>({
    achievement: ''
  })

  const rules = {
    achievement: [{ required: true, message: '请输入成果表述', trigger: 'blur' }]
  }

  const handleFileChange = (file: any, fileList: any[]) => {
    console.log('文件变化:', file, fileList)
  }

  const handleFileRemove = (file: any, fileList: any[]) => {
    console.log('文件移除:', file, fileList)
  }

  const handleExceed = () => {
    ElMessage.warning('最多只能上传5个文件')
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()

      const submitData = {
        taskId: props.taskId,
        achievement: formData.value.achievement,
        attachments: fileList.value
      }

      emit('submit', submitData)
      dialogVisible.value = false
      ElMessage.success('任务完成提交成功')
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
