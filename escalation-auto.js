window.EscalationAutoRecording = false;

Hooks.on("renderSceneControls", () => {
    const layers = document.querySelector("#scene-controls-layers");
    if (!layers) return;

    const existingBtn = document.querySelector("button[data-control='escalation-auto-toggle']");
    const isEnabled = game.user?.isGM && game.settings.get('fighty-qol', 'enableAutomation');

    if (!isEnabled) {
        if (existingBtn && existingBtn.parentElement) existingBtn.parentElement.remove();
        return;
    }

    if (!existingBtn) {
        layers.insertAdjacentHTML("beforeend", `
            <li>
                <button type="button" class="control ui-control icon fas fa-crosshairs" role="tab" data-control="escalation-auto-toggle" data-tooltip="Escalation Dice - Automation"></button>
            </li>
        `);

        document.querySelector("button[data-control='escalation-auto-toggle']").addEventListener("click", () => {
            if (!window.EscalationAutoAppInstance) {
                window.EscalationAutoAppInstance = new EscalationAutoApp();
            }
            window.EscalationAutoAppInstance.render(true);
        });
    }
});

Hooks.on('closeSettingsConfig', () => { 
    ui.controls.render(); 
});

Hooks.on('controlToken', async (token, isControlled) => {
    if (isControlled && window.EscalationAutoRecording && token.actor) {
        let list = game.settings.get('fighty-qol', 'automatedActors') || [];
        if (!list.find(a => a.id === token.actor.uuid)) {
            list.push({ id: token.actor.uuid, name: token.name });
            await game.settings.set('fighty-qol', 'automatedActors', list);
            
            if (window.EscalationAutoAppInstance && window.EscalationAutoAppInstance.rendered) {
                window.EscalationAutoAppInstance.render(true);
            }
        }
    }
});

class EscalationAutoApp extends Application {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "escalation-auto-app",
            title: "Escalation Automation",
            template: "modules/fighty-qol/escalation-temp.html", 
            width: 320,
            height: "auto",
            left: 120,
            top: 200,
            resizable: true
        });
    }

    getData() {
        return {
            actors: game.settings.get('fighty-qol', 'automatedActors') || [],
            isRecording: window.EscalationAutoRecording
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
        
        html.find('.toggle-rec').click(() => {
            window.EscalationAutoRecording = !window.EscalationAutoRecording;
            this.render(true);
        });

        html.find('.rem-actor').click(async (ev) => {
            const id = $(ev.currentTarget).data('id');
            let list = game.settings.get('fighty-qol', 'automatedActors') || [];
            list = list.filter(a => a.id !== id);
            await game.settings.set('fighty-qol', 'automatedActors', list);
            this.render(true);
        });

        html.find('.clr-actors').click(async () => {
            await game.settings.set('fighty-qol', 'automatedActors', []);
            this.render(true);
        });
    }
}