/**
 * Numbers and Letters Sign Recognition functionality
 * Handles webcam integration and communication with the recognition API
 */
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const webcamElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('canvas');
    const startCameraBtn = document.getElementById('start-camera');
    const startRecognitionBtn = document.getElementById('start-recognition');
    const stopRecognitionBtn = document.getElementById('stop-recognition');
    const detectedSignElement = document.getElementById('detected-sign');
    const confidenceLevelElement = document.getElementById('confidence-level');
    const recordingIndicator = document.getElementById('recording-indicator');
    const historyListElement = document.getElementById('history-list');
    const framesCountElement = document.getElementById('frames-count');
    const framesProgressElement = document.getElementById('frames-progress');
    
    // State variables
    let stream = null;
    let isRecognizing = false;
    let recognitionTimer = null;
    let captureTimer = null;
    let recognitionHistory = [];
    let landmarks = [];
    
    // Constants
    const API_URL = '/api/recognize'; // Recognition API endpoint
    const CAPTURE_INTERVAL = 100; // Milliseconds between captures (10 FPS)
    const MAX_FRAMES = 30; // Maximum number of frames to capture
    const IMAGE_QUALITY = 0.6; // JPEG quality (0.0-1.0)
    const IMAGE_SCALE = 0.5; // Scale factor for image size
    const HISTORY_MAX_LENGTH = 10; // Maximum number of history items to keep
    const RECOGNITION_INTERVAL = 1000; // Milliseconds between recognition attempts
    
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
    
    // Start recognition process
    function startRecognition() {
        if (isRecognizing) return;
        
        isRecognizing = true;
        landmarks = [];
        
        // Update UI
        startRecognitionBtn.style.display = 'none';
        stopRecognitionBtn.style.display = 'inline-block';
        recordingIndicator.classList.add('visible');
        framesCountElement.textContent = "0";
        framesProgressElement.style.width = "0%";
        
        // Start capturing frames
        captureTimer = setInterval(() => {
            if (isRecognizing && landmarks.length < MAX_FRAMES) {
                const frame = captureImage();
                if (frame) {
                    landmarks.push(frame);
                    
                    // Update frames counter
                    framesCountElement.textContent = landmarks.length;
                    const progress = (landmarks.length / MAX_FRAMES) * 100;
                    framesProgressElement.style.width = `${progress}%`;
                }
            }
            
            // If enough frames, submit for recognition
            if (landmarks.length >= MAX_FRAMES) {
                submitForRecognition();
                landmarks = []; // Reset for next batch
                framesCountElement.textContent = "0";
                framesProgressElement.style.width = "0%";
            }
        }, CAPTURE_INTERVAL);
        
        // Set up regular recognition if we have enough frames
        recognitionTimer = setInterval(() => {
            if (landmarks.length >= MAX_FRAMES * 0.5) { // If we have at least 50% of frames
                submitForRecognition();
                landmarks = []; // Reset for next batch
                framesCountElement.textContent = "0";
                framesProgressElement.style.width = "0%";
            }
        }, RECOGNITION_INTERVAL);
    }
    
    // Stop recognition process
    function stopRecognition() {
        isRecognizing = false;
        landmarks = [];
        
        // Clear timers
        if (captureTimer) {
            clearInterval(captureTimer);
            captureTimer = null;
        }
        
        if (recognitionTimer) {
            clearInterval(recognitionTimer);
            recognitionTimer = null;
        }
        
        // Update UI
        startRecognitionBtn.style.display = 'inline-block';
        stopRecognitionBtn.style.display = 'none';
        recordingIndicator.classList.remove('visible');
        framesCountElement.textContent = "0";
        framesProgressElement.style.width = "0%";
    }
    
    // Submit frames for recognition
    async function submitForRecognition() {
        try {
            if (landmarks.length === 0) {
                console.warn('No frames to process');
                return;
            }
            
            console.log(`Submitting ${landmarks.length} frames for recognition`);
            
            // Prepare data for API
            const data = {
                frames: landmarks
            };
            
            // Show loading state
            detectedSignElement.textContent = "Detecting...";
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
            console.log('Recognition result:', result);
            
            // Update UI with result
            updateRecognitionResult(result);
            
        } catch (error) {
            console.error('Error recognizing sign:', error);
            detectedSignElement.textContent = "Error";
            confidenceLevelElement.textContent = "Please try again";
        }
    }
    
    // Update UI with recognition result
    function updateRecognitionResult(result) {
        // Format the detected sign for display
        let displaySign = result.detected_sign;
        
        // Special formatting for numbers and letters
        if (displaySign === 'one') displaySign = '1';
        else if (displaySign === 'two') displaySign = '2';
        else if (displaySign === 'three') displaySign = '3';
        else if (displaySign === 'a' || displaySign === 'b' || displaySign === 'c') {
            displaySign = displaySign.toUpperCase();
        }
        
        // Update detected sign
        detectedSignElement.textContent = displaySign;
        
        // Update confidence level
        const confidencePercent = Math.round(result.confidence * 100);
        confidenceLevelElement.textContent = `Confidence: ${confidencePercent}%`;
        
        // Only add to history if we have a valid sign (not unknown) with decent confidence
        if (result.detected_sign !== 'unknown' && result.confidence > 0.6) {
            // Add to history
            addToRecognitionHistory(result, displaySign);
        }
    }
    
    // Add recognition to history
    function addToRecognitionHistory(result, displaySign) {
        // Create timestamp
        const now = new Date();
        const timestamp = now.toLocaleTimeString();
        
        // Create history item
        const historyItem = {
            sign: result.detected_sign,
            displaySign: displaySign,
            confidence: result.confidence,
            timestamp: timestamp
        };
        
        // Add to history array
        recognitionHistory.unshift(historyItem);
        
        // Limit history length
        if (recognitionHistory.length > HISTORY_MAX_LENGTH) {
            recognitionHistory.pop();
        }
        
        // Update history UI
        updateHistoryUI();
    }
    
    // Update history list in UI
    function updateHistoryUI() {
        // Clear current list
        historyListElement.innerHTML = '';
        
        // Add each history item
        recognitionHistory.forEach(item => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span class="sign">${item.displaySign}</span>
                (${Math.round(item.confidence * 100)}%)
                <span class="time">${item.timestamp}</span>
            `;
            historyListElement.appendChild(listItem);
        });
        
        // Show message if no history
        if (recognitionHistory.length === 0) {
            const listItem = document.createElement('li');
            listItem.textContent = 'No recognitions yet';
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
            startRecognitionBtn.disabled = false;
            
        } catch (error) {
            console.error('Error starting camera:', error);
            startCameraBtn.disabled = false;
            startCameraBtn.textContent = 'Start Camera';
        }
    });
    
    startRecognitionBtn.addEventListener('click', () => {
        startRecognition();
    });
    
    stopRecognitionBtn.addEventListener('click', () => {
        stopRecognition();
    });
    
    // Handle page visibility changes to properly clean up
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            stopRecognition();
        }
    });
    
    // Handle page unload to clean up resources
    window.addEventListener('beforeunload', () => {
        stopWebcam();
    });
    
    // Initialize the history UI
    updateHistoryUI();
});