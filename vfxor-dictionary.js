class VFXorDictionary {
    static init() {
        this.dictionary = game.settings.get('fighty-qol', 'vfxDictionary') || {};
    }
}

Hooks.once('ready', () => {
    VFXorDictionary.init();
});

window.VFXorDictionary = VFXorDictionary;