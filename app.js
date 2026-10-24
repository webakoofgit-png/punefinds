(() => {
  'use strict';
  const select = (selector, root = document) => root.querySelector(selector);
  const selectAll = (selector, root = document) => [...root.querySelectorAll(selector)];
  const storage = {
    read(key, fallback = []) {
      try { return JSON.parse(localStorage.getItem(`punefinds-${key}`)) ?? fallback; }
      catch { return fallback; }
    },
    write(key, value) {
      try { localStorage.setItem(`punefinds-${key}`, JSON.stringify(value)); }
      catch { toast('Browser storage is unavailable. Your changes cannot be saved.'); }
    }
  };
  let catalog = [];
  let toastTimer;
  let lastFocused;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const money = value => Number(value) ? `₹${Number(value).toLocaleString('en-IN')}` : 'Price on request';
  const pathOf = value => new URL(value, location.origin).pathname.replace(/\/?$/, '/');

  function toast(message) {
    let notification = select('.clone-toast');
    if (!notification) {
      notification = document.createElement('div');
      notification.className = 'clone-toast';
      notification.setAttribute('role', 'status');
      document.body.append(notification);
    }
    notification.textContent = message;
    notification.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { notification.hidden = true; }, 4000);
  }

  function dialog(title, content) {
    select('.clone-overlay')?.remove();
    lastFocused = document.activeElement;
    const overlay = document.createElement('dialog');
    overlay.className = 'clone-overlay';
    overlay.setAttribute('aria-label', title);
    overlay.innerHTML = `<button type="button" class="close-dialog" aria-label="Close dialog">×</button><h2>${escape(title)}</h2>${content}`;
    document.body.append(overlay);
    select('.close-dialog', overlay).addEventListener('click', () => overlay.close());
    overlay.addEventListener('close', () => lastFocused?.focus());
    overlay.addEventListener('click', event => { if (event.target === overlay) overlay.close(); });
    overlay.showModal();
    return overlay;
  }

  function setupNavigation() {
    selectAll('a').forEach(link => {
      const label = link.textContent.trim();
      if (label === 'Register') link.setAttribute('href', '/signup/');
      if (/^Forgot your password\??$/.test(label)) link.setAttribute('href', '#password-help');
    });
    const updateHeader = () => {
      const desktop = innerWidth >= 1200;
      selectAll('.luxus-header, .stellarnav').forEach(element => {
        element.classList.toggle('desktop', desktop);
        element.classList.toggle('mobile', !desktop);
      });
    };
    updateHeader();
    window.addEventListener('resize', updateHeader, {passive:true});
    const menu = select('.main-menu');
    const area = select('.menu-area');
    if (menu && area) {
      menu.id = 'primary-navigation';
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'menu-toggle-native';
      toggle.setAttribute('aria-label', 'Open navigation');
      toggle.setAttribute('aria-controls', menu.id);
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
      area.append(toggle);
      toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        toggle.textContent = open ? '×' : '☰';
      });
      selectAll('.menu-item-has-children > a', menu).forEach(link => {
        link.setAttribute('aria-expanded', 'false');
        link.addEventListener('click', event => {
          if (innerWidth < 1200 || link.getAttribute('href') === '#') {
            event.preventDefault();
            const expanded = link.parentElement.classList.toggle('nav-expanded');
            link.setAttribute('aria-expanded', String(expanded));
          }
        });
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          menu.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.textContent = '☰';
        }
      });
    }
    selectAll('.adv-search-btn').forEach(button => {
      button.setAttribute('role', 'button');
      button.setAttribute('tabindex', '0');
      button.setAttribute('aria-label', 'Advanced property search');
      button.setAttribute('aria-expanded', 'false');
      const activate = () => {
        const panel = select('.advance-search-opt', button.closest('form'));
        if (panel) button.setAttribute('aria-expanded', String(panel.classList.toggle('is-open')));
      };
      button.addEventListener('click', activate);
      button.addEventListener('keydown', event => {
        if (['Enter', ' '].includes(event.key)) { event.preventDefault(); activate(); }
      });
    });
    const back = select('#backtoTop');
    if (back) {
      back.setAttribute('role', 'button');
      back.setAttribute('aria-label', 'Back to top');
      back.setAttribute('tabindex', '0');
      const goTop = () => window.scrollTo({top:0, behavior:'smooth'});
      back.addEventListener('click', goTop);
      back.addEventListener('keydown', event => { if (event.key === 'Enter') goTop(); });
    }
  }

  function setupAnimations() {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('clone-animate');
      observer.unobserve(entry.target);
    }), {threshold:0.08});
    selectAll('.elementor-invisible').forEach(element => {
      element.classList.remove('elementor-invisible');
      observer.observe(element);
    });
    selectAll('.luxus-carousel').forEach(carousel => {
      const slides = selectAll(':scope > .sl-item', carousel);
      if (slides.length < 2) return;
      const controls = document.createElement('div');
      controls.className = 'clone-carousel-controls';
      controls.innerHTML = `<button type="button" aria-label="Previous featured property">‹</button>${slides.map((slide, index) => `<button type="button" class="carousel-dot" aria-label="Featured property ${index + 1}" data-slide="${index}" aria-current="${index === 0}"></button>`).join('')}<button type="button" aria-label="Next featured property">›</button>`;
      carousel.after(controls);
      const buttons = selectAll('button', controls);
      buttons[0].addEventListener('click', () => carousel.scrollBy({left:-carousel.clientWidth,behavior:'smooth'}));
      buttons.at(-1).addEventListener('click', () => carousel.scrollBy({left:carousel.clientWidth,behavior:'smooth'}));
      selectAll('[data-slide]', controls).forEach(button => button.addEventListener('click', () => carousel.scrollTo({left:slides[Number(button.dataset.slide)].offsetLeft - slides[0].offsetLeft,behavior:'smooth'})));
      carousel.addEventListener('scroll', () => {
        const index = Math.round(carousel.scrollLeft / Math.max(slides[0].offsetWidth, 1));
        selectAll('[data-slide]', controls).forEach(button => button.setAttribute('aria-current', String(Number(button.dataset.slide) === index)));
      }, {passive:true});
      carousel.setAttribute('tabindex', '0');
      carousel.setAttribute('aria-label', 'Featured properties');
      carousel.addEventListener('keydown', event => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          carousel.scrollBy({left:slides[0].offsetWidth * (event.key === 'ArrowRight' ? 1 : -1),behavior:'smooth'});
        }
      });
    });
  }

  function cardPath(control) {
    const card = control.closest('.property-grid, .property-list, .featured-property, .sl-item, .property-detail');
    const link = card && select('a[href^="/property/"]', card);
    return link ? pathOf(link.href) : location.pathname.startsWith('/property/') ? pathOf(location.href) : null;
  }

  function refreshSaved() {
    ['saved','compared'].forEach(kind => {
      const paths = storage.read(kind);
      const attribute = kind === 'saved' ? 'data-heartvalue' : 'data-comparevalue';
      selectAll(`[${attribute}]`).forEach(control => {
        const active = paths.includes(cardPath(control));
        control.classList.toggle(kind === 'saved' ? 'is-saved' : 'is-compared', active);
        control.setAttribute('aria-pressed', String(active));
        control.setAttribute('aria-label', kind === 'saved' ? 'Save property' : 'Compare property');
      });
    });
    const button = select('.clone-saved-link');
    if (button) button.textContent = `♡ Saved (${storage.read('saved').length}) · Compare (${storage.read('compared').length})`;
  }

  function setupSaved() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'clone-saved-link';
    document.body.append(button);
    button.addEventListener('click', () => {
      const saved = catalog.filter(property => storage.read('saved').includes(property.path));
      dialog('Saved properties', `<p>${saved.length ? 'Saved on this browser.' : 'Use the heart on a property to save it here.'}</p>${saved.map(property => `<p><a href="${escape(property.path)}">${escape(property.title)}</a> — ${money(property.price)}</p>`).join('')}<p><a href="/compare-properties/">Compare selected properties (${storage.read('compared').length}) →</a></p>`);
    });
    document.addEventListener('click', event => {
      const control = event.target.closest('[data-heartvalue], [data-comparevalue]');
      if (!control) return;
      event.preventDefault();
      const path = cardPath(control);
      if (!path) { toast('Open the property to save or compare it.'); return; }
      const kind = control.hasAttribute('data-heartvalue') ? 'saved' : 'compared';
      let paths = storage.read(kind);
      const active = paths.includes(path);
      if (!active && kind === 'compared' && paths.length >= 3) { toast('Compare up to three properties. Remove one to add another.'); return; }
      paths = active ? paths.filter(value => value !== path) : [...paths,path];
      storage.write(kind, paths);
      refreshSaved();
      toast(active ? 'Property removed.' : kind === 'saved' ? 'Property saved on this browser.' : 'Property added to comparison.');
    });
    refreshSaved();
  }

  function renderComparison() {
    if (pathOf(location.href) !== '/compare-properties/') return;
    document.body.classList.add('clone-interior');
    const content = select('#content') || select('.site-content') || select('[data-elementor-type="wp-page"]');
    if (!content) return;
    const chosen = catalog.filter(property => storage.read('compared').includes(property.path));
    content.innerHTML = `<section class="clone-panel"><h1>Compare Properties</h1><p>${chosen.length ? 'Compare your selected properties side by side.' : 'Select the compare icon on up to three properties to compare them here.'}</p><a href="/properties/">Browse properties →</a><div class="compare-grid">${chosen.map(property => `<article class="compare-card"><h2><a href="${escape(property.path)}">${escape(property.title)}</a></h2><strong>${money(property.price)}</strong><dl>${[['Status',property.status],['Type',property.type],['Location',property.city],['Area',property.area ? `${property.area} m²` : 'Not specified'],['Bedrooms',property.bedrooms],['Bathrooms',property.bathrooms],['Parking',property.parking]].map(([label,value]) => `<dt>${escape(label)}</dt><dd>${escape(value || 'Not specified')}</dd>`).join('')}</dl><button type="button" data-remove-compare="${escape(property.path)}">Remove</button></article>`).join('')}</div></section>`;
    selectAll('[data-remove-compare]').forEach(button => button.addEventListener('click', () => {
      storage.write('compared', storage.read('compared').filter(path => path !== button.dataset.removeCompare));
      renderComparison();
      refreshSaved();
    }));
    document.title = 'Compare Properties – punefinds.com';
  }

  function setupSearch() {
    const query = new URLSearchParams(location.search);
    selectAll('form[method="get"]').forEach(form => {
      selectAll('[name]',form).forEach(input => { if (query.has(input.name)) input.value = query.get(input.name); });
      form.addEventListener('submit', event => {
        if (!select('[name=search_title], [name=property_type]', form)) return;
        event.preventDefault();
        const params = new URLSearchParams();
        new FormData(form).forEach((value, key) => { if (String(value).trim()) params.append(key, String(value).trim()); });
        location.href = `/properties/?${params}`;
      });
    });
    if (pathOf(location.href) !== '/properties/') return;
    const container = select('#properties');
    if (!container) return;
    const grid = select('.row', container) || container;
    const oldPagination = select('.sl-pagination, .pagination, .navigation', container);
    oldPagination?.remove();
    const meta = document.createElement('div');
    meta.className = 'clone-results-meta';
    meta.setAttribute('aria-live', 'polite');
    grid.before(meta);
    const pagination = document.createElement('nav');
    pagination.className = 'clone-pagination';
    pagination.setAttribute('aria-label', 'Property results pages');
    grid.after(pagination);
    const normal = value => String(value ?? '').toLowerCase().trim().replace(/[_-]/g,' ');
    let results = catalog.filter(property => {
      const term = normal(query.get('search_title'));
      if (term && !normal(`${property.title} ${property.city} ${property.description}`).includes(term)) return false;
      const type = normal(query.get('property_type'));
      if (type && !normal(property.type).includes(type.replace('apartment','flat').replace('family house','villa').replace('modern villa','villa'))) return false;
      const status = normal(query.get('property_status'));
      if (status && !normal(property.status).includes(status)) return false;
      const city = normal(query.get('property_city'));
      if (city && !normal(property.city).includes(city)) return false;
      for (const [parameter,field,minimum] of [['min_price','price',true],['max_price','price',false],['min_area','area',true],['max_area','area',false],['bedrooms','bedrooms',true],['bathrooms','bathrooms',true]]) {
        if (query.get(parameter) && (!Number(property[field]) || (minimum ? Number(property[field]) < Number(query.get(parameter)) : Number(property[field]) > Number(query.get(parameter))))) return false;
      }
      if (query.get('build_year') && String(property.year) !== query.get('build_year')) return false;
      return query.getAll('property_amenty[]').every(amenity => normal(property.amenities).includes(normal(amenity)));
    });
    const sort = select('[name=sort_by]');
    let currentPage = Math.max(1, Number(query.get('page')) || 1);
    const render = () => {
      const mode = sort?.value || 'default';
      results.sort((first, second) => mode === 'low_high' ? first.price - second.price : mode === 'high_low' ? second.price - first.price : mode === 'old' ? (Date.parse(first.date) || 0) - (Date.parse(second.date) || 0) : mode === 'new' ? (Date.parse(second.date) || 0) - (Date.parse(first.date) || 0) : mode === 'featured' ? Number(second.featured) - Number(first.featured) : first.order - second.order);
      const pages = Math.max(1, Math.ceil(results.length / 10));
      currentPage = Math.min(currentPage, pages);
      meta.innerHTML = `<span>${results.length} ${results.length === 1 ? 'property' : 'properties'} found</span><button type="button">Clear filters</button>`;
      select('button',meta).addEventListener('click', () => { location.href = '/properties/'; });
      grid.innerHTML = results.length ? results.slice((currentPage-1)*10,currentPage*10).map(property => `<div class="sl-col col-md-6 col-lg-6">${property.html}</div>`).join('') : '<div class="clone-empty"><h3>No properties found</h3><p>Try another location, type, or price range.</p></div>';
      pagination.innerHTML = Array.from({length:pages}, (_,index) => `<button type="button" data-page="${index+1}" ${currentPage === index+1 ? 'aria-current="page"' : ''}>${index+1}</button>`).join('');
      selectAll('[data-page]',pagination).forEach(button => button.addEventListener('click', () => {
        currentPage = Number(button.dataset.page);
        query.set('page', currentPage);
        history.replaceState(null, '', `?${query}`);
        render();
        meta.scrollIntoView({behavior:'smooth',block:'start'});
      }));
      refreshSaved();
    };
    sort?.addEventListener('change', () => { currentPage = 1; render(); });
    render();
  }

  function setupLogin() {
    const modal = select('#sl-login-model');
    if (!modal) return;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'User login');
    modal.setAttribute('aria-modal', 'true');
    const close = () => { modal.classList.remove('clone-open'); lastFocused?.focus(); };
    selectAll('.sl-ajax-login').forEach(link => link.addEventListener('click', event => {
      event.preventDefault();
      lastFocused = document.activeElement;
      modal.classList.add('clone-open');
      select('input:not([type=hidden])',modal)?.focus();
    }));
    const closer = select('.close',modal);
    closer?.setAttribute('tabindex','0');
    closer?.setAttribute('role','button');
    closer?.setAttribute('aria-label','Close login');
    closer?.addEventListener('click',close);
    closer?.addEventListener('keydown', event => { if (event.key === 'Enter') close(); });
    modal.addEventListener('click', event => { if (event.target === modal) close(); });
    modal.addEventListener('keydown', event => {
      if (event.key === 'Escape') close();
      if (event.key !== 'Tab') return;
      const focusable = selectAll('a[href], input, button, [tabindex="0"]',modal).filter(element => !element.hidden && element.type !== 'hidden');
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    const form = select('#login');
    if (form) {
      const notice = document.createElement('p');
      notice.className = 'clone-form-message';
      notice.textContent = 'Frontend preview: account authentication is unavailable. No password is sent or stored.';
      form.prepend(notice);
    }
  }

  function formMessage(form, text) {
    let message = select('.clone-form-response',form);
    if (!message) {
      message = document.createElement('div');
      message.className = 'clone-form-message clone-form-response';
      message.setAttribute('role','status');
      form.append(message);
    }
    message.textContent = text;
  }

  function setupForms() {
    selectAll('form').forEach(form => {
      if (form.getAttribute('method')?.toLowerCase() === 'get') return;
      form.removeAttribute('novalidate');
      form.addEventListener('submit', event => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        if (form.id === 'login' || form.querySelector('input[type=password]')) {
          formMessage(form,'This is a frontend preview. Authentication requires a backend; no credentials have been sent or stored.');
          selectAll('input[type=password]',form).forEach(input => { input.value = ''; });
        } else if (form.id === 'comment-form') {
          const text = select('[name=comment]',form)?.value;
          if (!text?.trim()) { formMessage(form,'Please enter a review.'); return; }
          const saved = storage.read('reviews',{});
          saved[location.pathname] = [...(saved[location.pathname] || []),{text:text.trim(),name:select('[name=author]',form)?.value || 'Guest'}];
          storage.write('reviews',saved);
          formMessage(form,'Your review was saved on this browser. It has not been published.');
          renderReviews();
          form.reset();
        } else if (form.dataset.cloneDraft !== undefined) {
          const draft = Object.fromEntries(new FormData(form));
          const drafts = storage.read('drafts');
          drafts.push({...draft,created:new Date().toISOString()});
          storage.write('drafts',drafts);
          document.dispatchEvent(new Event('clone-drafts-changed'));
          formMessage(form,'Your property draft was saved on this browser. It has not been published.');
          form.reset();
        } else {
          formMessage(form,'Your details are valid. This frontend preview does not send messages. Contact punefinds@gmail.com to reach PuneFinds.');
        }
      });
    });
    renderReviews();
  }

  function renderReviews() {
    const form = select('#comment-form');
    if (!form) return;
    select('.clone-local-reviews')?.remove();
    const saved = storage.read('reviews',{})[location.pathname] || [];
    if (!saved.length) return;
    const reviews = document.createElement('div');
    reviews.className = 'clone-local-reviews';
    reviews.innerHTML = '<h3>Reviews saved on this browser</h3>' + saved.map(review => `<article class="clone-form-message"><strong>${escape(review.name)}</strong><p>${escape(review.text)}</p></article>`).join('');
    form.before(reviews);
  }

  function setupListingDraft() {
    if (pathOf(location.href) !== '/listing-form/') return;
    const form = select('form:not(#login)');
    if (!form) return;
    const panel = document.createElement('section');
    panel.className = 'clone-panel';
    panel.innerHTML = `<h2>Prepare your property listing</h2><p>Save a draft on this browser. Publishing and account access require a connected backend.</p><form data-clone-draft><label>Property title<input name="title" required maxlength="160"></label><label>Status<select name="status" required><option value="">Select status</option><option>Buy</option><option>Rent</option><option>Sell</option></select></label><label>Property type<select name="type" required><option value="">Select type</option><option>Flat</option><option>Plot</option><option>Commercial Space</option><option>Office Space</option><option>Shop</option><option>Villa</option></select></label><label>Location<input name="location" required></label><label>Price (₹)<input type="number" name="price" min="0" required></label><label>Description<textarea name="description" rows="4" required></textarea></label><button type="submit">Save property draft</button></form><details><summary>Saved drafts (${storage.read('drafts').length})</summary>${storage.read('drafts').map(draft => `<article class="property-draft"><h3>${escape(draft.title)}</h3><p>${escape(draft.location)} · ${escape(draft.status)} · ${money(draft.price)}</p><p>${escape(draft.description)}</p></article>`).join('')}</details>`;
    form.closest('.entry-content, .page-content, .content-area')?.append(panel) || form.after(panel);
    const renderDrafts = () => {
      const details = select('details',panel);
      const drafts = storage.read('drafts');
      details.innerHTML = `<summary>Saved drafts (${drafts.length})</summary>${drafts.map((draft,index) => `<article class="property-draft"><h3>${escape(draft.title)}</h3><p>${escape(draft.location)} · ${escape(draft.status)} · ${money(draft.price)}</p><p>${escape(draft.description)}</p><button type="button" data-remove-draft="${index}">Delete local draft</button></article>`).join('')}`;
      selectAll('[data-remove-draft]',details).forEach(button => button.addEventListener('click', () => {
        storage.write('drafts', storage.read('drafts').filter((draft,index) => index !== Number(button.dataset.removeDraft)));
        renderDrafts();
        toast('Local draft deleted.');
      }));
    };
    document.addEventListener('clone-drafts-changed',renderDrafts);
    renderDrafts();
  }

  function setupPropertyGallery() {
    selectAll('.property-single-images').forEach(gallery => {
      const slides = selectAll(':scope > .slider-item', gallery);
      if (!slides.length) return;
      gallery.setAttribute('role', 'region');
      gallery.setAttribute('aria-label', 'Property photos');
      gallery.setAttribute('tabindex', '0');
      const controls = document.createElement('div');
      controls.className = 'property-gallery-controls';
      controls.innerHTML = '<button type="button" aria-label="Previous property photo">&#8249;</button><span aria-live="polite"></span><button type="button" aria-label="Next property photo">&#8250;</button>';
      gallery.after(controls);
      const counter = select('span', controls);
      let current = 0;
      const move = step => {
        const index = (current + step + slides.length) % slides.length;
        gallery.scrollTo({left: slides[index].offsetLeft - slides[0].offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
      };
      const update = () => {
        current = Math.max(0, Math.min(slides.length - 1, Math.round(gallery.scrollLeft / slides[0].getBoundingClientRect().width)));
        counter.textContent = `${current + 1} / ${slides.length}`;
      };
      selectAll('button', controls)[0].addEventListener('click', () => move(-1));
      selectAll('button', controls)[1].addEventListener('click', () => move(1));
      gallery.addEventListener('scroll', update, {passive:true});
      gallery.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        move(event.key === 'ArrowRight' ? 1 : -1);
      });
      update();
    });
  }

  function setupMedia() {
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href="#unavailable-video"], a[href="#password-help"], a.video-popup');
      if (!link) return;
      event.preventDefault();
      const password = link.getAttribute('href') === '#password-help';
      dialog(password ? 'Password assistance' : 'Property video', `<p>${password ? 'Password recovery requires the original account service. Contact PuneFinds at punefinds@gmail.com for account assistance.' : 'The original video points to a localhost address and is not available in the supplied backup folder.'}</p>`);
    });
    selectAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!/^\/assets\/.*\.(png|jpe?g|webp)$/i.test(href)) return;
      link.addEventListener('click', event => {
        event.preventDefault();
        dialog('Property photo', `<img src="${escape(href)}" alt="Property photograph">`);
      });
    });
  }

  async function start() {
    setupNavigation();
    setupAnimations();
    setupLogin();
    setupListingDraft();
    setupForms();
    setupPropertyGallery();
    setupMedia();
    try {
      const response = await fetch('/catalog.json');
      if (!response.ok) throw new Error('Catalog unavailable');
      catalog = await response.json();
      setupSaved();
      setupSearch();
      renderComparison();
    } catch {
      toast('Property data could not be loaded. Start the site with the included local server.');
    }
  }
  start();
})();
