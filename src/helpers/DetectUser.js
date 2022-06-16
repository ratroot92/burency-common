const UAParser = require("ua-parser-js");
const is = require('is_js');

class DetectUser
{
    constructor(request)
    {
        const uaParser = UAParser(request.headers["user-agent"]);

        this.ua = uaParser.ua;
        const suspicious = this.ua?.split("/");
        this.browser = uaParser.browser?.name ? uaParser.browser : { name: suspicious[0], version: suspicious[1] };
        this.engine = uaParser.engine;
        this.os = uaParser.os || uaParser.ua;
        this.device = uaParser.device;
        this.cpu = uaParser.cpu;

        this.ip = this.getClientIp(request);

        this.fingerprint = 
            this.ip +"-"+ 
            this.browser?.name+"v."+this.browser?.version+"-"+
            this.os?.name+"v."+this.os?.version +"-"+
            this.engine?.name+"v."+this.engine?.version;

        this.device_fingerprint =
            this.browser?.name+"v."+this.browser?.version+"-"+
            this.os?.name+"v."+this.os?.version +"-"+
            this.engine?.name+"v."+this.engine?.version;
    }

    /**
     * Determine client IP address.
     *
     * @param req
     * @returns {string} ip - The IP address if known, defaulting to empty string if unknown.
     */
    getClientIp(req) 
    {
        // Server is probably behind a proxy.
        if (req.headers) 
        {
            // Standard headers used by Amazon EC2, Heroku, and others.
            if (is.ip(req.headers['x-client-ip'])) 
            {
                return req.headers['x-client-ip'];
            }

            // Load-balancers (AWS ELB) or proxies.
            const xForwardedFor = this.getClientIpFromXForwardedFor(
                req.headers['x-forwarded-for'],
            );
            if (is.ip(xForwardedFor)) 
            {
                return xForwardedFor;
            }

            // Cloudflare.
            // @see https://support.cloudflare.com/hc/en-us/articles/200170986-How-does-Cloudflare-handle-HTTP-Request-headers-
            // CF-Connecting-IP - applied to every request to the origin.
            if (is.ip(req.headers['cf-connecting-ip'])) 
            {
                return req.headers['cf-connecting-ip'];
            }

            // Fastly and Firebase hosting header (When forwared to cloud function)
            if (is.ip(req.headers['fastly-client-ip'])) 
            {
                return req.headers['fastly-client-ip'];
            }

            // Akamai and Cloudflare: True-Client-IP.
            if (is.ip(req.headers['true-client-ip'])) 
            {
                return req.headers['true-client-ip'];
            }

            // Default nginx proxy/fcgi; alternative to x-forwarded-for, used by some proxies.
            if (is.ip(req.headers['x-real-ip'])) 
            {
                return req.headers['x-real-ip'];
            }

            // (Rackspace LB and Riverbed's Stingray)
            // http://www.rackspace.com/knowledge_center/article/controlling-access-to-linux-cloud-sites-based-on-the-client-ip-address
            // https://splash.riverbed.com/docs/DOC-1926
            if (is.ip(req.headers['x-cluster-client-ip'])) 
            {
                return req.headers['x-cluster-client-ip'];
            }

            if (is.ip(req.headers['x-forwarded'])) 
            {
                return req.headers['x-forwarded'];
            }

            if (is.ip(req.headers['forwarded-for'])) 
            {
                return req.headers['forwarded-for'];
            }

            if (is.ip(req.headers.forwarded)) 
            {
                return req.headers.forwarded;
            }

            // Google Cloud App Engine
            // https://cloud.google.com/appengine/docs/standard/go/reference/request-response-headers

            if (is.ip(req.headers['x-appengine-user-ip'])) 
            {
                return req.headers['x-appengine-user-ip'];
            }
        }

        // Remote address checks.
        // Deprecated
        if (is.existy(req.connection)) 
        {
            if (is.ip(req.connection.remoteAddress)) 
            {
                return req.connection.remoteAddress;
            }
            if (
                is.existy(req.connection.socket) &&
                is.ip(req.connection.socket.remoteAddress)
            ) 
            {
                return req.connection.socket.remoteAddress;
            }
        }

        if (is.existy(req.socket) && is.ip(req.socket.remoteAddress)) 
        {
            return req.socket.remoteAddress;
        }

        if (is.existy(req.info) && is.ip(req.info.remoteAddress)) 
        {
            return req.info.remoteAddress;
        }

        // AWS Api Gateway + Lambda
        if (
            is.existy(req.requestContext) &&
            is.existy(req.requestContext.identity) &&
            is.ip(req.requestContext.identity.sourceIp)
        ) 
        {
            return req.requestContext.identity.sourceIp;
        }

        // Cloudflare fallback
        // https://blog.cloudflare.com/eliminating-the-last-reasons-to-not-enable-ipv6/#introducingpseudoipv4
        if (req.headers) 
        {
            if (is.ip(req.headers['Cf-Pseudo-IPv4'])) 
            {
                return req.headers['Cf-Pseudo-IPv4'];
            }
        }

        // Fastify https://www.fastify.io/docs/latest/Reference/Request/
        if (is.existy(req.raw)) 
        {
            return getClientIp(req.raw);
        }

        return null;
    }
    
