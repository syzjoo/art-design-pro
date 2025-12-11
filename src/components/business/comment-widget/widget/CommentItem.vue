<template>
  <li>
    <div>
      <div class="flex-c">
        <div
          class="size-5 mr-2.5 text-xs font-medium text-white rounded-full flex-cc"
          :style="{ background: randomColor() }"
        >
          {{
            comment.creator?.nickname || comment.author
              ? (comment.creator?.nickname || comment.author).substring(0, 1)
              : '未'
          }}
        </div>
        <strong class="block text-sm font-medium">{{
          comment.creator?.nickname || comment.author || '匿名用户'
        }}</strong>
      </div>
      <span class="block mt-2.5 text-sm text-g-700">{{ comment.content }}</span>
      <div class="flex-c mt-2.5">
        <span class="text-xs text-g-700">{{ formatDate(comment.timestamp) }}</span>
        <div
          class="ml-5 text-xs text-g-700 c-p select-none hover:text-theme"
          @click="toggleReply(comment.id)"
        >
          回复
        </div>
      </div>
    </div>

    <ul class="pl-7 border-l-2 border-gray-100" v-if="(comment.replies || []).length > 0">
      <CommentItem
        v-for="reply in comment.replies || []"
        :key="reply.id"
        :comment="reply"
        :show-reply-form="showReplyForm"
        @toggle-reply="toggleReply"
        @add-reply="addReply"
        class="mt-5 bg-gray-50 p-3 rounded-lg"
      />
    </ul>

    <ElForm v-if="showReplyForm === comment.id" @submit.prevent="handleSubmit" class="mt-4">
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
          <ElButton @click="toggleReply(comment.id)">取消</ElButton>
          <ElButton type="primary" @click="handleSubmit">发布</ElButton>
        </div>
      </ElFormItem>
    </ElForm>
  </li>
</template>

<script setup lang="ts">
  import AppConfig from '@/config'
  import { ref } from 'vue'
  import type { Comment } from '@/types/api/article'

  const props = defineProps<{
    comment: Comment
    showReplyForm: number | null
  }>()

  const emit = defineEmits<{
    (event: 'toggle-reply', commentId: number): void
    (event: 'add-reply', commentId: number, replyAuthor: string, replyContent: string): void
  }>()

  const replyContent = ref('')

  const toggleReply = (commentId: number) => {
    emit('toggle-reply', commentId)
  }

  const addReply = (commentId: number, author: string, content: string) => {
    emit('add-reply', commentId, author, content)
    replyContent.value = ''
  }
  const handleSubmit = () => {
    if (!replyContent.value.trim()) {
      return
    }
    emit('add-reply', props.comment.id, '匿名用户', replyContent.value)
    replyContent.value = ''
  }

  const formatDate = (timestamp: string) => {
    if (!timestamp) return ''
    // 处理不同格式的时间戳，确保能正确解析
    const formattedTimestamp = timestamp.replace(/\s+/g, 'T')
    const date = new Date(formattedTimestamp)
    if (isNaN(date.getTime())) return timestamp
    return date.toLocaleString()
  }

  let lastColor: string | null = null

  const randomColor = () => {
    let newColor: string

    do {
      const index = Math.floor(Math.random() * AppConfig.systemMainColor.length)
      newColor = AppConfig.systemMainColor[index] || '#1890ff'
    } while (newColor === lastColor)

    lastColor = newColor
    return newColor
  }
</script>
