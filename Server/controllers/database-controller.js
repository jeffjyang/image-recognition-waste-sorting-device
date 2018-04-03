const server = require('../server.js');
const recognitionController = require('./image-recognition-controller.js');
const GARBAGE_TYPE = recognitionController.GARBAGE_TYPE;

const db = server.db;


// return true if success, false otherwise
var setMode = function (response, id, auto, garbageOpen, recyclingOpen, compostOpen) {
  console.log("in function setMode");
  db.all("SELECT garbage_open, recycling_open, compost_open FROM mode WHERE id = (?)", [id],
      function (err, rows){
        if (err) {
          response.json({"success": false});
          return;
        }
        if (rows !== undefined && rows.length > 0) {

          var currGarbageState = rows[0].garbage_open;
          var currRecyclingState = rows[0].recycling_open;
          var currCompostState = rows[0].compost_open;
          console.log(currGarbageState + " " + currRecyclingState + " " + currCompostState);

          if (auto) {
  //          console.log("testid pass, if true");
            db.run("UPDATE mode SET (auto) = (?) WHERE id = (?)",
                [auto, id],
                function (err, rows) {
                  response.json({"success": !err && rows !== null});
                });
          } else {
 //           console.log("testid pass, else");
            db.run("UPDATE mode SET (auto, garbage_open, recycling_open, compost_open) = (?, ?, ?, ?) WHERE id = (?)",
                [auto, garbageOpen, recyclingOpen, compostOpen, id],
                function (err, rows) {
                  response.json({"success": !err && rows !== null});
                });

            if (garbageOpen && !currGarbageState) {
              addHistoryEntry(id, "garbage");
            }
            if (recyclingOpen && !currRecyclingState) {
              addHistoryEntry(id, "recycling");
            }
            if (compostOpen && !currCompostState) {
              addHistoryEntry(id, "compost");
            }
          }

        } else {
//         console.log("testid fail");
          db.run("INSERT INTO mode (id, auto, garbage_open, recycling_open, compost_open) VALUES (?,?,?,?,?)",
              [id, auto, garbageOpen, recyclingOpen, compostOpen],
              function (err, rows) {
                response.json({"success": !err && rows !== null});
              });
          if (garbageOpen) {
            addHistoryEntry(id, "garbage");
          }
          if (recyclingOpen) {
            addHistoryEntry(id, "recycling");
          }
          if (compostOpen) {
            addHistoryEntry(id, "compost");
          }
        }
      });
}

var getMode = function (id, response) {
  console.log("in function getMode, id: " + id);
  db.all("SELECT auto FROM mode WHERE id = (?)", [id],
      function (err, rows){
        if (err || rows.length !== 1) {
          response.json({
            success: false
          });
          return;
        }
        if (rows[0].auto) {
          response.json({
            success: true,
            auto: true
          });
          return;
        }
        db.all("SELECT garbage_open, recycling_open, compost_open FROM mode WHERE id = (?)", [id],
          function (err, rows){
//            console.log(rows.length);
            if (err || rows.length != 1) {
              response.json({
                success: false
              });
              return;
            }
            response.json({
              success: true,
              auto: false,
              garbageOpen: !!rows[0].garbage_open,
              recyclingOpen: !!rows[0].recycling_open,
              compostOpen: !!rows[0].compost_open
            });
            return;
          });
      });
}









// add entry to history table
var addHistoryEntry = function (id, waste) {
  console.log("in function addHistoryEntry id: " + id);
  switch (waste) {
    case GARBAGE_TYPE.GARBAGE: waste_type = 1; break;
    case GARBAGE_TYPE.RECYCLING: waste_type = 2; break;
    case GARBAGE_TYPE.COMPOST: waste_type = 3; break;
  }
  db.run("INSERT INTO history (id, waste_type, timestamp) VALUES (?,?,datetime('now', 'localtime'))", [id, waste_type],
      function (err, rows) {
        return !err && rows !== null;
      });
}

/*
{
  success: boolean,
  todayGarbageCount: int,
  todayRecyclingCount: int,
  todayCompostCount: int,
  yesterdayGarbageCount: int,
  yesterdayRecyclingCount: int,
  yesterdayCompostCount: int
}
*/
var getHistory = function (id, response) {
  db.all("SELECT * FROM history WHERE id = (?)", [id],
      function (err, rows){
        if (err) {
          response.json({
            success: false,
            history: []
          });
        }


        var historyArr = [];

        for (var i = 0; i < rows.length; i++) {
          historyArr.push(
              {
                "time": rows[i].timestamp,
                "bin": rows[i].waste_type
              }
            );
        }
        response.json({
          success: true,
          history: historyArr
        });
      });
}


var empty = function (id, response) {
  db.run("DELETE FROM history WHERE id = (?)", [id],
      function(err, rows) {
        response.json({
          success: !err && rows !== null
        });
      });
}







// private helper function
// tests if id already exists in table
var testId = function (id) {
  return db.all("SELECT 1 FROM mode WHERE id = (?) LIMIT 1", [id],
      function (err, rows){
        if (err) {
          return false;
        }
        console.log(rows.length);
        return rows.length > 0;
      });
}


module.exports = {
  addHistoryEntry: addHistoryEntry,
  getHistory: getHistory,
  getMode: getMode,
  setMode: setMode,
  empty: empty
}
