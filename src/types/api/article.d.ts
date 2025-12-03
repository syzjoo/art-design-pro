/**
 * 文章类型定义
 */
export interface ArticleType {
  id: number
  name: string
  code?: string
  description?: string
  icon?: string
  sortOrder?: number
  status?: number
  createTime?: string
  updateTime?: string
}

/**
 * 文章分类定义
 */
export interface Category {
  id: number
  name: string
  parentId?: number
  description?: string
  sortOrder?: number
  createTime?: string
  updateTime?: string
}

/**
 * 文章标签定义
 */
export interface Tag {
  id: number
  name: string
  color?: string
  backgroundColor?: string
  usageCount?: number
  sortOrder?: number
  status?: number
  createTime?: string
  updateTime?: string
}

/**
 * 文章附件定义
 */
export interface ArticleAttachment {
  id?: string
  name: string
  url: string
  size?: number
  type?: string
  uploadTime?: string
}

/**
 * 文章详情定义
 */
export interface ArticleDetail {
  id: number
  title: string
  content: string
  summary: string
  categoryId: number
  categoryName?: string
  articleTypeId: number
  articleTypeName?: string
  coverImage: string
  status: string
  isTop: boolean
  isHot: boolean
  viewCount?: number
  likeCount?: number
  commentCount?: number
  publishTime: string
  createTime?: string
  updateTime?: string
  createBy?: string
  updateBy?: string
  remark?: string
  // 标签相关
  tags?: Tag[]
  tagIds?: number[]
  // 附件相关
  attachments?: ArticleAttachment[]
}

/**
 * 创建文章的数据结构
 */
export interface ArticleCreateData {
  title: string
  content: string
  summary: string
  categoryId?: number
  articleTypeId?: number
  coverImage: string
  status: string
  isTop: boolean
  isHot: boolean
  publishTime: string | null
  tagIds?: number[]
  attachments?: Omit<ArticleAttachment, 'uploadTime'>[]
  remark?: string
}

/**
 * 更新文章的数据结构
 */
export interface ArticleUpdateData {
  title: string
  content: string
  summary: string
  categoryId?: number
  articleTypeId?: number
  coverImage: string
  status: string
  isTop: boolean
  isHot: boolean
  publishTime: string | null
  tagIds?: number[]
  attachments?: Omit<ArticleAttachment, 'uploadTime'>[]
  remark?: string
}

/**
 * 通用响应结构
 */
export interface BaseResponse<T = any> {
  code: number
  message: string
  data: T
}

/**
 * 文件上传响应
 */
export interface UploadResponse {
  code: number
  message: string
  data: {
    url: string
    name?: string
    id?: string
  }
}

/**
 * 文章列表查询参数
 */
export interface ArticleListQuery {
  page?: number
  pageSize?: number
  categoryId?: number
  articleTypeId?: number
  status?: string
  keyword?: string
  isTop?: boolean
  isHot?: boolean
  startDate?: string
  endDate?: string
}

/**
 * 文章列表响应
 */
export interface ArticleListResponse {
  list: ArticleDetail[]
  total: number
  page: number
  pageSize: number
}
