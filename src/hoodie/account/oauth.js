var utils = require('../../utils');
//var oauth = require('oauth');
var config = utils.config;

var promise = utils.promise;
var getDefer = promise.defer;
var reject = promise.reject;
var rejectWith = promise.rejectWith;
var resolveWith = promise.resolveWith;
var resolve = promise.resolve;

var OAuth = require('oauth');
//var state;
//exports.setState = function (s) {
//    state = s;
//};

exports.consumerKey = function () {
    return config.get('_oauth_consumer_key');
}
/**
 * resolve  {
                'username': username,   // string userCtx.name
                'roles': []             // array userCtx.roles
            }
 * @param state
 * @return {*}
 */
exports.authenticate = function (state) {
    var defer = getDefer();

    state.hoodie.account.request('GET', '/_session').then(function (result) {
        if (_.isObject(result) && _.isObject(result.userCtx) && result.userCtx.name) {
            var username = result.userCtx.name.split('/')[1];
            var userData = {
                'username': username,
                'roles': result.userCtx.roles
            };
            //var state = hoodie.account.getState();
            state.authenticated = true;
            state.username = username;
            var hoodieId = userData.roles[0];
            state.hoodie.trigger('account:signin', username, hoodieId);
            defer.resolve(userData);
        } else {
            defer.reject(result);
        }
        console.log(result.userCtx);
    }).fail(defer.reject);
    return defer.promise;

};

exports.setConsumerKey = function (key) {
    config.set('_oauth_consumer_key', key);
}

exports.consumerSecret = function () {
    return config.get('_oauth_consumer_secret');
}

exports.setConsumerSecret = function (secret) {
    config.set('_oauth_consumer_secret', secret);
}

exports.userKey = function () {
    return config.get('_oauth_user_key');
}

exports.setUserKey = function (key) {
    config.set('_oauth_user_key', key);
}

exports.userSecret = function () {
    return config.get('_oauth_user_secret');
}

exports.setUserSecret = function (secret) {
    config.set('_oauth_user_secret', secret);
}

exports.mkAuthenticateeHeaderValue = function (hoodie, url, method) {
    method = method || "GET";
    url = url.replace(hoodie.baseUrl + "/_api", '');
    url = "http://127.0.0.1:6003" + url;
    console.log(url);
    var oauth = new OAuth.OAuth(
        //hoodie.baseUrl + '/_session', hoodie.baseUrl + '/_session',
        url, url,
        //'http://localhost:6003/_session','http://localhost:6003/_session',
        //hoodie.baseUrl, hoodie.baseUrl ,
        exports.consumerKey(), exports.consumerSecret(),
        '1.0', null,
        'HMAC-SHA1'
    );

    //oauth.get('http://localhost:6001/_session', exports.userKey(), exports.userSecret(), function (e, data, res) {
    //    if (e) console.error("ERROR", e);
    //
    //    //console.log(require('util').inspect(data));
    //    //console.log(e,data,res);
    //
    //    console.log(res);
    //    console.log(data);
    //
    //    //console.log(e);
    //});


    //var orderedParameters = oauth._prepareParameters(this.userKey(), this.userSecret(), method, url);
    var orderedParameters = oauth._prepareParameters(this.userKey(), this.userSecret(), method, url);
    return oauth._buildAuthorizationHeaders(orderedParameters);
}

exports.hasToken = function () {
    return exports.consumerKey()
        && exports.consumerSecret()
        && exports.userKey()
        && exports.userSecret();
}