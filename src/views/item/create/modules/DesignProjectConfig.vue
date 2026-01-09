<template>
  <div>
    <el-form-item label="设计类型" prop="designType">
      <el-select v-model="form.designType" placeholder="请选择设计类型">
        <el-option label="UI/UX设计" value="ui-ux" />
        <el-option label="平面设计" value="graphic" />
        <el-option label="插画设计" value="illustration" />
        <el-option label="Logo设计" value="logo" />
        <el-option label="包装设计" value="packaging" />
        <el-option label="品牌设计" value="branding" />
      </el-select>
    </el-form-item>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="设计软件" prop="designSoftware">
          <el-select v-model="form.designSoftware" placeholder="请选择设计软件">
            <el-option label="Figma" value="figma" />
            <el-option label="Sketch" value="sketch" />
            <el-option label="Adobe Photoshop" value="ps" />
            <el-option label="Adobe Illustrator" value="ai" />
            <el-option label="Adobe XD" value="xd" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="交付文件数" prop="deliverableCount">
          <el-input-number
            v-model="form.deliverableCount"
            :min="1"
            :max="50"
            :step="1"
            placeholder="请输入计划交付文件数"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="设计规范" prop="designSpec">
      <el-input
        v-model="form.designSpec"
        type="textarea"
        :rows="3"
        placeholder="请输入设计规范要求，如色彩、字体、间距等"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface DesignConfig {
    designType: string
    designSoftware: string
    deliverableCount: number
    designSpec: string
  }

  interface Props {
    modelValue: DesignConfig
  }

  const props = defineProps<Props>()
  const emit = defineEmits(['update:modelValue'])

  const form = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
</script>
