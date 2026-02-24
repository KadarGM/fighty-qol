Hooks.on('closeSettingsConfig', () => { checkEscalation(false); });
Hooks.on('updateCombat', () => { checkEscalation(false); });
Hooks.on('deleteCombat', () => { checkEscalation(true); });

function checkEscalation(isDeleting = false) {
    let container = document.getElementById("escalation-dice-widget");
    const isActive = game.settings.get('fighty-qol', 'active');
    const combat = game.combat;
    
    let showWidget = false;
    let currentBonus = 0;

    if (isActive && combat && combat.started && !isDeleting) {
        const startRound = game.settings.get('fighty-qol', 'startRound');
        
        if (combat.round >= startRound) {
            showWidget = true;
            const intervalDivider = game.settings.get('fighty-qol', 'interval') + 1;
            const bonusStep = game.settings.get('fighty-qol', 'bonusStep');
            const maxBonus = game.settings.get('fighty-qol', 'maxBonus');
            
            const roundsActive = combat.round - startRound;
            const triggers = Math.floor(roundsActive / intervalDivider) + 1;
            currentBonus = Math.min(triggers * bonusStep, maxBonus);
        }
    }

    if (!showWidget) {
        if (container) container.style.display = "none";
        return;
    }

    const scale = game.settings.get('fighty-qol', 'scale');
    const opacity = game.settings.get('fighty-qol', 'opacity');
    const triangleColor = game.settings.get('fighty-qol', 'triangleColor');
    const textColor = game.settings.get('fighty-qol', 'textColor');

    if (!container) {
        container = document.createElement("div");
        container.id = "escalation-dice-widget";
        container.style.position = "fixed";
        container.style.zIndex = "9999";
        container.style.cursor = "grab";
        document.body.appendChild(container);
        makeDraggable(container);
    }

    const isReset = game.settings.get('fighty-qol', 'resetPosition');
    if (isReset) {
        container.style.top = "40%";
        container.style.left = "45%";
        game.settings.set('fighty-qol', 'resetPosition', false);
        game.settings.set('fighty-qol', 'posX', "");
        game.settings.set('fighty-qol', 'posY', "");
    } else {
        const savedX = game.settings.get('fighty-qol', 'posX');
        const savedY = game.settings.get('fighty-qol', 'posY');
        container.style.left = savedX || "45%";
        container.style.top = savedY || "40%";
    }

    container.style.display = "block";
    container.style.opacity = opacity;

    container.innerHTML = `
        <div title="Add this to your attack roll" style="transform: scale(${scale}); transform-origin: center center; display: flex; flex-direction: column; align-items: center;">
            <div style="color: ${textColor}; font-family: 'Signika', sans-serif; font-weight: bold; font-size: 1.2rem; text-shadow: 1px 1px 3px black; margin-bottom: -5px; user-select: none;">
                Escalation Dice
            </div>
            <div style="position: relative; width: 100px; height: 100px; display: flex; justify-content: center; align-items: center;">
                <svg viewBox="0 0 100 100" style="position: absolute; width: 100%; height: 100%; z-index: -1;">
                    <polygon points="50,15 90,85 10,85" fill="${triangleColor}" stroke="${textColor}" stroke-width="3" stroke-linejoin="round" style="filter: drop-shadow(0 0 5px rgba(0,0,0,0.8));"/>
                </svg>
                <span style="color: ${textColor}; font-family: 'Signika', sans-serif; font-weight: bold; font-size: 2.5rem; text-shadow: 2px 2px 4px black; margin-top: 15px; user-select: none;">
                    +${currentBonus}
                </span>
            </div>
        </div>
    `;
}

function makeDraggable(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        elmnt.style.cursor = "grabbing";
    }
    
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        let newTop = elmnt.offsetTop - pos2;
        let newLeft = elmnt.offsetLeft - pos1;

        const rect = elmnt.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;

        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;
        if (newLeft > maxX) newLeft = maxX;
        if (newTop > maxY) newTop = maxY;

        elmnt.style.top = newTop + "px";
        elmnt.style.left = newLeft + "px";
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        elmnt.style.cursor = "grab";
        game.settings.set('fighty-qol', 'posX', elmnt.style.left);
        game.settings.set('fighty-qol', 'posY', elmnt.style.top);
    }
}