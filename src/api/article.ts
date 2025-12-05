import api from '@/utils/http'
import type {
  ArticleType,
  Category,
  Tag,
  ArticleDetail,
  ArticleCreateData,
  ArticleUpdateData,
  BaseResponse,
  CategoryQuery,
  CategoryCreateData,
  CategoryUpdateData,
  TagQuery,
  TagCreateData,
  TagUpdateData,
  ArticleTypeQuery,
  ArticleTypeCreateData,
  ArticleTypeUpdateData
} from '../types/api/article'

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
