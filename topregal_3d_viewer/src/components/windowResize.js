// add a grid to the scene
function windowResize(camera, renderer, renderWindow, viewerWidth, viewerHeight, composer) {
    window.addEventListener("resize", function(){
        onWindowResize(camera, renderer, renderWindow, viewerWidth, viewerHeight, composer);
    }, false);
}

function onWindowResize(camera, renderer, renderWindow, viewerWidth, viewerHeight, composer) {
    camera.aspect = renderWindow.clientWidth / viewerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(renderWindow.clientWidth, viewerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
}

export { windowResize };