import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { afterEach, beforeEach, test } from 'node:test';
import { JSDOM } from 'jsdom';
import { transformWithEsbuild } from 'vite';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

const require = createRequire(import.meta.url);
let source = await readFile(new URL('../src/main.jsx', import.meta.url), 'utf8');
source = source.replace("import './style.css';", '')
  .replace("from 'react'", `from '${pathToFileURL(require.resolve('react')).href}'`)
  .replace("from 'react-dom/client'", `from '${pathToFileURL(require.resolve('react-dom/client')).href}'`)
  .replace("createRoot(document.getElementById('root')).render(<App/>);", 'export { App };');
const result = await transformWithEsbuild(source, 'app.jsx', { jsx: 'transform', format: 'esm' });
const { App } = await import('data:text/javascript;base64,' + Buffer.from(result.code).toString('base64'));
let dom, root, media;
const positions = { discover: 1000, place: 2000, experience: 3000, heritage: 4000, learning: 5000, conservation: 6000, visit: 7000 };
const pause = () => new Promise(resolve => setTimeout(resolve, 25));
async function interact(action) { await act(async () => { action(); await pause(); }); }

beforeEach(async () => {
  dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'http://localhost:5173/', pretendToBeVisual: true });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.requestAnimationFrame = callback => setTimeout(callback, 1);
  globalThis.cancelAnimationFrame = clearTimeout;
  media = { matches: false, listeners: new Set(), addEventListener(_, fn) { this.listeners.add(fn); }, removeEventListener(_, fn) { this.listeners.delete(fn); } };
  window.matchMedia = () => media;
  dom.window.HTMLElement.prototype.getBoundingClientRect = function () {
    return { top: (positions[this.id] ?? 10000) - window.scrollY, left: 0, right: 100, bottom: 100, width: 100, height: 100 };
  };
  root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(App)));
});
afterEach(async () => {
  await act(async () => root.unmount());
  dom.window.close();
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});

test('renders all navigation destinations and accessible FAQ control relationships', () => {
  assert.equal(document.querySelectorAll('h1').length, 1);
  const links = [...document.querySelectorAll('#mobile-navigation a')];
  assert.equal(links.length, 4);
  for (const link of document.querySelectorAll('a[href^="#"]')) {
    assert.ok(document.getElementById(link.hash.slice(1)), `Missing destination ${link.hash}`);
  }
  for (const button of document.querySelectorAll('[aria-controls]')) {
    assert.ok(document.getElementById(button.getAttribute('aria-controls')));
  }
  for (const link of document.querySelectorAll('a[target="_blank"]')) assert.ok(link.rel.includes('noopener'));
});

test('mobile menu locks the background, wraps keyboard focus, and restores focus on Escape', async () => {
  const toggle = document.querySelector('.menu');
  await interact(() => toggle.click());
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(document.activeElement, document.querySelector('#mobile-navigation a'));
  assert.ok(document.querySelector('main').hasAttribute('inert'));
  assert.ok(document.querySelector('footer').hasAttribute('inert'));
  assert.equal(document.body.style.overflow, 'hidden');
  toggle.focus();
  await interact(() => document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })));
  assert.equal(document.activeElement, document.querySelector('nav .brand'));
  await interact(() => document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })));
  assert.equal(document.activeElement, toggle);
  await interact(() => document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(document.activeElement, toggle);
  assert.equal(document.body.style.overflow, '');
  assert.ok(!document.querySelector('main').hasAttribute('inert'));
  assert.ok(!document.querySelector('footer').hasAttribute('inert'));
});

test('selecting a menu section closes it and moves focus to the destination, not the toggle', async () => {
  await interact(() => document.querySelector('.menu').click());
  await interact(() => document.querySelector('#mobile-navigation a[href="#place"]').click());
  assert.equal(document.querySelector('.menu').getAttribute('aria-expanded'), 'false');
  assert.equal(document.activeElement, document.getElementById('place'));
  assert.ok(!document.querySelector('main').hasAttribute('inert'));
  assert.equal(document.body.style.overflow, '');
});

