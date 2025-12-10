import { AppRouteRecord } from '@/types/router'

/**
 * 文章相关路由配置
 */
export const articleRoutes: AppRouteRecord = {
  name: 'Article',
  path: '/article',
  component: '/index/index',
  meta: {
    title: 'menus.article.title',
    icon: 'ri:file-text-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'list',
      name: 'ArticleList',
      component: '/article/list',
      meta: {
        title: 'menus.article.list',
        icon: 'ri:list-check',
        keepAlive: false
      }
    },
    {
      path: 'publish',
      name: 'ArticlePublish',
      component: '/article/publish',
      meta: {
        title: 'menus.article.publish',
        icon: 'ri:edit-box-line',
        keepAlive: false
      }
    },
    {
      path: 'detail/:id',
      name: 'ArticleDetail',
      component: '/article/detail',
      meta: {
        title: 'menus.article.detail',
        icon: 'ri:eye-line',
        keepAlive: false,
        isHideTab: true
      }
    },
    {
      path: 'category',
      name: 'ArticleCategory',
      component: '/article/category',
      meta: {
        title: 'menus.article.category',
        icon: 'ri:layout-grid-line',
        keepAlive: false
      }
    },
    {
      path: 'tag',
      name: 'ArticleTag',
      component: '/article/tag',
      meta: {
        title: 'menus.article.tag',
        icon: 'ri:price-tag-line',
        keepAlive: false
      }
    },
    {
      path: 'comment',
      name: 'ArticleComment',
      component: '/article/comment',
      meta: {
        title: 'menus.article.comment',
        icon: 'ri:chat-3-line',
        keepAlive: false
      }
    }
  ]
}
