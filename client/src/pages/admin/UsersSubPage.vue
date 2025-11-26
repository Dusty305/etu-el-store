<!-- src/pages/admin/UsersSubPage.vue -->
<template>
  <div class="users-page">
    <div class="page-header">
      <h2>Управление пользователями</h2>
      <p>Всего пользователей: {{ adminUsersStore.pagination.total }}</p>
    </div>

    <div class="controls">
      <div class="search-box">
        <BaseInput
            v-model="search"
            placeholder="Поиск по логину, имени или email..."
            @update:modelValue="handleSearch"
        />
      </div>
    </div>

    <div v-if="adminUsersStore.isLoading" class="loading">
      Загрузка пользователей...
    </div>

    <div v-else-if="adminUsersStore.error" class="error">
      {{ adminUsersStore.error }}
      <BaseButton @click="loadUsers" variant="outline">Повторить</BaseButton>
    </div>

    <div v-else-if="adminUsersStore.users.length === 0" class="empty">
      Пользователи не найдены
    </div>

    <div v-else class="users-table">
      <table class="table">
        <thead>
        <tr>
          <th>Логин</th>
          <th>Имя</th>
          <th>Email</th>
          <th>Роль</th>
          <th>Дата регистрации</th>
          <th>Действия</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="user in adminUsersStore.users" :key="user._id" class="user-row">
          <td>{{ user.login }}</td>
          <td>{{ user.displayName }}</td>
          <td>{{ user.email }}</td>
          <td>
              <span :class="['role-badge', user.role === 'АДМИНИСТРАТОР' ? 'admin' : 'user']">
                {{ user.role }}
              </span>
          </td>
          <td>{{ formatDate(user.createdAt) }}</td>
          <td class="actions">
            <BaseButton
                v-if="user.role === 'ПОКУПАТЕЛЬ'"
                @click="makeAdmin(user._id)"
                variant="outline"
                size="small"
                :disabled="updatingUser === user._id"
            >
              {{ updatingUser === user._id ? '...' : 'Сделать админом' }}
            </BaseButton>
            <BaseButton
                v-else
                @click="removeAdmin(user._id)"
                variant="outline"
                size="small"
                :disabled="updatingUser === user._id"
            >
              {{ updatingUser === user._id ? '...' : 'Убрать админа' }}
            </BaseButton>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-if="adminUsersStore.pagination.totalPages > 1" class="pagination">
      <BaseButton
          @click="changePage(adminUsersStore.pagination.currentPage - 1)"
          :disabled="adminUsersStore.pagination.currentPage === 1"
          variant="outline"
      >
        Назад
      </BaseButton>

      <span class="page-info">
        Страница {{ adminUsersStore.pagination.currentPage }} из {{ adminUsersStore.pagination.totalPages }}
      </span>

      <BaseButton
          @click="changePage(adminUsersStore.pagination.currentPage + 1)"
          :disabled="adminUsersStore.pagination.currentPage === adminUsersStore.pagination.totalPages"
          variant="outline"
      >
        Вперед
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAdminUsersStore } from '../../stores/adminUsers.js';
import BaseInput from '../../components/ui/BaseInput.vue';
import BaseButton from '../../components/ui/BaseButton.vue';

const adminUsersStore = useAdminUsersStore();
const search = ref('');
const updatingUser = ref(null);
let searchTimeout = null;

const loadUsers = (page = 1) => {
  adminUsersStore.loadUsers(page, 10, search.value);
};

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadUsers(1);
  }, 500);
};

const changePage = (page) => {
  if (page >= 1 && page <= adminUsersStore.pagination.totalPages) {
    loadUsers(page);
  }
};

const makeAdmin = async (userId) => {
  updatingUser.value = userId;
  const result = await adminUsersStore.updateRole(userId, 'АДМИНИСТРАТОР');
  updatingUser.value = null;

  if (!result.success) {
    alert(result.error);
  }
};

const removeAdmin = async (userId) => {
  updatingUser.value = userId;
  const result = await adminUsersStore.updateRole(userId, 'ПОКУПАТЕЛЬ');
  updatingUser.value = null;

  if (!result.success) {
    alert(result.error);
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.users-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.controls {
  margin-bottom: 1.5rem;
}

.search-box {
  max-width: 400px;
}

.loading, .error, .empty {
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 1rem 0;
}

.error {
  color: #dc3545;
}

.users-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.table th {
  background: #f8f9fa;
  font-weight: 600;
}

.user-row:hover {
  background: #f8f9fa;
}

.role-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.role-badge.admin {
  background: #007bff;
  color: white;
}

.role-badge.user {
  background: #6c757d;
  color: white;
}

.actions {
  white-space: nowrap;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
}

.page-info {
  font-weight: 500;
}
</style>