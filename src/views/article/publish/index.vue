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
              v-model.trim="articleName"
              placeholder="请输入文章标题（最多100个字符）"
              maxlength="100"
              show-word-limit
            />
          </el-col>
          <el-col :span="6">
            <el-select v-model="articleType" placeholder="请选择文章类型" filterable>
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
            <el-select v-model="categoryId" placeholder="请选择文章分类" filterable>
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
              v-model="tags"
              placeholder="请选择文章标签"
              filterable
              multiple
              collapse-tags
            >
              <el-option v-for="tag in tagList" :key="tag.id" :label="tag.name" :value="tag.id" />
            </el-select>
          </el-col>
        </el-row>

        <!-- 富文本编辑器 -->
        <ArtWangEditor class="mt-2.5" v-model="editorHtml" />

        <div class="p-5 mt-5 art-card-xs">
          <h2 class="mb-5 text-xl font-medium">发布设置</h2>
          <!-- 图片上传 -->
          <el-form>
            <el-form-item label="封面">
              <div class="mt-2.5">
                <el-upload
                  :action="uploadImageUrl"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :on-success="onSuccess"
                  :on-error="onError"
                  :before-upload="beforeUpload"
                >
                  <div
                    v-if="!cover"
                    class="flex-cc flex-col w-65 h-40 border border-dashed border-[#d9d9d9] rounded-md"
                  >
                    <el-icon class="!text-xl !text-g-600"><Plus /></el-icon>
                    <div class="mt-2 text-sm text-g-600">点击上传封面</div>
                  </div>
                  <img v-else :src="cover" class="block w-65 h-40 object-cover" />
                </el-upload>
                <div class="mt-2 text-xs text-g-700">建议尺寸 16:9，jpg/png 格式</div>
              </div>
            </el-form-item>
            <el-form-item label="可见">
              <el-switch v-model="visible" />
            </el-form-item>

            <el-form-item label="附件">
              <div class="mt-2.5">
                <el-upload
                  ref="uploadRef"
                  :action="uploadImageUrl"
                  :headers="uploadHeaders"
                  :multiple="true"
                  :before-upload="beforeAttachmentUpload"
                  :on-success="onAttachmentSuccess"
                  :on-error="onAttachmentError"
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
                      支持常见文件格式，单个文件大小不超过5MB，最多上传5个文件
                    </div>
                  </template>
                </el-upload>
              </div>
            </el-form-item>
          </el-form>

          <div class="flex justify-end">
            <el-button type="primary" @click="submit" class="w-25">
              {{ pageMode === PageModeEnum.Edit ? '保存' : '发布' }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Plus } from '@element-plus/icons-vue'
  import { ElMessage, ElUpload, type UploadFile } from 'element-plus'
  import { ApiStatus } from '@/utils/http/status'
  import { useUserStore } from '@/store/modules/user'
  import { useDateFormat, useNow } from '@vueuse/core'
  import EmojiText from '@/utils/ui/emojo'
  import { PageModeEnum } from '@/enums/formEnum'
  import axios from 'axios'
  import { useCommon } from '@/hooks/core/useCommon'

  defineOptions({ name: 'ArticlePublish' })

  interface ArticleType {
    id: number
    name: string
  }

  interface Category {
    id: number
    name: string
  }

  interface Tag {
    id: number
    name: string
  }

  interface UploadResponse {
    data: {
      url: string
      name?: string
      id?: string
    }
  }

  interface ArticleDetailResponse {
    code: number
    data: {
      title: string
      blog_class: string
      html_content: string
      cover?: string
      visible?: boolean
      category_id?: number
      tags?: number[]
    }
  }

  const MAX_IMAGE_SIZE = 2 // MB
  const MAX_ATTACHMENT_SIZE = 5 // MB
  const EMPTY_EDITOR_CONTENT = '<p><br></p>'

  // 允许的附件文件类型
  const ALLOWED_ATTACHMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]

  const route = useRoute()
  const router = useRouter()
  const userStore = useUserStore()
  const { accessToken } = userStore

  const uploadImageUrl = `${import.meta.env.VITE_API_URL}/api/common/upload`
  const uploadHeaders = { Authorization: accessToken }

  const pageMode = ref<PageModeEnum>(PageModeEnum.Add)
  const articleName = ref('')
  const articleType = ref<number | undefined>(undefined)
  const categoryId = ref<number | undefined>(undefined)
  const tags = ref<number[]>([])
  const articleTypes = ref<ArticleType[]>([])
  const categories = ref<Category[]>([])
  const tagList = ref<Tag[]>([])
  const editorHtml = ref('')
  const createDate = ref('')
  const cover = ref('')
  const visible = ref(true)
  const attachmentFileList = ref<UploadFile[]>([])
  const uploadRef = ref<InstanceType<typeof ElUpload>>()

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
    }
  }

  /**
   * 获取文章分类列表
   */
  const getArticleTypes = async () => {
    try {
      const { data } = await axios.get('https://www.qiniu.lingchen.kim/classify.json')
      if (data.code === 200) {
        articleTypes.value = data.data
      }
    } catch (error) {
      console.error('获取文章分类失败:', error)
      ElMessage.error('获取文章分类失败')
    }
  }

  /**
   * 获取分类列表
   */
  const getCategories = async () => {
    try {
      // 模拟数据
      categories.value = [
        { id: 1, name: '前端开发' },
        { id: 2, name: '后端开发' },
        { id: 3, name: '人工智能' }
      ]
    } catch (error) {
      console.error('获取分类列表失败:', error)
      ElMessage.error('获取分类列表失败')
    }
  }

  /**
   * 获取标签列表
   */
  const getTags = async () => {
    try {
      // 模拟数据
      tagList.value = [
        { id: 1, name: 'Vue' },
        { id: 2, name: 'React' },
        { id: 3, name: 'TypeScript' },
        { id: 4, name: 'Node.js' },
        { id: 5, name: 'CSS' }
      ]
    } catch (error) {
      console.error('获取标签列表失败:', error)
      ElMessage.error('获取标签列表失败')
    }
  }

  /**
   * 获取文章详情（编辑模式）
   */
  const getArticleDetail = async () => {
    try {
      const { data } = await axios.get<ArticleDetailResponse>(
        'https://www.qiniu.lingchen.kim/blog_list.json'
      )

      if (data.code === ApiStatus.success) {
        const {
          title,
          blog_class,
          html_content,
          cover: articleCover,
          visible: articleVisible,
          category_id,
          tags: articleTags
        } = data.data
        articleName.value = title || ''
        articleType.value = blog_class ? Number(blog_class) : undefined
        editorHtml.value = html_content || ''

        // 设置封面和可见性
        if (articleCover) cover.value = articleCover
        if (typeof articleVisible === 'boolean') visible.value = articleVisible

        // 设置分类和标签数据
        categoryId.value = category_id || 1
        tags.value = articleTags || [1, 3]
      }
    } catch (error) {
      console.error('获取文章详情失败:', error)
      ElMessage.error('获取文章详情失败')
    }
  }

  /**
   * 格式化日期为 YYYY-MM-DD 格式
   */
  const formatDate = (date: string | Date): string => {
    return useDateFormat(date, 'YYYY-MM-DD').value
  }

  /**
   * 验证文章表单数据
   */
  const validateArticle = (): boolean => {
    if (!articleName.value.trim()) {
      ElMessage.error('请输入文章标题')
      return false
    }

    if (articleType.value === undefined) {
      ElMessage.error('请选择文章类型')
      return false
    }

    if (categoryId.value === undefined) {
      ElMessage.error('请选择文章分类')
      return false
    }

    if (!tags.value || tags.value.length === 0) {
      ElMessage.error('请选择文章标签')
      return false
    }

    if (!editorHtml.value || editorHtml.value === EMPTY_EDITOR_CONTENT) {
      ElMessage.error('请输入文章内容')
      return false
    }

    if (!cover.value) {
      ElMessage.error('请上传封面图片')
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
   * 清理代码块中的多余空格
   */
  const cleanCodeContent = (content: string): string => {
    return content.replace(/(\s*)<\/code>/g, '</code>')
  }

  /**
   * 新增文章
   */
  const addArticle = async () => {
    if (!validateArticle()) return

    try {
      const cleanedContent = cleanCodeContent(editorHtml.value)

      // 构建附件数据
      const attachments = attachmentFileList.value.map((file: UploadFile) => ({
        name: file.name || '',
        url: (file.response as any)?.data?.url || file.url || '',
        id: file.uid
      }))

      // 构建参数对象
      const params = {
        title: articleName.value,
        type: articleType.value,
        category_id: categoryId.value,
        tags: tags.value,
        content: cleanedContent,
        cover: cover.value,
        visible: visible.value,
        attachments: attachments // 添加附件信息
      }

      console.log('新增文章:', params)
      ElMessage.success('文章发布成功')
      // 成功后跳转到文章列表页
      router.push({ name: 'ArticleList' })
    } catch (error) {
      console.error('发布文章失败:', error)
      ElMessage.error('发布文章失败')
    }
  }

  /**
   * 编辑文章
   */
  const editArticle = async () => {
    if (!validateArticle()) return

    try {
      const cleanedContent = cleanCodeContent(editorHtml.value)

      // 构建附件数据
      const attachments = attachmentFileList.value.map((file: UploadFile) => ({
        name: file.name,
        url: file.url,
        id: file.uid
      }))

      // 构建参数对象
      const params = {
        id: route.query.id,
        title: articleName.value,
        type: articleType.value,
        category_id: categoryId.value,
        tags: tags.value,
        content: cleanedContent,
        cover: cover.value,
        visible: visible.value,
        attachments: attachments // 添加附件信息
      }

      console.log('编辑文章:', params)
      ElMessage.success('文章保存成功')
      // 成功后跳转到文章列表页
      router.push({ name: 'ArticleList' })
    } catch (error) {
      console.error('保存文章失败:', error)
      ElMessage.error('保存文章失败')
    }
  }

  /**
   * 提交表单（新增或编辑）
   */
  const submit = () => {
    if (pageMode.value === PageModeEnum.Edit) {
      editArticle()
    } else {
      addArticle()
    }
  }

  /**
   * 图片上传成功回调
   */
  const onSuccess = (response: UploadResponse) => {
    cover.value = response.data?.url || ''
    ElMessage.success(`图片上传成功 ${EmojiText?.[200] || ''}`)
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
    const isImage = file.type?.startsWith('image/') || false
    const isLt2M = file.size / 1024 / 1024 < MAX_IMAGE_SIZE

    if (!isImage) {
      ElMessage.error('只能上传图片文件')
      return false
    }

    if (!isLt2M) {
      ElMessage.error(`图片大小不能超过 ${MAX_IMAGE_SIZE}MB`)
      return false
    }

    return true
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
    if (!isAllowedType) {
      ElMessage.error('不支持的文件格式，请上传常见的文档、图片或PDF文件')
      return false
    }

    return true
  }

  /**
   * 附件上传成功回调
   */
  const onAttachmentSuccess = (response: any, file: UploadFile) => {
    ElMessage.success(`文件 ${file.name} 上传成功`)
    // 可以在这里处理上传成功后的逻辑，比如保存文件信息到数据库
  }

  /**
   * 附件上传失败回调
   */
  const onAttachmentError = (error: Error, file: UploadFile) => {
    ElMessage.error(`文件 ${file.name} 上传失败`)
  }

  /**
   * 附件删除回调
   */
  const onAttachmentRemove = (file: UploadFile) => {
    // 从文件列表中移除指定文件
    const index = attachmentFileList.value.findIndex((item: UploadFile) => item.uid === file.uid)
    if (index > -1) {
      attachmentFileList.value.splice(index, 1)
    }
    // 可以在这里添加删除服务器文件的逻辑
  }

  const { scrollToTop } = useCommon()

  onMounted(async () => {
    scrollToTop()
    await Promise.all([getArticleTypes(), getCategories(), getTags()])
    initPageMode()
  })
</script>
