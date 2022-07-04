const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { env } = require("../helpers/helpers");
const algorithm = 'aes-256-ctr';

const hash = async (data = {}) =>
{
	const salt = await bcrypt.genSalt(10);
	return await bcrypt.hash(data, salt);
}

const hashCompare = async (data = {}, hashedData) =>
{
	return await bcrypt.compare(data, hashedData);
}

const checkHash = async (data = {}, hashedData) =>
{
	return await bcrypt.compare(data, hashedData);
}

const encrypt = function (str) {
	var key = env('TOKEN_SECRET');
	let sha256 = crypto.createHash('sha256');
	sha256.update(key);
	let iv = crypto.randomBytes(16);
	let cipher = crypto.createCipheriv(algorithm, sha256.digest(), iv);
	let ciphertext = cipher.update(Buffer.from(str));
	let  encrypted = Buffer.concat([iv, ciphertext, cipher.final()]).toString('base64');
	return encrypted;
}

const decrypt = function(enc) {
	var key = env('TOKEN_SECRET');
	let sha256 = crypto.createHash('sha256');
	sha256.update(key);
	let input = Buffer.from(enc, 'base64');
	let iv = input.slice(0, 16);
	let decipher = crypto.createDecipheriv(algorithm, sha256.digest(), iv);
	let ciphertext = input.slice(16);
	let plaintext = decipher.update(ciphertext) + decipher.final();
	return plaintext;
}

module.exports = {
	hash,
	hashCompare,
	checkHash,
	encrypt,
	decrypt
};