import { AnimationMixer } from "three";
import { LoopOnce } from "three";
import { Vector3 } from "three";


// creates a slider element to play all animations loaded with the model in a sequence
function createSlider(loop, model, camera, controls, appClassName) {
    const mixer = new AnimationMixer(model.scene);
    const animationGroup = model.animations;
    const appContainer = document.querySelector(appClassName);
    var sliderContainer = document.createElement("div");
    var slider = document.createElement("input");
    var playButton = document.createElement("input");
    var sliderLength = 0;
    var clipNumber = 0;
    var currentDuration = 0;
    var action = mixer.clipAction(animationGroup[clipNumber]);
    var cameraArray = model.scene.getObjectByName("Kameras");
    var buttonClicked = false;
    var camResetPos = new Vector3(0, 0, 0);
    var pivotTarget = model.scene.getObjectByName("Pivot");
    
    // sort animation clip array in alphabetical order
    function compare(a, b) {
        if (a.name < b.name){
            return -1;
        }
        if (a.name > b.name){
            return 1;
        }
        return 0;
    }
    animationGroup.sort(compare);

    // setup slider DOM elements and animation loop
    sliderContainer.classList.add("slider-container");
    slider.type = "range";
    slider.min = "1";
    slider.max = "100";
    slider.value = "0";
    slider.classList.add("slider");
    slider.id = "myRange";
    slider.state = 0;
    slider.tick = function () { };
    slider.id = "slider";
    
    // look for cameras and clear array if none are loaded
    if (cameraArray != null) {
        cameraArray = cameraArray.children;
    }
    else cameraArray = [];

    // create and place button and slider
    playButton.type = "button";
    playButton.classList.add("slider-button");
    playButton.id = "slider-button";
    
    sliderContainer.appendChild(playButton);
    sliderContainer.appendChild(slider);
    appContainer.appendChild(sliderContainer);

    // calculate duration sum of all animation clips for slider length
    for (var i = 0; i < animationGroup.length; i++) { 
        sliderLength += animationGroup[i].duration;
    };

    // slider manual position function
    slider.addEventListener("input", function() {
        var sliderTime = slider.value / 100 * sliderLength;
        var clipTime = 0;

        slider.tick = function () {
            //if (pivotTarget != null) loop.pivotTarget = pivotTarget.position;
        };

        // function for manual slider manipulation
        for (var i = 0; i < animationGroup.length; i++) {
            var action = mixer.clipAction(animationGroup[i]);

            // get current frame of active clip out of slider position
            if (sliderTime > clipTime) {
                action.play();
                action.time = sliderTime-clipTime;
                action.paused = true;
                        
                if (cameraArray && i < cameraArray.length) loop.target = cameraArray[i].position;

                // calculate currentDuration and clipTime for switching to autoplay
                currentDuration = clipTime;
                clipNumber = i;
            }
            // reset all clips coming after active clip
            else {
                action.reset();
                action.paused = true;
            }

            // keep track of clip durations for positioning
            clipTime += animationGroup[i].duration;
        }
    });

    // slider play button function
    playButton.addEventListener("click", function() {
        if (!buttonClicked) {
            slider.disabled = true;
            buttonClicked = true;
            controls.enabled = false;
            playButton.classList.add("paused");

            // save current camera position
            camResetPos = new Vector3(camera.position.x, camera.position.y, camera.position.z);

            // reset every animation on click when starting new
            if (slider.value / 100 * sliderLength == sliderLength) {
                for (var i = 0; i < animationGroup.length; i++) {
                    mixer.clipAction(animationGroup[i]).reset();
                    mixer.clipAction(animationGroup[i]).paused = true;
                }

                currentDuration = 0;
                clipNumber = 0;
            }
            
            // set current action clip
            action = mixer.clipAction(animationGroup[clipNumber]);

            // make slider move with animation
            slider.tick = function () {
                slider.value = (currentDuration + action.time) * 100 / sliderLength;
                if (pivotTarget != null) loop.pivotTarget = pivotTarget.position;
            };

            // start new animation loop
            sliderPlay(action, loop, cameraArray, clipNumber);
        }
        // execute pause functions
        else {
            buttonClicked = false;
            playButton.classList.remove("paused");
            action.paused = true;
            slider.disabled = false;
            controls.enabled = true;
            loop.target = null;
            loop.pivotTarget = null;
            pivotTarget = null;
        }
    });

    // when one clip finishes, play next clip in line
    mixer.addEventListener('finished', function(e) {
        currentDuration += action.time;
        clipNumber++;

        // play next clip in line
        if (clipNumber < animationGroup.length) {
            action = mixer.clipAction(animationGroup[clipNumber]);

            sliderPlay(action, loop, cameraArray, clipNumber);
        }

        // do this when slider reaches end during autoplay
        else {
            clipNumber = 0;
            loop.target = null;
            loop.pivotTarget = null;
            buttonClicked = false;
            playButton.classList.remove("paused");
            controls.enabled = true;
            slider.disabled = false;
            pivotTarget = null;
        }
    });

    // put slider and animation mixer in the main animation loop
    mixer.tick = (delta) => mixer.update(delta);
    loop.updatables.push(mixer);
    loop.updatables.push(slider);

    return sliderContainer;
}

// play all animation clips chained in a row
function sliderPlay (action, loop, cameraArray, clipNumber) {
    if (clipNumber < cameraArray.length) loop.target = cameraArray[clipNumber].position;

    action.paused = false;
    action.play();
    action.clampWhenFinished = true;
    action.loop = LoopOnce;
}

export { createSlider };