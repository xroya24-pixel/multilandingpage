/* ================================================================
   YAIPLATFORM — Brand Switcher
   Handles instant brand switching via dropdown without page reload
   ================================================================ */

(function () {
  'use strict';

  function switchBrand(brandId) {
    var brand = BRANDS[brandId];
    if (!brand) return;

    document.documentElement.setAttribute('data-brand', brandId);

    document.title = brand.meta.title;
    setMeta('description', brand.meta.description);
    setMeta('og:title', brand.meta.ogTitle);
    setMeta('og:description', brand.meta.ogDescription);
    setMeta('og:image', brand.meta.ogImage);

    var favicon = document.querySelector('link[rel="icon"]');
    if (favicon) favicon.href = brand.meta.favicon;

    var dropdown = document.getElementById('brand-select');
    if (dropdown) dropdown.value = brandId;

    setText('brand-name', brand.meta.brandName);
    setText('hero-title', brand.hero.title);
    setText('hero-subtitle', brand.hero.subtitle);
    setText('hero-cta', brand.hero.cta);
    setAttr('hero-cta', 'href', brand.hero.ctaLink || '#contact');

    var hero = document.getElementById('home');
    if (hero) {
      hero.style.backgroundImage = 'url(' + brand.hero.bgImage + ')';
    }

    setText('about-title', brand.about.title);
    setText('about-desc', brand.about.description);
    setSrc('about-image', brand.about.image);
    setAttr('about-image', 'alt', brand.about.title);

    setText('services-title', brand.services.sectionTitle);
    renderGrid('services-grid', brand.services.items, serviceTemplate);

    setText('why-title', brand.why.sectionTitle);
    renderGrid('why-grid', brand.why.items, whyTemplate);

    setText('projects-title', brand.projects.sectionTitle);
    renderGrid('projects-grid', brand.projects.items, projectTemplate);

    setText('testimonials-title', brand.testimonials.sectionTitle);
    renderGrid('testimonials-grid', brand.testimonials.items, testimonialTemplate);

    setText('cta-title', brand.cta.title);
    setText('cta-desc', brand.cta.description);
    setText('cta-button', brand.cta.button);
    setAttr('cta-button', 'href', brand.cta.buttonLink || '#contact');

    setText('contact-title', brand.contact.sectionTitle);
    setText('contact-address', brand.contact.address);
    setText('contact-phone', brand.contact.phone);
    setText('contact-email', brand.contact.email);
    setAttr('contact-phone-link', 'href', 'tel:' + brand.contact.phone.replace(/[^0-9+]/g, ''));
    setAttr('contact-email-link', 'href', 'mailto:' + brand.contact.email);

    setText('hero-cta-label', brand.hero.eyebrow || brand.meta.brandName + ' &mdash; YAIPLATFORM');

    setText('footer-brand', brand.meta.brandName);
    setText('footer-desc', brand.footer.description);
    renderList('footer-services', brand.footer.services, linkTemplate);
    renderList('footer-links', brand.footer.quickLinks, linkTemplate);
    renderList('footer-socials', brand.footer.socials, socialTemplate);

    setText('footer-copyright', brand.footer.copyright || '&copy; ' + new Date().getFullYear() + ' ' + brand.meta.brandName + '. All rights reserved.');

    setText('contact-address-footer', brand.contact.address);
    setText('contact-phone-footer', brand.contact.phone);
    setText('contact-email-footer', brand.contact.email);

    updateImages(brandId);

    var event = new CustomEvent('brandChanged', { detail: { brandId: brandId } });
    document.dispatchEvent(event);
  }

  /* ---- Helpers ---- */

  function setText(key, value) {
    var el = document.querySelector('[data-' + key + ']');
    if (el && value !== undefined && value !== null) el.innerHTML = value;
  }

  function setAttr(key, attr, value) {
    var el = document.querySelector('[data-' + key + ']');
    if (el && value !== undefined) el.setAttribute(attr, value);
  }

  function setSrc(key, value) {
    var el = document.querySelector('[data-' + key + ']');
    if (el && value) el.src = value;
  }

  function setMeta(name, content) {
    if (!content) return;
    var el = document.querySelector('meta[name="' + name + '"]') ||
             document.querySelector('meta[property="' + name + '"]');
    if (!el) {
      el = document.createElement('meta');
      if (name.indexOf('og:') === 0) el.setAttribute('property', name);
      else el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function renderGrid(key, items, fn) {
    var el = document.querySelector('[data-' + key + ']');
    if (!el || !items) return;
    el.innerHTML = items.map(fn).join('');
  }

  function renderList(key, items, fn) {
    var el = document.querySelector('[data-' + key + ']');
    if (!el || !items) return;
    el.innerHTML = items.map(fn).join('');
  }

  function updateImages(brandId) {
    document.querySelectorAll('[data-brand-src]').forEach(function (img) {
      var template = img.getAttribute('data-brand-src');
      if (template) img.src = template.replace(/\{brand\}/g, brandId);
    });
  }

  /* ---- Templates ---- */

  function serviceTemplate(item) {
    var icon = SVG_ICONS[item.icon] || '';
    return (
      '<div class="service-card card">' +
        '<div class="service-card__icon">' + icon + '</div>' +
        '<h3 class="service-card__title">' + item.title + '</h3>' +
        '<p class="service-card__desc">' + item.description + '</p>' +
      '</div>'
    );
  }

  function whyTemplate(item) {
    var icon = SVG_ICONS[item.icon] || '';
    return (
      '<div class="why-card card">' +
        '<div class="why-card__icon">' + icon + '</div>' +
        '<h3 class="why-card__title">' + item.title + '</h3>' +
        '<p class="why-card__desc">' + item.description + '</p>' +
      '</div>'
    );
  }

  function projectTemplate(item) {
    return (
      '<div class="project-card card">' +
        '<div class="project-card__media">' +
          '<img src="' + item.image + '" alt="' + item.title + '" loading="lazy">' +
          '<div class="project-card__overlay">' +
            '<span class="project-card__cat">' + item.category + '</span>' +
            '<h3 class="project-card__title">' + item.title + '</h3>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function testimonialTemplate(item) {
    return (
      '<div class="testimonial-card card">' +
        '<div class="testimonial-card__stars">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' +
        '</div>' +
        '<blockquote class="testimonial-card__quote">' + item.text + '</blockquote>' +
        '<div class="testimonial-card__author">' +
          '<img src="' + item.avatar + '" alt="' + item.name + '" loading="lazy" class="testimonial-card__avatar">' +
          '<div>' +
            '<div class="testimonial-card__name">' + item.name + '</div>' +
            '<div class="testimonial-card__role">' + item.role + '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function linkTemplate(item) {
    return '<li><a href="' + item.link + '">' + item.label + '</a></li>';
  }

  function socialTemplate(item) {
    return (
      '<a href="' + item.link + '" target="_blank" rel="noopener" class="footer__social-link" aria-label="' + item.label + '">' +
        item.icon +
      '</a>'
    );
  }

  /* ---- Init ---- */

  document.addEventListener('DOMContentLoaded', function () {
    var dropdown = document.getElementById('brand-select');
    if (!dropdown) return;

    var initial = dropdown.value || 'properti';
    BRANDS[initial] && switchBrand(initial);

    dropdown.addEventListener('change', function () {
      switchBrand(this.value);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  window.switchBrand = switchBrand;

})();
