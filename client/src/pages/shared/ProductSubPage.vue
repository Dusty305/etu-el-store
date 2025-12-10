<template>
  <div class="product-page">
    <nav class="breadcrumbs">
      <router-link to="/main" class="breadcrumb-link">Главная</router-link>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current" v-if="!productStore.isLoading && product">Товар {{product.name}}</span>
      <span class="breadcrumb-current" v-else>Товар</span>
    </nav>

    <div class="product-container" v-if="product">
      <div class="product-gallery">
        <div class="main-image">
          <img 
            :src="getProductImage(product)" 
            :alt="product.name"
            @error="handleImageError"
            style="max-width: 100%"
          >
        </div>
        
        <div class="thumbnails" v-if="product.images && product.images.length > 1">
          <div 
            v-for="(image, index) in product.images" 
            :key="index"
            class="thumbnail-item"
            :class="{ active: currentImageIndex === index }"
            @click="changeImage(index)"
          >
            <img 
              :src="image" 
              :alt="`${product.name} - изображение ${index + 1}`"
              @error="handleThumbnailError"
            >
          </div>
        </div>
      </div>

      <!-- Правая колонка - информация о товаре -->
      <div class="product-info">
        <h1 class="product-title">{{ product.name }}</h1>
        
        <div class="product-meta">
          <div class="product-sku">Артикул: {{ product._id }}</div>
        </div>

        <div class="product-price-section">
          <div class="current-price">{{ product.price }} {{currency}}</div>
        </div>

        <div class="product-stock">
          <span :class="stockStatusClass">
            {{ stockStatusText }}
          </span>
        </div>

        <div class="product-description">
          <h3>Описание и характеристики</h3>
          <p>{{ product.description }}</p>
        </div>

        <div class="product-actions">
          <div class="quantity-selector">
            <button 
              class="qty-btn minus" 
              @click="decreaseQuantity"
              :disabled="quantity <= 1"
            >-</button>
            <input 
              type="number" 
              v-model.number="quantity" 
              min="1" 
              :max="product.stock"
              class="qty-input"
            >
            <button 
              class="qty-btn plus" 
              @click="increaseQuantity"
              :disabled="quantity >= product.stock"
            >+</button>
          </div>

          <button 
            class="add-to-cart-btn primary"
            @click="addToCart"
            :disabled="product.stock === 0"
          >
            <span v-if="product.stock > 0">Добавить в корзину</span>
            <span v-else>Нет в наличии</span>
          </button>
        </div>
      </div>
    </div>

    <div class="loading-state" v-else-if="productStore.isLoading">
      <div class="spinner"></div> 
      <p>Загрузка информации о товаре...</p>
    </div>
    <div class="error-state" v-else-if="productStore.error">
      <h2>Товар не найден</h2>
      <p>К сожалению, запрашиваемый товар не существует или был удален.</p>
      <router-link to="/main" class="back-to-home">
        Вернуться на главную
      </router-link>
    </div>
    <div class="related-products" v-if="relatedProducts.length > 0 && product">
      <h2>Похожие товары</h2>
      <div class="related-grid">
        <div 
          v-for="relatedProduct in relatedProducts" 
          :key="relatedProduct._id"
          class="related-card"
          @click="redirectToProduct(relatedProduct._id)"
        >
          <div class="related-image">
            <img 
              :src="getProductImage(relatedProduct)" 
              :alt="relatedProduct.name"
            >
          </div>
          <div class="related-info">
            <h4>{{ relatedProduct.name }}</h4>
            <p class="related-price">{{ relatedProduct.price }} {{currency}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '../../stores/product.js'
import { useAuthStore } from '../../stores/auth.js'

const currency = '₽'
const imagePlaceholder = '/src/uploads/product_placeholder.png'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const authStore = useAuthStore()

const product = ref(null)
const currentImageIndex = ref(0)
const quantity = ref(1)
const relatedProducts = ref([])

const stockStatusText = computed(() => {
  if (!product.value) return ''
  
  if (product.value.stock > 10) {
    return `В наличии (${product.value.stock} шт.)`
  } else if (product.value.stock > 0) {
    return `Мало в наличии (${product.value.stock} шт.)`
  } else {
    return 'Нет в наличии'
  }
})

const stockStatusClass = computed(() => {
  if (!product.value) return ''
  
  if (product.value.stock > 10) {
    return 'stock-available'
  } else if (product.value.stock > 0) {
    return 'stock-low'
  } else {
    return 'stock-out'
  }
})

const changeImage = (index) => {
  currentImageIndex.value = index
}

const increaseQuantity = () => {
  if (quantity.value < product.value.stock) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const addToCart = () => {
  if (!authStore.isAuthenticated) {
    alert('Необходимо авторизоваться!')
  }
  else if (product.value && product.value.stock > 0) {
    const item = {
      id: product.value._id,
      quantity: quantity.value
    }
    
    // TODO добавление товара в корзину
  }
}

const getProductImage = (product) => {
  return product.images && product.images.length > 0 ? product.images[0] : imagePlaceholder
}

const redirectToProduct = (productId) => {
  router.push(`/product/${productId}`)
}

const fetchProduct = async (productId) => {
  const fetchedProduct = await productStore.getOneProduct(productId)
  
  if (fetchedProduct) {
    product.value = fetchedProduct.value
    await loadRelatedProducts()
  }
}

const loadRelatedProducts = async () => {
  if (!product.value) return
  
  if (product.value.categories && product.value.categories.length > 0) {
    const sameCategoryProducts = await productStore.getProductsFromCategories(product.value.categories)
    // FIXME возможно фильтрацию от наличия текущего товара стоит сделать на стороне API
    const similarProducts = sameCategoryProducts.value.filter(obj => obj._id !== product.value._id)
    
    // FIXME рандомизация вывода похожих товаров, не в курсе, как сделать лучше
	  for (let i = 0; i < similarProducts.length; i++) {
      const j = Math.floor(Math.random() * similarProducts.length);
      [similarProducts[i], similarProducts[j]] = [similarProducts[j], similarProducts[i]];
    }
    relatedProducts.value = similarProducts.slice(0, 4)
  }
}

watch(() => route.params.productId, (newId) => {
  if (newId) {
    fetchProduct(newId)
    currentImageIndex.value = 0
    quantity.value = 1
  }
})

onMounted(() => {
  fetchProduct(route.params.productId)
})
</script>

<style scoped>
.product-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Хлебные крошки */
.breadcrumbs {
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.breadcrumb-link {
  color: #007bff;
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-separator {
  margin: 0 8px;
}

.breadcrumb-current {
  color: #333;
}

/* Основной контейнер товара */
.product-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 60px;
}

@media (max-width: 768px) {
  .product-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

/* Галерея изображений */
.product-gallery {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.main-image {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
}

.product-main-img {
  width: 100%;
  height: 400px;
  object-fit: contain;
  display: block;
}

.thumbnails {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.thumbnail-item {
  min-width: 80px;
  height: 80px;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.3s;
}

.thumbnail-item.active {
  border-color: #007bff;
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-item:hover {
  border-color: #007bff;
}

/* Информация о товаре */
.product-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
}

.product-price-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.current-price {
  font-size: 32px;
  font-weight: bold;
  color: #007bff;
}

.product-stock {
  font-size: 16px;
  font-weight: 500;
}

.stock-available {
  color: #28a745;
}

.stock-low {
  color: #ffc107;
}

.stock-out {
  color: #dc3545;
}

.product-description h3 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #333;
}

.product-description p {
  line-height: 1.6;
  color: #666;
}

/* Действия с товаром */
.product-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.qty-btn {
  width: 40px;
  height: 40px;
  background: white;
  border: none;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-btn:hover:not(:disabled) {
  background: #f0f0f0;
}

.qty-input {
  width: 60px;
  height: 40px;
  border: none;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  text-align: center;
  font-size: 16px;
  appearance: textfield;
}

.add-to-cart-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-to-cart-btn.primary {
  background: #28a745;
  color: white;
  flex: 1;
}

.add-to-cart-btn.primary:hover:not(:disabled) {
  background: #218838;
}

.add-to-cart-btn.primary:disabled {
  background: #df8686;
  cursor: not-allowed;
}

.add-to-cart-btn.secondary {
  background: white;
  color: #007bff;
  border: 2px solid #007bff;
}

.add-to-cart-btn.secondary:hover {
  background: #007bff;
  color: white;
}

/* Состояния загрузки и ошибки */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-state h2 {
  color: #dc3545;
  margin-bottom: 15px;
}

.error-state p {
  color: #666;
  margin-bottom: 20px;
}

.back-to-home {
  display: inline-block;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 6px;
}

.back-to-home:hover {
  background: #0056b3;
}

/* Похожие товары */
.related-products {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid #eee;
}

.related-products h2 {
  margin-bottom: 20px;
  color: #333;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.related-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.related-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.related-image {
  height: 200px;
  overflow: hidden;
  background: #f8f9fa;
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.related-info {
  padding: 15px;
}

.related-info h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.related-price {
  font-size: 18px;
  font-weight: bold;
  color: #007bff;
  margin: 0;
}
</style>