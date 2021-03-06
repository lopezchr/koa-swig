'use strict';

/**
 * Module dependencies.
 */

var render = require('..');
var path = require('path');
var request = require('supertest');
var koa = require('koa');

describe('koa-swig', function () {
  describe('render', function () {
    it('should relative dir ok', function (done) {
      var app = koa();
      render(app, {
        root: 'example',
        ext: 'txt',
        filters: {
          format: function (v) { return v.toUpperCase(); }
        }
      });
      app.use(function *() {
        yield this.render('basic', {
          name: 'koa-swig'
        });
      });
      request(app.listen())
        .get('/')
        .expect('KOA-SWIG\n')
        .expect(200, done);
    });

    it('should filters.format ok', function (done) {
      var app = koa();
      render(app, {
        root: path.join(__dirname, '../example'),
        ext: 'txt',
        filters: {
          format: function (v) { return v.toUpperCase(); }
        }
      });
      app.use(function *() {
        yield this.render('basic', {
          name: 'koa-swig'
        });
      });
      request(app.listen())
        .get('/')
        .expect('KOA-SWIG\n')
        .expect(200, done);
    });

    it('should not return response with writeBody = false', function (done) {
      var app = koa();
      render(app, {
        root: path.join(__dirname, '../example'),
        ext: 'txt',
        filters: {
          format: function (v) { return v.toUpperCase(); }
        },
        writeBody:false
      });
      app.use(function *() {
        yield this.render('basic', {
          name: 'koa-swig'
        });
      });
      request(app.listen())
        .get('/')
        .expect('Not Found')
        .expect(404, done);
    });

    it('should return response with writeBody = false and write the body manually', function (done) {
      var app = koa();
      render(app, {
        root: path.join(__dirname, '../example'),
        ext: 'txt',
        filters: {
          format: function (v) { return v.toUpperCase(); }
        },
        writeBody:false
      });
      app.use(function *() {
        var html = yield this.render('basic', {
          name: 'koa-swig'
        });
        this.type = 'html';
        this.body = html;
      });
      request(app.listen())
        .get('/')
        .expect('KOA-SWIG\n')
        .expect(200, done);
    });

  });

  describe('server', function () {
    var app = require('../example/app');
    it('should render page ok', function (done) {
      request(app)
      .get('/')
      .expect('content-type', 'text/html; charset=utf-8')
      .expect('content-length', '186')
      .expect(/<title>koa-swig.*<\/title>/)
      .expect(200, done);
    });
  });

  describe('tags', function () {
    var headerTag = require('../example/header-tag');
    var app = koa();
    render(app, {
      root: path.join(__dirname, '../example'),
      ext: 'html',
      tags: {
        header: headerTag
      }
    });
    app.use(function *() {
      yield this.render('header');
    });
    it('should add tag ok', function (done) {
      request(app.listen())
        .get('/')
        .expect(200, done);
    });
  });

  describe('flash', function () {
    var app = koa();
    var session = require('koa-session');
    var flash = require('koa-flash');
    app.keys = ['foo'];
    app.use(session());
    app.use(flash({ key: 'bar' }));
    render(app, {
      root: path.join(__dirname, '../example')
    });
    app.use(function *() {
      this.flash.notice = 'Success!';
      yield this.render('flash');
    });
    it('should success', function (done) {
      request(app.listen())
      .get('/')
      .expect(/Success/)
      .expect(200, done);
    });
  });

  describe('expose swig', function () {
    var swig = render.swig;
    it('swig should be exposed', function () {
      swig.version.should.equal('1.4.2');
    });
  });


});
