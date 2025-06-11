import { LoadingManager } from 'three';


// visualizes the loading process
function loadApp(modalSelector) {
    // setup and add DOM elements needed for the loader
    var appContainer = document.querySelector(modalSelector);
    var loadingContainer = document.createElement("div");
    var progressContainer = document.createElement("div");
    var loadingSpinner = document.createElement("div");
    var progressElement = document.createElement("div");
    var progressText = document.createElement("div");

    loadingContainer.id = "loading-screen"
    progressContainer.id = "progress-container";
    loadingSpinner.id = "loader";
    progressElement.id = "progress-bar";
    progressText.id = "percentage-text";

    progressContainer.appendChild(progressElement);
    progressContainer.appendChild(progressText);
    loadingContainer.appendChild(progressContainer);
    loadingContainer.appendChild(loadingSpinner);
    appContainer.appendChild(loadingContainer);

    // loading manager with progression log
    const manager = new LoadingManager();
  
    // disable loading screen when loading is finished
    manager.onLoad = function () {
        loadingContainer.classList.add("fade-out");
        loadingContainer.addEventListener("transitionend", onTransitionEnd);
        
        // also hide videoloader if it exists
        const videoLoader = document.getElementById("videoloader");
        if (videoLoader) {
            videoLoader.style.display = "none";
        }
    };

    // play loading animation during loading process
    manager.onProgress = function (url, itemsLoaded, itemsTotal) {
        var progress = Math.round(itemsLoaded / itemsTotal * 100) + '%';

        progressElement.style.width = progress;
        progressText.innerHTML = progress
    };
  
    return manager;
}

// delete loading manager
function onTransitionEnd(event) {
    event.target.remove();
}
  
export { loadApp };