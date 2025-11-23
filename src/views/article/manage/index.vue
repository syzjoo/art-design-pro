<template>
  <div class="article-manage">
    <div class="rt-full-height">
      <!-- <template #header>
        <div class="card-header">
          <span>文章管理</span>
        </div>
      </template> -->

      <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick" :stretch="true">
        <el-tab-pane label="文章分类" name="category">
          <CategoryManage @refresh="handleRefresh('category')" />
        </el-tab-pane>
        <el-tab-pane label="文章标签" name="tag">
          <TagManage @refresh="handleRefresh('tag')" />
        </el-tab-pane>
        <el-tab-pane label="文章类型" name="type">
          <TypeManage @refresh="handleRefresh('type')" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import CategoryManage from '@/views/article/manage/modules/CategoryManage.vue'
  import TagManage from '@/views/article/manage/modules/TagManage.vue'
  import TypeManage from '@/views/article/manage/modules/TypeManage.vue'

  // 当前激活的标签页
  const activeTab = ref('category')

  // 标签页点击事件
  const handleTabClick = (tab: any) => {
    console.log('切换到标签页:', tab.paneName)
    activeTab.value = tab.paneName
  }

  // 处理子组件刷新事件
  const handleRefresh = (type: string) => {
    console.log(`刷新 ${type} 数据`)
    // 这里可以根据需要添加全局刷新逻辑，比如更新统计信息等
  }

  // 组件挂载完成后的处理
  console.log('文章管理页面组件已挂载')
</script>

<style scoped>
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* 增强标签页的样式 */
  :deep(.el-tabs__content) {
    padding-top: 5px;
  }
</style>
