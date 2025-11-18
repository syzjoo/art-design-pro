/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义
 *
 * ## 主要功能
 *
 * - 通用类型（分页参数、响应结构等）
 * - 认证类型（登录、用户信息等）
 * - 系统管理类型（用户、角色等）
 * - 全局命名空间声明
 *
 * ## 使用场景
 *
 * - API 请求参数类型约束
 * - API 响应数据类型定义
 * - 接口文档类型同步
 *
 * ## 注意事项
 *
 * - 在 .vue 文件使用需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 * - 使用全局命名空间，无需导入即可使用
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = { userName: 'admin', password: '123456' }
 * const response: Api.Auth.UserInfo = await fetchUserInfo()
 * ```
 *
 * @module types/api/api
 * @author Art Design Pro Team
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      userName: string
      password: string
    }

    /** 登录响应 */
    interface LoginResponse {
      user: UserInfo
      accessToken: string
      refreshToken: string
    }

    /** 刷新令牌参数 */
    interface RefreshTokenParams {
      refreshToken: string
    }

    /** 刷新令牌响应 */
    interface RefreshTokenResponse {
      accessToken: string
    }

    /** 用户信息 */
    interface UserInfo {
      buttons: string[]
      roles: string[]
      userId: number
      userName: string
      email: string
      avatar?: string
    }

    /** 邮箱验证码响应 */
    interface EmailCodeResponse {
      code: number
      message: string
      data?: any
    }

    /** 注册参数 */
    interface RegisterParams {
      username: string
      email: string
      emailCode: string
      password: string
    }

    /** 注册响应 */
    interface RegisterResponse {
      code: number
      message: string
      data?: any
    }

    /** 重置密码参数 */
    interface ResetPasswordParams {
      email: string
      emailCode: string
      password: string
    }

    /** 重置密码响应 */
    interface ResetPasswordResponse extends BaseResponse {
      data?: null
    }
  }

  /** 系统管理类型 */
  namespace SystemManage {
    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** 用户列表项 */
    interface UserListItem {
      id: number
      avatar: string
      status: string
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      userRoles: string[]
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    /** 用户搜索参数 */
    type UserSearchParams = Partial<
      Pick<UserListItem, 'id' | 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status'> &
        Api.Common.CommonSearchParams
    >

    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** 角色列表项 */
    interface RoleListItem {
      roleId: number
      roleName: string
      roleCode: string
      description: string
      enabled: boolean
      createTime: string
      roleType: number
    }

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'enabled'> &
        Api.Common.CommonSearchParams
    >

    /** 用户创建参数 */
    interface UserCreateParams {
      username: string
      phone: string
      gender: string
      role: string[]
      email?: string
    }

    /** 用户更新参数 */
    interface UserUpdateParams {
      username: string
      phone: string
      gender: string
      role: string[]
      email?: string
    }

    /** 角色创建参数 */
    interface RoleCreateParams {
      roleName: string
      roleCode: string
      description: string
      enabled: boolean
      roleType: number
    }

    /** 角色更新参数 */
    interface RoleUpdateParams {
      roleName: string
      roleCode: string
      description: string
      enabled: boolean
      roleType: number
    }

    /** 角色详情 */
    interface RoleDetail {
      roleId: number
      roleName: string
      roleCode: string
      description: string
      enabled: boolean
      createTime: string
      updateTime: string
      roleType: number
      menuIds?: number[]
      permissionIds?: number[]
    }

    /** 权限 */
    interface Permission {
      id: number
      name: string
      code: string
      description: string
      menuId: number
      createTime: string
    }

    /** 菜单 */
    interface Menu {
      id: number
      name: string
      path: string
      component: string
      icon?: string
      parentId: number
      sort: number
      type: string
      permissions?: Permission[]
      children?: Menu[]
    }

    /** 菜单创建参数 */
    interface MenuCreateParams {
      name: string
      path: string
      label?: string
      component: string
      icon?: string
      parentId: number
      sort: number
      type?: string
      isEnable?: boolean
      isMenu?: boolean
      keepAlive?: boolean
      isHide?: boolean
      isHideTab?: boolean
      link?: string
      isIframe?: boolean
      showBadge?: boolean
      showTextBadge?: string
      fixedTab?: boolean
      activePath?: string
      roles?: string[]
      isFullPage?: boolean
    }

    /** 菜单更新参数 */
    interface MenuUpdateParams {
      id: number
      name: string
      path: string
      label?: string
      component: string
      icon?: string
      parentId?: number
      sort: number
      type?: string
      isEnable?: boolean
      isMenu?: boolean
      keepAlive?: boolean
      isHide?: boolean
      isHideTab?: boolean
      link?: string
      isIframe?: boolean
      showBadge?: boolean
      showTextBadge?: string
      fixedTab?: boolean
      activePath?: string
      roles?: string[]
      isFullPage?: boolean
    }

    /** 权限按钮创建参数 */
    interface PermissionCreateParams {
      authName: string
      authLabel: string
      authIcon?: string
      authSort: number
      menuId: number
    }

    /** 权限按钮更新参数 */
    interface PermissionUpdateParams {
      id: number
      authName: string
      authLabel: string
      authIcon?: string
      authSort: number
      menuId: number
    }

    /** 权限响应 */
    interface PermissionResponse extends Api.Common.BaseResponse {
      checkedKeys: string[]
      halfCheckedKeys: string[]
      checkedNodes: any[]
      halfCheckedNodes: any[]
    }

    /** 角色权限保存参数 */
    interface RolePermissionSaveParams {
      /** 角色ID */
      roleId: number
      /** 选中的节点Key列表 */
      checkedKeys: (string | number)[]
      /** 半选中的节点Key列表 */
      halfCheckedKeys?: (string | number)[]
      checkedNodes?: any[]
      halfCheckedNodes?: any[]
      totalChecked?: number
      totalHalfChecked?: number
    }
  }
}
