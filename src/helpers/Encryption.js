const bcrypt = require('bcrypt');

class Encryption
{   
    /**
    * 
    * @returns object
    */
    static async hash(data = {})
    {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(data, salt);
    }

   /**
    * 
    * @returns object
    */
    static async hashCompare(data = {}, hashedData)
    {
       return await bcrypt.compare(data, hashedData);
    }
}

module.exports = Encryption;