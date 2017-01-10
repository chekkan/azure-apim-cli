#!/usr/bin/env node

var program = require('commander');

program
    .version('0.1.0')
    .command('api', 'update all / one api')
    .command('product', 'azure api product')
    .parse(process.argv);