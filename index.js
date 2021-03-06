var express = require('express');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var mongoose = require('mongoose');
var Spider = require('./lib');
var utils = require('./lib/utils');
var Models = require('./models');

var spider = new Spider();

var configs = require('./config');

var data = require('./data');

var app = express();

var port = process.env.PORT || configs.services.port;

var mongodbUrl = "mongodb://" + configs.db.user + ':' + configs.db.pass + '@' + configs.db.host + ":" + configs.db.port + "/" + configs.db.name;
mongoose.connect(mongodbUrl);

app.set('port', port);
app.use(logger('dev'));

var router = express.Router();

/*
router.get('/', function (req, res) {
  res.json(configs.apis);
});

router.get('/categories', function (req, res) {
  spider.crawlCategory(function (err, categories) {
    if (err) {
      return res.status(500).send(err);
    }
    return res.status(200).send(categories);
  })
});

router.get('/initCategories', function (req, res) {

  if (!configs.init.categories.on) {
    return res.status(200).send("Please contact administrator turn on init categories.");
  }

  utils.async.waterfall([
    function (cb) {
      var hook = {};
      spider.crawlCategory(function (err, categories) {
        if (err) {
          return cb(err);
        }
        hook.categories = categories;
        return cb(null, hook);
      });
    },
    function (hook, cb) {
      utils.async.map(hook.categories, function (category, callback) {

        var ins = {
          name: category.c1,
          belong: category.c2,
          hidden: utils._.includes(configs.init.categories.show, category.c1),
          level: 1,
          subs: category.subs
        };

        var c = Models.Category(ins);

        c.save(function (err, model) {
          if(err) {
            return callback(err);
          }
          return callback(null, model);
        })

      }, function (err, results) {
        if (err) {
          return cb(err);
        }
        hook.saved = results;
        
        return cb(null, hook);
      });
    }
  ], function (err, results) {
    if (err) {
      return res.status(500).send(err);
    }
    return res.status(200).send({ok: true});
  });

});


router.get('/diseases', function (req, res) {

  var categories = [{
    name: '水稻',
    url: 'http://bcch.ahnw.gov.cn/Show.aspx?id=30&type=crop'
  }];

  spider.crawlDisease(categories, function (err, diseases) {
    if (err) {
      return res.status(500).send(err);
    }
    return res.status(200).send(diseases);
  });

});

router.get('/diseases/detail', function (req, res) {
  var diseases = [{
    name: '稻瘟病',
    url: 'http://bcch.ahnw.gov.cn/CropContent.aspx?id=3393'
  }];
  spider.crawlDiseaseDetail(diseases, function (err, detail) {
    if (err) {
      return res.status(500).send(err);
    }
    return res.status(200).send(detail);
  });
});

*/

router.get('/initCategories', function (req, res) {

	utils.async.map(data.categories.array, function (category, callback) {

 		var c = Models.Category(category);

    c.save(function (err, model) {
    	if(err) {
    		return callback(err);
    	}
    	return callback(null, model);
    })	


	}, function (err, results) {

		if (err) {
			return res.json({code: 500, error: err});
		}		

		return res.json(results);

	});


});

router.get('/initNongZuoWu', function (req, res) {

	var nongzuowuId = mongoose.Types.ObjectId(data.categories.nongzuowuId);

	utils.async.map(data.nongzuowu, function (nongzuowu, callback) {

		var nzw = {
			name: nongzuowu.name,
			isDelete: 0,
			level: 2,
			parentId: nongzuowuId,
			createdAt: new Date(),
			updatedAt: new Date()
		}

		var nzwModel = Models.Category(nzw);

		nzwModel.save(function (err, model) {
			if (err) {
				return callback(err);
			}
			return callback(null, model);
		})
	
	}, function (err, results) {
		if (err) {
			return res.json({code: 500, error: err});
		}
		return res.json(results);	
	});

});

router.get('/initShuiGuoShuCai', function (req, res) {

	var shuiguoshucaiId = mongoose.Types.ObjectId(data.categories.shuiguoshucaiId);

	utils.async.map(data.shuiguoshucai, function (shuiguoshucai, callback) {

		var sgsc = {
			name: shuiguoshucai.name,
			isDelete: 0,
			level: 2,
			parentId: shuiguoshucaiId,
			createdAt: new Date(),
			updatedAt: new Date()
		}

		var sgscModel = Models.Category(sgsc);

		sgscModel.save(function (err, model) {
			if (err) {
				return callback(err);
			}
			return callback(null, model);
		})
	
	}, function (err, results) {
		if (err) {
			return res.json({code: 500, error: err});
		}
		return res.json(results);	
	});


});

router.get('/initGuoShu', function (req, res) {

	var guoshuId = mongoose.Types.ObjectId(data.categories.guoshuId);

	utils.async.map(data.guoshu, function (guoshu, callback) {

		var gs = {
			name: guoshu.name,
			isDelete: 0,
			level: 2,
			parentId: guoshuId,
			createdAt: new Date(),
			updatedAt: new Date()
		}

		var gsModel = Models.Category(gs);

		gsModel.save(function (err, model) {
			if (err) {
				return callback(err);
			}
			return callback(null, model);
		})
	
	}, function (err, results) {
		if (err) {
			return res.json({code: 500, error: err});
		}
		return res.json(results);	
	});

});

router.get('/initQiTa', function (req, res) {
	var qitaId = mongoose.Types.ObjectId(data.categories.qitaId);

	utils.async.map(data.qita, function (qita, callback) {

		var qt = {
			name: qita.name,
			isDelete: 1,
			level: 2,
			parentId: qitaId,
			createdAt: new Date(),
			updatedAt: new Date()
		}

		var qtModel = Models.Category(qt);

		qtModel.save(function (err, model) {
			if (err) {
				return callback(err);
			}
			return callback(null, model);
		})
	
	}, function (err, results) {
		if (err) {
			return res.json({code: 500, error: err});
		}
		return res.json(results);	
	});
});

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

app.use('/', router);

app.listen(port, function () {
  console.log('Agriculture Spider API running at ' + port + ' port!');
});
