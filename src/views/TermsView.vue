<template>
  <LegalPage
    title="Terms of Service"
    updated="Last updated: June 2026"
    hero-icon="ti-file-text"
    hero-title="By using Stride you agree to these terms."
    hero-desc="Please read them carefully."
    :sections="sections"
    @back="$emit('back')"
  />
</template>

<script setup lang="ts">
import LegalPage from './LegalPage.vue'

defineEmits<{ back: [] }>()

const sections = [
  {
    icon: 'ti-circle-check',
    title: 'Using Stride',
    text: 'Stride is a productivity and task management tool. You agree to use it for personal and lawful purposes only.',
  },
  {
    icon: 'ti-user',
    title: 'Your content',
    text: 'You are responsible for the tasks, notes and other content you create in Stride. You keep full ownership of your content.',
  },
  {
    icon: 'ti-shield',
    title: 'Availability',
    text: "Stride is provided 'as is' without warranties of any kind. We do our best to keep the service reliable and secure.",
  },
  {
    icon: 'ti-circle-x',
    title: 'Termination',
    text: 'You may stop using Stride and delete your account at any time through the application.',
  },
  {
    icon: 'ti-mail',
    title: 'Contact',
    text: 'If you have any questions, contact us at:',
    email: 'stridebykeno@gmail.com',
  },
]
</script>
