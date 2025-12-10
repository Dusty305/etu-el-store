<template>
  <div class="category-tree-node"
      :style="{ marginLeft: `${level * 20}px` }"
  >
    <span class="category-name"
      :data-selected="isSelected"
      @click="categorySelected">
      {{ category.name }}
    </span>

    <div v-if="category.children && category.children.length > 0" class="category-children">
      <CategoryTreeNodeView
          v-for="child in category.children"
          :key="child._id"
          :category="child"
          :level="level + 1"
          :allCategories="allCategories"
          :selectedCategoryId="selectedCategoryId"
          @selected="$emit('selected', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

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
  },
  selectedCategoryId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['selected']);

const isSelected = computed(() => props.category._id === props.selectedCategoryId);

const categorySelected = () => {
  if (isSelected.value) {
    emit('selected', {
      categoryId: props.category._id,
      value: false
    });
  } else {
    emit('selected', {
      categoryId: props.category._id,
      value: true
    });
  }
};
</script>

<style scoped>

.category-tree-node {
  margin: 0.5rem 0;
  padding: 0 1rem;
  user-select: none;
}

.category-name {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  flex: 1;
  gap: 1rem;
  font-weight: 600;
  transition: all 0.2s;
}

.category-name[data-selected="false"] {
  background: #f8f9fa;
}

.category-name[data-selected="true"] {
  background: #5da2e2;
  color: white;
}

.category-name[data-selected="false"]:hover{
  border-left: 5px solid blue;
  font-weight: bolder;
  cursor: pointer;
  background: #f0f1f2;
}

.category-name[data-selected="true"]:hover{
  border-left: 5px solid blue;
  font-weight: bolder;
  cursor: pointer;
  background: #abd5fd;
}

</style>