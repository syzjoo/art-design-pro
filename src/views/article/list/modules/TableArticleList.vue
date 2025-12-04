<template>
  <div class="w-full flex flex-col h-full" v-if="listType === 'list'">
    <ArtTable
      ref="tableRef"
      rowKey="id"
      :loading="loading"
      :columns="columns"
      :data="tableData"
      :stripe="false"
      :height="tableHeight"
    />
  </div>
  <div
    class="w-full flex flex-col"
    v-else-if="listType === 'card'"
    style="max-height: calc(100vh - 250px); overflow-y: auto"
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
            :src="item.home_img"
            lazy
            fit="cover"
          >
          </el-image>

          <div class="absolute top-1 right-1 flex flex-col items-end gap-1">
            <span class="bg-black/50 rounded text-xs px-1 py-0.5 text-white">{{
              item.type_name
            }}</span>
            <span
              v-if="item.top === 1"
              class="bg-warning/80 rounded text-xs px-1 py-0.5 text-white"
            >
              置顶
            </span>
            <span v-if="item.hot === 1" class="bg-danger/80 rounded text-xs px-1 py-0.5 text-white">
              热门
            </span>
          </div>

          <span
            v-if="item.category_name"
            class="absolute bottom-1 left-1 bg-black/50 rounded text-xs px-1 py-0.5 text-white"
          >
            {{ item.category_name }}
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
              <span class="text-sm">{{ useDateFormat(item.create_time, 'YYYY-MM-DD') }}</span>
              <div class="w-px h-3 bg-g-400 mx-3.5"></div>
              <span class="text-sm">{{ item.count }} 阅读</span>
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
  <!-- <div style="margin-top: 16vh" v-if="!tableData.length && !loading">
    <el-empty description="未找到相关数据" />
  </div> -->
</template>

