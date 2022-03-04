module.exports = function getPath(fullUrl)
{
    return fullUrl.replace(/^\/|\/$/g, "");
}