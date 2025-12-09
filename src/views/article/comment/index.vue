<!-- 留言管理页面 -->
<template>
  <div>
    <h1 class="text-4xl font-medium mt-5">留言墙</h1>
    <p class="mt-3.5 text-g-600">每一份留言都记录了您的想法，也为我们提供了珍贵的回忆</p>

    <ul
      class="mt-10 grid grid-cols-5 gap-5 max-2xl:grid-cols-4 max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 mb-5"
    >
      <li
        class="relative p-4 c-p aspect-16/12 duration-300 hover:-translate-y-1.5"
        :style="{ background: item.color }"
        v-for="item in comments"
        :key="item.articleId"
        @click="openDrawer(item)"
      >
        <p class="text-g-600 text-xs truncate">{{
          new Date(item.publishTime).toLocaleDateString()
        }}</p>
        <h3 class="mt-1 text-sm font-medium text-gray-900 truncate">{{ item.articleTitle }}</h3>
        <p class="mt-2 text-sm text-gray-800 line-clamp-2">{{ item.latestComment.content }}</p>
        <div class="absolute bottom-4 left-0 px-4 flex-cb w-full">
          <div class="flex-c">
            <div class="flex-c mr-5 text-xs text-g-600">
              <ArtSvgIcon icon="ri:heart-line" class="mr-1 text-base" />
              <span>{{ item.totalLikes }}</span>
            </div>
            <div class="flex-c mr-5 text-xs text-g-600">
              <ArtSvgIcon icon="ri:message-3-line" class="mr-1 text-base" />
              <span>{{ item.totalComments }}</span>
            </div>
          </div>
          <div>
            <span class="text-sm text-gray-700">{{ item.latestComment.author }}</span>
          </div>
        </div>
      </li>
    </ul>

    <ElDrawer v-model="showDrawer" :lock-scroll="false" :size="360" modal-class="comment-modal">
      <template #header>
        <h4>详情</h4>
      </template>
      <template #default>
        <div class="drawer-default">
          <div class="relative p-4 aspect-16/12" :style="{ background: clickItem.color }">
            <p class="text-g-500 text-xs">{{
              new Date(clickItem.publishTime).toLocaleDateString()
            }}</p>
            <h3 class="mt-1 text-sm font-medium text-gray-900">{{ clickItem.articleTitle }}</h3>
            <p class="mt-2 text-sm text-gray-800 line-clamp-2">{{ clickItem.articleSummary }}</p>
            <div class="absolute bottom-4 left-0 px-4 flex-cb w-full">
              <div class="flex-c">
                <div class="flex-c mr-5 text-xs text-g-600">
                  <ArtSvgIcon icon="ri:heart-line" class="mr-1 text-base" />
                  <span>{{ clickItem.totalLikes }}</span>
                </div>
                <div class="flex-c mr-5 text-xs text-g-600">
                  <ArtSvgIcon icon="ri:message-3-line" class="mr-1 text-base" />
                  <span>{{ clickItem.totalComments }}</span>
                </div>
              </div>
              <span class="text-sm text-gray-700">{{ clickItem.articleAuthor }}</span>
            </div>
          </div>

          <!-- 评论状态统计 -->
          <div class="mt-6 mb-4">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium">评论状态统计</span>
            </div>
            <div class="flex space-x-3 text-xs">
              <div class="flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                <span class="mr-1">待审核：</span>
                <span class="font-medium">{{ clickItem.commentStatusStats.pending }}</span>
              </div>
              <div class="flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800">
                <span class="mr-1">已通过：</span>
                <span class="font-medium">{{ clickItem.commentStatusStats.approved }}</span>
              </div>
              <div class="flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800">
                <span class="mr-1">已拒绝：</span>
                <span class="font-medium">{{ clickItem.commentStatusStats.rejected }}</span>
              </div>
            </div>
          </div>

          <!-- 最新评论 -->
          <div class="mt-4 mb-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium">最新评论</span>
              <span
                :class="{
                  'text-green-600': clickItem.latestComment.status === 'approved',
                  'text-yellow-600': clickItem.latestComment.status === 'pending',
                  'text-red-600': clickItem.latestComment.status === 'rejected'
                }"
                class="text-xs px-2 py-1 rounded-full bg-opacity-20"
                :style="{
                  backgroundColor:
                    clickItem.latestComment.status === 'approved'
                      ? '#10B981'
                      : clickItem.latestComment.status === 'pending'
                        ? '#F59E0B'
                        : '#EF4444'
                }"
              >
                {{
                  clickItem.latestComment.status === 'approved'
                    ? '已通过'
                    : clickItem.latestComment.status === 'pending'
                      ? '待审核'
                      : '已拒绝'
                }}
              </span>
            </div>
            <div class="text-sm text-gray-800">
              {{ clickItem.latestComment.content }}
            </div>
            <div class="flex items-center mt-2 text-xs text-gray-500">
              <span>{{ clickItem.latestComment.author }}</span>
              <span class="mx-2">·</span>
              <span>{{ new Date(clickItem.latestComment.timestamp).toLocaleString() }}</span>
            </div>
          </div>

          <!-- 管理操作按钮 -->
          <div class="flex space-x-3 mb-6">
            <ElButton type="primary" size="small" @click="goToArticleDetail()"> 查看文章 </ElButton>
          </div>

          <!-- 评论组件 -->
          <CommentWidget :articleId="clickItem.articleId" />
        </div>
      </template>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { articleApi } from '@/api/article'
  import CommentWidget from '@/components/business/comment-widget/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { showError, HttpError } from '@/utils/http/error'
  import { ApiStatus } from '@/utils/http/status'
  import type { ArticleCommentStats } from '@/types/api/article'
  // 导入模拟数据
  import { mockArticleCommentStatsResponse } from '@/mock/temp/commentDetail'
  // 是否使用模拟数据（可以根据环境变量配置）
  const USE_MOCK_DATA = import.meta.env.MODE === 'development' || true

  defineOptions({ name: 'ArticleComment' })

  const COLOR_LIST = ['#D8F8FF', '#FDDFD9', '#FCE6F0', '#D3F8F0', '#FFEABC', '#F5E1FF', '#E1E6FE']

  const showDrawer = ref(false)
  const comments = ref<ArticleCommentStats[]>([])
  const clickItem = ref<ArticleCommentStats>({
    articleId: 1,
    articleTitle: '示例文章',
    articleSummary: '这是一篇示例文章',
    publishTime: '2024-09-03',
    articleAuthor: '管理员',
    totalComments: 8,
    totalLikes: 5,
    latestComment: {
      id: 1,
      content: '加油！学好Node 自己写个小Demo',
      author: '匿名',
      timestamp: '2024-09-03 10:30:00',
      status: 'approved'
    },
    commentStatusStats: {
      pending: 0,
      approved: 8,
      rejected: 0
    }
  })

  /**
   * 获取按文章分组的评论统计列表
   */
  const fetchComments = async () => {
    try {
      let res

      if (USE_MOCK_DATA) {
        // 使用模拟数据
        res = mockArticleCommentStatsResponse()
      } else {
        // 使用真实API
        res = await articleApi.getArticleCommentStats()
      }

      comments.value = res.records.map((item, index) => ({
        ...item,
        color: COLOR_LIST[index % COLOR_LIST.length]
      }))
      // 成功获取评论列表，不显示提示（可根据需求调整）
    } catch (error) {
      console.error('获取评论统计列表失败:', error)
      if (error instanceof HttpError) {
        showError(error)
      } else {
        showError(new HttpError('获取评论统计列表失败', ApiStatus.error))
      }
    }
  }

  /**
   * 打开评论详情抽屉
   */
  const openDrawer = (item: ArticleCommentStats) => {
    showDrawer.value = true
    clickItem.value = item
  }

  /**
   * 查看文章详情
   */
  const goToArticleDetail = () => {
    // 在新标签页打开文章详情页
    window.open(`/article/${clickItem.value.articleId}`, '_blank')
  }

  // 初始化获取评论列表
  fetchComments()
</script>
