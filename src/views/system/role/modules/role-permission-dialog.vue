<template>
  <ElDialog
    v-model="visible"
    title="菜单权限"
    width="520px"
    align-center
    class="el-dialog-border"
    @close="handleClose"
  >
    <ElScrollbar height="70vh">
      <ElTree
        ref="treeRef"
        :data="processedMenuList"
        show-checkbox
        node-key="name"
        :default-expand-all="isExpandAll"
        :default-checked-keys="[]"
        :props="defaultProps"
        @check="handleTreeCheck"
      >
        <template #default="{ data }">
          <div style="display: flex; align-items: center">
            <span v-if="data.isAuth">
              {{ data.label }}
            </span>
            <span v-else>{{ defaultProps.label(data) }}</span>
          </div>
        </template>
      </ElTree>
    </ElScrollbar>
    <template #footer>
      <ElButton @click="outputSelectedData" style="margin-left: 8px">获取选中数据</ElButton>

      <ElButton @click="toggleExpandAll">{{ isExpandAll ? '全部收起' : '全部展开' }}</ElButton>
      <ElButton @click="toggleSelectAll" style="margin-left: 8px">{{
        isSelectAll ? '取消全选' : '全部选择'
      }}</ElButton>
      <ElButton type="primary" ref="saveButtonRef" :loading="isSaving" @click="savePermission"
        >保存</ElButton
      >
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { useMenuStore } from '@/store/modules/menu'
  import { storeToRefs } from 'pinia'
  import { formatMenuTitle } from '@/utils/router'
  import { fetchGetRoleMenusPermissions, fetchSaveRolePermission } from '@/api/system-manage'
  import { ElMessage } from 'element-plus'
  import { ref, computed, watch } from 'vue'
  import type { TreeInstance, ElButton } from 'element-plus'

  type RoleListItem = Api.SystemManage.RoleListItem

  interface Props {
    modelValue: boolean
    roleData?: RoleListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    roleData: undefined
  })

  const emit = defineEmits<Emits>()

  const { menuList } = storeToRefs(useMenuStore())
  // 使用更精确的类型定义
  const treeRef = ref<TreeInstance>()
  const saveButtonRef = ref<InstanceType<typeof ElButton>>()
  const isExpandAll = ref(true)
  const isSelectAll = ref(false)
  // 添加保存状态标识
  const isSaving = ref(false)

  /**
   * 弹窗显示状态双向绑定
   */
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  /**
   * 菜单节点类型
   */
  interface MenuNode {
    id?: string | number
    name?: string
    label?: string
    meta?: {
      title?: string
      authList?: Array<{
        authMark: string
        title: string
        checked?: boolean
      }>
    }
    children?: MenuNode[]
    isAuth?: boolean
    authMark?: string
    checked?: boolean
    indeterminate?: boolean
    [key: string]: any
  }

  /**
   * 处理菜单数据，将 authList 转换为树形子节点
   * 递归处理菜单树，将权限列表展开为可选择的子节点
   */
  const processedMenuList = computed(() => {
    const processNode = (node: MenuNode): MenuNode => {
      const processed = { ...node }

      // 如果有 authList，将其转换为子节点
      if (node.meta?.authList?.length) {
        const authNodes = node.meta.authList.map((auth) => ({
          id: `${node.id}_${auth.authMark}`,
          name: `${node.name}_${auth.authMark}`,
          label: auth.title,
          authMark: auth.authMark,
          isAuth: true,
          checked: auth.checked || false
        }))

        processed.children = processed.children ? [...processed.children, ...authNodes] : authNodes
      }

      // 递归处理子节点
      if (processed.children) {
        processed.children = processed.children.map(processNode)
      }

      return processed
    }

    // 添加空值检查
    return (menuList.value as MenuNode[])?.map(processNode) || []
  })

  /**
   * 树形组件配置
   */
  const defaultProps = {
    children: 'children',
    label: (data: any) => formatMenuTitle(data.meta?.title) || data.label || ''
  }

  /**
   * 监听弹窗打开，初始化权限数据
   */
  watch(
    () => props.modelValue,
    async (newVal) => {
      if (newVal && props.roleData) {
        await loadRolePermissions()
      }
    },
    { immediate: true }
  )

  /**
   * 加载角色权限数据
   */
  const loadRolePermissions = async () => {
    if (!props.roleData) {
      ElMessage.warning('角色数据不存在，无法加载权限')
      return
    }

    try {
      const roleId = Number(props.roleData.roleId)
      if (isNaN(roleId)) {
        throw new Error('无效的角色ID')
      }

      // 调用API获取角色权限数据
      const response = await fetchGetRoleMenusPermissions(roleId)

      // 类型断言确保数据格式正确
      const permissionData = response

      // 设置选中状态
      if (treeRef.value && permissionData) {
        const { checkedKeys = [], halfCheckedKeys = [] } = permissionData

        // 先清空现有选择
        treeRef.value.setCheckedKeys([])
        // 将获取到的权限数据设置为树形组件的选中状态
        treeRef.value.setCheckedKeys(checkedKeys, false)

        // 正确处理半选状态
        if (halfCheckedKeys.length > 0) {
          halfCheckedKeys.forEach((key) => {
            const node = treeRef.value!.getNode(key)
            if (node && !node.checked) {
              node.indeterminate = true
            }
          })
        }

        // 验证全选状态
        const allKeys = getAllNodeKeys(processedMenuList.value)
        isSelectAll.value = checkedKeys.length === allKeys.length && allKeys.length > 0
      }
    } catch (error) {
      console.error('加载角色权限失败:', error)
      ElMessage.error(error instanceof Error ? error.message : '加载权限数据失败')
    }
  }

  /**
   * 关闭弹窗并清空选中状态
   */
  const handleClose = () => {
    visible.value = false
    // 使用setTimeout确保DOM更新后再清空，避免潜在的渲染问题
    setTimeout(() => {
      treeRef.value?.setCheckedKeys([])
      isSelectAll.value = false
    }, 0)
  }

  /**
   * 保存权限配置
   */
  const savePermission = async () => {
    if (!treeRef.value || !props.roleData) {
      ElMessage.warning('参数不完整，无法保存权限')
      return
    }

    try {
      // 设置保存状态，Element Plus按钮支持loading属性
      isSaving.value = true

      // 获取选中的权限数据
      const checkedKeys = treeRef.value.getCheckedKeys()
      const halfCheckedKeys = treeRef.value.getHalfCheckedKeys()

      // 过滤掉无效的key
      const validCheckedKeys = checkedKeys.filter(
        (key): key is string => typeof key === 'string' && key.length > 0
      )
      const validHalfCheckedKeys = halfCheckedKeys.filter(
        (key): key is string => typeof key === 'string' && key.length > 0
      )

      // 构建保存数据格式
      const permissionData = {
        roleId: Number(props.roleData.roleId),
        checkedKeys: validCheckedKeys,
        halfCheckedKeys: validHalfCheckedKeys
      }

      console.log('准备保存的权限数据:', permissionData)

      // 调用保存权限接口
      await fetchSaveRolePermission(permissionData)

      ElMessage.success('权限保存成功')
      emit('success')
      handleClose()
    } catch (error) {
      console.error('保存权限失败:', error)
      ElMessage.error(error instanceof Error ? error.message : '保存权限失败，请稍后重试')
    } finally {
      // 恢复按钮状态
      isSaving.value = false
    }
  }

  /**
   * 切换全部展开/收起状态
   */
  const toggleExpandAll = () => {
    const tree = treeRef.value
    if (!tree) return

    const nodes = tree.store.nodesMap
    // 这里保留 any，因为 Element Plus 的内部节点类型较复杂
    Object.values(nodes).forEach((node: any) => {
      node.expanded = !isExpandAll.value
    })

    isExpandAll.value = !isExpandAll.value
  }

  /**
   * 切换全选/取消全选状态
   */
  const toggleSelectAll = () => {
    if (!treeRef.value) return

    if (!isSelectAll.value) {
      const allKeys = getAllNodeKeys(processedMenuList.value)
      treeRef.value.setCheckedKeys(allKeys)
    } else {
      treeRef.value.setCheckedKeys([])
    }

    isSelectAll.value = !isSelectAll.value
  }

  /**
   * 递归获取所有节点的 key
   * @param nodes 节点列表
   * @returns 所有节点的 key 数组
   */
  const getAllNodeKeys = (nodes: MenuNode[]): string[] => {
    const keys: string[] = []
    const traverse = (nodeList: MenuNode[]): void => {
      nodeList.forEach((node) => {
        if (node.name) keys.push(node.name)
        if (node.children?.length) traverse(node.children)
      })
    }
    traverse(nodes)
    return keys
  }

  /**
   * 处理树节点选中状态变化
   * 同步更新全选按钮状态
   */
  const handleTreeCheck = () => {
    if (!treeRef.value) return

    const checkedKeys = treeRef.value.getCheckedKeys()
    const allKeys = getAllNodeKeys(processedMenuList.value)

    isSelectAll.value = checkedKeys.length === allKeys.length && allKeys.length > 0
  }

  /**
   * 输出选中的权限数据到控制台
   * 用于调试和查看当前选中的权限配置
   */
  const outputSelectedData = () => {
    if (!treeRef.value) return

    const selectedData = {
      checkedKeys: treeRef.value.getCheckedKeys(),
      halfCheckedKeys: treeRef.value.getHalfCheckedKeys(),
      checkedNodes: treeRef.value.getCheckedNodes(),
      halfCheckedNodes: treeRef.value.getHalfCheckedNodes(),
      totalChecked: treeRef.value.getCheckedKeys().length,
      totalHalfChecked: treeRef.value.getHalfCheckedKeys().length
    }

    console.log('=== 选中的权限数据 ===', selectedData)
    ElMessage.success(`已输出选中数据到控制台，共选中 ${selectedData.totalChecked} 个节点`)
  }
</script>
