import { AppRouteRecord } from '@/types/router'

export const projectRoutes: AppRouteRecord = {
  name: 'Project',
  path: '/project',
  component: '/index/index',
  meta: {
    title: 'menus.project.title',
    icon: 'ri:folder-chart-line',
    roles: ['R_SUPER', 'R_ADMIN', 'R_PROJECT_MANAGER']
  },
  children: [
    {
      path: 'statistics',
      name: 'ProjectStatistics',
      component: '/project/statistics',
      meta: {
        title: 'menus.project.statistics',
        keepAlive: false,
        fixedTab: false
      }
    },
    {
      path: 'list',
      name: 'ProjectList',
      component: '/project/list',
      meta: {
        title: 'menus.project.list',
        keepAlive: true,
        fixedTab: false
      }
    },
    {
      path: 'detail/:id',
      name: 'ProjectDetail',
      component: '/project/detail',
      meta: {
        title: 'menus.project.detail',
        keepAlive: false,
        hidden: true
      }
    },
    {
      path: 'task',
      name: 'ProjectTask',
      component: '/project/task',
      meta: {
        title: 'menus.project.task',
        keepAlive: true,
        fixedTab: false
      }
    },
    {
      path: 'finance',
      name: 'ProjectFinance',
      component: '/project/finance',
      meta: {
        title: 'menus.project.finance',
        keepAlive: true,
        fixedTab: false
      }
    }
  ]
}
