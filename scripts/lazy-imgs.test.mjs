import { test } from "node:test";
import assert from "node:assert/strict";
import { transformLazyImages } from "./lazy-imgs.mjs";

test("transformLazyImages：裸 img 注入 loading 与 decoding", () => {
  const html = `<article><img src="https://a/b.png" alt="x"></article>`;
  assert.equal(
    transformLazyImages(html),
    `<article><img loading="lazy" decoding="async" src="https://a/b.png" alt="x"></article>`,
  );
});

test("transformLazyImages：已有 loading 属性的不动", () => {
  const html = `<img loading="eager" src="a.png">`;
  assert.equal(transformLazyImages(html), html);
});

test("transformLazyImages：多张 img 全部注入，自闭合与多属性兼容", () => {
  const html = `<img src="1.png" alt="一"/><p>t</p><img class="k" src="2.png">`;
  assert.equal(transformLazyImages(html), `<img loading="lazy" decoding="async" src="1.png" alt="一"/><p>t</p><img loading="lazy" decoding="async" class="k" src="2.png">`);
});

test("transformLazyImages：无 img 原样返回", () => {
  assert.equal(transformLazyImages(`<p>纯文本</p>`), `<p>纯文本</p>`);
});
