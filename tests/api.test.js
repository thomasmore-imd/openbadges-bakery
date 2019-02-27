import test from 'ava';

// # load dependencies
const app = require('../app');
const axiosist = require('axiosist');
const FormData = require('form-data');
const fs = require('fs');

test('api route /api/unbake is being tested', async t => {
    // tell AVA we plan to see on test assertion pass
    t.plan(1);

    let file = fs.createReadStream(__dirname + '/mytestbadge.png');
    let form = new FormData();
    form.append('badge', file);

    let config = {
        headers: form.getHeaders()
    };

    await axiosist(app).post('/api/unbake', form, config).then(result => {
        t.is(result.data.status, "success");
    }).catch(error => {

    });
});