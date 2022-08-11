const path = require('path');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const getPath = (fullUrl) => {
    return fullUrl.replace(/^\/|\/$/g, '');
};
const env = (key, defaultValue) => {
    if (!key in process.env) {
        if (defaultValue) return defaultValue;
        throw Error(`${key} not found in ENV variables!`);
    }

    // Access Cache if enabled

    return process.env[key];
};
const exists = async (value, options) => {
    const model = path.resolve(__dirname, '../models', options.model);
    const Model = require(model);
    var fieldName = options.field;
    const modelQuery = await Model.find({ [fieldName]: value });
    if (!modelQuery.length) {
        throw new Joi.ValidationError(
            'ValidationError',
            [
                {
                    message: `${options.model} do not exist`,
                    path: [options.model],
                    //     type: "",
                    //     context: {
                    //         key: options.model,
                    //         label: options.model,
                    //         value,
                    //     },
                },
            ],
            value
        );
    }
    return value;
};

const routerWrapper = (router) => {
    const _route = router.route.bind(router);
    const methodsToWrap = ['get', 'post', 'patch', 'put', 'delete'];
    router.route = function (path) {
        const route = _route(path);
        for (const method of methodsToWrap) {
            if (route[method]) {
                route[method] = routeContainer(route[method]);
            }
        }
        return route;
    };
};

const routeContainer = (originRouterMethod) => {
    return function () {
        const originMiddlewares = [...arguments];
        const wrappedMiddlewares = originMiddlewares.map((fn) => {
            if (typeof fn !== `function`) {
                return fn;
            }

            return async function (req, res, next) {
                try {
                    await fn.apply(null, arguments);
                } catch (err) {
                    next(err);
                }
            };
        });
        originRouterMethod.call(this, wrappedMiddlewares);
    };
};

const settings = async (type, userId, defaultSetting = null) => {
    const Setting = require(path.join(process.cwd(), '/src/app/models/Setting'));
    let settingObject;

    if (userId === 'app-settings') {
        settingObject = await Setting.findOne({
            kind: 'app-settings',
        }).lean();
    } else {
        settingObject = await Setting.findOne({
            user: userId,
        }).lean();
    }
    var settingKeyPair = {
        name: type,
        value: defaultSetting,
    };
    if (!settingObject?.configurations) return settingKeyPair;
    settingKeyPair.value = settingObject.configurations[type];
    return settingKeyPair;
};

const callRepository = async (repository, method, args) => {
    const repositoryPath = path.resolve(process.cwd(), 'src/app/repositories/', repository);
    const Repository = require(repositoryPath);
    return await Repository[method](args);
};

const getAuthUser = (accessToken) => {
    try {
        const decodedToken = jwt.verify(accessToken, env('TOKEN_SECRET', 'x0t0wefw33@2314R23$@4$%!#$634'));
        return decodedToken?.data?.user;
    } catch (error) {
        return false;
    }
};

const send = (res, data) =>
    res
        .set({ 'Content-Type': 'application/json' })
        .status(200)
        .json({ ...data, data: data.data ?? {}, status: data.status ?? 200, message: data.message ?? 'Success' });

const getFileDetails = async (uploadId, token) => {
    const config = {
        url: env('FILES_SERVICE_APP_URL') + 'file/' + uploadId,
        headers: {
            ...token,
        },
    };
    try {
        if (uploadId) {
            const fileDetails = await axios(config);
            return fileDetails.data.data;
        }
        return {
            file_url: 'https://as1.ftcdn.net/v2/jpg/04/34/72/82/1000_F_434728286_OWQQvAFoXZLdGHlObozsolNeuSxhpr84.jpg',
        };
    } catch (error) {
        return {
            file_url: 'https://as1.ftcdn.net/v2/jpg/04/34/72/82/1000_F_434728286_OWQQvAFoXZLdGHlObozsolNeuSxhpr84.jpg',
        };
    }
};

module.exports = {
    getPath,
    settings,
    env,
    routerWrapper,
    callRepository,
    send,
    getFileDetails,
    getAuthUser,
};
