#!/usr/bin/env node

var parser = require( "../lib/parser" ),
    fs = require( "fs" ),
    path = require('path'),
    program = require( "commander" );

program
  .version( "0.0.1" )
  .usage( "[options] <file...>" )
  .option( "-s, --silent", "don't print errors messages" )
  .parse( process.argv );

var filenames = program.args,
    failed = false;

if( filenames.length < 1 ) {
  console.log( "Missing input file(s)." );
  console.log( "Usage: webvtt " + program.usage() );
  process.exit( 1 );
}

filenames.forEach( function( filename ) {
  try {
    var stats = fs.statSync( filename );
    if( !stats.isFile() ) {
      console.log( "webvtt: %s: Not a file.", filename );
      failed = true;
      return;
    }
    const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
    var A_Z = range(65, 90, 1); // A-Z
    var zero_nine = range(48, 57, 1); // 0-9
    var specialchars = [45, 95]; //'-', '_'
    var filebasename = path.basename(filename, path.extname(filename));
    for (var i = 0; i < filebasename.toUpperCase().length; i++) {
      if ( !(A_Z.concat(zero_nine, specialchars).includes(filebasename.toUpperCase()[i].charCodeAt(0))) ) {
        console.log( "webvtt: %s: Illegal characters in filename.", filename );
        failed = true;
        return;
      }
    }
  } catch( e ) {
    console.log( "webvtt: %s: No such file.", filename );
    failed = true;
    return;
  }

  var data = fs.readFileSync( filename, "utf-8" );
  if( !data ) {
    console.log( "webvtt: %s: Error - %s", filename, err.message );
    failed = true;
    return;
  }

  // Strip optional Unicode BOM character
  data = data.replace( /^\uFEFF/, '' );

  var r = ( new parser.WebVTTParser() ).parse( data ),
      errors = r.errors,
      error;

  for( var i = 0; i < errors.length; i++ ) {
    failed = true;
    error = errors[ i ];
    if( !program.silent ) {
      // sourcefile:lineno.column: message
      console.log( "%s: Line %s, Col %s: %s", filename, error.line, error.col|0, error.message );
    }
  }
});

process.exit( failed ? 1 : 0 );
