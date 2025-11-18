import request from '@/utils/http'

/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<{
    user: Api.Auth.UserInfo
    accessToken: string
    refreshToken: string
  }>({
    url: '/api/auth/login',
    params,
    showSuccessMessage: true
  })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>({
    url: '/api/user/info'
    // 自定义请求头
    // headers: {
    //   'X-Custom-Header': 'your-custom-value'
    // }
  })
}

/**
 * 发送邮箱验证码
 * @param params 邮箱参数
 * @returns 发送结果
 */
export function fetchSendEmailCode(params: { email: string }) {
  return request.post<Api.Auth.EmailCodeResponse>({
    url: '/api/auth/send-email-code',
    params,
    showSuccessMessage: true
  })
}

/**
 * 用户注册
 * @param params 注册参数
 * @returns 注册结果
 */
export function fetchRegister(params: Api.Auth.RegisterParams) {
  return request.post<Api.Auth.RegisterResponse>({
    url: '/api/auth/register',
    params,
    showSuccessMessage: true
  })
}

/**
 * 重置密码
 * @param params 重置密码参数
 * @returns 重置结果
 */
export function fetchResetPassword(params: Api.Auth.ResetPasswordParams) {
  return request.post<Api.Auth.ResetPasswordResponse>({
    url: '/api/auth/reset-password',
    params,
    showSuccessMessage: true
  })
}
