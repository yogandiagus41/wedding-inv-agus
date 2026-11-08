/* ===== PENGATURAN UNDANGAN ===== */
const CFG = {
    groomShort: "Agus",
    brideShort: "Wenna",
    groom: "Agus Yogandi",
    bride: "Wenna Olivia Shafa Ichramsyah",
    date: "2026-12-05T08:00:00+07:00",
    dateText: "05 . 12 . 26",
    place: "Graha Yapin, Jl. Toyogiri Sel., Jatimulya, Tambun Selatan, Bekasi",
    igGroom: "ags.ndi",
    igBride: "wenolll",
    musicStart: 0,
    imgDir: "assets/img/",          // foto asli (1.JPG ... 20.JPG)
    webpDir: "assets/img/webp/",    // hasil kompres (lihat compress.mjs); kalau belum ada, otomatis pakai foto asli
    imgExt: "JPG"
};

/* Galeri: tiap latar punya foto & susunan baris sendiri.
   rows = jumlah foto per baris (total harus sama dengan jumlah foto). */
const GALLERY = [
    { id: "g-dark",  photos: [1, 2, 3, 4, 5, 6, 7, 8], rows: [2, 2, 2, 2] },
    { id: "g-rose",  photos: [9, 10, 11, 12],          rows: [2, 2] },
    { id: "g-light", photos: [14, 17, 20],             rows: [1, 2] }
];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const body = document.body;

/* ===== FOTO: coba WebP dulu, fallback ke file asli ===== */
function setImg(img, n) {
    const orig = `${CFG.imgDir}${n}.${CFG.imgExt}`;
    img.decoding = 'async';
    img.onerror = () => { img.onerror = null; img.src = orig; };
    img.src = `${CFG.webpDir}${n}.webp`;
}
$$('.ph img[data-n]').forEach(img => setImg(img, img.dataset.n));

/* ===== ISI DATA ===== */
const nm = `${CFG.groomShort}<span class="amp">&amp;</span>${CFG.brideShort}`;
$('#coverNames').innerHTML = nm;
$('#heroNames').innerHTML = nm;
$('#footNames').textContent = `${CFG.groomShort} & ${CFG.brideShort}`;
$('#heroDate').textContent = CFG.dateText;
$('#coverDate').textContent = CFG.dateText;

const igLink = (el, user) => { el.href = `https://instagram.com/${user}`; el.textContent = `@${user}`; };
igLink($('#igGroom'), CFG.igGroom);
igLink($('#igBride'), CFG.igBride);

/* ===== GALERI ===== */
const galleryImgs = [];
GALLERY.forEach(g => {
    const box = $(`#${g.id} .rows`);
    let i = 0;
    g.rows.forEach(count => {
        const row = document.createElement('div');
        row.className = `row r${count}`;
        for (let k = 0; k < count && i < g.photos.length; k++) {
            const n = g.photos[i++];
            const fig = document.createElement('figure');
            fig.className = 'tile rv';
            const wrap = document.createElement('div');
            wrap.className = 'tilt';
            const img = new Image();
            img.alt = `Galeri ${n}`;
            img.loading = 'lazy';
            setImg(img, n);
            wrap.appendChild(img);
            fig.appendChild(wrap);
            row.appendChild(fig);
            galleryImgs.push(img);
            wrap.addEventListener('click', () => openLb(galleryImgs.indexOf(img)));
        }
        box.appendChild(row);
    });
});

/* ===== LIGHTBOX ===== */
const lb = $('#lb');
const lbImg = $('#lb img');
let lbIndex = 0;

function showLb(i) {
    lbIndex = (i + galleryImgs.length) % galleryImgs.length;
    lbImg.style.opacity = 0;
    lbImg.style.transform = 'rotateY(-25deg) scale(.85)';
    setTimeout(() => {
        lbImg.src = galleryImgs[lbIndex].currentSrc || galleryImgs[lbIndex].src;
        lbImg.style.opacity = '';
        lbImg.style.transform = '';
    }, 180);
}
function openLb(i) {
    lb.classList.add('show');
    lb.setAttribute('aria-hidden', 'false');
    lbImg.src = galleryImgs[i].currentSrc || galleryImgs[i].src;
    lbIndex = i;
}
function closeLb() { lb.classList.remove('show'); lb.setAttribute('aria-hidden', 'true'); }

