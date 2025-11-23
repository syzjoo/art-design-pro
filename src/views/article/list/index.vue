<!-- 文章列表页面 -->
<template>
  <div class="article-page art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      v-model="formFilters"
      :items="formItems"
      :showExpand="false"
      @reset="handleReset"
      @search="handleSearch"
    />

    <ElCard class="art-table-card" shadow="never">
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
    category_id: 0,
    tag_id: 0,
    status: 0
  }

  const formFilters = reactive({ ...initialSearchState })
  const appliedFilters = reactive({ ...initialSearchState })

  // 分类和标签数据
  const categoryList = ref([
    { id: 1, name: '前端开发' },
    { id: 2, name: '后端开发' },
    { id: 3, name: '人工智能' }
  ])
  const tagList = ref([
    { id: 1, name: 'Vue' },
    { id: 2, name: 'React' },
    { id: 3, name: 'TypeScript' },
    { id: 4, name: 'Node.js' },
    { id: 5, name: 'CSS' }
  ])

  const formItems = computed(() => [
    {
      label: '',
      key: 'keyword',
      type: 'input',
      placeholder: '搜索文章标题或关键词',
      clearable: true
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
        { value: 0, label: '全部状态' },
        { value: 1, label: '已发布' },
        { value: 2, label: '草稿' }
      ]
    }
  ])

  // 计算属性 - 搜索参数
  const searchParams = computed(() => ({
    searchVal: appliedFilters.keyword || null,
    yearVal: '',
    category_id: appliedFilters.category_id === 0 ? null : appliedFilters.category_id,
    tag_id: appliedFilters.tag_id === 0 ? null : appliedFilters.tag_id,
    status: appliedFilters.status === 0 ? null : appliedFilters.status
  }))

  // 表格列配置 - 使用和菜单列表相同的方式定义
  const { columnChecks } = useTableColumns(() => [])

  // 路由
  const router = useRouter()

  onMounted(() => {
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
  const handleBatchPublish = (): void => {
    ElMessage.success('批量发布功能开发中')
  }

  /**
   * 批量删除
   */
  const handleBatchDelete = (): void => {
    ElMessage.success('批量删除功能开发中')
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

<style lang="scss" scoped></style>
