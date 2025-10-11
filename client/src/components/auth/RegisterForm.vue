<template>
  <div class="register-form">
    <h2>Регистрация</h2>
    <form @submit.prevent="handleSubmit">
      <BaseInput
          id="login"
          label="Логин"
          v-model="form.login"
          required
          :error="errors.login"
      />

      <BaseInput
          id="displayName"
          label="Отображаемое имя"
          v-model="form.displayName"
          required
          :error="errors.displayName"
      />

      <BaseInput
          id="email"
          label="Email"
          type="email"
          v-model="form.email"
          required
          :error="errors.email"
      />

      <BaseInput
          id="password"
          label="Пароль"
          type="password"
          v-model="form.password"
          required
          :error="errors.password"
      />

      <BaseInput
          id="confirmPassword"
          label="Подтверждение пароля"
          type="password"
          v-model="form.confirmPassword"
          required
          :error="errors.confirmPassword"
      />

      <div v-if="authStore.error" class="form-error">
        {{ authStore.error }}
      </div>

      <BaseButton
          type="submit"
          :disabled="authStore.isLoading"
          class="submit-button"
      >
        {{ authStore.isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
      </BaseButton>
    </form>

    <div class="form-footer">
      <p>Уже есть аккаунт?</p>
      <BaseButton variant="outline" @click="$emit('switch-to-login')">
        Войти
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

const emit = defineEmits(['success', 'switch-to-login']);

const form = reactive({
  login: '',
  displayName: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const errors = computed(() => {
  const errs = {};
  if (!form.login) errs.login = 'Обязательное поле';
  if (!form.displayName) errs.displayName = 'Обязательное поле';
  if (!form.email) errs.email = 'Обязательное поле';
  if (!form.password) errs.password = 'Обязательное поле';
  if (!form.confirmPassword) errs.confirmPassword = 'Обязательное поле';
  if (form.password && form.password.length < 6) errs.password = 'Пароль должен быть не менее 6 символов';
  if (form.password !== form.confirmPassword) errs.confirmPassword = 'Пароли не совпадают';
  return errs;
});

const handleSubmit = async () => {
  if (Object.keys(errors.value).length > 0) return;

  authStore.clearError();
  const { confirmPassword, ...userData } = form;
  const result = await authStore.register(userData);

  if (result.success) {
    emit('success');
  }
};
</script>

<style scoped>
.register-form {
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