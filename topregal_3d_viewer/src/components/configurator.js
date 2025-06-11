import { Color } from "three";
import { addFog } from "./fog.js";


// creates a slider element to play all animations loaded with the model in a sequence
function createConfigurator(colors, scene, animations, appClassName, backgroundColor, configText, headerInfobox) {
    const appContainer = document.querySelector(appClassName);
    var configContainer = document.createElement("div");
    var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;

    // create tooltip for mouse input
    var tooltipContainer = document.createElement("div");
    var tooltipIcon = document.createElement("div");

    tooltipIcon.setAttribute("id","tooltip-icon");
    tooltipContainer.setAttribute("id","tooltip-mouse");

    tooltipContainer.appendChild(tooltipIcon);
    appContainer.appendChild(tooltipContainer);

    // setup configurator headline
    var header = document.createElement("div");
    var headerTitle = document.createElement("div");
    var headerClose = document.createElement("div");

    configContainer.classList.add("configurator3d");
    header.classList.add("config-header");
    headerTitle.classList.add("h1");
    headerTitle.innerText = configText[0];
    headerClose.classList.add("config-header-button");
    header.appendChild(headerClose);
    header.appendChild(headerTitle);

    // setup configurator options
    var configuratorContent = document.createElement("div");

    configuratorContent.classList.add("config-content");

    // setup configurator switch menue
    var menue = document.createElement("div");
    var menueTitle = document.createElement("div");
    var menueWrap = document.createElement("div");
    var menueLabel1 = document.createElement("label");
    var menueLabel2 = document.createElement("label");
    var menueRadio1 = document.createElement("input");
    var menueRadio2 = document.createElement("input");
    var menueButton1 = document.createElement("span");
    var menueButton2 = document.createElement("span");

    menue.classList.add("config-container");
    menueTitle.classList.add("h2");
    menueTitle.innerText = configText[1];

    menueWrap.classList.add("config-switch");
    menueButton1.innerText = configText[2];
    menueButton2.innerText = configText[3];;
    menueRadio1.name = "radio";
    menueRadio2.name = "radio";
    menueRadio1.type = "radio";
    menueRadio2.type = "radio";
    menueButton1.classList.add("config-switch-button");
    menueButton2.classList.add("config-switch-button");

    menueLabel1.appendChild(menueRadio1);
    menueLabel1.appendChild(menueButton1);
    menueLabel2.appendChild(menueRadio2);
    menueLabel2.appendChild(menueButton2);
    menueWrap.appendChild(menueLabel1);
    menueWrap.appendChild(menueLabel2);
    menue.appendChild(menueTitle);
    menue.appendChild(menueWrap);

    var slider = document.getElementById("slider");
    var sliderButton = document.getElementById("slider-button");

    // check for background color and change elements accordingly
    if (backgroundColor === 0xffffff) {
        menueRadio1.checked = true;
        menueRadio2.checked = false;
        changeSliderColor(animations, slider, sliderButton, backgroundColor, scene, tooltipIcon, tooltipContainer);
    }
    else {
        menueRadio2.checked = true;
        menueRadio1.checked = false;
        changeSliderColor(animations, slider, sliderButton, backgroundColor, scene, tooltipIcon, tooltipContainer);
    }

    menueRadio1.addEventListener('click', function() {
        changeSliderColor(animations, slider, sliderButton, 0xffffff, scene, tooltipIcon, tooltipContainer);
    });

    menueRadio2.addEventListener('click', function() {
        changeSliderColor(animations, slider, sliderButton, 0x556879, scene, tooltipIcon, tooltipContainer);
    });

    // setup configurator checkbox options
    var option = document.createElement("div");
    var optionWrap = document.createElement("label");
    var optionHeader = document.createElement("div");
    var optionInput = document.createElement("input");
    var optionSpan = document.createElement("span");

    option.classList.add("config-container");

    optionInput.classList.add("config-checkbox");
    optionInput.type = "checkbox";
    optionInput.checked = true;
    optionWrap.classList.add("checkbox-label");

    optionHeader.classList.add("h2");
    optionHeader.innerText = configText[4];

    optionSpan.classList.add("config-span");

    optionWrap.appendChild(optionInput);
    optionWrap.appendChild(optionSpan);

    option.appendChild(optionHeader);
    option.appendChild(optionWrap);

    optionInput.addEventListener('change', function() {
        if (this.checked) {
            document.getElementById("annotations").classList.remove("hide");
            document.getElementById("tooltip-mouse").classList.remove("hide");
        } else {
            document.getElementById("annotations").classList.add("hide");
            document.getElementById("tooltip-mouse").classList.add("hide");
        }
    });

    // add configurator elements to main container
    configContainer.appendChild(header);
    configuratorContent.appendChild(menue);
    configuratorContent.appendChild(option);
    if (colors) configuratorContent.appendChild(colors);
    configContainer.appendChild(configuratorContent);

    configContainer.ontransitionend = () => {
        for (var i = 1; i < configContainer.children.length; i++){
            if (!headerClose.closed) {
                configContainer.children[i].classList.remove("hide");
                headerTitle.classList.remove("hide");
                headerClose.classList.remove("closed");
                headerClose.classList.remove("opening");
                header.classList.remove("closed");
            }
        }
    };

    header.addEventListener('click', function() {
        toggleMenu(configContainer, headerClose, headerTitle, headerInfobox);
    });

    // always close menu on start
    headerClose.closed = false;
    toggleMenu(configContainer, headerClose, headerTitle, headerInfobox);

    // append all elements to the app
    appContainer.appendChild(configContainer);

    return configContainer;
}

// change the appearence of the animation slider according to background
function changeSliderColor(animations, slider, sliderButton, color, scene, tooltipIcon, tooltipContainer) {
    var sliderColor;

    if (color === 0xffffff) {
        tooltipIcon.classList.add("bg-white");
        sliderColor = "#556879";
        tooltipContainer.style.borderColor = "#55687984";

        // create scene fog
        //addFog(scene, 0xffffff, 22, 32);
    }
    else {
        tooltipIcon.classList.remove("bg-white");
        sliderColor = "#ffffff";
        tooltipContainer.style.borderColor = "#ffffff80";

        // create scene fog
        //addFog(scene, 0x556879, 22, 32);
    }

    scene.background = new Color(color);

    if (animations.length > 0) {
        slider.style.border = "solid 2px" + sliderColor + "";
        sliderButton.style.borderColor = "transparent transparent transparent" + sliderColor + "";

        if (color === 0xffffff) slider.classList.remove("white");
        else slider.classList.add("white");
    }
}

// close/open the configuration side bar
function toggleMenu(configContainer, headerClose, headerTitle, headerInfobox) {
    if (!headerClose.closed) {        
        // close menue
        for (var i = 1; i < configContainer.children.length; i++){
            configContainer.children[i].classList.add("hide");
        }
        // headerTitle.classList.add("hide");
        configContainer.classList.add("closed");
        headerClose.classList.add("closed");
        headerInfobox.classList.add("boxClosed");
        headerClose.closed = true;

    } else {
        // open menue
        for (var i = 1; i < configContainer.children.length; i++){
            configContainer.children[i].classList.remove("hide");
        }
        headerTitle.classList.remove("hide");
        configContainer.classList.remove("closed");
        headerClose.classList.remove("closed");
        headerInfobox.classList.remove("boxClosed");
        headerClose.closed = false;
    }
}

export { createConfigurator };