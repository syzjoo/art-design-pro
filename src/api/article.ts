import api from '@/utils/http'
import type {
  ArticleType,
  Category,
  Tag,
  ArticleDetail,
  ArticleCreateData,
  ArticleUpdateData,
  BaseResponse
} from '../types/api/article'

/**
 * 文章相关API接口
 */
export const articleApi = {
  /**
   * 获取文章类型列表
   */
  getArticleTypes: (): Promise<BaseResponse<ArticleType[]>> => {
    return api.get<BaseResponse<ArticleType[]>>({
      url: `/api/article/type`
    })
  },

  /**
   * 获取文章分类列表
   */
  getCategories: (): Promise<BaseResponse<Category[]>> => {
    return api.get<BaseResponse<Category[]>>({
      url: `/api/article/category`
    })
  },

  /**
   * 获取文章标签列表
   */
  getTags: (): Promise<BaseResponse<Tag[]>> => {
    return api.get<BaseResponse<Tag[]>>({
      url: `/api/article/tag`
    })
  },

  /**
   * 获取文章详情
   * @param id 文章ID
   */
  getArticleDetail: (id: string | number): Promise<BaseResponse<ArticleDetail>> => {
    return api.get<BaseResponse<ArticleDetail>>({
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
  getArticleList: (params?: {
    page?: number
    pageSize?: number
    categoryId?: number
    articleTypeId?: number
    status?: string
    keyword?: string
  }): Promise<
    BaseResponse<{
      list: ArticleDetail[]
      total: number
      page: number
      pageSize: number
    }>
  > => {
    return api.get<
      BaseResponse<{
        list: ArticleDetail[]
        total: number
        page: number
        pageSize: number
      }>
    >({
      url: `/api/article/list`,
      params
    })
  }
}

/**
 * 附件相关API
 */
export const attachmentApi = {
  /**
   * 上传文件
   * @param formData 文件表单数据
   */
  uploadFile: (
    formData: FormData
  ): Promise<
    BaseResponse<{
      url: string
      name?: string
      id?: string
    }>
  > => {
    return api.post<
      BaseResponse<{
        url: string
        name?: string
        id?: string
      }>
    >({
      url: `/api/common/upload`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * 删除附件
   * @param fileId 文件ID
   */
  deleteAttachment: (fileId: string): Promise<BaseResponse<any>> => {
    return api.del<BaseResponse<any>>({
      url: `/api/common/attachment/${fileId}`
    })
  }
}
