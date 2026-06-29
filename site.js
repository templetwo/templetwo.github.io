(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveal — JS adds the hidden state so no-JS users always see content.
  var revealEls = document.querySelectorAll('.research-card, .lab-entry, .repo-list, .question-card, .method-step');
  if (!reduce && 'IntersectionObserver' in window) {
    revealEls.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = ((i % 3) * 70) + 'ms';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // Animated stat counters.
  var counters = document.querySelectorAll('.stat-num[data-count]');
  function animate(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = target + suffix; return; }
    var start = null, dur = 1100;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animate(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
    });
  }
})();

  /* Mobile nav: collapse the page list behind the menu button. */
  (function () {
    var btn = document.querySelector('.nav-toggle');
    var menu = document.getElementById('nav-menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    /* Tapping a link closes the menu so the anchor target isn't hidden behind it. */
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  })();

  /* Contact form: progressive-enhancement submit + optional Cloudflare Turnstile.
     With JS off, the form does a normal POST to its action and the Worker renders
     a plain confirmation page — so no-JS visitors can still reach us. */
  (function () {
    var form = document.getElementById('contact-form');
    if (!form || !window.fetch) return;

    var endpoint = form.getAttribute('data-endpoint') || form.getAttribute('action');
    var sitekey = form.getAttribute('data-sitekey') || '';
    var realKey = sitekey && !/^YOUR_/.test(sitekey) && sitekey.trim() !== '';
    var status = form.querySelector('.cf-status');
    var submitBtn = form.querySelector('.cf-submit');
    var slot = form.querySelector('.cf-turnstile-slot');
    var widgetId = null;

    /* Load Turnstile only when a real sitekey is configured, so a placeholder
       never renders a broken widget. */
    if (realKey && slot) {
      slot.hidden = false;
      window.__t2Turnstile = function () {
        try { widgetId = window.turnstile.render(slot, { sitekey: sitekey, theme: 'dark' }); } catch (e) {}
      };
      var s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__t2Turnstile';
      s.async = true; s.defer = true;
      document.head.appendChild(s);
    }

    function field(name) {
      var el = form.elements[name];
      return el && typeof el.value === 'string' ? el.value.trim() : '';
    }
    function setStatus(msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'cf-status' + (kind ? ' ' + kind : '');
    }
    function messageFor(code) {
      if (code === 'rate_limited') return 'Too many messages just now — please try again in a few minutes.';
      if (code === 'challenge_failed') return 'Spam check failed — please retry.';
      if (code === 'invalid_input') return 'Please check your name, email, and message.';
      return 'Could not send — please email info@thetempleoftwo.com directly.';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Honeypot tripped: behave like success, send nothing. */
      var hp = form.elements['company'];
      if (hp && hp.value.trim() !== '') { setStatus('Thank you — your message is on its way.', 'ok'); form.reset(); return; }

      var payload = { name: field('name'), email: field('email'), topic: field('topic'), message: field('message') };
      if (!payload.name || !payload.email || !payload.message) {
        setStatus('Please add your name, email, and a message.', 'err'); return;
      }
      if (realKey && window.turnstile) {
        var token = '';
        try { token = window.turnstile.getResponse(widgetId) || ''; } catch (e) {}
        if (!token) { setStatus('Please complete the spam check below.', 'err'); return; }
        payload['cf-turnstile-response'] = token;
      }

      submitBtn.disabled = true;
      setStatus('Sending…', '');
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) {
        return r.json().catch(function () { return { ok: r.ok }; });
      }).then(function (out) {
        if (out && out.ok) {
          setStatus('Message sent — thank you. We’ll be in touch.', 'ok');
          form.reset();
        } else {
          setStatus(messageFor(out && out.error), 'err');
        }
        if (realKey && window.turnstile && widgetId !== null) {
          try { window.turnstile.reset(widgetId); } catch (e) {}
        }
      }).catch(function () {
        setStatus('Could not send — please email info@thetempleoftwo.com directly.', 'err');
      }).then(function () { submitBtn.disabled = false; });
    });
  })();
