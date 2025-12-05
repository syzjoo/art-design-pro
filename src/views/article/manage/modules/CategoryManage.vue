<!-- 文章分类管理子组件 -->
<template>
  <div class="category-manage">
    <!-- 页面标题和操作区 -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-medium">分类管理</h2>
      <div class="flex gap-2">
        <el-button @click="toggleExpand">
          <el-icon>
            <ArrowDown />
          </el-icon>
          展开/收起
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon>
            <Plus />
          </el-icon>
          添加分类
        </el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="flex gap-4 mb-6">
      <el-input
        v-model="searchForm.name"
        placeholder="搜索分类名称"
        :prefix-icon="Search"
        class="flex-1"
        @keyup.enter="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <!-- 分类列表 - 使用ArtTable组件 -->
    <div class="bg-white rounded-lg shadow-sm" style="padding: 10px">
      <ArtTable
        ref="tableRef"
        rowKey="id"
        :loading="loading"
        :columns="columns"
        :data="tableData"
        :stripe="false"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="false"
        :pagination="pagination"
        @pagination:size-change="(val) => handlePageChange(val, 'size')"
        @pagination:current-change="(val) => handlePageChange(val, 'current')"
      />
    </div>

    <!-- 添加/编辑分类对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="isEditMode ? '编辑分类' : '添加分类'"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        :model="formData"
        :rules="rules"
        ref="formRef"
        label-width="100px"
        label-position="right"
        style="max-width: 450px; margin: 0 auto"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" style="width: 100%" />
        </el-form-item>
        <el-form-item label="分类排序" prop="sortOrder">
          <el-input-number
            v-model="formData.sortOrder"
            :min="0"
            :max="999"
            placeholder="请输入排序号"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input
            v-model="formData.description"
            placeholder="请输入分类描述"
            type="textarea"
            :rows="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="'enabled'">启用</el-radio>
            <el-radio :label="'disabled'">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, h } from 'vue'
  import { Search, Plus, ArrowDown } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox, ElForm, FormInstance } from 'element-plus'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { categoryApi } from '@/api/article'

  // 定义事件
  const emit = defineEmits(['refresh'])

  // 导入类型
  import type { Category } from '@/types/api/article'

  // 响应式数据
  const searchForm = reactive({
    name: ''
  })
  const showDialog = ref(false)
  const isEditMode = ref(false)
  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const tableRef = ref()
  // 展开/收起状态管理
  const isAllExpanded = ref(false)

  // 表单数据
  const formData = reactive({
    id: 0,
    name: '',
    parentId: 0,
    description: '',
    status: 'enabled',
    sortOrder: 0,
    createdAt: '',
    updatedAt: ''
  })

  // 表格数据和分页
  const tableData = ref<Category[]>([])
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 表单验证规则
  const rules = {
    name: [
      { required: true, message: '请输入分类名称', trigger: 'blur' },
      { min: 1, max: 20, message: '分类名称长度在 1 到 20 个字符', trigger: 'blur' }
    ],
    sortOrder: [
      { required: true, message: '请输入排序号', trigger: 'blur' },
      {
        type: 'number' as const,
        min: 0,
        max: 999,
        message: '排序号必须在 0-999 之间',
        trigger: 'blur'
      }
    ],
    description: [{ max: 200, message: '分类描述长度不能超过 200 个字符', trigger: 'blur' }]
  }

  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleString('zh-CN')
  }

  // 真实API获取所有分类（支持分页和搜索）
  const fetchAllCategories = async (page?: number, pageSize?: number) => {
    try {
      const response = await categoryApi.getCategoryList({
        keyword: searchForm.name,
        page,
        pageSize
      })
      // 注意：HTTP工具已经自动提取了BaseResponse的data字段
      // 直接使用后端返回的数据结构
      return {
        list: response.list || [],
        total: response.total || 0,
        page: response.page || 1,
        pageSize: response.pageSize || 10
      }
    } catch (error) {
      console.error('获取分类列表失败:', error)
      ElMessage.error('获取分类列表失败')
      return {
        list: [],
        total: 0,
        page: 1,
        pageSize: 10
      }
    }
  }

  // 将扁平数据转换为树形结构
  const convertToTree = (categories: Category[]): Category[] => {
    const categoryMap = new Map<number, Category>()
    const rootCategories: Category[] = []

    // 首先将所有分类放入Map中
    categories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [], hasChildren: false })
    })

    // 然后构建树形结构
    categories.forEach((category) => {
      const currentCategory = categoryMap.get(category.id) as Category
      // 后端返回顶级分类的parentId为null
      if (category.parentId === null || category.parentId === 0) {
        // 顶级分类
        rootCategories.push(currentCategory)
      } else {
        // 子分类，添加到父分类的children数组中
        const parentId = category.parentId || 0
        const parentCategory = categoryMap.get(parentId)
        if (parentCategory) {
          if (!parentCategory.children) {
            parentCategory.children = []
          }
          parentCategory.children.push(currentCategory)
          parentCategory.hasChildren = true
        }
      }
    })

    return rootCategories
  }

  // 表格列配置
  const { columns } = useTableColumns(() => [
    {
      prop: 'name',
      label: '分类名称',
      width: 220
    },
    {
      prop: 'description',
      label: '分类描述',
      minWidth: 250
    },
    {
      prop: 'sortOrder',
      label: '排序号',
      width: 100,
      align: 'center',
      formatter: (row: Category) => {
        return (row.sortOrder || 0).toString()
      }
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      align: 'center',
      formatter: (row: Category) => {
        const statusValue = row.status || 'disabled'
        return h(
          'el-tag',
          {
            type: statusValue === 'enabled' ? 'success' : 'danger',
            size: 'small'
          },
          statusValue === 'enabled' ? '启用' : '禁用'
        )
      }
    },
    {
      prop: 'articleCount',
      label: '文章数量',
      width: 120,
      align: 'center',
      formatter: (row: Category) => {
        return (row.articleCount || 0).toString()
      }
    },
    {
      prop: 'createTime',
      label: '创建时间',
      minWidth: 200,
      formatter: (row: Category) => {
        return h('p', {}, formatDate(row.createTime || ''))
      }
    },
    {
      prop: 'updateTime',
      label: '更新时间',
      minWidth: 200,
      formatter: (row: Category) => {
        return h('p', {}, formatDate(row.updateTime || ''))
      }
    },
    {
      prop: 'operation',
      label: '操作',
      width: 180,
      align: 'right',
      formatter: (row: Category) => {
        const buttonStyle = { style: 'text-align: right' }

        return h('div', buttonStyle, [
          h(ArtButtonTable, {
            type: 'add',
            onClick: () => handleAddSubCategory(row)
          }),
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => handleEdit(row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => handleDelete(row)
          })
        ])
      }
    }
  ])

  // 真实API获取分类列表
  const fetchCategoryList = async () => {
    try {
      // 获取当前分页参数
      const { current, size } = pagination
      // 调用API获取分类列表
      const result = await fetchAllCategories(current, size)
      // 转换为树形结构
      const treeData = convertToTree(result.list)

      // 更新分页总数
      pagination.total = result.total

      return {
        items: treeData,
        total: result.total
      }
    } catch (error) {
      console.error('获取分类列表失败:', error)
      ElMessage.error('获取分类列表失败')
      return {
        items: [],
        total: 0
      }
    }
  }

  // 刷新数据方法
  const refreshData = async () => {
    loading.value = true
    try {
      const result = await fetchCategoryList()
      tableData.value = result.items

      // 触发父组件的刷新事件
      emit('refresh')
    } catch (error) {
      console.error('获取分类列表失败:', error)
      ElMessage.error('获取分类列表失败')
    } finally {
      loading.value = false
    }
  }

  // 分页变化处理
  const handlePageChange = (val: number, type?: 'size' | 'current') => {
    if (type === 'size') {
      // 处理每页显示条数变化
      pagination.size = val
      pagination.current = 1 // 重置到第一页
    } else {
      // 处理当前页码变化
      pagination.current = val
    }
    refreshData()
  }

  // 搜索处理
  const handleSearch = () => {
    pagination.current = 1
    refreshData()
  }

  // 重置搜索
  const resetSearch = () => {
    searchForm.name = ''
    handleSearch()
  }

  // 重置表单数据
  const resetFormData = () => {
    formData.id = 0
    formData.name = ''
    formData.parentId = 0
    formData.description = ''
    formData.status = 'enabled'
    formData.sortOrder = 0
    if (formRef.value) {
      formRef.value.resetFields()
    }
  }

  const handleAdd = () => {
    isEditMode.value = false
    showDialog.value = true
    resetFormData()
    // 确保添加顶级分类时父分类ID为0
    formData.parentId = 0
  }

  const handleAddSubCategory = (parentCategory: Category) => {
    isEditMode.value = false
    showDialog.value = true
    resetFormData()
    // 设置父分类ID为当前分类的ID，添加子分类
    formData.parentId = parentCategory.id
  }

  const handleEdit = (category: Category) => {
    isEditMode.value = true
    showDialog.value = true
    // 填充表单数据
    formData.id = category.id
    formData.name = category.name
    formData.parentId = category.parentId || 0
    formData.description = category.description || ''
    formData.status = category.status || 'enabled'
    formData.sortOrder = category.sortOrder || 0
  }

  const handleDelete = async (category: Category) => {
    try {
      await ElMessageBox.confirm(`确定要删除分类「${category.name}」吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      // 真实API删除操作
      await categoryApi.deleteCategory(category.id)
      refreshData()
      ElMessage.success('分类删除成功')
    } catch (error: any) {
      // 用户取消删除
      if (error !== 'cancel') {
        console.error('删除分类失败:', error)
        ElMessage.error('删除分类失败')
      }
    }
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()

      // 表单数据已适配后端API格式
      const apiData = {
        name: formData.name,
        parentId: formData.parentId,
        description: formData.description,
        status: formData.status,
        sortOrder: formData.sortOrder
      }

      // 真实API添加/更新操作
      if (isEditMode.value) {
        await categoryApi.updateCategory(formData.id, apiData)
        ElMessage.success('分类更新成功')
      } else {
        await categoryApi.createCategory(apiData)
        ElMessage.success('分类创建成功')
      }
      refreshData()
      handleDialogClose()
    } catch (error) {
      console.error('提交表单失败:', error)
      ElMessage.error(isEditMode.value ? '分类更新失败' : '分类创建失败')
    }
  }

  const handleDialogClose = () => {
    showDialog.value = false
    isEditMode.value = false
    resetFormData()
  }

  // 树形表格相关功能
  const toggleExpand = () => {
    // 切换展开/收起状态
    isAllExpanded.value = !isAllExpanded.value
    if (tableRef.value?.elTableRef && tableData.value) {
      const expandAll = isAllExpanded.value
      const processRows = (rows: Category[]) => {
        rows.forEach((row) => {
          if (row.children?.length) {
            tableRef.value?.elTableRef.toggleRowExpansion(row, expandAll)
            processRows(row.children)
          }
        })
      }
      processRows(tableData.value)
    }
  }

  // 组件挂载时获取数据
  onMounted(() => {
    refreshData()
  })
</script>

<style scoped>
  .category-manage {
    padding: 10px 0;
  }
</style>
