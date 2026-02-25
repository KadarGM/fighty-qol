class VFXorEditor extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: 'vfxor-editor',
            title: 'VFXor Editor',
            template: 'modules/fighty-qol/vfxor-editor-temp.html',
            width: 800,
            height: 600,
            resizable: true,
            closeOnSubmit: false
        });
    }

    getData() {
        return {
            effects: game.settings.get('fighty-qol', 'vfxEffects') || {}
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
    }

    async _updateObject(event, formData) {
    }
}

window.VFXorEditor = VFXorEditor;