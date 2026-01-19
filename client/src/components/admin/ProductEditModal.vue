<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ isEditing ? 'Редактировать товар' : 'Добавить товар' }}</h3>
        <button class="close-btn" @click="close">✕</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group required-input">
            <label for="name">Название товара</label>
            <BaseInput
              id="name"
              v-model="formData.name"
              placeholder="Введите название"
              required
            />
          </div>

          <div class="form-group">
            <label for="description">Описание</label>
            <textarea
              id="description"
              v-model="formData.description"
              class="form-textarea"
              placeholder="Введите описание товара"
              rows="3"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group required-input">
              <label for="price">Цена</label>
              <BaseInput
                id="price"
                v-model="formData.price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>

            <div class="form-group">
              <label for="stock">Количество на складе</label>
              <BaseInput
                id="stock"
                v-model="formData.stock"
                type="number"
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="category">Категория</label>
            <select
              id="category"
              v-model="formData.categories"
              class="form-select"
              multiple
            >
              <option
                v-for="cat in flatCategories"
                :key="cat._id"
                :value="cat._id"
              >
              {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Изображения товара</label>
            <div class="image-upload">
              <input
                type="file"
                multiple
                accept="image/*"
                @change="handleImageUpload"
                class="file-input"
              />
              <div v-if="formData.images.length" class="image-preview">
                <div
                  v-for="(image, index) in formData.images"
                  :key="index"
                  class="preview-item"
                >
                  <img :src="image.url" :alt="'Изображение ' + (index + 1)" />
                  <button
                    type="button"
                    @click="removeImage(index)"
                    class="remove-image-btn"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <BaseButton
              @click="close"
              variant="outline"
              class="cancel-btn"
            >
              Отмена
            </BaseButton>
            <BaseButton
              variant="primary"
              :disabled="isSubmitting"
              class="save-btn"
            >
              {{ isSubmitting ? 'Сохранение...' : 'Сохранить' }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, defineEmits, defineProps } from 'vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true
  },
  product: {
    type: Object,
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  flatCategories: {
    type: Array,
    default: []
  }
})

const emit = defineEmits(['close', 'save'])

const selectedCategories = ref([])

const isSubmitting = ref(false)
const formData = reactive({
  name: '',
  description: '',
  images: [],
  price: 0,
  categories: [],
  stock: 0,
})

watch(() => props.isVisible, (visible) => {
  if (visible && props.product) {
    Object.assign(formData, props.product)
  } else if (!visible) {
    resetForm()
  }
})

const resetForm = () => {
  Object.assign(formData, {
    name: '',
    description: '',
    images: [],
    price: 0,
    categories: [],
    stock: 0,
  })
}

const close = () => {
  emit('close')
}

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    await emit('save', { ...formData })
    close()
  } catch (error) {
    console.error('Ошибка сохранения:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files)
  if (files.length > 10) {
    alert('Выбрано более 10 файлов, оставшиеся загружены не будут')
    files = files.slice(0, 10)
  }

  files.forEach(file => {
    const url = URL.createObjectURL(file)
    formData.images.push({ url, file })
  })
  event.target.value = '' // Сброс input
}

const removeImage = (index) => {
  formData.images.splice(index, 1)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #6c757d;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  background-color: #f8f9fa;
  color: #495057;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-family: inherit;
  resize: vertical;
}

.form-textarea:focus {
  outline: none;
  border-color: #457fec;
  box-shadow: 0 0 0 3px rgba(69, 127, 236, 0.1);
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background-color: white;
  font-family: inherit;
}

.image-upload {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.required-input label {
  color: red;
}

.file-input {
  width: 100%;
  margin-bottom: 1rem;
}

.image-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.preview-item {
  position: relative;
  width: 100px;
  height: 100px;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #dc3545;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-input {
  margin-right: 0.5rem;
  width: 18px;
  height: 18px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.cancel-btn {
  min-width: 100px;
}

.save-btn {
  min-width: 120px;
  background: #28a745;
  border-color: #28a745;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #218838;
  border-color: #1e7e34;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    margin: 0 10px;
  }
}
</style>