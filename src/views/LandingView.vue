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
          <button class="lp-btn sm" @click="$emit('start')">Get started</button>
        </nav>
      </div>
    </header>

    <!-- hero -->
    <section class="lp-hero">
      <div class="lp-container lp-hero-inner">
        <div class="lp-hero-text">
          <div class="lp-badge">Weekly planner · free</div>
          <h1>Your week,<br>finally under<br>control.</h1>
          <p>Plan your week. Check things off. Track your progress. No clutter, no learning curve.</p>
          <div class="lp-hero-actions">
            <button class="lp-btn" @click="$emit('start')">Get started free</button>
            <button class="lp-text-btn" @click="tryDemo">Try the demo →</button>
          </div>
          <span class="lp-note">No credit card needed</span>
        </div>
        <div class="lp-hero-shot">
          <div class="lp-shot-glow"></div>
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
        <p class="lp-eyebrow">Why Stride</p>
        <h2>Most productivity apps are too complicated.<br>Stride focuses on three things.</h2>
        <div class="lp-feat-rows">
          <div v-for="(f, i) in features" :key="f.title" class="lp-feat-row">
            <span class="lp-feat-num">0{{ i + 1 }}</span>
            <div class="lp-feat-ic"><i class="ti" :class="f.icon"></i></div>
            <div class="lp-feat-body">
              <h3>{{ f.title }}</h3>
              <p>{{ f.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- views / screenshots -->
    <section class="lp-views">
      <div class="lp-container">
        <h2 class="center">A clear view for every part of your week.</h2>
        <div class="lp-screens">
          <div v-for="(v, i) in views" :key="v.title" class="lp-screen" :class="{ 'lp-screen-mid': i === 1 }">
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
      <div class="lp-cta-glow"></div>
      <div class="lp-container lp-cta-inner">
        <h2>Ready to get organized?</h2>
        <p>Start using Stride today — it's free.</p>
        <button class="lp-btn lp-btn-lg" @click="$emit('start')">Get started free</button>
        <span class="lp-note">No credit card needed</span>
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
  scroll-behavior: smooth;
}
.lp-container { max-width: 1080px; margin: 0 auto; padding: 0 28px; width: 100%; box-sizing: border-box; }

/* ── Nav ─────────────────────────────────── */
.lp-nav {
  border-bottom: 0.5px solid var(--line); position: sticky; top: 0;
  background: rgba(11,11,13,0.8);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  z-index: 10;
}
.lp-nav-inner { display: flex; align-items: center; justify-content: space-between; height: 60px; }
.lp-brand { display: flex; align-items: center; gap: 9px; }
.lp-logo { height: 24px; filter: brightness(0) invert(1); }
.lp-name { font-size: 18px; font-weight: 600; letter-spacing: -0.4px; }
.lp-links { display: flex; align-items: center; gap: 26px; }
.lp-links a { color: var(--mut); text-decoration: none; font-size: 14px; transition: color 0.2s; }
.lp-links a:hover { color: var(--tx); }

/* ── Buttons ─────────────────────────────── */
.lp-btn {
  border: none; cursor: pointer; background: var(--red); color: #fff;
  font-size: 15px; font-weight: 600; padding: 12px 22px; border-radius: 10px;
  transition: filter 0.2s, transform 0.15s;
  will-change: transform;
}
.lp-btn.sm { padding: 8px 16px; font-size: 14px; border-radius: 8px; }
.lp-btn.lp-btn-lg { padding: 14px 30px; font-size: 16px; border-radius: 12px; }
.lp-btn:active { transform: scale(0.97); filter: brightness(0.9); }
.lp-btn:focus-visible { outline: 2px solid var(--red); outline-offset: 3px; }

/* text link — used for secondary action (Try demo) */
.lp-text-btn {
  background: none; border: none; cursor: pointer;
  color: var(--mut); font-size: 15px; font-weight: 500;
  padding: 0; transition: color 0.2s;
}
.lp-text-btn:hover { color: var(--tx); }
.lp-text-btn:focus-visible { outline: 2px solid var(--red); outline-offset: 3px; border-radius: 3px; }

.lp-hero-actions { display: flex; gap: 18px; align-items: center; flex-wrap: wrap; }

/* ── Badge ───────────────────────────────── */
.lp-badge {
  display: inline-flex; align-items: center;
  background: rgba(255,45,32,0.1);
  border: 0.5px solid rgba(255,45,32,0.28);
  color: var(--red);
  font-size: 12px; font-weight: 500; letter-spacing: 0.2px;
  padding: 5px 12px; border-radius: 100px;
  margin-bottom: 18px;
}

/* ── Hero ────────────────────────────────── */
.lp-hero { padding: 80px 0 90px; }
.lp-hero-inner { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 40px; align-items: center; }
.lp-hero-text { animation: fadeUp 0.5s ease both; }
.lp-hero-text h1 {
  font-size: 60px; line-height: 1.02; font-weight: 700; letter-spacing: -2px;
  margin: 0 0 20px; text-wrap: balance;
}
.lp-hero-text p { font-size: 18px; color: var(--mut); line-height: 1.55; margin: 0 0 30px; max-width: 380px; }
.lp-note { display: block; margin-top: 14px; font-size: 13px; color: var(--mut); }

.lp-hero-shot {
  display: flex; justify-content: center; position: relative;
  animation: fadeUp 0.5s 0.1s ease both;
}
.lp-shot-glow {
  position: absolute; bottom: -8%; left: 50%; transform: translateX(-50%);
  width: 140%; height: 65%;
  background: radial-gradient(ellipse 42% 90% at center bottom, rgba(255,45,32,0.16) 0%, transparent 100%);
  pointer-events: none; z-index: 0;
}

/* ── Phone frames ────────────────────────── */
.lp-frame {
  width: 100%; aspect-ratio: 393 / 855; border-radius: 22px;
  background: #121216; overflow: hidden;
  border: 0.5px solid var(--line);
  box-shadow: 0 30px 80px rgba(0,0,0,0.5);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative; z-index: 1;
}
.lp-frame img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }
.lp-frame.tall { max-width: 300px; }

