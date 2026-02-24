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
                <button type="button" class="control ui-control" role="tab" data-control="escalation-auto-toggle" data-tooltip="Escalation Dice - Automation" style="background-image: url('modules/fighty-qol/img/escalation-icon.webp'); background-size: 80%; background-repeat: no-repeat; background-position: center;"></button>
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
        return foundry.utils.mergeObject(super.defaultOptions, {
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
        
        html.find('.toggle-rec').click((ev) => {
            ev.preventDefault();
            window.EscalationAutoRecording = !window.EscalationAutoRecording;
            this.render(true);
        });

        html.find('.rem-actor').click(async (ev) => {
            ev.preventDefault();
            const id = $(ev.currentTarget).data('id');
            let list = game.settings.get('fighty-qol', 'automatedActors') || [];
            list = list.filter(a => a.id !== id);
            await game.settings.set('fighty-qol', 'automatedActors', list);
            this.render(true);
        });

        html.find('.clr-actors').click(async (ev) => {
            ev.preventDefault();
            await game.settings.set('fighty-qol', 'automatedActors', []);
            this.render(true);
        });
    }
}

async function manageEscalationBuffs(isDeleting = false) {
    if (!game.user.isGM) return;

    try {
        const isAutomationEnabled = game.settings.get('fighty-qol', 'enableAutomation');
        if (!isAutomationEnabled) return;

        const isActive = game.settings.get('fighty-qol', 'active');
        const combat = game.combat;
        let currentBonus = 0;

        if (isActive && combat && combat.started && !isDeleting) {
            const startRound = game.settings.get('fighty-qol', 'startRound');
            if (combat.round >= startRound) {
                const intervalDivider = game.settings.get('fighty-qol', 'interval') + 1;
                const bonusStep = game.settings.get('fighty-qol', 'bonusStep');
                const maxBonus = game.settings.get('fighty-qol', 'maxBonus');

                const roundsActive = combat.round - startRound;
                const triggers = Math.floor(roundsActive / intervalDivider) + 1;
                currentBonus = Math.min(triggers * bonusStep, maxBonus);
            }
        }

        const automatedActors = game.settings.get('fighty-qol', 'automatedActors') || [];

        for (let target of automatedActors) {
            const actor = await fromUuid(target.id);
            if (!actor) continue;

            const existingEffect = actor.effects.find(e => e.flags?.["fighty-qol"]?.isEscalation);

            if (currentBonus > 0) {
                const effectData = {
                    name: "Escalation Dice",
                    img: "icons/skills/melee/strike-sword-blood-red.webp",
                    changes: [
                        { key: "system.bonuses.mwak.attack", mode: 2, value: `+${currentBonus}` },
                        { key: "system.bonuses.rwak.attack", mode: 2, value: `+${currentBonus}` },
                        { key: "system.bonuses.msak.attack", mode: 2, value: `+${currentBonus}` },
                        { key: "system.bonuses.rsak.attack", mode: 2, value: `+${currentBonus}` }
                    ],
                    flags: { "fighty-qol": { isEscalation: true } }
                };

                if (existingEffect) {
                    if (existingEffect.changes[0].value != `+${currentBonus}`) {
                        await existingEffect.update({ changes: effectData.changes });
                    }
                } else {
                    await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
                }
            } else {
                if (existingEffect) await existingEffect.delete();
            }
        }
    } catch (err) {
        console.error("Fighty QOL | Escalation Automation Error:", err);
    }
}

Hooks.on("updateCombat", () => { manageEscalationBuffs(false); });
Hooks.on("deleteCombat", () => { manageEscalationBuffs(true); });