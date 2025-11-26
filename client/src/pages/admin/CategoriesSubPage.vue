<template>
  <div class="categories-page">
    <div class="page-header">
      <h2>Управление категориями</h2>
      <p>Создание и редактирование иерархии категорий товаров</p>
    </div>

    <div class="categories-layout">
      <!-- Форма создания категории -->
      <div class="form-section">
        <div class="section-card">
          <h3>Создание категории</h3>
          <form @submit.prevent="handleCreateCategory" class="category-form">
            <BaseInput
                id="categoryName"
                label="Название категории *"
                v-model="createForm.name"
                placeholder="Введите название категории"
                required
                :error="createFormErrors.name"
            />

            <div class="form-group">
              <label for="parentCategory">Родительская категория</label>
              <select
                  id="parentCategory"
                  v-model="createForm.parentCategory"
                  class="form-select"
              >
                <option :value="null">Корневая категория (без родителя)</option>
                <option
                    v-for="category in flatCategories"
                    :key="category._id"
                    :value="category._id"
                >
                  {{ category.nameWithPath }}
                </option>
              </select>
              <div class="form-help">
                Если не выбрано, категория создается в корне
              </div>
            </div>

            <div v-if="adminCategoriesStore.error" class="form-error">
              {{ adminCategoriesStore.error }}
            </div>

            <BaseButton
                type="submit"
                :disabled="adminCategoriesStore.isLoading || !createForm.name.trim()"
                class="submit-button"
            >
              {{ adminCategoriesStore.isLoading ? 'Создание...' : 'Создать категорию' }}
            </BaseButton>
          </form>
        </div>
      </div>

      <!-- Дерево категорий -->
      <div class="tree-section">
        <div class="section-card">
          <div class="section-header">
            <h3>Дерево категорий</h3>
            <BaseButton
                @click="loadCategories"
                variant="outline"
                size="small"
                :disabled="adminCategoriesStore.isLoading"
            >
              🔄 Обновить
            </BaseButton>
          </div>

          <div v-if="adminCategoriesStore.isLoading && adminCategoriesStore.categories.length === 0" class="loading">
            <div class="spinner"></div>
            <p>Загрузка категорий...</p>
          </div>

          <div v-else-if="adminCategoriesStore.error" class="error">
            <p>❌ {{ adminCategoriesStore.error }}</p>
            <BaseButton @click="loadCategories" variant="outline">Повторить загрузку</BaseButton>
          </div>

          <div v-else-if="adminCategoriesStore.categories.length === 0" class="empty">
            <p>📁 Категории не найдены</p>
            <p>Создайте первую категорию с помощью формы слева</p>
          </div>

          <div v-else class="category-tree">
            <CategoryTreeNode
                v-for="category in adminCategoriesStore.categories"
                :key="category._id"
                :category="category"
                :level="0"
                :allCategories="flatCategories"
                @category-updated="handleCategoryUpdate"
                @category-deleted="handleCategoryDelete"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Уведомление об успехе -->
    <div v-if="successMessage" class="success-notification">
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAdminCategoriesStore } from '../../stores/adminCategories.js';
import BaseInput from '../../components/ui/BaseInput.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import CategoryTreeNode from '../../components/admin/CategoryTreeNode.vue';

const adminCategoriesStore = useAdminCategoriesStore();

const createForm = reactive({
  name: '',
  parentCategory: null
});

const createFormErrors = ref({});
const successMessage = ref('');

// Создаем плоский список всех категорий с путями для выпадающего списка
const flatCategories = computed(() => {
  const flatten = (categories, path = '') => {
    let result = [];
    categories.forEach(cat => {
      const currentPath = path ? `${path} → ${cat.name}` : cat.name;
      result.push({
        ...cat,
        nameWithPath: currentPath
      });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flatten(cat.children, currentPath));
      }
    });
    return result;
  };
  return flatten(adminCategoriesStore.categories);
});

const validateCreateForm = () => {
  const errors = {};
  if (!createForm.name.trim()) {
    errors.name = 'Название категории обязательно';
  }
  createFormErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const resetCreateForm = () => {
  createForm.name = '';
  createForm.parentCategory = null;
  createFormErrors.value = {};
};

const showSuccess = (message) => {
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = '';
  }, 3000);
};

const loadCategories = () => {
  adminCategoriesStore.loadCategories();
};

const handleCreateCategory = async () => {
  if (!validateCreateForm()) return;

  const categoryData = {
    name: createForm.name.trim(),
    parentCategory: createForm.parentCategory
  };

  const result = await adminCategoriesStore.createCategory(categoryData);

  if (result.success) {
    showSuccess('Категория успешно создана!');
    resetCreateForm();
  }
};

const handleCategoryUpdate = async ({ categoryId, data }) => {
  const result = await adminCategoriesStore.updateCategory(categoryId, data);

  if (result.success) {
    showSuccess('Категория успешно обновлена!');
  }
};

const handleCategoryDelete = async (categoryId) => {
  const result = await adminCategoriesStore.deleteCategory(categoryId);

  if (result.success) {
    showSuccess('Категория успешно удалена!');
  }
};

onMounted(() => {
  loadCategories();
});
</script>

<style scoped>
.categories-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.page-header h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #6c757d;
}

.categories-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
  align-items: start;
}

.section-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #e9ecef;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  margin: 0;
  color: #333;
}

.category-form {
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: #007bff;
}

.form-help {
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
}

.loading, .error, .empty {
  text-align: center;
  padding: 3rem 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 1rem 0;
}

.error {
  color: #dc3545;
  background: #f8d7da;
}

.empty {
  color: #6c757d;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.category-tree {
  max-height: 600px;
  overflow-y: auto;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.success-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #28a745;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Адаптивность */
@media (max-width: 1024px) {
  .categories-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .categories-page {
    padding: 1rem;
  }
}
</style>