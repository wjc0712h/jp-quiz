import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';

// Configuration
const INPUT_FILE = 'jpcorewords/words/core6000.js'; 
const OUTPUT_FILE = 'jpcorewords/sentences/core6000_sentences.json';
const MIN_WORD_COUNT = 10;
const MAX_SENTENCES_PER_WORD = 1; 

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadWords(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const varMatch = fileContent.match(/const (\w+) = /);
    if (!varMatch) {
      throw new Error('Could not find variable declaration in file');
    }
    
    const varName = varMatch[1];
    
    let result;
    eval(`${fileContent}\nresult = ${varName};`);
    
    return result;
  } catch (err) {
    console.error('Error loading words file:', err);
    process.exit(1);
  }
}

async function scrapeSentences(page, word, maxSentences = MAX_SENTENCES_PER_WORD) {
  const encodedWord = encodeURIComponent(word);
  const url = `https://tatoeba.org/en/sentences/search?from=jpn&query=${encodedWord}&sort=relevance&word_count_min=${MIN_WORD_COUNT}`;
  
  try {
    console.log(`   Fetching sentences for: ${word}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    await page.waitForSelector('.sentence-and-translations', { timeout: 10000 });
    await delay(200);
    
    const sentences = await page.evaluate((maxCount) => {
      const results = [];
      const sentenceElements = document.querySelectorAll('.sentence-and-translations');
      
      for (let i = 0; i < Math.min(sentenceElements.length, maxCount); i++) {
        const element = sentenceElements[i];
        
        // Get Japanese sentence - find the text div with lang="ja"
        const jpnTextDiv = element.querySelector('.text[lang="ja"]');
        
        if (jpnTextDiv) {
          const jpnSentence = jpnTextDiv.innerText?.trim() || '';
          if (jpnSentence) {
            results.push(jpnSentence);
          }
        }
      }
      
      return results;
    }, maxSentences);
    
    console.log(`   ✔ Found ${sentences.length} sentences:`);
    sentences.forEach((sentence, index) => {
      console.log(`      ${index + 1}. ${sentence}`);
    });
    
    return sentences;
    
  } catch (err) {
    console.error(`   ⚠️ Failed to fetch sentences for "${word}":`, err.message);
    return [];
  }
}

(async () => {
  console.log('\n🚀 Starting Tatoeba Japanese Sentence Scraper...\n');
  console.log(`📂 Input: ${INPUT_FILE}`);
  console.log(`💾 Output: ${OUTPUT_FILE}`);
  console.log(`📏 Min word count: ${MIN_WORD_COUNT}`);
  console.log(`🔢 Max sentences per word: ${MAX_SENTENCES_PER_WORD}\n`);
  
  // Load words
  const wordsData = loadWords(INPUT_FILE);
  const allWords = [];
  
  // Flatten all words from all cores
  for (const [coreName, items] of Object.entries(wordsData)) {
    items.forEach(item => {
      allWords.push({
        word: item.word,
        reading: item.reading,
        meaning: item.meaning,
        korean: item.korean,
        core: coreName
      });
    });
  }
  
  console.log(`📚 Total words to process: ${allWords.length}\n`);
  
  // Launch browser
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set viewport for better rendering
  await page.setViewport({ width: 1280, height: 800 });
  
  const output = {};
  let processedCount = 0;
  let totalSentences = 0;
  
  // Process each word
  for (const wordData of allWords) {
    processedCount++;
    console.log(`\n[${processedCount}/${allWords.length}] Processing: ${wordData.word} (${wordData.core})`);
    
    const sentences = await scrapeSentences(page, wordData.word);
    totalSentences += sentences.length;
    
    output[wordData.word] = {
      word: wordData.word,
      reading: wordData.reading,
      meaning: wordData.meaning,
      korean: wordData.korean,
      core: wordData.core,
      sentences: sentences
    };
    
    // Be nice to the server
    await delay(200);
    
    // Save progress every 10 words
    if (processedCount % 10 === 0) {
      const outputDir = path.dirname(OUTPUT_FILE);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
      console.log(`\n💾 Progress saved (${processedCount}/${allWords.length})`);
    }
  }
  
  await browser.close();
  
  // Final save
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  
  console.log('\n\n✅ Scraping Completed!');
  console.log(`📊 Summary:`);
  console.log(`   - Total words processed: ${allWords.length}`);
  console.log(`   - Total sentences collected: ${totalSentences}`);
  console.log(`   - Output file: ${OUTPUT_FILE}\n`);
})();