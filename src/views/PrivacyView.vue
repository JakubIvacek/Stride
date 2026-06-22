<template>
  <LegalPage
    title="Privacy Policy"
    updated="Last updated: June 2026"
    hero-icon="ti-shield"
    hero-title="We respect your privacy."
    hero-desc="This policy explains what information we collect and how we use it."
    :sections="sections"
    @back="$emit('back')"
  />
</template>

<script setup lang="ts">
import LegalPage from './LegalPage.vue'

defineEmits<{ back: [] }>()

const sections = [
  {
    icon: 'ti-user',
    title: 'Information we collect',
    items: ['Email address', 'Tasks and categories you create', 'Basic usage analytics'],
  },
  {
    icon: 'ti-database',
    title: 'How we use your information',
    items: ['Provide and sync the service', 'Authenticate your account', 'Improve Stride and fix issues'],
  },
  {
    icon: 'ti-lock',
    title: 'Your rights',
    items: ['Export your data at any time', 'Delete your account and data'],
  },
  {
    icon: 'ti-mail',
    title: 'Contact',
    text: 'If you have any questions, contact us at:',
    email: 'stridebykeno@gmail.com',
  },
]
</script>
