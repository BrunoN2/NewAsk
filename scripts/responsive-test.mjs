import { chromium } from 'playwright';

const SCREENS = [
  ['Galaxy S8', 360, 740],
  ['iPhone SE', 375, 667],
  ['iPhone 14/15', 390, 844],
  ['Pixel 7', 412, 412 + 503],
  ['iPhone Pro Max', 430, 932],
  ['laptop curto', 1280, 800],
  ['desktop', 1440, 900],
];

const browser = await chromium.launch();
let fails = 0;

for (const [name, w, h] of SCREENS) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  const m = await page.evaluate(() => {
    const phone = document.querySelector('.phone');
    const pr = phone.getBoundingClientRect();
    const tab = document.querySelector('.tabbar');
    const tr = tab.getBoundingClientRect();
    return {
      phone: `${Math.round(pr.width)}x${Math.round(pr.height)}`,
      phoneBottom: Math.round(pr.bottom),
      border: getComputedStyle(phone).border,
      tabBottom: Math.round(tr.bottom),
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
      overflowY: document.documentElement.scrollHeight > window.innerHeight + 1,
    };
  });
  const mobile = w <= 430;
  // computed border keeps the color; none means 0px
  const okBorder = mobile
    ? m.border.startsWith('0px') || m.border.includes('none')
    : m.border.startsWith('3px');
  // mobile: tabs at viewport bottom; desktop: tabs at frame bottom
  // desktop: bottom:0 anchors at the padding box, 3px above the border box
  const okTab = mobile ? m.tabBottom === h : Math.abs(m.tabBottom - m.phoneBottom) <= 4;
  const okNoH = !m.overflowX;
  const okNoV = !m.overflowY;
  const pass = okBorder && okTab && okNoH && okNoV;
  if (!pass) fails++;
  console.log(
    `${pass ? 'PASS' : 'FAIL'} ${name} ${w}x${h} → phone ${m.phone}, border ${okBorder ? 'ok' : `FAIL (${m.border})`}, tabs ${okTab ? 'ok' : `FAIL (${m.tabBottom} / phone ${m.phoneBottom} / view ${h})`}, overflow ${okNoH && okNoV ? 'ok' : 'FAIL'}`,
  );
  await page.close();
}

await browser.close();
console.log(fails === 0 ? 'ALL PASS' : `${fails} FAIL(S)`);
process.exit(fails === 0 ? 0 : 1);
