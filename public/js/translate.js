/**
 * Sign Language Translation functionality
 * Handles webcam integration and communication with the translation API
 * Modified to support 3 basic signs only
 */
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const webcamElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('canvas');
    const startCameraBtn = document.getElementById('start-camera');
    const startTranslateBtn = document.getElementById('start-translate');
    const stopTranslateBtn = document.getElementById('stop-translate');
    const targetLanguageSelect = document.getElementById('target-language');
    const detectedSignElement = document.getElementById('detected-sign');
    const confidenceLevelElement = document.getElementById('confidence-level');
    const translationResultElement = document.getElementById('translation-result');
    const recordingIndicator = document.getElementById('recording-indicator');
    const historyListElement = document.getElementById('history-list');
    
    // State variables
    let stream = null;
    let isTranslating = false;
    let translationTimer = null;
    let captureTimer = null;
    let translationHistory = [];
    
    // Constants
    const API_URL = '/api/translate'; // Translation API endpoint
    const CAPTURE_INTERVAL = 300; // Milliseconds between captures (3 FPS)
    const MAX_FRAMES = 8; // Maximum number of frames to capture (reduced from 10)
    const IMAGE_QUALITY = 0.5; // JPEG quality (0.0-1.0)
    const IMAGE_SCALE = 0.5; // Scale factor for image size
    const HISTORY_MAX_LENGTH = 5; // Maximum number of history items to keep (reduced from 10)
    
    // Start webcam stream
    async function startWebcam() {
        try {
            // Stop any existing stream
            if (stream) {
                stopWebcam();
            }
            
            // Request camera with lower resolution for performance
            const constraints = {
                video: {
                    width: { ideal: 320 },  // Lower resolution
                    height: { ideal: 240 }, // Lower resolution
                    facingMode: 'user',
                    frameRate: { ideal: 15 } // Lower frame rate
                }
            };
            
            // Get user media
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            webcamElement.srcObject = stream;
            
            return new Promise((resolve) => {
                webcamElement.onloadedmetadata = () => {
                    // Start playing the video
                    webcamElement.play().then(() => {
                        resolve();
                    }).catch(error => {
                        console.error('Error playing video:', error);
                        resolve(); // Resolve anyway to continue
                    });
                };
            });
        } catch (error) {
            console.error('Error accessing webcam:', error);
            alert('Unable to access the webcam. Please make sure you have a webcam connected and have granted permission to use it.');
            throw error;
        }
    }
    
    // Stop webcam stream
    function stopWebcam() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            webcamElement.srcObject = null;
            stream = null;
        }
    }
    
    // Capture image from webcam with size reduction
    function captureImage() {
        // Check if webcam is ready
        if (!webcamElement.videoWidth) {
            console.warn('Webcam not ready yet');
            return null;
        }
        
        // Calculate new dimensions (scaled down)
        const scaledWidth = webcamElement.videoWidth * IMAGE_SCALE;
        const scaledHeight = webcamElement.videoHeight * IMAGE_SCALE;
        
        // Set canvas dimensions to the scaled size
        canvasElement.width = scaledWidth;
        canvasElement.height = scaledHeight;
        
        // Draw the video frame to the canvas, scaled down
        const context = canvasElement.getContext('2d');
        context.drawImage(webcamElement, 0, 0, scaledWidth, scaledHeight);
        
        // Convert canvas to base64 image with reduced quality
        return canvasElement.toDataURL('image/jpeg', IMAGE_QUALITY);
    }
    
    // Start translation process
    function startTranslation() {
        if (isTranslating) return;
        
        isTranslating = true;
        let capturedFrames = [];
        
        // Update UI
        startTranslateBtn.style.display = 'none';
        stopTranslateBtn.style.display = 'inline-block';
        recordingIndicator.classList.add('visible');
        
        // Start capturing frames
        captureTimer = setInterval(() => {
            if (isTranslating && capturedFrames.length < MAX_FRAMES) {
                const frame = captureImage();
                if (frame) {
                    capturedFrames.push(frame);
                }
            }
            
            // If enough frames, submit for translation
            if (capturedFrames.length >= MAX_FRAMES) {
                submitForTranslation(capturedFrames);
                capturedFrames = []; // Reset for next batch
            }
        }, CAPTURE_INTERVAL);
        
        // Set up regular translation
        translationTimer = setInterval(() => {
            if (capturedFrames.length > 0) {
                submitForTranslation(capturedFrames);
                capturedFrames = []; // Reset for next batch
            }
        }, 2000); // Submit every 2 seconds
    }
    
    // Stop translation process
    function stopTranslation() {
        isTranslating = false;
        
        // Clear timers
        if (captureTimer) {
            clearInterval(captureTimer);
            captureTimer = null;
        }
        
        if (translationTimer) {
            clearInterval(translationTimer);
            translationTimer = null;
        }
        
        // Update UI
        startTranslateBtn.style.display = 'inline-block';
        stopTranslateBtn.style.display = 'none';
        recordingIndicator.classList.remove('visible');
    }
    
    // Submit frames for translation
    async function submitForTranslation(frames) {
        try {
            if (frames.length === 0) {
                console.warn('No frames to translate');
                return;
            }
            
            console.log(`Submitting ${frames.length} frames for translation`);
            
            // Get selected language
            const targetLanguage = targetLanguageSelect.value;
            
            // Prepare data for API
            const data = {
                frames: frames,
                language: targetLanguage
            };
            
            // Show loading state
            detectedSignElement.textContent = "Detecting...";
            translationResultElement.textContent = "Translating...";
            confidenceLevelElement.textContent = "";
            
            // Send to backend
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Translation result:', result);
            
            // Update UI with result
            updateTranslationResult(result);
            
        } catch (error) {
            console.error('Error translating sign:', error);
            detectedSignElement.textContent = "Error";
            translationResultElement.textContent = "Translation failed";
            confidenceLevelElement.textContent = "Please try again";
        }
    }
    
    // Update UI with translation result
    function updateTranslationResult(result) {
        // Update detected sign
        detectedSignElement.textContent = result.detected_sign.charAt(0).toUpperCase() + result.detected_sign.slice(1);
        
        // Update confidence level
        const confidencePercent = Math.round(result.confidence * 100);
        confidenceLevelElement.textContent = `Confidence: ${confidencePercent}%`;
        
        // Update translation
        translationResultElement.textContent = result.translation;
        
        // Only add to history if we have a valid sign (not unknown)
        if (result.detected_sign !== 'unknown' && result.confidence > 0.5) {
            // Add to history
            addToTranslationHistory(result);
        }
    }
    
    // Add translation to history
    function addToTranslationHistory(result) {
        // Create timestamp
        const now = new Date();
        const timestamp = now.toLocaleTimeString();
        
        // Create history item
        const historyItem = {
            sign: result.detected_sign,
            translation: result.translation,
            language: result.language,
            confidence: result.confidence,
            timestamp: timestamp
        };
        
        // Add to history array
        translationHistory.unshift(historyItem);
        
        // Limit history length
        if (translationHistory.length > HISTORY_MAX_LENGTH) {
            translationHistory.pop();
        }
        
        // Update history UI
        updateHistoryUI();
    }
    
    // Update history list in UI
    function updateHistoryUI() {
        // Clear current list
        historyListElement.innerHTML = '';
        
        // Add each history item
        translationHistory.forEach(item => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span class="sign">${item.sign.charAt(0).toUpperCase() + item.sign.slice(1)}</span>: 
                ${item.translation} 
                <span class="time">${item.timestamp}</span>
            `;
            historyListElement.appendChild(listItem);
        });
        
        // Show message if no history
        if (translationHistory.length === 0) {
            const listItem = document.createElement('li');
            listItem.textContent = 'No translations yet';
            historyListElement.appendChild(listItem);
        }
    }
    
    // Event Listeners
    startCameraBtn.addEventListener('click', async () => {
        try {
            startCameraBtn.disabled = true;
            startCameraBtn.textContent = 'Starting...';
            
            await startWebcam();
            
            startCameraBtn.textContent = 'Camera Active';
            startTranslateBtn.disabled = false;
            
        } catch (error) {
            console.error('Error starting camera:', error);
            startCameraBtn.disabled = false;
            startCameraBtn.textContent = 'Start Camera';
        }
    });
    
    startTranslateBtn.addEventListener('click', () => {
        startTranslation();
    });
    
    stopTranslateBtn.addEventListener('click', () => {
        stopTranslation();
    });
    
    targetLanguageSelect.addEventListener('change', () => {
        // If we have history, update translations
        if (translationHistory.length > 0 && detectedSignElement.textContent !== "---") {
            // Re-translate the current sign
            const currentSign = detectedSignElement.textContent.toLowerCase();
            submitForTranslation([captureImage()]); // Just capture one frame to trigger a translation
        }
    });
    
    // Handle page visibility changes to properly clean up
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            stopTranslation();
        }
    });
    
    // Handle page unload to clean up resources
    window.addEventListener('beforeunload', () => {
        stopWebcam();
    });
    
    // Initialize the history UI
    updateHistoryUI();
});