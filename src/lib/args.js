let args = {};

module.exports = function(key, defaultValue = null) {
    if (!Object.keys(args).length) {
        for (const arg of process.argv) {
            if (arg.indexOf('--') > -1) {
                let split = arg.split('=');
                args[split.shift()] = split.join('=') || true;
            }
        }
    }

    return key ? args[key] || defaultValue : args;
}
