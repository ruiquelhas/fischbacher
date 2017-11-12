'use strict';

const Fs = require('fs');
const Os = require('os');
const Path = require('path');

const Code = require('code');
const Form = require('multi-part');
const Hapi = require('hapi');
const Lab = require('lab');

const Fischbacher = require('../');

const lab = exports.lab = Lab.script();

lab.experiment('fischbacher', () => {

    let server;
    let png;
    let gif;

    lab.before(async () => {

        server = new Hapi.Server();
        server.route({
            options: {
                handler: () => null,
                payload: {
                    output: 'file',
                    parse: true
                }
            },
            method: '*',
            path: '/'
        });

        await server.register({
            plugin: Fischbacher,
            options: {
                whitelist: ['image/png']
            }
        });
    });

    lab.beforeEach(() => {
        // Create fake png file
        png = Path.join(Os.tmpdir(), 'foo.png');

        return new Promise((resolve, reject) => {

            Fs.createWriteStream(png)
                .on('error', reject)
                .end(Buffer.from('89504e470d0a1a0a', 'hex'), resolve);
        });
    });

    lab.beforeEach(() => {
        // Create fake gif file
        const magicNumber = ['474946383761', '474946383961'][Math.floor(Math.random())];
        gif = Path.join(Os.tmpdir(), 'foo.gif');

        return new Promise((resolve, reject) => {

            Fs.createWriteStream(gif)
                .on('error', reject)
                .end(Buffer.from(magicNumber, 'hex'), resolve);
        });
    });

    lab.test('should return error if some file in the payload is not allowed', async () => {

        const form = new Form();
        form.append('file1', Fs.createReadStream(gif));
        form.append('file2', Fs.createReadStream(png));
        form.append('file3', Fs.createReadStream(gif));
        form.append('foo', 'bar');

        const { headers, result, statusCode } = await server.inject({
            headers: form.getHeaders(),
            method: 'POST',
            payload: form.stream(),
            url: '/'
        });

        Code.expect(statusCode).to.equal(400);
        Code.expect(headers['content-validation']).to.equal('failure');
        Code.expect(result).to.include(['message', 'validation']);
        Code.expect(result.message).to.equal('child \"file1\" fails because [\"file1\" type is not allowed]');
        Code.expect(result.validation).to.include(['source', 'keys']);
        Code.expect(result.validation.source).to.equal('payload');
        Code.expect(result.validation.keys).to.include('file1');
    });

    lab.test('should return control to the server if all files in the payload are allowed', async () => {

        const form = new Form();
        form.append('file1', Fs.createReadStream(png));
        form.append('file2', Fs.createReadStream(png));
        form.append('foo', 'bar');

        const { headers, statusCode } = await server.inject({
            headers: form.getHeaders(),
            method: 'POST',
            payload: form.stream(),
            url: '/'
        });

        Code.expect(statusCode).to.equal(200);
        Code.expect(headers['content-validation']).to.equal('success');
    });
});
