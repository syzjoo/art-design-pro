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
  status?: string
  createBy?: number
  updateBy?: number
  createTime?: string
  updateTime?: string
}

/**
 * 文章分类定义
 */
export interface Category {
  id: number
  name: string
  parentId?: number | null
  description?: string
  sortOrder?: number
  status: string
  articleCount?: number
  createBy?: number
  updateBy?: number
  createTime?: string
  updateTime?: string
  parent?: Category
  children?: Category[]
  hasChildren?: boolean
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
  status: string
  createBy?: number
  updateBy?: number
  createTime?: string
  updateTime?: string
}

/**
 * 文章附件定义
 */
export interface ArticleAttachment {
  id?: string
  attachmentId?: string
  name: string
  url: string
  size?: number
  type?: string
  uploadTime?: string
  createTime?: string
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
 * 文章列表项定义（不包含content字段）
 */
export type ArticleListItem = Omit<ArticleDetail, 'content'>

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
 * 文件上传响应
 */
export interface UploadResponse {
  code: number
  msg: string
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
  list: ArticleListItem[]
  total: number
  page: number
  pageSize: number
}

/**
 * 分类管理相关类型
 */
export interface CategoryQuery {
  page?: number
  pageSize?: number
  keyword?: string
  parentId?: number
}

export interface CategoryCreateData {
  name: string
  parentId?: number
  description?: string
  sortOrder?: number
  status?: string
}

export interface CategoryUpdateData {
  name?: string
  parentId?: number
  description?: string
  sortOrder?: number
  status?: string
}

/**
 * 标签管理相关类型
 */
export interface TagQuery {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
}

export interface TagCreateData {
  name: string
  color?: string
  backgroundColor?: string
  sortOrder?: number
  status?: string
}

export interface TagUpdateData {
  name?: string
  color?: string
  backgroundColor?: string
  sortOrder?: number
  status?: string
}

/**
 * 文章类型管理相关类型
 */
export interface ArticleTypeQuery {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
}

export interface ArticleTypeCreateData {
  name: string
  code: string
  description?: string
  icon?: string
  sortOrder?: number
  status?: string
}

export interface ArticleTypeUpdateData {
  name?: string
  code?: string
  description?: string
  icon?: string
  sortOrder?: number
  status?: string
}

/**
 * 评论相关类型
 */

/**
 * 评论定义
 */
export interface Comment {
  id: number
  articleId: number
  content: string
  parentId: number
  replyToUserId: number | null
  likeCount: number
  status: 'pending' | 'approved' | 'rejected'
  author: string
  timestamp: string
  replies: Comment[]
}

/**
 * 评论列表响应
 */
export interface CommentList {
  records: Comment[]
  total: number
  current: number
  size: number
  pages?: number
}

/**
 * 评论创建参数
 */
export interface CommentCreateParams {
  articleId: number
  content: string
  parentId?: number
  replyToUserId?: number
}
