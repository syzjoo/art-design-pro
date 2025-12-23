<!-- 留言管理页面 -->
<template>
  <div class="article-comment">
    <div class="flex justify-between items-center mt-5">
      <div>
        <h2 class="text-xl font-bold">评论管理</h2>
        <p class="mt-1 text-g-600">管理所有评论，确保内容合规</p>
      </div>
      <ElButton type="primary" @click="refreshComments">
        <el-icon><Refresh /></el-icon>
        刷新
      </ElButton>
    </div>

    <!-- 评论统计数据 -->
    <div class="mt-5 grid grid-cols-4 gap-4 max-md:grid-cols-2">
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500 mb-1">评论总数</p>
        <p class="text-2xl font-semibold">{{ commentStats.totalComments }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500 mb-1">已通过</p>
        <p class="text-2xl font-semibold text-green-600">{{ commentStats.approvedComments }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500 mb-1">待审核</p>
        <p class="text-2xl font-semibold text-yellow-600">{{ commentStats.pendingComments }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500 mb-1">已拒绝</p>
        <p class="text-2xl font-semibold text-red-600">{{ commentStats.rejectedComments }}</p>
      </div>
    </div>

    <!-- 评论筛选和搜索 -->
    <div class="mt-5 flex justify-between items-center">
      <!-- 左侧：搜索框 -->
      <div>
        <ElInput
          v-model="searchKeyword"
          placeholder="搜索评论"
          clearable
          size="default"
          class="w-48"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <ElButton size="default" @click="handleSearch">
              <el-icon><Search /></el-icon>
            </ElButton>
          </template>
        </ElInput>
      </div>

      <!-- 右侧：日期筛选和状态切换 -->
      <div class="flex items-center gap-2">
        <!-- 日期筛选 -->
        <ElDatePicker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="default"
          @change="handleSearch"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />

        <!-- 视图切换 -->
        <ElRadioGroup v-model="activeView" size="default">
          <ElRadioButton label="all">全部</ElRadioButton>
          <ElRadioButton label="pending">待审核</ElRadioButton>
          <ElRadioButton label="approved">已通过</ElRadioButton>
          <ElRadioButton label="rejected">已拒绝</ElRadioButton>
        </ElRadioGroup>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="mt-10 mb-5">
      <!-- 空状态 -->
      <div
        v-if="filteredComments.length === 0"
        class="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-100"
      >
        <el-icon class="text-4xl text-g-400 mb-3"><DocumentRemove /></el-icon>
        <p class="text-g-600">没有找到符合条件的评论</p>
        <ElButton type="primary" size="small" class="mt-3" @click="resetFilters">
          重置筛选条件
        </ElButton>
      </div>

      <!-- 评论卡片列表 -->
      <ul
        v-else
        class="grid grid-cols-5 gap-5 max-2xl:grid-cols-4 max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1"
      >
        <li
          class="relative p-4 c-p aspect-16/12 duration-300 hover:-translate-y-1.5"
          :style="{ background: comment.color }"
          v-for="comment in filteredComments"
          :key="comment.id"
          @click="openDrawer(comment)"
        >
          <!-- 待审核和时间在同一行 -->
          <div class="flex justify-between items-center mb-1">
            <p class="text-g-600 text-xs truncate">{{
              new Date(comment.timestamp).toLocaleDateString()
            }}</p>
            <span
              class="text-xs font-medium px-3 py-1 rounded-full text-white"
              :style="{
                backgroundColor:
                  comment.status === 'pending'
                    ? '#F59E0B'
                    : comment.status === 'approved'
                      ? '#10B981'
                      : '#EF4444',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }"
            >
              {{
                comment.status === 'pending'
                  ? '待审核'
                  : comment.status === 'approved'
                    ? '已通过'
                    : '已拒绝'
              }}
            </span>
          </div>
          <p class="mt-2 text-sm text-gray-800 line-clamp-2" v-html="comment.content"></p>
          <div class="absolute bottom-4 left-0 px-4 flex-col items-end w-full">
            <!-- 文章名称显示在评论人上面，前面加—— -->
            <p class="text-xs text-g-600 mb-1">—— {{ comment.articleTitle }}</p>
            <div class="flex-cb w-full">
              <div class="flex-c">
                <div class="flex-c mr-5 text-xs text-g-600">
                  <ArtSvgIcon icon="ri:heart-line" class="mr-1 text-base" />
                  <span>{{ comment.likeCount }}</span>
                </div>
              </div>
              <div>
                <span class="text-sm text-gray-700">{{
                  comment.creator?.nickname || comment.author
                }}</span>
              </div>
            </div>
          </div>
        </li>
      </ul>

      <ElDrawer v-model="showDrawer" :lock-scroll="false" :size="360" modal-class="comment-modal">
        <template #header>
          <h4>评论详情</h4>
        </template>
        <template #default>
          <div class="drawer-default">
            <!-- 当前评论详情 -->
            <div class="relative p-4 aspect-16/12" :style="{ background: clickComment.color }">
              <!-- 只显示时间，取消状态显示 -->
              <p class="text-g-500 text-xs truncate">{{
                new Date(clickComment.timestamp).toLocaleDateString()
              }}</p>
              <p class="mt-2 text-sm text-gray-800 line-clamp-2" v-html="clickComment.content"></p>
              <div class="absolute bottom-4 left-0 px-4 flex-col items-end w-full">
                <!-- 文章名称显示在评论人上面，前面加——，并添加链接 -->
                <a
                  href="javascript:void(0)"
                  class="text-xs text-g-600 mb-1 hover:underline"
                  @click="goToArticleDetail()"
                >
                  —— {{ clickComment.articleTitle }}
                </a>
                <div class="flex-cb w-full">
                  <div class="flex-c">
                    <div class="flex-c mr-5 text-xs text-g-600">
                      <ArtSvgIcon icon="ri:heart-line" class="mr-1 text-base" />
                      <span>{{ clickComment.likeCount }}</span>
                    </div>
                  </div>
                  <div>
                    <span class="text-sm text-gray-700">{{
                      clickComment.creator?.nickname || clickComment.author
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 当前评论状态 -->
            <div class="mt-4 mb-2">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-sm font-medium">评论状态</span>
                <span
                  class="text-xs font-medium px-3 py-1 rounded-full text-white"
                  :style="{
                    backgroundColor:
                      clickComment.status === 'pending'
                        ? '#F59E0B'
                        : clickComment.status === 'approved'
                          ? '#10B981'
                          : '#EF4444',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }"
                >
                  {{
                    clickComment.status === 'pending'
                      ? '待审核'
                      : clickComment.status === 'approved'
                        ? '已通过'
                        : '已拒绝'
                  }}
                </span>
              </div>
              <!-- 操作按钮 - 单独一行显示，左起对齐 -->
              <div class="flex items-center mt-2">
                <span class="text-sm font-medium mr-2">操作：</span>
                <!-- 审核按钮 - 待审核状态显示 -->
                <div v-if="clickComment.status === 'pending'" class="flex space-x-2">
                  <ElButton type="primary" size="small" @click="approveComment('approved')">
                    通过
                  </ElButton>
                  <ElButton type="warning" size="small" @click="showRejectReason = true">
                    拒绝
                  </ElButton>
                </div>
                <!-- 取消拒绝和删除按钮 - 已拒绝状态显示 -->
                <div v-else-if="clickComment.status === 'rejected'" class="flex space-x-2">
                  <ElButton type="primary" size="small" @click="cancelReject()"> 取消 </ElButton>
                  <ElButton type="danger" size="small" @click="deleteComment()"> 删除 </ElButton>
                </div>
              </div>
              <!-- 拒绝理由 - 已拒绝状态显示 -->
              <div
                v-if="clickComment.status === 'rejected' && clickComment.rejectReason"
                class="mt-2"
              >
                <div class="flex items-start">
                  <span class="text-sm font-medium text-gray-600 mr-2">拒绝理由：</span>
                  <span class="text-sm text-gray-800">{{ clickComment.rejectReason }}</span>
                </div>
              </div>
            </div>

            <!-- 回复操作或拒绝原因 - 已拒绝状态时不显示 -->
            <div v-if="clickComment.status !== 'rejected'" class="mb-6">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium">{{
                  showRejectReason ? '拒绝原因' : '回复评论'
                }}</span>
              </div>
              <ElInput
                v-model="replyContent"
                type="textarea"
                :placeholder="showRejectReason ? '请输入拒绝原因' : '请输入回复内容'"
                :rows="2"
                resize="none"
                class="mb-3"
              />
              <div class="flex justify-end">
                <template v-if="showRejectReason">
                  <ElButton size="small" @click="showRejectReason = false">取消</ElButton>
                  <ElButton type="danger" size="small" class="ml-2" @click="confirmReject()"
                    >确认拒绝</ElButton
                  >
                </template>
                <template v-else>
                  <ElButton type="primary" size="small">回复</ElButton>
                </template>
              </div>
            </div>

            <!-- 该文章的所有评论 -->
            <div class="mt-6">
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium">该文章的所有评论</span>
              </div>
              <ul class="space-y-5">
                <li v-for="comment in articleComments" :key="comment.id">
                  <div>
                    <div class="flex items-center">
                      <div
                        class="size-5 mr-2.5 text-xs font-medium text-white rounded-full flex items-center justify-center"
                        :style="{ background: randomColor() }"
                      >
                        {{
                          comment.creator?.nickname || comment.author
                            ? (comment.creator?.nickname || comment.author).substring(0, 1)
                            : '未'
                        }}
                      </div>
                      <strong class="block text-sm font-medium">{{
                        comment.creator?.nickname || comment.author || '未知用户'
                      }}</strong>
                    </div>
                    <span class="block mt-2.5 text-sm text-g-700" v-html="comment.content"></span>
                    <div class="flex items-center mt-2.5">
                      <span class="text-xs text-g-700">{{ formatDate(comment.timestamp) }}</span>
                      <div
                        class="ml-5 text-xs text-g-700 c-p select-none hover:text-theme"
                        @click="toggleReply(comment.id)"
                      >
                        回复
                      </div>
                    </div>
                  </div>

                  <!-- 回复表单 -->
                  <ElForm
                    v-if="showReplyForm === comment.id"
                    @submit.prevent="handleSubmit(comment.id)"
                    class="mt-4"
                  >
                    <ElFormItem prop="content">
                      <ElInput
                        v-model="replyContent"
                        placeholder="你的回复..."
                        type="textarea"
                        :rows="3"
                        clearable
                      />
                    </ElFormItem>
                    <ElFormItem>
                      <div class="flex justify-end gap-2 w-full">
                        <ElButton @click="toggleReply(null)">取消</ElButton>
                        <ElButton type="primary" @click="handleSubmit(comment.id)">发布</ElButton>
                      </div>
                    </ElFormItem>
                  </ElForm>

                  <!-- 回复列表 -->
                  <ul
                    class="pl-7 border-l-2 border-gray-100"
                    v-if="comment.replies && comment.replies.length > 0"
                  >
                    <li
                      v-for="reply in comment.replies"
                      :key="reply.id"
                      class="mt-5 bg-gray-50 p-3 rounded-lg"
                    >
                      <div>
                        <div class="flex items-center">
                          <div
                            class="size-5 mr-2.5 text-xs font-medium text-white rounded-full flex items-center justify-center"
                            :style="{ background: randomColor() }"
                          >
                            {{ reply.author ? reply.author.substring(0, 1) : '未' }}
                          </div>
                          <strong class="block text-sm font-medium">{{
                            reply.author || '未知用户'
                          }}</strong>
                        </div>
                        <span class="block mt-2.5 text-sm text-g-700" v-html="reply.content"></span>
                        <div class="flex items-center mt-2.5">
                          <span class="text-xs text-g-700">{{ formatDate(reply.timestamp) }}</span>
                          <div
                            class="ml-5 text-xs text-g-700 c-p select-none hover:text-theme"
                            @click="toggleReply(reply.id, comment.id)"
                          >
                            回复
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </template>
      </ElDrawer>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { Refresh, Search, DocumentRemove } from '@element-plus/icons-vue'
  import { articleApi } from '@/api/article'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { showError, HttpError } from '@/utils/http/error'
  import { ApiStatus } from '@/utils/http/status'
  import type { ArticleCommentStats, Comment, CommentCreateParams } from '@/types/api/article'
  import AppConfig from '@/config'

  // 格式化日期
  const formatDate = (timestamp: string) => {
    if (!timestamp) return ''
    // 处理YYYY-MM-DD HH:mm:ss格式，将空格替换为'T'以确保正确解析
    const formattedTimestamp = timestamp.replace(/\s+/g, 'T')
    const date = new Date(formattedTimestamp)
    return isNaN(date.getTime()) ? '' : date.toLocaleString()
  }

  // 随机生成颜色
  let lastColor: string | null = null
  const randomColor = () => {
    let newColor: string
    do {
      const index = Math.floor(Math.random() * AppConfig.systemMainColor.length)
      // 确保newColor始终是字符串，添加默认值处理
      newColor = AppConfig.systemMainColor[index] || '#1890ff'
    } while (newColor === lastColor)
    lastColor = newColor
    return newColor
  }

  defineOptions({ name: 'ArticleComment' })

  const COLOR_LIST = ['#D8F8FF', '#FDDFD9', '#FCE6F0', '#D3F8F0', '#FFEABC', '#F5E1FF', '#E1E6FE']

  const showDrawer = ref(false)
  const pendingComments = ref<
    (Comment & { articleTitle: string; articleAuthor: string; color: string })[]
  >([])

  // 评论统计数据
  const commentStats = ref({
    totalComments: 0,
    approvedComments: 0,
    pendingComments: 0,
    rejectedComments: 0,
    hotComments: 0
  })

  const clickComment = ref<
    Comment & { articleTitle: string; articleAuthor: string; color: string }
  >({
    id: 1,
    articleId: 1,
    content: '加油！学好Node 自己写个小Demo',
    parentId: 0,
    replyToUserId: null,
    likeCount: 0,
    status: 'pending',
    author: '匿名',
    timestamp: '2024-09-03 10:30:00',
    replies: [],
    articleTitle: '示例文章',
    articleAuthor: '管理员',
    color: COLOR_LIST[0]
  })
  const articleComments = ref<Comment[]>([])

  // 回复功能相关状态
  const showReplyForm = ref<number | null>(null)
  const replyContent = ref('')
  const parentCommentId = ref<number | null>(null)
  // 拒绝原因相关状态
  const showRejectReason = ref(false)

  // 筛选和搜索相关状态
  const activeView = ref<'all' | 'pending' | 'approved' | 'rejected'>('pending') // 当前视图：all, pending, approved, rejected
  const searchKeyword = ref('') // 搜索关键词
  const dateRange = ref<[string, string] | null>(null) // 日期范围
  const allComments = ref<
    (Comment & { articleTitle: string; articleAuthor: string; color: string })[]
  >([]) // 所有评论
  const filteredComments = ref<
    (Comment & { articleTitle: string; articleAuthor: string; color: string })[]
  >([]) // 筛选后的评论

  /**
   * 获取所有评论
   */
  const fetchComments = async () => {
    try {
      // 使用真实API
      // 先获取文章评论统计数据，包含文章标题和作者信息
      const statsRes = await articleApi.getArticleCommentStats()
      const articleStatsMap = new Map<number, ArticleCommentStats>()
      statsRes.records.forEach((stat) => {
        articleStatsMap.set(stat.articleId, stat)
      })

      // 获取所有评论 - 注意：这里应该获取所有评论，而不是只获取当前状态的评论
      // 然后在前端进行筛选，这样切换视图时就不需要重新请求API
      const commentsRes = await articleApi.getAllComments({
        page: 1,
        pageSize: 100, // 设置一个较大的值以获取所有评论
        status: 'all', // 获取所有状态的评论
        keyword: '' // 不使用搜索关键词
        // 不传递startTime和endTime，使用默认值undefined
      })

      // 为每条评论添加文章信息和颜色
      const commentsList = commentsRes.records.map((comment, index) => {
        const articleStat = articleStatsMap.get(comment.articleId)
        return {
          ...comment,
          articleTitle: articleStat?.articleTitle || '未知文章',
          articleAuthor: articleStat?.articleAuthor || '未知作者',
          color: COLOR_LIST[index % COLOR_LIST.length]
        }
      })

      allComments.value = commentsList
      pendingComments.value = commentsList.filter((comment) => comment.status === 'pending')
      filteredComments.value = commentsList.filter((comment) => comment.status === activeView.value)

      // 更新统计数据
      updateCommentStats()
    } catch (error) {
      console.error('获取评论列表失败:', error)
      if (error instanceof HttpError) {
        showError(error)
      } else {
        showError(new HttpError('获取评论列表失败', ApiStatus.error))
      }
    }
  }

  /**
   * 刷新评论列表
   */
  const refreshComments = async () => {
    await fetchComments()
  }

  /**
   * 处理搜索
   */
  const handleSearch = () => {
    filterComments()
  }

  /**
   * 筛选评论
   */
  const filterComments = () => {
    let result = [...allComments.value]

    // 按视图筛选
    if (activeView.value !== 'all') {
      result = result.filter((comment) => comment.status === activeView.value)
    }

    // 按关键词搜索
    if (searchKeyword.value.trim()) {
      const keyword = searchKeyword.value.trim().toLowerCase()
      result = result.filter(
        (comment) =>
          comment.content.toLowerCase().includes(keyword) ||
          comment.author.toLowerCase().includes(keyword) ||
          comment.articleTitle.toLowerCase().includes(keyword)
      )
    }

    // 按日期范围筛选
    if (dateRange.value && dateRange.value.length === 2) {
      const startDate = new Date(dateRange.value[0])
      const endDate = new Date(dateRange.value[1])
      endDate.setHours(23, 59, 59, 999)

      result = result.filter((comment) => {
        const commentDate = new Date(comment.timestamp)
        return commentDate >= startDate && commentDate <= endDate
      })
    }

    filteredComments.value = result
  }

  /**
   * 监听视图切换
   */
  watch(activeView, () => {
    filterComments()
  })

  /**
   * 重置筛选条件
   */
  const resetFilters = () => {
    searchKeyword.value = ''
    dateRange.value = null
    activeView.value = 'pending'
    filterComments()
  }

  /**
   * 打开评论详情抽屉
   */
  const openDrawer = async (
    comment: Comment & { articleTitle: string; articleAuthor: string; color: string }
  ) => {
    showDrawer.value = true
    clickComment.value = comment
    // 重置拒绝原因状态
    showRejectReason.value = false
    // 清空回复内容
    replyContent.value = ''

    try {
      // 使用真实API获取文章评论
      const response = await articleApi.getArticleComments(comment.articleId)
      articleComments.value = response.records || []
    } catch (error) {
      console.error('获取文章评论失败:', error)
      if (error instanceof HttpError) {
        showError(error)
      } else {
        showError(new HttpError('获取文章评论失败', ApiStatus.error))
      }
    }
  }

  /**
   * 审核评论
   */
  const approveComment = async (status: 'approved' | 'rejected') => {
    try {
      // 使用真实API
      await articleApi.updateCommentStatus(clickComment.value.id, status)
      // 更新本地状态
      clickComment.value.status = status

      // 更新allComments中的评论状态
      const allIndex = allComments.value.findIndex(
        (comment) => comment.id === clickComment.value.id
      )
      if (allIndex > -1) {
        allComments.value[allIndex].status = status
      }

      // 更新pendingComments中的评论状态
      const pendingIndex = pendingComments.value.findIndex(
        (comment) => comment.id === clickComment.value.id
      )
      if (pendingIndex > -1) {
        pendingComments.value.splice(pendingIndex, 1)
      }

      // 重新筛选评论
      filterComments()

      // 更新统计数据
      updateCommentStats()

      // 关闭抽屉
      showDrawer.value = false
    } catch (error) {
      console.error('审核评论失败:', error)
      if (error instanceof HttpError) {
        showError(error)
      } else {
        showError(new HttpError('审核评论失败', ApiStatus.error))
      }
    }
  }

  /**
   * 删除评论
   */
  const deleteComment = async () => {
    try {
      // 使用真实API
      await articleApi.deleteComment(clickComment.value.id)

      // 从allComments中移除
      const allIndex = allComments.value.findIndex(
        (comment) => comment.id === clickComment.value.id
      )
      if (allIndex > -1) {
        allComments.value.splice(allIndex, 1)
      }

      // 从pendingComments中移除
      const pendingIndex = pendingComments.value.findIndex(
        (comment) => comment.id === clickComment.value.id
      )
      if (pendingIndex > -1) {
        pendingComments.value.splice(pendingIndex, 1)
      }

      // 重新筛选评论
      filterComments()

      // 更新统计数据
      updateCommentStats()

      // 关闭抽屉
      showDrawer.value = false
    } catch (error) {
      console.error('删除评论失败:', error)
      if (error instanceof HttpError) {
        showError(error)
      } else {
        showError(new HttpError('删除评论失败', ApiStatus.error))
      }
    }
  }

  /**
   * 确认拒绝评论
   */
  const confirmReject = async () => {
    try {
      // 使用真实API
      await articleApi.updateCommentStatus(clickComment.value.id, 'rejected', replyContent.value)
      // 更新本地状态
      clickComment.value.status = 'rejected'
      clickComment.value.rejectReason = replyContent.value

      // 更新allComments中的评论状态和拒绝理由
      const allIndex = allComments.value.findIndex(
        (comment) => comment.id === clickComment.value.id
      )
      if (allIndex > -1) {
        allComments.value[allIndex].status = 'rejected'
        allComments.value[allIndex].rejectReason = replyContent.value
      }

      // 更新pendingComments中的评论状态
      const pendingIndex = pendingComments.value.findIndex(
        (comment) => comment.id === clickComment.value.id
      )
      if (pendingIndex > -1) {
        pendingComments.value.splice(pendingIndex, 1)
      }

      // 重新筛选评论
      filterComments()

      // 更新统计数据
      updateCommentStats()

      // 重置拒绝原因状态和内容
      showRejectReason.value = false
      replyContent.value = ''

      // 关闭抽屉
      showDrawer.value = false
    } catch (error) {
      console.error('拒绝评论失败:', error)
      if (error instanceof HttpError) {
        showError(error)
      } else {
        showError(new HttpError('拒绝评论失败', ApiStatus.error))
      }
    }
  }

  /**
   * 取消拒绝评论
   */
  const cancelReject = async () => {
    try {
      // 使用真实API
      await articleApi.updateCommentStatus(clickComment.value.id, 'pending')

      // 更新评论状态为待审核
      clickComment.value.status = 'pending'
      // 清除拒绝理由
      delete clickComment.value.rejectReason

      // 更新allComments中的评论状态
      const allIndex = allComments.value.findIndex(
        (comment) => comment.id === clickComment.value.id
      )
      if (allIndex > -1) {
        allComments.value[allIndex].status = 'pending'
        delete allComments.value[allIndex].rejectReason
      }

      // 将评论重新添加到pendingComments中
      pendingComments.value.push({
        ...clickComment.value
      })

      // 重新筛选评论
      filterComments()

      // 更新统计数据
      updateCommentStats()

      // 关闭抽屉
      showDrawer.value = false
    } catch (error) {
      console.error('取消拒绝评论失败:', error)
      if (error instanceof HttpError) {
        showError(error)
      } else {
        showError(new HttpError('取消拒绝评论失败', ApiStatus.error))
      }
    }
  }

  /**
   * 更新统计数据
   */
  const updateCommentStats = () => {
    const totalComments = allComments.value.length
    const approvedComments = allComments.value.filter(
      (comment) => comment.status === 'approved'
    ).length
    const pendingCommentsCount = allComments.value.filter(
      (comment) => comment.status === 'pending'
    ).length
    const rejectedComments = allComments.value.filter(
      (comment) => comment.status === 'rejected'
    ).length
    const hotComments = allComments.value.filter((comment) => comment.likeCount > 5).length

    commentStats.value = {
      totalComments,
      approvedComments,
      pendingComments: pendingCommentsCount,
      rejectedComments,
      hotComments
    }
  }

  /**
   * 查看文章详情
   */
  const goToArticleDetail = () => {
    // 在新标签页打开文章详情页
    window.open(`/article/${clickComment.value.articleId}`, '_blank')
  }

  /**
   * 切换回复表单显示
   */
  const toggleReply = (commentId: number | null, parentId: number | null = null) => {
    if (showReplyForm.value === commentId) {
      // 如果点击的是当前显示回复表单的评论，则隐藏
      showReplyForm.value = null
      parentCommentId.value = null
    } else {
      // 否则显示对应评论的回复表单
      showReplyForm.value = commentId
      parentCommentId.value = parentId
    }
    // 清空回复内容
    replyContent.value = ''
  }

  /**
   * 提交回复
   */
  const handleSubmit = async (commentId: number) => {
    if (!replyContent.value.trim()) {
      return
    }

    try {
      // 准备回复数据
      const replyData: CommentCreateParams = {
        articleId: clickComment.value.articleId,
        content: replyContent.value,
        parentId: commentId
      }

      // 使用真实API
      const res = await articleApi.createComment(replyData)
      const newReply = res.data

      // 查找对应的评论并添加回复
      const findCommentAndAddReply = (comments: Comment[]): boolean => {
        for (const comment of comments) {
          if (comment.id === commentId) {
            // 找到评论，添加回复
            if (!comment.replies) {
              comment.replies = []
            }
            comment.replies.push(newReply)
            return true
          }

          // 递归查找子评论
          if (comment.replies && comment.replies.length > 0) {
            if (findCommentAndAddReply(comment.replies)) {
              return true
            }
          }
        }
        return false
      }

      // 调用函数添加回复
      findCommentAndAddReply(articleComments.value)

      // 更新allComments中的评论
      const updateCommentsInAll = (
        comments: (Comment & { articleTitle: string; articleAuthor: string; color: string })[]
      ): boolean => {
        for (const comment of comments) {
          if (comment.id === commentId) {
            // 找到评论，添加回复
            if (!comment.replies) {
              comment.replies = []
            }
            comment.replies.push(newReply)
            return true
          }

          // 递归查找子评论
          if (comment.replies && comment.replies.length > 0) {
            if (updateCommentsInAll(comment.replies as any)) {
              return true
            }
          }
        }
        return false
      }

      updateCommentsInAll(allComments.value)

      // 隐藏回复表单
      showReplyForm.value = null
      parentCommentId.value = null
      replyContent.value = ''
    } catch (error) {
      console.error('提交回复失败:', error)
      if (error instanceof HttpError) {
        showError(error)
      } else {
        showError(new HttpError('提交回复失败', ApiStatus.error))
      }
    }
  }

  // 初始化获取评论列表
  fetchComments()
</script>
