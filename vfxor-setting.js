class VFXorEditor extends FormApplication {
    constructor(...args) {
        super(...args);
        this.localEffects = foundry.utils.deepClone(game.settings.get('fighty-qol', 'vfxEffects') || {});
        this.currentEffectId = Object.keys(this.localEffects)[0] || null;
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: 'vfxor-editor',
            classes: ["vfxor-window"],
            title: 'VFXor Editor',
            template: 'modules/fighty-qol/vfxor-editor-temp.html',
            width: 850,
            height: 650,
            resizable: true,
            closeOnSubmit: false
        });
    }

    getData() {
        return {
            effects: this.localEffects,
            currentEffectId: this.currentEffectId,
            currentEffect: this.currentEffectId ? this.localEffects[this.currentEffectId] : null
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('#vfxor-add-effect').click(ev => {
            this._updateLocalFromForm();
            const id = foundry.utils.randomID();
            this.localEffects[id] = { name: "New Effect", steps: [] };
            this.currentEffectId = id;
            this.render(true);
        });

        html.find('.vfxor-select-effect').click(ev => {
            this._updateLocalFromForm();
            this.currentEffectId = ev.currentTarget.dataset.id;
            this.render(true);
        });

        html.find('.vfxor-delete-effect').click(async ev => {
            this._updateLocalFromForm();
            const id = ev.currentTarget.dataset.id;
            delete this.localEffects[id];
            if (this.currentEffectId === id) {
                this.currentEffectId = Object.keys(this.localEffects)[0] || null;
            }
            this.render(true);
        });

        html.find('#vfxor-add-step').click(ev => {
            if (!this.currentEffectId) return;
            this._updateLocalFromForm();
            if (!this.localEffects[this.currentEffectId].steps) {
                this.localEffects[this.currentEffectId].steps = [];
            }
            this.localEffects[this.currentEffectId].steps.push({ type: "anim", file: "" });
            this.render(true);
        });

        html.find('.vfxor-delete-step').click(ev => {
            if (!this.currentEffectId) return;
            this._updateLocalFromForm();
            const index = Number(ev.currentTarget.dataset.index);
            this.localEffects[this.currentEffectId].steps.splice(index, 1);
            this.render(true);
        });
    }

    _updateLocalFromForm() {
        if (!this.form) return;
        const formData = this._getSubmitData();
        const expanded = foundry.utils.expandObject(formData);
        
        if (expanded.effects) {
            for (let [id, data] of Object.entries(expanded.effects)) {
                if (this.localEffects[id]) {
                    this.localEffects[id].name = data.name;
                    this.localEffects[id].steps = data.steps ? Object.values(data.steps) : [];
                }
            }
        }
    }

    async _updateObject(event, formData) {
        this._updateLocalFromForm();
        await game.settings.set('fighty-qol', 'vfxEffects', this.localEffects);
        ui.notifications.success("VFXor effects saved successfully.");
    }
}

window.VFXorEditor = VFXorEditor;