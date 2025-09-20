export const keys = {
    // Player (controlled by tongue/head motion).
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    w: {    // Since there is gravity, when the player jumps it will slowly start to fall.
        pressed: false,
    },
    // Motion control states
    tongueLeft: {
        pressed: false
    },
    tongueRight: {
        pressed: false
    },
    tongueUp: {
        pressed: false
    },
    headTiltLeft: {
        pressed: false
    },
    headTiltRight: {
        pressed: false
    }
}

export function loadKeyDownEvents(player, enemy) {
    // Whenever a key is pressed.
    window.addEventListener('keydown', (event) => {
        event.preventDefault(); // Prevent any keys' default behaviour i.e using the arrow keys to navigate the page.
        switch (event.key) {
            // Player keys.
            case 'd':
                player.keys.d.pressed = true;
                player.lastKey = 'd';
                break;
            case 'a':
                player.keys.a.pressed = true;
                player.lastKey = 'a';
                break;
            case 'w':
                if (!player.inTheAir) {  // Can only jump if it's not in the air.
                    player.velocity.y = -player.moveFactor * 4;
                }
                break;
            case ' ':   // Player attack with space bar.
                player.isAttacking = true;
                player.lastKey = ' ';
                break;


            // Fallback keyboard controls (for testing)
            case 'ArrowRight':
                if (window.fallbackKeysEnabled) {
                    player.keys.d.pressed = true;
                    player.lastKey = 'd';
                }
                break;
            case 'ArrowLeft':
                if (window.fallbackKeysEnabled) {
                    player.keys.a.pressed = true;
                    player.lastKey = 'a';
                }
                break;
            case 'ArrowUp':
                if (window.fallbackKeysEnabled && !player.inTheAir) {
                    player.velocity.y = -player.moveFactor * 4;
                }
                break;
            case 'Control':
                if (window.fallbackKeysEnabled) {
                    player.isAttacking = true;
                    player.lastKey = ' ';
                }
                break;
        }
    });
}

export function loadkeyUpEvents(player, enemy) {
    // Whenever a key is lifted.
    window.addEventListener('keyup', (event) => {
        switch (event.key) {
            // Player.
            case 'd':
                player.keys.d.pressed = false;
                break;
            case 'a':
                player.keys.a.pressed = false;
                break;
            // Fallback keys
            case 'ArrowRight':
                if (window.fallbackKeysEnabled) {
                    player.keys.d.pressed = false;
                }
                break;
            case 'ArrowLeft':
                if (window.fallbackKeysEnabled) {
                    player.keys.a.pressed = false;
                }
                break;
        }
    });
}

// Motion control functions
export function handleTongueMovement(direction, player) {
    // Reset all tongue movements
    keys.tongueLeft.pressed = false;
    keys.tongueRight.pressed = false;
    keys.tongueUp.pressed = false;

    switch (direction) {
        case 'left':
            keys.tongueLeft.pressed = true;
            player.keys.a.pressed = true;
            player.lastKey = 'a';
            break;
        case 'right':
            keys.tongueRight.pressed = true;
            player.keys.d.pressed = true;
            player.lastKey = 'd';
            break;
        case 'up':
            keys.tongueUp.pressed = true;
            if (!player.inTheAir) {
                player.velocity.y = -player.moveFactor * 4;
            }
            break;
        case 'neutral':
            player.keys.a.pressed = false;
            player.keys.d.pressed = false;
            break;
    }
}

export function handleHeadTilt(direction, player) {
    // Reset all head tilts
    keys.headTiltLeft.pressed = false;
    keys.headTiltRight.pressed = false;

    switch (direction) {
        case 'left':
            keys.headTiltLeft.pressed = true;
            player.isAttacking = true;
            player.lastKey = ' ';
            break;
        case 'right':
            keys.headTiltRight.pressed = true;
            player.isAttacking = true;
            player.lastKey = ' ';
            break;
        case 'neutral':
            // No action for neutral head position
            break;
    }
}

// Global variables for motion control
window.fallbackKeysEnabled = false;

// Functions to toggle features
window.toggleFallbackKeys = function() {
    window.fallbackKeysEnabled = !window.fallbackKeysEnabled;
    console.log('Fallback keys:', window.fallbackKeysEnabled ? 'enabled' : 'disabled');
};
