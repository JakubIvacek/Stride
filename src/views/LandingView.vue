<template>
  <div class="lp">
    <!-- nav -->
    <header class="lp-nav">
      <div class="lp-container lp-nav-inner">
        <div class="lp-brand">
          <img src="/stride_icon.svg" alt="Stride" class="lp-logo">
          <span class="lp-name">Stride</span>
        </div>
        <nav class="lp-links">
          <a href="#features">Features</a>
          <a href="#devices">Devices</a>
          <button class="lp-btn sm" @click="$emit('start')">Get Started</button>
        </nav>
      </div>
    </header>

    <!-- hero -->
    <section class="lp-hero">
      <div class="lp-container lp-hero-inner">
        <div class="lp-hero-text">
          <h1>Simple weekly<br>planner.</h1>
          <p>Plan your week.<br>Track your progress.<br>Stay consistent.</p>
          <div class="lp-hero-actions">
            <button class="lp-btn" @click="$emit('start')">Get Started</button>
            <button class="lp-btn ghost" @click="tryDemo">Try Demo</button>
          </div>
          <span class="lp-note">Free · no credit card needed</span>
        </div>
        <div class="lp-hero-shot">
          <div class="lp-frame tall"><img src="/screens/Home.png" alt="Stride — this week"></div>
        </div>
      </div>
    </section>

    <!-- tagline / differentiator -->
    <section class="lp-tagline">
      <div class="lp-container">
        <p class="lp-tag-small">No projects. No workspaces. No endless settings.</p>
        <p class="lp-tag-big">Just your week.</p>
      </div>
    </section>

    <!-- why -->
    <section id="features" class="lp-why">
      <div class="lp-container">
        <p class="lp-eyebrow">Why Stride?</p>
        <h2>Most productivity apps are too complicated.<br>Stride focuses on three things.</h2>
        <div class="lp-cards3">
          <div v-for="f in features" :key="f.title" class="lp-card">
            <div class="lp-card-ic"><i class="ti" :class="f.icon"></i></div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- views -->
    <section class="lp-views">
      <div class="lp-container">
        <h2 class="center">A simple view for every part of your week.</h2>
        <div class="lp-cards3">
          <div v-for="v in views" :key="v.title" class="lp-view">
            <div class="lp-frame"><img :src="v.img" :alt="v.title"></div>
            <h3>{{ v.title }}</h3>
            <p>{{ v.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- devices + roadmap -->
    <section id="devices" class="lp-devices">
      <div class="lp-container lp-devices-inner">
        <div class="lp-devices-left">
          <h2>Use Stride on all your devices.</h2>
          <ul class="lp-device-list">
            <li v-for="d in devices" :key="d.title">
              <i class="ti" :class="d.icon"></i>
              <div>
                <span class="d-title">{{ d.title }}</span>
                <span class="d-text">{{ d.text }}</span>
              </div>
            </li>
          </ul>
        </div>
        <div class="lp-roadmap">
          <p class="lp-eyebrow">Roadmap</p>
          <div class="rm-group">
            <span class="rm-label">Today</span>
            <div v-for="r in roadmapNow" :key="r" class="rm-row done"><i class="ti ti-circle-check"></i>{{ r }}</div>
          </div>
          <div class="rm-group">
            <span class="rm-label">Coming later</span>
            <div v-for="r in roadmapSoon" :key="r" class="rm-row"><i class="ti ti-circle"></i>{{ r }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- final CTA -->
    <section class="lp-cta">
      <div class="lp-container">
        <h2>Ready to get organized?</h2>
        <p>Start using Stride today — it's free.</p>
        <button class="lp-btn" @click="$emit('start')">Get Started</button>
      </div>
    </section>

    <!-- footer -->
    <footer class="lp-footer">
      <div class="lp-container lp-footer-inner">
        <img src="/stride_by_keno.svg" alt="Stride by Keno" class="lp-footer-logo">
        <div class="lp-footer-links">
          <a :href="`mailto:${CONTACT_EMAIL}`">Contact</a>
          <a href="#" @click.prevent="$router.push('/privacy')">Privacy</a>
          <a href="#" @click.prevent="$router.push('/terms')">Terms</a>
          <span class="lp-copy">© 2026 Stride · by Keno</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { activateDemo } from '@/lib/demo'

defineEmits<{ start: [] }>()

function tryDemo() {
  activateDemo()
}

const CONTACT_EMAIL = 'stridebykeno@gmail.com'

const features = [
  { icon: 'ti-calendar', title: 'Weekly planning', text: 'Organize your tasks across a clean, weekly view.' },
  { icon: 'ti-circle-check', title: 'Daily execution', text: 'Check things off and get through your day.' },
  { icon: 'ti-chart-bar', title: 'Progress tracking', text: 'Streaks, completion and a weekly goal keep you on track.' },
]
const views = [
  { img: '/screens/Home.png', title: 'Home', text: 'Your week at a glance, day by day.' },
  { img: '/screens/Calendar.png', title: 'Calendar', text: 'Month and year views to plan ahead.' },
  { img: '/screens/Stats_Month.png', title: 'Statistics', text: 'Streaks, goals and your activity over time.' },
]
const devices = [
  { icon: 'ti-world', title: 'Web app', text: 'Works in any browser.' },
  { icon: 'ti-device-mobile', title: 'Installable as an app (PWA)', text: 'Add it to your home screen.' },
  { icon: 'ti-device-desktop', title: 'Desktop install', text: 'Install it on your computer too.' },
  { icon: 'ti-cloud', title: 'Synced everywhere', text: 'Your tasks follow you across devices.' },
]
const roadmapNow = ['Web App', 'PWA (install as an app)']
const roadmapSoon = ['iOS App', 'Android App', 'Push Notifications']
</script>

<style scoped>
.lp {
  --bg: #0b0b0d;
  --bg2: #111114;
  --card: #17171c;
  --line: rgba(255,255,255,0.08);
  --tx: #f3f3f5;
  --mut: #9a9aa3;
  --red: #ff2d20;
  background: var(--bg); color: var(--tx);
  min-height: 100%; overflow-y: auto;
  font-family: -apple-system, 'SF Pro Display', Inter, system-ui, sans-serif;
}
.lp-container { max-width: 1080px; margin: 0 auto; padding: 0 28px; width: 100%; box-sizing: border-box; }

/* nav */
.lp-nav { border-bottom: 0.5px solid var(--line); position: sticky; top: 0; background: rgba(11,11,13,0.85); backdrop-filter: blur(8px); z-index: 10; }
.lp-nav-inner { display: flex; align-items: center; justify-content: space-between; height: 60px; }
.lp-brand { display: flex; align-items: center; gap: 9px; }
.lp-logo { height: 24px; filter: brightness(0) invert(1); }
.lp-name { font-size: 18px; font-weight: 600; letter-spacing: -0.4px; }
.lp-links { display: flex; align-items: center; gap: 26px; }
.lp-links a { color: var(--mut); text-decoration: none; font-size: 14px; }
.lp-links a:hover { color: var(--tx); }

.lp-btn {
  border: none; cursor: pointer; background: var(--red); color: #fff;
  font-size: 15px; font-weight: 600; padding: 12px 22px; border-radius: 10px;
}
.lp-btn.sm { padding: 8px 16px; font-size: 14px; border-radius: 8px; }
.lp-btn.ghost { background: transparent; border: 0.5px solid rgba(255,255,255,0.2); color: var(--tx); }
.lp-btn.ghost:hover { background: rgba(255,255,255,0.06); filter: none; }
.lp-btn:hover { filter: brightness(1.08); }
.lp-hero-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }

/* hero */
.lp-hero { padding: 80px 0 90px; }
.lp-hero-inner { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 40px; align-items: center; }
.lp-hero-text h1 { font-size: 56px; line-height: 1.04; font-weight: 700; letter-spacing: -1.5px; margin: 0 0 20px; }
.lp-hero-text p { font-size: 19px; color: var(--mut); line-height: 1.5; margin: 0 0 28px; }
.lp-note { display: block; margin-top: 14px; font-size: 13px; color: var(--mut); }
.lp-hero-shot { display: flex; justify-content: center; }

.lp-frame {
  width: 100%; aspect-ratio: 393 / 855; border-radius: 22px;
  background: #121216; overflow: hidden;
  border: 0.5px solid var(--line); box-shadow: 0 30px 80px rgba(0,0,0,0.5);
}
.lp-frame img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }
.lp-frame.tall { max-width: 300px; }
.lp-view .lp-frame { max-width: 232px; margin: 0 auto; }

/* tagline / differentiator */
.lp-tagline { padding: 56px 0; text-align: center; border-top: 0.5px solid var(--line); }
.lp-tag-small { font-size: 18px; color: var(--mut); margin: 0 0 10px; letter-spacing: -0.2px; }
.lp-tag-big { font-size: 40px; font-weight: 700; letter-spacing: -1px; margin: 0; }

/* why */
.lp-why { background: var(--bg2); border-top: 0.5px solid var(--line); border-bottom: 0.5px solid var(--line); padding: 80px 0; }
.lp-eyebrow { color: var(--red); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; margin: 0 0 14px; }
.lp-why h2, .lp-views h2 { font-size: 30px; font-weight: 600; letter-spacing: -0.5px; line-height: 1.25; margin: 0 0 40px; }
.lp-views h2.center { text-align: center; }
.lp-cards3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.lp-card { background: var(--card); border: 0.5px solid var(--line); border-radius: 14px; padding: 24px; }
.lp-card-ic { width: 44px; height: 44px; border-radius: 12px; background: rgba(255,45,32,0.12); color: var(--red); display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 16px; }
.lp-card h3 { font-size: 17px; font-weight: 600; margin: 0 0 8px; }
.lp-card p, .lp-view p { font-size: 14px; color: var(--mut); line-height: 1.5; margin: 0; }

/* views */
.lp-views { padding: 80px 0; }
.lp-view { text-align: center; }
.lp-view h3 { font-size: 17px; font-weight: 600; margin: 16px 0 6px; }

/* devices */
.lp-devices { background: var(--bg2); border-top: 0.5px solid var(--line); padding: 80px 0; }
.lp-devices-inner { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; }
.lp-devices-left h2 { font-size: 30px; font-weight: 600; letter-spacing: -0.5px; margin: 0 0 28px; }
.lp-device-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 20px; }
.lp-device-list li { display: flex; gap: 14px; }
.lp-device-list i { color: var(--red); font-size: 22px; flex-shrink: 0; }
.d-title { display: block; font-size: 15px; font-weight: 600; }
.d-text { display: block; font-size: 13px; color: var(--mut); margin-top: 2px; }

