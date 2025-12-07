<!-- 文章列表页面 -->
<template>
  <div class="article-page art-full-height flex flex-col">
    <!-- 搜索栏 -->
    <ArtSearchBar
      v-model="formFilters"
      :items="formItems"
      :showExpand="true"
      @reset="handleReset"
      @search="handleSearch"
      class="search-bar"
    />

    <ElCard class="art-table-card flex-1" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader
        :showZebra="false"
        :loading="loading"
        v-model:columns="columnChecks"
        @refresh="handleRefresh"
      >
        <template #left>
          <ElButton type="primary" @click="handleAddArticle" v-ripple>
            <el-icon><Plus /></el-icon>
            发布文章
          </ElButton>
          <ElButton type="warning" @click="handleBatchPublish" v-ripple>批量发布</ElButton>
          <ElButton type="danger" @click="handleBatchDelete" v-ripple>批量删除</ElButton>
        </template>
        <template #right>
          <div class="flex justify-end">
            <el-button-group>
              <el-button
                :type="listType === 'list' ? 'primary' : 'default'"
                @click="listType = 'list'"
              >
                <el-icon><List /></el-icon>
                列表
              </el-button>
              <el-button
                :type="listType === 'card' ? 'primary' : 'default'"
                @click="listType = 'card'"
              >
                <el-icon><Grid /></el-icon>
                卡片
              </el-button>
            </el-button-group>
          </div>
        </template>
      </ArtTableHeader>

      <!-- 文章列表 -->
      <TableArticleList
        ref="tableArticleListRef"
        :list-type="listType"
        :search-params="searchParams"
        @refresh="handleRefresh"
        :loading="loading"
        :columns="columns"
      ></TableArticleList>

      <!-- 文章弹窗 -->
      <!-- <ArticleDialog
        v-model:visible="dialogVisible"
        :editData="editData"
        @submit="handleSubmit"
      /> -->
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { Plus, List, Grid } from '@element-plus/icons-vue'
  import { ElMessage, ElButton } from 'element-plus'
  import { useRouter } from 'vue-router'
  import TableArticleList from './modules/TableArticleList.vue'
  import ArtSearchBar from '@/components/core/forms/art-search-bar/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { articleApi } from '@/api/article'
  // import ArticleDialog from './modules/article-dialog.vue'

  defineOptions({ name: 'ArticleList' })

  // 状态管理
  const loading = ref(false)
  const tableArticleListRef = ref<InstanceType<typeof TableArticleList>>()
  const listType = ref<'list' | 'card'>('list')

  // 弹窗相关（预留）
  // const dialogVisible = ref(false)
  // const editData = ref<any>(null)

  // 搜索相关
  const initialSearchState = {
    keyword: '',
    article_type_id: 0,
    category_id: 0,
    tag_id: 0,
    status: '',
    top: '',
    hot: ''
  }

  const formFilters = reactive({ ...initialSearchState })
  const appliedFilters = reactive({ ...initialSearchState })

  // 分类、标签和类型数据
  const articleTypes = ref<any[]>([])
  const categoryList = ref<any[]>([])
  const tagList = ref<any[]>([])

  const formItems = computed(() => [
    {
      label: '',
      key: 'keyword',
      type: 'input',
      placeholder: '搜索文章标题或关键词',
      clearable: true
    },
    {
      label: '文章类型',
      key: 'article_type_id',
      type: 'select',
      placeholder: '选择文章类型',
      options: [
        { value: 0, label: '全部类型' },
        ...articleTypes.value.map((type) => ({ value: type.id, label: type.name }))
      ]
    },
    {
      label: '分类',
      key: 'category_id',
      type: 'select',
      placeholder: '选择分类',
      options: [
        { value: 0, label: '全部分类' },
        ...categoryList.value.map((cat) => ({ value: cat.id, label: cat.name }))
      ]
    },
    {
      label: '标签',
      key: 'tag_id',
      type: 'select',
      placeholder: '选择标签',
      options: [
        { value: 0, label: '全部标签' },
        ...tagList.value.map((tag) => ({ value: tag.id, label: tag.name }))
      ]
    },
    {
      label: '文章状态',
      key: 'status',
      type: 'select',
      placeholder: '文章状态',
      options: [
        { value: '', label: '全部状态' },
        { value: 'published', label: '已发布' },
        { value: 'draft', label: '草稿' }
      ]
    },
    {
      label: '置顶',
      key: 'top',
      type: 'select',
      placeholder: '置顶状态',
      options: [
        { value: '', label: '全部' },
        { value: 1, label: '已置顶' },
        { value: 2, label: '未置顶' }
      ]
    },
    {
      label: '热门',
      key: 'hot',
      type: 'select',
      placeholder: '热门状态',
      options: [
        { value: '', label: '全部' },
        { value: 1, label: '热门' },
        { value: 2, label: '非热门' }
      ]
    }
  ])

  // 计算属性 - 搜索参数
  const searchParams = computed(() => ({
    searchVal: appliedFilters.keyword || null,
    yearVal: '',
    article_type_id: appliedFilters.article_type_id === 0 ? null : appliedFilters.article_type_id,
    category_id: appliedFilters.category_id === 0 ? null : appliedFilters.category_id,
    tag_id: appliedFilters.tag_id === 0 ? null : appliedFilters.tag_id,
    status: appliedFilters.status === '' ? null : appliedFilters.status,
    top: appliedFilters.top === '' ? null : appliedFilters.top === '1' ? 1 : 0,
    hot: appliedFilters.hot === '' ? null : appliedFilters.hot === '1' ? 1 : 0
  }))

  // 表格列配置 - 使用和菜单列表相同的方式定义
  // 表格列配置 - 直接在父组件定义，用于列显隐控制

  const { columns, columnChecks } = useTableColumns(() => [
    {
      type: 'selection',
      width: 50,
      align: 'center',
      isFixed: true
    },
    {
      prop: 'id',
      label: 'ID',
      width: 80,
      align: 'center',
      isFixed: true
    },
    {
      prop: 'title',
      label: '文章标题',
      minWidth: 350
    },
    {
      prop: 'categoryName',
      label: '文章分类',
      width: 120
    },
    {
      prop: 'articleTypeName',
      label: '文章类型',
      width: 120
    },
    {
      prop: 'tags',
      label: '文章标签',
      minWidth: 200
    },
    {
      prop: 'viewCount',
      label: '阅读量',
      width: 100,
      align: 'center'
    },
    {
      prop: 'status',
      label: '状态',
      width: 100
    },
    {
      prop: 'createTime',
      label: '创建时间',
      width: 150
    },
    {
      prop: 'operation',
      label: '操作',
      width: 280,
      align: 'right',
      fixed: 'right'
    }
  ])

  // 路由
  const router = useRouter()

  // 从后端获取文章类型、分类和标签数据
  const fetchArticleTypes = async () => {
    try {
      const data = await articleApi.getArticleTypes()
      articleTypes.value = data || []
    } catch (error) {
      console.error('获取文章类型失败:', error)
      ElMessage.error('获取文章类型失败')
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await articleApi.getCategories()
      categoryList.value = data || []
    } catch (error) {
      console.error('获取分类失败:', error)
      ElMessage.error('获取分类失败')
    }
  }

  const fetchTags = async () => {
    try {
      const data = await articleApi.getTags()
      tagList.value = data || []
    } catch (error) {
      console.error('获取标签失败:', error)
      ElMessage.error('获取标签失败')
    }
  }

  onMounted(async () => {
    await Promise.all([fetchArticleTypes(), fetchCategories(), fetchTags()])
    refreshList()
  })

  /**
   * 重置搜索条件
   */
  const handleReset = (): void => {
    Object.assign(formFilters, { ...initialSearchState })
    Object.assign(appliedFilters, { ...initialSearchState })
    refreshList()
  }

  /**
   * 执行搜索
   */
  const handleSearch = (): void => {
    Object.assign(appliedFilters, { ...formFilters })
    refreshList()
  }

  /**
   * 刷新文章列表
   */
  const handleRefresh = (): void => {
    refreshList()
  }

  /**
   * 刷新列表数据
   */
  const refreshList = async () => {
    loading.value = true
    try {
      if (tableArticleListRef.value) {
        await tableArticleListRef.value.refreshData()
      }
    } catch (error) {
      console.error('刷新文章列表失败:', error)
      ElMessage.error('刷新失败，请重试')
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加文章
   */
  const handleAddArticle = (): void => {
    router.push({ name: 'ArticlePublish' })
  }

  // /**
  //  * 编辑文章
  //  */
  // const handleEditArticle = (row: any): void => {
  //   router.push({ name: 'ArticlePublish', query: { id: row.id.toString() } })
  // }

  /**
   * 批量发布
   */
  const handleBatchPublish = async (): Promise<void> => {
    if (tableArticleListRef.value) {
      await tableArticleListRef.value.batchPublish()
    }
  }

  /**
   * 批量删除
   */
  const handleBatchDelete = async (): Promise<void> => {
    if (tableArticleListRef.value) {
      await tableArticleListRef.value.batchDelete()
    }
  }

  // /**
  //  * 提交表单数据
  //  */
  // const handleSubmit = async (_formData: any): Promise<void> => {
  //   try {
  //     // 这里可以添加文章保存的逻辑
  //     refreshList()
  //     dialogVisible.value = false
  //   } catch (error) {
  //     ElMessage.error('操作失败，请重试')
  //     console.error('文章操作失败:', error)
  //   }
  // }
</script>

<style lang="scss" scoped>
  .search-bar {
    flex-shrink: 0;
    min-height: 70px; // 使用最小高度而不是固定高度
    margin-bottom: 16px; // 增加与表格的间距
  }
</style>
