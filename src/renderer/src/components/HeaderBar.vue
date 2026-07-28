<script setup>
import OpenProjectButton from './OpenProjectButton.vue'

defineProps({
  subtitle: { type: String, default: '' },
  hasLastBuild: { type: Boolean, default: false },
  previewOpening: { type: Boolean, default: false },
  previewError: { type: String, default: null }
})

defineEmits(['open-last-project', 'open-project-from-dialog'])
</script>

<template>
  <header class="header-bar">
    <div class="header-content">
      <div class="brand">
        <span class="brand-mark" aria-hidden="true">☙</span>
        <div class="brand-text">
          <h1 class="header-title">Pulpitum</h1>
          <p v-if="subtitle" class="header-subtitle">{{ subtitle }}</p>
        </div>
      </div>

      <OpenProjectButton
        :has-last-build="hasLastBuild"
        :opening="previewOpening"
        :error="previewError"
        @open-last="$emit('open-last-project')"
        @open-from-dialog="$emit('open-project-from-dialog')"
      />
    </div>
  </header>
</template>

<style scoped>
.header-bar {
  background: var(--paper-000);
  padding: 2rem;
  flex-shrink: 0;
  border-bottom: 1px solid var(--ink-200);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.brand-mark {
  font-family: var(--font-display);
  font-size: 2.2rem;
  color: var(--rubric-700);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
}

.brand-text {
  min-width: 0;
}

.header-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 2rem;
  color: var(--ink-900);
  letter-spacing: 0.05em;
  font-weight: normal;
}

.header-subtitle {
  margin: 0.2rem 0 0;
  color: var(--ink-500);
  font-family: var(--font-display);
  font-style: italic;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
}
</style>