$('.lb-x').onclick = closeLb;
$('.lb-p').onclick = e => { e.stopPropagation(); showLb(lbIndex - 1); };
$('.lb-n').onclick = e => { e.stopPropagation(); showLb(lbIndex + 1); };
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
document.addEventListener('keydown', e => {
    if (!lb.classList.contains('show')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
    if (e.key === 'ArrowRight') showLb(lbIndex + 1);
});
let sx = 0;
lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1));
}, { passive: true });

/* ===== MUSIK ===== */
const musik = $('#musik');
const musicBtn = $('#musicBtn');

function startMusic() {
    musik.play().then(() => {
        musicBtn.classList.add('play');
        try { musik.currentTime = CFG.musicStart; } catch (e) {}
    }).catch(() => {});
}
musicBtn.onclick = () => {
    if (musik.paused) musik.play().then(() => musicBtn.classList.add('play')).catch(() => {});
    else { musik.pause(); musicBtn.classList.remove('play'); }
};

/* ===== TOAST ===== */
let tt;
function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(tt);
    tt = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ===== SALIN (rekening & alamat) ===== */
function copyText(text, okMsg) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => toast(okMsg)).catch(() => toast('Salin manual: ' + text));
        return;
    }
    const t = document.createElement('textarea');
    t.value = text; t.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(t); t.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    t.remove();
    toast(ok ? okMsg : 'Salin manual: ' + text);
}
$$('[data-copy]').forEach(b => { b.onclick = () => copyText(b.dataset.copy, b.dataset.ok); });

/* ===== SIMPAN KE KALENDER ===== */
$('#calBtn').onclick = () => {
    const fmt = d => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
    const start = new Date(CFG.date);
    const end = new Date(start.getTime() + 6 * 3600000);
    const ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Undangan Pernikahan//ID', 'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        'UID:' + start.getTime() + '@undangan',
        'DTSTAMP:' + fmt(new Date()),
        'SUMMARY:Pernikahan ' + CFG.groomShort + ' & ' + CFG.brideShort,
        'LOCATION:' + CFG.place.replace(/,/g, '\\,'),
        'DTSTART:' + fmt(start),
        'DTEND:' + fmt(end),
        'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'undangan.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Acara disimpan');
};

/* ===== COUNTDOWN (angka berputar 3D saat berganti) ===== */
const target = new Date(CFG.date).getTime();
const cdIds = ['d', 'h', 'm', 's'];
function tick() {
    let remaining = Math.max(0, target - Date.now());
    [86400000, 3600000, 60000, 1000].forEach((unit, i) => {
        const num = Math.floor(remaining / unit);
        remaining -= num * unit;
        const el = $('#' + cdIds[i]);
        const txt = String(num).padStart(2, '0');
        if (el.textContent !== txt) {
            el.textContent = txt;
            if (body.classList.contains('opened') && !reduce) {
                el.classList.remove('flip'); void el.offsetWidth; el.classList.add('flip');
            }
        }
    });
}
tick();
setInterval(tick, 1000);

/* ===== TILT 3D (mouse & sentuhan) ===== */
$$('.tilt').forEach(el => {
    if (reduce) return;
    el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', ((x - .5) * 12) + 'deg');
        el.style.setProperty('--rx', ((.5 - y) * 10) + 'deg');
        el.style.setProperty('--mx', (x * 100) + '%');
        el.style.setProperty('--my', (y * 100) + '%');
    });
    ['pointerleave', 'pointerup', 'pointercancel'].forEach(ev =>
        el.addEventListener(ev, () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); }));
});

