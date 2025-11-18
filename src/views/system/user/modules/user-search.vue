<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  >
  </ArtSearchBar>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'

  // 使用API接口定义的类型
  type UserSearchParams = Api.SystemManage.UserSearchParams

  interface Props {
    modelValue: UserSearchParams
  }

  interface Emits {
    (e: 'update:modelValue', value: UserSearchParams): void
    (e: 'search', params: UserSearchParams): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 表单数据双向绑定
  const searchBarRef = ref()
  const formData = computed<Record<string, any>>({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val as UserSearchParams)
  })

  // 校验规则
  const rules = {
    userPhone: [
      {
        pattern: /^1[3-9]\d{9}$/,
        message: '请输入正确的手机号格式',
        trigger: 'blur',
        validator: (rule: any, value: string, callback: (error?: Error) => void) => {
          // 如果手机号为空或格式正确，则通过验证
          if (!value || /^1[3-9]\d{9}$/.test(value)) {
            callback()
          } else {
            callback(new Error('请输入正确的手机号格式'))
          }
        }
      }
    ],
    userEmail: [
      {
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        message: '请输入正确的邮箱格式',
        trigger: 'blur',
        validator: (rule: any, value: string, callback: (error?: Error) => void) => {
          // 如果邮箱为空或格式正确，则通过验证
          if (!value || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
            callback()
          } else {
            callback(new Error('请输入正确的邮箱格式'))
          }
        }
      }
    ]
  }

  // 动态 options
  const statusOptions = ref<{ label: string; value: string | number; disabled?: boolean }[]>([])

  // 获取状态选项数据
  function fetchStatusOptions(): Promise<typeof statusOptions.value> {
    // 这里可以替换为实际的API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { label: '在线', value: '1' },
          { label: '离线', value: '2' },
          { label: '异常', value: '3' },
          { label: '注销', value: '4' }
        ])
      }, 300)
    })
  }

  /**
   * 处理搜索参数，过滤空值和无效值
   * 确保只发送有效的搜索参数到后端
   */
  const processSearchParams = (params: Record<string, any>): UserSearchParams => {
    const processedParams: UserSearchParams = {}

    // 只保留有值的字段，确保字段名与API接口一致
    if (params.userName?.trim()) {
      processedParams.userName = params.userName.trim()
    }
    if (params.userPhone?.trim()) {
      processedParams.userPhone = params.userPhone.trim()
    }
    if (params.userEmail?.trim()) {
      processedParams.userEmail = params.userEmail.trim()
    }
    if (params.status !== undefined && params.status !== null && params.status !== '') {
      processedParams.status = params.status
    }
    if (params.userGender !== undefined && params.userGender !== null && params.userGender !== '') {
      // 保持性别值为数字字符串，与后端保持一致
      processedParams.userGender = params.userGender // 直接传递原始值 '1' 或 '2'
    }

    return processedParams
  }

  onMounted(async () => {
    try {
      statusOptions.value = await fetchStatusOptions()
    } catch (error) {
      console.error('获取状态选项失败:', error)
      // 如果获取失败，提供默认选项
      statusOptions.value = [
        { label: '启用', value: '1' },
        { label: '禁用', value: '0' }
      ]
    }
  })

  // 表单配置
  const formItems = computed(() => [
    {
      label: '用户名',
      key: 'userName',
      type: 'input',
      placeholder: '请输入用户名',
      clearable: true,
      props: { maxlength: 50 }
    },
    {
      label: '手机号',
      key: 'userPhone',
      type: 'input',
      props: {
        placeholder: '请输入手机号',
        maxlength: 11,
        clearable: true
      }
    },
    {
      label: '邮箱',
      key: 'userEmail',
      type: 'input',
      props: {
        placeholder: '请输入邮箱',
        maxlength: 100,
        clearable: true
      }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        options: statusOptions.value,
        clearable: true
      }
    },
    {
      label: '性别',
      key: 'userGender',
      type: 'radiogroup',
      props: {
        options: [
          { label: '男', value: '1' },
          { label: '女', value: '2' }
        ]
      }
    }
  ])

  // 重置处理
  function handleReset() {
    console.log('重置表单')
    // 确保重置时提供一个空对象
    emit('update:modelValue', {})
    emit('reset')
  }

  // 搜索处理
  async function handleSearch() {
    try {
      // 验证表单
      if (searchBarRef.value) {
        await searchBarRef.value.validate()
      }

      // 处理搜索参数
      const processedParams = processSearchParams(formData.value)

      // 触发搜索事件，传递处理后的参数
      emit('search', processedParams)
      console.log('搜索参数:', processedParams)
    } catch (error) {
      console.error('搜索验证失败:', error)
      // 验证失败时不触发搜索
    }
  }
</script>
