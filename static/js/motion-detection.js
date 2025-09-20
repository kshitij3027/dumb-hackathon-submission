// Motion Detection System for Tongue-Controlled Fighting Game
import { handleTongueMovement, handleHeadTilt } from './Keys.js';
import { player } from './Fighter.js';

// Global variables
let faceMesh;
let camera;
let isMotionDetectionActive = false;
let lastTongueDirection = 'neutral';
let lastHeadDirection = 'neutral';
let sensitivity = 0.5; // Medium sensitivity

// DOM elements
const motionVideo = document.getElementById('motionVideo');
const motionCanvas = document.getElementById('motionCanvas');
const motionCtx = motionCanvas.getContext('2d');
const headPoseStatus = document.getElementById('headPoseStatus');
const tongueStatus = document.getElementById('tongueStatus');
const gameAction = document.getElementById('gameAction');

// Initialize motion detection
export async function initializeMotionDetection() {
    try {
        console.log('🎯 Initializing motion detection...');

        // Set up canvas
        motionCanvas.width = 300;
        motionCanvas.height = 200;

        // Initialize MediaPipe Face Mesh
        faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });

        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        faceMesh.onResults(onFaceMeshResults);

        // Initialize camera
        camera = new Camera(motionVideo, {
            onFrame: async () => {
                if (isMotionDetectionActive) {
                    await faceMesh.send({ image: motionVideo });
                }
            },
            width: 640,
            height: 480
        });

        await camera.start();
        isMotionDetectionActive = true;

        console.log('✅ Motion detection initialized successfully');
        updateStatus('Head Pose: Ready', 'Tongue: Ready', 'Calibrating...');

    } catch (error) {
        console.error('❌ Error initializing motion detection:', error);
        updateStatus('Head Pose: Error', 'Tongue: Error', 'Camera access failed');
    }
}

// Process face mesh results
function onFaceMeshResults(results) {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        updateStatus('Head Pose: No face detected', 'Tongue: No face detected', 'Show your face to camera');
        return;
    }

    const landmarks = results.multiFaceLandmarks[0];

    // Clear canvas
    motionCtx.clearRect(0, 0, motionCanvas.width, motionCanvas.height);

    // Draw face landmarks (simplified)
    drawFaceLandmarks(landmarks);

    // Detect head pose
    const headDirection = detectHeadPose(landmarks);

    // Detect tongue movement (using mouth landmarks)
    const tongueDirection = detectTongueMovement(landmarks);

    // Update game controls
    updateGameControls(tongueDirection, headDirection);

    // Update UI
    updateStatus(
        `Head Pose: ${headDirection}`,
        `Tongue: ${tongueDirection}`,
        getGameAction(tongueDirection, headDirection)
    );
}

// Detect head pose using face landmarks
function detectHeadPose(landmarks) {
    // Use nose tip (landmark 1) and face outline points to determine head tilt
    const noseTip = landmarks[1];
    const leftCheek = landmarks[234];
    const rightCheek = landmarks[454];

    // Calculate head tilt based on cheek position relative to nose
    const leftDistance = Math.abs(noseTip.x - leftCheek.x);
    const rightDistance = Math.abs(noseTip.x - rightCheek.x);

    const tiltThreshold = sensitivity * 0.02; // Adjust based on sensitivity

    if (leftDistance - rightDistance > tiltThreshold) {
        return 'left';
    } else if (rightDistance - leftDistance > tiltThreshold) {
        return 'right';
    } else {
        return 'neutral';
    }
}

// Detect tongue movement using mouth landmarks
function detectTongueMovement(landmarks) {
    // Inner mouth landmarks for tongue detection
    const upperLip = landmarks[13]; // Upper lip center
    const lowerLip = landmarks[14]; // Lower lip center
    const leftMouth = landmarks[61]; // Left mouth corner
    const rightMouth = landmarks[291]; // Right mouth corner

    // Calculate mouth opening
    const mouthHeight = Math.abs(upperLip.y - lowerLip.y);
    const mouthWidth = Math.abs(leftMouth.x - rightMouth.x);

    // Mouth aspect ratio for open detection
    const mouthAspectRatio = mouthHeight / mouthWidth;

    // Check if mouth is open enough for tongue detection
    if (mouthAspectRatio < sensitivity * 0.3) {
        return 'neutral'; // Mouth not open enough
    }

    // Detect tongue direction using inner mouth region analysis
    // This is a simplified approach - in reality, tongue detection is more complex
    const mouthCenter = {
        x: (leftMouth.x + rightMouth.x) / 2,
        y: (upperLip.y + lowerLip.y) / 2
    };

    // Use the lowest point in mouth region as tongue tip approximation
    let lowestPoint = upperLip;
    for (let i = 61; i <= 68; i++) { // Inner mouth landmarks
        if (landmarks[i] && landmarks[i].y > lowestPoint.y) {
            lowestPoint = landmarks[i];
        }
    }

    // Determine direction based on tongue tip position
    const horizontalThreshold = sensitivity * 0.02;
    const verticalThreshold = sensitivity * 0.03;

    const horizontalOffset = lowestPoint.x - mouthCenter.x;
    const verticalOffset = lowestPoint.y - mouthCenter.y;

    if (verticalOffset > verticalThreshold) {
        return 'up'; // Tongue pointing up (relative to mouth)
    } else if (horizontalOffset > horizontalThreshold) {
        return 'right';
    } else if (horizontalOffset < -horizontalThreshold) {
        return 'left';
    } else {
        return 'neutral';
    }
}

