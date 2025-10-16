/***********************
 * The Silent Study Tile - Assignment 1
 * 
 * Instructions:
 * Press A once to power ON. For 5s after power-on, extra A taps set # of study blocks.
 * Each block starts with an intro animation, then a one second delay and then the start of the study block.
 * Once each block finishes there is an outro animation followed by a checkmark signifying the study block being over.
 * If it was the last block then the device turns off otherwise the next block will start in 5 minutes.
 * If the Noise level ≥ threshold, then show X and beep (study block time paused) until the noise level is reduced 
 * 
 * During a study block can press A to turn the power off and end the session
 * Can also press B to pause the session (study block time paused)
 * 
 * For the Demo each minute will be 0.5 seconds
 * Thus each light will go out after 0.5 seconds and the break will be 2.5 seconds
 ***********************/


// Configuration
const TOTAL_STEPS = 25
let TICK_MS = 500                    // 0.5 seconds for demo
let noiseThresh = 100                // 0–255 soundLevel threshold, 100 arbitrary value
const POST_INTRO_DELAY_MS = 1000     // 1 s gap after intro
const PRE_CHECKMARK_DELAY_MS = 1000  // 1 s gap before checkmark
let BREAK_MS = 2500                  // 2.5 second break for demo
const TAP_WINDOW_MS = 5000           // 5 s to count extra A taps
const MAX_BLOCKS = 10                // To prevent accidental addition of blocks

// State
let poweredOn = false
let running = false
let paused = false
let stepIndex = 0
let noisy = false
let beepedThisNoise = false
let inIntroAnim = false
let inOutroAnim = false
let inBreak = false

// For maintanence of study blocks
let inTapWindow = false
let tapCount = 0
let blocksRemaining = 0

// Sounds
function startChime() {
    music.playTone(Note.D, music.beat(BeatFraction.Sixteenth))
    music.playTone(Note.G, music.beat(BeatFraction.Sixteenth))
}
function endChime() {
    music.playTone(Note.D, music.beat(BeatFraction.Sixteenth))
    music.playTone(Note.G, music.beat(BeatFraction.Sixteenth))
}
function nagBeep() { music.playTone(Note.C, music.beat(BeatFraction.Sixteenth)) }

// LED Functions
function xyFromIndex(i: number): number[] {
    const x = i % 5
    const y = Math.idiv(i, 5)
    return [x, y]
}
function showProgress() {
    basic.clearScreen()
    for (let i = stepIndex; i < TOTAL_STEPS; i++) {
        const [x, y] = xyFromIndex(i)
        led.plot(x, y)
    }
}
function showPauseIcon() {
    basic.clearScreen()
    for (let y = 0; y < 5; y++) {
        led.plot(1, y); led.plot(3, y)
    }
}
function runIntroAnimation() {
    inIntroAnim = true
    basic.showIcon(IconNames.SmallDiamond); basic.pause(120)
    basic.showIcon(IconNames.Diamond); basic.pause(120)
    basic.showIcon(IconNames.Square); basic.pause(120)
    basic.clearScreen()
    inIntroAnim = false
}
function runOutroAnimation() {
    inOutroAnim = true
    basic.showIcon(IconNames.Square); basic.pause(120)
    basic.showIcon(IconNames.Diamond); basic.pause(120)
    basic.showIcon(IconNames.SmallDiamond); basic.pause(120)
    basic.clearScreen()
    inOutroAnim = false
}

// Noise Threshold 
function showNoiseLock() {
    if (!noisy) { noisy = true; beepedThisNoise = false }
    if (!beepedThisNoise) { nagBeep(); beepedThisNoise = true }
    basic.showIcon(IconNames.No)
}
function clearNoiseLockIfNeeded() {
    if (noisy) { noisy = false; beepedThisNoise = false; showProgress() }
}

// Power functions
function resetSessionState() {
    running = false; paused = false; inBreak = false
    inIntroAnim = false; inOutroAnim = false
    noisy = false; beepedThisNoise = false
    stepIndex = 0
}

function powerOn() {
    poweredOn = true
    resetSessionState()
    openTapWindowAndThenStart()
}

function powerOff() {
    poweredOn = false; running = false; paused = false
    inBreak = false; inTapWindow = false
    basic.clearScreen()
}

// Window for counting taps 
function openTapWindowAndThenStart() {
    inTapWindow = true
    tapCount = 0
    const windowEnds = control.millis() + TAP_WINDOW_MS

    // Wait for window and don't exceed max blocks
    control.inBackground(function () {
        while (inTapWindow && control.millis() < windowEnds) {
            basic.pause(20)
        }
        inTapWindow = false
        let selected = tapCount
        if (selected <= 0) selected = 1
        if (selected > MAX_BLOCKS) selected = MAX_BLOCKS
        blocksRemaining = selected
        beginBlock()
    })
}

// Begin study block
function beginBlock() {
    resetSessionState()
    runIntroAnimation()
    startChime()
    basic.pause(POST_INTRO_DELAY_MS)
    if (input.soundLevel() >= noiseThresh) showNoiseLock()
    else showProgress()
    running = true
}

// Pause functions
function pauseTimer() {
    if (!poweredOn || !running || inBreak) return
    paused = true; showPauseIcon()
}
function resumeTimer() {
    if (!poweredOn || inBreak) return
    paused = false
    if (input.soundLevel() >= noiseThresh) showNoiseLock()
    else { clearNoiseLockIfNeeded(); showProgress() }
}

// Break function
let breakEndAt = 0
function startBreak() {
    inBreak = true; running = false; paused = false
    noisy = false; beepedThisNoise = false
    basic.clearScreen()
    breakEndAt = control.millis() + BREAK_MS
}
// Block ending function
function handleBlockFinished() {
    running = false
    runOutroAnimation(); basic.pause(PRE_CHECKMARK_DELAY_MS)
    endChime(); basic.showIcon(IconNames.Yes); basic.pause(500); basic.clearScreen()
    if (blocksRemaining > 1) { blocksRemaining -= 1; startBreak() }
    else { powerOff() } // last block → device off
}

// Tick Function
function tickOnce() {
    if (!poweredOn || !running || paused || inBreak) return
    if (inIntroAnim || inOutroAnim || inTapWindow) return

    if (stepIndex >= TOTAL_STEPS) { handleBlockFinished(); return }

    if (input.soundLevel() >= noiseThresh) { showNoiseLock(); return }
    else { clearNoiseLockIfNeeded() }

    const [x, y] = xyFromIndex(stepIndex)
    led.unplot(x, y)
    stepIndex += 1
    if (stepIndex >= TOTAL_STEPS) handleBlockFinished()
}

// Input Button Pressing functions
input.onButtonPressed(Button.A, function () {
    if (!poweredOn) { powerOn(); return }
    if (inTapWindow) { if (tapCount < MAX_BLOCKS) tapCount += 1; return }
    powerOff()
})
input.onButtonPressed(Button.B, function () {
    if (!poweredOn || inTapWindow) return
    if (!paused) pauseTimer(); else resumeTimer()
})

// Main
loops.everyInterval(TICK_MS, function () { tickOnce() })
loops.everyInterval(1000, function () {
    if (poweredOn && running && !paused && !inIntroAnim && !inOutroAnim && !inBreak && noisy && !inTapWindow) nagBeep()
})
loops.everyInterval(200, function () {
    if (poweredOn && inBreak && control.millis() >= breakEndAt) {
        inBreak = false
        if (blocksRemaining > 0) beginBlock()
        else powerOff()
    }
})
