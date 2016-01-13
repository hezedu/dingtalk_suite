var agent = require('superagent');
var util = require('./util');

var BASE_URL = 'https://oapi.dingtalk.com/service';
var TICKET_EXPIRES_IN = 1000 * 60 * 20 //20分钟
var TOKEN_EXPIRES_IN = 1000 * 60 * 60 * 2 - 10000 //1小时59分50秒.防止网络延迟



var Api = function(conf, getTicket, getToken, saveToken) {
  this.suite_key = conf.suiteid;
  this.suite_secret = conf.secret;
  this.ticket_expires_in = TICKET_EXPIRES_IN;
  this.token_expires_in = conf.token_expires_in || TOKEN_EXPIRES_IN;

  this.getTicket = getTicket;
  this.getToken = getToken;
  this.saveToken = saveToken;

  this.ticket_cache = {
    expires: 0,
    value: null
  };
  this.token_cache = null;

}

Api.prototype.getLatestTicket = function(callback) {
  var now = Date.now();
  if (this.ticket_cache.expires + this.ticket_expires_in <= now) {
    this.getTicket(callback);
  } else {
    callback(null, this.ticket_cache);
  }
}

Api.prototype._get_access_token = function(callback) {
  var self = this;
  this.getLatestTicket(function(err, ticket) {

    var data = {
      suite_key: self.suite_key,
      suite_secret: self.suite_secret,
      suite_ticket: ticket.value
    };

    agent.post(BASE_URL + '/get_suite_token')
      .send(data).end(util.wrapper(callback));
  });
};

Api.prototype.getLatestToken = function(callback) {
  var self = this;

  console.log(self.token_cache);

  if (!self.token_cache) {
    self.getToken(function(err, token) {
      if (err) {
        return callback(err);
      } else {
        self.token_cache = token;
        self.getLatestToken(callback);
      }
    });
  } else {
    var now = Date.now();
    if (self.token_cache.expires + self.token_expires_in <= now) {
      self._get_access_token(function(err, token) {
        if (err) {
          return callback(err);
        } else {
          token = {
            value: token.suite_access_token,
            expires: now + self.token_expires_in
          }
          self.saveToken(token, function(err) {
            if (err) {
              return callback(err);
            }
            self.token_cache = token;
            callback(null, token);
          });
        }
      });
    } else {
      callback(null, this.token_cache);
    }
  }
}

Api.prototype.getPermanentCode = function(tmp_auth_code, callback) {
  var self = this;
  self.getLatestToken(function(err, token){

    if(err){
      return callback(err);
    };

    agent.post(BASE_URL + '/get_permanent_code')
      .query({suite_access_token:token.value})
      .send({tmp_auth_code : tmp_auth_code})
      .end(util.wrapper(callback));
  });

}

module.exports = Api;