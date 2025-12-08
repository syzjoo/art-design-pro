<template>
  <div class="table-article-list-container" :style="props.style" :class="props.class">
    <div class="w-full flex flex-col" v-if="listType === 'list'">
      <div style="flex: 1; min-height: 0">
        <ArtTable
          ref="tableRef"
          rowKey="id"
          :loading="props.loading"
          :columns="getColumnsWithFormatters"
          :data="tableData"
          :stripe="false"
          :height="tableHeight"
          @selection-change="handleSelectionChange"
        />
      </div>
      <div
        style="display: flex; justify-content: center; margin-top: 20px"
        v-if="tableData.length || pagination.total > 0"
      >
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
    <div class="w-full flex flex-col" v-else-if="listType === 'card'">
      <div
        style="
          max-height: calc(100vh - 400px);
          margin-top: 10px;
          margin-bottom: 10px;
          overflow-y: auto;
        "
      >
        <div
          class="grid grid-cols-5 gap-5 max-2xl:grid-cols-4 max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1"
        >
          <div
            class="group c-p overflow-hidden border border-g-300/60 rounded-custom-sm"
            v-for="item in tableData"
            :key="item.id"
            @click="toDetail(item)"
          >
            <div class="relative aspect-[16/9.5]">
              <el-image
                class="flex align-center justify-center w-full h-full object-cover bg-gray-200"
                :src="item.coverImage"
                lazy
                fit="cover"
              >
              </el-image>

              <div class="absolute top-1 right-1 flex flex-col items-end gap-1">
                <span class="bg-black/50 rounded text-xs px-1 py-0.5 text-white">{{
                  item.articleTypeName
                }}</span>
                <span
                  v-if="item.isTop"
                  class="bg-warning/80 rounded text-xs px-1 py-0.5 text-white"
                >
                  置顶
                </span>
                <span v-if="item.isHot" class="bg-danger/80 rounded text-xs px-1 py-0.5 text-white">
                  热门
                </span>
              </div>

              <span
                v-if="item.categoryName"
                class="absolute bottom-1 left-1 bg-black/50 rounded text-xs px-1 py-0.5 text-white"
              >
                {{ item.categoryName }}
              </span>
            </div>
            <div class="px-2 py-1">
              <h2 class="text-base text-g-800 font-medium">{{ item.title }}</h2>

              <!-- 标签显示 -->
              <div v-if="item.tags && item.tags.length > 0" class="flex flex-wrap gap-1 mt-1">
                <el-tag
                  v-for="(tag, index) in item.tags.slice(0, 3)"
                  :key="tag.id"
                  size="small"
                  :type="['success', 'warning', 'info', 'danger', 'primary'][index % 5] as any"
                >
                  {{ tag.name }}
                </el-tag>
                <el-tag v-if="item.tags.length > 3" size="small" :type="'primary' as any">
                  +{{ item.tags.length - 3 }}
                </el-tag>
              </div>

              <div class="flex-b w-full h-6 mt-1">
                <div class="flex-c text-g-500">
                  <span class="text-sm">{{ useDateFormat(item.createTime, 'YYYY-MM-DD') }}</span>
                  <div class="w-px h-3 bg-g-400 mx-3.5"></div>
                  <span class="text-sm">{{ item.viewCount }} 阅读</span>
                </div>
                <el-button
                  class="opacity-0 group-hover:opacity-100"
                  size="small"
                  @click.stop="toEdit(item)"
                  :type="'primary' as any"
                >
                  编辑
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        style="display: flex; justify-content: center"
        v-if="tableData.length || pagination.total > 0"
      >
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
    <div class="empty-state" v-if="!tableData.length && !props.loading">
      <el-empty description="未找到相关数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, h, computed } from 'vue'
  import { ElMessageBox, ElMessage, ElTag } from 'element-plus'
  import { useRouter } from 'vue-router'
  import { useDateFormat } from '@vueuse/core'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { articleApi } from '@/api/article'
  import type {
    ArticleDetail,
    ArticleListItem,
    ArticleListQuery,
    ArticleListResponse
  } from '@/types/api/article'
  import type { ColumnOption } from '@/types/component'

  // Props定义
  const props = defineProps<{
    listType: 'list' | 'card'
    searchParams: {
      searchVal: string | null
      yearVal: string
      article_type_id?: number | null
      category_id: number | null
      tag_id: number | null
      status: string | null
      top?: number | null
      hot?: number | null
    }
    // 接收外部传入的列配置，用于列显隐控制
    columns?: any[]
    loading?: boolean
    // 接收外部传入的样式和类名
    style?: any
    class?: any
  }>()

  const emit = defineEmits<{
    (e: 'refresh'): void
    (e: 'selectionChange', selection: ArticleListItem[]): void
  }>()

  const router = useRouter()
  const tableRef = ref()

  // 表格数据和分页
  const tableData = ref<ArticleListItem[]>([])
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 选中的文章列表
  const selectedArticles = ref<ArticleListItem[]>([])

  // 计算表格高度（基于视口高度计算，确保分页器始终可见）
  const tableHeight = computed(() => {
    // 基于视口高度计算表格最大高度，预留足够空间给分页器
    return 'calc(100vh - 400px)' // 调整这个值来适应不同的布局需求
  })

  // 真实API获取文章列表
  const fetchArticleList = async (params?: ArticleListQuery) => {
    const {
      searchVal: keyword = '',
      yearVal = '',
      article_type_id = null,
      category_id = null,
      tag_id = null,
      status = null,
      top = null,
      hot = null
    } = props.searchParams || {}

    try {
      const queryParams = {
        keyword: keyword !== null ? keyword : undefined,
        yearVal,
        article_type_id,
        category_id,
        tag_id,
        status: status !== null ? status : undefined,
        top: top !== undefined && top !== null ? top === 1 : undefined,
        hot: hot !== undefined && hot !== null ? hot === 1 : undefined,
        page: pagination.current,
        pageSize: pagination.size,
        ...params
      }
      const res: ArticleListResponse = await articleApi.getArticleList(queryParams)

      return {
        items: res.list || [],
        total: res.total || 0
      }
    } catch (error) {
      console.error('获取文章列表失败:', error)
      ElMessage.error('获取文章列表失败')
      return {
        items: [],
        total: 0
      }
    }
  }

  // 表格列配置 - 参照菜单列表格式，但是针对文章数据
  const { columns: internalColumns } = useTableColumns(() => [
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
      minWidth: 350,
      formatter: (row: ArticleListItem) => {
        const elements: any[] = []
        // 先添加置顶标签
        if (row.isTop) {
          elements.push(
            h(
              ElTag,
              { type: 'warning' as any, size: 'small', style: { marginRight: '4px' } },
              () => '置顶'
            )
          )
        }
        // 添加热门标签
        if (row.isHot) {
          elements.push(
            h(
              ElTag,
              { type: 'danger' as any, size: 'small', style: { marginRight: '4px' } },
              () => '热门'
            )
          )
        }
        // 在标签后面添加标题链接
        elements.push(
          h(
            'a',
            {
              href: '#',
              style: {
                color: '#409eff',
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '250px'
              },
              onClick: (e: Event) => {
                e.preventDefault()
                toDetail(row)
              }
            },
            row.title
          )
        )
        return h(
          'div',
          { style: { display: 'flex', alignItems: 'center', flexWrap: 'wrap' } },
          elements
        )
      }
    },
    {
      prop: 'categoryName',
      label: '文章分类',
      width: 120,
      formatter: (row: ArticleDetail) => {
        return h(ElTag, { type: 'primary' as any }, () => row.categoryName || '未分类')
      }
    },
    {
      prop: 'articleTypeName',
      label: '文章类型',
      width: 120,
      formatter: (row: ArticleDetail) => {
        return h(ElTag, { type: 'info' as any }, () => row.articleTypeName || '普通文章')
      }
    },
    {
      prop: 'tags',
      label: '文章标签',
      minWidth: 200,
      formatter: (row: ArticleDetail) => {
        if (!row.tags || row.tags.length === 0) {
          return h(ElTag, { type: 'primary' as any }, () => '无标签')
        }

        const colors = ['success', 'warning', 'info', 'danger', 'primary']
        return h(
          'div',
          { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' } },
          row.tags.map((tag, index) => {
            const colorIndex = index % colors.length
            return h(ElTag, { type: colors[colorIndex] as any, size: 'small' }, () => tag.name)
          })
        )
      }
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
      width: 100,
      formatter: (row: ArticleDetail) => {
        const statusMap: Record<string, { type: string; text: string }> = {
          published: { type: 'success', text: '已发布' },
          draft: { type: 'warning', text: '草稿' }
        }
        const statusInfo = statusMap[row.status] || { type: 'info', text: '未知状态' }
        return h(ElTag, { type: statusInfo.type as any }, () => statusInfo.text)
      }
    },
    {
      prop: 'createTime',
      label: '创建时间',
      width: 150,
      formatter: (row: ArticleDetail) => {
        return h('p', {}, row.createTime)
      }
    },
    {
      prop: 'operation',
      label: '操作',
      width: 280,
      align: 'right',
      fixed: 'right',
      formatter: (row: ArticleDetail) => {
        const buttonStyle = { style: 'text-align: right' }
        return h('div', buttonStyle, [
          h(
            ArtButtonTable,
            {
              type: 'view' as any,
              onClick: () => toDetail(row)
            },
            () => '查看'
          ),
          h(
            ArtButtonTable,
            {
              type: 'edit' as any,
              onClick: () => toEdit(row)
            },
            () => '编辑'
          ),
          h(
            ArtButtonTable,
            {
              type: (row.isTop ? 'notTop' : 'top') as any,
              onClick: () => handleTop(row)
            },
            () => (row.isTop ? '取消置顶' : '置顶')
          ),
          h(
            ArtButtonTable,
            {
              type: (row.isHot ? 'notHot' : 'hot') as any,
              onClick: () => handleHot(row)
            },
            () => (row.isHot ? '取消热门' : '热门')
          ),
          h(
            ArtButtonTable,
            {
              type: 'delete' as any,
              onClick: () => deleteArticle(row)
            },
            () => '删除'
          )
        ])
      }
    }
  ])

  // 刷新数据方法
  const refreshData = async () => {
    try {
      const result = await fetchArticleList()
      tableData.value = result.items
      pagination.total = result.total
    } catch (error) {
      console.error('获取文章列表失败:', error)
      ElMessage.error('获取文章列表失败')
    }
  }

  // 跳转到编辑页面
  const toEdit = (row: ArticleListItem) => {
    router.push({ name: 'ArticlePublish', query: { id: row.id.toString() } })
  }

  // 处理置顶状态切换
  const handleTop = async (row: ArticleListItem) => {
    const newTopStatus = !row.isTop
    const title = newTopStatus ? '置顶' : '取消置顶'

    try {
      await ElMessageBox.confirm(`确定要${title}此文章吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      // 调用真实API
      await articleApi.setArticleTop(row.id, newTopStatus)

      // 更新当前表格数据
      const tableItem = tableData.value.find((item: ArticleListItem) => item.id === row.id)
      if (tableItem) {
        tableItem.isTop = newTopStatus
      }

      ElMessage.success(`${title}成功`)
      emit('refresh')
    } catch (error) {
      if (error !== 'cancel') {
        console.error(`${title}失败:`, error)
        ElMessage.error(`${title}失败，请重试`)
      }
    }
  }

  // 处理热门状态切换
  const handleHot = async (row: ArticleListItem) => {
    const newHotStatus = !row.isHot
    const title = newHotStatus ? '设为热门' : '取消热门'

    try {
      await ElMessageBox.confirm(`确定要${title}此文章吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      // 调用真实API
      await articleApi.setArticleHot(row.id, newHotStatus)

      // 更新当前表格数据
      const tableItem = tableData.value.find((item: ArticleListItem) => item.id === row.id)
      if (tableItem) {
        tableItem.isHot = newHotStatus
      }

      ElMessage.success(`${title}成功`)
      emit('refresh')
    } catch (error) {
      if (error !== 'cancel') {
        console.error(`${title}失败:`, error)
        ElMessage.error(`${title}失败，请重试`)
      }
    }
  }

  // 删除文章
  const deleteArticle = async (row: ArticleListItem) => {
    try {
      await ElMessageBox.confirm('确定要删除这篇文章吗？删除后将无法恢复！', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      // 调用真实API
      await articleApi.deleteArticle(row.id)

      await refreshData()
      ElMessage.success('文章删除成功')
      emit('refresh')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除文章失败:', error)
        ElMessage.error('删除文章失败，请重试')
      }
    }
  }

  // 跳转到详情页面
  const toDetail = (item: ArticleListItem) => {
    router.push({ name: 'ArticleDetail', params: { id: item.id.toString() } })
  }

  // 处理表格行选择
  const handleSelectionChange = (selection: ArticleListItem[]) => {
    selectedArticles.value = selection
    // 向父组件发送选中的文章列表
    emit('selectionChange', selection)
  }

  // 批量删除文章
  const batchDelete = async () => {
    if (selectedArticles.value.length === 0) {
      ElMessage.warning('请先选择要删除的文章')
      return
    }

    try {
      await ElMessageBox.confirm('确定要删除选中的文章吗？删除后将无法恢复！', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      // 调用真实API
      const ids = selectedArticles.value.map((article) => article.id)
      await articleApi.batchDeleteArticles(ids)

      await refreshData()
      ElMessage.success('批量删除成功')
      emit('refresh')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量删除失败:', error)
        ElMessage.error('批量删除失败，请重试')
      }
    }
  }

  // 批量发布文章
  const batchPublish = async () => {
    if (selectedArticles.value.length === 0) {
      ElMessage.warning('请先选择要发布的文章')
      return
    }

    try {
      await ElMessageBox.confirm('确定要发布选中的文章吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      })

      // 调用真实API
      const ids = selectedArticles.value.map((article) => article.id)
      await articleApi.batchPublishArticles(ids)

      await refreshData()
      ElMessage.success('批量发布成功')
      emit('refresh')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量发布失败:', error)
        ElMessage.error('批量发布失败，请重试')
      }
    }
  }

  // 合并父组件传递的columns和内部的formatter函数
  const getColumnsWithFormatters = computed(() => {
    if (!props.columns) {
      return internalColumns.value
    }

    // 创建内部列的formatter映射
    const formatterMap = new Map()
    internalColumns.value.forEach((col: ColumnOption) => {
      if (col.formatter) {
        formatterMap.set(col.prop, col.formatter)
      }
    })

    // 合并父组件传递的columns和内部的formatter
    return props.columns.map((col: ColumnOption) => {
      const formatter = formatterMap.get(col.prop)
      return formatter ? { ...col, formatter } : col
    })
  })

  // 暴露表格列配置、刷新方法和批量操作方法给父组件
  defineExpose({
    columns: getColumnsWithFormatters,
    refreshData,
    batchDelete,
    batchPublish
  })

  // 分页处理
  const handleSizeChange = (size: number) => {
    pagination.size = size
    refreshData()
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
    refreshData()
  }

  // 监听搜索参数变化，重新获取数据
  watch(
    () => props.searchParams,
    () => {
      pagination.current = 1 // 重置到第一页
      refreshData()
    },
    { deep: true }
  )

  // 监听列表类型变化，重新获取数据
  watch(
    () => props.listType,
    () => {
      refreshData()
    }
  )

  // 组件挂载时初始化数据
  refreshData()
</script>

<style lang="scss" scoped>
  // 空状态样式
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px; // 确保有足够的高度
    margin-top: 20px;
  }

  // 卡片列表样式优化
  .grid {
    gap: 20px !important;
  }

  // 卡片样式优化
  .group {
    box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 5px 15px rgb(0 0 0 / 15%);
      transform: translateY(-5px);
    }
  }

  // 分页器样式优化
  :deep(.el-pagination) {
    margin-top: 3px;
  }
</style>
