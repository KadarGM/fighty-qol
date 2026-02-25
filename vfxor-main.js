class VFXorMain {
    static init() {
        if (!game.settings.get('fighty-qol', 'enableVFXor')) return;
        this.registerHooks();
    }

    static registerHooks() {
        Hooks.on("dnd5e.preUseItem", (item, config, options) => this._onPreUse(item, config, options));
        Hooks.on("dnd5e.preUseActivity", (activity, usageConfig, dialogs) => this._onPreUse(activity, usageConfig, dialogs));
    }

    static _onPreUse(entity, config, options) {
        const item = entity.item || entity;
        if (!["spell", "feat", "weapon"].includes(item.type)) return true;

        const targets = game.user.targets;
        if (targets.size > 0) return true;

        const autoSkip = game.settings.get('fighty-qol', 'autoSkipNoTarget');
        if (autoSkip) return true;

        if (config && config.vfxorPrompted) return true;

        this._showTargetDialog(entity, config, options);
        return false; 
    }

    static _showTargetDialog(entity, config, options) {
        new Dialog({
            title: "VFXor: Missing Target",
            content: `<p style="text-align: center; margin-bottom: 15px;">You are casting or attacking without a target.<br>Do you want to skip the animation or select targets?</p>`,
            buttons: {
                skip: {
                    icon: '<i class="fas fa-forward"></i>',
                    label: "Skip Animation",
                    callback: () => {
                        if (!config) config = {};
                        config.vfxorPrompted = true;
                        config.vfxorSkip = true;
                        entity.use(config, options);
                    }
                },
                target: {
                    icon: '<i class="fas fa-bullseye"></i>',
                    label: "Select Targets",
                    callback: () => {
                        ui.notifications.info("Select your target(s) and use the item again.");
                    }
                }
            },
            default: "target"
        }, { classes: ["dialog", "vfxor-window"] }).render(true);
    }
}

Hooks.once('ready', () => {
    VFXorMain.init();
});

window.VFXorMain = VFXorMain;