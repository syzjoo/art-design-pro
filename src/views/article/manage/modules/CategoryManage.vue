<!-- 文章分类管理子组件 -->
<template>
  <div class="category-manage">
    <!-- 页面标题和操作区 -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-medium">分类管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon>
          <Plus />
        </el-icon>
        添加分类
      </el-button>
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
        style="overflow-y: auto"
      />
      <div style="display: flex; justify-content: center; margin-top: 20px">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 添加/编辑分类对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="isEditMode ? '编辑分类' : '添加分类'"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form :model="formData" :rules="rules" ref="formRef">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类排序" prop="sortOrder">
          <el-input-number
            v-model="formData.sortOrder"
            :min="0"
            :max="999"
            placeholder="请输入排序号"
          />
        </el-form-item>
        <el-form-item label="父分类" prop="parentId">
          <el-select v-model="formData.parentId" placeholder="请选择父分类" style="width: 100%">
            <el-option label="顶级分类" :value="0" />
            <el-option label="前端开发" :value="1" />
            <el-option label="后端开发" :value="2" />
            <el-option label="数据库" :value="3" />
            <el-option label="算法" :value="4" />
            <el-option label="人工智能" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input
            v-model="formData.description"
            placeholder="请输入分类描述"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
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
  import { Search, Plus } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox, ElForm, FormInstance } from 'element-plus'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'

  // 定义事件
  const emit = defineEmits(['refresh'])

  // 定义分类接口
  interface Category {
    id: number
    name: string
    parentId: number
    description: string
    articleCount: number
    status: number
    sortOrder: number
    createBy: number
    updateBy: number
    createTime: string
    updateTime: string
  }

  // 响应式数据
  const searchForm = reactive({
    name: ''
  })
  const showDialog = ref(false)
  const isEditMode = ref(false)
  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const tableRef = ref()

  // 表单数据
  const formData = reactive({
    id: 0,
    name: '',
    parentId: 0,
    description: '',
    status: 1,
    sortOrder: 0,
    articleCount: 0,
    createBy: 0,
    updateBy: 0,
    createTime: '',
    updateTime: ''
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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN')
  }

  // 模拟获取所有分类
  const fetchAllCategories = async () => {
    return new Promise<Category[]>((resolve) => {
      setTimeout(() => {
        const mockCategories = [
          {
            id: 1,
            name: '前端开发',
            parentId: 0,
            description: '前端开发相关技术文章',
            articleCount: 20,
            status: 1,
            sortOrder: 1,
            createBy: 1,
            updateBy: 1,
            createTime: '2024-01-01 10:00:00',
            updateTime: '2024-01-01 10:00:00'
          },
          {
            id: 2,
            name: '后端开发',
            parentId: 0,
            description: '后端开发相关技术文章',
            articleCount: 15,
            status: 1,
            sortOrder: 2,
            createBy: 1,
            updateBy: 1,
            createTime: '2024-01-01 11:00:00',
            updateTime: '2024-01-01 11:00:00'
          },
          {
            id: 3,
            name: '数据库',
            parentId: 0,
            description: '数据库相关技术文章',
            articleCount: 8,
            status: 1,
            sortOrder: 3,
            createBy: 1,
            updateBy: 1,
            createTime: '2024-01-01 12:00:00',
            updateTime: '2024-01-01 12:00:00'
          },
          {
            id: 4,
            name: '算法',
            parentId: 0,
            description: '算法与数据结构相关文章',
            articleCount: 12,
            status: 1,
            sortOrder: 4,
            createBy: 1,
            updateBy: 1,
            createTime: '2024-01-01 13:00:00',
            updateTime: '2024-01-01 13:00:00'
          },
          {
            id: 5,
            name: '人工智能',
            parentId: 0,
            description: '人工智能相关技术文章',
            articleCount: 6,
            status: 1,
            sortOrder: 5,
            createBy: 1,
            updateBy: 1,
            createTime: '2024-01-01 14:00:00',
            updateTime: '2024-01-01 14:00:00'
          },
          {
            id: 6,
            name: 'Vue.js',
            parentId: 1,
            description: 'Vue.js框架相关文章',
            articleCount: 8,
            status: 1,
            sortOrder: 1,
            createBy: 1,
            updateBy: 1,
            createTime: '2024-01-02 10:00:00',
            updateTime: '2024-01-02 10:00:00'
          },
          {
            id: 7,
            name: 'React',
            parentId: 1,
            description: 'React框架相关文章',
            articleCount: 6,
            status: 0,
            sortOrder: 2,
            createBy: 1,
            updateBy: 1,
            createTime: '2024-01-02 11:00:00',
            updateTime: '2024-01-02 11:00:00'
          }
        ]
        resolve(mockCategories)
      }, 200)
    })
  }

  // 表格列配置
  const { columns } = useTableColumns(() => [
    {
      prop: 'id',
      label: 'ID',
      width: 80,
      align: 'center',
      fixed: 'left'
    },
    {
      prop: 'name',
      label: '分类名称',
      width: 180,
      formatter: (row: Category) => {
        // 为子分类添加缩进
        const indent = row.parentId > 0 ? '└─ ' : ''
        return h('span', null, indent + row.name)
      }
    },
    {
      prop: 'parentId',
      label: '父分类',
      width: 120,
      align: 'center',
      formatter: (row: Category) => {
        return h('span', null, row.parentId === 0 ? '顶级分类' : row.parentId.toString())
      }
    },
    {
      prop: 'description',
      label: '分类描述',
      width: 250
    },
    {
      prop: 'sortOrder',
      label: '排序号',
      width: 100,
      align: 'center'
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      align: 'center',
      formatter: (row: Category) => {
        return h(
          'el-tag',
          {
            type: row.status === 1 ? 'success' : 'danger',
            size: 'small'
          },
          row.status === 1 ? '启用' : '禁用'
        )
      }
    },
    {
      prop: 'articleCount',
      label: '文章数量',
      width: 120,
      align: 'center'
    },
    {
      prop: 'createTime',
      label: '创建时间',
      width: 200,
      formatter: (row: Category) => {
        return h('p', {}, formatDate(row.createTime))
      }
    },
    {
      prop: 'operation',
      label: '操作',
      width: 180,
      align: 'right',
      fixed: 'right',
      formatter: (row: Category) => {
        const buttonStyle = { style: 'text-align: right' }

        return h('div', buttonStyle, [
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

  // 模拟数据获取API函数
  const mockFetchCategoryList = async () => {
    return new Promise<{
      items: Category[]
      total: number
    }>((resolve) => {
      setTimeout(async () => {
        let mockCategories = await fetchAllCategories()

        // 应用搜索过滤
        if (searchForm.name) {
          mockCategories = mockCategories.filter((category) =>
            category.name.toLowerCase().includes(searchForm.name.toLowerCase())
          )
        }

        // 分页
        const start = (pagination.current - 1) * pagination.size
        const end = start + pagination.size
        const paginatedItems = mockCategories.slice(start, end)

        resolve({
          items: paginatedItems,
          total: mockCategories.length
        })
      }, 300)
    })
  }

  // 刷新数据方法
  const refreshData = async () => {
    loading.value = true
    try {
      const result = await mockFetchCategoryList()
      tableData.value = result.items
      pagination.total = result.total

      // 触发父组件的刷新事件
      emit('refresh')
    } catch (error) {
      console.error('获取分类列表失败:', error)
      ElMessage.error('获取分类列表失败')
    } finally {
      loading.value = false
    }
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
    formData.sort = 0
    formData.article_count = 0
    formData.create_time = ''
    if (formRef.value) {
      formRef.value.resetFields()
    }
  }

  const handleAdd = () => {
    isEditMode.value = false
    showDialog.value = true
    resetFormData()
  }

  const handleEdit = (category: Category) => {
    isEditMode.value = true
    showDialog.value = true
    // 填充表单数据
    formData.id = category.id
    formData.name = category.name
    formData.parentId = category.parentId
    formData.description = category.description
    formData.status = category.status
    formData.sortOrder = category.sortOrder
    formData.articleCount = category.articleCount
    formData.createBy = category.createBy
    formData.updateBy = category.updateBy
    formData.createTime = category.createTime
    formData.updateTime = category.updateTime
  }

  const handleDelete = async (category: Category) => {
    try {
      await ElMessageBox.confirm(`确定要删除分类「${category.name}」吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      // 模拟删除操作
      setTimeout(() => {
        refreshData()
        ElMessage.success('分类删除成功')
      }, 300)
    } catch (error) {
      // 用户取消删除
      ElMessage.info('删除失败' + error)
    }
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()

      // 模拟添加/更新操作
      setTimeout(() => {
        refreshData()
        ElMessage.success(isEditMode.value ? '分类更新成功' : '分类创建成功')
        handleDialogClose()
      }, 300)
    } catch (error) {
      console.error('提交表单失败:', error)
    }
  }

  const handleDialogClose = () => {
    showDialog.value = false
    isEditMode.value = false
    resetFormData()
  }

  // 分页处理
  const handleSizeChange = (size: number) => {
    pagination.size = size
    refreshData()
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
    refreshData()
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
