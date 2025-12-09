/**
 * 评论模拟数据生成器
 */
import type { Comment, ArticleCommentStats, CommentStatus } from '@/types/api/article'

/**
 * 生成随机评论内容
 */
const generateRandomCommentContent = (): string => {
  const comments = [
    '这篇文章写得非常好，学到了很多东西！',
    '感谢分享，对我很有帮助。',
    '内容很详细，期待更多这样的文章。',
    '有一些地方不太明白，希望能进一步解释。',
    '文章结构清晰，逻辑严谨，点赞！',
    '这个观点很新颖，值得深入思考。',
    '作者写得很用心，支持一下！',
    '学到了新知识，谢谢分享。',
    '有收获，希望能看到更多类似的内容。',
    '文章很实用，解决了我的问题。'
  ]
  return comments[Math.floor(Math.random() * comments.length)]
}

/**
 * 生成随机评论作者
 */
const generateRandomAuthor = (): string => {
  const authors = [
    '小明',
    '小红',
    '小李',
    '小张',
    '小王',
    '匿名用户',
    '访客',
    '读者',
    '粉丝',
    '用户'
  ]
  return authors[Math.floor(Math.random() * authors.length)]
}

/**
 * 生成随机评论状态
 */
const generateRandomCommentStatus = (): CommentStatus => {
  const statuses: CommentStatus[] = ['approved', 'pending', 'rejected']
  return statuses[Math.floor(Math.random() * statuses.length)]
}

/**
 * 生成随机时间
 */
const generateRandomTime = (days: number = 30): string => {
  const now = new Date()
  const randomTime = new Date(now.getTime() - Math.random() * days * 24 * 60 * 60 * 1000)
  return randomTime.toISOString().slice(0, 19).replace('T', ' ')
}

/**
 * 生成模拟评论列表
 */
export const generateMockComments = (articleId: number, count: number = 5): Comment[] => {
  const comments: Comment[] = []

  for (let i = 0; i < count; i++) {
    const hasReplies = Math.random() > 0.5
    const repliesCount = hasReplies ? Math.floor(Math.random() * 3) + 1 : 0
    const replies: Comment[] = []

    for (let j = 0; j < repliesCount; j++) {
      replies.push({
        id: count + j + 1,
        articleId,
        content: generateRandomCommentContent(),
        parentId: i + 1,
        replyToUserId: null,
        likeCount: Math.floor(Math.random() * 50),
        status: generateRandomCommentStatus(),
        author: generateRandomAuthor(),
        timestamp: generateRandomTime(15),
        replies: []
      })
    }

    comments.push({
      id: i + 1,
      articleId,
      content: generateRandomCommentContent(),
      parentId: 0,
      replyToUserId: null,
      likeCount: Math.floor(Math.random() * 100),
      status: generateRandomCommentStatus(),
      author: generateRandomAuthor(),
      timestamp: generateRandomTime(),
      replies
    })
  }

  return comments
}

/**
 * 生成模拟文章评论统计数据
 */
export const generateMockArticleCommentStats = (count: number = 10): ArticleCommentStats[] => {
  const stats: ArticleCommentStats[] = []
  const articleTitles = [
    'Vue 3 Composition API 详解',
    'TypeScript 入门指南',
    'React Hooks 最佳实践',
    'Node.js 性能优化技巧',
    '前端工程化实践',
    'CSS Grid 布局教程',
    'JavaScript 异步编程',
    'Webpack 配置详解',
    '响应式设计原则',
    '前端性能优化'
  ]

  for (let i = 0; i < count; i++) {
    const totalComments = Math.floor(Math.random() * 100) + 10
    const pending = Math.floor(Math.random() * 20)
    const approved = totalComments - pending - Math.floor(Math.random() * 10)
    const rejected = totalComments - pending - approved

    stats.push({
      articleId: i + 1,
      articleTitle: articleTitles[i % articleTitles.length],
      articleSummary: `这是关于${articleTitles[i % articleTitles.length]}的详细介绍，包含了丰富的实战案例和代码示例。`,
      publishTime: generateRandomTime(90),
      articleAuthor: generateRandomAuthor(),
      totalComments,
      totalLikes: Math.floor(Math.random() * 500) + 50,
      latestComment: {
        id: totalComments,
        content: generateRandomCommentContent(),
        author: generateRandomAuthor(),
        timestamp: generateRandomTime(7),
        status: generateRandomCommentStatus()
      },
      commentStatusStats: {
        pending,
        approved,
        rejected
      }
    })
  }

  return stats
}

/**
 * 模拟评论列表响应
 */
export const mockCommentListResponse = (articleId: number, count: number = 5): Comment[] => {
  return generateMockComments(articleId, count)
}

/**
 * 模拟文章评论统计响应
 */
export const mockArticleCommentStatsResponse = (): { records: ArticleCommentStats[] } => {
  return {
    records: generateMockArticleCommentStats()
  }
}
