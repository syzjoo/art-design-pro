/**
 * HTTP 请求封装模块
 * 基于 Axios 封装的 HTTP 请求工具，提供统一的请求/响应处理
 *
 * ## 主要功能
 *
 * - 请求/响应拦截器（自动添加 Token、统一错误处理）
 * - 401 未授权自动登出（带防抖机制）
 * - 请求失败自动重试（可配置）
 * - 统一的成功/错误消息提示
 * - 支持 GET/POST/PUT/DELETE 等常用方法
 *
 * @module utils/http
 * @author Art Design Pro Team
 */

import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '@/store/modules/user'
import { ApiStatus } from './status'
import { HttpError, handleError, showError, showSuccess } from './error'
import { $t } from '@/locales'
import { BaseResponse } from '@/types'

/** 请求配置常量 */
const REQUEST_TIMEOUT = 15000
const LOGOUT_DELAY = 500
const MAX_RETRIES = 0
const RETRY_DELAY = 1000
const UNAUTHORIZED_DEBOUNCE_TIME = 3000
const CACHE_EXPIRY_TIME = 60000 // 缓存过期时间（毫秒）

/** 401防抖状态 */
let isUnauthorizedErrorShown = false
let unauthorizedTimer: NodeJS.Timeout | null = null

/** Token刷新状态 */
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

/** 扩展 AxiosRequestConfig */
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  showErrorMessage?: boolean
  showSuccessMessage?: boolean
  useCache?: boolean // 是否使用缓存
  cacheKey?: string // 自定义缓存键
  cacheExpiry?: number // 缓存过期时间（毫秒）
}

/** 请求缓存 */
interface RequestCache {
  data: any
  timestamp: number
  expiry: number
}

/** 缓存存储 */
const cacheStorage: Record<string, RequestCache> = {}

const { VITE_API_URL, VITE_WITH_CREDENTIALS } = import.meta.env

/** Axios实例 */
const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: VITE_API_URL,
  withCredentials: VITE_WITH_CREDENTIALS === 'true',
  validateStatus: (status) => status >= 200 && status < 300,
  transformResponse: [
    (data, headers) => {
      const contentType = headers['content-type']
      if (contentType?.includes('application/json')) {
        try {
          return JSON.parse(data)
        } catch {
          return data
        }
      }
      return data
    }
  ]
})

/** 请求拦截器 */
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const { accessToken } = useUserStore()
    if (accessToken) request.headers.set('Authorization', accessToken)

    if (request.data && !(request.data instanceof FormData) && !request.headers['Content-Type']) {
      request.headers.set('Content-Type', 'application/json')
      request.data = JSON.stringify(request.data)
    }

    return request
  },
  (error) => {
    showError(createHttpError($t('httpMsg.requestConfigError'), ApiStatus.error))
    return Promise.reject(error)
  }
)

/** 响应拦截器 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<BaseResponse>) => {
    const { code, msg } = response.data
    if (code === ApiStatus.success) return response
    if (code === ApiStatus.unauthorized) {
      // 尝试刷新token
      return handleTokenRefresh(response.config as InternalAxiosRequestConfig)
        .then(() => {
          // 刷新成功后重试请求
          return axiosInstance(response.config)
        })
        .catch(() => {
          handleUnauthorizedError(msg)
          throw createHttpError(msg || $t('httpMsg.unauthorized'), code)
        })
    }
    throw createHttpError(msg || $t('httpMsg.requestFailed'), code)
  },
  async (error) => {
    if (error.response?.status === ApiStatus.unauthorized) {
      try {
        // 确保配置存在
        if (!error.config) {
          handleUnauthorizedError()
          return Promise.reject(handleError(error))
        }

        // 尝试刷新token并获取新token
        const newToken = await handleTokenRefresh(error.config as InternalAxiosRequestConfig)

        // 确保配置中的token已更新
        if (error.config.headers) {
          error.config.headers.set('Authorization', newToken)
        }

        // 刷新成功后重试请求
        return axiosInstance(error.config)
      } catch {
        // 由于handleUnauthorizedError会抛出异常，这里不需要再返回Promise.reject
        handleUnauthorizedError()
      }
    }
    return Promise.reject(handleError(error))
  }
)

/** 统一创建HttpError */
function createHttpError(message: string, code: number) {
  return new HttpError(message, code)
}

/** 处理401错误（带防抖） */
function handleUnauthorizedError(message?: string): never {
  const error = createHttpError(message || $t('httpMsg.unauthorized'), ApiStatus.unauthorized)

  if (!isUnauthorizedErrorShown) {
    isUnauthorizedErrorShown = true
    logOut()

    unauthorizedTimer = setTimeout(resetUnauthorizedError, UNAUTHORIZED_DEBOUNCE_TIME)

    showError(error, true)
    throw error
  }

  throw error
}

/** 重置401防抖状态 */
function resetUnauthorizedError() {
  isUnauthorizedErrorShown = false
  if (unauthorizedTimer) clearTimeout(unauthorizedTimer)
  unauthorizedTimer = null
}

/** 退出登录函数 */
function logOut() {
  setTimeout(() => {
    useUserStore().logOut()
  }, LOGOUT_DELAY)
}

