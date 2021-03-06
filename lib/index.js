var utils = require('./utils'),
  configs = require('../config');

function Spider(options) {
  this.options = utils._.extend({}, options, configs);
}

Spider.extend = function (obj) {
  var extended = obj.extended;

  for (var i in obj) {
    if (!Spider.prototype[i]) {
      Spider.prototype[i] = obj[i];
    }
  }

  if (extended) {
    extended(Spider);
  }
}

Spider.include = function (obj) {
  var included = obj.included;
  for (var i in obj) {
    if (!Spider[i]) {
      Spider[i] = obj[i];
    }
  }

  if (included) {
    included(Spider);
  }
}

Spider.prototype.crawlCategory = function (cb) {
  console.log('start crawl categories: ', this.options.site.host);
  var options = {
    url: this.options.site.host,
    method: 'GET',
    headers: this.options.site.headers,
    timeout: this.options.site.timeout
  };
  var request = utils.request;
  utils.charset(request);
  request
    .get(this.options.site.host + '/Right.aspx')
    .set('User-Agent', this.options.site.headers['User-Agent'])
    .set('Cookie', this.options.site.headers.Cookie)
    .set('Host', this.options.site.headers.Host)
    .charset('gbk')
    .end(function (err, res) {
      if (err) {
        console.log('Category Error : ', err);
        return cb(err);
      }
      var $ = utils.$.load(res.text);
      var results = []
      var categories = $('font.bgfont');
      categories.each(function () {
        var result = {};
        var category = $(this);
        var text = category.text().replace(/[\s|\r|\n]+/g, '');
        var carr = null;

        if ('-'.indexOf(text) > -1) {
          carr = category.text().replace(/[\s|\r|\n]+/g, '').split('-');
        } else {
          carr = category.text().replace(/[\s|\r|\n]+/g, '').split('—');
        }
        if (text === '蔬菜-食用菌'){
          carr = category.text().replace(/[\s|\r|\n]+/g, '').split('-');
        }
        result.c1 = carr[0] || '';
        result.c2 = carr[1] || carr[0] || '';
        result.subs = [];
        var subCategories = category.nextAll();
        subCategories.each(function () {
          var subCategory = $(this);
          var subResult = {};
          var subName = subCategory.text().replace(/[\s|\r|\n]+/g, '');
          subResult.name = subName;
          subResult.url = configs.site.host + '/' + subCategory.attr('href');
          result.subs.push(subResult);
        });
        results.push(result);
      });
      cb(null, results);
    });
};

Spider.prototype.crawlDisease = function (categories, cb) {
  if (!categories || categories.length === 0) {
    return cb(null, []);
  }
  var _this = this;
  utils.async.map(categories, function (category, cb1) {
    var result = {};
    result.name = category.name;
    var url = result.url = category.url;
    result.diseases = [];
    result.pests = [];
    var request = utils.request;
    utils.charset(request);
    console.log('start crawl diseases: ', url);
    request
      .get(url)
      .set('User-Agent', _this.options.site.headers['User-Agent'])
      .set('Cookie', _this.options.site.headers.Cookie)
      .set('Host', _this.options.site.headers.Host)
      .charset('gbk')
      .end(function (err, res) {
        if (err) {
          console.log('Disease Error : ', err);
          return cb1(err);
        }
        var $ = utils.$.load(res.text);
        var diseases = $('font.bgfont');

        var disease = diseases.eq(0);
        var adiseases = disease.next().next().find('tr > td > a');

        adiseases.each(function () {
          var ad = $(this);
          var adResult = {
            name: ad.text().replace(/[\s|\r|\n]+/g, ''),
            url: configs.site.host + '/' + ad.attr('href')
          };
          result.diseases.push(adResult);
        });

        var pest = diseases.eq(1);
        var apest = pest.next().next().find('tr > td > a');

        apest.each(function () {
          var ap = $(this);
          var apResult = {
            name: ap.text().replace(/[\s|\r|\n]+/g, ''),
            url: configs.site.host + '/' + ap.attr('href')
          };
          result.pests.push(apResult);
        });
        return cb1(null, result);
      });
  }, function (err, results) {
    cb(err, results);
  })
};

Spider.prototype.crawlDiseaseDetail = function (diseases, cb) {
  if (!diseases || diseases.length === 0) {
    return cb(null, []);
  }
  var _this = this;
  utils.async.map(diseases, function (disease, cb1) {
    var result = {
      name: disease.name,
      url: disease.url,
      name_en: '',
      synonyms: '',
      intro: '',
      imgs: [],
      damageSym: '',
      pathogen: '',
      cycle: '',
      factor: '',
      morphology: '',
      habits: '',
      cmethod: ''
    };
    var request = utils.request;
    utils.charset(request);
    console.log('start crawl diseases detail: ', disease.url);
    request
      .get(disease.url)
      .set('User-Agent', _this.options.site.headers['User-Agent'])
      .set('Cookie', _this.options.site.headers.Cookie)
      .set('Host', _this.options.site.headers.Host)
      .charset('gbk')
      .end(function (err, res) {
        if (err) {
          console.log('Disease Detail Error : ', err);
          return cb1(err);
        }
        var $ = utils.$.load(res.text);
        result.name_en = $('#lblNameEng').text();
        result.synonyms = $('#lblSynonyms').text();
        result.intro = $('#lblIntroduction').text();
        $('a img').each(function () {
          var $this = $(this);
          var img = {
            url: configs.site.host + '/' + $this.attr('src'),
            desc: $this.attr('alt')
          };
          result.imgs.push(img);
        });
        result.damageSym = $('#lblDamageSym').text();
        result.pathogen = $('#lblPathogen').text();
        result.cycle = $('#lblCycle').text();
        result.factor = $('#lblOFactor').text();
        result.morphology = $('#lblMorphology').text();
        result.habits = $('#lblHabits').text();
        result.cmethod = $('#lblCMethod').text();
        return cb1(null, result);
      });
  }, function (err, results) {
    cb(err, results);
  })
};

module.exports = Spider;