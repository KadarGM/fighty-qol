window.GroupInitTokens = window.GroupInitTokens || [];
window.GroupInitRecording = window.GroupInitRecording || false; 

Hooks.on('controlToken', (token, isControlled) => {
    if (isControlled && window.GroupInitRecording) {
        if (!window.GroupInitTokens.find(t => t.id === token.id)) {
            window.GroupInitTokens.push({ id: token.id, name: token.name });
            if (window.GroupInitAppInstance && window.GroupInitAppInstance.rendered) {
                window.GroupInitAppInstance.render(true);
            }
        }
    }
});

Hooks.on("renderSceneControls", () => {
    const layers = document.querySelector("#scene-controls-layers");
    if (!layers) return;

    const existingBtn = document.querySelector("button[data-control='group-init-app-toggle']");
    const isEnabled = game.user?.isGM && game.settings.get('fighty-qol', 'enableAverager');

    if (!isEnabled) {
        if (existingBtn && existingBtn.parentElement) existingBtn.parentElement.remove();
        return;
    }

    if (!existingBtn) {
        layers.insertAdjacentHTML("beforeend", `
            <li>
                <button type="button" class="control ui-control icon fas fa-users-cog" role="tab" data-control="group-init-app-toggle" data-tooltip="Group Initiative"></button>
            </li>
        `);

        document.querySelector("button[data-control='group-init-app-toggle']").addEventListener("click", () => {
            if (!window.GroupInitAppInstance) window.GroupInitAppInstance = new GroupInitApp();
            window.GroupInitAppInstance.render(true);
        });
    }
});

class GroupInitApp extends Application {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "group-init-app",
            title: "Group Initiative",
            template: "modules/fighty-qol/averager-temp.html", 
            width: 340,
            height: "auto",
            left: 120, 
            top: 100,
            resizable: true
        });
    }

    getData() {
        return {
            tokens: window.GroupInitTokens,
            isRecording: window.GroupInitRecording,
            autoAdd: game.settings.get('fighty-qol', 'autoAdd'),
            useBonuses: game.settings.get('fighty-qol', 'useBonuses'),
            calcMethod: game.settings.get('fighty-qol', 'calcMethod'),
            rollMode: game.settings.get('fighty-qol', 'rollMode')
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
        
        html.find('.toggle-record').click(() => {
            window.GroupInitRecording = !window.GroupInitRecording;
            this.render(true);
        });

        html.find('.remove-token').click(ev => {
            const id = $(ev.currentTarget).data('id');
            window.GroupInitTokens = window.GroupInitTokens.filter(t => t.id !== id);
            this.render(true);
        });

        html.find('.clear-tokens').click(() => {
            window.GroupInitTokens = [];
            this.render(true);
        });

        html.find('input[name="autoAdd"]').change(async (ev) => await game.settings.set('fighty-qol', 'autoAdd', ev.target.checked));
        html.find('input[name="useBonuses"]').change(async (ev) => await game.settings.set('fighty-qol', 'useBonuses', ev.target.checked));
        html.find('select[name="calcMethod"]').change(async (ev) => await game.settings.set('fighty-qol', 'calcMethod', ev.target.value));
        html.find('select[name="rollMode"]').change(async (ev) => await game.settings.set('fighty-qol', 'rollMode', ev.target.value));
        
        html.find('.roll-init').click(() => {
            if(window.GroupInitRecording) {
                window.GroupInitRecording = false;
                this.render(true);
            }
            // Zde zavoláš logiku pro hody kostkou, tu pravděpodobně už máš hotovou jinde.
        });
    }
}