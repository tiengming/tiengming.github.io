/* Aurora GM core 单元测试 — 纯函数与内核行为，Node 环境运行
   用法: node scripts/test-core.mjs */
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const corePath = "../static/assets/gm/core.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---- 最小 DOM stub ---- */
function stubEnv(pageAttr, readyState = "complete") {
  const doc = {
    readyState,
    body: { getAttribute: (n) => (n === "data-page" ? pageAttr : null) },
    documentElement: { getAttribute: () => "light" },
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
  };
  const win = {
    matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
    addEventListener() {},
  };
  return { win, doc };
}

let passed = 0;
let failed = 0;
async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log("  ✓ " + name);
  } catch (e) {
    failed++;
    console.error("  ✗ " + name + "\n    " + (e && e.message));
  }
}

console.log("GM core tests");

const { detectPage, throttle, debounce, createGM } = await import(
  new URL(corePath, import.meta.url).href
);

/* ---- detectPage ---- */
await test("detectPage: 识别五种页面类型与未知", () => {
  assert.equal(detectPage("post"), "post");
  assert.equal(detectPage("list"), "list");
  assert.equal(detectPage("tag"), "tag");
  assert.equal(detectPage("single"), "single");
  assert.equal(detectPage(null), "unknown");
  assert.equal(detectPage(undefined), "unknown");
  assert.equal(detectPage("whatever"), "unknown");
});

/* ---- throttle ---- */
await test("throttle: 高频调用被节流为少量执行（leading）", async () => {
  let count = 0;
  const fn = throttle(() => count++, 40);
  for (let i = 0; i < 20; i++) fn();
  assert.equal(count, 1, "首次立即执行（leading）");
  await sleep(90);
  assert.ok(count <= 2, "窗口期内最多 leading+trailing 两次，实际 " + count);
});

await test("throttle: 最后一次调用最终会执行（trailing）", async () => {
  let result = 0;
  const fn = throttle((v) => (result = v), 30);
  fn(1);
  await sleep(10);
  fn(99); // 应作为 trailing 被延迟执行
  await sleep(80);
  assert.equal(result, 99, "末次参数生效");
});

/* ---- debounce ---- */
await test("debounce: 连续调用合并为最后一次", async () => {
  let count = 0;
  let lastArg = null;
  const fn = debounce((v) => {
    count++;
    lastArg = v;
  }, 30);
  fn(1);
  fn(2);
  fn(3);
  await sleep(10);
  fn(4);
  await sleep(80);
  assert.equal(count, 1, "只执行一次");
  assert.equal(lastArg, 4, "使用最后一次参数");
});

/* ---- createGM: 页面注册制 ---- */
await test("createGM: use() 按 pages 过滤，只在匹配页初始化", async () => {
  const { win, doc } = stubEnv("list");
  const GM = createGM(win, doc);
  const inited = [];
  GM.use({ name: "a", pages: ["post"], init: () => inited.push("a") });
  GM.use({ name: "b", pages: ["list", "tag"], init: () => inited.push("b") });
  GM.use({ name: "c", init: () => inited.push("c") }); // 无 pages = 全页面
  await sleep(5);
  assert.deepEqual(inited.sort(), ["b", "c"], "list 页只跑 b 和 c");
});

await test("createGM: 单模块 init 抛错不影响其他模块", async () => {
  const { win, doc } = stubEnv("post");
  const GM = createGM(win, doc);
  const inited = [];
  GM.use({ name: "bad", pages: ["post"], init: () => { throw new Error("boom"); } });
  GM.use({ name: "good", pages: ["post"], init: () => inited.push("good") });
  await sleep(5);
  assert.deepEqual(inited, ["good"]);
});

await test("createGM: 同名模块重复注册被忽略", async () => {
  const { win, doc } = stubEnv("post");
  const GM = createGM(win, doc);
  let n = 0;
  GM.use({ name: "x", pages: ["post"], init: () => n++ });
  GM.use({ name: "x", pages: ["post"], init: () => n++ });
  await sleep(5);
  assert.equal(n, 1);
});

await test("createGM: onReady 只触发一次，之后注册立即执行", async () => {
  const { win, doc } = stubEnv("post");
  const GM = createGM(win, doc);
  const order = [];
  GM.onReady(() => order.push(1));
  GM.onReady(() => order.push(2));
  await sleep(5);
  GM.onReady(() => order.push(3));
  assert.deepEqual(order, [1, 2, 3]);
  assert.equal(order.filter((x) => x === 1).length, 1, "无重复触发");
});

await test("createGM: theme.onChange 收到变更回调", async () => {
  const { win, doc } = stubEnv("post");
  const GM = createGM(win, doc);
  const seen = [];
  GM.theme.onChange((m) => seen.push(m));
  GM.emit("theme", "dark");
  assert.deepEqual(seen, ["dark"]);
});

await test("createGM: theme.resolved 将 auto 解析为实际浅/深", () => {
  const { win, doc } = stubEnv("post");
  const GM = createGM(win, doc);
  assert.equal(GM.theme.resolved(), "light"); // stub matchMedia.matches=false
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
