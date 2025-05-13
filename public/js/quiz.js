/**
 * Quiz page with sign language recognition functionality
 * Handles webcam integration and communication with the backend
 */
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const webcamElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('canvas');
    const startQuizBtn = document.getElementById('start-quiz');
    const submitSignBtn = document.getElementById('submit-sign');
    const nextQuestionBtn = document.getElementById('next-question');
    const restartQuizBtn = document.getElementById('restart-quiz');
    const currentPromptElement = document.getElementById('current-prompt');
    const currentQuestionElement = document.getElementById('current-question');
    const totalQuestionsElement = document.getElementById('total-questions');
    const progressIndicator = document.querySelector('.progress-indicator');
    const countdownElement = document.getElementById('countdown');
    const feedbackElement = document.getElementById('feedback');
    const quizResultsElement = document.querySelector('.quiz-results');
    const scoreElement = document.getElementById('score');
    const maxScoreElement = document.getElementById('max-score');
    const resultMessageElement = document.getElementById('result-message');
    
    // Quiz state
    let stream = null;
    let currentQuestionIndex = 0;
    let score = 0;
    let questions = [];
    let isCapturing = false;
    let countdownTimer = null;
    let captureTimer = null;
    
    // Constants
    const API_URL = '/api/quiz'; // Backend API endpoint
    const COUNTDOWN_DURATION = 3; // Seconds
    const CAPTURE_DURATION = 3; // Seconds to capture frames
    const CAPTURE_INTERVAL = 300; // Milliseconds between captures (3 FPS)
    const MAX_FRAMES = 10; // Maximum number of frames to capture
    const IMAGE_QUALITY = 0.5; // JPEG quality (0.0-1.0)
    const IMAGE_SCALE = 0.5; // Scale factor for image size
    
    // Enable debug mode
    const DEBUG = true;
    
    // Debug logging function
    function debugLog(...args) {
        if (DEBUG) {
            console.log('[Quiz Debug]', ...args);
        }
    }
    
    // Initialize quiz
    function initQuiz() {
        // Quiz questions - updated to match the trained signs
        questions = [
            { prompt: "Show the sign for number 1", answer: "one" },
            { prompt: "Show the sign for number 2", answer: "two" },
            { prompt: "Show the sign for number 3", answer: "three" },
            { prompt: "Show the sign for letter A", answer: "a" },
            { prompt: "Show the sign for letter B", answer: "b" },
            { prompt: "Show the sign for letter C", answer: "c" }
        ];
        
        debugLog('Quiz initialized with questions:', questions);
        
        totalQuestionsElement.textContent = questions.length;
        maxScoreElement.textContent = questions.length;
        
        // Reset quiz state
        currentQuestionIndex = 0;
        score = 0;
        
        // Set up first question
        setCurrentQuestion();
    }
    
    // Update UI with current question
    function setCurrentQuestion() {
        const question = questions[currentQuestionIndex];
        currentPromptElement.textContent = question.prompt;
        currentQuestionElement.textContent = currentQuestionIndex + 1;
        
        // Update progress bar
        const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressIndicator.style.width = `${progressPercentage}%`;
        
        debugLog(`Current question: ${question.prompt} (answer: ${question.answer})`);
    }
    
    // Start webcam stream
    async function startWebcam() {
        try {
            // Stop any existing stream
            if (stream) {
                stopWebcam();
            }
            
            debugLog('Starting webcam...');
            
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
            
            debugLog('Webcam stream acquired successfully');
            
            return new Promise((resolve) => {
                webcamElement.onloadedmetadata = () => {
                    // Start playing the video
                    webcamElement.play().then(() => {
                        debugLog('Webcam video playback started');
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
            debugLog('Stopping webcam stream');
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
        const imageData = canvasElement.toDataURL('image/jpeg', IMAGE_QUALITY);
        debugLog('Image captured, size:', Math.round(imageData.length / 1024), 'KB');
        return imageData;
    }
    
    // Start capturing frames for sign recognition
    function startCapturing() {
        if (isCapturing) return;
        
        // Reset state
        isCapturing = true;
        let capturedFrames = [];
        
        debugLog('Starting capture sequence');
        
        // Display countdown
        let countdownSeconds = COUNTDOWN_DURATION;
        countdownElement.textContent = countdownSeconds;
        countdownElement.style.display = 'block';
        
        // Start countdown
        countdownTimer = setInterval(() => {
            countdownSeconds--;
            
            if (countdownSeconds <= 0) {
                clearInterval(countdownTimer);
                countdownElement.style.display = 'none';
                
                // Start capturing frames
                let captureSeconds = CAPTURE_DURATION;
                
                // Show recording indicator
                countdownElement.textContent = `Recording... ${captureSeconds}`;
                countdownElement.style.display = 'block';
                
                debugLog('Starting frame capture');
                
                // Capture frames at regular intervals
                captureTimer = setInterval(() => {
                    if (isCapturing && capturedFrames.length < MAX_FRAMES) {
                        const frame = captureImage();
                        if (frame) {
                            capturedFrames.push(frame);
                            debugLog(`Captured frame ${capturedFrames.length}/${MAX_FRAMES}`);
                        }
                    }
                }, CAPTURE_INTERVAL);
                
                // Count down capture duration
                const captureDurationTimer = setInterval(() => {
                    captureSeconds--;
                    countdownElement.textContent = `Recording... ${captureSeconds}`;
                    
                    if (captureSeconds <= 0) {
                        clearInterval(captureDurationTimer);
                        clearInterval(captureTimer);
                        countdownElement.style.display = 'none';
                        isCapturing = false;
                        
                        debugLog(`Capture complete. Captured ${capturedFrames.length} frames`);
                        
                        // Submit the captured frames
                        submitSign(capturedFrames);
                    }
                }, 1000);
            } else {
                countdownElement.textContent = countdownSeconds;
            }
        }, 1000);
    }
    
    // Submit captured frames to backend
    async function submitSign(frames) {
        try {
            if (frames.length === 0) {
                alert('No frames were captured. Please try again.');
                submitSignBtn.disabled = false;
                return;
            }
            
            debugLog(`Submitting ${frames.length} frames for analysis`);
            submitSignBtn.disabled = true;
            
            // Current question
            const question = questions[currentQuestionIndex];
            
            // Prepare data for API
            const data = {
                frames: frames,
                expectedSign: question.answer
            };
            
            // Show loading indicator
            feedbackElement.textContent = "Processing...";
            feedbackElement.className = 'feedback';
            feedbackElement.classList.add('visible');
            
            debugLog('Sending request to server endpoint:', API_URL);
            debugLog('Expected sign:', question.answer);
            
            // Send to backend
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                debugLog('Server response error:', response.status, errorText);
                throw new Error(`Server responded with status: ${response.status}. ${errorText}`);
            }
            
            const result = await response.json();
            debugLog('Recognition result:', result);
            
            // Display feedback
            showFeedback(result.isCorrect, result.predictedSign, result.confidence);
            
            // Update score if correct
            if (result.isCorrect) {
                score++;
                debugLog('Score increased to', score);
            }
            
            // Enable next question button
            nextQuestionBtn.style.display = 'inline-block';
            submitSignBtn.disabled = true;
            
        } catch (error) {
            console.error('Error submitting sign:', error);
            debugLog('Detailed error:', error.stack || error);
            
            // Show error in feedback
            feedbackElement.textContent = "Failed to analyze sign. Please try again.";
            feedbackElement.className = 'feedback incorrect';
            feedbackElement.classList.add('visible');
            
            submitSignBtn.disabled = false;
        }
    }
    
    // Show feedback
    function showFeedback(isCorrect, predictedSign, confidence) {
        // Format confidence as percentage
        const confidencePercent = Math.round(confidence * 100);
        
        // Create feedback message
        let message;
        if (isCorrect) {
            message = `Correct! (${confidencePercent}% confident)`;
        } else {
            message = `Incorrect. System detected "${predictedSign}" (${confidencePercent}% confident)`;
        }
        
        debugLog('Showing feedback:', message);
        
        // Show feedback
        feedbackElement.textContent = message;
        feedbackElement.className = 'feedback ' + (isCorrect ? 'correct' : 'incorrect');
        feedbackElement.classList.add('visible');
    }
    
    // Move to next question
    function nextQuestion() {
        debugLog('Moving to next question');
        feedbackElement.classList.remove('visible');
        currentQuestionIndex++;
        
        if (currentQuestionIndex < questions.length) {
            // More questions remain
            setCurrentQuestion();
            submitSignBtn.disabled = false;
            nextQuestionBtn.style.display = 'none';
        } else {
            // End of quiz
            endQuiz();
        }
    }
    
    // End quiz and show results
    function endQuiz() {
        debugLog('Quiz completed. Final score:', score);
        
        // Stop webcam
        stopWebcam();
        
        // Update score
        scoreElement.textContent = score;
        
        // Calculate percentage
        const percentage = (score / questions.length) * 100;
        
        // Determine message based on score
        let message;
        if (percentage >= 80) {
            message = 'Excellent! You have great sign language skills!';
        } else if (percentage >= 60) {
            message = 'Good job! Keep practicing to improve.';
        } else {
            message = 'Keep practicing. You\'ll get better with time!';
        }
        
        resultMessageElement.textContent = message;
        
        // Show results panel
        document.querySelector('.webcam-container').style.display = 'none';
        document.querySelector('.quiz-progress').style.display = 'none';
        document.querySelector('.quiz-prompt').style.display = 'none';
        quizResultsElement.style.display = 'block';
    }
    
    // Cancel ongoing capture
    function cancelCapture() {
        if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
        }
        
        if (captureTimer) {
            clearInterval(captureTimer);
            captureTimer = null;
        }
        
        countdownElement.style.display = 'none';
        isCapturing = false;
        debugLog('Capture canceled');
    }
    
    // Event Listeners
    startQuizBtn.addEventListener('click', async () => {
        try {
            startQuizBtn.disabled = true;
            startQuizBtn.textContent = 'Starting...';
            
            await startWebcam();
            initQuiz();
            
            startQuizBtn.style.display = 'none';
            submitSignBtn.disabled = false;
            
        } catch (error) {
            console.error('Error starting quiz:', error);
            startQuizBtn.disabled = false;
            startQuizBtn.textContent = 'Start Quiz';
        }
    });
    
    submitSignBtn.addEventListener('click', () => {
        if (!isCapturing) {
            startCapturing();
        }
    });
    
    nextQuestionBtn.addEventListener('click', nextQuestion);
    
    restartQuizBtn.addEventListener('click', () => {
        // Reset UI
        document.querySelector('.webcam-container').style.display = 'block';
        document.querySelector('.quiz-progress').style.display = 'block';
        document.querySelector('.quiz-prompt').style.display = 'block';
        quizResultsElement.style.display = 'none';
        
        // Reset buttons
        submitSignBtn.disabled = false;
        nextQuestionBtn.style.display = 'none';
        startQuizBtn.style.display = 'inline-block';
        startQuizBtn.disabled = false;
        startQuizBtn.textContent = 'Start Quiz';
        
        // Cancel any ongoing capture
        cancelCapture();
        
        debugLog('Quiz restarted');
    });
    
    // Handle page visibility changes to properly clean up
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            cancelCapture();
        }
    });
    
    // Handle page unload to clean up resources
    window.addEventListener('beforeunload', () => {
        stopWebcam();
    });
});