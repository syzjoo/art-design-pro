<template>
  <div class="flex w-full h-screen">
    <LoginLeftView />

    <div class="relative flex-1">
      <AuthTopBar />

      <div class="auth-right-wrap">
        <div class="form">
          <h3 class="title">{{ t('forgetPassword.title') }}</h3>
          <p class="sub-title">{{ t('forgetPassword.subTitle') }}</p>

          <!-- 邮箱输入框 -->
          <div class="mt-5">
            <span class="input-label" v-if="showInputLabel">{{ t('form.email') }}</span>
            <ElInput
              class="custom-height"
              :placeholder="t('placeholder.email')"
              v-model.trim="formData.email"
              prefix-icon="el-icon-message"
              :validate-event="false"
            />
            <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
          </div>

          <!-- 验证码输入框 -->
          <div class="mt-5">
            <span class="input-label" v-if="showInputLabel">{{ t('form.verificationCode') }}</span>
            <div class="flex gap-2">
              <ElInput
                class="flex-1 custom-height"
                :placeholder="t('placeholder.emailCode')"
                v-model.trim="formData.emailCode"
                prefix-icon="el-icon-lock"
                :validate-event="false"
              />
              <ElButton
                class="custom-height"
                :disabled="sendingCode || !formData.email"
                @click="sendEmailCode"
                type="primary"
                plain
              >
                {{ sendingCode ? `${countdown}秒后重试` : t('sendCode') }}
              </ElButton>
            </div>
            <div v-if="errors.emailCode" class="error-message">{{ errors.emailCode }}</div>
          </div>

          <!-- 新密码输入框 -->
          <div class="mt-5">
            <span class="input-label" v-if="showInputLabel">{{ t('form.newPassword') }}</span>
            <ElInput
              class="custom-height"
              :placeholder="t('placeholder.password')"
              v-model.trim="formData.password"
              type="password"
              prefix-icon="el-icon-lock"
              show-password
              :validate-event="false"
            />
            <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
          </div>

          <!-- 确认密码输入框 -->
          <div class="mt-5">
            <span class="input-label" v-if="showInputLabel">{{ t('form.confirmPassword') }}</span>
            <ElInput
              class="custom-height"
              :placeholder="t('placeholder.confirmPassword')"
              v-model.trim="formData.confirmPassword"
              type="password"
              prefix-icon="el-icon-lock"
              show-password
              :validate-event="false"
            />
            <div v-if="errors.confirmPassword" class="error-message">{{
              errors.confirmPassword
            }}</div>
          </div>

          <!-- 提交按钮 -->
          <div style="margin-top: 25px">
            <ElButton
              class="w-full custom-height"
              type="primary"
              @click="resetPassword"
              :loading="loading"
              v-ripple
            >
              {{ t('forgetPassword.submitBtnText') }}
            </ElButton>
          </div>

          <!-- 返回登录按钮 -->
          <div style="margin-top: 15px">
            <ElButton class="w-full custom-height" plain @click="toLogin">
              {{ t('forgetPassword.backBtnText') }}
            </ElButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ForgetPassword' })

  import { ref, reactive, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import { fetchSendEmailCode, fetchResetPassword } from '@/api/auth'

  // 国际化
  const { t } = useI18n()

  // 路由
  const router = useRouter()

  // 状态管理
  const showInputLabel = ref(false)
  const loading = ref(false)
  const sendingCode = ref(false)
  const countdown = ref(0)
  let countdownTimer: number | null = null

  // 表单数据
  const formData = reactive({
    email: '',
    emailCode: '',
    password: '',
    confirmPassword: ''
  })

  // 错误信息
  const errors = reactive({
    email: '',
    emailCode: '',
    password: '',
    confirmPassword: ''
  })

  // 邮箱验证规则
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      errors.email = t('rule.emailRequired')
      return false
    } else if (!emailRegex.test(email)) {
      errors.email = t('rule.emailFormat')
      return false
    }
    errors.email = ''
    return true
  }

  // 验证码验证规则
  const validateEmailCode = (code: string): boolean => {
    if (!code) {
      errors.emailCode = t('rule.emailCodeRequired')
      return false
    }
    errors.emailCode = ''
    return true
  }

  // 密码验证规则
  const validatePassword = (password: string): boolean => {
    if (!password) {
      errors.password = t('rule.passwordRequired')
      return false
    } else if (password.length < 6) {
      errors.password = t('rule.passwordMinLength')
      return false
    }
    errors.password = ''
    return true
  }

  // 确认密码验证规则
  const validateConfirmPassword = (confirmPwd: string): boolean => {
    if (!confirmPwd) {
      errors.confirmPassword = t('rule.confirmPasswordRequired')
      return false
    } else if (confirmPwd !== formData.password) {
      errors.confirmPassword = t('rule.confirmPasswordSame')
      return false
    }
    errors.confirmPassword = ''
    return true
  }

  // 表单验证
  const validateForm = (): boolean => {
    const isEmailValid = validateEmail(formData.email)
    const isCodeValid = validateEmailCode(formData.emailCode)
    const isPasswordValid = validatePassword(formData.password)
    const isConfirmValid = validateConfirmPassword(formData.confirmPassword)

    return isEmailValid && isCodeValid && isPasswordValid && isConfirmValid
  }

  // 发送邮箱验证码
  const sendEmailCode = async () => {
    if (!validateEmail(formData.email)) {
      return
    }

    try {
      sendingCode.value = true
      await fetchSendEmailCode({ email: formData.email })
      ElMessage.success(t('message.codeSent'))
      startCountdown()
    } catch (error) {
      ElMessage.error(t('message.codeSendFailed') + error)
    } finally {
      sendingCode.value = false
    }
  }

  // 开始倒计时
  const startCountdown = () => {
    countdown.value = 60
    sendingCode.value = true

    countdownTimer = window.setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearCountdown()
      }
    }, 1000)
  }

  // 清除倒计时
  const clearCountdown = () => {
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
    sendingCode.value = false
    countdown.value = 0
  }

  // 重置密码
  const resetPassword = async () => {
    if (!validateForm()) {
      return
    }

    loading.value = true
    try {
      await fetchResetPassword({
        email: formData.email,
        emailCode: formData.emailCode,
        password: formData.password
      })

      ElMessage.success(t('message.resetSuccess'))
      // 重置成功后跳转到登录页面
      router.push({ name: 'Login' })
    } catch (error) {
      ElMessage.error(t('message.resetFailed') + error)
    } finally {
      loading.value = false
    }
  }

  // 返回登录页面
  const toLogin = () => {
    router.push({ name: 'Login' })
  }

  // 组件卸载时清除定时器
  onUnmounted(() => {
    clearCountdown()
  })
</script>

<style scoped>
  @import '../login/style.css';

  .error-message {
    padding-top: 4px;
    font-size: 12px;
    line-height: 1;
    color: #f56c6c;
  }

  .custom-height {
    height: 40px;
  }
</style>
