<template>
  <div class="w-full" v-if="listType === 'list'">
    <ArtTable
      ref="tableRef"
      rowKey="id"
      :loading="loading"
      :columns="columns"
      :data="tableData"
      :stripe="false"
      height="500"
      style="overflow-y: auto"
    />
    <!-- <div style="display: flex; justify-content: center; margin-top: 20px">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div> -->
  </div>
  <div class="mt-5" v-else-if="listType === 'card'" style="height: 500px; overflow-y: auto">
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

          <span class="absolute top-1 right-1 bg-black/50 rounded text-xs px-1 py-0.5 text-white">{{
            item.type_name
          }}</span>
        </div>
        <div class="px-2 py-1">
          <h2 class="text-base text-g-800 font-medium">{{ item.title }}</h2>
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
              type="primary"
            >
              编辑
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div style="display: flex; justify-content: center; margin-top: 20px">
    <!-- //:page-sizes="[10, 20, 50, 100]" -->
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
  <div style="margin-top: 16vh" v-if="!tableData.length && !loading">
    <el-empty description="未找到相关数据" />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, h } from 'vue'
  import { ElMessageBox, ElMessage, ElTag } from 'element-plus'
  import { useRouter } from 'vue-router'
  import { useDateFormat } from '@vueuse/core'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'

  // Props定义
  const props = defineProps<{
    listType: 'list' | 'card'
    searchParams: {
      searchVal: string | null
      yearVal: string
      category_id: number | null
      tag_id: number | null
      status: number | null
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
    title: string
    create_time: string
    count: number
    author_name?: string
    status: number
  }

  // 表格数据和分页
  const tableData = ref<Article[]>([])
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 模拟数据获取API函数
  const mockFetchArticleList = async () => {
    return new Promise<{
      items: Article[]
      total: number
    }>((resolve) => {
      setTimeout(() => {
        const { searchVal, category_id, status } = props.searchParams // 不使用tag_id参数

        // 模拟数据过滤
        let filteredItems = Array.from({ length: 100 }, (_, i) => ({
          id: i + 1,
          home_img: `https://picsum.photos/400/250?random=${i}`,
          type_name: `分类${(i % 3) + 1}`,
          title: `文章标题${i + 1} - ${searchVal || '全部文章'}`,
          create_time: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
          count: Math.floor(Math.random() * 1000) + 1,
          status: Math.floor(Math.random() * 2) + 1
        }))

        // 应用搜索过滤
        if (searchVal) {
          filteredItems = filteredItems.filter((item) =>
            item.title.toLowerCase().includes(searchVal.toLowerCase())
          )
        }
        if (category_id) {
          filteredItems = filteredItems.filter((item) => item.type_name === `分类${category_id}`)
        }
        if (status) {
          filteredItems = filteredItems.filter((item) => item.status === status)
        }

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
      align: 'center'
    },
    {
      prop: 'title',
      label: '文章标题',
      minWidth: 300,
      formatter: (row: Article) => {
        return h(
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
      }
    },
    {
      prop: 'type_name',
      label: '文章分类',
      width: 120,
      formatter: (row: Article) => {
        return h(ElTag, { type: 'primary' }, () => row.type_name)
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
      width: 180,
      align: 'right',
      formatter: (row: Article) => {
        const buttonStyle = { style: 'text-align: right' }

        return h('div', buttonStyle, [
          h(ArtButtonTable, {
            type: 'view',
            onClick: () => toDetail(row)
          }),
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => toEdit(row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => deleteArticle(row)
          })
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
