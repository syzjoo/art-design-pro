<template>
  <div>
    <el-form-item label="打卡周期" prop="checkinCycle">
      <el-radio-group v-model="form.checkinCycle">
        <el-radio label="daily">每日</el-radio>
        <el-radio label="weekly">每周</el-radio>
        <el-radio label="monthly">每月</el-radio>
        <el-radio label="custom">自定义</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="打卡时间窗口" prop="checkinTimeWindow">
      <el-time-picker
        v-model="form.checkinTimeWindow"
        range
        placeholder="请选择打卡时间范围"
        format="HH:mm"
        value-format="HH:mm"
      />
    </el-form-item>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="每月补卡次数" prop="recheckinCount">
          <el-input-number
            v-model="form.recheckinCount"
            :min="0"
            :max="10"
            :step="1"
            placeholder="请输入每月补卡次数"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="打卡维度数量" prop="checkinDimensionCount">
          <el-radio-group v-model="form.checkinDimensionCount" @change="handleDimensionCountChange">
            <el-radio label="1">单维度</el-radio>
            <el-radio label="2">多维度</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
    </el-row>

    <div v-if="form.checkinDimensionCount === '2'">
      <el-form-item label="打卡维度">
        <div v-for="(item, index) in form.checkinDimensions" :key="index" class="mb-2">
          <el-row :gutter="10">
            <el-col :span="10">
              <el-input
                v-model="item.name"
                placeholder="请输入维度名称（如：代码打卡、读书打卡）"
              />
            </el-col>
            <el-col :span="12">
              <el-input
                v-model="item.requirement"
                placeholder="请输入量化要求（如：每日1小时、每日500字）"
              />
            </el-col>
            <el-col :span="2" v-if="form.checkinDimensionCount === '2'">
              <el-button type="text" text @click="deleteDimension(index)" style="color: #f56c6c">
                <Delete />
              </el-button>
            </el-col>
          </el-row>
        </div>
      </el-form-item>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Delete } from '@element-plus/icons-vue'

  interface CheckinDimension {
    name: string
    requirement: string
  }

  interface CheckinConfig {
    checkinCycle: string
    checkinTimeWindow: string[]
    recheckinCount: number
    checkinDimensionCount: string
    checkinDimensions: CheckinDimension[]
  }

  interface Props {
    modelValue: CheckinConfig
  }

  const props = defineProps<Props>()
  const emit = defineEmits(['update:modelValue'])

  const form = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  // 处理打卡维度数量变化
  const handleDimensionCountChange = (value: string | number | boolean | undefined) => {
    if (value === '1') {
      form.value.checkinDimensions = [{ name: '', requirement: '' }]
    } else {
      form.value.checkinDimensions = [
        { name: '', requirement: '' },
        { name: '', requirement: '' }
      ]
    }
  }

  const deleteDimension = (index: number) => {
    form.value.checkinDimensions.splice(index, 1)
  }
</script>
