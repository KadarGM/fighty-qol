class VFXorMain {
    static init() {
        if (!game.settings.get('fighty-qol', 'enableVFXor')) return;
        this.registerHooks();
    }

    static registerHooks() {
    }
}

Hooks.once('ready', () => {
    VFXorMain.init();
});

window.VFXorMain = VFXorMain;