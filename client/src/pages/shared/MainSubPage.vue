<template>
  <div class="home-page">
    <main class="main-content">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
        <div class="welcome-message">
          <h2>Добро пожаловать в El-store!</h2>
          <p>Лучший магазин электроники с выгодными ценами</p>
        </div>
        <div class="welcome-user">
          <p>Привет, <b>{{ username }}</b>!</p>
          <p>Начните покупки в нашем каталоге</p>
        </div>
      </div>

      <div class="breadcrumbs">
        <a v-if="breadcrumbs.length > 0"
          href="#" 
          @click.prevent="goToHomePage" 
          class="breadcrumb-item"
        >
          Главная
        </a>
        <span v-else class="breadcrumb-item-off">
          Главная
        </span>
        <span class="breadcrumb-separator">/</span>
        
        <template v-for="(crumb, index) in breadcrumbs" :key="crumb._id">
          <a 
            href="#" 
            v-if="index < breadcrumbs.length - 1"
            @click.prevent="selectBreadcrumb(crumb._id)"
            class="breadcrumb-item"
          >
            {{ crumb.name }}
          </a>
          <span v-else class="breadcrumb-item current">
            {{ crumb.name }}
          </span>
          
          <span 
            v-if="index < breadcrumbs.length - 1" 
            class="breadcrumb-separator"
          >
            /
          </span>
        </template>
      </div>

      <div class="header-fields-section">
        <button class="show-categories-btn" @click="showCategories = !showCategories">
          <span>{{ showCategories ? 'Скрыть' : 'Показать' }} категории</span>
        </button>
        <div class="search-container">
          <input 
            type="text" 
            name="name"
            v-model="searchQuery" 
            placeholder="Поиск товаров..." 
            class="search-input"
          >
          <button class="search-btn" @click="handleSearch">Найти</button>
        </div>
      </div>
      <div class="products-content">
        <div class="categories-sidebar" v-if="showCategories">
          <div v-if="adminCategoriesStore.isLoading && adminCategoriesStore.categories.length === 0" class="loading">
            <div class="spinner"></div>
            <p>Загрузка категорий...</p>
          </div>

          <div v-else-if="adminCategoriesStore.error" class="error">
            <p>❌ {{ adminCategoriesStore.error }}</p>
            <BaseButton @click="adminCategoriesStore.loadCategories" variant="outline">Повторить загрузку</BaseButton>
          </div>

          <div v-else-if="adminCategoriesStore.categories.length === 0" class="empty">
            <p>📁 Категории не найдены</p>
          </div>

          <div v-else>
            <CategoryTreeNodeView
                v-for="category in adminCategoriesStore.categories"
                  :key="category._id"
                  :category="category"
                  :level="0"
                  :allCategories="flatCategories"
                  :selectedCategoryId="selectedCategory"
                  @selected="handleSelected"
            />
          </div>
        </div>

        <div class="products-grid">
          <div 
            class="product-card" 
            v-for="product in filteredProducts" 
            :key="product._id"
          >
            <div @click="redirectToProduct(product._id)">
              <div class="product-image">
                <img 
                  :src="getProductImage(product)"
                  :alt="product.name"
                >
              </div>
              <div class="product-info">
                <h3 class="product-name">{{ product.name }}</h3>
                <div class="product-price">{{ product.price }} {{ currency }}</div>
                <div>В наличии: {{product.stock}} шт.</div>
              </div>
            </div>
            <button 
              class="add-to-cart-btn" 
              @click="addToCart(product)"
              :disabled="product.stock === 0"
            >
              {{ product.stock > 0 ? 'В корзину' : 'Нет в наличии' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js';
import { useProductStore } from '../../stores/product.js';
import { useAdminCategoriesStore } from '../../stores/adminCategories.js';
import { useCartStore } from '../../stores/cart.js';
import CategoryTreeNodeView from '../../components/product/CategoryTreeNodeView.vue';
import BaseButton from '../../components/ui/BaseButton.vue';

const currency = '₽';
const imagePlaceholderUrl = '/src/uploads/product_placeholder.png'

const adminCategoriesStore = useAdminCategoriesStore();
const authStore = useAuthStore();
const productStore = useProductStore();
const cartStore = useCartStore();
const router = useRouter()

const showCategories = ref(false)
const selectedCategory = ref(null)
const searchQuery = ref('')

const username = computed(() => {
  return authStore.isAuthenticated ? authStore.userInfo?.displayName : 'Гость';
})

const filteredProducts = computed(() => productStore.products)

const breadcrumbs = computed(() => {
  if (!selectedCategory.value) {
    return [];
  }

  const category = flatCategories.value.find(c => c._id === selectedCategory.value);
  
  if (!category) return [];

  const crumbs = [];
  let currentCat = category;
  
  while (currentCat) {
    crumbs.unshift(currentCat);
    currentCat = currentCat.parentId 
      ? flatCategories.value.find(c => c._id === currentCat.parentId)
      : null;
  }
  
  return crumbs;
});

const goToHomePage = () => {
  selectedCategory.value = null;
  handleSearch();
};

const selectBreadcrumb = (categoryId) => {
  selectedCategory.value = categoryId;
  handleSearch();
};

const handleSelected = ({ categoryId, value }) => {
  if (value) {
    selectedCategory.value = categoryId;
  } else if (selectedCategory.value === categoryId) {
    selectedCategory.value = null;
  }
  handleSearch();
};

const handleSearch = async () => {
  console.log(selectedCategory.value)
  const result = await productStore.findProducts(searchQuery.value, [ selectedCategory.value ]);
  productStore.products = result.value
}

const redirectToProduct = (productId) => {
  router.push(`/product/${productId}`)
}

const addToCart = async (product) => {
  if (!authStore.isAuthenticated) {
    alert("Необходимо авторизоваться!");
    router.push('/auth');
    return;
  }

  try {
    const result = await cartStore.addToCart(product._id, 1);
    if (result.success) {
      alert(`Товар "${product.name}" добавлен в корзину!`);
    } else {
      alert(result.error || 'Ошибка добавления в корзину');
    }
  } catch (error) {
    alert('Ошибка добавления в корзину');
  }
};

const flatCategories = computed(() => {
  return adminCategoriesStore.flatten(adminCategoriesStore.categories);
});

const getProductImage = (product) => {
  return product.images && product.images.length > 0 ? product.images[0] : imagePlaceholderUrl
}

onMounted(() => {
  adminCategoriesStore.loadCategories()
  productStore.getAllProducts()
});
</script>

<style scoped>
.home-page {
  margin: 0 10%;
  padding: 2rem;
}

.main-content {
  text-align: center;
  padding: 2rem 0;
}

.welcome-message {
  text-align: left;
  margin-top: 1rem;
  margin-right: 2rem;
}

.welcome-user {
  padding: 2rem;
  margin-left: 2rem;
  text-align: right;
  background: #f8f9fa;
  border-radius: 8px;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  flex-wrap: wrap;
}

.breadcrumb-item-off {
  font-size: 14px;
  padding: 2px 5px;
  border-radius: 4px;
}

.breadcrumb-item {
  color: #007bff;
  text-decoration: none;
  font-size: 14px;
  padding: 2px 5px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.breadcrumb-item:hover {
  background-color: #e9ecef;
  text-decoration: underline;
}

.breadcrumb-item.current {
  color: #6c757d;
  cursor: default;
  font-weight: 500;
}

.breadcrumb-item.current:hover {
  background-color: transparent;
  text-decoration: none;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: #6c757d;
  user-select: none;
}

.products-content
{
  display: flex;
}

.product-section {
  margin: 1rem 0;
  width: 100%;
}

.product-section .product-card {
  display: flex;
  border: 2px dotted grey;
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
}

.product-section .product-card img {
  max-width: 200px;
}

.categories-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
  align-items: start;
  overflow: hidden;
}

.section-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #e9ecef;
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

@media (max-width: 1024px) {
  .categories-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .categories-page {
    padding: 1rem;
  }
}

.header-fields-section {
  display: flex;
  margin-bottom: 30px;
}

.search-container {
  display: flex;
  width: 100%;
  flex: 1;
}

.search-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px 0 0 6px;
  font-size: 16px;
}

.search-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  font-size: 16px;
}

.search-btn:hover {
  background: #218838;
}

.products-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  padding: 20px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: scale-down;
}

.product-info {
  padding: 16px;
  user-select: none;
}

.product-name {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.product-info .product-description {
  margin-bottom: 12px;
  line-height: 1.4;
}

.product-info .product-price {
  font-size: 20px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 12px;
}

.add-to-cart-btn {
  width: 100%;
  background: #28a745;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.add-to-cart-btn:hover:not(:disabled) {
  background: #218838;
}

.add-to-cart-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.catalog-section {
  display: block;
  position: relative;
  margin-bottom: 20px;
}

.show-categories-btn {
  position: relative;
  display: block;
  left: 0;
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  width: 250px;
  height: 100%;
  margin-right: 1rem;
}

.show-categories-btn:hover {
  background: #0056b3;
}

.categories-sidebar {
  position: relative;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  min-width: 250px;
  height: 60vh;
  overflow-y: scroll;
  margin-right: 1rem;
}
</style>