test('switching to desktop closes an open menu and releases the background', async () => {
  await interact(() => document.querySelector('.menu').click());
  await interact(() => { media.matches = true; for (const callback of media.listeners) callback(); });
  assert.equal(document.querySelector('.menu').getAttribute('aria-expanded'), 'false');
  assert.equal(document.body.style.overflow, '');
  assert.ok(!document.querySelector('main').hasAttribute('inert'));
});

test('FAQ remains consistent after rapid toggles and keeps collapsed answers inactive', async () => {
  const button = document.querySelector('.guide-trigger');
  const panel = document.getElementById(button.getAttribute('aria-controls'));
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.ok(panel.hasAttribute('inert'));
  await interact(() => { for (let i = 0; i < 5; i++) button.click(); });
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(panel.getAttribute('aria-hidden'), 'false');
  assert.ok(!panel.hasAttribute('inert'));
  await interact(() => button.click());
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(panel.getAttribute('aria-hidden'), 'true');
  assert.ok(panel.hasAttribute('inert'));
});

test('active navigation follows scroll position and clears when returning to the hero', async () => {
  await interact(() => { window.scrollY = 6100; window.dispatchEvent(new window.Event('scroll')); });
  assert.equal(document.querySelector('nav [aria-current="location"]').hash, '#conservation');
  assert.ok(document.querySelector('nav').classList.contains('scrolled'));
  await interact(() => { window.scrollY = 0; window.dispatchEvent(new window.Event('scroll')); });
  assert.equal(document.querySelector('nav [aria-current="location"]'), null);
  assert.ok(!document.querySelector('nav').classList.contains('scrolled'));
});

test('menu cleanup preserves pre-existing scroll settings and inert state', async () => {
  document.body.style.overflow = 'clip';
  document.querySelector('footer').setAttribute('inert', '');
  await interact(() => document.querySelector('.menu').click());
  await interact(() => document.querySelector('.menu').click());
  assert.equal(document.body.style.overflow, 'clip');
  assert.ok(document.querySelector('footer').hasAttribute('inert'));
  assert.ok(!document.querySelector('main').hasAttribute('inert'));
});

test('scroll reveal animates only entering content and cancels motion when reduced motion is enabled', async () => {
  const observed = new Set();
  const calls = [];
  let callback, disconnected = false;
  window.IntersectionObserver = class {
    constructor(fn) { callback = fn; }
    observe(el) { observed.add(el); }
    unobserve(el) { observed.delete(el); }
    disconnect() { disconnected = true; observed.clear(); }
  };
  window.Element.prototype.animate = function (frames, options) {
    const animation = { cancelled: false, cancel() { this.cancelled = true; } };
    calls.push({ element: this, frames, options, animation });
    return animation;
  };
  await act(async () => root.render(React.createElement(App, { key: 'animated' })));
  assert.ok(observed.size > 0);
  assert.equal(calls.length, 0);
  const content = document.querySelector('.intro-copy');
  assert.equal(content.style.opacity, '');
  callback([{ target: content, isIntersecting: false }]);
  assert.equal(calls.length, 0);
  callback([{ target: content, isIntersecting: true }]);
  assert.equal(calls.length, 1);
  assert.ok(!observed.has(content));
  assert.equal(calls[0].options.duration, 600);
  await interact(() => { media.matches = true; for (const fn of media.listeners) fn(); });
  assert.ok(disconnected);
  assert.ok(calls[0].animation.cancelled);
  assert.equal(content.style.opacity, '');
});

test('reduced-motion visitors get visible content without scroll animations', async () => {
  media.matches = true;
  window.IntersectionObserver = class { constructor() { throw new Error('Observer should not be created'); } };
  window.Element.prototype.animate = () => { throw new Error('Animation should not run'); };
  await act(async () => root.render(React.createElement(App, { key: 'reduced-motion' })));
  assert.equal(document.querySelector('.intro-copy').style.opacity, '');
  assert.equal(document.querySelectorAll('nav [aria-controls="mobile-navigation"]').length, 1);
});
