const getPath = (fullUrl) =>
{
    return fullUrl.replace(/^\/|\/$/g, "");
}
const env = (key, defaultValue) =>
{
    if(!key in process.env)
    {
        if(defaultValue) return defaultValue;
        throw Error(`${key} not found in ENV variables!`);
    }

    // Access Cache if enabled

    return process.env[key];
}

module.exports = {
    getPath,
    env
}