/* ===== HATI SAAT KLIK / SENTUH ===== */
document.addEventListener('pointerdown', e => {
    if (reduce) return;
    for (let i = 0; i < 5; i++) {
        const h = document.createElement('i');
        h.className = 'heart';
        h.textContent = '♥';
        h.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;--dx:${(Math.random() - .5) * 100}px;--dy:${-50 - Math.random() * 80}px;--s:${.6 + Math.random() * .8};font-size:${12 + Math.random() * 10}px`;
        document.body.appendChild(h);
        setTimeout(() => h.remove(), 1100);
    }
});

/* ===== SCROLL: latar video, parallax, progress ===== */
const bg = $('#bg');
const vid = $('#vid');
const vsecs = $$('.vsec');
const photos = $$('.photo');
const bar = $('#bar');
let ticking = false;

const smooth = t => t * t * (3 - 2 * t);

function frame() {
    ticking = false;
    const vh = window.innerHeight;

    // parallax foto
    photos.forEach(s => {
        const r = s.getBoundingClientRect();
        if (r.bottom < -60 || r.top > vh + 60) return;
        if (!reduce) s.style.setProperty('--py', (-r.top * .08) + 'px');
    });

    // progress bar
    const max = document.documentElement.scrollHeight - vh;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;

    if (!body.classList.contains('opened')) return;

    // video menyala bertahap sesuai seberapa banyak section video terlihat
    let o = 0;
    vsecs.forEach(s => {
        const r = s.getBoundingClientRect();
        const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) / vh;
        o = Math.max(o, visible);
    });
    o = smooth(Math.min(1, o * 1.7));
    bg.style.opacity = o.toFixed(3);
    if (o < .02 && !vid.paused) vid.pause();
    else if (o >= .02 && vid.paused) vid.play().catch(() => {});

    // pastikan penutup tampil saat mentok bawah
    if (vh + window.scrollY >= document.documentElement.scrollHeight - 60) {
        $$('#penutup, #penutup .rv').forEach(el => el.classList.add('in'));
    }
}
function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
frame();

/* ===== OBSERVER (dijalankan setelah undangan dibuka) ===== */
function initScroll() {
    // jeda bertingkat untuk elemen bersaudara
    $$('.cap, .wrap, .gal-head, .row').forEach(group => {
        [...group.children].filter(c => c.classList.contains('rv'))
            .forEach((c, i) => c.style.setProperty('--d', (i * .14) + 's'));
    });

    const reveal = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (en.isIntersecting) { en.target.classList.add('in'); reveal.unobserve(en.target); }
        });
    }, { threshold: .12 });
    $$('.rv, .photo').forEach(el => reveal.observe(el));

    // menu aktif
    const links = $$('#nav a');
    const navMap = { ayat: 'home', mempelaiWanita: 'mempelaiPria', penutup: 'galeri' };
    const navObs = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (!en.isIntersecting) return;
            const id = navMap[en.target.id] || en.target.id;
            links.forEach(l => {
                const on = l.getAttribute('href') === '#' + id;
                l.classList.toggle('on', on);
                if (on) l.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
            });
        });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    ['home', 'ayat', 'mempelaiPria', 'mempelaiWanita', 'acara', 'hadiah', 'galeri', 'penutup']
        .map(id => document.getElementById(id)).filter(Boolean).forEach(el => navObs.observe(el));
}

/* ===== BUKA UNDANGAN: cover -> halaman utama ===== */
$('#openBtn').onclick = () => {
    const btn = $('#openBtn');
    const r = btn.getBoundingClientRect();
    const curtain = $('#curtain');
    curtain.style.setProperty('--cx', (r.left + r.width / 2) + 'px');
    curtain.style.setProperty('--cy', (r.top + r.height / 2) + 'px');

    $('#cover').classList.add('leaving');   // isi cover terlempar ke depan
    curtain.classList.add('grow');          // lingkaran putih membesar dari tombol
    startMusic();

    setTimeout(() => {
        // layar sudah tertutup putih: ganti ke halaman utama
        $('#cover').classList.add('open');
        body.classList.remove('lock');
        body.classList.add('opened');
        window.scrollTo(0, 0);
        bg.style.transition = 'none';
        bg.style.opacity = 0;
        requestAnimationFrame(() => { bg.style.transition = ''; frame(); });
        curtain.classList.add('fade');      // putih memudar, foto membuka dengan zoom-out
        initScroll();
        setTimeout(() => curtain.classList.add('gone'), 1500);
    }, 1050);
};