/* ── Tagline ─────────────────────────────── */
.lp-tagline { padding: 60px 0; text-align: center; border-top: 0.5px solid var(--line); }
.lp-tag-small { font-size: 17px; color: var(--mut); margin: 0 0 10px; letter-spacing: -0.2px; }
.lp-tag-big { font-size: 42px; font-weight: 700; letter-spacing: -1.2px; margin: 0; text-wrap: balance; }

/* ── Why / Features ──────────────────────── */
.lp-why { background: var(--bg2); border-top: 0.5px solid var(--line); border-bottom: 0.5px solid var(--line); padding: 80px 0; }
.lp-eyebrow { color: var(--red); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 14px; }
.lp-why h2 { font-size: 28px; font-weight: 600; letter-spacing: -0.4px; line-height: 1.28; margin: 0 0 44px; max-width: 560px; }

.lp-feat-rows { }
.lp-feat-row {
  display: grid;
  grid-template-columns: 56px 52px 1fr;
  gap: 0 20px;
  padding: 26px 0;
  border-top: 0.5px solid var(--line);
  align-items: center;
}
.lp-feat-row:last-child { border-bottom: 0.5px solid var(--line); }
.lp-feat-num {
  font-size: 12px; color: var(--mut);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.3px;
}
.lp-feat-ic {
  width: 44px; height: 44px; border-radius: 12px;
  background: rgba(255,45,32,0.1); color: var(--red);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; flex-shrink: 0;
}
.lp-feat-body h3 { font-size: 17px; font-weight: 600; margin: 0 0 5px; }
.lp-feat-body p { font-size: 14px; color: var(--mut); line-height: 1.5; margin: 0; }

/* ── Views / Screenshots ─────────────────── */
.lp-views { padding: 80px 0; }
.lp-views h2.center { font-size: 28px; font-weight: 600; letter-spacing: -0.4px; line-height: 1.28; text-align: center; margin: 0 0 52px; }

.lp-screens {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  align-items: end;
}
.lp-screen { text-align: center; }
.lp-screen-mid { transform: translateY(-24px); }
.lp-screen .lp-frame { max-width: 232px; margin: 0 auto; }
.lp-screen h3 { font-size: 17px; font-weight: 600; margin: 16px 0 6px; }
.lp-screen p { font-size: 14px; color: var(--mut); line-height: 1.5; margin: 0; }

/* ── Devices ─────────────────────────────── */
.lp-devices { background: var(--bg2); border-top: 0.5px solid var(--line); padding: 80px 0; }
.lp-devices-inner { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; }
.lp-devices-left h2 { font-size: 28px; font-weight: 600; letter-spacing: -0.4px; margin: 0 0 28px; }
.lp-device-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 20px; }
.lp-device-list li { display: flex; gap: 14px; }
.lp-device-list i { color: var(--red); font-size: 22px; flex-shrink: 0; }
.d-title { display: block; font-size: 15px; font-weight: 600; }
.d-text { display: block; font-size: 13px; color: var(--mut); margin-top: 2px; }

