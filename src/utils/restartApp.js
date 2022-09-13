const restartApp = () => {
    setTimeout(function () {
        // Listen for the 'exit' event.
        // This is emitted when our app exits.
        process.on('exit', function () {
            //  Resolve the `child_process` module, and `spawn`
            //  a new process.
            //  The `child_process` module lets us
            //  access OS functionalities by running any bash command.`.
            require('child_process').spawn(process.argv.shift(), process.argv, {
                cwd: process.cwd(),
                detached: true,
                stdio: 'inherit',
            });
        });
        process.exit();
    }, 1000);
};

module.exports = restartApp;
