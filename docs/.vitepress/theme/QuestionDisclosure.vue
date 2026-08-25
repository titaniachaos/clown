<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <details class="question-disclosure">
    <summary>{{ title }}</summary>
    <div class="question-disclosure__answer"><slot /></div>
  </details>
</template>
