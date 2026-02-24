Hooks.once('init', () => {
    Handlebars.registerHelper('eq', function (a, b) { return a === b; });
});