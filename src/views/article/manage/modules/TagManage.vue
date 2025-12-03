<!-- 文章标签管理子组件 -->
<template>
  <div class="tag-manage">
    <!-- 页面标题和操作区 -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-medium">标签管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon>
          <Plus />
        </el-icon>
        添加标签
      </el-button>
    </div>

    <!-- 搜索区域 -->
    <div class="flex gap-4 mb-6">
      <el-input
        v-model="searchForm.name"
        placeholder="搜索标签名称"
        :prefix-icon="Search"
        class="flex-1"
        @keyup.enter="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <!-- 标签列表 - 使用ArtTable组件 -->
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

    <!-- 添加/编辑标签对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="isEditMode ? '编辑标签' : '添加标签'"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form :model="formData" :rules="rules" ref="formRef">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="标签排序" prop="sortOrder">
          <el-input-number
            v-model="formData.sortOrder"
            :min="0"
            :max="999"
            placeholder="请输入排序号"
          />
        </el-form-item>
        <el-form-item label="文字颜色" prop="color">
          <el-input v-model="formData.color" placeholder="请输入文字颜色（如：#303133）" />
        </el-form-item>
        <el-form-item label="背景颜色" prop="backgroundColor">
          <el-input
            v-model="formData.backgroundColor"
            placeholder="请输入背景颜色（如：#F5F7FA）"
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
  import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'

  // 定义事件
  const emit = defineEmits(['refresh'])

  // 定义标签接口
  interface Tag {
    id: number
    name: string
    color: string
    backgroundColor: string
    sortOrder: number
    status: number
    usageCount: number
    createBy: number
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
    color: '#303133',
    backgroundColor: '#F5F7FA',
    sortOrder: 0,
    status: 1,
    usageCount: 0,
    createBy: 0,
    createTime: '',
    updateTime: ''
  })

  // 表格数据和分页
  const tableData = ref<Tag[]>([])
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 表单验证规则
  const rules = {
    name: [
      { required: true, message: '请输入标签名称', trigger: 'blur' },
      { min: 1, max: 20, message: '标签名称长度在 1 到 20 个字符', trigger: 'blur' }
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
    color: [
      { required: true, message: '请输入文字颜色', trigger: 'blur' },
      {
        pattern: /^#[0-9A-Fa-f]{6}$/,
        message: '颜色格式不正确，请输入类似 #303133 的格式',
        trigger: 'blur'
      }
    ],
    backgroundColor: [
      { required: true, message: '请输入背景颜色', trigger: 'blur' },
      {
        pattern: /^#[0-9A-Fa-f]{6}$/,
        message: '颜色格式不正确，请输入类似 #F5F7FA 的格式',
        trigger: 'blur'
      }
    ]
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN')
  }

  // 模拟获取所有标签
  const fetchAllTags = async () => {
    return new Promise<Tag[]>((resolve) => {
      setTimeout(() => {
        const mockTags = [
          {
            id: 1,
            name: 'Vue',
            color: '#42b883',
            backgroundColor: '#e6f7ff',
            sortOrder: 1,
            status: 1,
            usageCount: 12,
            createBy: 1,
            createTime: '2024-01-01 10:00:00',
            updateTime: '2024-01-01 10:00:00'
          },
          {
            id: 2,
            name: 'React',
            color: '#61dafb',
            backgroundColor: '#f0f9ff',
            sortOrder: 2,
            status: 1,
            usageCount: 8,
            createBy: 1,
            createTime: '2024-01-01 11:00:00',
            updateTime: '2024-01-01 11:00:00'
          },
          {
            id: 3,
            name: 'TypeScript',
            color: '#3178c6',
            backgroundColor: '#ecf5ff',
            sortOrder: 3,
            status: 1,
            usageCount: 15,
            createBy: 1,
            createTime: '2024-01-01 12:00:00',
            updateTime: '2024-01-01 12:00:00'
          },
          {
            id: 4,
            name: 'Node.js',
            color: '#68a063',
            backgroundColor: '#f0f9ff',
            sortOrder: 4,
            status: 1,
            usageCount: 10,
            createBy: 1,
            createTime: '2024-01-01 13:00:00',
            updateTime: '2024-01-01 13:00:00'
          },
          {
            id: 5,
            name: 'Webpack',
            color: '#8dd6f9',
            backgroundColor: '#f0f8ff',
            sortOrder: 5,
            status: 1,
            usageCount: 6,
            createBy: 1,
            createTime: '2024-01-01 14:00:00',
            updateTime: '2024-01-01 14:00:00'
          },
          {
            id: 6,
            name: 'CSS3',
            color: '#1572b6',
            backgroundColor: '#f0f9ff',
            sortOrder: 6,
            status: 1,
            usageCount: 9,
            createBy: 1,
            createTime: '2024-01-01 15:00:00',
            updateTime: '2024-01-01 15:00:00'
          },
          {
            id: 7,
            name: 'JavaScript',
            color: '#f7df1e',
            backgroundColor: '#fffbe6',
            sortOrder: 7,
            status: 0,
            usageCount: 20,
            createBy: 1,
            createTime: '2024-01-01 16:00:00',
            updateTime: '2024-01-01 16:00:00'
          }
        ]
        resolve(mockTags)
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
      label: '标签名称',
      width: 180,
      formatter: (row: Tag) => {
        return h(
          'span',
          {
            style: {
              color: row.color,
              backgroundColor: row.backgroundColor,
              padding: '2px 8px',
              borderRadius: '4px',
              display: 'inline-block'
            }
          },
          row.name
        )
      }
    },
    {
      prop: 'color',
      label: '文字颜色',
      width: 120,
      formatter: (row: Tag) => {
        return h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          },
          [
            h('span', row.color),
            h('span', {
              style: {
                backgroundColor: row.color,
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                border: '1px solid #dcdfe6'
              }
            })
          ]
        )
      }
    },
    {
      prop: 'backgroundColor',
      label: '背景颜色',
      width: 120,
      formatter: (row: Tag) => {
        return h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          },
          [
            h('span', row.backgroundColor),
            h('span', {
              style: {
                backgroundColor: row.backgroundColor,
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                border: '1px solid #dcdfe6'
              }
            })
          ]
        )
      }
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
      formatter: (row: Tag) => {
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
      prop: 'usageCount',
      label: '文章数量',
      width: 120,
      align: 'center'
    },
    {
      prop: 'createTime',
      label: '创建时间',
      width: 200,
      formatter: (row: Tag) => {
        return h('p', {}, formatDate(row.createTime))
      }
    },
    {
      prop: 'operation',
      label: '操作',
      width: 180,
      align: 'right',
      fixed: 'right',
      formatter: (row: Tag) => {
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
  const mockFetchTagList = async () => {
    return new Promise<{
      items: Tag[]
      total: number
    }>((resolve) => {
      setTimeout(async () => {
        let mockTags = await fetchAllTags()

        // 应用搜索过滤
        if (searchForm.name) {
          mockTags = mockTags.filter((tag) =>
            tag.name.toLowerCase().includes(searchForm.name.toLowerCase())
          )
        }

        // 分页
        const start = (pagination.current - 1) * pagination.size
        const end = start + pagination.size
        const paginatedItems = mockTags.slice(start, end)

        resolve({
          items: paginatedItems,
          total: mockTags.length
        })
      }, 300)
    })
  }

  // 刷新数据方法
  const refreshData = async () => {
    loading.value = true
    try {
      const result = await mockFetchTagList()
      tableData.value = result.items
      pagination.total = result.total

      // 触发父组件的刷新事件
      emit('refresh')
    } catch (error) {
      console.error('获取标签列表失败:', error)
      ElMessage.error('获取标签列表失败')
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

  const handleEdit = (tag: Tag) => {
    isEditMode.value = true
    showDialog.value = true
    // 填充表单数据
    formData.id = tag.id
    formData.name = tag.name
    formData.color = tag.color
    formData.backgroundColor = tag.backgroundColor
    formData.sortOrder = tag.sortOrder
    formData.status = tag.status
    formData.usageCount = tag.usageCount
    formData.createBy = tag.createBy
    formData.createTime = tag.createTime
    formData.updateTime = tag.updateTime
  }

  const handleDelete = async (tag: Tag) => {
    try {
      await ElMessageBox.confirm(`确定要删除标签「${tag.name}」吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      // 模拟删除操作
      setTimeout(() => {
        refreshData()
        ElMessage.success('标签删除成功')
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
        ElMessage.success(isEditMode.value ? '标签更新成功' : '标签创建成功')
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
  .tag-manage {
    padding: 10px 0;
  }
</style>