.lp-roadmap { background: var(--card); border: 0.5px solid var(--line); border-radius: 16px; padding: 24px; }
.rm-group + .rm-group { margin-top: 18px; }
.rm-label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--mut); margin-bottom: 10px; }
.rm-row { display: flex; align-items: center; gap: 9px; font-size: 14px; color: var(--mut); padding: 5px 0; }
.rm-row i { font-size: 18px; }
.rm-row.done { color: var(--tx); }
.rm-row.done i { color: #34c759; }

/* cta */
.lp-cta { padding: 90px 0; text-align: center; }
.lp-cta h2 { font-size: 34px; font-weight: 700; letter-spacing: -0.5px; margin: 0 0 12px; }
.lp-cta p { font-size: 17px; color: var(--mut); margin: 0 0 28px; }

/* footer */
.lp-footer { border-top: 0.5px solid var(--line); padding: 10px 0; }
.lp-footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.lp-footer-logo { height: 125px; width: auto; filter: brightness(0) invert(1); opacity: 0.95; }
.lp-footer-links { display: flex; align-items: center; gap: 22px; flex-shrink: 0; }
.lp-footer-links a { color: var(--mut); text-decoration: none; font-size: 14px; }
.lp-footer-links a:hover { color: var(--tx); }
.lp-copy { color: var(--mut); font-size: 13px; white-space: nowrap; }

/* tablet: 2-up cards, narrower gaps */
@media (max-width: 900px) {
  .lp-cards3 { grid-template-columns: repeat(2, 1fr); }
  .lp-hero-inner { gap: 32px; }

  /* 3rd item centers when it wraps to a new row */
  .lp-cards3 > :last-child:nth-child(odd) {
    grid-column: 1 / -1;
    width: calc(50% - 10px);
    margin-left: auto;
    margin-right: auto;
    text-align: center;
  }
}

/* mobile: single column, tuned type + spacing */
@media (max-width: 760px) {
  .lp { overflow-x: hidden; }
  .lp-container { padding: 0 22px; }
  .lp-links a { display: none; }

  .lp-hero-inner, .lp-devices-inner { grid-template-columns: 1fr; }
  .lp-cards3 { grid-template-columns: 1fr; }

  /* hero (centered on mobile) */
  .lp-hero { padding: 44px 0 52px; }
  .lp-hero-text { text-align: center; }
  .lp-hero-text h1 { font-size: 40px; letter-spacing: -1px; }
  .lp-hero-text p { font-size: 17px; }
  .lp-hero-shot { margin-top: 36px; }
  .lp-frame.tall { max-width: 270px; }
  .lp-view .lp-frame { max-width: 270px; }

  /* tagline */
  .lp-tagline { padding: 44px 0; }
  .lp-tag-small { font-size: 15px; }
  .lp-tag-big { font-size: 28px; }

  /* sections */
  .lp-why, .lp-views, .lp-devices { padding: 56px 0; }
  .lp-why h2, .lp-views h2, .lp-devices-left h2 { font-size: 24px; line-height: 1.3; margin-bottom: 28px; }
  .lp-roadmap { margin-top: 24px; }

  /* cta */
  .lp-cta { padding: 64px 0; }
  .lp-cta h2 { font-size: 27px; }
  .lp-cta p { font-size: 16px; }

  /* footer: links stacked as a menu, logo at the very bottom */
  .lp-footer { padding: 36px 0; }
  .lp-footer-inner { flex-direction: column-reverse; align-items: center; gap: 22px; text-align: center; }
  .lp-footer-logo { height: 92px; }
  .lp-footer-links { flex-direction: column; gap: 14px; }
  .lp-copy { margin-top: 4px; }
}
</style>
