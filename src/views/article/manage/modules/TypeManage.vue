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
      <el-form
        :model="formData"
        :rules="rules"
        ref="formRef"
        label-width="100px"
        label-position="right"
        style="max-width: 450px; margin: 0 auto"
      >
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入类型名称" style="width: 100%" />
        </el-form-item>
        <el-form-item label="类型编码" prop="code">
          <el-input
            v-model="formData.code"
            placeholder="请输入类型编码（英文/数字）"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="类型图标" prop="icon">
          <el-input v-model="formData.icon" placeholder="请输入图标名称" style="width: 100%" />
        </el-form-item>
        <el-form-item label="类型状态" prop="status">
          <el-switch
            v-model="formData.status"
            :active-value="'enabled'"
            :inactive-value="'disabled'"
            active-text="启用"
            inactive-text="禁用"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="类型描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入类型描述（可选）"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="类型排序" prop="sortOrder">
          <el-input-number
            v-model="formData.sortOrder"
            :min="0"
            :max="999"
            placeholder="请输入排序号"
            style="width: 100%"
          />
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
  import { articleTypeApi } from '@/api/article'

  // 定义事件
  const emit = defineEmits(['refresh'])

  // 导入类型
  import type { ArticleType } from '@/types/api/article'

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
    code: '',
    description: '',
    icon: 'document',
    status: 'enabled',
    sortOrder: 0,
    createTime: '',
    updateTime: ''
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
    code: [
      { required: true, message: '请输入类型编码', trigger: 'blur' },
      { min: 1, max: 20, message: '类型编码长度在 1 到 20 个字符', trigger: 'blur' }
    ],
    description: [{ max: 100, message: '类型描述长度不能超过 100 个字符', trigger: 'blur' }],
    sortOrder: [
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
  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleString('zh-CN')
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
      minWidth: 200
    },
    {
      prop: 'code',
      label: '类型编码',
      minWidth: 180,
      align: 'center'
    },
    {
      prop: 'icon',
      label: '图标',
      width: 120,
      align: 'center',
      formatter: (row: ArticleType) => {
        return h('span', { class: 'icon-wrapper' }, row.icon)
      }
    },
    {
      prop: 'status',
      label: '状态',
      width: 120,
      align: 'center',
      formatter: (row: ArticleType) => {
        return h(
          'el-tag',
          {
            type: row.status === 'enabled' ? 'success' : 'danger'
          },
          row.status === 'enabled' ? '启用' : '禁用'
        )
      }
    },
    {
      prop: 'sortOrder',
      label: '排序号',
      width: 120,
      align: 'center'
    },
    {
      prop: 'createTime',
      label: '创建时间',
      minWidth: 200,
      formatter: (row: ArticleType) => {
        return h('p', {}, formatDate(row.createTime || ''))
      }
    },
    {
      prop: 'updateTime',
      label: '更新时间',
      minWidth: 200,
      formatter: (row: ArticleType) => {
        return h('p', {}, formatDate(row.updateTime || ''))
      }
    },
    {
      prop: 'operation',
      label: '操作',
      width: 140,
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

  // 真实API获取文章类型列表
  const fetchTypeList = async () => {
    try {
      const response = await articleTypeApi.getArticleTypeList({
        page: pagination.current,
        pageSize: pagination.size,
        keyword: searchForm.name
      })
      // 注意：HTTP工具已经自动提取了BaseResponse的data字段
      // 所以直接访问response.list和response.total即可
      return {
        items: response.list || [],
        total: response.total || 0
      }
    } catch (error) {
      console.error('获取文章类型列表失败:', error)
      ElMessage.error('获取文章类型列表失败')
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
      const result = await fetchTypeList()
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
    formData.code = ''
    formData.description = ''
    formData.icon = 'document'
    formData.status = 'enabled'
    formData.sortOrder = 0
    formData.createTime = ''
    formData.updateTime = ''
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
    formData.id = type.id
    formData.name = type.name
    formData.code = type.code || ''
    formData.description = type.description || ''
    formData.icon = type.icon || 'document'
    formData.status = type.status || 'enabled'
    formData.sortOrder = type.sortOrder || 0
    formData.createTime = type.createTime || ''
    formData.updateTime = type.updateTime || ''
  }

  const handleDelete = async (type: ArticleType) => {
    try {
      await ElMessageBox.confirm(`确定要删除文章类型「${type.name}」吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      // 真实API删除操作
      await articleTypeApi.deleteArticleType(type.id)
      refreshData()
      ElMessage.success('文章类型删除成功')
    } catch (error: any) {
      // 用户取消删除
      if (error !== 'cancel') {
        console.error('删除文章类型失败:', error)
        ElMessage.error('删除文章类型失败')
      }
    }
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()

      // 真实API添加/更新操作
      if (isEditMode.value) {
        await articleTypeApi.updateArticleType(formData.id, {
          name: formData.name,
          code: formData.code,
          icon: formData.icon,
          status: formData.status,
          sortOrder: formData.sortOrder
        })
        ElMessage.success('文章类型更新成功')
      } else {
        await articleTypeApi.createArticleType({
          name: formData.name,
          code: formData.code,
          icon: formData.icon,
          status: formData.status,
          sortOrder: formData.sortOrder
        })
        ElMessage.success('文章类型创建成功')
      }
      refreshData()
      handleDialogClose()
    } catch (error) {
      console.error('提交表单失败:', error)
      ElMessage.error(isEditMode.value ? '文章类型更新失败' : '文章类型创建失败')
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
