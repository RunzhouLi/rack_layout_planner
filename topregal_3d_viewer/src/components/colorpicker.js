import { Color } from "three";


// creates a color configuration bar to change material color of specific objects in the scene
function createColorMenue(scene, configText) {
    var colorContainer = document.createElement("div");
    var colorPaletteDOM = document.createElement("div");
    var title = document.createElement("div");
    var colorPalettes = null;
    var colorPickerGroups = null;

    // add DOM element for color configuration buttons
    colorContainer.classList.add("config-container");
    colorPaletteDOM.classList.add("color-palette");
    title.classList.add("h2");
    title.innerText = configText[5];
    colorContainer.appendChild(title);

    // look through scene objects for the mandatory configuration elements like palette and materials
    scene.traverse(function(object) {
        if (object.name === "Palettes") {
            colorPalettes = object.children;
            colorPalettes.sort((a, b) => a.name.localeCompare(b.name));

            // convert color of materials in the material groups
            colorPalettes.forEach(element => {
                element.visible = false;
            });
        } 
        else if (object.name === "Colorpickers") {
            colorPickerGroups = object.children;
        }
    });

    var buttonPalette;
    if (colorPalettes != null) buttonPalette = colorPalettes[0];

    // create a button with click function for every color found in the palette of the first color group
    if (colorPalettes != null && colorPickerGroups != null) {
        for (var i = 0; i < buttonPalette.children.length; i++) (function(i) {
            var buttons = [];
            var paletteColor = buttonPalette.children[i].material;
    
            // create color button DOM elements
            buttons[i] = document.createElement("img");
            buttons[i].classList.add("color-picker");
            buttons[i].onclick = function() {
                // change to target material color or texture map
                for (var j = 0; j < colorPickerGroups.length; j++) {
                    colorPickerGroups[j].children.forEach(element => {
                        element.material = colorPalettes[j].children[i].material;
                    });
                }
            }
    
            // create color button preview with object texture or diffuse color
            if (buttonPalette.children.length > 0) {
                if (!paletteColor.map) {
                    var tempColor = new Color(paletteColor.color);
                    buttons[i].style.backgroundColor = tempColor.getStyle();
                }
                else {
                    createIMGfromTexture(paletteColor, buttons[i]);
                }
            }
    
            colorPaletteDOM.appendChild(buttons[i]);
        })(i);
    }

    colorContainer.appendChild(colorPaletteDOM);

    return colorContainer;
}

// convert image data from texture and set it as button image
function createIMGfromTexture(material, button) {
    const image = material.map.image;
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    
    const img = canvas.toDataURL("image/jpeg");

    var bgimg = new Image();
    bgimg.src = img;

    button.setAttribute('src', img);
}

export { createColorMenue };