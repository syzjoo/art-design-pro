<!-- 文章发布页面 -->
<template>
  <div class="page-content">
    <div class="mb-6">
      <h2 class="text-lg font-semibold mb-4">{{
        pageMode === PageModeEnum.Edit ? '编辑文章' : '发布文章'
      }}</h2>
      <div class="max-w-250 mx-auto my-5">
        <!-- 文章标题、类型 -->
        <el-row :gutter="10">
          <el-col :span="18">
            <el-input
              v-model.trim="articleData.title"
              placeholder="请输入文章标题（最多100个字符）"
              maxlength="100"
              show-word-limit
            />
          </el-col>
          <el-col :span="6">
            <el-select v-model="articleData.articleTypeId" placeholder="请选择文章类型" filterable>
              <el-option
                v-for="item in articleTypes"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-col>
        </el-row>

        <el-row :gutter="10" class="mt-4">
          <el-col :span="12">
            <el-select v-model="articleData.categoryId" placeholder="请选择文章分类" filterable>
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-col>
          <el-col :span="12">
            <el-select
              v-model="selectedTags"
              placeholder="请选择文章标签"
              filterable
              multiple
              collapse-tags
            >
              <el-option v-for="tag in tagList" :key="tag.id" :label="tag.name" :value="tag.id" />
            </el-select>
          </el-col>
        </el-row>

        <!-- 文章摘要 -->
        <el-input
          v-model="articleData.summary"
          type="textarea"
          :rows="3"
          placeholder="请输入文章摘要（选填，最多200个字符）"
          maxlength="200"
          show-word-limit
          class="mt-4"
        />

        <!-- 富文本编辑器 -->
        <ArtWangEditor class="mt-2.5" v-model="editorHtml" />

        <div class="p-5 mt-5 art-card-xs">
          <h2 class="mb-5 text-xl font-medium">发布设置</h2>
          <!-- 图片上传 -->
          <el-form>
            <el-form-item label="封面">
              <div class="mt-2.5">
                <el-upload
                  :show-file-list="false"
                  :auto-upload="true"
                  :http-request="handleCoverUpload"
                  :on-error="onError"
                  :before-upload="beforeUpload"
                >
                  <div
                    v-if="!articleData.coverImage"
                    class="flex-cc flex-col w-65 h-40 border border-dashed border-[#d9d9d9] rounded-md"
                  >
                    <el-icon class="!text-xl !text-g-600"><Plus /></el-icon>
                    <div class="mt-2 text-sm text-g-600">点击上传封面</div>
                  </div>
                  <img v-else :src="articleData.coverImage" class="block w-65 h-40 object-cover" />
                </el-upload>
                <div class="mt-2 text-xs text-g-700">建议尺寸 16:9，jpg/png 格式</div>
              </div>
            </el-form-item>

            <!-- 文章状态 -->
            <el-form-item label="状态">
              <el-select v-model="articleData.status" placeholder="请选择文章状态">
                <el-option label="草稿" value="draft" />
                <el-option label="已发布" value="published" />
                <el-option label="审核中" value="reviewing" />
                <el-option label="已驳回" value="rejected" />
              </el-select>
            </el-form-item>

            <!-- 置顶和热门设置 -->
            <el-row :gutter="10">
              <el-col :span="12">
                <el-form-item label="置顶">
                  <el-switch v-model="articleData.isTop" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="热门">
                  <el-switch v-model="articleData.isHot" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="附件">
              <div class="mt-2.5">
                <el-upload
                  ref="uploadRef"
                  :auto-upload="true"
                  :multiple="true"
                  :http-request="handleAttachmentUpload"
                  :before-upload="beforeAttachmentUpload"
                  :on-remove="onAttachmentRemove"
                  :file-list="attachmentFileList"
                  :limit="5"
                >
                  <el-button type="primary">
                    <el-icon><Plus /></el-icon>
                    上传附件
                  </el-button>
                  <template #tip>
                    <div class="el-upload__tip">
                      支持文档、PDF等格式，单个文件大小不超过5MB，最多上传5个文件<br />
                      <span style="color: #f56c6c"
                        >不支持图片格式，请使用富文本编辑器或封面上传图片</span
                      >
                    </div>
                  </template>
                </el-upload>
              </div>
            </el-form-item>
          </el-form>

          <div class="flex justify-end">
            <el-button type="primary" @click="submit" class="w-25" :disabled="isSubmitting">
              {{ isSubmitting ? '处理中...' : pageMode === PageModeEnum.Edit ? '保存' : '发布' }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Plus } from '@element-plus/icons-vue'
  import { ElMessage, ElUpload, type UploadFile } from 'element-plus'
  import { ApiStatus } from '@/utils/http/status'
  import { useDateFormat, useNow } from '@vueuse/core'
  import EmojiText from '@/utils/ui/emojo'
  import { PageModeEnum } from '@/enums/formEnum'
  import { articleApi, attachmentApi } from '@/api/article'
  import { useCommon } from '@/hooks/core/useCommon'
  import type { ArticleType, Category, Tag } from '@/types/api/article'
  defineOptions({ name: 'ArticlePublish' })

  interface ArticleData {
    title: string
    content: string
    summary: string
    categoryId: number | undefined
    articleTypeId: number | undefined
    coverImage: string
    status: string
    isTop: boolean
    isHot: boolean
    publishTime: string | null
  }

  // 接口定义已移除，未使用
  const MAX_ATTACHMENT_SIZE = 5 // MB
  // 允许的附件文件类型（不包括图片）
  const ALLOWED_ATTACHMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ]

  const route = useRoute()
  const router = useRouter()
  // 移除未使用的userStore

  // API路径已在封装的接口中处理

  const pageMode = ref<PageModeEnum>(PageModeEnum.Add)
  const isSubmitting = ref<boolean>(false) // 提交加载状态
  const articleData = reactive<ArticleData>({
    title: '',
    content: '',
    summary: '',
    categoryId: undefined,
    articleTypeId: undefined,
    coverImage: '',
    status: 'draft',
    isTop: false,
    isHot: false,
    publishTime: null
  })
  const selectedTags = ref<number[]>([])
  const articleTypes = ref<ArticleType[]>([])
  const categories = ref<Category[]>([])
  const tagList = ref<Tag[]>([])
  const editorHtml = ref('')
  const createDate = ref('')
  const attachmentFileList = ref<UploadFile[]>([])
  const uploadRef = ref<InstanceType<typeof ElUpload>>()

  /**
   * 清空表单数据
   */
  const resetForm = () => {
    // 清空文章基本数据
    articleData.title = ''
    articleData.content = ''
    articleData.summary = ''
    articleData.categoryId = undefined
    articleData.articleTypeId = undefined
    articleData.coverImage = ''
    articleData.status = 'draft'
    articleData.isTop = false
    articleData.isHot = false
    articleData.publishTime = null
    // 清空标签选择
    selectedTags.value = []
    // 清空编辑器内容
    editorHtml.value = ''
    // 清空附件列表
    attachmentFileList.value = []
  }

  /**
   * 初始化页面模式（新增或编辑）
   */
  const initPageMode = () => {
    const { id } = route.query
    pageMode.value = id ? PageModeEnum.Edit : PageModeEnum.Add

    if (pageMode.value === PageModeEnum.Edit) {
      getArticleDetail()
    } else {
      createDate.value = formatDate(useNow().value)
      articleData.publishTime = createDate.value
    }
  }

  /**
   * 获取文章类型列表
   */
  const getArticleTypes = async () => {
    try {
      const data = await articleApi.getArticleTypes()
      articleTypes.value = data || []
    } catch (error) {
      console.error('获取文章类型失败:', error)
      articleTypes.value = []
    }
  }

  /**
   * 获取分类列表
   */
  const getCategories = async () => {
    try {
      const data = await articleApi.getCategories()
      categories.value = data || []
    } catch (error) {
      console.error('获取分类列表失败:', error)
      categories.value = []
    }
  }

  /**
   * 获取标签列表
   */
  const getTags = async () => {
    try {
      const data = await articleApi.getTags()
      tagList.value = data || []
    } catch (error) {
      console.error('获取标签列表失败:', error)
      tagList.value = []
    }
  }

  /**
   * 获取文章详情（编辑模式）
   */
  const getArticleDetail = async () => {
    try {
      const id = route.query.id as string
      const response = await articleApi.getArticleDetail(id)

      if (response.code === ApiStatus.success) {
        const article = response.data
        articleData.title = article.title || ''
        articleData.content = article.content || ''
        articleData.summary = article.summary || ''
        articleData.articleTypeId = article.articleTypeId
        articleData.categoryId = article.categoryId
        articleData.coverImage = article.coverImage || ''
        articleData.status = article.status || 'draft'
        articleData.isTop = article.isTop || false
        articleData.isHot = article.isHot || false
        articleData.publishTime = article.publishTime || createDate.value

        // 设置标签
        if (article.tags && Array.isArray(article.tags)) {
          selectedTags.value = article.tags.map((tag: { id: number }) => tag.id)
        } else if (article.tagIds && Array.isArray(article.tagIds)) {
          selectedTags.value = article.tagIds
        }

        editorHtml.value = article.content || ''
        createDate.value = article.createTime || createDate.value
      }
    } catch (error) {
      console.error('获取文章详情失败:', error)
      ElMessage.error('获取文章详情失败')
    }
  }

  /**
   * 格式化日期为 YYYY-MM-DD HH:mm:ss 格式
   */
  const formatDate = (date: string | Date): string => {
    return useDateFormat(date, 'YYYY-MM-DD HH:mm:ss').value
  }

  /**
   * 验证文章表单数据
   */
  const validateArticle = (): boolean => {
    if (!articleData.title.trim()) {
      ElMessage.warning('请输入文章标题')
      return false
    }

    if (!articleData.articleTypeId) {
      ElMessage.warning('请选择文章类型')
      return false
    }

    if (!articleData.categoryId) {
      ElMessage.warning('请选择文章分类')
      return false
    }

    if (!editorHtml.value || editorHtml.value.trim() === '<p><br></p>') {
      ElMessage.warning('请输入文章内容')
      return false
    }

    if (!articleData.summary.trim()) {
      ElMessage.warning('请输入文章摘要')
      return false
    }

    // 检查附件是否都已上传完成
    const hasUploadingFile = attachmentFileList.value.some(
      (file: UploadFile) => file.status === 'uploading' || file.status === 'ready'
    )
    if (hasUploadingFile) {
      ElMessage.error('有附件正在上传中，请等待上传完成后再提交')
      return false
    }

    return true
  }

  /**
   * 清理代码内容
   */
  const cleanCodeContent = (content: string): string => {
    // 清理代码内容，移除不必要的HTML标签和属性
    let cleanedContent = content
    // 移除script标签
    cleanedContent = cleanedContent.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ''
    )
    // 移除不必要的样式属性
    cleanedContent = cleanedContent.replace(/ style="[^"]*"/gi, '')
    return cleanedContent
  }

  // 保存草稿功能已完全删除，未使用

  /**
   * 提交文章
   */
  const submitArticle = async () => {
    if (!validateArticle()) return

    articleData.content = cleanCodeContent(editorHtml.value)

    // 发布时设置状态为published
    if (articleData.status === 'draft') {
      articleData.status = 'published'
    }

    // 如果没有设置发布时间，使用当前时间
    if (!articleData.publishTime) {
      articleData.publishTime = formatDate(useNow().value)
    }

    // 处理附件信息，转换为接口要求的格式
    const attachments = attachmentFileList.value
      .filter((file) => {
        const hasSuccessStatus = file.status === 'success'
        const hasServerId = !!(file as any).serverId
        return hasSuccessStatus && hasServerId
      })
      .map((file) => ({
        id: (file as any).serverId,
        name: file.name,
        url: file.url || '', // 确保url不为undefined
        size: file.size,
        type: (file.raw as File)?.type || (file as any).type || '' // 先从raw文件对象获取类型，如果没有则使用我们设置的type属性
      }))

    console.log('submitArticle - 构建的attachments数组:', attachments)

    const submitData = {
      ...articleData,
      tagIds: selectedTags.value,
      categoryId: articleData.categoryId || 0,
      articleTypeId: articleData.articleTypeId || 0,
      attachments
    }

    try {
      isSubmitting.value = true
      if (pageMode.value === PageModeEnum.Edit) {
        await articleApi.updateArticle(route.query.id as string, submitData)
      } else {
        await articleApi.createArticle(submitData)
      }

      ElMessage.success(pageMode.value === PageModeEnum.Edit ? '文章更新成功' : '文章发布成功')
      // 非编辑模式下清空表单
      if (pageMode.value === PageModeEnum.Add) {
        resetForm()
      }
      router.push({ name: 'ArticleList' })
    } catch (error) {
      console.error('提交文章失败:', error)
      ElMessage.error('提交文章失败，请稍后重试')
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * 提交表单（新增或编辑）
   */
  const submit = () => {
    submitArticle()
  }

  /**
   * 封面上传自定义处理函数
   */
  const handleCoverUpload = async (options: any) => {
    try {
      const file = options.file
      const formData = new FormData()
      formData.append('file', file)

      const response = await attachmentApi.uploadFile(formData)
      // 由于http请求工具已经处理了响应，直接使用返回的数据
      // 修复URL拼接逻辑，避免产生双斜杠
      if (response.url) {
        articleData.coverImage = response.url.startsWith('/') ? response.url : `/${response.url}`
      }
      ElMessage.success('封面上传成功')
      options.onSuccess({ data: response })
    } catch (error) {
      console.error('封面上传失败:', error)
      ElMessage.error('封面上传失败')
      options.onError(error)
    }
  }

  /**
   * 图片上传失败回调
   */
  const onError = () => {
    ElMessage.error(`图片上传失败 ${EmojiText?.[500] || ''}`)
  }

  /**
   * 上传前的文件校验
   */
  const beforeUpload = (file: File): boolean => {
    const isJpgOrPng =
      file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp'
    if (!isJpgOrPng) {
      ElMessage.error('只支持 JPG, PNG, WEBP 格式!')
      return false
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      ElMessage.error('上传图片大小不能超过 5MB!')
      return false
    }
    return isJpgOrPng && isLt5M
  }

  /**
   * 附件上传前的文件校验
   */
  const beforeAttachmentUpload = (file: File): boolean => {
    // 检查文件大小
    const isLt5M = file.size / 1024 / 1024 < MAX_ATTACHMENT_SIZE
    if (!isLt5M) {
      ElMessage.error(`文件大小不能超过 ${MAX_ATTACHMENT_SIZE}MB`)
      return false
    }

    // 检查文件类型
    const isAllowedType = ALLOWED_ATTACHMENT_TYPES.includes(file.type)
    // 额外检查是否为图片类型
    const isImageType = file.type.startsWith('image/')
    if (isImageType) {
      ElMessage.error('附件不支持图片格式，请使用富文本编辑器或封面上传图片')
      return false
    }
    if (!isAllowedType) {
      ElMessage.error('不支持的文件格式，请上传常见的文档或PDF文件')
      return false
    }

    return true
  }

  /**
   * 附件上传自定义处理函数
   */
  const handleAttachmentUpload = async (options: any) => {
    try {
      const file = options.file
      const formData = new FormData()
      formData.append('file', file)

      // 根据文件类型自动选择上传目录
      // attachmentApi.uploadFile不需要fileType参数，移除多余参数
      const response = await attachmentApi.uploadFile(formData)
      // 由于http请求工具已经处理了响应，直接使用返回的数据

      console.log('handleAttachmentUpload - 上传成功，response:', response)
      console.log('handleAttachmentUpload - 当前attachmentFileList:', attachmentFileList.value)

      // 创建完整的文件对象，包含所有需要的属性
      const uploadedFile: UploadFile = {
        ...file,
        status: 'success',
        uid: file.uid,
        name: file.name,
        size: file.size,
        type: file.type,
        raw: file.raw,
        serverId: response.id,
        url: response.url,
        response: { data: response }
      } as any

      // 手动将文件添加到attachmentFileList中
      attachmentFileList.value.push(uploadedFile)

      console.log('handleAttachmentUpload - 更新后的attachmentFileList:', attachmentFileList.value)

      ElMessage.success('附件上传成功')
      options.onSuccess({ data: response }, file)
    } catch (error) {
      console.error('附件上传失败:', error)
      ElMessage.error('附件上传失败')
      options.onError(error, options.file)
    }
  }

  // 附件上传成功/失败回调已移除，相关逻辑已整合到handleAttachmentUpload函数中

  /**
   * 附件删除回调
   */
  const onAttachmentRemove = async (file: UploadFile) => {
    try {
      const fileWithServerInfo = file as any
      // 如果文件已上传到服务器，调用API删除服务器上的文件
      if (fileWithServerInfo.serverId) {
        const response = await attachmentApi.deleteAttachment(fileWithServerInfo.serverId)
        if (response.code !== ApiStatus.success) {
          console.error('删除服务器文件失败:', response.message)
          // 即使服务器删除失败，也继续从本地列表移除
        }
      }

      // 从文件列表中移除指定文件
      const index = attachmentFileList.value.findIndex((item: UploadFile) => item.uid === file.uid)
      if (index > -1) {
        attachmentFileList.value.splice(index, 1)
      }
    } catch (error) {
      console.error('删除附件失败:', error)
      // 即使发生错误，也从本地列表移除文件
      const index = attachmentFileList.value.findIndex((item: UploadFile) => item.uid === file.uid)
      if (index > -1) {
        attachmentFileList.value.splice(index, 1)
      }
    }
  }

  const { scrollToTop } = useCommon()

  // 监听编辑器内容变化功能已完全删除，未使用

  onMounted(async () => {
    scrollToTop()
    await Promise.all([getArticleTypes(), getCategories(), getTags()])
    initPageMode()
  })
</script>
