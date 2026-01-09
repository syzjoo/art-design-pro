<template>
  <div class="table-todo-list-container" :style="props.style" :class="props.class">
    <!-- 列表视图 -->
    <div class="w-full flex flex-col" v-if="listType === 'list'">
      <div style="flex: 1; min-height: 0">
        <ArtTable
          ref="tableRef"
          rowKey="id"
          :loading="props.loading"
          :columns="getColumnsWithFormatters"
          :data="tableData"
          :stripe="false"
          :height="tableHeight"
          @selection-change="handleSelectionChange"
        />
      </div>
      <div
        style="display: flex; justify-content: center; margin-top: 20px"
        v-if="tableData.length || pagination.total > 0"
      >
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 卡片视图 -->
    <div class="w-full flex flex-col" v-else-if="listType === 'card'">
      <div
        style="
          max-height: calc(100vh - 400px);
          margin-top: 10px;
          margin-bottom: 10px;
          overflow-y: auto;
        "
      >
        <div
          class="grid grid-cols-5 gap-5 max-2xl:grid-cols-4 max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1"
        >
          <div
            class="group c-p overflow-hidden border border-g-300/60 rounded-custom-sm"
            v-for="task in tableData"
            :key="task.id"
            :class="{
              completed: task.status === 'completed',
              'in-progress': task.status === 'in_progress',
              pending: task.status === 'pending',
              delayed: task.status === 'delayed'
            }"
          >
            <div class="relative aspect-[16/9.5] bg-gray-50/80">
              <div class="p-3">
                <div class="task-meta">
                  <span class="project-name text-sm text-g-600">{{ task.projectName }}</span>
                  <span class="node-name text-sm text-g-600 ml-2">| {{ task.nodeName }}</span>
                </div>
              </div>
              <div class="absolute top-1 right-1 flex flex-col items-end gap-1">
                <el-tag
                  :type="
                    task.priority === 'high'
                      ? 'danger'
                      : task.priority === 'medium'
                        ? 'warning'
                        : 'success'
                  "
                  size="small"
                  effect="light"
                >
                  {{ task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低' }}
                </el-tag>
                <el-tag
                  :type="
                    task.status === 'completed'
                      ? 'success'
                      : task.status === 'in_progress'
                        ? 'primary'
                        : task.status === 'pending'
                          ? 'info'
                          : 'danger'
                  "
                  size="small"
                  effect="light"
                >
                  {{
                    task.status === 'completed'
                      ? '已完成'
                      : task.status === 'in_progress'
                        ? '进行中'
                        : task.status === 'pending'
                          ? '待开始'
                          : '已延期'
                  }}
                </el-tag>
              </div>
            </div>
            <div class="px-2 py-1">
              <h3 class="text-base font-medium mb-2 line-clamp-2">{{ task.name }}</h3>
              <div class="flex items-center gap-2 mb-3 text-sm text-g-500">
                <span>截止时间：</span>
                <span
                  class="deadline"
                  :class="{ 'text-danger font-medium': task.status === 'delayed' }"
                >
                  {{ task.deadline }}
                </span>
              </div>
              <div class="flex-b w-full h-6 mt-1">
                <div class="flex-c text-g-500">
                  <span class="text-sm">{{ task.deadline }}</span>
                </div>
                <div
                  class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <ArtButtonTable
                    v-if="task.status !== 'completed'"
                    type="top"
                    @click="() => completeTask(task.id)"
                  >
                    完成
                  </ArtButtonTable>
                  <ArtButtonTable v-else type="hot" @click="() => uncompleteTask(task.id)">
                    撤销
                  </ArtButtonTable>
                  <ArtButtonTable type="edit" @click="() => editTask(task)"> 编辑 </ArtButtonTable>
                  <ArtButtonTable type="delete" @click="() => deleteTask(task.id)">
                    删除
                  </ArtButtonTable>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        style="display: flex; justify-content: center"
        v-if="tableData.length || pagination.total > 0"
      >
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-if="!tableData.length && !props.loading">
      <el-empty description="未找到相关数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch, h } from 'vue'
  import { ElTag } from 'element-plus'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import type { ColumnOption } from '@/types/component'

  // 任务数据类型
  export interface TodoTask {
    id: number
    name: string
    projectName: string
    nodeName: string
    priority: 'high' | 'medium' | 'low'
    status: 'completed' | 'in_progress' | 'pending' | 'delayed'
    deadline: string
  }

  // Props定义
  const props = defineProps<{
    listType: 'list' | 'card'
    tasks: TodoTask[]
    // 接收外部传入的列配置，用于列显隐控制
    columns?: any[]
    loading?: boolean
    // 接收外部传入的样式和类名
    style?: any
    class?: any
  }>()

  const emit = defineEmits<{
    (e: 'refresh'): void
    (e: 'selectionChange', selection: TodoTask[]): void
    (e: 'complete', id: number): void
    (e: 'uncomplete', id: number): void
    (e: 'edit', task: TodoTask): void
    (e: 'delete', id: number): void
  }>()

  const tableRef = ref()

  // 表格数据和分页
  const tableData = ref<TodoTask[]>([])
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 选中的任务列表
  const selectedTasks = ref<TodoTask[]>([])

  // 计算表格高度
  const tableHeight = computed(() => {
    return 'calc(100vh - 400px)'
  })

  // 表格列配置 - 使用useTableColumns钩子
  const { columns: internalColumns } = useTableColumns(() => [
    {
      type: 'selection',
      width: 50,
      align: 'center',
      isFixed: true
    },
    {
      prop: 'id',
      label: 'ID',
      width: 80,
      align: 'center',
      isFixed: true
    },
    {
      prop: 'name',
      label: '任务名称',
      minWidth: 350,
      formatter: (row: TodoTask) => {
        const elements: any[] = []

        // 添加优先级标签
        const priorityMap: Record<string, { type: string; text: string }> = {
          high: { type: 'danger', text: '高' },
          medium: { type: 'warning', text: '中' },
          low: { type: 'success', text: '低' }
        }
        const priorityInfo = priorityMap[row.priority] || { type: 'info', text: '未知' }
        elements.push(
          h(
            ElTag,
            { type: priorityInfo.type as any, size: 'small', style: { marginRight: '4px' } },
            () => priorityInfo.text
          )
        )

        // 添加状态标签
        const statusMap: Record<string, { type: string; text: string }> = {
          completed: { type: 'success', text: '已完成' },
          in_progress: { type: 'primary', text: '进行中' },
          pending: { type: 'info', text: '待开始' },
          delayed: { type: 'danger', text: '已延期' }
        }
        const statusInfo = statusMap[row.status] || { type: 'info', text: '未知' }
        elements.push(
          h(
            ElTag,
            { type: statusInfo.type as any, size: 'small', style: { marginRight: '4px' } },
            () => statusInfo.text
          )
        )

        // 添加任务名称
        elements.push(
          h(
            'span',
            {
              style: {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '250px'
              }
            },
            row.name
          )
        )

        return h(
          'div',
          { style: { display: 'flex', alignItems: 'center', flexWrap: 'wrap' } },
          elements
        )
      }
    },
    {
      prop: 'projectName',
      label: '所属项目',
      width: 120,
      formatter: (row: TodoTask) => {
        return h(ElTag, { type: 'primary' as any }, () => row.projectName)
      }
    },
    {
      prop: 'nodeName',
      label: '所属节点',
      width: 120,
      formatter: (row: TodoTask) => {
        return h(ElTag, { type: 'info' as any }, () => row.nodeName)
      }
    },
    {
      prop: 'priority',
      label: '优先级',
      width: 80,
      align: 'center',
      formatter: (row: TodoTask) => {
        const priorityMap: Record<string, { type: string; text: string }> = {
          high: { type: 'danger', text: '高' },
          medium: { type: 'warning', text: '中' },
          low: { type: 'success', text: '低' }
        }
        const priorityInfo = priorityMap[row.priority] || { type: 'info', text: '未知' }
        return h(ElTag, { type: priorityInfo.type as any, size: 'small' }, () => priorityInfo.text)
      }
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      align: 'center',
      formatter: (row: TodoTask) => {
        const statusMap: Record<string, { type: string; text: string }> = {
          completed: { type: 'success', text: '已完成' },
          in_progress: { type: 'primary', text: '进行中' },
          pending: { type: 'info', text: '待开始' },
          delayed: { type: 'danger', text: '已延期' }
        }
        const statusInfo = statusMap[row.status] || { type: 'info', text: '未知' }
        return h(ElTag, { type: statusInfo.type as any, size: 'small' }, () => statusInfo.text)
      }
    },
    {
      prop: 'deadline',
      label: '截止时间',
      width: 150,
      formatter: (row: TodoTask) => {
        const className = row.status === 'delayed' ? 'text-danger font-medium' : ''
        return h('span', { class: className }, row.deadline)
      }
    },
    {
      prop: 'operation',
      label: '操作',
      width: 280,
      align: 'right',
      fixed: 'right',
      formatter: (row: TodoTask) => {
        const buttons: any[] = []

        if (row.status !== 'completed') {
          buttons.push(
            h(
              ArtButtonTable,
              {
                type: 'top',
                onClick: () => completeTask(row.id)
              },
              () => '完成'
            )
          )
        } else {
          buttons.push(
            h(
              ArtButtonTable,
              {
                type: 'hot',
                onClick: () => uncompleteTask(row.id)
              },
              () => '撤销'
            )
          )
        }

        buttons.push(
          h(
            ArtButtonTable,
            {
              type: 'edit',
              onClick: () => editTask(row)
            },
            () => '编辑'
          )
        )

        buttons.push(
          h(
            ArtButtonTable,
            {
              type: 'delete',
              onClick: () => deleteTask(row.id)
            },
            () => '删除'
          )
        )

        return h(
          'div',
          { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end' } },
          buttons
        )
      }
    }
  ])

  // 刷新数据方法
  const refreshData = () => {
    // 更新分页总数
    pagination.total = props.tasks.length

    // 分页处理
    const start = (pagination.current - 1) * pagination.size
    const end = start + pagination.size
    tableData.value = props.tasks.slice(start, end)
  }

  // 完成任务
  const completeTask = (id: number) => {
    emit('complete', id)
  }

  // 撤销完成任务
  const uncompleteTask = (id: number) => {
    emit('uncomplete', id)
  }

  // 编辑任务
  const editTask = (task: TodoTask) => {
    emit('edit', task)
  }

  // 删除任务
  const deleteTask = (id: number) => {
    emit('delete', id)
  }

  // 处理表格行选择
  const handleSelectionChange = (selection: TodoTask[]) => {
    selectedTasks.value = selection
    // 向父组件发送选中的任务列表
    emit('selectionChange', selection)
  }

  // 合并父组件传递的columns和内部的formatter函数
  const getColumnsWithFormatters = computed(() => {
    if (!props.columns) {
      return internalColumns.value
    }

    // 创建内部列的formatter映射
    const formatterMap = new Map()
    internalColumns.value.forEach((col: ColumnOption) => {
      if (col.formatter) {
        formatterMap.set(col.prop, col.formatter)
      }
    })

    // 合并父组件传递的columns和内部的formatter
    return props.columns.map((col: ColumnOption) => {
      const formatter = formatterMap.get(col.prop)
      return formatter ? { ...col, formatter } : col
    })
  })

  // 暴露表格列配置、刷新方法给父组件
  defineExpose({
    columns: getColumnsWithFormatters,
    refreshData
  })

  // 分页处理
  const handleSizeChange = (size: number) => {
    pagination.size = size
    refreshData()
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
    refreshData()
  }

  // 监听任务数据变化，重新分页
  watch(
    () => props.tasks,
    () => {
      refreshData()
    },
    { deep: true }
  )

  // 监听列表类型变化
  watch(
    () => props.listType,
    () => {
      refreshData()
    }
  )

  // 组件挂载时初始化数据
  refreshData()
</script>

<style lang="scss" scoped>
  // 空状态样式
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px; // 确保有足够的高度
    margin-top: 20px;
  }

  // 卡片列表样式优化
  .grid {
    gap: 20px !important;
  }

  // 卡片样式优化
  .group {
    box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 5px 15px rgb(0 0 0 / 15%);
      transform: translateY(-5px);
    }

    &.completed {
      border-left: 4px solid #67c23a;
    }

    &.in-progress {
      border-left: 4px solid #409eff;
    }

    &.pending {
      border-left: 4px solid #909399;
    }

    &.delayed {
      border-left: 4px solid #f56c6c;
    }
  }

  // 分页器样式优化
  :deep(.el-pagination) {
    margin-top: 3px;
  }
</style>
