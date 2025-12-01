import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';

const core1000 = {
  core1: "https://iknow.jp/courses/566921",
  core2: "https://iknow.jp/courses/566922",
  core3: "https://iknow.jp/courses/566924",
  core4: "https://iknow.jp/courses/566925",
  core5: "https://iknow.jp/courses/566926",
  core6: "https://iknow.jp/courses/566927",
  core7: "https://iknow.jp/courses/566928",
  core8: "https://iknow.jp/courses/566929",
  core9: "https://iknow.jp/courses/566930",
  core10: "https://iknow.jp/courses/566932",
};

const core2000 = {
  core1: "https://iknow.jp/courses/594768",
  core2: "https://iknow.jp/courses/594770",
  core3: "https://iknow.jp/courses/594771",
  core4: "https://iknow.jp/courses/594772",
  core5: "https://iknow.jp/courses/594773",
  core6: "https://iknow.jp/courses/594774",
  core7: "https://iknow.jp/courses/594775",
  core8: "https://iknow.jp/courses/594777",
  core9: "https://iknow.jp/courses/594778",
  core10: "https://iknow.jp/courses/594780",
}

const core3000 = {
  core1: "https://iknow.jp/courses/615865",
  core2: "https://iknow.jp/courses/615866",
  core3: "https://iknow.jp/courses/615867",
  core4: "https://iknow.jp/courses/615869",
  core5: "https://iknow.jp/courses/615871",
  core6: "https://iknow.jp/courses/615872",
  core7: "https://iknow.jp/courses/615873",
  core8: "https://iknow.jp/courses/615874",
  core9: "https://iknow.jp/courses/615876",
  core10: "https://iknow.jp/courses/615877",
}

const core4000 = {
  core1: "https://iknow.jp/courses/615947",
  core2: "https://iknow.jp/courses/615949",
  core3: "https://iknow.jp/courses/615950",
  core4: "https://iknow.jp/courses/615951",
  core5: "https://iknow.jp/courses/615953",
  core6: "https://iknow.jp/courses/615954",
  core7: "https://iknow.jp/courses/615955",
  core8: "https://iknow.jp/courses/615957",
  core9: "https://iknow.jp/courses/615958",
  core10: "https://iknow.jp/courses/615959",
}

const core5000 = {
  core1: "https://iknow.jp/courses/616077",
  core2: "https://iknow.jp/courses/616078",
  core3: "https://iknow.jp/courses/616079",
  core4: "https://iknow.jp/courses/616080",
  core5: "https://iknow.jp/courses/616081",
  core6: "https://iknow.jp/courses/616082",
  core7: "https://iknow.jp/courses/616083",
  core8: "https://iknow.jp/courses/616084",
  core9: "https://iknow.jp/courses/616085",
  core10: "https://iknow.jp/courses/616086",
}

const core6000 = {
  core1: "https://iknow.jp/courses/598434",
  core2: "https://iknow.jp/courses/598432",
  core3: "https://iknow.jp/courses/598431",
  core4: "https://iknow.jp/courses/598430",
  core5: "https://iknow.jp/courses/598427",
  core6: "https://iknow.jp/courses/598426",
  core7: "https://iknow.jp/courses/598425",
  core8: "https://iknow.jp/courses/598424",
  core9: "https://iknow.jp/courses/598423",
  core10: "https://iknow.jp/courses/598422",
}

const fileName = "core6000.js";
const variableName = "core6000";
const entriesName = core6000;


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function translateToKorean(page, word) {
  try {
    const papagoUrl = `https://papago.naver.com/?sk=auto&tk=ko&st=${encodeURIComponent(word)}`;
    await page.goto(papagoUrl, { waitUntil: "networkidle2", timeout: 10000 });


    await page.waitForSelector("#txtTarget span", { timeout: 5000 });
    
    await delay(300);

    const korean = await page.evaluate(() => {
      const el = document.querySelector("#txtTarget span");
      return el ? el.innerText.trim() : "";
    });

    return korean || "";
  } catch (err) {
    console.error(`   ⚠️  Translation failed for "${word}":`, err.message);
    return "";
  }
}

async function scrapeCourse(page, url) {
  await page.goto(url, { waitUntil: "networkidle2" });

  const result = await page.evaluate(() => {
    const items = [...document.querySelectorAll(".item-details")];
    return items.map(item => {
      // 단어
      const word = item.querySelector(".cue")?.innerText?.trim() || "";

      // 읽기
      let reading = item.querySelector(".transliteration")?.innerText?.trim() || "";
      reading = reading.replace(/[\[\]]/g, "").trim();


      const meaning = item.querySelector(".response")?.innerText?.trim() || "";

      return { word, reading, meaning };
    });
  });

  return result;
}

(async () => {
  console.log(`\nStarting ${variableName} Scraper with Korean Translation...\n`);

  const browser = await puppeteer.launch({ headless: false }); // headless: false로 디버깅
  const page = await browser.newPage();
  const papago = await browser.newPage(); // 파파고 전용 페이지

  const output = {};

  for (const [coreName, url] of Object.entries(entriesName)) {
    console.log(`\n📘 Fetching ${coreName} ...`);

    try {
      const items = await scrapeCourse(page, url);
      console.log(`   -> ${items.length} items scraped`);

      for (let item of items) {
        console.log(`   Translating: ${item.word}`);
        const koreanMeaning = await translateToKorean(papago, item.word);
        item.korean = koreanMeaning;

        await delay(300);
      }

      output[coreName] = items;

      console.log(`   ✔ Completed ${coreName}`);
    } catch (err) {
      console.error(`❌ Failed scraping ${coreName}:`, err);
    }
  }

  await browser.close();

  const dirPath = "words/";
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

  const filePath = path.join(dirPath, fileName);
  
  const jsContent = `const ${variableName} = ${JSON.stringify(output, null, 2)};`;
  
  fs.writeFileSync(filePath, jsContent, "utf-8");

  console.log(`\n💾 Saved to words/${fileName}`);
  console.log("🎉 Scraping Completed!\n");
})();