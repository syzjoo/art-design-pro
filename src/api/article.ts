import api from '@/utils/http'
import type {
  ArticleType,
  Category,
  Tag,
  ArticleDetail,
  ArticleCreateData,
  ArticleUpdateData,
  CategoryQuery,
  CategoryCreateData,
  CategoryUpdateData,
  TagQuery,
  TagCreateData,
  TagUpdateData,
  ArticleTypeQuery,
  ArticleTypeCreateData,
  ArticleTypeUpdateData,
  ArticleListQuery,
  ArticleListResponse,
  Comment,
  CommentCreateParams,
  ArticleCommentStats,
  ArticleCommentListResponse
} from '../types/api/article'
import type { BaseResponse } from '../types/common/response'

/**
 * 文章相关API接口
 */
export const articleApi = {
  /**
   * 获取文章类型列表
   */
  getArticleTypes: (): Promise<ArticleType[]> => {
    return api.get<ArticleType[]>({
      url: `/api/article/type`
    })
  },

  /**
   * 获取文章分类列表
   */
  getCategories: (): Promise<Category[]> => {
    return api.get<Category[]>({
      url: `/api/article/category`
    })
  },

  /**
   * 获取文章标签列表
   */
  getTags: (): Promise<Tag[]> => {
    return api.get<Tag[]>({
      url: `/api/article/tag`
    })
  },

  /**
   * 获取文章详情
   * @param id 文章ID
   */
  getArticleDetail: (id: string | number): Promise<ArticleDetail> => {
    return api.get<ArticleDetail>({
      url: `/api/article/${id}`
    })
  },

  /**
   * 新增文章
   * @param data 文章数据
   */
  createArticle: (data: ArticleCreateData): Promise<BaseResponse<any>> => {
    return api.post<BaseResponse<any>>({
      url: `/api/article`,
      data
    })
  },

  /**
   * 更新文章
   * @param id 文章ID
   * @param data 文章数据
   */
  updateArticle: (id: string | number, data: ArticleUpdateData): Promise<BaseResponse<any>> => {
    return api.put<BaseResponse<any>>({
      url: `/api/article/${id}`,
      data
    })
  },

  /**
   * 删除文章
   * @param id 文章ID
   */
  deleteArticle: (id: string | number): Promise<BaseResponse<any>> => {
    return api.del<BaseResponse<any>>({
      url: `/api/article/${id}`
    })
  },

  /**
   * 获取文章列表
   * @param params 查询参数
   */
  getArticleList: (params?: ArticleListQuery): Promise<ArticleListResponse> => {
    return api.get<ArticleListResponse>({
      url: `/api/article/list`,
      params
    })
  },

  /**
   * 置顶/取消置顶文章
   * @param id 文章ID
   * @param isTop 是否置顶
   */
  setArticleTop: (id: number, isTop: boolean): Promise<BaseResponse<any>> => {
    return api.put<BaseResponse<any>>({
      url: `/api/article/${id}/top`,
      data: { isTop }
    })
  },

  /**
   * 设为热门/取消热门文章
   * @param id 文章ID
   * @param isHot 是否热门
   */
  setArticleHot: (id: number, isHot: boolean): Promise<BaseResponse<any>> => {
    return api.put<BaseResponse<any>>({
      url: `/api/article/${id}/hot`,
      data: { isHot }
    })
  },

  /**
   * 批量删除文章
   * @param ids 文章ID数组
   */
  batchDeleteArticles: (ids: number[]): Promise<BaseResponse<any>> => {
    return api.del<BaseResponse<any>>({
      url: `/api/article/batch-delete`,
      data: { ids }
    })
  },

  /**
   * 批量发布文章
   * @param ids 文章ID数组
   */
  batchPublishArticles: (ids: number[]): Promise<BaseResponse<any>> => {
    return api.put<BaseResponse<any>>({
      url: `/api/article/batch-publish`,
      data: { ids }
    })
  },

  /**
   * 更新文章状态
   * @param id 文章ID
   * @param status 状态值
   */
  updateArticleStatus: (id: number, status: string): Promise<BaseResponse<any>> => {
    return api.put<BaseResponse<any>>({
      url: `/api/article/${id}/status`,
      data: { status }
    })
  },

  /**
   * 获取文章评论统计列表
   */
  getArticleCommentStats: (): Promise<{ records: ArticleCommentStats[] }> => {
    return api.get<{ records: ArticleCommentStats[] }>({
      url: `/api/article/comment/stats`
    })
  },

  /**
   * 获取文章评论列表
   * @param articleId 文章ID
   */
  getArticleComments: (articleId: number): Promise<ArticleCommentListResponse> => {
    return api.get<ArticleCommentListResponse>({
      url: `/api/article/${articleId}/comments`
    })
  },

  /**
   * 获取所有评论列表（支持分页、筛选、搜索）
   * @param params 搜索和筛选参数
   */
  getAllComments: (params: {
    page?: number
    pageSize?: number
    keyword?: string
    status?: 'all' | 'pending' | 'approved' | 'rejected'
    startTime?: string
    endTime?: string
  }): Promise<{ records: Comment[]; total: number; current: number; size: number }> => {
    return api.get<{ records: Comment[]; total: number; current: number; size: number }>({
      url: `/api/article/comment/list`,
      params
    })
  },

  /**
   * 创建评论
   * @param commentData 评论数据
   */
  createComment: (commentData: CommentCreateParams): Promise<BaseResponse<Comment>> => {
    return api.post<BaseResponse<Comment>>({
      url: `/api/article/comment`,
      data: commentData
    })
  },

  /**
   * 创建评论回复
   * @param commentData 评论回复数据
   */
  createCommentReply: (commentData: CommentCreateParams): Promise<BaseResponse<Comment>> => {
    return api.post<BaseResponse<Comment>>({
      url: `/api/article/comment/reply`,
      data: commentData
    })
  },

  /**
   * 更新评论状态（审核）
   * @param id 评论ID
   * @param status 状态值
   * @param rejectReason 拒绝原因（仅当状态为rejected时需要）
   */
  updateCommentStatus: (
    id: number,
    status: 'approved' | 'rejected' | 'pending',
    rejectReason?: string
  ): Promise<BaseResponse<Comment>> => {
    return api.put<BaseResponse<Comment>>({
      url: `/api/article/comment/${id}/status`,
      data: { status, rejectReason }
    })
  },

  /**
   * 删除评论
   * @param id 评论ID
   */
  deleteComment: (id: number): Promise<BaseResponse<any>> => {
    return api.del<BaseResponse<any>>({
      url: `/api/article/comment/${id}`
    })
  }
}

