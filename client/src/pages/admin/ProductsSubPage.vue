<template>
  <div class="products-page">
    <div class="page-header">
    <h2>Управление товарами</h2>
    <p>Всего товаров: {{ adminProductsStore.products.length }}</p>
    </div>

    <div class="controls">
      <div class="search-box">
        <BaseInput
            v-model="search"
            placeholder="Поиск по имени товара..."
            @update:modelValue="handleSearch"
        />
      </div>
      <div>
        <BaseButton @click="openEditModal()" variant="outline">Добавить новый товар</BaseButton>
      </div>
    </div>

    <div v-if="adminProductsStore.isLoading" class="loading">
      Загрузка товаров...
    </div>

    <div v-else-if="adminProductsStore.error" class="error">
      {{ adminProductsStore.error }}
      <BaseButton @click="loadProducts" variant="outline">Повторить</BaseButton>
    </div>

    <div v-else-if="adminProductsStore.products.length === 0" class="empty">
      Товары не найдены
    </div>

    <div v-else class="products-table">
      <table class="table">
        <thead>
          <tr>
            <th>Артикул</th>
            <th>Имя</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in adminProductsStore.products" :key="product._id" class="product-row">
            <td>{{ product._id }}</td>
            <td>{{ product.name }}</td>
            <td class="actions">
              <BaseButton
                  class="edit-action"
                  @click="editProduct(product._id)"
                  variant="outline"
                  size="small"
              >
              📝 Редактировать
              </BaseButton>
              <BaseButton
                  class="remove-action"
                  @click="removeProduct(product._id)"
                  variant="outline"
                  size="small"
              >
              ❌ Удалить
              </BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ProductEditModal
      v-show="showEditModal"
      :is-visible="showEditModal"
      :product="selectedProduct"
      :flatCategories="flatCategories"
      :is-editing="!!selectedProduct"
      @close="closeEditModal"
      @save="handleSaveProduct"
    />

    <!-- <div v-if="adminUsersStore.pagination.totalPages > 1" class="pagination">
    <BaseButton
        @click="changePage(Number.parseInt(adminUsersStore.pagination.currentPage) - 1)"
        :disabled="Number.parseInt(adminUsersStore.pagination.currentPage) === 1"
        variant="outline"
    >
        Назад
    </BaseButton>

    <span class="page-info">
        Страница {{ adminUsersStore.pagination.currentPage }} из {{ adminUsersStore.pagination.totalPages }}
    </span>

    <BaseButton
        @click="changePage(Number.parseInt(adminUsersStore.pagination.currentPage) + 1)"
        :disabled="Number.parseInt(adminUsersStore.pagination.currentPage) === adminUsersStore.pagination.totalPages"
        variant="outline"
    >
        Вперед
    </BaseButton>
    </div> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAdminProductsStore } from '../../stores/adminProducts.js';
import BaseInput from '../../components/ui/BaseInput.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import ProductEditModal from '../../components/admin/ProductEditModal.vue'
import { useAdminCategoriesStore } from '../../stores/adminCategories.js'

const adminCategories = useAdminCategoriesStore()

const search = ref('');
const adminProductsStore = useAdminProductsStore()
const showEditModal = ref(false)
const selectedProduct = ref(null)
let searchTimeout = null;

const flatCategories = computed(() => {
  return adminCategories.flatten(adminCategories.categories);
});

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadProducts(1);
  }, 500);
};

const loadProducts = (page = 1) => {
  //adminProductStore.loadProducts(page, 10, search.value);
  adminProductsStore.loadProducts()
};

const openEditModal = (product = null) => {
  selectedProduct.value = product
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedProduct.value = null
}

const handleSaveProduct = async (productData) => {
  if (selectedProduct.value) {
    await adminProductsStore.updateProduct(selectedProduct.value._id, productData)
  } else {
    await adminProductsStore.createProduct(productData)
  }
}

const editProduct = async (productId) => {
  const response = await adminProductsStore.loadOneProduct(productId)
  openEditModal(response.product)
}

const removeProduct = async (productId) => {
  if (confirm("Подтвердите удаление продукта")) {
    await adminProductsStore.deleteProduct(productId)
  }
}

onMounted(() => {
  loadProducts()
  adminCategories.loadCategories()
});
</script>

<style scoped>
.products-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.controls {
  display: flex;
  flex: 1;
  margin-bottom: 1.5rem;
}

.search-box {
  max-width: 400px;
}

.edit-action {
  background: #457fec;
  border-color: #3263be;
  color: white;
  font-weight: bold;
}

.remove-action  {
  color: white;
  background: #dc3545;
  border-color: #bb2736;
  font-weight: bold;
}

.remove-action :hover {
  background: #bb2736;
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

.products-table {
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

.product-row:hover {
  background: #f8f9fa;
}
</style>