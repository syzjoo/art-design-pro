<template>
  <div>
    <ElForm @submit.prevent="addComment" class="w-full mx-auto mb-10">
      <ElFormItem prop="content">
        <ElInput
          v-model="newComment.content"
          placeholder="简单说两句..."
          type="textarea"
          :rows="5"
          clearable
        />
      </ElFormItem>
      <ElFormItem>
        <div class="flex justify-end w-full">
          <ElButton type="primary" @click="addComment" :loading="isSubmitting"> 发布 </ElButton>
        </div>
      </ElFormItem>
    </ElForm>

    <ul>
      <div class="pb-5 text-lg font-medium"> 评论 {{ comments.length }} </div>
      <CommentItem
        v-for="comment in comments.slice().reverse()"
        :key="comment.id"
        :comment="comment"
        :show-reply-form="showReplyForm"
        :is-submitting="isSubmitting"
        @toggle-reply="toggleReply"
        @add-reply="addReply"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import CommentItem from './widget/CommentItem.vue'
  import { articleApi } from '@/api/article'
  import type { Comment, CommentCreateParams } from '@/types/api/article'
  import { ElMessage } from 'element-plus'

  const props = defineProps<{
    articleId?: number
  }>()

  const comments = ref<Comment[]>([])

  const newComment = ref<Partial<CommentCreateParams>>({
    content: ''
  })

  const showReplyForm = ref<number | null>(null)

  const isSubmitting = ref(false)

  // 获取文章评论列表
  const fetchComments = async () => {
    if (!props.articleId) {
      console.log('articleId is null or undefined')
      return
    }

    try {
      console.log('开始获取文章评论，articleId:', props.articleId)
      // 使用真实API
      const response = await articleApi.getArticleComments(props.articleId)
      console.log('API返回结果:', response)
      const commentList = response.records || []
      console.log('评论列表:', commentList)
      console.log('评论数量:', commentList.length)
      // 取消过滤，由后端控制评论可见性
      comments.value = commentList
    } catch (error) {
      console.error('获取评论失败:', error)
      ElMessage.error('获取评论失败')
    }
  }

  // 添加评论
  const addComment = async () => {
    if (!newComment.value.content?.trim() || !props.articleId) {
      ElMessage.warning('请填写评论内容')
      return
    }

    isSubmitting.value = true
    try {
      const commentContent = newComment.value.content.trim()
      const commentData: CommentCreateParams = {
        articleId: props.articleId,
        content: commentContent
      }

      // 创建临时评论对象，提供即时反馈
      const tempComment: Partial<Comment> = {
        id: Date.now(), // 使用时间戳作为临时ID
        articleId: props.articleId,
        content: commentContent,
        timestamp: new Date().toISOString(),
        status: 'pending', // 默认显示为审核中
        likeCount: 0,
        replyToUserId: null,
        author: '我',
        creator: { id: 0, username: '我', nickname: '我' },
        replies: []
      }

      // 立即将临时评论添加到列表
      comments.value.push(tempComment as Comment)
      newComment.value.content = ''

      // 使用真实API
      const response = await articleApi.createComment(commentData)

      // 如果创建成功，重新获取评论列表以保证数据一致性
      if (response.data) {
        await fetchComments()
        ElMessage.success('评论发布成功')
      }
    } catch (error) {
      console.error('发布评论失败:', error)
      ElMessage.error('发布评论失败')
    } finally {
      isSubmitting.value = false
    }
  }

  const addReply = async (commentId: number, replyAuthor: string, replyContent: string) => {
    if (!replyContent?.trim() || !props.articleId) {
      ElMessage.warning('请填写回复内容')
      return
    }

    isSubmitting.value = true
    try {
      const trimmedContent = replyContent.trim()
      const commentData: CommentCreateParams = {
        articleId: props.articleId,
        content: trimmedContent,
        parentId: commentId
      }

      // 创建临时回复对象，提供即时反馈
      const tempReply: Partial<Comment> = {
        id: Date.now(), // 使用时间戳作为临时ID
        articleId: props.articleId,
        content: trimmedContent,
        timestamp: new Date().toISOString(),
        status: 'pending', // 默认显示为审核中
        parentId: commentId,
        likeCount: 0,
        replyToUserId: 0, // 临时设置为0
        author: '我',
        creator: { id: 0, username: '我', nickname: '我' },
        replies: []
      }

      // 找到父评论并添加临时回复
      const parentComment = findComment(comments.value, commentId)
      if (parentComment) {
        if (!parentComment.replies) {
          parentComment.replies = []
        }
        parentComment.replies.push(tempReply as Comment)
      }

      // 关闭回复表单
      showReplyForm.value = null

      // 使用真实API
      const response = await articleApi.createCommentReply(commentData)

      if (response.data) {
        // 回复成功后，重新获取评论列表以保证数据一致性
        await fetchComments()
        ElMessage.success('回复发布成功')
      }
    } catch (error) {
      console.error('发布回复失败:', error)
      ElMessage.error('发布回复失败')
      // 重新获取评论列表，清除临时回复
      await fetchComments()
    } finally {
      isSubmitting.value = false
    }
  }

  const toggleReply = (commentId: number) => {
    showReplyForm.value = showReplyForm.value === commentId ? null : commentId
  }

  const findComment = (comments: Comment[], commentId: number): Comment | undefined => {
    for (const comment of comments) {
      if (comment.id === commentId) {
        return comment
      }
      const found = findComment(comment.replies || [], commentId)
      if (found) {
        return found
      }
    }
    return undefined
  }

  // 组件挂载时获取评论列表
  onMounted(() => {
    if (props.articleId) {
      fetchComments()
    }
  })
</script>
