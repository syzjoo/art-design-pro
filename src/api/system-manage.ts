import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'
import type { BaseResponse } from '@/types/common/response'

// 用户管理相关API

// 获取用户列表
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/api/user/list',
    params
  })
}

// 创建用户
export function fetchCreateUser(data: Api.SystemManage.UserCreateParams) {
  return request.post<BaseResponse>({
    url: '/api/user',
    data,
    showSuccessMessage: true,
    showErrorMessage: true
  })
}

// 更新用户
export function fetchUpdateUser(id: number, data: Api.SystemManage.UserUpdateParams) {
  return request.put<BaseResponse>({
    url: `/api/user/${id}`,
    data,
    showSuccessMessage: true,
    showErrorMessage: true
  })
}

// 删除用户
export function fetchDeleteUser(id: number) {
  return request.del<BaseResponse>({
    url: `/api/user/${id}`,
    showSuccessMessage: true,
    showErrorMessage: true
  })
}

// // 获取用户详情
// export function fetchGetUserDetail(id: number) {
//   return request.get<BaseResponse<Api.SystemManage.UserListItem>>({
//     url: `/api/user/${id}`
//   })
// }

// 获取角色列表（用于用户对话框中的角色选择）
export function fetchGetRoleList(params?: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/api/role/list',
    params: {
      size: 100, // 获取足够多的角色供选择
      ...params
    }
  })
}

//菜单管理相关API
// 获取菜单列表
export function fetchGetMenuList() {
  return request.get<AppRouteRecord[]>({
    url: '/api/system/menus/simple'
  })
}

// 创建菜单
export function fetchCreateMenu(data: Api.SystemManage.MenuCreateParams) {
  return request.post<BaseResponse>({
    url: '/api/system/menus',
    data,
    showSuccessMessage: true,
    showErrorMessage: true
  })
}

// 更新菜单
export function fetchUpdateMenu(data: Api.SystemManage.MenuUpdateParams) {
  return request.put<BaseResponse>({
    url: `/api/system/menus/${data.id}`,
    data,
    showSuccessMessage: true,
    showErrorMessage: true
  })
}

// 删除菜单
export function fetchDeleteMenu(id: number) {
  return request.del<BaseResponse>({
    url: `/api/system/menus/${id}`,
    showSuccessMessage: true,
    showErrorMessage: true
  })
}

// 创建权限按钮
export function fetchCreatePermission(data: Api.SystemManage.PermissionCreateParams) {
  return request.post<BaseResponse>({
    url: '/api/system/permissions',
    data,
    showSuccessMessage: true,
    showErrorMessage: true
  })
}

// 更新权限按钮
export function fetchUpdatePermission(data: Api.SystemManage.PermissionUpdateParams) {
  return request.put<BaseResponse>({
    url: `/api/system/permissions/${data.id}`,
    data,
    showSuccessMessage: true,
    showErrorMessage: true
  })
}

// 删除权限按钮 - 仅支持authMark，不再支持ID
export function fetchDeletePermission(authMark: string) {
  return request.del<BaseResponse>({
    url: `/api/system/permissions/${authMark}`,
    showSuccessMessage: true,
    showErrorMessage: true
  })
}

// 角色管理相关API

// 创建角色
export function fetchCreateRole(data: Api.SystemManage.RoleCreateParams) {
  return request.post<BaseResponse>({
    url: '/api/role',
    data,
    showSuccessMessage: true,
    showErrorMessage: true
  })
}

// 更新角色
export function fetchUpdateRole(id: number, data: Api.SystemManage.RoleUpdateParams) {
  return request.put<BaseResponse>({
    url: `/api/role/${id}`,
    data,
    showSuccessMessage: true,
    showErrorMessage: true
  })
}

// 删除角色
export function fetchDeleteRole(id: number) {
  return request.del<BaseResponse>({
    url: `/api/role/${id}`,
    showSuccessMessage: true,
    showErrorMessage: true
  })
}

// 获取角色菜单权限
export function fetchGetRoleMenusPermissions(id: number) {
  return request.get<Api.SystemManage.PermissionResponse>({
    url: `/api/role/menusPermissions/${id}`
  })
}

// 保存角色权限
export function fetchSaveRolePermission(data: Api.SystemManage.RolePermissionSaveParams) {
  return request.post<BaseResponse>({
    url: '/api/role/permission',
    data,
    showSuccessMessage: true,
    showErrorMessage: true
  })
}
