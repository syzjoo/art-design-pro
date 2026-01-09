<template>
  <div>
    <el-form-item label="视频类型" prop="videoType">
      <el-select v-model="form.videoType" placeholder="请选择视频类型">
        <el-option label="教学视频" value="tutorial" />
        <el-option label="产品介绍" value="product" />
        <el-option label="Vlog日志" value="vlog" />
        <el-option label="娱乐搞笑" value="entertainment" />
        <el-option label="纪录片" value="documentary" />
      </el-select>
    </el-form-item>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="视频时长(分钟)" prop="videoDuration">
          <el-input-number
            v-model="form.videoDuration"
            :min="1"
            :max="60"
            :step="1"
            placeholder="请输入单期视频时长"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="计划期数" prop="videoCount">
          <el-input-number
            v-model="form.videoCount"
            :min="1"
            :max="100"
            :step="1"
            placeholder="请输入计划制作期数"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="拍摄设备" prop="equipmentType">
          <el-select v-model="form.equipmentType" placeholder="请选择拍摄设备">
            <el-option label="手机" value="phone" />
            <el-option label="相机" value="camera" />
            <el-option label="摄像机" value="camcorder" />
            <el-option label="直播设备" value="live" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="剪辑软件" prop="editingSoftware">
          <el-select v-model="form.editingSoftware" placeholder="请选择剪辑软件">
            <el-option label="剪映" value="jianying" />
            <el-option label="Adobe Premiere" value="premiere" />
            <el-option label="Final Cut Pro" value="fcp" />
            <el-option label="DaVinci Resolve" value="davinci" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="发布平台" prop="videoPublishPlatforms">
      <el-checkbox-group v-model="form.videoPublishPlatforms">
        <el-checkbox label="抖音" />
        <el-checkbox label="B站" />
        <el-checkbox label="快手" />
        <el-checkbox label="微博" />
        <el-checkbox label="小红书" />
        <el-checkbox label="微信视频号" />
      </el-checkbox-group>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface VideoConfig {
    videoType: string
    videoDuration: number
    videoCount: number
    equipmentType: string
    editingSoftware: string
    videoPublishPlatforms: string[]
  }

  interface Props {
    modelValue: VideoConfig
  }

  const props = defineProps<Props>()
  const emit = defineEmits(['update:modelValue'])

  const form = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
</script>
