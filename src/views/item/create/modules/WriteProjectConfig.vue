<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="写作类型" prop="writeType">
          <el-select v-model="form.writeType" placeholder="请选择写作类型">
            <el-option label="技术博客" value="tech" />
            <el-option label="小说创作" value="novel" />
            <el-option label="论文写作" value="paper" />
            <el-option label="商业计划书" value="business" />
            <el-option label="个人日记" value="diary" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="目标字数" prop="targetWords">
          <el-input-number
            v-model="form.targetWords"
            :min="1000"
            :max="1000000"
            :step="1000"
            placeholder="请输入目标字数"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="每日目标字数" prop="dailyWords">
          <el-input-number
            v-model="form.dailyWords"
            :min="100"
            :max="10000"
            :step="100"
            placeholder="请输入每日目标字数"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="预计完成天数" prop="expectedDays">
          <el-input-number
            v-model="form.expectedDays"
            :min="7"
            :max="365"
            :step="1"
            placeholder="请输入预计完成天数"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="发布平台" prop="publishPlatforms">
      <el-checkbox-group v-model="form.publishPlatforms">
        <el-checkbox label="个人博客" />
        <el-checkbox label="知乎" />
        <el-checkbox label="微信公众号" />
        <el-checkbox label="简书" />
        <el-checkbox label="CSDN" />
        <el-checkbox label="掘金" />
      </el-checkbox-group>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface WriteConfig {
    writeType: string
    targetWords: number
    dailyWords: number
    expectedDays: number
    publishPlatforms: string[]
  }

  interface Props {
    modelValue: WriteConfig
  }

  const props = defineProps<Props>()
  const emit = defineEmits(['update:modelValue'])

  const form = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
</script>
