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
          <ElButton type="primary" @click="addComment"> 发布 </ElButton>
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
        @toggle-reply="toggleReply"
        @add-reply="addReply"
        class="pb-2.5 mb-5 border-b border-g-400"
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
      // 过滤出已通过的评论
      const approvedComments = commentList.filter(
        (comment: Comment) => comment.status === 'approved'
      )
      console.log('已通过评论数量:', approvedComments.length)
      comments.value = approvedComments
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

    try {
      const commentData: CommentCreateParams = {
        articleId: props.articleId,
        content: newComment.value.content.trim()
      }

      // 使用真实API
      const response = await articleApi.createComment(commentData)

      // 如果创建成功，将评论添加到列表
      if (response.data) {
        comments.value.push(response.data)
        newComment.value.content = ''
        ElMessage.success('评论发布成功')
      }
    } catch (error) {
      console.error('发布评论失败:', error)
      ElMessage.error('发布评论失败')
    }
  }

  const addReply = async (commentId: number, replyAuthor: string, replyContent: string) => {
    if (!replyContent?.trim() || !props.articleId) {
      ElMessage.warning('请填写回复内容')
      return
    }

    try {
      const commentData: CommentCreateParams = {
        articleId: props.articleId,
        content: replyContent.trim(),
        parentId: commentId
      }

      // 使用真实API
      const response = await articleApi.createComment(commentData)

      if (response.data) {
        // 查找父评论并添加回复
        const parentComment = findComment(comments.value, commentId)
        if (parentComment) {
          if (!parentComment.replies) {
            parentComment.replies = []
          }
          parentComment.replies.push(response.data)
        }
        showReplyForm.value = null
        ElMessage.success('回复发布成功')
      }
    } catch (error) {
      console.error('发布回复失败:', error)
      ElMessage.error('发布回复失败')
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
