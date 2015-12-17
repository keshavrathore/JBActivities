define( function( require ) {
	var Postmonger = require( 'postmonger' );
	var $ = require( 'vendor/jquery.min' );

    var connection = new Postmonger.Session();
	var tokens;
	var endpoints;
	var inArgPayload = {};

    $(window).ready(function() {
        connection.trigger('ready');
		connection.trigger('requestTokens');
		connection.trigger('requestEndpoints');
    });

	// This listens for Journey Builder to send tokens
	// Parameter is either the tokens data or an object with an
	// "error" property containing the error message
	connection.on('getTokens', function( data ) {
		if( data.error ) {
			console.error( data.error );
		} else {
			tokens = data;
		}
	});
	
	connection.on('initActivity', function(payload) {
        if (payload) {
            inArgPayload = payload;
			if(inArgPayload['arguments'].execute.inArguments.length > 1) {
				if(inArgPayload['arguments'].execute.inArguments[1].hasOwnProperty("url")) {
					$('#url').val(inArgPayload['arguments'].execute.inArguments[1].url);
				}
				if(inArgPayload['arguments'].execute.inArguments[2].hasOwnProperty("headers")) {
					$('#headers').val(inArgPayload['arguments'].execute.inArguments[2].headers);
				}
				if(inArgPayload['arguments'].execute.inArguments[3].hasOwnProperty("httppayload")) {
					$('#httppayload').val(inArgPayload['arguments'].execute.inArguments[3].httppayload);
				}
			}
            console.log('payload',JSON.stringify(payload));
			
        }
        
    });

	/**
		If you want to have a multi-step configuration view, you need to manage the DOM manually.
		You can filter what changes to make by implementing the following type of logic when Postmonger from the server triggers an "updateStep" call.
		// connection.on('updateStep', step ) {

			if( step  >= 1 && step <= 3 ) {
				$('.step').hide(); // All DOM elements which are steps should have this class (this hides them all)
				$('#step' + step ).show(); // This selectively only displays the current step
				// Allow the user to make any changes and when you're ready, use:
				connection.trigger( 'updateStep', step ); 
			}
		}
	**/
	connection.on('updateStep', function( data ) {
		inArgPayload['arguments'].execute.inArguments.push({"message": $('#message').val().trim()});
		inArgPayload.metaData.isConfigured = true;
        connection.trigger('updateActivity',inArgPayload);
		
	});
	// This listens for Journey Builder to send endpoints
	// Parameter is either the endpoints data or an object with an
	// "error" property containing the error message
	connection.on('getEndpoints', function( data ) {
		if( data.error ) {
			console.error( data.error );
		} else {
			endpoints = data;
		}
	});

    connection.on('requestPayload', function() {
	 var payload = {};
 
        payload.options = {
           
        };

		//TODO: Shouldn't this come from the data?
        payload.flowDisplayName = 'HTTP Activity';
 
        connection.trigger('getPayload', payload);
    });

	// Journey Builder broadcasts this event to us after this module
	// sends the "ready" method. JB parses the serialized object which
	// consists of the Event Data and passes it to the
	// "config.js.save.uri" as a POST
    connection.on('populateFields', function(payload) {
    });
	
	connection.on('clickedNext', function() {
		if(inArgPayload['arguments'].execute.inArguments.length > 1) {
			if(inArgPayload['arguments'].execute.inArguments[1].hasOwnProperty("url")) {
				inArgPayload['arguments'].execute.inArguments[1].url = $('#url').val().trim();
			}
			if(inArgPayload['arguments'].execute.inArguments[2].hasOwnProperty("headers")) {
				inArgPayload['arguments'].execute.inArguments[2].headers = $('#headers').val();
			}
			if(inArgPayload['arguments'].execute.inArguments[3].hasOwnProperty("httppayload")) {
				inArgPayload['arguments'].execute.inArguments[3].httppayload = $('#httppayload').val();
			}
		}
		else {
			inArgPayload['arguments'].execute.inArguments.push({"url": $('#url').val().trim()});
			inArgPayload['arguments'].execute.inArguments.push({"headers": $('#headers').val()});
			inArgPayload['arguments'].execute.inArguments.push({"httppayload": $('#httppayload').val()});
		}
		inArgPayload.metaData.isConfigured = true;
        connection.trigger('updateActivity',inArgPayload);
    });

	// Trigger this method when updating a step. This allows JB to
	// update the wizard.
    //connection.trigger('updateStep', nextStep);

	// When everything has been configured for this activity, trigger
	// the save:
	// connection.trigger('save', 
});
