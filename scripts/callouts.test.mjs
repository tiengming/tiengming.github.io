import { test } from "node:test";
import assert from "node:assert/strict";
import { transformCallouts } from "./callouts.mjs";

test("transformCallouts：blockquote 内 [!NOTE] 换挂 data-callout 并去字面", () => {
  const html = `<blockquote>\n<p>[!NOTE] 本文开源了。</p>\n</blockquote>`;
  assert.equal(transformCallouts(html), `<blockquote data-callout="note">\n<p>本文开源了。</p>\n</blockquote>`);
});

test("transformCallouts：多种类型与行内前缀兼容", () => {
  assert.equal(
    transformCallouts(`<blockquote><p>[!WARNING] 注意</p></blockquote>`),
    `<blockquote data-callout="warning"><p>注意</p></blockquote>`,
  );
  assert.equal(
    transformCallouts(`<blockquote>\n[!TIP] 直接裸文本</blockquote>`),
    `<blockquote data-callout="tip">\n直接裸文本</blockquote>`,
  );
});

test("transformCallouts：非 callout 的 blockquote 与正文 [!XX] 不受影响", () => {
  const html = `<blockquote><p>普通引用</p></blockquote><p>正文出现 [!NOTE] 字样</p>`;
  assert.equal(transformCallouts(html), html);
});