.lp-roadmap { background: var(--card); border: 0.5px solid var(--line); border-radius: 16px; padding: 24px; }
.rm-group + .rm-group { margin-top: 18px; }
.rm-label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; color: var(--mut); margin-bottom: 10px; }
.rm-row { display: flex; align-items: center; gap: 9px; font-size: 14px; color: var(--mut); padding: 5px 0; }
.rm-row i { font-size: 18px; }
.rm-row.done { color: var(--tx); }
.rm-row.done i { color: #34c759; }

/* ── CTA ─────────────────────────────────── */
.lp-cta { padding: 100px 0; text-align: center; position: relative; overflow: hidden; }
.lp-cta-glow {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 700px; height: 420px;
  background: radial-gradient(ellipse at center, rgba(255,45,32,0.1) 0%, transparent 68%);
  pointer-events: none;
}
.lp-cta-inner { position: relative; z-index: 1; }
.lp-cta h2 { font-size: 36px; font-weight: 700; letter-spacing: -0.6px; margin: 0 0 12px; }
.lp-cta p { font-size: 17px; color: var(--mut); margin: 0 0 30px; }
.lp-cta .lp-note { display: block; margin-top: 16px; }

/* ── Footer ──────────────────────────────── */
.lp-footer { border-top: 0.5px solid var(--line); padding: 10px 0; }
.lp-footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.lp-footer-logo { height: 125px; width: auto; filter: brightness(0) invert(1); opacity: 0.95; }
.lp-footer-links { display: flex; align-items: center; gap: 22px; flex-shrink: 0; }
.lp-footer-links a { color: var(--mut); text-decoration: none; font-size: 14px; transition: color 0.2s; }
.lp-footer-links a:hover { color: var(--tx); }
.lp-copy { color: var(--mut); font-size: 13px; white-space: nowrap; }

/* ── Entry animation ─────────────────────── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Hover effects (pointer device only) ──── */
@media (hover: hover) and (pointer: fine) {
  .lp-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .lp-btn.sm:hover { transform: translateY(-1px); }
  .lp-frame:hover {
    transform: translateY(-6px);
    box-shadow: 0 40px 100px rgba(0,0,0,0.6), 0 0 36px rgba(255,45,32,0.07);
  }
  /* don't double-transform the elevated center card */
  .lp-screen-mid .lp-frame:hover { transform: translateY(-6px); }
}

/* ── Accessibility: reduced motion ──────── */
@media (prefers-reduced-motion: reduce) {
  .lp-hero-text, .lp-hero-shot { animation: none; }
  .lp-frame, .lp-btn, .lp-text-btn, .lp-links a, .lp-footer-links a { transition: none; }
}

/* ── Responsive: tablet ─────────────────── */
@media (max-width: 900px) {
  .lp-screens { grid-template-columns: repeat(2, 1fr); align-items: start; }
  .lp-screen-mid { transform: none; }
  .lp-screens > :last-child:nth-child(odd) {
    grid-column: 1 / -1;
    width: calc(50% - 10px);
    margin-left: auto; margin-right: auto;
    text-align: center;
  }
  .lp-hero-inner { gap: 32px; }
}

/* ── Responsive: mobile ─────────────────── */
@media (max-width: 760px) {
  .lp { overflow-x: hidden; }
  .lp-container { padding: 0 22px; }
  .lp-links a { display: none; }

  .lp-hero-inner, .lp-devices-inner { grid-template-columns: 1fr; }
  .lp-screens { grid-template-columns: 1fr; align-items: start; }
  .lp-screens > :last-child:nth-child(odd) { grid-column: unset; width: 100%; margin-left: 0; margin-right: 0; }

  /* hero */
  .lp-hero { padding: 44px 0 52px; }
  .lp-hero-text { text-align: center; }
  .lp-hero-text h1 { font-size: 42px; letter-spacing: -1.2px; }
  .lp-hero-text p { font-size: 17px; max-width: 100%; }
  .lp-hero-actions { justify-content: center; }
  .lp-hero-shot { margin-top: 36px; }
  .lp-frame.tall { max-width: 270px; }
  .lp-screen .lp-frame { max-width: 270px; }

  /* tagline */
  .lp-tagline { padding: 44px 0; }
  .lp-tag-small { font-size: 15px; }
  .lp-tag-big { font-size: 30px; letter-spacing: -0.8px; }

  /* features — hide number, icon + text in 2-col */
  .lp-feat-num { display: none; }
  .lp-feat-row { grid-template-columns: 52px 1fr; gap: 0 16px; padding: 22px 0; }

  /* sections */
  .lp-why, .lp-views, .lp-devices { padding: 56px 0; }
  .lp-why h2 { font-size: 22px; line-height: 1.3; margin-bottom: 28px; }
  .lp-views h2.center { font-size: 22px; margin-bottom: 32px; }
  .lp-devices-left h2 { font-size: 22px; }
  .lp-roadmap { margin-top: 24px; }

  /* cta */
  .lp-cta { padding: 72px 0; }
  .lp-cta h2 { font-size: 28px; }
  .lp-cta p { font-size: 16px; }

  /* footer */
  .lp-footer { padding: 36px 0; }
  .lp-footer-inner { flex-direction: column-reverse; align-items: center; gap: 22px; text-align: center; }
  .lp-footer-logo { height: 92px; }
  .lp-footer-links { flex-direction: column; gap: 14px; }
  .lp-copy { margin-top: 4px; }
}
</style>