    /**
     * Parse x-forwarded-for headers.
     *
     * @param {string} value - The value to be parsed.
     * @return {string|null} First known IP address, if any.
     */
    getClientIpFromXForwardedFor(value) 
    {
        if (!is.existy(value)) 
        {
            return null;
        }

        if (is.not.string(value)) 
        {
            throw new TypeError(`Expected a string, got "${typeof value}"`);
        }

        // x-forwarded-for may return multiple IP addresses in the format:
        // "proxy 1 IP, proxy 2 IP, client IP"
        // Therefore, the right-most IP address is the IP address of the most recent proxy
        // and the left-most IP address is the IP address of the originating client.
        // source: http://docs.aws.amazon.com/elasticloadbalancing/latest/classic/x-forwarded-headers.html
        // Azure Web App's also adds a port for some reason, so we'll only use the first part (the IP)
        const forwardedIps = value.split(',').map((e) => {
            const ip = e.trim();
            if (ip.includes(':')) 
            {
                const splitted = ip.split(':');
                // make sure we only use this if it's ipv4 (ip:port)
                if (splitted.length === 2) 
                {
                    return splitted[0];
                }
            }
            return ip;
        });
        // Sometimes IP addresses in this header can be 'unknown' (http://stackoverflow.com/a/11285650).
        // Therefore taking the right-most IP address that is not unknown
        // A Squid configuration directive can also set the value to "unknown" (http://www.squid-cache.org/Doc/config/forwarded_for/)
        for (let i = forwardedIps.length - 1; i >= 0; i -= 1) 
        {
            if (is.ip(forwardedIps[i])) 
            {
                return forwardedIps[i];
            }
        }

        // If no value in the split list is an ip, return null
        return null;
    }

    /**
     * Expose request IP as a middleware.
     *
     * @param {object} [options] - Configuration.
     * @param {string} [options.attributeName] - Name of attribute to augment request object with.
     * @return {*}
     */
    mw(options) 
    {
        // Defaults.
        const configuration = is.not.existy(options) ? {} : options;

        // Validation.
        if (is.not.object(configuration)) 
        {
            throw new TypeError('Options must be an object!');
        }

        const attributeName = configuration.attributeName || 'clientIp';
        return (req, res, next) => {
            const ip = getClientIp(req);
            Object.defineProperty(req, attributeName, {
                get: () => ip,
                configurable: true,
            });
            next();
        };
    }

    // TODO: 
    /**
     * Identify user uniquely: User fingerprint
     * Reference: https://stackoverflow.com/questions/15966812/user-recognition-without-cookies-or-local-storage
        +-------------------------+--------+------------+
        |        Property         | Weight | Importance |
        +-------------------------+--------+------------+
        | Real IP address         |     60 |          5 |
        | Used proxy IP address   |     40 |          4 |
        | HTTP Cookies            |     80 |          8 |
        | Session Cookies         |     80 |          6 |
        | 3rd Party Cookies       |     60 |          4 |
        | Flash Cookies           |     90 |          7 |
        | PDF Bug                 |     20 |          1 |
        | Flash Bug               |     20 |          1 |
        | Java Bug                |     20 |          1 |
        | Frequent Pages          |     40 |          1 |
        | Browsers Finger Print   |     35 |          2 |
        | Installed Plugins       |     25 |          1 |
        | Cached Images           |     40 |          3 |
        | URL                     |     60 |          4 |
        | System Fonts Detection  |     70 |          4 |
        | Localstorage            |     90 |          8 |
        | Geolocation             |     70 |          6 |
        | AOLTR                   |     70 |          4 |
        | Network Information API |     40 |          3 |
        | Battery Status API      |     20 |          1 |
        +-------------------------+--------+------------+
     */
}

module.exports = DetectUser;