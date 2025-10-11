<template>
  <div class="login-form">
    <h2>Вход в аккаунт</h2>
    <form @submit.prevent="handleSubmit">
      <BaseInput
          id="login"
          label="Логин или Email"
          v-model="form.login"
          required
          :error="errors.login"
      />

      <BaseInput
          id="password"
          label="Пароль"
          type="password"
          v-model="form.password"
          required
          :error="errors.password"
      />

      <div v-if="authStore.error" class="form-error">
        {{ authStore.error }}
      </div>

      <BaseButton
          type="submit"
          :disabled="authStore.isLoading"
          class="submit-button"
      >
        {{ authStore.isLoading ? 'Вход...' : 'Войти' }}
      </BaseButton>
    </form>

    <div class="form-footer">
      <p>Нет аккаунта?</p>
      <BaseButton variant="outline" @click="$emit('switch-to-register')">
        Зарегистрироваться
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { useAuthStore } from '../../stores/auth.js';
import BaseInput from '../ui/BaseInput.vue';
import BaseButton from '../ui/BaseButton.vue';

const authStore = useAuthStore();

const emit = defineEmits(['success', 'switch-to-register']);

const form = reactive({
  login: '',
  password: ''
});

const errors = computed(() => {
  const errs = {};
  if (!form.login) errs.login = 'Обязательное поле';
  if (!form.password) errs.password = 'Обязательное поле';
  return errs;
});

const handleSubmit = async () => {
  if (Object.keys(errors.value).length > 0) return;

  authStore.clearError();
  const result = await authStore.login(form);

  if (result.success) {
    emit('success');
  }
};
</script>

<style scoped>
.login-form {
  text-align: center;
}

.submit-button {
  width: 100%;
  margin: 1rem 0;
}

.form-error {
  color: #dc3545;
  margin: 1rem 0;
}

.form-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}
</style>