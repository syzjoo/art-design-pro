<template>
  <div>
    <el-form-item label="学习领域" prop="learningField">
      <el-select v-model="form.learningField" placeholder="请选择学习领域">
        <el-option label="编程开发" value="programming" />
        <el-option label="数据分析" value="data" />
        <el-option label="产品管理" value="product" />
        <el-option label="市场营销" value="marketing" />
        <el-option label="语言学习" value="language" />
        <el-option label="职业技能" value="skills" />
      </el-select>
    </el-form-item>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="学习方式" prop="learningMethod">
          <el-select v-model="form.learningMethod" placeholder="请选择学习方式">
            <el-option label="在线课程" value="online" />
            <el-option label="实体培训" value="offline" />
            <el-option label="自主学习" value="self" />
            <el-option label="导师指导" value="mentor" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="目标证书" prop="targetCertificate">
          <el-input v-model="form.targetCertificate" placeholder="请输入目标证书或认证" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="每日学习时长(小时)" prop="dailyLearningHours">
          <el-input-number
            v-model="form.dailyLearningHours"
            :min="0.5"
            :max="8"
            :step="0.5"
            placeholder="请输入每日学习时长"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="预期完成时间(月)" prop="expectedMonths">
          <el-input-number
            v-model="form.expectedMonths"
            :min="1"
            :max="36"
            :step="1"
            placeholder="请输入预期完成时间"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="学习资源" prop="learningResources">
      <el-checkbox-group v-model="form.learningResources">
        <el-checkbox label="在线课程" />
        <el-checkbox label="技术书籍" />
        <el-checkbox label="实战项目" />
        <el-checkbox label="技术社区" />
        <el-checkbox label="官方文档" />
      </el-checkbox-group>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface LearningConfig {
    learningField: string
    learningMethod: string
    targetCertificate: string
    dailyLearningHours: number
    expectedMonths: number
    learningResources: string[]
  }

  interface Props {
    modelValue: LearningConfig
  }

  const props = defineProps<Props>()
  const emit = defineEmits(['update:modelValue'])

  const form = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
</script>