// Draw simplified face landmarks on canvas
function drawFaceLandmarks(landmarks) {
    motionCtx.fillStyle = '#00ff00';
    motionCtx.strokeStyle = '#00ff00';
    motionCtx.lineWidth = 1;

    // Draw face outline
    const faceOutline = [10, 151, 9, 8, 107, 55, 21, 162, 127, 142, 36, 205, 206, 207, 213, 192, 147, 123, 116, 117, 118, 119, 120, 121, 128, 126, 142, 36, 205, 206, 207, 213, 192, 147, 123, 116, 117, 118, 119, 120, 121, 128, 126];

    motionCtx.beginPath();
    for (let i = 0; i < faceOutline.length; i++) {
        const point = landmarks[faceOutline[i]];
        if (point) {
            const x = point.x * motionCanvas.width;
            const y = point.y * motionCanvas.height;

            if (i === 0) {
                motionCtx.moveTo(x, y);
            } else {
                motionCtx.lineTo(x, y);
            }
        }
    }
    motionCtx.stroke();

    // Draw mouth region
    motionCtx.fillStyle = '#ff0000';
    const mouthPoints = [61, 291, 14, 13]; // Key mouth points
    mouthPoints.forEach(index => {
        const point = landmarks[index];
        if (point) {
            const x = point.x * motionCanvas.width;
            const y = point.y * motionCanvas.height;
            motionCtx.beginPath();
            motionCtx.arc(x, y, 2, 0, 2 * Math.PI);
            motionCtx.fill();
        }
    });

    // Draw nose tip
    motionCtx.fillStyle = '#0000ff';
    const noseTip = landmarks[1];
    if (noseTip) {
        const x = noseTip.x * motionCanvas.width;
        const y = noseTip.y * motionCanvas.height;
        motionCtx.beginPath();
        motionCtx.arc(x, y, 3, 0, 2 * Math.PI);
        motionCtx.fill();
    }
}

// Update game controls based on detected motions
function updateGameControls(tongueDirection, headDirection) {
    // Handle tongue movement for character control
    if (tongueDirection !== lastTongueDirection) {
        handleTongueMovement(tongueDirection, player);
        lastTongueDirection = tongueDirection;
    }

    // Handle head tilt for attacks
    if (headDirection !== lastHeadDirection) {
        handleHeadTilt(headDirection, player);
        lastHeadDirection = headDirection;
    }
}

// Get current game action description
function getGameAction(tongueDirection, headDirection) {
    if (tongueDirection === 'left') return 'Moving Left';
    if (tongueDirection === 'right') return 'Moving Right';
    if (tongueDirection === 'up') return 'Jumping';
    if (headDirection === 'left') return 'Attack 1';
    if (headDirection === 'right') return 'Attack 2';
    return 'Idle';
}

// Update status display
function updateStatus(headText, tongueText, actionText) {
    headPoseStatus.textContent = headText;
    tongueStatus.textContent = tongueText;
    gameAction.textContent = actionText;
}

// Sensitivity adjustment
window.adjustSensitivity = function(direction) {
    if (direction === 'increase' && sensitivity < 1.0) {
        sensitivity += 0.1;
    } else if (direction === 'decrease' && sensitivity > 0.1) {
        sensitivity -= 0.1;
    }

    const level = sensitivity < 0.3 ? 'Low' : sensitivity < 0.7 ? 'Medium' : 'High';
    document.getElementById('sensitivityLevel').textContent = level;
    console.log('Sensitivity adjusted to:', sensitivity.toFixed(1));
};

// Calibration function
window.calibrateMotion = function() {
    console.log('🎯 Recalibrating motion detection...');
    lastTongueDirection = 'neutral';
    lastHeadDirection = 'neutral';
    updateStatus('Head Pose: Calibrating...', 'Tongue: Calibrating...', 'Recalibrating...');

    setTimeout(() => {
        updateStatus('Head Pose: Ready', 'Tongue: Ready', 'Calibration complete');
    }, 2000);
};

// Initialize when page loads
window.addEventListener('load', () => {
    setTimeout(() => {
        initializeMotionDetection();
    }, 1000); // Wait for other scripts to load
});