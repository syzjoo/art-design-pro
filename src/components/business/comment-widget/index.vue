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
  import { ElMessage } from 'element-plus'
  import type { Comment } from '@/types/api/article'

  const props = defineProps<{
    articleId: number
  }>()

  const comments = ref<Comment[]>([])
  const newComment = ref<{
    content: string
  }>({
    content: ''
  })

  const showReplyForm = ref<number | null>(null)

  // 获取文章评论列表
  const fetchComments = async () => {
    try {
      const response = await articleApi.getArticleComments(props.articleId)
      comments.value = response
    } catch (error) {
      console.error('获取评论列表失败:', error)
      ElMessage.error('获取评论列表失败')
    }
  }

  // 添加评论
  const addComment = async () => {
    if (!newComment.value.content?.trim()) {
      ElMessage.warning('请填写评论内容')
      return
    }

    try {
      await articleApi.createComment({
        articleId: props.articleId,
        content: newComment.value.content.trim()
      })

      // 刷新评论列表
      await fetchComments()
      newComment.value.content = ''
      ElMessage.success('评论发布成功')
    } catch (error) {
      console.error('发布评论失败:', error)
      ElMessage.error('发布评论失败')
    }
  }

  // 添加回复
  const addReply = async (commentId: number, replyAuthor: string, replyContent: string) => {
    if (!replyContent?.trim()) {
      ElMessage.warning('请填写回复内容')
      return
    }

    try {
      await articleApi.createComment({
        articleId: props.articleId,
        content: replyContent.trim(),
        parentId: commentId
      })

      // 刷新评论列表
      await fetchComments()
      showReplyForm.value = null
      ElMessage.success('回复发布成功')
    } catch (error) {
      console.error('发布回复失败:', error)
      ElMessage.error('发布回复失败')
    }
  }

  // 切换回复表单显示
  const toggleReply = (commentId: number) => {
    showReplyForm.value = showReplyForm.value === commentId ? null : commentId
  }

  // 组件挂载时获取评论列表
  onMounted(() => {
    fetchComments()
  })
</script>
