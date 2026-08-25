(() => {
  "use strict";

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const isFinePointer = window.matchMedia(
    "(hover:hover) and (pointer:fine)",
  ).matches;

  /* ---------------------------------------------------------------------
     Nav scroll state + scroll progress + scroll-to-top
  --------------------------------------------------------------------- */
  const navbar = document.getElementById("navbar");
  const progress = document.getElementById("scrollProgress");
  const scrollTopBtn = document.getElementById("scrollTop");

  function onScroll() {
    const y = window.scrollY;
    navbar.classList.toggle("scrolled", y > 20);
    scrollTopBtn.classList.toggle("visible", y > 600);

    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? (y / docH) * 100 : 0;
    progress.style.width = pct + "%";
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  });

  /* ---------------------------------------------------------------------
     Mobile menu
  --------------------------------------------------------------------- */
  const menuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileOverlay = document.getElementById("mobileOverlay");

  function closeMenu() {
    menuBtn.classList.remove("active");
    mobileMenu.classList.remove("active");
    mobileOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }
  function toggleMenu() {
    const active = menuBtn.classList.toggle("active");
    mobileMenu.classList.toggle("active", active);
    mobileOverlay.classList.toggle("active", active);
    document.body.style.overflow = active ? "hidden" : "";
  }
  menuBtn.addEventListener("click", toggleMenu);
  mobileOverlay.addEventListener("click", closeMenu);
  document
    .querySelectorAll(".mobile-menu a")
    .forEach((a) => a.addEventListener("click", closeMenu));

  /* ---------------------------------------------------------------------
     Smooth anchor scroll (accounting for fixed nav)
  --------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
    });
  });

  /* ---------------------------------------------------------------------
     Scroll reveal
  --------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = Math.min(i * 40, 240);
            setTimeout(() => el.classList.add("in"), delay);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------------------------------------------------------------------
     Live clock — Srinagar (IST, UTC+5:30)
  --------------------------------------------------------------------- */
  const clockTime = document.getElementById("clockTime");
  function updateClock() {
    if (!clockTime) return;
    const now = new Date();
    const ist = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    );
    const h = String(ist.getHours()).padStart(2, "0");
    const m = String(ist.getMinutes()).padStart(2, "0");
    clockTime.textContent = `${h}:${m}`;
  }
  updateClock();
  setInterval(updateClock, 15000);

  /* ---------------------------------------------------------------------
     Stat counters
  --------------------------------------------------------------------- */
  const stats = document.querySelectorAll(".stat-value");
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || "";
    if (prefersReduced) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    const statIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 },
    );
    stats.forEach((s) => statIo.observe(s));
  }

  /* ---------------------------------------------------------------------
     Fixed WebGL background — subtle scanline / grain / vignette field.
     Purely ambient: sits behind all content, ignored by assistive tech.
  --------------------------------------------------------------------- */
  (function initBgShader() {
    const canvas = document.getElementById("bgShader");
    if (!canvas) return;

    function syncSize() {
      const w = canvas.clientWidth || window.innerWidth || 1280;
      const h = canvas.clientHeight || window.innerHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(syncSize).observe(canvas);
    }
    syncSize();

    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = v_texCoord;
  float scanline = sin(uv.y * u_resolution.y * 1.5 + u_time * 5.0) * 0.035;
  float noise = random(uv + u_time * 0.1) * 0.05;
  float vignette = 1.0 - length(uv - 0.5) * 1.1;
  vignette = clamp(vignette, 0.0, 1.0);
  vec3 color = vec3(0.039, 0.039, 0.043);
  color += scanline + noise;
  color *= mix(0.85, 1.0, vignette);
  gl_FragColor = vec4(color, 1.0);
}`;

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const posLoc = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");

    function frame(t) {
      if (typeof ResizeObserver === "undefined") syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!prefersReduced) requestAnimationFrame(frame);
    }
    frame(0);
  })();

  /* ---------------------------------------------------------------------
     About — mood / aesthetic reveal panel
  --------------------------------------------------------------------- */
  (function initMoodReveal() {
    const list = document.getElementById("moodList");
    const stage = document.getElementById("moodStage");
    const stageBg = document.getElementById("moodStageBg");
    const stageLabel = document.getElementById("moodStageLabel");
    if (!list || !stage || !stageBg || !stageLabel) return;

    const names = {
      glass: "Glassmorphic",
      y2k: "Y2K Chrome",
      celestial: "Celestial",
      minimal: "Minimalism",
      magazine: "Magazine Layouts",
    };
    const lightMoods = new Set(["minimal", "magazine"]);
    const items = list.querySelectorAll("li");

    function setMood(mood) {
      stageBg.className = "mood-stage-bg mood-" + mood;
      stageLabel.textContent = names[mood] || mood;
      stage.classList.toggle("on-light", lightMoods.has(mood));
      items.forEach((li) =>
        li.classList.toggle("active", li.dataset.mood === mood),
      );
    }

    items.forEach((li) => {
      li.addEventListener("mouseenter", () => setMood(li.dataset.mood));
      li.addEventListener("focus", () => setMood(li.dataset.mood));
    });
  })();

  /* ---------------------------------------------------------------------
     Hero "code typing" — types out a small profile object, syntax-tinted
  --------------------------------------------------------------------- */
  const typedCodeEl = document.getElementById("typedCode");
  const codeCaret = document.getElementById("codeCaret");

  const codeLines = [
    {
      indent: 0,
      html: '<span class="tok-key">const</span> <span class="tok-prop">developer</span> <span class="tok-punc">=</span> <span class="tok-punc">{</span>',
    },
    {
      indent: 1,
      html: '<span class="tok-prop">name</span><span class="tok-punc">:</span> <span class="tok-str">"Iltifat Nath"</span><span class="tok-punc">,</span>',
    },
    {
      indent: 1,
      html: '<span class="tok-prop">role</span><span class="tok-punc">:</span> <span class="tok-str">"Front-End Developer & UI/UX Designer"</span><span class="tok-punc">,</span>',
    },
    {
      indent: 1,
      html: '<span class="tok-prop">stack</span><span class="tok-punc">:</span> <span class="tok-punc">[</span><span class="tok-str">"React"</span><span class="tok-punc">,</span> <span class="tok-str">"GSAP"</span><span class="tok-punc">,</span> <span class="tok-str">"R3F"</span><span class="tok-punc">],</span>',
    },
    {
      indent: 1,
      html: '<span class="tok-prop">craft</span><span class="tok-punc">:</span> <span class="tok-str">"5+ years, artist first"</span><span class="tok-punc">,</span>',
    },
    {
      indent: 1,
      html: '<span class="tok-prop">status</span><span class="tok-punc">:</span> <span class="tok-str">"open_to_opportunities"</span>',
    },
    { indent: 0, html: '<span class="tok-punc">};</span>' },
  ];

  function renderTypedLines(fullLineCount, partialHtml) {
    let out = "";
    for (let i = 0; i < fullLineCount; i++) {
      out += "  ".repeat(codeLines[i].indent) + codeLines[i].html + "\n";
    }
    if (partialHtml !== undefined) {
      out += "  ".repeat(codeLines[fullLineCount].indent) + partialHtml;
    }
    return out;
  }

  function typeHero() {
    if (!typedCodeEl) return;

    if (prefersReduced) {
      typedCodeEl.innerHTML = renderTypedLines(codeLines.length);
      if (codeCaret) codeCaret.style.display = "none";
      return;
    }

    let lineIndex = 0;
    let charIndex = 0;

    function step() {
      if (lineIndex >= codeLines.length) {
        // brief pause at completion, then restart
        setTimeout(() => {
          lineIndex = 0;
          charIndex = 0;
          typedCodeEl.innerHTML = "";
          setTimeout(step, 500);
        }, 2600);
        return;
      }

      // Type by tag-safe chunks: reveal the line's plain text length progressively,
      // but since it contains HTML, type in small increments of the raw string.
      const raw = codeLines[lineIndex].html;
      charIndex += 3;
      const partial = raw.slice(0, charIndex);

      // Only inject if we have complete, safe HTML — simplest robust approach:
      // fade the full line in character-stepped via a plain-text shadow, then swap to rich HTML.
      typedCodeEl.innerHTML = renderTypedLines(lineIndex, partial);

      if (charIndex >= raw.length) {
        lineIndex += 1;
        charIndex = 0;
        setTimeout(step, 90);
      } else {
        setTimeout(step, 10);
      }
    }
    step();
  }
  typeHero();

  /* ---------------------------------------------------------------------
     Custom cursor (fine-pointer devices only)
  --------------------------------------------------------------------- */
  if (isFinePointer && !prefersReduced) {
    const dot = document.getElementById("cursorDot");
    const ring = document.getElementById("cursorRing");
    let mx = window.innerWidth / 2,
      my = window.innerHeight / 2;
    let rx = mx,
      ry = my;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
    });

    function raf() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(raf);
    }
    raf();

    document.querySelectorAll('[data-cursor="view"]').forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("hover-view"));
      el.addEventListener("mouseleave", () =>
        ring.classList.remove("hover-view"),
      );
    });

    // Magnetic buttons
    document.querySelectorAll('[data-cursor="magnetic"]').forEach((el) => {
      el.addEventListener("mouseenter", () =>
        ring.classList.add("hover-magnetic"),
      );
      el.addEventListener("mouseleave", () => {
        ring.classList.remove("hover-magnetic");
        el.style.transform = "";
      });
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${relX * 0.25}px, ${relY * 0.35}px)`;
      });
    });
  } else {
    document.getElementById("cursorDot")?.remove();
    document.getElementById("cursorRing")?.remove();
  }

  /* ---------------------------------------------------------------------
     Contact form — client-side only (no backend attached).
     Opens the user's mail client with a prefilled message so nothing is
     silently lost, and gives clear inline feedback.
  --------------------------------------------------------------------- */
  const form = document.getElementById("contactForm");
  const btnText = document.getElementById("btnText");
  const btnLoading = document.getElementById("btnLoading");
  const formNote = document.getElementById("formNote");
  const submitBtn = document.getElementById("submitBtn");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const subject = form.subject.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !subject || !message) return;

      submitBtn.disabled = true;
      btnText.hidden = true;
      btnLoading.hidden = false;

      const body = `From: ${name} (${email})%0D%0A%0D%0A${encodeURIComponent(message)}`;
      const mailto = `mailto:iltifaatyousuf@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;

      setTimeout(() => {
        window.location.href = mailto;
        submitBtn.disabled = false;
        btnText.hidden = false;
        btnLoading.hidden = true;
        formNote.textContent =
          "Opening your email client to send this — thanks for reaching out!";
        form.reset();
      }, 500);
    });
  }
})();
