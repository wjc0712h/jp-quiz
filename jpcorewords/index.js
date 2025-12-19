        let currentVocab = 'core1000';
        let currentMode = 'flashcard';
        let currentWord = null;
        let currentSentence = null;
        let allWords = [];
        let currentIndex = 0;
        let isFlipped = false;
        let autoPlayInterval = null;
        let autoPlaySpeed = 1000;
        let speechSynthesis = window.speechSynthesis;
        let japaneseVoice = null;
        let savedWords = [];

        function initVoice() {
            const voices = speechSynthesis.getVoices();
            japaneseVoice = voices.find(voice => voice.lang === 'ja-JP');
            if (!japaneseVoice) {
                japaneseVoice = voices.find(voice => voice.lang.startsWith('ja'));
            }
            console.log('Available voices:', voices.length);
            console.log('Japanese voice:', japaneseVoice);
        }

        speechSynthesis.onvoiceschanged = initVoice;
        setTimeout(initVoice, 100);

        function loadVocab(vocabType, buttonElement) {
            document.querySelectorAll('.vocab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            buttonElement.classList.add('active');
            
            currentVocab = vocabType;
            
            if (vocabType === 'core1000') {
                currentWord = core1000;
                currentSentence = sentence1000;
            } else if (vocabType === 'core2000') {
                currentWord = core2000;
                currentSentence = sentence2000;
            } else if (vocabType === 'core3000') {
                currentWord = core3000;
                currentSentence = sentence3000;
            } else if (vocabType === 'core4000') {
                currentWord = core4000;
                currentSentence = sentence4000;
            } else if (vocabType === 'core5000') {
                currentWord = core5000;
                currentSentence = sentence5000;

            } else if (vocabType === 'core6000') {
                currentWord = core6000;
                currentSentence = sentence6000;
            }
            
            prepareWordList();
            currentIndex = 0;
            
            if (currentMode === 'flashcard') {
                showCard();
            } else {
                displayVocabulary();
            }
        }

        function setMode(mode, buttonElement) {
            document.querySelectorAll('.mode-button').forEach(btn => {
                btn.classList.remove('active');
            });
            buttonElement.classList.add('active');
            
            currentMode = mode;
            
            if (mode === 'flashcard') {
                document.getElementById('flashcard-view').style.display = 'block';
                document.getElementById('table-view').style.display = 'none';
                prepareWordList();
                showCard();
            } else {
                document.getElementById('flashcard-view').style.display = 'none';
                document.getElementById('table-view').style.display = 'block';
                stopAutoPlay();
                displayVocabulary();
            }
        }

        function prepareWordList() {
            allWords = [];
            for (let i = 1; i <= 10; i++) {
                const key = `core${i}`;
                if (currentWord[key]) {
                    currentWord[key].forEach((item, index) => {
                        allWords.push({
                            number: (index + 1) + ((i - 1) * 100),
                            ...item
                        });
                    });
                }
            }
        }

        function showCard() {
            if (allWords.length === 0) return;
            
            const word = allWords[currentIndex];
            document.getElementById('cardNumber').textContent = `${currentIndex + 1} / ${allWords.length}`;
            document.getElementById('cardWord').textContent = word.word;
            document.getElementById('cardReading').textContent = word.reading;
            document.getElementById('cardMeaning').textContent = word.korean;
            document.getElementById('cardEnglish').textContent = word.meaning;

            if (currentSentence && currentSentence[word.word] && currentSentence[word.word].sentences) {
                document.getElementById('example-sentences').textContent = currentSentence[word.word].sentences;
            } else {
                document.getElementById('example-sentences').textContent = '';
            }

            document.getElementById('cardFront').style.display = 'block';
            document.getElementById('cardBack').style.display = 'none';
            document.getElementById('flashcard').classList.remove('flipped');
            isFlipped = false;
            
            document.getElementById('progress').textContent = `Card ${currentIndex + 1} of ${allWords.length}`;
            document.getElementById('prevBtn').disabled = currentIndex === 0;
            document.getElementById('nextBtn').disabled = currentIndex === allWords.length - 1;
        
            if (document.getElementById('autoAudioCheck').checked) {
                setTimeout(() => playAudio(), 100);
            }
            
            updateSaveButton();
        }

        function updateSaveButton() {
            const word = allWords[currentIndex];
            const wordKey = `${currentVocab}-${word.number}`;
            const isSaved = savedWords.some(w => `${w.vocab}-${w.number}` === wordKey);
            const saveBtn = document.getElementById('saveBtn');
            
            if (isSaved) {
                saveBtn.classList.add('saved');
                saveBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
            } else {
                saveBtn.classList.remove('saved');
                saveBtn.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
            }
        }

        function toggleSaveWord(event) {
            if (event) {
                event.stopPropagation();
            }
            
            if (allWords.length === 0) return;
            
            const word = allWords[currentIndex];
            const wordKey = `${currentVocab}-${word.number}`;
            const existingIndex = savedWords.findIndex(w => `${w.vocab}-${w.number}` === wordKey);
            
            if (existingIndex !== -1) {
                savedWords.splice(existingIndex, 1);
            } else {
                savedWords.push({ ...word, vocab: currentVocab });
            }
            
            localStorage.setItem('savedWords', JSON.stringify(savedWords));
            updateSaveButton();
            displaySavedWords();
        }

        function displaySavedWords() {
            const section = document.getElementById('saved-words-section');
            const list = document.getElementById('saved-words-list');
            const count = document.getElementById('savedCount');
            
            if (savedWords.length === 0) {
                section.style.display = 'none';
                return;
            }
            
            section.style.display = 'block';
            count.textContent = savedWords.length;
            
            let html = '';
            savedWords.forEach((word, index) => {
                const vocabLabel = word.vocab === 'core1000' ? 'CORE1000' : word.vocab === 'core2000' ? 'CORE2000' : word.vocab === 'core3000' ? 'CORE3000' : word.vocab === 'core4000' ? 'CORE4000' : word.vocab === 'core5000' ? 'CORE5000' : 'CORE6000';
                const vocabExample = word.vocab === 'core1000' ? sentence1000 : word.vocab === 'core2000' ? sentence2000 : word.vocab === 'core3000' ? sentence3000 : word.vocab === 'core4000' ? sentence4000 : word.vocab === 'core5000' ? sentence5000 : sentence6000;

                const exampleSentence = vocabExample != null ? vocabExample[word.word].sentences : ''
                html += `
                    <div class="saved-word-item">
                        <div class="saved-word-content">
                            <div class="saved-word-japanese">${word.word} <span class="saved-word-sentence">${exampleSentence}</span><span style="font-size: 14px; color: #999;">(${vocabLabel} #${word.number})</span></div>
                            <div class="saved-word-reading">${word.reading}</div>
                            <div class="saved-word-meaning">${word.korean} ${word.meaning}</div>
                        </div>
                        <button class="delete-btn" onclick="deleteSavedWord(${index})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `;
            });
            
            list.innerHTML = html;
        }

        function deleteSavedWord(index) {
            savedWords.splice(index, 1);
            localStorage.setItem('savedWords', JSON.stringify(savedWords));
            displaySavedWords();
            updateSaveButton();
        }

        function clearAllSaved() {
            if (confirm("削除しますか？")) {
                savedWords = [];
                localStorage.setItem('savedWords', JSON.stringify(savedWords));
                displaySavedWords();
                updateSaveButton();
            }
        }

        function flipCard() {
            isFlipped = !isFlipped;
            if (isFlipped) {
                document.getElementById('cardFront').style.display = 'none';
                document.getElementById('cardBack').style.display = 'block';
                document.getElementById('flashcard').classList.add('flipped');
            } else {
                document.getElementById('cardFront').style.display = 'block';
                document.getElementById('cardBack').style.display = 'none';
                document.getElementById('flashcard').classList.remove('flipped');
            }
        }

        function nextCard() {
            if (currentIndex < allWords.length - 1) {
                currentIndex++;
                showCard();
            }
        }

        function prevCard() {
            if (currentIndex > 0) {
                currentIndex--;
                showCard();
            }
        }

        function toggleAutoPlay() {
            if (autoPlayInterval) {
                stopAutoPlay();
            } else {
                startAutoPlay();
            }
        }

        function startAutoPlay() {
            document.getElementById('autoPlayBtn').innerHTML = `<i class="fa-solid fa-pause"></i>`;
            autoPlayInterval = setInterval(() => {
                if (!isFlipped) {
                    flipCard();
                } else {
                    if (currentIndex < allWords.length - 1) {
                        nextCard();
                    } else {
                        stopAutoPlay();
                    }
                }
            }, autoPlaySpeed);
        }

        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
                document.getElementById('autoPlayBtn').innerHTML = `<i class="fa-solid fa-play"></i>`;
            }
        }

        function setSpeed(speed, buttonElement) {
            autoPlaySpeed = speed;
            
            document.querySelectorAll('.speed-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            buttonElement.classList.add('active');
            
            if (autoPlayInterval) {
                stopAutoPlay();
                startAutoPlay();
            }
        }

        function displayVocabulary() {
            let html = '';
            
            for (let i = 1; i <= 10; i++) {
                const key = `core${i}`;
                if (currentWord[key]) {
                    html += `<h3>CORE ${i}</h3>`;
                    html += '<table>';
                    html += '<tr><th>Number</th><th>Word</th><th>Reading</th><th>Korean</th><th>English</th><th>Example</th></tr>';
                    
                    currentWord[key].forEach((item, index) => {
                        html += '<tr>';
                        html += `<td>${(index + 1) + ((i - 1) * 100)}</td>`;
                        
                        if (currentMode === 'hideJapanese') {
                            html += `<td class="hidden" onclick="this.classList.toggle('hidden')">${item.word}</td>`;
                            html += `<td class="hidden" onclick="this.classList.toggle('hidden')">${item.reading}</td>`;
                            html += `<td>${item.korean}</td>`;
                            html += `<td>${item.meaning}</td>`;

                            if (currentSentence && currentSentence[item.word] && currentSentence[item.word].sentences)
                                html += `<td>${currentSentence[item.word].sentences}</td>`;
                        } else if (currentMode === 'hideMeaning') {
                            html += `<td>${item.word}</td>`;
                            html += `<td>${item.reading}</td>`;
                            html += `<td class="hidden" onclick="this.classList.toggle('hidden')">${item.korean}</td>`;
                            html += `<td class="hidden" onclick="this.classList.toggle('hidden')">${item.meaning}</td>`;
                            if (currentSentence && currentSentence[item.word] && currentSentence[item.word].sentences)
                                html += `<td>${currentSentence[item.word].sentences}</td>`;
                        } else {
                            html += `<td>${item.word}</td>`;
                            html += `<td>${item.reading}</td>`;
                            html += `<td>${item.korean}</td>`;
                            html += `<td>${item.meaning}</td>`;
                            if (currentSentence && currentSentence[item.word] && currentSentence[item.word].sentences)
                                html += `<td>${currentSentence[item.word].sentences}</td>`;
                        }
                        
                        html += '</tr>';
                    });
                    
                    html += '</table>';
                }
            }
            
            document.getElementById('table-view').innerHTML = html;
        }

        function playAudio(event) {
            if (event) {
                event.stopPropagation();
            }
            
            if (allWords.length === 0) return;
            
            const word = allWords[currentIndex];
            const utterance = new SpeechSynthesisUtterance(word.word);
            utterance.lang = 'ja-JP';
            utterance.rate = 1;
            
            if (japaneseVoice) {
                utterance.voice = japaneseVoice;
            }
            
            speechSynthesis.cancel();
            speechSynthesis.speak(utterance);
        }

        function playSentence(event) {
            const sentenceDiv = document.getElementById('example-sentences');
            const sentenceText = sentenceDiv.textContent.trim();
            
            if (!sentenceText) {
                console.log('No sentence to play');
                return;
            }
            
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(sentenceText);
            
            utterance.lang = 'ja-JP';
            utterance.rate = 1; 
            utterance.pitch = 1.0;

            const voices = window.speechSynthesis.getVoices();
            const japaneseVoice = voices.find(voice => voice.lang.startsWith('ja'));
            
            if (japaneseVoice) {
                utterance.voice = japaneseVoice;
            }
            
            const icon = document.getElementById('example-icon');
            
            utterance.onstart = () => {
                icon.style.color = '#00ad09ff';
            };
            
            utterance.onend = () => {
                icon.style.color = '';
            };
            
            utterance.onerror = (error) => {
                console.error('Speech synthesis error:', error);
                icon.style.color = '';
            };
            
            window.speechSynthesis.speak(utterance);
            }

            window.speechSynthesis.onvoiceschanged = () => {
            const voices = window.speechSynthesis.getVoices();
            console.log('Available voices:', voices.filter(v => v.lang.startsWith('ja')));
            };

            function setSentence(sentence) {
            const sentenceDiv = document.getElementById('example-sentences');
            sentenceDiv.textContent = sentence;
        }

        document.addEventListener('keydown', function(event) {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }
            
            if (event.code === 'Space') {
                event.preventDefault();
                if (currentMode === 'flashcard') {
                    toggleAutoPlay();
                }
            }
            else if (event.code === 'ArrowLeft') {
                event.preventDefault();
                if (currentMode === 'flashcard') {
                    prevCard();
                }
            }
            else if (event.code === 'ArrowRight') {
                event.preventDefault();
                if (currentMode === 'flashcard') {
                    nextCard();
                }
            }
            else if (event.code === 'Enter') {
                event.preventDefault();
                if (currentMode === 'flashcard') {
                    flipCard();
                }
            }
            else if (event.code === 'KeyB') {
                event.preventDefault();
                if (currentMode === 'flashcard') {
                    toggleSaveWord();
                }
            }
        });
         
        currentWord = core1000;
        currentSentence = sentence1000;
        prepareWordList();
        showCard();
        
        const storedWords = localStorage.getItem('savedWords');
        if (storedWords) {
            try {
                savedWords = JSON.parse(storedWords);
                displaySavedWords();
            } catch (e) {
                console.error('Error loading saved words:', e);
                savedWords = [];
            }
        }