/** 刷新Token */
async function refreshToken() {
  const userStore = useUserStore()
  const { refreshToken } = userStore

  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  try {
    // 直接使用axios实例，避免触发拦截器
    const response = await axios.post<BaseResponse<{ accessToken: string }>>(
      `${VITE_API_URL}/api/auth/refresh`,
      { refreshToken },
      {
        timeout: REQUEST_TIMEOUT,
        withCredentials: VITE_WITH_CREDENTIALS === 'true'
      }
    )

    if (response.data.code === ApiStatus.success && response.data.data?.accessToken) {
      const newAccessToken = response.data.data.accessToken
      userStore.setToken(newAccessToken, refreshToken) // 保留原refreshToken
      return newAccessToken
    } else {
      throw new Error('Token refresh failed')
    }
  } catch (error) {
    console.error('Token refresh error:', error)
    throw error
  }
}

/** 处理Token刷新 */
function handleTokenRefresh(config: InternalAxiosRequestConfig): Promise<string> {
  // 如果正在刷新中，则将请求加入订阅队列
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshSubscribers.push((token) => {
        if (config.headers) {
          config.headers.set('Authorization', token)
        }
        resolve(token)
      })
    })
  }

  // 开始刷新token
  isRefreshing = true

  return refreshToken()
    .then((newToken) => {
      // 通知所有订阅的请求
      if (refreshSubscribers.length > 0) {
        refreshSubscribers.forEach((callback) => {
          try {
            callback(newToken)
          } catch (callbackError) {
            console.error('Error in refresh subscriber callback:', callbackError)
          }
        })
        refreshSubscribers = []
      }

      // 确保当前请求的token也已更新
      if (config.headers) {
        config.headers.set('Authorization', newToken)
      }

      return newToken
    })
    .catch((error) => {
      // 刷新失败时清空订阅列表，避免后续请求持续等待
      refreshSubscribers = []
      throw error
    })
    .finally(() => {
      isRefreshing = false
    })
}

/** 是否需要重试 */
function shouldRetry(statusCode: number) {
  return [
    ApiStatus.requestTimeout,
    ApiStatus.internalServerError,
    ApiStatus.badGateway,
    ApiStatus.serviceUnavailable,
    ApiStatus.gatewayTimeout
  ].includes(statusCode)
}

/** 请求重试逻辑 */
async function retryRequest<T>(
  config: ExtendedAxiosRequestConfig,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await request<T>(config)
  } catch (error) {
    if (retries > 0 && error instanceof HttpError && shouldRetry(error.code)) {
      await delay(RETRY_DELAY)
      return retryRequest<T>(config, retries - 1)
    }
    throw error
  }
}

/** 延迟函数 */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 生成缓存键 */
function generateCacheKey(config: ExtendedAxiosRequestConfig): string {
  if (config.cacheKey) {
    return config.cacheKey
  }

  const { url, method, params, data } = config
  const keyParts = [
    url || '',
    method || 'GET',
    JSON.stringify(params || {}),
    JSON.stringify(data || {})
  ]

  return keyParts.join('|')
}

/** 检查缓存是否有效 */
function isCacheValid(cache: RequestCache): boolean {
  if (!cache) return false

  const now = Date.now()
  return now - cache.timestamp < cache.expiry
}

/** 获取缓存 */
function getCache(key: string): any {
  const cache = cacheStorage[key]
  if (isCacheValid(cache)) {
    return cache.data
  }

  // 缓存过期，清除缓存
  delete cacheStorage[key]
  return null
}

/** 设置缓存 */
function setCache(key: string, data: any, expiry: number = CACHE_EXPIRY_TIME): void {
  cacheStorage[key] = {
    data,
    timestamp: Date.now(),
    expiry
  }
}

/** 清除缓存 */
function clearCache(key?: string): void {
  if (key) {
    delete cacheStorage[key]
  } else {
    Object.keys(cacheStorage).forEach((cacheKey) => {
      delete cacheStorage[cacheKey]
    })
  }
}

/** 请求函数 */
async function request<T = any>(config: ExtendedAxiosRequestConfig): Promise<T> {
  // 检查缓存
  if (config.useCache && config.method?.toUpperCase() === 'GET') {
    const cacheKey = generateCacheKey(config)
    const cachedData = getCache(cacheKey)

    if (cachedData) {
      console.log(`[HTTP Cache] Using cached data for: ${config.url}`)
      return cachedData as T
    }
  }

  // POST | PUT 参数自动填充
  if (
    ['POST', 'PUT'].includes(config.method?.toUpperCase() || '') &&
    config.params &&
    !config.data
  ) {
    config.data = config.params
    config.params = undefined
  }

  try {
    const res = await axiosInstance.request<BaseResponse<T>>(config)

    // 显示成功消息
    if (config.showSuccessMessage && res.data.msg) {
      showSuccess(res.data.msg)
    }

    // 存储缓存
    if (config.useCache && config.method?.toUpperCase() === 'GET') {
      const cacheKey = generateCacheKey(config)
      const cacheExpiry = config.cacheExpiry || CACHE_EXPIRY_TIME
      setCache(cacheKey, res.data.data, cacheExpiry)
      console.log(`[HTTP Cache] Stored data for: ${config.url}`)
    }

    return res.data.data as T
  } catch (error) {
    if (error instanceof HttpError && error.code !== ApiStatus.unauthorized) {
      const showMsg = config.showErrorMessage !== false
      showError(error, showMsg)
    }
    return Promise.reject(error)
  }
}

/** API方法集合 */
const api = {
  get<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'GET' })
  },
  post<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'POST' })
  },
  put<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'PUT' })
  },
  del<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'DELETE' })
  },
  request<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>(config)
  },
  clearCache(key?: string) {
    clearCache(key)
  }
}

export default api
