function getNowYMD(){
  var dt = new Date();
  var y = dt.getFullYear();
  var m = ("00" + (dt.getMonth()+1)).slice(-2);
  var d = ("00" + dt.getDate()).slice(-2);
  var result = y + "/" + m + "/" + d;
  return result;
}

function getYMD(n){
  var dt = new Date();
  dt.setDate(dt.getDate() - n);
  var y = dt.getFullYear();
  var m = ("00" + (dt.getMonth()+1)).slice(-2);
  var d = ("00" + dt.getDate()).slice(-2);
  var result = y + "/" + m + "/" + d;
  return result;
}

var express = require('express');
var router = express.Router();
var sqlite3 = require('better-sqlite3');
var db = new sqlite3('kenko.db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'How are you?' });
});

router.get('/mini', function(req, res, next) {
  res.render('index-mini', { title: 'How are you?' });
});

function getData(){
  var sql = "select * from Tshuke order by date";

  var row = db.prepare(sql).all();

  var date = [];

  var i=0;
  while(i < row.length){
    date.push(row[i].date);
    ++i;
  }

  var sick = [];

  i = 0;
  while(i < row.length){
    sick.push( row[i].bunshi* 100/ row[i].bunbo );
    ++i;
  }



  var lastDate = date[date.length-1];

  sql = 
  "select"                                 +
  " (select count(peopleID) from Tkenko"   +
  " where date=?) as Bunbo,"               +
  " (select count(peopleID) from Tkenko"   +
  " where date=? and state=1) as Bunshi"   ;

  var tarin_sick = [];
  var tarin_date = [];

  i = 0;
  var ymd = getYMD(i);
  while(ymd != lastDate){
    row = db.prepare(sql).get(ymd, ymd);
    tarin_sick.push(row.Bunshi* 100/ row.Bunbo);
    tarin_date.push(ymd);

    ++i;
    ymd = getYMD(i);
  }

  tarin_sick.reverse();
  tarin_date.reverse();

  // sick.concat(tarin_sick);
  // date.concat(tarin_date);

  return [date.concat(tarin_date),sick.concat(tarin_sick)];

}

function setData_OLD(){
  var sql = 
    "select"                                 +
    " (select count(peopleID) from Tkenko"   +
    " where date=?) as Bunbo,"               +
    " (select count(peopleID) from Tkenko"   +
    " where date=? and state=1) as Bunshi"   ;

    var row;

    row = db.prepare(sql).get(getYMD(0), getYMD(0));
    var data0 = (row.Bunshi/row.Bunbo) * 100;

    row = db.prepare(sql).get(getYMD(1), getYMD(1));
    var data1 = (row.Bunshi/row.Bunbo) * 100;

    row = db.prepare(sql).get(getYMD(2), getYMD(2));
    var data2 = (row.Bunshi/row.Bunbo) * 100;

    row = db.prepare(sql).get(getYMD(3), getYMD(3));
    var data3 = (row.Bunshi/row.Bunbo) * 100;

    row = db.prepare(sql).get(getYMD(4), getYMD(4));
    var data4 = (row.Bunshi/row.Bunbo) * 100;

    row = db.prepare(sql).get(getYMD(5), getYMD(5));
    var data5 = (row.Bunshi/row.Bunbo) * 100;

    row = db.prepare(sql).get(getYMD(6), getYMD(6));
    var data6 = (row.Bunshi/row.Bunbo) * 100;

  return [data0,data1,data2,data3,data4,data5,data6];
  
}

