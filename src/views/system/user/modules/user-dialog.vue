<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
    width="30%"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="用户名" prop="userName">
        <ElInput v-model="formData.userName" placeholder="请输入用户名" />
      </ElFormItem>
      <ElFormItem label="手机号" prop="userPhone">
        <ElInput v-model="formData.userPhone" placeholder="请输入手机号" />
      </ElFormItem>
      <ElFormItem label="邮箱" prop="userEmail">
        <ElInput v-model="formData.userEmail" placeholder="请输入邮箱" />
      </ElFormItem>
      <ElFormItem label="性别" prop="userGender">
        <ElSelect v-model="formData.userGender">
          <ElOption label="男" value="1" />
          <ElOption label="女" value="2" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="角色" prop="userRoles">
        <ElSelect v-model="formData.userRoles" multiple placeholder="请选择角色">
          <ElOption
            v-for="role in roleList"
            :key="role.roleCode"
            :value="role.roleCode"
            :label="role.roleName"
          />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="isSubmitting">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch, nextTick } from 'vue'

  import { fetchGetRoleList } from '@/api/system-manage'
  import type { FormInstance, FormRules } from 'element-plus'

  interface Props {
    visible: boolean
    type: string
    userData?: Partial<Api.SystemManage.UserListItem>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: any): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 加载状态
  const isSubmitting = ref(false)
  const isLoadingRoles = ref(false)

  // 角色列表数据 - 定义明确的类型
  interface RoleItem {
    roleName: string
    roleCode: string
    des?: string
    date?: string
    enable?: boolean
  }

  const roleList = ref<RoleItem[]>([])

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive({
    userName: '',
    userPhone: '',
    userEmail: '',
    userGender: '男',
    userRoles: [] as string[]
  })

  // 表单验证规则
  const rules: FormRules = {
    userName: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    userPhone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    userEmail: [
      { required: false, message: '请输入邮箱', trigger: 'blur' },
      {
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        message: '请输入正确的邮箱格式',
        trigger: 'blur'
      }
    ],
    userGender: [{ required: true, message: '请选择性别', trigger: 'blur' }],
    userRoles: [{ required: false, message: '请选择角色', trigger: 'blur' }]
  }

  /**
   * 加载角色列表
   */
  const loadRoleList = async () => {
    try {
      isLoadingRoles.value = true
      const response = await fetchGetRoleList()
      if (response && response.records) {
        // 确保类型兼容
        roleList.value = response.records as RoleItem[]
      }
    } catch (error) {
      console.error('获取角色列表失败:', error)
      // 保留默认的角色列表，避免因API失败无法选择角色
    } finally {
      isLoadingRoles.value = false
    }
  }

  /**
   * 初始化表单数据
   * 根据对话框类型（新增/编辑）填充表单
   */
  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.userData
    const row = props.userData

    Object.assign(formData, {
      userName: isEdit && row ? row.userName || '' : '',
      userPhone: isEdit && row ? row.userPhone || '' : '',
      userEmail: isEdit && row ? row.userEmail || '' : '',
      userGender:
        isEdit && row && row.userGender !== undefined
          ? // 直接使用数字字符串，与后端保持一致
            String(row.userGender)
          : '1', // 默认选择男
      userRoles:
        isEdit && row && Array.isArray(row.userRoles)
          ? // 将角色名称转换为角色代码
            row.userRoles.map((roleName) => {
              const matchedRole = roleList.value.find((role) => role.roleName === roleName)
              return matchedRole ? matchedRole.roleCode : roleName
            })
          : []
    })
  }

  /**
   * 监听对话框状态变化
   * 当对话框打开时初始化表单数据并清除验证状态
   */
  watch(
    () => [props.visible, props.type, props.userData],
    ([visible]) => {
      if (visible) {
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  /**
   * 提交表单
   * 验证通过后触发提交事件并传递表单数据
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      isSubmitting.value = true
      await formRef.value.validate()

      // 验证通过，传递表单数据给父组件处理
      // 添加参数名映射，确保与后端参数一致
      const submitData = {
        username: formData.userName,
        phone: formData.userPhone,
        email: formData.userEmail,
        gender: formData.userGender, // 已经是字符串'1'或'2'，与后端保持一致
        role: formData.userRoles
      }

      emit('submit', submitData)

      // 不在这里显示消息，由父组件通过API统一处理
      // 关闭对话框的操作也由父组件完成，确保API调用成功后再关闭
    } catch (error) {
      console.error('表单验证失败:', error)
      // 验证失败时不需要特殊处理，element-plus会自动显示错误信息
    } finally {
      isSubmitting.value = false
    }
  }

  // 组件挂载时加载角色列表
  loadRoleList()
</script>
