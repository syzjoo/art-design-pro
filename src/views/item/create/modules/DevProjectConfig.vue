<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="前端框架" prop="frontFramework">
          <el-select v-model="form.frontFramework" placeholder="请选择前端框架">
            <el-option label="Vue3+Vite" value="vue3+vite" />
            <el-option label="React+Webpack" value="react+webpack" />
            <el-option label="Angular" value="angular" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="后端技术" prop="backFramework">
          <el-select v-model="form.backFramework" placeholder="请选择后端技术">
            <el-option label="Node.js+Express" value="node+express" />
            <el-option label="Java+SpringBoot" value="java+springboot" />
            <el-option label="Python+Django" value="python+django" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="数据库" prop="database">
          <el-select v-model="form.database" placeholder="请选择数据库">
            <el-option label="MySQL 8.0" value="mysql8.0" />
            <el-option label="MongoDB" value="mongodb" />
            <el-option label="SQLite" value="sqlite" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="每日投入工时" prop="dailyHours">
          <el-input-number
            v-model="form.dailyHours"
            :min="0.5"
            :max="24"
            :step="0.5"
            placeholder="请输入每日投入工时"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="代码仓库地址" prop="codeRepo">
      <el-input v-model="form.codeRepo" placeholder="请输入GitHub/Gitee仓库地址" />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface DevConfig {
    frontFramework: string
    backFramework: string
    database: string
    dailyHours: number
    codeRepo: string
  }

  interface Props {
    modelValue: DevConfig
  }

  const props = defineProps<Props>()
  const emit = defineEmits(['update:modelValue'])

  const form = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
</script>