/* genki */
router.get('/fine', function(req, res, next) {
  var motteru = req.cookies.peopleID;
  if (motteru === undefined){
    // motte konai hito
    var row = db.prepare('select max(peopleID) as max from Tkenko').get();
    var peopleID = row.max + 1;
    var date = getNowYMD();
    var state = 0;
    db.prepare('insert into Tkenko (date, state, peopleID) values (?, ?, ?)').run(
      date,
      state,
      peopleID
    );
    res.cookie("peopleID",peopleID);
    // var data = setData();
    // res.render('thanks', { 
    //   title: 'Good luck!', 
    //   data0: data[0], 
    //   data1: data[1],
    //   data2: data[2],
    //   data3: data[3],
    //   data4: data[4],
    //   data5: data[5],
    //   data6: data[6],
    //   date0: getYMD(0),
    //   date1: getYMD(1),
    //   date2: getYMD(2),
    //   date3: getYMD(3),
    //   date4: getYMD(4),
    //   date5: getYMD(5),
    //   date6: getYMD(6),
    // });
    res.redirect("/graph");
  }else{
    // motte kita hito
      var peopleID = motteru;
      var date = getNowYMD();
      var state = 0;
      db.prepare('delete from Tkenko where peopleID = ? and date = ? ').run(
        peopleID,
        date
      );
      db.prepare('insert into Tkenko (date, state, peopleID) values (?, ?, ?)').run(
        date,
        state,
        peopleID
      );
      // var data = setData();
      // res.render('thanks', { 
      //   title: 'Good luck!', 
      //   data0: data[0], 
      //   data1: data[1],
      //   data2: data[2],
      //   data3: data[3],
      //   data4: data[4],
      //   data5: data[5],
      //   data6: data[6],
      //   date0: getYMD(0),
      //   date1: getYMD(1),
      //   date2: getYMD(2),
      //   date3: getYMD(3),
      //   date4: getYMD(4),
      //   date5: getYMD(5),
      //   date6: getYMD(6),  
      // });
      res.redirect("/graph");
  }

});


/* kaze */
router.get('/sick', function(req, res, next) {
  var motteru = req.cookies.peopleID;
  if (motteru === undefined){
    // motte konai hito
    var row = db.prepare('select max(peopleID) as max from Tkenko').get();
    var peopleID = row.max + 1;
    var date = getNowYMD();
    var state = 1;
    db.prepare('insert into Tkenko (date, state, peopleID) values (?, ?, ?)').run(
      date,
      state,
      peopleID
    );
    res.cookie("peopleID",peopleID);
    // var data = setData();
    // res.render('thanks', { 
    //   title: 'Take a rest.', 
    //   data0: data[0], 
    //   data1: data[1],
    //   data2: data[2],
    //   data3: data[3],
    //   data4: data[4],
    //   data5: data[5],
    //   data6: data[6],
    //   date0: getYMD(0),
    //   date1: getYMD(1),
    //   date2: getYMD(2),
    //   date3: getYMD(3),
    //   date4: getYMD(4),
    //   date5: getYMD(5),
    //   date6: getYMD(6),
    // });
    res.redirect("/graph");
  }else{
    // motte kita hito
      var peopleID = motteru;
      var date = getNowYMD();
      var state = 1;
      db.prepare('delete from Tkenko where peopleID = ? and date = ? ').run(
          peopleID,
          date
      );
      db.prepare('insert into Tkenko (date, state, peopleID) values (?, ?, ?)').run(
        date,
        state,
        peopleID
      );
      // var data = setData();
      // res.render('thanks', { 
      //   title: 'Take a rest.', 
      //   data0: data[0], 
      //   data1: data[1],
      //   data2: data[2],
      //   data3: data[3],
      //   data4: data[4],
      //   data5: data[5],
      //   data6: data[6],
      //   date0: getYMD(0),
      //   date1: getYMD(1),
      //   date2: getYMD(2),
      //   date3: getYMD(3),
      //   date4: getYMD(4),
      //   date5: getYMD(5),
      //   date6: getYMD(6),  
      // });
      res.redirect("/graph");
  }
});

router.get('/graph', function(req, res, next) {
  var data = getData();
  res.render('thanks', { 
    title: 'How are you?', 
    data: JSON.stringify(data[1]),
    date: JSON.stringify(data[0]),
  });
});

router.get('/api', function(req, res, next) {
  var data = getData();
  res.send({ 
    title: 'How are you?', 
    data: data[1],
    date: data[0],
  });
});


module.exports = router;