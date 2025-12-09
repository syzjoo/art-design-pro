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
        :key="item.id"
        @click="openDrawer(item)"
      >
        <p class="text-g-600 text-xs truncate">{{ item.date }}</p>
        <h3 class="mt-1 text-sm font-medium text-gray-900 truncate">{{ item.articleTitle }}</h3>
        <p class="mt-2 text-sm text-gray-800 line-clamp-2">{{ item.content }}</p>
        <div class="absolute bottom-4 left-0 px-4 flex-cb w-full">
          <div class="flex-c">
            <div class="flex-c mr-5 text-xs text-g-600">
              <ArtSvgIcon icon="ri:heart-line" class="mr-1 text-base" />
              <span>{{ item.collection }}</span>
            </div>
            <div class="flex-c mr-5 text-xs text-g-600">
              <ArtSvgIcon icon="ri:message-3-line" class="mr-1 text-base" />
              <span>{{ item.comment }}</span>
            </div>
          </div>
          <div>
            <span class="text-sm text-gray-700">{{ item.userName }}</span>
          </div>
        </div>
      </li>
    </ul>

    <ElDrawer
      lDrawer
      v-model="showDrawer"
      :lock-scroll="false"
      :size="360"
      modal-class="comment-modal"
    >
      <template #header>
        <h4>详情</h4>
      </template>
      <template #default>
        <div class="drawer-default">
          <div class="relative p-4 aspect-16/12" :style="{ background: clickItem.color }">
            <p class="text-g-500 text-xs">{{ clickItem.date }}</p>
            <h3 class="mt-1 text-sm font-medium text-gray-900">{{ clickItem.articleTitle }}</h3>
            <p class="mt-2 text-sm text-gray-800">{{ clickItem.content }}</p>
            <div class="absolute bottom-4 left-0 px-4 flex-cb w-full">
              <div class="flex-c">
                <div class="flex-c mr-5 text-xs text-g-600">
                  <ArtSvgIcon icon="ri:heart-line" class="mr-1 text-base" />
                  <span>{{ clickItem.collection }}</span>
                </div>
                <div class="flex-c mr-5 text-xs text-g-600">
                  <ArtSvgIcon icon="ri:message-3-line" class="mr-1 text-base" />
                  <span>{{ clickItem.comment }}</span>
                </div>
              </div>
              <span class="text-sm text-gray-700">{{ clickItem.userName }}</span>
            </div>
          </div>

          <!-- 评论状态显示 -->
          <div class="mt-6 mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium">评论状态</span>
              <span
                :class="{
                  'text-green-600': clickItem.status === 'approved',
                  'text-yellow-600': clickItem.status === 'pending',
                  'text-red-600': clickItem.status === 'rejected'
                }"
                class="text-xs px-2 py-1 rounded-full bg-opacity-20"
                :style="{
                  backgroundColor:
                    clickItem.status === 'approved'
                      ? '#10B981'
                      : clickItem.status === 'pending'
                        ? '#F59E0B'
                        : '#EF4444'
                }"
              >
                {{
                  clickItem.status === 'approved'
                    ? '已通过'
                    : clickItem.status === 'pending'
                      ? '待审核'
                      : '已拒绝'
                }}
              </span>
            </div>
          </div>

          <!-- 管理操作按钮 -->
          <div class="flex space-x-3 mb-6">
            <ElButton
              v-if="clickItem.status !== 'approved'"
              type="primary"
              size="small"
              @click="updateCommentStatus(clickItem.id, 'approved')"
            >
              通过
            </ElButton>
            <ElButton
              v-if="clickItem.status !== 'rejected'"
              type="warning"
              size="small"
              @click="updateCommentStatus(clickItem.id, 'rejected')"
            >
              拒绝
            </ElButton>
            <ElButton type="danger" size="small" @click="deleteComment(clickItem.id)">
              删除
            </ElButton>
          </div>

          <!-- 评论组件 -->
          <CommentWidget />
        </div>
      </template>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { articleApi } from '@/api/article'
  import CommentWidget from '@/components/business/comment-widget/index.vue'

  defineOptions({ name: 'ArticleComment' })

  interface CommentItem {
    id: number
    articleId: number
    articleTitle: string
    date: string
    content: string
    collection: number
    comment: number
    userName: string
    color?: string
    status: 'pending' | 'approved' | 'rejected'
  }

  const COLOR_LIST = ['#D8F8FF', '#FDDFD9', '#FCE6F0', '#D3F8F0', '#FFEABC', '#F5E1FF', '#E1E6FE']

  const showDrawer = ref(false)
  const comments = ref<CommentItem[]>([])
  const clickItem = ref<CommentItem>({
    id: 1,
    articleId: 1,
    articleTitle: '示例文章',
    date: '2024-9-3',
    content: '加油！学好Node 自己写个小Demo',
    collection: 5,
    comment: 8,
    userName: '匿名',
    color: COLOR_LIST[0],
    status: 'approved'
  })

  /**
   * 获取所有评论列表
   */
  const fetchComments = async () => {
    try {
      const res = await articleApi.getAllComments()
      // 模拟文章标题数据，实际项目中需要从API获取文章信息
      const articleTitles: Record<number, string> = {
        1: 'Node.js入门指南',
        2: 'Vue3实战教程',
        3: 'React性能优化',
        4: 'TypeScript进阶',
        5: '前端工程化实践'
      }

      comments.value = res.records.map((comment, index) => ({
        id: comment.id,
        articleId: comment.articleId,
        articleTitle: articleTitles[comment.articleId] || `文章 ${comment.articleId}`,
        date: comment.timestamp,
        content: comment.content,
        collection: comment.likeCount,
        comment: comment.replies.length,
        userName: comment.author,
        color: COLOR_LIST[index % COLOR_LIST.length],
        status: comment.status
      }))
    } catch (error) {
      console.error('获取评论列表失败:', error)
    }
  }

  /**
   * 打开评论详情抽屉
   */
  const openDrawer = (item: CommentItem) => {
    showDrawer.value = true
    clickItem.value = item
  }

  /**
   * 审核评论
   */
  const updateCommentStatus = async (commentId: number, status: 'approved' | 'rejected') => {
    try {
      await articleApi.updateCommentStatus(commentId, status)
      fetchComments()
    } catch (error) {
      console.error('更新评论状态失败:', error)
    }
  }

  /**
   * 删除评论
   */
  const deleteComment = async (commentId: number) => {
    try {
      await articleApi.deleteComment(commentId)
      fetchComments()
    } catch (error) {
      console.error('删除评论失败:', error)
    }
  }

  // 初始化获取评论列表
  fetchComments()
</script>
