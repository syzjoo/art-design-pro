<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    title="选择项目模板"
    width="800px"
    center
  >
    <div v-if="isLoading" class="text-center py-5">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span class="ml-2">加载模板中...</span>
    </div>
    <div v-else-if="filteredTemplates.length === 0" class="text-center py-5">
      <el-empty description="暂无可用模板" />
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <el-card
        v-for="template in filteredTemplates"
        :key="template.id"
        class="cursor-pointer hover:shadow-lg transition-shadow"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-bold">{{ template.name }}</span>
            <el-tag size="small">{{ getTemplateTypeLabel(template.type) }}</el-tag>
          </div>
        </template>
        <div class="mb-2">{{ template.description }}</div>
        <div class="text-sm text-gray-500 mb-4">
          <span>创建时间：{{ template.createTime }}</span>
        </div>
        <div class="text-right">
          <el-button
            type="primary"
            size="small"
            @click="selectTemplate(template.id)"
            :loading="isSubmitting"
          >
            选择此模板
          </el-button>
        </div>
      </el-card>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { Loading } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import { useItemStore } from '@/store/modules/item'

  // Props
  interface Props {
    modelValue: boolean
    projectType?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    projectType: ''
  })

  // Emits
  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'template-selected': [templateId: number]
  }>()

  // Store
  const projectStore = useItemStore()

  // States
  const isLoading = ref(false)
  const isSubmitting = ref(false)

  // Computed
  const filteredTemplates = computed(() => {
    if (!props.projectType) {
      return projectStore.templateList
    }
    return projectStore.templateList.filter((template) => template.type === props.projectType)
  })

  // Methods
  const getTemplateTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      dev: '前端开发',
      checkin: '自律打卡',
      write: '写作创作',
      video: '视频创作',
      design: '设计创作',
      learning: '学习培训'
    }
    return typeMap[type] || type
  }

  const selectTemplate = async (templateId: number) => {
    try {
      isSubmitting.value = true
      emit('template-selected', templateId)
      emit('update:modelValue', false)
      ElMessage.success('模板选择成功')
    } catch {
      ElMessage.error('模板选择失败')
    } finally {
      isSubmitting.value = false
    }
  }

  const close = () => {
    emit('update:modelValue', false)
  }

  // Lifecycle
  onMounted(async () => {
    if (props.modelValue && projectStore.templateList.length === 0) {
      isLoading.value = true
      try {
        await projectStore.getTemplateList()
      } finally {
        isLoading.value = false
      }
    }
  })
</script>
