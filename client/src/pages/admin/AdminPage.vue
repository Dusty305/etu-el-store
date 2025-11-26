<!-- src/pages/admin/AdminPage.vue -->
<template>
  <div class="admin-page">
    <AppHeader />
    <div class="admin-layout">
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <router-link
              to="/admin/products"
              class="nav-link"
              :class="{ active: $route.path.includes('/products') }"
          >
            📦 Товары
          </router-link>
          <router-link
              to="/admin/categories"
              class="nav-link"
              :class="{ active: $route.path.includes('/categories') }"
          >
            📁 Категории
          </router-link>
          <router-link
              to="/admin/users"
              class="nav-link"
              :class="{ active: $route.path.includes('/users') }"
          >
            👥 Пользователи
          </router-link>
          <router-link
              to="/admin/orders"
              class="nav-link"
              :class="{ active: $route.path.includes('/orders') }"
          >
            📋 Заказы
          </router-link>
        </nav>
      </aside>

      <main class="admin-content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '../../components/layout/AppHeader.vue';
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.admin-layout {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 250px;
  background: #f8f9fa;
  border-right: 1px solid #dee2e6;
  padding: 1rem 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
}

.nav-link {
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: #333;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  background: #e9ecef;
  color: #007bff;
}

.nav-link.active {
  background: #007bff;
  color: white;
  border-left-color: #0056b3;
}

.admin-content {
  flex: 1;
  padding: 0;
  background: #fff;
}
</style>