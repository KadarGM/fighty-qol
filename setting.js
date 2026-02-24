Hooks.once('init', () => {
    game.settings.register('fighty-qol', 'active', {
        name: 'Escalation Dice Active', hint: 'If disabled, the escalation dice will not appear in combat.',
        scope: 'world', config: true, type: Boolean, default: true
    });
    game.settings.register('fighty-qol', 'startRound', {
        name: 'Starting Round', hint: 'The round the bonus is first applied.',
        scope: 'world', config: true, type: Number, default: 2
    });
    game.settings.register('fighty-qol', 'interval', {
        name: 'Increase Interval', hint: '0 = every round, 1 = every other round.',
        scope: 'world', config: true, type: Number, default: 0
    });
    game.settings.register('fighty-qol', 'bonusStep', {
        name: 'Bonus Step', hint: 'How much the bonus increases each step.',
        scope: 'world', config: true, type: Number, default: 1
    });
    game.settings.register('fighty-qol', 'maxBonus', {
        name: 'Maximum Bonus', hint: 'The value at which the escalation dice stops.',
        scope: 'world', config: true, type: Number, default: 6
    });
    game.settings.register('fighty-qol', 'scale', {
        name: 'Scale', scope: 'client', config: true, type: Number, range: { min: 0.1, max: 2, step: 0.1 }, default: 1
    });
    game.settings.register('fighty-qol', 'opacity', {
        name: 'Opacity', scope: 'client', config: true, type: Number, range: { min: 0.1, max: 1, step: 0.1 }, default: 1
    });
    game.settings.register('fighty-qol', 'triangleColor', {
        name: 'Triangle Color (HEX)', scope: 'client', config: true, type: String, default: '#3a0000'
    });
    game.settings.register('fighty-qol', 'textColor', {
        name: 'Text Color (HEX)', scope: 'client', config: true, type: String, default: '#ffffff'
    });
    game.settings.register('fighty-qol', 'resetPosition', {
        name: 'Reset Window Position', hint: 'Check this and save. The window will return to the center.',
        scope: 'client', config: true, type: Boolean, default: false
    });
    game.settings.register('fighty-qol', 'posX', { scope: 'client', config: false, type: String, default: "" });
    game.settings.register('fighty-qol', 'posY', { scope: 'client', config: false, type: String, default: "" });

    game.settings.register('fighty-qol', 'enableAutomation', {
        name: 'Enable Escalation Automation', hint: 'Adds a button to the left panel for selecting tokens to automate.',
        scope: 'world', config: true, type: Boolean, default: true
    });
    game.settings.register('fighty-qol', 'automatedActors', {
        scope: 'world', config: false, type: Array, default: []
    });

    game.settings.register('fighty-qol', 'enableAverager', {
        name: 'Enable Group Initiative Averager', hint: 'Adds a button to the left panel for group initiative averaging.',
        scope: 'world', config: true, type: Boolean, default: true
    });
    game.settings.register('fighty-qol', 'autoAdd', { scope: 'world', config: false, type: Boolean, default: true });
    game.settings.register('fighty-qol', 'useBonuses', { scope: 'world', config: false, type: Boolean, default: true });
    game.settings.register('fighty-qol', 'calcMethod', { scope: 'world', config: false, type: String, default: 'avg' });
    game.settings.register('fighty-qol', 'rollMode', { scope: 'world', config: false, type: String, default: 'normal' });
});