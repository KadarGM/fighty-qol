class VFXorMain {
    static init() {
        if (!game.settings.get('fighty-qol', 'enableVFXor')) return;
        this.registerHooks();
    }

    static registerHooks() {
        Hooks.on("dnd5e.preUseItem", this._onPreUseItem.bind(this));
    }

    static _onPreUseItem(item, config, options) {
        if (!["spell", "feat", "weapon"].includes(item.type)) return true;

        const targets = game.user.targets;
        if (targets.size > 0) {
            options.vfxorSkip = false;
            return true;
        }

        const autoSkip = game.settings.get('fighty-qol', 'autoSkipNoTarget');
        if (autoSkip) {
            options.vfxorSkip = true;
            return true;
        }

        if (options.vfxorPrompted) return true;

        this._showTargetDialog(item, config, options);
        return false; 
    }

    static _showTargetDialog(item, config, options) {
        new Dialog({
            title: "VFXor: Missing Target",
            content: `<p style="text-align: center; margin-bottom: 15px;">You are casting/attacking without a target.<br>Do you want to skip the animation or select targets?</p>`,
            buttons: {
                skip: {
                    icon: '<i class="fas fa-forward"></i>',
                    label: "Skip Animation",
                    callback: () => {
                        options.vfxorSkip = true;
                        options.vfxorPrompted = true;
                        item.use(config, options);
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