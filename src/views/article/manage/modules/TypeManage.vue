<!-- 文章类型管理子组件 -->
<template>
  <div class="type-manage">
    <!-- 页面标题和操作区 -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-medium">文章类型</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon>
          <Plus />
        </el-icon>
        添加类型
      </el-button>
    </div>

    <!-- 搜索区域 -->
    <div class="flex gap-4 mb-6">
      <el-input
        v-model="searchForm.name"
        placeholder="搜索类型名称"
        :prefix-icon="Search"
        class="flex-1"
        @keyup.enter="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <!-- 类型列表 - 使用ArtTable组件 -->
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
      <div style="display: flex; justify-content: center; margin-top: 10px">
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

    <!-- 添加/编辑类型对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="isEditMode ? '编辑类型' : '添加类型'"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form :model="formData" :rules="rules" ref="formRef">
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入类型名称" />
        </el-form-item>
        <el-form-item label="类型描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入类型描述（可选）"
          />
        </el-form-item>
        <el-form-item label="类型排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" placeholder="请输入排序号" />
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
  import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'

  // 定义事件
  const emit = defineEmits(['refresh'])

  // 定义类型接口
  interface ArticleType {
    id: number
    name: string
    description: string
    sort: number
    article_count: number
    create_time: string
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
    description: '',
    sort: 0,
    article_count: 0,
    create_time: ''
  })

  // 表格数据和分页
  const tableData = ref<ArticleType[]>([])
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 表单验证规则
  const rules = {
    name: [
      { required: true, message: '请输入类型名称', trigger: 'blur' },
      { min: 1, max: 20, message: '类型名称长度在 1 到 20 个字符', trigger: 'blur' }
    ],
    description: [{ max: 100, message: '类型描述长度不能超过 100 个字符', trigger: 'blur' }],
    sort: [
      { required: true, message: '请输入排序号', trigger: 'blur' },
      {
        type: 'number' as const,
        min: 0,
        max: 999,
        message: '排序号必须在 0-999 之间',
        trigger: 'blur'
      }
    ]
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN')
  }

  // 模拟获取所有文章类型
  const fetchAllTypes = async () => {
    return new Promise<ArticleType[]>((resolve) => {
      setTimeout(() => {
        const mockTypes = [
          {
            id: 1,
            name: '技术文章',
            description: '分享技术经验和开发技巧的文章',
            sort: 1,
            article_count: 25,
            create_time: '2024-01-01 10:00:00'
          },
          {
            id: 2,
            name: '教程',
            description: '详细的技术教程和学习指南',
            sort: 2,
            article_count: 18,
            create_time: '2024-01-01 11:00:00'
          },
          {
            id: 3,
            name: '博客',
            description: '个人观点和经验分享',
            sort: 3,
            article_count: 15,
            create_time: '2024-01-01 12:00:00'
          },
          {
            id: 4,
            name: '新闻',
            description: '技术资讯和行业动态',
            sort: 4,
            article_count: 20,
            create_time: '2024-01-01 13:00:00'
          },
          {
            id: 5,
            name: '工具分享',
            description: '开发工具和资源推荐',
            sort: 5,
            article_count: 8,
            create_time: '2024-01-01 14:00:00'
          }
        ]
        resolve(mockTypes)
      }, 200)
    })
  }

  // 表格列配置
  const { columns } = useTableColumns(() => [
    {
      prop: 'id',
      label: 'ID',
      width: 80,
      align: 'center'
    },
    {
      prop: 'name',
      label: '类型名称',
      width: 180
    },
    {
      prop: 'description',
      label: '类型描述',
      minWidth: 200
    },
    {
      prop: 'sort',
      label: '排序号',
      width: 100,
      align: 'center'
    },
    {
      prop: 'article_count',
      label: '文章数量',
      width: 120,
      align: 'center'
    },
    {
      prop: 'create_time',
      label: '创建时间',
      width: 200,
      formatter: (row: ArticleType) => {
        return h('p', {}, formatDate(row.create_time))
      }
    },
    {
      prop: 'operation',
      label: '操作',
      width: 180,
      align: 'right',
      formatter: (row: ArticleType) => {
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
  const mockFetchTypeList = async () => {
    return new Promise<{
      items: ArticleType[]
      total: number
    }>((resolve) => {
      setTimeout(async () => {
        let mockTypes = await fetchAllTypes()

        // 应用搜索过滤
        if (searchForm.name) {
          mockTypes = mockTypes.filter(
            (type) =>
              type.name.toLowerCase().includes(searchForm.name.toLowerCase()) ||
              type.description.toLowerCase().includes(searchForm.name.toLowerCase())
          )
        }

        // 分页
        const start = (pagination.current - 1) * pagination.size
        const end = start + pagination.size
        const paginatedItems = mockTypes.slice(start, end)

        resolve({
          items: paginatedItems,
          total: mockTypes.length
        })
      }, 300)
    })
  }

  // 刷新数据方法
  const refreshData = async () => {
    loading.value = true
    try {
      const result = await mockFetchTypeList()
      tableData.value = result.items
      pagination.total = result.total

      // 触发父组件的刷新事件
      emit('refresh')
    } catch (error) {
      console.error('获取文章类型列表失败:', error)
      ElMessage.error('获取文章类型列表失败')
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
    formData.description = ''
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

  const handleEdit = (type: ArticleType) => {
    isEditMode.value = true
    showDialog.value = true
    // 填充表单数据
    Object.assign(formData, type)
  }

  const handleDelete = async (type: ArticleType) => {
    try {
      await ElMessageBox.confirm(`确定要删除类型「${type.name}」吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      // 模拟删除操作
      setTimeout(() => {
        refreshData()
        ElMessage.success('类型删除成功')
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
        ElMessage.success(isEditMode.value ? '类型更新成功' : '类型创建成功')
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
  .type-manage {
    padding: 10px 0;
  }
</style>
