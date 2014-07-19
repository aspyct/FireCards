/* jshint -W106 */
'use strict';

var Transport = require('./transport'),
    XMLHttpRequest = require('./xmlhttprequest'),
    querystring = require('querystring'),
    util = require('util');

/**
 * @param {dav.Credentials} credentials user authorization.
 */
function OAuth2(credentials) {
  Transport.call(this, credentials);
}
util.inherits(OAuth2, Transport);
module.exports = OAuth2;

OAuth2.prototype.send = function(request, url, options) {
  options = options || {};
  var sandbox = options.sandbox,
      transformRequest = request.transformRequest,
      transformResponse = request.transformResponse,
      onerror = request.onerror;

  if (!('retry' in options)) {
    options.retry = true;
  }

  var xhr;
  var promise = access(
    this.credentials,
    options
  )
  .then(function(token) {
    xhr = new XMLHttpRequest();

    if (sandbox) {
      sandbox.add(xhr);
    }

    xhr.open(
      request.method,
      url,
      true /* async */
    );

    xhr.setRequestHeader('Authorization', 'Bearer ' + token);

    if (transformRequest) {
      transformRequest(xhr);
    }

    return xhr.send(request.requestData);
  })
  .then(function() {
    return transformResponse ? transformResponse(xhr) : xhr;
  })
  .catch(function(error) {
    if (options.retry && xhr.status === 401) {
      // Force expiration.
      this.credentials.expiration = 0;
      options.retry = false;
      return this.send(request, url, options);
    }

    throw error;
  }.bind(this));

  if (onerror) {
    promise = promise.catch(onerror);
  }

  return promise;
};

/**
 * @return {Promise} promise that will resolve with access token.
 */
function access(credentials, options) {
  if (!credentials.accessToken) {
    return getAccessToken(credentials, options);
  }

  if (credentials.refreshToken && isExpired(credentials)) {
    return refreshAccessToken(credentials, options);
  }

  return new Promise(function(resolve) {
    resolve(credentials.accessToken);
  });
}

function isExpired(credentials) {
  return typeof credentials.expiration === 'number' &&
         Date.now() > credentials.expiration;
}

function getAccessToken(credentials, options) {
  var sandbox = options.sandbox;
  var xhr = new XMLHttpRequest();
  if (sandbox) {
    sandbox.add(xhr);
  }

  xhr.open(
    'POST',
    credentials.tokenUrl,
    true /* async */
  );

  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  var data = querystring.stringify({
    code: credentials.authorizationCode,
    redirect_uri: credentials.redirectUrl,
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    grant_type: 'authorization_code'
  });

  var now = Date.now();
  return xhr.send(data).then(function() {
    var response = JSON.parse(xhr.responseText);
    credentials.accessToken = response.access_token;
    credentials.refreshToken = ('refresh_token' in response) ?
      response.refresh_token :
      null;
    credentials.expiration = ('expires_in' in response) ?
      now + response.expires_in :
      null;

    return response.access_token;
  });
}

function refreshAccessToken(credentials, options) {
  var sandbox = options.sandbox;
  var xhr = new XMLHttpRequest();
  if (sandbox) {
    sandbox.add(xhr);
  }

  xhr.open(
    'POST',
    credentials.tokenUrl,
    true /* async */
  );

  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  var data = querystring.stringify({
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    refresh_token: credentials.refreshToken,
    grant_type: 'refresh_token'
  });

  var now = Date.now();
  return xhr.send(data)
  .then(function() {
    var response = JSON.parse(xhr.responseText);
    credentials.accessToken = response.access_token;
    credentials.expiration = ('expires_in' in response) ?
      now + response.expires_in :
      null;

    return response.access_token;
  });
}
