import { AppRouteRecord } from '@/types/router'

/**
 * 项目相关路由配置
 */
export const itemRoutes: AppRouteRecord = {
  name: 'Item',
  path: '/item',
  component: '/index/index',
  meta: {
    title: 'menus.item.title',
    icon: 'ri:briefcase-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'list',
      name: 'ItemList',
      component: '/item/list',
      meta: {
        title: 'menus.item.list',
        icon: 'ri:list-check',
        keepAlive: false
      }
    },
    {
      path: 'create',
      name: 'ItemCreate',
      component: '/item/create',
      meta: {
        title: 'menus.item.create',
        icon: 'ri:add-line',
        keepAlive: false,
        isHideTab: true
      }
    },
    {
      path: 'detail/:id',
      name: 'ItemDetail',
      component: '/item/detail',
      meta: {
        title: 'menus.item.detail',
        icon: 'ri:eye-line',
        keepAlive: false,
        isHideTab: true
      }
    },
    {
      path: 'todo',
      name: 'ItemTodo',
      component: '/item/todo',
      meta: {
        title: 'menus.item.todo',
        icon: 'ri:calendar-check-line',
        keepAlive: false
      }
    }
  ]
}
