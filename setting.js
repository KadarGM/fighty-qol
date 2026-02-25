class EscalationSettings extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: 'escalation-settings-menu',
            title: 'Escalation Dice Settings',
            template: 'modules/fighty-qol/escalation-settings.html',
            width: 450,
            height: 'auto',
            closeOnSubmit: true
        });
    }

    getData() {
        return {
            startRound: game.settings.get('fighty-qol', 'startRound'),
            interval: game.settings.get('fighty-qol', 'interval'),
            bonusStep: game.settings.get('fighty-qol', 'bonusStep'),
            maxBonus: game.settings.get('fighty-qol', 'maxBonus'),
            scale: game.settings.get('fighty-qol', 'scale'),
            opacity: game.settings.get('fighty-qol', 'opacity'),
            triangleColor: game.settings.get('fighty-qol', 'triangleColor'),
            textColor: game.settings.get('fighty-qol', 'textColor'),
            resetPosition: game.settings.get('fighty-qol', 'resetPosition'),
            chatMessageEnabled: game.settings.get('fighty-qol', 'chatMessageEnabled'),
            chatMessageText: game.settings.get('fighty-qol', 'chatMessageText')
        };
    }

    async _updateObject(event, formData) {
        for (let [k, v] of Object.entries(formData)) {
            await game.settings.set('fighty-qol', k, v);
        }
        if (typeof checkEscalation === "function") checkEscalation(false, true);
    }
}

Hooks.once('init', () => {
    Handlebars.registerHelper('eq', function (a, b) { return a === b; });

    game.settings.register('fighty-qol', 'active', { name: 'Enable Escalation System (Master)', scope: 'world', config: true, type: Boolean, default: true });
    game.settings.register('fighty-qol', 'visibility', { name: 'Show Escalation Dice Widget', scope: 'world', config: true, type: Boolean, default: true });
    game.settings.register('fighty-qol', 'enableAutomation', { name: 'Enable Escalation Automation', scope: 'world', config: true, type: Boolean, default: true });
    game.settings.register('fighty-qol', 'enableAverager', { name: 'Enable Group Initiative Averager', scope: 'world', config: true, type: Boolean, default: true });
    game.settings.register('fighty-qol', 'enableVFXor', { name: 'Enable VFXor System', scope: 'client', config: true, type: Boolean, default: true });

    game.settings.register('fighty-qol', 'startRound', { scope: 'world', config: false, type: Number, default: 2 });
    game.settings.register('fighty-qol', 'interval', { scope: 'world', config: false, type: Number, default: 0 });
    game.settings.register('fighty-qol', 'bonusStep', { scope: 'world', config: false, type: Number, default: 1 });
    game.settings.register('fighty-qol', 'maxBonus', { scope: 'world', config: false, type: Number, default: 6 });
    game.settings.register('fighty-qol', 'scale', { scope: 'client', config: false, type: Number, default: 1 });
    game.settings.register('fighty-qol', 'opacity', { scope: 'client', config: false, type: Number, default: 1 });
    game.settings.register('fighty-qol', 'triangleColor', { scope: 'client', config: false, type: String, default: '#3a0000' });
    game.settings.register('fighty-qol', 'textColor', { scope: 'client', config: false, type: String, default: '#ffffff' });
    game.settings.register('fighty-qol', 'resetPosition', { scope: 'client', config: false, type: Boolean, default: false });
    game.settings.register('fighty-qol', 'posX', { scope: 'client', config: false, type: String, default: "" });
    game.settings.register('fighty-qol', 'posY', { scope: 'client', config: false, type: String, default: "" });
    game.settings.register('fighty-qol', 'automatedActors', { scope: 'world', config: false, type: Array, default: [] });
    game.settings.register('fighty-qol', 'chatMessageEnabled', { scope: 'world', config: false, type: Boolean, default: false });
    game.settings.register('fighty-qol', 'chatMessageText', { scope: 'world', config: false, type: String, default: "Escalation dice increases to {bonus}!" });

    game.settings.register('fighty-qol', 'autoAdd', { scope: 'world', config: false, type: Boolean, default: true });
    game.settings.register('fighty-qol', 'useBonuses', { scope: 'world', config: false, type: Boolean, default: true });
    game.settings.register('fighty-qol', 'calcMethod', { scope: 'world', config: false, type: String, default: 'avg' });
    game.settings.register('fighty-qol', 'rollMode', { scope: 'world', config: false, type: String, default: 'normal' });

    game.settings.register('fighty-qol', 'vfxEffects', { scope: 'world', config: false, type: Object, default: {} });
    game.settings.register('fighty-qol', 'vfxDictionary', { scope: 'world', config: false, type: Object, default: {} });
    game.settings.register('fighty-qol', 'autoSkipNoTarget', { scope: 'world', config: false, type: Boolean, default: false });

    game.settings.registerMenu('fighty-qol', 'escalationMenu', {
        name: 'Escalation Settings',
        label: 'Configure Escalation',
        icon: 'fas fa-dice-d20',
        type: EscalationSettings,
        restricted: true
    });

    game.settings.registerMenu('fighty-qol', 'vfxorMenu', {
        name: 'VFXor Settings',
        label: 'Configure VFXor',
        icon: 'fas fa-wand-magic-sparkles',
        type: VFXorSettings,
        restricted: true
    });
});