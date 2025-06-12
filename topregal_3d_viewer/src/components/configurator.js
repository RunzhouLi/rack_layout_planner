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

    // 默认折叠状态
    headerClose.closed = true;
    configContainer.classList.add("closed");
    headerClose.classList.add("closed");
    headerInfobox.classList.add("boxClosed");

    // 添加折叠/展开按钮
    const toggleBtn = document.createElement("button");
    toggleBtn.classList.add("toggle-button");
    toggleBtn.innerText = "▶";
    toggleBtn.title = "展开/折叠面板";
    toggleBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        toggleMenu(configContainer, headerClose, headerTitle, headerInfobox);
    });
    // 将 toggleBtn 添加到 configContainer，使其随面板移动
    configContainer.appendChild(toggleBtn);

    // 初始隐藏内容区域（跳过 toggleBtn）
    for (var i = 1; i < configContainer.children.length; i++){
        if (configContainer.children[i] !== toggleBtn) {
            configContainer.children[i].classList.add("hide");
        }
    }

    // 改进点击行为 - 整个头部区域都可点击
    header.style.cursor = "pointer";
    header.addEventListener('click', function() {
        toggleMenu(configContainer, headerClose, headerTitle, headerInfobox);
    });

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
    const toggleBtn = configContainer.querySelector('.toggle-button');
    if (!headerClose.closed) {        
        // close menu
        toggleChildrenVisibility(configContainer, toggleBtn, true);
        configContainer.classList.add("closed");
        headerClose.classList.add("closed");
        headerInfobox.classList.add("boxClosed");
        headerClose.closed = true;
        if (toggleBtn) toggleBtn.innerText = "▶";
    } else {
        // open menue
        configContainer.classList.remove("closed");
        headerClose.classList.remove("closed");
        headerInfobox.classList.remove("boxClosed");
        headerClose.closed = false;
        // 延迟显示内容，等待过渡动画完成
        setTimeout(() => {
            toggleChildrenVisibility(configContainer, toggleBtn, false);
            headerTitle.classList.remove("hide");
        }, 300);
        if (toggleBtn) toggleBtn.innerText = "▼";
    }
}

// Helper function to toggle visibility of configContainer children
function toggleChildrenVisibility(configContainer, excludeElement, hide) {
    for (var i = 1; i < configContainer.children.length; i++) {
        if (configContainer.children[i] !== excludeElement) {
            if (hide) {
                configContainer.children[i].classList.add("hide");
            } else {
                configContainer.children[i].classList.remove("hide");
            }
        }
    }
}

export { createConfigurator };