<!-- 文章详情页面 -->
<template>
  <div :style="props.style" :class="props.class">
    <div class="article-detail page-content">
      <div class="max-w-200 m-auto mt-15">
        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-20">
          <el-icon class="text-4xl text-blue-500 animate-spin">
            <Loading />
          </el-icon>
          <p class="mt-4 text-gray-500">加载中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="text-center py-20">
          <el-icon class="text-4xl text-red-500">
            <CircleCloseFilled />
          </el-icon>
          <p class="mt-4 text-gray-500">{{ error }}</p>
          <el-button type="primary" @click="getArticleDetail" class="mt-6">重试</el-button>
        </div>

        <!-- 文章内容 -->
        <div v-else-if="article" class="article-content">
          <!-- 文章标题 -->
          <h1 class="text-3xl font-semibold mb-6">{{ article.title }}</h1>

          <!-- 文章元信息 -->
          <div class="article-meta flex flex-wrap gap-6 mb-10 text-gray-500 text-sm">
            <div class="flex items-center">
              <el-icon class="mr-2"><Calendar /></el-icon>
              <span>{{ formatDate(article.publishTime) }}</span>
            </div>
            <div class="flex items-center">
              <el-icon class="mr-2"><User /></el-icon>
              <span>{{ article.createBy || '未知作者' }}</span>
            </div>
            <div class="flex items-center">
              <el-icon class="mr-2"><View /></el-icon>
              <span>{{ article.viewCount || 0 }} 浏览</span>
            </div>
            <div class="flex items-center">
              <el-icon class="mr-2"><StarFilled /></el-icon>
              <span>{{ article.likeCount || 0 }} 点赞</span>
            </div>
            <div class="flex items-center">
              <el-icon class="mr-2"><ChatDotRound /></el-icon>
              <span>{{ article.commentCount || 0 }} 评论</span>
            </div>
            <div v-if="article.articleTypeName" class="flex items-center">
              <el-icon class="mr-2"><CollectionTag /></el-icon>
              <span>{{ article.articleTypeName }}</span>
            </div>
            <div v-if="article.categoryName" class="flex items-center">
              <el-icon class="mr-2"><Folder /></el-icon>
              <span>{{ article.categoryName }}</span>
            </div>
          </div>

          <!-- 文章摘要 -->
          <div
            v-if="article.summary"
            class="article-summary bg-gray-50 p-6 rounded-lg mb-12.5 text-gray-600"
          >
            <h3 class="text-lg font-semibold mb-3 flex items-center">
              <el-icon class="mr-2"><Document /></el-icon>
              摘要
            </h3>
            <p>{{ article.summary }}</p>
          </div>

          <!-- 文章标签 -->
          <div v-if="article.tags && article.tags.length" class="article-tags mb-12.5">
            <el-tag
              v-for="tag in article.tags"
              :key="tag.id"
              :color="tag.backgroundColor || 'default'"
              :text-color="tag.color || '#fff'"
              class="mr-2 mb-2"
            >
              {{ tag.name }}
            </el-tag>
          </div>

          <!-- 文章正文 -->
          <div class="markdown-body mb-15" v-highlight v-html="article.content"></div>

          <!-- 文章附件 -->
          <div
            v-if="article.attachments && article.attachments.length"
            class="article-attachments mb-15 bg-gray-50 p-8 rounded-lg"
          >
            <h3 class="text-xl font-semibold mb-6 flex items-center">
              <el-icon class="mr-2 text-blue-500"><Paperclip /></el-icon>
              附件下载
            </h3>
            <div class="space-y-4">
              <div
                v-for="attachment in article.attachments"
                :key="attachment.id || attachment.attachmentId"
                class="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div class="flex items-center space-x-4">
                  <el-icon class="text-xl text-blue-500"><Document /></el-icon>
                  <div>
                    <p class="font-medium">{{ attachment.name }}</p>
                    <p class="text-sm text-gray-500"
                      >{{ formatFileSize(attachment.size || 0) }} ·
                      {{
                        attachment.uploadTime ? formatDate(attachment.uploadTime) : '未知时间'
                      }}</p
                    >
                  </div>
                </div>
                <el-button
                  type="primary"
                  size="small"
                  :href="attachment.url"
                  :download="attachment.name"
                  target="_blank"
                  class="ml-auto"
                >
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
              </div>
            </div>
          </div>

          <!-- 更新时间 -->
          <div v-if="article.updateTime" class="text-right text-gray-500 text-sm mb-15">
            最后更新：{{ formatDate(article.updateTime) }}
          </div>

          <!-- 文章评论 -->
          <div class="article-comments mt-20 mb-15">
            <h2 class="text-2xl font-semibold mb-10">评论区</h2>
            <CommentWidget :articleId="articleId" />
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="text-center py-20">
          <el-icon class="text-4xl text-gray-400">
            <DocumentRemove />
          </el-icon>
          <p class="mt-4 text-gray-500">文章不存在</p>
        </div>
      </div>
    </div>
    <ArtBackToTop />
  </div>
</template>

<script setup lang="ts">
  import '@/assets/styles/core/md.scss'
  import '@/assets/styles/custom/one-dark-pro.scss'
  import { useCommon } from '@/hooks/core/useCommon'
  import { articleApi } from '@/api/article'
  import type { ArticleDetail as ArticleDetailType } from '@/types/api/article'
  import { onMounted, ref, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import CommentWidget from '@/components/business/comment-widget/index.vue'
  import {
    Loading,
    CircleCloseFilled,
    Calendar,
    User,
    View,
    StarFilled,
    ChatDotRound,
    Document,
    CollectionTag,
    Folder,
    Paperclip,
    Download,
    DocumentRemove
  } from '@element-plus/icons-vue'

  defineOptions({ name: 'ArticleDetail' })

  // 定义props，接收外部传入的style和class属性
  const props = defineProps<{
    style?: any
    class?: any
  }>()

  const route = useRoute()
  const articleId = computed(() => Number(route.params.id))
  const article = ref<ArticleDetailType | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 格式化日期
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getArticleDetail = async () => {
    if (!articleId.value) return

    loading.value = true
    error.value = null

    try {
      const articleDetail = await articleApi.getArticleDetail(articleId.value)
      article.value = articleDetail
    } catch (err: any) {
      error.value = err.message || '文章加载失败'
      console.error('获取文章详情失败:', err)
    } finally {
      loading.value = false
    }
  }

  const { scrollToTop } = useCommon()

  onMounted(() => {
    scrollToTop()
    getArticleDetail()
  })
</script>

<style lang="scss" scoped>
  .article-detail {
    :deep(.markdown-body) {
      margin-top: 0;

      img {
        width: 100%;
        border: 1px solid var(--art-gray-200);
      }

      pre {
        position: relative;

        &:hover {
          .copy-button {
            opacity: 1;
          }
        }

        &::before {
          position: absolute;
          top: 0;
          left: 50px;
          width: 1px;
          height: 100%;
          content: '';
          background: #0a0a0e;
        }
      }

      .code-wrapper {
        overflow-x: auto;
      }

      .line-number {
        position: sticky;
        left: 0;
        z-index: 2;
        box-sizing: border-box;
        display: inline-block;
        width: 50px;
        margin-right: 10px;
        font-size: 14px;
        color: #9e9e9e;
        text-align: center;
      }

      .copy-button {
        position: absolute;
        top: 6px;
        right: 6px;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        font-size: 20px;
        line-height: 40px;
        color: #999;
        text-align: center;
        cursor: pointer;
        background-color: #000;
        border: none;
        border-radius: 8px;
        opacity: 0;
        transition: all 0.2s;
      }
    }
  }
</style>
