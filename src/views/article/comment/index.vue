<!-- 评论管理页面 -->
<template>
  <div>
    <h1 class="text-4xl font-medium mt-5">评论管理</h1>
    <p class="mt-3.5 text-g-600">管理所有文章的评论，包括审核、删除等操作</p>

    <!-- 评论列表 -->
    <div class="mt-10 mb-5">
      <div class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-medium mb-5">评论列表</h2>

        <!-- 筛选和搜索 -->
        <div class="flex flex-wrap gap-4 mb-5">
          <ElSelect v-model="searchParams.status" placeholder="选择状态" clearable class="w-40">
            <ElOption label="待审核" value="pending" />
            <ElOption label="已通过" value="approved" />
            <ElOption label="已拒绝" value="rejected" />
          </ElSelect>
          <ElInput
            v-model="searchParams.keyword"
            placeholder="搜索评论内容"
            clearable
            class="w-60"
          />
          <ElButton type="primary" @click="fetchComments">搜索</ElButton>
          <ElButton @click="resetSearch">重置</ElButton>
        </div>

        <!-- 评论表格 -->
        <ElTable :data="comments" stripe class="w-full">
          <ElTableColumn prop="id" label="ID" width="80" />
          <ElTableColumn prop="articleId" label="文章ID" width="100" />
          <ElTableColumn prop="author" label="作者" width="120" />
          <ElTableColumn prop="content" label="内容" min-width="200">
            <template #default="scope">
              <div class="cursor-pointer" @click="openCommentDetail(scope.row)">
                {{ scope.row.content }}
                <span
                  v-if="scope.row.replies && scope.row.replies.length > 0"
                  class="ml-2 text-xs text-blue-500"
                >
                  查看回复 ({{ scope.row.replies.length }})
                </span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="status" label="状态" width="120">
            <template #default="scope">
              <ElTag :type="getStatusType(scope.row.status)">{{
                getStatusText(scope.row.status)
              }}</ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="timestamp" label="创建时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.timestamp) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="likeCount" label="点赞数" width="100" />
          <ElTableColumn label="操作" width="220" fixed="right">
            <template #default="scope">
              <div class="flex gap-2">
                <ElButton type="primary" size="small" @click="openCommentDetail(scope.row)"
                  >详情</ElButton
                >
                <ElButton
                  v-if="scope.row.status === 'pending'"
                  type="success"
                  size="small"
                  @click="approveComment(scope.row)"
                  >通过</ElButton
                >
                <ElButton
                  v-if="scope.row.status === 'pending'"
                  type="warning"
                  size="small"
                  @click="rejectComment(scope.row)"
                  >拒绝</ElButton
                >
                <ElButton type="danger" size="small" @click="deleteComment(scope.row)"
                  >删除</ElButton
                >
              </div>
            </template>
          </ElTableColumn>
        </ElTable>

        <!-- 分页 -->
        <div class="flex justify-end mt-5">
          <ElPagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 评论详情抽屉 -->
    <ElDrawer
      lDrawer
      v-model="showDrawer"
      :lock-scroll="false"
      :size="600"
      modal-class="comment-modal"
    >
      <template #header>
        <h4>评论详情</h4>
      </template>
      <template #default>
        <div class="drawer-default p-5">
          <div class="mb-5">
            <h3 class="text-lg font-medium mb-3">评论内容</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="flex items-center mb-3">
                <span class="text-sm font-medium mr-2">{{ commentDetail.author }}</span>
                <span class="text-xs text-gray-500">{{ formatDate(commentDetail.timestamp) }}</span>
              </div>
              <p>{{ commentDetail.content }}</p>
              <div class="mt-3 flex items-center">
                <ElTag :type="getStatusType(commentDetail.status)">{{
                  getStatusText(commentDetail.status)
                }}</ElTag>
                <span class="ml-3 text-xs text-gray-500"
                  >点赞数: {{ commentDetail.likeCount }}</span
                >
              </div>
            </div>
          </div>

          <!-- 嵌套回复 -->
          <div v-if="commentDetail.replies && commentDetail.replies.length > 0">
            <h3 class="text-lg font-medium mb-3">回复列表 ({{ commentDetail.replies.length }})</h3>
            <div class="space-y-3">
              <div
                v-for="reply in commentDetail.replies"
                :key="reply.id"
                class="pl-5 border-l-2 border-gray-200"
              >
                <div class="bg-gray-50 p-3 rounded-lg">
                  <div class="flex items-center mb-2">
                    <span class="text-sm font-medium mr-2">{{ reply.author }}</span>
                    <span class="text-xs text-gray-500">{{ formatDate(reply.timestamp) }}</span>
                  </div>
                  <p class="text-sm">{{ reply.content }}</p>
                  <div class="mt-2 flex items-center">
                    <ElTag :type="getStatusType(reply.status)" size="small">{{
                      getStatusText(reply.status)
                    }}</ElTag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { articleApi } from '@/api/article'
  import type { Comment } from '@/types/api/article'

  defineOptions({ name: 'ArticleComment' })

  // 评论列表数据
  const comments = ref<Comment[]>([])

  // 分页数据
  const pagination = ref({
    current: 1,
    size: 10,
    total: 0
  })

  // 搜索参数
  const searchParams = ref({
    status: '',
    keyword: ''
  })

  // 抽屉状态
  const showDrawer = ref(false)
  const commentDetail = ref<Comment>({
    id: 0,
    articleId: 0,
    content: '',
    parentId: 0,
    replyToUserId: null,
    likeCount: 0,
    status: 'pending',
    author: '',
    timestamp: '',
    replies: []
  })

  // 获取评论列表
  const fetchComments = async () => {
    try {
      const response = await articleApi.getAllComments({
        status: searchParams.value.status,
        keyword: searchParams.value.keyword,
        current: pagination.value.current,
        size: pagination.value.size
      })
      comments.value = response.records
      pagination.value.total = response.total
    } catch (error) {
      console.error('获取评论列表失败:', error)
      ElMessage.error('获取评论列表失败')
    }
  }

  // 格式化日期
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // 获取状态类型
  const getStatusType = (status: string) => {
    switch (status) {
      case 'pending':
        return 'info'
      case 'approved':
        return 'success'
      case 'rejected':
        return 'danger'
      default:
        return 'info'
    }
  }

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待审核'
      case 'approved':
        return '已通过'
      case 'rejected':
        return '已拒绝'
      default:
        return '未知状态'
    }
  }

  // 审核通过
  const approveComment = async (comment: Comment) => {
    try {
      await articleApi.updateCommentStatus(comment.id, 'approved')
      ElMessage.success('审核通过成功')
      fetchComments() // 刷新列表
    } catch (error) {
      console.error('审核通过失败:', error)
      ElMessage.error('审核通过失败')
    }
  }

  // 拒绝审核
  const rejectComment = async (comment: Comment) => {
    try {
      await articleApi.updateCommentStatus(comment.id, 'rejected')
      ElMessage.success('拒绝审核成功')
      fetchComments() // 刷新列表
    } catch (error) {
      console.error('拒绝审核失败:', error)
      ElMessage.error('拒绝审核失败')
    }
  }

  // 删除评论
  const deleteComment = async (comment: Comment) => {
    try {
      await articleApi.deleteComment(comment.id)
      ElMessage.success('删除评论成功')
      fetchComments() // 刷新列表
    } catch (error) {
      console.error('删除评论失败:', error)
      ElMessage.error('删除评论失败')
    }
  }

  // 打开评论详情抽屉
  const openCommentDetail = (comment: Comment) => {
    commentDetail.value = comment
    showDrawer.value = true
  }

  // 重置搜索
  const resetSearch = () => {
    searchParams.value = {
      status: '',
      keyword: ''
    }
    fetchComments()
  }

  // 分页大小变化
  const handleSizeChange = (size: number) => {
    pagination.value.size = size
    fetchComments()
  }

  // 当前页变化
  const handleCurrentChange = (current: number) => {
    pagination.value.current = current
    fetchComments()
  }

  // 组件挂载时获取评论列表
  onMounted(() => {
    fetchComments()
  })
</script>