<script setup lang="ts">
  import { ref, reactive, watch, h, computed } from 'vue'
  import { ElMessageBox, ElMessage, ElTag } from 'element-plus'
  import { useRouter } from 'vue-router'
  import { useDateFormat } from '@vueuse/core'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { useTableHeight } from '@/hooks/core/useTableHeight'

  // Props定义
  const props = defineProps<{
    listType: 'list' | 'card'
    searchParams: {
      searchVal: string | null
      yearVal: string
      category_id: number | null
      tag_id: number | null
      status: number | null
      top?: number | null
      hot?: number | null
    }
    loading?: boolean
  }>()

  const emit = defineEmits<{
    (e: 'refresh'): void
  }>()

  const router = useRouter()
  const tableRef = ref()

  // 文章接口定义
  export interface Article {
    id: number
    home_img: string
    type_name: string
    category_name?: string
    title: string
    create_time: string
    count: number
    author_name?: string
    status: number
    top: number
    hot: number
    tags?: Array<{ id: number; name: string }>
  }

  // 表格数据和分页
  const tableData = ref<Article[]>([])
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 表格高度计算
  const { containerHeight } = useTableHeight({
    showTableHeader: ref(true),
    paginationHeight: ref(60),
    tableHeaderHeight: ref(44),
    paginationSpacing: ref(12)
  })

  // 计算表格高度（使用useTableHeight返回的containerHeight并减去搜索栏高度、margin和padding）
  const tableHeight = computed(() => {
    // 搜索栏高度约为70px
    const searchBarHeight = 70
    // 额外的margin和padding值（增加分页器高度和间距）
    const additionalSpacing = 100 // 包括容器的margin、padding和分页器高度等
    return containerHeight
      ? `calc(${containerHeight}px - ${searchBarHeight + additionalSpacing}px)`
      : '100%'
  })

  // 模拟数据获取API函数
  const mockFetchArticleList = async () => {
    return new Promise<{
      items: Article[]
      total: number
    }>((resolve) => {
      setTimeout(() => {
        const {
          searchVal: keyword = '',
          category_id = null,
          tag_id = null,
          status = null,
          top = null,
          hot = null
        } = props.searchParams || {}

        // 模拟数据过滤
        // 标签数据
        const tagOptions = [
          'Vue',
          'React',
          'TypeScript',
          'Node.js',
          'CSS',
          'JavaScript',
          'HTML',
          'Python'
        ]

        let dataSource = Array.from({ length: 100 }, (_, i) => {
          // 随机选择1-3个标签
          const tagCount = Math.floor(Math.random() * 3) + 1
          const selectedTags: { id: number; name: string }[] = []
          for (let j = 0; j < tagCount; j++) {
            const tagIndex = Math.floor(Math.random() * tagOptions.length)
            selectedTags.push({
              id: tagIndex + 1,
              name: tagOptions[tagIndex]
            })
          }

          // 为前15篇文章随机设置置顶或热门，增加测试数据的多样性
          const isTopCandidate = i < 10
          const isHotCandidate = i < 15
          return {
            id: i + 1,
            home_img: `https://picsum.photos/400/250?random=${i}`,
            type_name: `文章类型${(i % 3) + 1}`,
            category_name: `文章分类${(i % 3) + 1}`,
            title: `文章标题${i + 1} - ${keyword || '全部文章'}`,
            create_time: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
            count: Math.floor(Math.random() * 1000) + 1,
            status: Math.floor(Math.random() * 2) + 1,
            top: isTopCandidate ? Math.floor(Math.random() * 2) : 0,
            hot: isHotCandidate ? Math.floor(Math.random() * 2) : 0,
            tags: selectedTags
          }
        })

        // 应用搜索过滤
        const filteredItems = dataSource.filter((item: Article) => {
          const matchKeyword = !keyword || item.title.includes(keyword)
          const matchCategory =
            category_id === null ||
            !category_id ||
            item.category_name?.includes(`文章分类${category_id}`)
          const matchTag =
            tag_id === null || !tag_id || (item.tags && item.tags.some((tag) => tag.id === tag_id))
          const matchStatus = status === null || !status || item.status === status
          const matchTop = top === null || !top || (top === 1 ? item.top === 1 : item.top === 0)
          const matchHot = hot === null || !hot || (hot === 1 ? item.hot === 1 : item.hot === 0)
          return matchKeyword && matchCategory && matchTag && matchStatus && matchTop && matchHot
        })

        // 分页
        const start = (pagination.current - 1) * pagination.size
        const end = start + pagination.size
        const paginatedItems = filteredItems.slice(start, end)

        resolve({
          items: paginatedItems,
          total: filteredItems.length
        })
      }, 500)
    })
  }

  // 表格列配置 - 参照菜单列表格式，但是针对文章数据
  const { columns } = useTableColumns(() => [
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
      formatter: (row: Article) => {
        const elements: any[] = []
        // 先添加置顶标签
        if (row.top === 1) {
          elements.push(
            h(
              ElTag,
              { type: 'warning' as any, size: 'small', style: { marginRight: '4px' } },
              () => '置顶'
            )
          )
        }
        // 添加热门标签
        if (row.hot === 1) {
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
              style: { color: '#409eff', cursor: 'pointer' },
              onClick: (e: Event) => {
                e.preventDefault()
                toDetail(row)
              }
            },
            row.title
          )
        )
        return h('div', { style: { display: 'flex', alignItems: 'center' } }, elements)
      }
    },
    {
      prop: 'category_name',
      label: '文章分类',
      width: 120,
      formatter: (row: Article) => {
        return h(ElTag, { type: 'primary' as any }, () => row.category_name || '未分类')
      }
    },
    {
      prop: 'type_name',
      label: '文章类型',
      width: 120,
      formatter: (row: Article) => {
        return h(ElTag, { type: 'info' as any }, () => row.type_name || '普通文章')
      }
    },
    {
      prop: 'tags',
      label: '文章标签',
      minWidth: 200,
      formatter: (row: Article) => {
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
      prop: 'count',
      label: '阅读量',
      width: 100,
      align: 'center'
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      formatter: (row: Article) => {
        const statusMap: Record<number, { type: string; text: string }> = {
          1: { type: 'success', text: '已发布' },
          2: { type: 'warning', text: '草稿' }
        }
        const statusInfo = statusMap[row.status]
        return h(ElTag, { type: statusInfo.type as any }, () => statusInfo.text)
      }
    },
    {
      prop: 'create_time',
      label: '创建时间',
      width: 150,
      formatter: (row: Article) => {
        return h('p', {}, row.create_time)
      }
    },
    {
      prop: 'operation',
      label: '操作',
      width: 280,
      align: 'right',
      fixed: 'right',
      formatter: (row: Article) => {
        const buttonStyle = { style: 'text-align: right' }
        return h('div', buttonStyle, [
          h(
            ArtButtonTable,
            {
              type: 'view' as any,
              onClick: () => toDetail(row)
            },
            '查看'
          ),
          h(
            ArtButtonTable,
            {
              type: 'edit' as any,
              onClick: () => toEdit(row)
            },
            '编辑'
          ),
          h(
            ArtButtonTable,
            {
              type: (row.top === 1 ? 'notTop' : 'top') as any,
              onClick: () => handleTop(row)
            },
            row.top === 1 ? '取消置顶' : '置顶'
          ),
          h(
            ArtButtonTable,
            {
              type: (row.hot === 1 ? 'notHot' : 'hot') as any,
              onClick: () => handleHot(row)
            },
            row.hot === 1 ? '取消热门' : '热门'
          ),
          h(
            ArtButtonTable,
            {
              type: 'delete' as any,
              onClick: () => deleteArticle(row)
            },
            '删除'
          )
        ])
      }
    }
  ])

  // 刷新数据方法
  const refreshData = async () => {
    try {
      const result = await mockFetchArticleList()
      tableData.value = result.items
      pagination.total = result.total
    } catch (error) {
      console.error('获取文章列表失败:', error)
      ElMessage.error('获取文章列表失败')
    }
  }

  // 跳转到编辑页面
  const toEdit = (row: Article) => {
    router.push({ name: 'ArticlePublish', query: { id: row.id.toString() } })
  }

  // 处理置顶状态切换
  const handleTop = (row: Article) => {
    const newTopStatus = row.top === 1 ? 0 : 1
    const title = newTopStatus === 1 ? '置顶' : '取消置顶'
    ElMessageBox.confirm(`确定要${title}此文章吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // 更新当前表格数据
      const tableItem = tableData.value.find((item: Article) => item.id === row.id)
      if (tableItem) {
        tableItem.top = newTopStatus
      }
      ElMessage.success(`${title}成功`)
      emit('refresh')
    })
  }

  // 处理热门状态切换
  const handleHot = (row: Article) => {
    const newHotStatus = row.hot === 1 ? 0 : 1
    const title = newHotStatus === 1 ? '设为热门' : '取消热门'
    ElMessageBox.confirm(`确定要${title}此文章吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // 更新当前表格数据
      const tableItem = tableData.value.find((item: Article) => item.id === row.id)
      if (tableItem) {
        tableItem.hot = newHotStatus
      }
      ElMessage.success(`${title}成功`)
      emit('refresh')
    })
  }

  // 删除文章
  const deleteArticle = async (row: Article) => {
    try {
      await ElMessageBox.confirm('确定要删除这篇文章吗？删除后将无法恢复！', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      // 模拟删除操作
      console.log('删除文章ID:', row.id)
      setTimeout(async () => {
        await refreshData()
        ElMessage.success('文章删除成功')
        emit('refresh')
      }, 300)
    } catch {
      // 用户取消删除
    }
  }

  // 跳转到详情页面
  const toDetail = (item: Article) => {
    router.push({ name: 'ArticleDetail', params: { id: item.id.toString() } })
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

  // 暴露刷新方法给父组件
  defineExpose({ refreshData })

  // 组件挂载时初始化数据
  refreshData()
</script>
