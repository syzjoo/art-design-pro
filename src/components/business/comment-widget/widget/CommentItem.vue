<template>
  <li class="py-4">
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
      <span class="block mt-2.5 text-sm text-g-700" v-html="comment.content"></span>
      <!-- 审核状态提示 -->
      <div v-if="comment.status !== 'approved'" class="mt-2.5">
        <ElTag type="info" size="small" effect="light">
          {{ comment.status === 'pending' ? '审核中' : '已拒绝' }}
        </ElTag>
        <span v-if="comment.status === 'pending'" class="ml-2 text-xs text-g-600">
          评论已提交，审核通过后所有人可见
        </span>
      </div>
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

    <ul class="pl-4 space-y-4" v-if="(comment.replies || []).length > 0">
      <CommentItem
        v-for="reply in comment.replies || []"
        :key="reply.id"
        :comment="reply"
        :show-reply-form="showReplyForm"
        :is-submitting="props.isSubmitting"
        @toggle-reply="toggleReply"
        @add-reply="addReply"
        class="mt-0"
      />
    </ul>

    <ElForm v-if="showReplyForm === comment.id" @submit.prevent="handleSubmit" class="mt-4">
      <ElFormItem prop="content">
        <ArtWangEditor
          v-model="replyContent"
          :height="'150px'"
          :placeholder="'你的回复...'"
          :toolbarKeys="toolbarKeys"
          :mode="'simple'"
        />
      </ElFormItem>
      <ElFormItem>
        <div class="flex justify-end gap-2 w-full">
          <ElButton @click="toggleReply(comment.id)" :disabled="props.isSubmitting">取消</ElButton>
          <ElButton type="primary" @click="handleSubmit" :loading="props.isSubmitting"
            >发布</ElButton
          >
        </div>
      </ElFormItem>
    </ElForm>
  </li>
</template>

<script setup lang="ts">
  import AppConfig from '@/config'
  import { ref } from 'vue'
  import type { Comment } from '@/types/api/article'
  import ArtWangEditor from '@/components/core/forms/art-wang-editor/index.vue'

  const props = defineProps<{
    comment: Comment
    showReplyForm: number | null
    isSubmitting?: boolean
  }>()

  const emit = defineEmits<{
    (event: 'toggle-reply', commentId: number): void
    (event: 'add-reply', commentId: number, replyAuthor: string, replyContent: string): void
  }>()

  const replyContent = ref('')

  // 配置简易工具栏 - 只保留图片和表情包功能
  const toolbarKeys = ref(['emotion', 'uploadImage'])

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
