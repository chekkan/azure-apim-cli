#!/usr/bin/env node
var request = require('superagent');
var program = require('commander');
var _ = require('lodash');
var chalk = require('chalk');

function getAllApis(baseUrl, access_token) {
    return request.get(baseUrl)
        .set('Authorization', access_token)
        .then(function(res) {
            // console.log(JSON.stringify(res.body.nextLink));
            if(res.body.nextLink !== null) {
                return getAllApis(res.body.nextLink, access_token).then(function(recursiveResult) {
                    return [res.body.value].concat(recursiveResult);
                });
            } else {
                return res.body.value;
            }
        });
}

function remove(baseUrl, pid, access_token) {
    return request.delete(baseUrl+'/'+pid)
        .query('api-version=2014-02-14-preview')
        .query('deleteSubscriptions=true')
        .set('Authorization', access_token)
        .type('application/json')
        .set('If-Match', '*');
}

program
    .command('delete')
    .description('delete products')
    .option('--service_name [service_name]', "e.g. https://{servicename}.management.azure-api.net")
    .option('--access_token [access_token]', "access token")
    .action(function(options) {
        var baseUrl = "https://" + options.service_name + ".management.azure-api.net";
        //console.log(baseUrl);
        //console.log(options.service_url);
        getAllApis(baseUrl+ '//products?api-version=2014-02-14-preview&$top=10', options.access_token)
        .then(function(body) {
            return _.flattenDeep(body);
        }, function(err){
            console.log(chalk.bold.red(err));
        })
        .then(function(products) {
            return Promise.all(products.map(function(product) {
                //console.log(api.name);
                return remove(baseUrl, product.id, options.access_token, options.service_url)
                .then(function(res) {
                    console.log(chalk.bold.green("successfully deleted product: ")+ product.id);
                }, function(err) {
                    console.log(chalk.bold.red(err));
                });
            }));
        }).catch(function(err) {
            console.log(chalk.bold.red(err));
        });
    });

program.parse(process.argv);