/**
 * parse a CSV file and convert it to an array of objects
 * @param options  object   options with file and optional beadings
 * @param callback function the function to be called on error or success.
 *                          first argument is the error if any,
 *                          second is the array of record objects
 */
module.exports = function (options, callback) {
  var fs = require('fs');
  var parse = require('csv-parse');

  // Create a CSV parser
  var parser = parse({delimiter: ','});

  // the keys for the record objects provided in options.headings or taken
  // from the csv table headings
  var dataKeys;
  var recordLength;
  var records = [];

  var needHeadings = true;

  // Whenever data is ready to be read from the input
  parser.on('readable', function(){
    // the first record will be an array of headings
    if (needHeadings) {
      var headings = parser.read();

      // if alternative headings are supplied, discared the headings read
      // fromt the file
      if (options.headings) {
        headings = options.headings;
      }

      recordLength = headings.length;

      // make the headings lower case and use them as keys for the record
      // objects
      dataKeys = headings.map(function (heading) {
        return heading.toLowerCase();
      });

      needHeadings = false;
    }

    var recordArray;

    // read each available record
    while ((recordArray = parser.read())) {
      // Each record is read as an array of string values
      // An object is made for the record and appended to the records array
      var recordObject = {};
      records.push(recordObject);

      // Each entry will have as properties the strings in the dataKeys array.
      // The values of those properties will be the corresponding record values
      for (var i = 0; i < recordLength; i++) {
        recordObject[dataKeys[i]] = recordArray[i];
      }
    }
  });

  // Catch any error
  parser.on('error', function(err){
    callback(err, null);
  });

  // When we are done, test that the parsed output matched what expected
  parser.on('finish', function(){
    callback(null, records);
  });

  // create a stream of the file and pipe it into the parser
  fs.createReadStream(options.file).pipe(parser);
};
