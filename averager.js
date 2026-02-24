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
        
        html.find('.roll-init').click(async () => {
            if (window.GroupInitRecording) {
                window.GroupInitRecording = false;
                this.render(true);
            }

            if (window.GroupInitTokens.length === 0) {
                ui.notifications.warn("No tokens selected for Group Initiative.");
                return;
            }

            const autoAdd = game.settings.get('fighty-qol', 'autoAdd');
            const useBonuses = game.settings.get('fighty-qol', 'useBonuses');
            const calcMethod = game.settings.get('fighty-qol', 'calcMethod');
            const rollMode = game.settings.get('fighty-qol', 'rollMode');
            
            const validTokens = canvas.tokens.placeables.filter(t => window.GroupInitTokens.find(wt => wt.id === t.id));
            
            if (validTokens.length === 0) {
                ui.notifications.warn("Selected tokens are not present on the current scene.");
                return;
            }

            let rolls = [];
            let chatDetails = "";

            for (let t of validTokens) {
                let initBonus = 0;
                if (useBonuses && t.actor && t.actor.system.attributes?.init) {
                    initBonus = t.actor.system.attributes.init.bonus || 0;
                }

                let formula = "1d20";
                if (rollMode === "advantage") formula = "2d20kh";
                if (rollMode === "disadvantage") formula = "2d20kl";
                
                if (initBonus > 0) formula += ` + ${initBonus}`;
                else if (initBonus < 0) formula += ` - ${Math.abs(initBonus)}`;

                let roll = await new Roll(formula).evaluate();
                rolls.push(roll.total);
                
                chatDetails += `<div style="display: flex; justify-content: space-between; border-bottom: 1px solid #ccc; padding: 2px 0;">
                    <span>${t.name}</span>
                    <strong>${roll.total}</strong>
                </div>`;
            }

            let finalInit = 0;
            let methodText = "";

            if (calcMethod === 'avg') {
                const sum = rolls.reduce((a, b) => a + b, 0);
                finalInit = Math.ceil(sum / rolls.length);
                methodText = "Average";
            } else if (calcMethod === 'median') {
                rolls.sort((a, b) => a - b);
                const mid = Math.floor(rolls.length / 2);
                finalInit = rolls.length % 2 !== 0 ? rolls[mid] : Math.ceil((rolls[mid - 1] + rolls[mid]) / 2);
                methodText = "Median";
            } else if (calcMethod === 'high') {
                finalInit = Math.max(...rolls);
                methodText = "Highest";
            } else if (calcMethod === 'low') {
                finalInit = Math.min(...rolls);
                methodText = "Lowest";
            }

            let combat = game.combat;
            let chatHtml = `
                <div style="font-family: 'Signika', sans-serif;">
                    <h3 style="border-bottom: 2px solid #333; margin-bottom: 5px;">Group Initiative</h3>
                    <div style="font-size: 0.9em; margin-bottom: 10px;">
                        ${chatDetails}
                    </div>
                    <div>
                        <h4 title="Calculation Method: ${methodText}, Roll Mode: ${rollMode}" style="color: black; font-size: 1.2em; text-align: center; background: #e0e0e0; padding: 5px; margin-top: 5px; border-radius: 3px;">
                            ${methodText}: ${finalInit}
                        </h4>
                    </div>
                </div>
            `;

            await ChatMessage.create({
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({alias: "DM - Group Initiative"}),
                content: chatHtml
            });

            if (autoAdd) {
                if (!combat) combat = await Combat.create({ scene: canvas.scene.id, active: true });
                
                const toAdd = validTokens.filter(t => !t.inCombat).map(t => ({
                    tokenId: t.id,
                    sceneId: t.scene.id,
                    actorId: t.document.actorId,
                    hidden: t.document.hidden
                }));
                if (toAdd.length > 0) {
                    await combat.createEmbeddedDocuments("Combatant", toAdd);
                }
                
                const updates = validTokens.map(t => {
                    const combatant = combat.combatants.find(c => c.tokenId === t.id);
                    if (combatant) return { _id: combatant.id, initiative: finalInit };
                    return null;
                }).filter(u => u !== null);
                
                if (updates.length > 0) {
                    await combat.updateEmbeddedDocuments("Combatant", updates);
                }
            }
        });
    }
}