'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const Code = require('code');
const FormData = require('form-data');
const Hapi = require('hapi');
const Lab = require('lab');
const streamToPromise = require('stream-to-promise');

const lab = exports.lab = Lab.script();
const Fischbacher = require('../lib/');

lab.experiment('fischbacher', () => {

    let server;

    lab.before((done) => {

        server = new Hapi.Server();
        server.connection();

        const setup = {
            register: Fischbacher,
            options: {
                whitelist: ['png']
            }
        };

        const route = {
            config: {
                handler: (request, reply) => reply(),
                payload: {
                    output: 'file',
                    parse: true
                }
            },
            method: '*',
            path: '/'
        };

        server.route(route);
        server.register(setup, done);
    });

    lab.test('should return error if some file in the payload is not allowed', (done) => {

        const png = path.join(os.tmpdir(), 'foo.png');
        fs.createWriteStream(png).end(new Buffer([0x89, 0x50]));

        const gif = path.join(os.tmpdir(), 'foo.gif');
        fs.createWriteStream(gif).end(new Buffer([0x47, 0x49]));

        const form = new FormData();
        form.append('file1', fs.createReadStream(gif));
        form.append('file2', fs.createReadStream(png));
        form.append('file3', fs.createReadStream(gif));
        form.append('foo', 'bar');

        streamToPromise(form).then((payload) => {

            server.inject({ headers: form.getHeaders(), method: 'POST', payload: payload, url: '/' }, (response) => {

                Code.expect(response.statusCode).to.equal(400);
                Code.expect(response.headers['content-validation']).to.equal('failure');
                Code.expect(response.result).to.include(['message', 'validation']);
                Code.expect(response.result.message).to.equal('child \"file1\" fails because [\"file1\" type is not allowed]');
                Code.expect(response.result.validation).to.include(['source', 'keys']);
                Code.expect(response.result.validation.source).to.equal('payload');
                Code.expect(response.result.validation.keys).to.include('file1');
                done();
            });
        });
    });

    lab.test('should return control to the server if all files the payload are allowed', (done) => {

        const png = path.join(os.tmpdir(), 'foo.png');
        fs.createWriteStream(png).end(new Buffer([0x89, 0x50]));

        const form = new FormData();
        form.append('file1', fs.createReadStream(png));
        form.append('file2', fs.createReadStream(png));
        form.append('foo', 'bar');

        streamToPromise(form).then((payload) => {

            server.inject({ headers: form.getHeaders(), method: 'POST', payload: payload, url: '/' }, (response) => {

                Code.expect(response.statusCode).to.equal(200);
                Code.expect(response.headers['content-validation']).to.equal('success');
                done();
            });
        });
    });
});
