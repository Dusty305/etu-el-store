<!-- src/components/admin/CategoryTreeNode.vue -->
<template>
  <div class="category-tree-node" :style="{ marginLeft: `${level * 20}px` }">
    <div class="category-item" :class="{ 'editing': isEditing }">
      <div class="category-content">
        <span class="category-name" v-if="!isEditing">
          {{ category.name }}
        </span>

        <div v-else class="edit-form">
          <BaseInput
              v-model="editForm.name"
              placeholder="Название категории"
              class="edit-input"
          />
          <select v-model="editForm.parentCategory" class="parent-select">
            <option :value="null">Корневая категория</option>
            <option
                v-for="cat in availableParents"
                :key="cat._id"
                :value="cat._id"
                :disabled="cat._id === category._id"
            >
              {{ getCategoryPath(cat) }}
            </option>
          </select>
        </div>

        <span class="category-info" v-if="!isEditing">
          (ID: {{ category._id }})
        </span>
      </div>

      <div class="category-actions" v-if="!isEditing">
        <BaseButton
            @click="startEditing"
            variant="outline"
            size="small"
            title="Редактировать"
        >
          ✏️
        </BaseButton>
        <BaseButton
            @click="handleDelete"
            variant="outline"
            size="small"
            title="Удалить"
            class="delete-btn"
        >
          🗑️
        </BaseButton>
      </div>

      <div class="edit-actions" v-else>
        <BaseButton
            @click="saveEdit"
            variant="primary"
            size="small"
            :disabled="!editForm.name.trim()"
        >
          💾
        </BaseButton>
        <BaseButton
            @click="cancelEdit"
            variant="outline"
            size="small"
        >
          ❌
        </BaseButton>
      </div>
    </div>

    <div v-if="category.children && category.children.length > 0" class="category-children">
      <CategoryTreeNode
          v-for="child in category.children"
          :key="child._id"
          :category="child"
          :level="level + 1"
          :allCategories="allCategories"
          @category-updated="$emit('category-updated')"
          @category-deleted="$emit('category-deleted')"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseInput from '../ui/BaseInput.vue';
import BaseButton from '../ui/BaseButton.vue';

const props = defineProps({
  category: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 0
  },
  allCategories: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['category-updated', 'category-deleted']);

const isEditing = ref(false);
const editForm = ref({
  name: '',
  parentCategory: null
});

// Доступные родительские категории (все кроме текущей и ее потомков)
const availableParents = computed(() => {
  const excludeIds = new Set();
  const collectIds = (cat) => {
    excludeIds.add(cat._id);
    if (cat.children) {
      cat.children.forEach(collectIds);
    }
  };
  collectIds(props.category);

  return props.allCategories.filter(cat => !excludeIds.has(cat._id));
});

const getCategoryPath = (category, path = '') => {
  if (!category.parentCategory) return category.name;

  const parent = props.allCategories.find(cat => cat._id === category.parentCategory);
  if (!parent) return category.name;

  return `${getCategoryPath(parent)} → ${category.name}`;
};

const startEditing = () => {
  editForm.value = {
    name: props.category.name,
    parentCategory: props.category.parentCategory
  };
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  editForm.value = {
    name: '',
    parentCategory: null
  };
};

const saveEdit = async () => {
  if (!editForm.value.name.trim()) return;

  emit('category-updated', {
    categoryId: props.category._id,
    data: editForm.value
  });
  isEditing.value = false;
};

const handleDelete = () => {
  if (confirm(`Удалить категорию "${props.category.name}"? Подкатегории будут перемещены на уровень выше.`)) {
    emit('category-deleted', props.category._id);
  }
};
</script>

<style scoped>
.category-tree-node {
  margin-bottom: 0.5rem;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  transition: all 0.2s;
}

.category-item.editing {
  background: #e7f3ff;
  border-color: #007bff;
}

.category-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.category-name {
  font-weight: 600;
  font-size: 1rem;
}

.category-info {
  color: #6c757d;
  font-size: 0.875rem;
}

.edit-form {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex: 1;
}

.edit-input {
  flex: 1;
  margin-bottom: 0;
}

.parent-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
}

.category-actions, .edit-actions {
  display: flex;
  gap: 0.5rem;
}

.delete-btn {
  color: #dc3545;
  border-color: #dc3545;
}

.delete-btn:hover {
  background: #dc3545;
  color: white;
}

.category-children {
  margin-top: 0.5rem;
  border-left: 2px solid #e9ecef;
  padding-left: 1rem;
}
</style>