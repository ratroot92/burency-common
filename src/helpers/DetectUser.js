const UAParser = require("ua-parser-js");

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

        this.ip = (request.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            request.connection.socket.remoteAddress;

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