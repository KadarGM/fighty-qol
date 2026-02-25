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
            height: 750,
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
            this.localEffects[id] = { name: "New Effect", layers: [] };
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

        html.find('#vfxor-add-layer').click(ev => {
            if (!this.currentEffectId) return;
            this._updateLocalFromForm();
            if (!this.localEffects[this.currentEffectId].layers) {
                this.localEffects[this.currentEffectId].layers = [];
            }
            this.localEffects[this.currentEffectId].layers.push({ 
                file: "", delay: 0, scale: 1, speed: 1, tint: "#ffffff" 
            });
            this.render(true);
        });

        html.find('.vfxor-delete-layer').click(ev => {
            if (!this.currentEffectId) return;
            this._updateLocalFromForm();
            const index = Number(ev.currentTarget.dataset.index);
            this.localEffects[this.currentEffectId].layers.splice(index, 1);
            this.render(true);
        });

        html.find('.vfxor-file-picker').click(ev => {
            ev.preventDefault();
            const target = ev.currentTarget.dataset.target;
            const input = html.find(`input[name="${target}"]`);
            new FilePicker({
                type: "video",
                current: input.val(),
                callback: path => {
                    input.val(path);
                    this._updateLocalFromForm();
                }
            }).browse();
        });

        html.find('.vfxor-preview-effect').click(ev => {
            this._updateLocalFromForm();
            this._playPreview(html);
        });
    }

    _playPreview(html) {
        if (!this.currentEffectId) return;
        const effect = this.localEffects[this.currentEffectId];
        if (!effect || !effect.layers) return;

        const screen = html.find('#vfxor-preview-screen');
        screen.find('.vfx-layer-preview').remove();

        effect.layers.forEach(layer => {
            if (!layer.file) return;

            setTimeout(() => {
                const isVideo = layer.file.endsWith('.webm') || layer.file.endsWith('.mp4');
                const style = `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(${layer.scale || 1}); mix-blend-mode: screen; pointer-events: none;`;

                let el;
                if (isVideo) {
                    el = $(`<video class="vfx-layer-preview" src="${layer.file}" style="${style}" autoplay muted></video>`);
                    el[0].playbackRate = layer.speed || 1;
                    el.on('ended', function() { $(this).remove(); });
                } else {
                    el = $(`<img class="vfx-layer-preview" src="${layer.file}" style="${style}">`);
                    setTimeout(() => el.remove(), 2000);
                }

                screen.append(el);
            }, layer.delay || 0);
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
                    this.localEffects[id].layers = data.layers ? Object.values(data.layers) : [];
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