/**
 * 分类管理API接口
 */
export const categoryApi = {
  /**
   * 获取分类列表，支持分页和搜索
   * @param queryParams 分页和搜索参数
   */
  getCategoryList: (
    queryParams: CategoryQuery
  ): Promise<{
    list: Category[]
    total: number
    page: number
    pageSize: number
  }> => {
    return api.get<{
      list: Category[]
      total: number
      page: number
      pageSize: number
    }>({
      url: '/api/article/category/list',
      params: queryParams
    })
  },

  /**
   * 创建分类
   */
  createCategory: (data: CategoryCreateData): Promise<BaseResponse<Category>> => {
    return api.post<BaseResponse<Category>>({
      url: `/api/article/category`,
      data
    })
  },

  /**
   * 更新分类
   */
  updateCategory: (id: number, data: CategoryUpdateData): Promise<BaseResponse<Category>> => {
    return api.put<BaseResponse<Category>>({
      url: `/api/article/category/${id}`,
      data
    })
  },

  /**
   * 删除分类
   */
  deleteCategory: (id: number): Promise<BaseResponse<any>> => {
    return api.del<BaseResponse<any>>({
      url: `/api/article/category/${id}`
    })
  }
}

/**
 * 标签管理API接口
 */
export const tagApi = {
  /**
   * 获取标签列表，支持分页和搜索
   * @param queryParams 分页和搜索参数
   */
  getTagList: (
    queryParams: TagQuery
  ): Promise<{
    list: Tag[]
    total: number
    page: number
    pageSize: number
  }> => {
    return api.get<{
      list: Tag[]
      total: number
      page: number
      pageSize: number
    }>({
      url: '/api/article/tag/list',
      params: queryParams
    })
  },

  /**
   * 创建标签
   */
  createTag: (data: TagCreateData): Promise<BaseResponse<Tag>> => {
    return api.post<BaseResponse<Tag>>({
      url: `/api/article/tag`,
      data
    })
  },

  /**
   * 更新标签
   */
  updateTag: (id: number, data: TagUpdateData): Promise<BaseResponse<Tag>> => {
    return api.put<BaseResponse<Tag>>({
      url: `/api/article/tag/${id}`,
      data
    })
  },

  /**
   * 删除标签
   */
  deleteTag: (id: number): Promise<BaseResponse<any>> => {
    return api.del<BaseResponse<any>>({
      url: `/api/article/tag/${id}`
    })
  }
}

/**
 * 文章类型管理API接口
 */
export const articleTypeApi = {
  /**
   * 获取文章类型列表，支持分页和搜索
   * @param queryParams 分页和搜索参数
   */
  getArticleTypeList: (
    queryParams: ArticleTypeQuery
  ): Promise<{
    list: ArticleType[]
    total: number
    page: number
    pageSize: number
  }> => {
    return api.get<{
      list: ArticleType[]
      total: number
      page: number
      pageSize: number
    }>({
      url: '/api/article/type/list',
      params: queryParams
    })
  },

  /**
   * 创建文章类型
   */
  createArticleType: (data: ArticleTypeCreateData): Promise<BaseResponse<ArticleType>> => {
    return api.post<BaseResponse<ArticleType>>({
      url: `/api/article/type`,
      data
    })
  },

  /**
   * 更新文章类型
   */
  updateArticleType: (
    id: number,
    data: ArticleTypeUpdateData
  ): Promise<BaseResponse<ArticleType>> => {
    return api.put<BaseResponse<ArticleType>>({
      url: `/api/article/type/${id}`,
      data
    })
  },

  /**
   * 删除文章类型
   */
  deleteArticleType: (id: number): Promise<BaseResponse<any>> => {
    return api.del<BaseResponse<any>>({
      url: `/api/article/type/${id}`
    })
  }
}

/**
 * 文件类型枚举
 */
export enum FileType {
  IMAGES = 'images',
  VIDEOS = 'videos',
  COVERS = 'covers',
  ATTACHMENTS = 'attachments'
}

/**
 * 附件相关API
 */
export const attachmentApi = {
  /**
   * 上传文件
   * @param formData 文件表单数据
   * @param fileType 文件类型
   */
  uploadFile: (
    formData: FormData,
    fileType: FileType = FileType.ATTACHMENTS
  ): Promise<{
    url: string
    name?: string
    id?: string
    type?: FileType
  }> => {
    return api.post<{
      url: string
      name?: string
      id?: string
      type?: FileType
    }>({
      url: `/api/common/upload?type=${fileType}`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * 删除附件
   * @param fileId 文件ID
   * @param fileType 文件类型（可选，用于加速查找）
   */
  deleteAttachment: (fileId: string, fileType?: FileType): Promise<any> => {
    return api.del<any>({
      url: `/api/common/attachment/${fileId}${fileType ? `?type=${fileType}` : ''}`
    })
  }
}
