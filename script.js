/* ================= AYARLAR ================= */
// Düğün tarihi/saati — kendi tarihinize göre güncelleyin
const target = new Date("2027-06-12T17:00:00").getTime();

/* ================= RSVP FORMU ================= */
const rsvpForm = document.getElementById('rsvpForm');
const rsvpSuccess = document.getElementById('rsvpSuccess');
const rsvpError = document.getElementById('rsvpError');
const rsvpSubmit = document.getElementById('rsvpSubmit');
const guestField = document.getElementById('guestField');
const attendYes = document.getElementById('attend-yes');
const attendNo = document.getElementById('attend-no');

function toggleGuestField(){
  if(attendNo && attendNo.checked){
    guestField.classList.add('hidden-field');
  } else {
    guestField.classList.remove('hidden-field');
  }
}
if(attendYes && attendNo){
  attendYes.addEventListener('change', toggleGuestField);
  attendNo.addEventListener('change', toggleGuestField);
}

if(rsvpForm){
  rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    rsvpError.textContent = '';

    const attending = rsvpForm.querySelector('input[name="Katılım"]:checked');
    if(!attending){
      rsvpError.textContent = 'Lütfen katılım durumunuzu seçin.';
      return;
    }

    rsvpSubmit.disabled = true;
    rsvpSubmit.textContent = 'Gönderiliyor...';

    try{
      const formData = new FormData(rsvpForm);
      const res = await fetch(rsvpForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if(res.ok){
        rsvpForm.style.display = 'none';
        rsvpSuccess.classList.add('show');
      } else {
        throw new Error('Gönderim başarısız');
      }
    } catch(err){
      rsvpError.textContent = 'Bir şeyler ters gitti, lütfen tekrar deneyin.';
      rsvpSubmit.disabled = false;
      rsvpSubmit.textContent = 'Gönder';
    }
  });
}

/* ================= PARALLAX YILDIZ KAYMASI ================= */
const farLayer = document.querySelector('.star-layer-far');
const nearLayer = document.querySelector('.star-layer-near');
let parallaxTicking = false;

function applyParallax(){
  const y = window.scrollY || window.pageYOffset;
  if(farLayer) farLayer.style.transform = `translateY(${y * 0.06}px)`;
  if(nearLayer) nearLayer.style.transform = `translateY(${y * 0.14}px)`;
  parallaxTicking = false;
}

window.addEventListener('scroll', () => {
  if(!parallaxTicking){
    requestAnimationFrame(applyParallax);
    parallaxTicking = true;
  }
}, { passive: true });

applyParallax();

/* ================= GERİ SAYIM ================= */
function updateCountdown(){
  const now = new Date().getTime();
  const diff = target - now;

  const els = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    min: document.getElementById('cd-min'),
    sec: document.getElementById('cd-sec')
  };

  if(diff <= 0){
    els.days.textContent = '0';
    els.hours.textContent = '0';
    els.min.textContent = '0';
    els.sec.textContent = '0';
    return;
  }

  const days = Math.floor(diff / (1000*60*60*24));
  const hours = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
  const mins = Math.floor((diff % (1000*60*60)) / (1000*60));
  const secs = Math.floor((diff % (1000*60)) / 1000);

  setIfChanged(els.days, days);
  setIfChanged(els.hours, hours);
  setIfChanged(els.min, mins);
  setIfChanged(els.sec, secs);
}

function setIfChanged(el, value){
  if(el.textContent !== String(value)){
    el.textContent = value;
    el.classList.remove('tick');
    // reflow ile animasyonu yeniden tetikle
    void el.offsetWidth;
    el.classList.add('tick');
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ================= SCROLL REVEAL ANİMASYONU ================= */
document.querySelectorAll('.reveal').forEach(el => {
  const delay = el.getAttribute('data-delay') || 0;
  el.style.setProperty('--d', delay);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ================= KAPAK / AÇILIŞ EKRANI ================= */
const cover = document.getElementById('cover');
const envelope = document.getElementById('envelope');
const openBtn = document.getElementById('openInvite');
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');

document.body.classList.add('locked');

if(openBtn){
  openBtn.addEventListener('click', () => {
    envelope.classList.add('opening');

    // Kullanıcı etkileşimiyle müziği başlatmayı dene (tarayıcı otomatik oynatmayı engelleyebilir)
    if(bgMusic){
      bgMusic.volume = 0.6;
      bgMusic.play().then(() => {
        musicToggle.classList.add('playing');
      }).catch(() => {
        // Otomatik oynatma engellendiyse kullanıcı müzik ikonuna tıklayarak başlatabilir
      });
    }

    setTimeout(() => {
      cover.classList.add('hidden');
      document.body.classList.remove('locked');
    }, 900);
  });
}

/* ================= MÜZİK KONTROLÜ ================= */
if(musicToggle && bgMusic){
  musicToggle.addEventListener('click', () => {
    if(bgMusic.paused){
      bgMusic.play().then(() => musicToggle.classList.add('playing')).catch(() => {});
    } else {
      bgMusic.pause();
      musicToggle.classList.remove('playing');
    }
  });
}

/* ================= SLAYT GALERİSİ ================= */
const galleryTrack = document.getElementById('galleryTrack');
const galleryDotsWrap = document.getElementById('galleryDots');
const prevBtn = document.getElementById('galleryPrev');
const nextBtn = document.getElementById('galleryNext');

if(galleryTrack){
  const slides = Array.from(galleryTrack.children);
  let current = 0;
  let autoTimer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slayt ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    galleryDotsWrap.appendChild(dot);
  });

  const dots = Array.from(galleryDotsWrap.children);

  function goTo(index){
    current = (index + slides.length) % slides.length;
    galleryTrack.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto(){
    stopAuto();
    autoTimer = setInterval(() => goTo(current + 1), 4500);
  }
  function stopAuto(){
    if(autoTimer) clearInterval(autoTimer);
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });

  // Dokunmatik kaydırma desteği
  let touchStartX = 0;
  galleryTrack.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    stopAuto();
  }, { passive: true });
  galleryTrack.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if(diff > 40) goTo(current - 1);
    else if(diff < -40) goTo(current + 1);
    startAuto();
  }, { passive: true });

  goTo(0);
  startAuto();
}

// ================= TAKVİME EKLE SKRİPTİ =================
document.addEventListener('DOMContentLoaded', () => {
  const calendarBtn = document.getElementById('calendarBtn');
  const calendarDropdown = document.getElementById('calendarDropdown');
  const downloadIcalBtn = document.getElementById('downloadIcalBtn');

  if (calendarBtn && calendarDropdown) {
    // Butona basınca menüyü aç/kapat
    calendarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      calendarDropdown.classList.toggle('show');
    });

    // Sayfa dışına tıklandığında menüyü kapat
    document.addEventListener('click', () => {
      calendarDropdown.classList.remove('show');
    });
  }

  // Apple / Outlook (.ics dosyası indirme)
  if (downloadIcalBtn) {
    downloadIcalBtn.addEventListener('click', () => {
      const icsData = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Elif ve Kaan Wedding//TR
BEGIN:VEVENT
SUMMARY:Elif & Kaan Düğün Davetiyesi
DESCRIPTION:Elif ve Kaan'ın düğün merasimine davetlisiniz.
LOCATION:Villa Belvedere, Bodrum, Muğla
DTSTART:20270612T160000Z
DTEND:20270612T230000Z
END:VEVENT
END:VCALENDAR`;

      const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'Elif-Kaan-Dugun.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
});