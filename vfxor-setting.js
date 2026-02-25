class VFXorSettings extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: 'vfxor-settings-menu',
            classes: ["vfxor-window"],
            title: 'VFXor Settings',
            template: 'modules/fighty-qol/vfxor-setting-temp.html',
            width: 400,
            height: 'auto',
            closeOnSubmit: true
        });
    }

    getData() {
        return {
            autoSkipNoTarget: game.settings.get('fighty-qol', 'autoSkipNoTarget')
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('#vfxor-open-editor').click(async (ev) => {
            ev.preventDefault();
            if (typeof VFXorEditor !== "undefined") {
                new VFXorEditor().render(true);
                this.close();
            } else {
                ui.notifications.error("VFXor Editor class not found.");
            }
        });

        html.find('#vfxor-clear-data').click(async (ev) => {
            ev.preventDefault();
            const confirm = await Dialog.confirm({
                title: "Clear VFXor Data",
                content: "<p>Are you sure you want to delete all VFXor effects and dictionary data? This cannot be undone.</p>",
                yes: () => true,
                no: () => false,
                defaultYes: false
            });

            if (confirm) {
                await game.settings.set('fighty-qol', 'vfxEffects', {});
                await game.settings.set('fighty-qol', 'vfxDictionary', {});
                ui.notifications.info("VFXor data cleared.");
            }
        });
    }

    async _updateObject(event, formData) {
        await game.settings.set('fighty-qol', 'autoSkipNoTarget', formData.autoSkipNoTarget);
    }
}

window.VFXorSettings = VFXorSettings;