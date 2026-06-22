<template>
  <div class="lg">
    <!-- nav: logo left, circular back right (same as landing) -->
    <header class="lg-nav">
      <div class="lg-container lg-nav-inner">
        <div class="lg-brand">
          <img src="/stride_icon.svg" alt="Stride" class="lg-logo">
          <span class="lg-name">Stride</span>
        </div>
        <button class="lg-back" aria-label="Back" @click="$emit('back')">
          <i class="ti ti-arrow-left"></i>
        </button>
      </div>
    </header>

    <main class="lg-container lg-main">
      <!-- page title -->
      <h1 class="lg-title">{{ title }}</h1>
      <p class="lg-sub">{{ updated }}</p>

      <!-- header card -->
      <div class="lg-hero">
        <div class="lg-hero-ic"><i class="ti" :class="heroIcon"></i></div>
        <h2>{{ heroTitle }}</h2>
        <p>{{ heroDesc }}</p>
      </div>

      <!-- sections -->
      <section v-for="s in sections" :key="s.title" class="lg-sec">
        <div class="lg-sec-head">
          <div class="lg-sec-ic"><i class="ti" :class="s.icon"></i></div>
          <h3>{{ s.title }}</h3>
        </div>
        <p v-if="s.text" class="lg-sec-text">{{ s.text }}</p>
        <ul v-if="s.items" class="lg-list">
          <li v-for="it in s.items" :key="it">{{ it }}</li>
        </ul>
        <a v-if="s.email" class="lg-mail" :href="`mailto:${s.email}`">{{ s.email }}</a>
      </section>
    </main>

    <footer class="lg-footer">
      <div class="lg-container lg-footer-inner">
        <img src="/stride_by_keno.svg" alt="Stride by Keno" class="lg-footer-logo">
        <div class="lg-footer-links">
          <a :href="`mailto:${CONTACT_EMAIL}`">Contact</a>
          <a href="#" @click.prevent="$router.push('/privacy')">Privacy</a>
          <a href="#" @click.prevent="$router.push('/terms')">Terms</a>
          <span class="lg-copy">© 2026 Stride · by Keno</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
interface LegalSection {
  icon: string
  title: string
  text?: string
  items?: string[]
  email?: string
}
defineProps<{
  title: string
  updated: string
  heroIcon: string
  heroTitle: string
  heroDesc: string
  sections: LegalSection[]
}>()
defineEmits<{ back: [] }>()

const CONTACT_EMAIL = 'stridebykeno@gmail.com'
</script>

<style scoped>
.lg {
  --bg: #0b0b0f;
  --card: #17171c;
  --line: rgba(255,255,255,0.08);
  --tx: #f3f3f5;
  --mut: #9a9aa3;
  --red: #ff2d20;
  background: var(--bg); color: var(--tx);
  min-height: 100%; overflow-y: auto;
  font-family: -apple-system, 'SF Pro Display', Inter, system-ui, sans-serif;
}
.lg-container { max-width: 900px; margin: 0 auto; padding: 0 28px; width: 100%; box-sizing: border-box; }

/* nav (matches landing) */
.lg-nav { border-bottom: 0.5px solid var(--line); position: sticky; top: 0; background: rgba(11,11,15,0.85); backdrop-filter: blur(8px); z-index: 10; }
.lg-nav-inner { display: flex; align-items: center; justify-content: space-between; height: 60px; }
.lg-brand { display: flex; align-items: center; gap: 9px; }
.lg-logo { height: 24px; filter: brightness(0) invert(1); }
.lg-name { font-size: 18px; font-weight: 600; letter-spacing: -0.4px; }
.lg-back {
  width: 38px; height: 38px; border-radius: 50%; cursor: pointer;
  background: var(--card); border: 0.5px solid var(--line); color: var(--tx);
  display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.lg-back:hover { background: #20202a; }

/* page head */
.lg-main { padding: 56px 28px 80px; }
.lg-title { font-size: 42px; font-weight: 700; letter-spacing: -1px; margin: 0 0 8px; }
.lg-sub { font-size: 14px; color: var(--mut); margin: 0 0 40px; }

/* header card */
.lg-hero {
  background: var(--card); border: 0.5px solid var(--line); border-radius: 18px;
  padding: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.4); margin-bottom: 44px;
}
.lg-hero-ic {
  width: 52px; height: 52px; border-radius: 14px; background: rgba(255,45,32,0.12);
  color: var(--red); display: flex; align-items: center; justify-content: center;
  font-size: 26px; margin-bottom: 18px;
}
.lg-hero h2 { font-size: 24px; font-weight: 600; letter-spacing: -0.4px; margin: 0 0 10px; }
.lg-hero p { font-size: 16px; color: var(--mut); line-height: 1.55; margin: 0; }

/* sections */
.lg-sec { padding: 36px 0; border-top: 0.5px solid var(--line); }
.lg-sec:first-of-type { border-top: none; padding-top: 0; }
.lg-sec-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.lg-sec-ic {
  width: 38px; height: 38px; border-radius: 11px; background: rgba(255,45,32,0.12);
  color: var(--red); display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
}
.lg-sec-head h3 { font-size: 19px; font-weight: 600; letter-spacing: -0.3px; margin: 0; }
.lg-sec-text { font-size: 16px; color: var(--mut); line-height: 1.6; margin: 0; }
.lg-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.lg-list li { position: relative; padding-left: 22px; font-size: 16px; color: var(--mut); line-height: 1.5; }
.lg-list li::before {
  content: ''; position: absolute; left: 4px; top: 9px;
  width: 6px; height: 6px; border-radius: 50%; background: var(--red);
}
.lg-mail { display: inline-block; margin-top: 12px; color: var(--red); font-size: 16px; font-weight: 500; text-decoration: none; }
.lg-mail:hover { text-decoration: underline; }

/* footer (matches landing) */
.lg-footer { border-top: 0.5px solid var(--line); padding: 10px 0; }
.lg-footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.lg-footer-logo { height: 125px; width: auto; filter: brightness(0) invert(1); opacity: 0.95; }
.lg-footer-links { display: flex; align-items: center; gap: 22px; flex-shrink: 0; }
.lg-footer-links a { color: var(--mut); text-decoration: none; font-size: 14px; }
.lg-footer-links a:hover { color: var(--tx); }
.lg-copy { color: var(--mut); font-size: 13px; white-space: nowrap; }

@media (max-width: 600px) {
  .lg-title { font-size: 32px; }
  .lg-main { padding: 40px 22px 64px; }
  .lg-container { padding: 0 22px; }
  .lg-hero { padding: 24px; }
  .lg-footer { padding: 36px 0; }
  .lg-footer-inner { flex-direction: column-reverse; align-items: center; gap: 22px; text-align: center; }
  .lg-footer-logo { height: 92px; }
  .lg-footer-links { flex-direction: column; gap: 14px; }
  .lg-copy { margin-top: 4px; }
}
</style>
