// Module dependencies
var express = require('express'),
    mysql = require('mysql'),
    connect = require('connect');

// Application initialization
var connection = mysql.createConnection({
    host: 'cwolf.cs.sonoma.edu',
    user: 'jedison',
    password: '3948820'
});

var app = express();

// Database setup
connection.query('USE jedison', function (err) {
    if (err) throw err;
});

// Configuration
app.use(connect.bodyParser());

app.use(express.static(__dirname + '/public'));

// Main route sends our HTML file
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

app.get('/createuser', function (req, res) {
    res.sendfile(__dirname + '/create.html');
});

app.get('/edit', function (req, res) {
    res.sendfile(__dirname + '/edit.html');
});

app.get('/getuser', function (req, res) {
    res.sendfile(__dirname + '/view.html');
});

app.get('/about', function (req, res) {
    res.sendfile(__dirname + '/about.html');
});

// ------------------------------ VIEW TABLES ------------------------------
app.post('/getMusicians', function (req, res) {
    connection.query('select * from Musician order by LName',
        function (err, result) {
            console.log("RESULT: " + result);
            var responseHTML = '<table id="muscianTable"><tr><th>Email</th><th>First Name</th><th>Last Name</th><th>Instrument</th></tr>';
            for (var i = 0; i < result.length; i++) {
                responseHTML += '<tr><td>' + result[i].Email + '</td>' +
                                '<td>' + result[i].FName + '</td>' +
                                '<td>' + result[i].LName + '</td>' +
                                '<td>' + result[i].Instrument + '</td>' +
                                '</tr>';
            }
            responseHTML += '</table>';
            res.send(responseHTML);
        }
    );
});

app.post('/getBands', function (req, res) {
    connection.query('select * from Band order by Name',
        function (err, result) {
            var responseHTML = '<table id="bandTable"><tr><th>Name</th><th>City</th><th>Manager Email</th></tr>';
            for (var i = 0; i < result.length; i++) {
                responseHTML += '<tr><td><a href="/members/?BandID=' + result[i].BandID + '">' + result[i].Name + '</a></td>' +
                                '<td>' + result[i].City + '</td>' +
                                '<td>' + result[i].ManagerEmail + '</td>' +
                                '</tr>';
            }
            responseHTML += '</table>';
            res.send(responseHTML);
        }
    );
    });

    app.post('/getVenues', function (req, res) {
        connection.query('select * from Venue order by Name',
        function (err, result) {
            var responseHTML = '<table id="venueTable"><tr><th>Name</th><th>City</th><th>Street</th><th>Zip</th><th>Phone</th></tr>';
            for (var i = 0; i < result.length; i++) {
                responseHTML += '<tr><td>' + result[i].Name + '</td>' +
                                '<td>' + result[i].City + '</td>' +
                                '<td>' + result[i].Street + '</td>' +
                                '<td>' + result[i].Zip + '</td>' +
                                '<td>' + result[i].Phone + '</td>' +
                                '</tr>';
            }
            responseHTML += '</table>';
            res.send(responseHTML);
        }
    );
    });

    app.post('/getConcerts', function (req, res) {
        connection.query('select v.Name as venueName, c.* from Concert c join Venue v on c.VenueID = v.VenueID order by c.Name',
        function (err, result) {
            console.log(result);
            var responseHTML = '<table id="concertTable"><tr><th>Name</th><th>Time</th><th>Venue</th></tr>';
            for (var i = 0; i < result.length; i++) {
                responseHTML += '<tr><td>' + result[i].Name + '</td>' +
                                '<td>' + result[i].ConcertTime + '</td>' +
                                '<td>' + result[i].venueName + '</td>';
                responseHTML += '</tr>';
            }
            responseHTML += '</table>';
            res.send(responseHTML);
        }
    );
    });

// ------------------------------ BAND MEMBERS ------------------------------
app.get('/members', function (req, res) {
    if (typeof req.query.BandID != 'undefined') {
        connection.query('select * from PlaysIn p natural join Band b join Musician m on p.MusicianEmail = m.Email where p.BandID = ? order by m.LName', req.query.BandID,
        function (err, result) {
            console.log(result);
            if (result.length > 0) {
                var responseHTML = '<html><h3>' + result[0].Name + ' Band Members</h3><link href="/style.css" rel="stylesheet"><body><table><tr><th>Name</th><th>Instrument</th><th>Email</th></tr>';
            for (var i = 0; i < result.length; i++) {
                responseHTML += '<tr><td>' + result[i].FName + ' ' + result[i].LName + '</td>' +
                '<td>' + result[i].Instrument + '</td>' +
                '<td>' + result[i].MusicianEmail + '</td></tr>';
            }
                responseHTML += ' </table></body></html>';
                res.send(responseHTML);
            }
            else
                res.send('User does not exist.');
        }
    );
    }
    //get user by username    
    else if (typeof req.query.username != 'undefined') {
        connection.query('select username, password from users where username = ?', req.query.username,
        function (err, result) {
            console.log(result);
            if (result.length > 0) {
                res.send('Username: ' + result[0].username + '<br />' +
		  	    'Password: ' + result[0].password
            );
            }
            else
                res.send('User does not exist.');
        });
    }
    else {
        res.send('no data for user in request');
    }
});

// ------------------------------ CHECKBOXES ------------------------------
// get all users into checkboxes
app.post('/musicians/checkbox', function (req, res) {
    console.log(req.body);
    connection.query('select * from Musician order by LName',
		function (err, result) {
		    console.log(result);
		    var responseHTML = '<form class="container" id="musician-list">';
		    for (var i = 0; result.length > i; i++) {
		        var option = '<input type="checkbox" name="musicianCheckbox" value="' + result[i].Email + '" />' + result[i].FName + " " + result[i].LName + '<br />';
		        responseHTML += option;
		    }
		    responseHTML += '</form>';
		    res.send(responseHTML);
		});
});

// get all bands into checkboxes
app.post('/bands/checkbox', function (req, res) {
    console.log(req.body);
    connection.query('select * from Band order by Name',
		function (err, result) {
		    console.log(result);
		    var responseHTML = '<div class="container" id="band-list">';
		    for (var i = 0; result.length > i; i++) {
		        var option = '<input type="checkbox" name="bandCheckbox" ' + 'id="band' + i + '" value="' + result[i].BandID + '" />' + result[i].Name + '<br />';
		        console.log(option);
		        responseHTML += option;
		    }
		    responseHTML += '</div>';
		    res.send(responseHTML);
		});
});

// ------------------------------ DROPDOWN LISTS ------------------------------
app.post('/venues/list', function (req, res) {
    console.log(req.body);
    connection.query('select * from Venue order by Name',
		function (err, result) {
		    console.log(result);
		    var responseHTML = '<select id="venue-list">';
		    for (var i = 0; result.length > i; i++) {
		        var option = '<option ' + 'id="venue' + i + '" value="' + result[i].VenueID + '" >' + result[i].Name + '</option>';
		        console.log(option);
		        responseHTML += option;
		    }
		    responseHTML += '</select>';
		    console.log(responseHTML);
		    res.send(responseHTML);
		});
});

app.post('/musicians/list', function (req, res) {
    console.log(req.body);
    connection.query('select * from Musician order by Email',
		function (err, result) {
		    console.log(result);
		    var responseHTML = '<select id="musician-list">';
		    for (var i = 0; result.length > i; i++) {
		        var option = '<option ' + 'id="musician' + i + '" value="' + result[i].Email + '" >' + result[i].Email + '</option>';
		        console.log(option);
		        responseHTML += option;
		    }
		    responseHTML += '</select>';
		    res.send(responseHTML);
		});
});

app.post('/bands/list', function (req, res) {
    console.log(req.body);
    connection.query('select * from Band order by Name',
		function (err, result) {
		    console.log(result);
		    var responseHTML = '<select id="band-list">';
		    for (var i = 0; result.length > i; i++) {
		        var option = '<option ' + 'id="band' + i + '" value="' + result[i].BandID + '" >' + result[i].Name + '</option>';
		        console.log(option);
		        responseHTML += option;
		    }
		    responseHTML += '</select>';
		    res.send(responseHTML);
		});
});

app.post('/concerts/list', function (req, res) {
    console.log(req.body);
    connection.query('select * from Concert order by Name',
		function (err, result) {
		    console.log(result);
		    var responseHTML = '<select id="concert-list">';
		    for (var i = 0; result.length > i; i++) {
		        var option = '<option ' + 'id="concert' + i + '" value="' + result[i].ConcertID + '" >' + result[i].Name + '</option>';
		        console.log(option);
		        responseHTML += option;
		    }
		    responseHTML += '</select>';
		    res.send(responseHTML);
		});
});

// ------------------------------ CREATES ------------------------------
app.post('/createMusician', function (req, res) {
    console.log(req.body);
    connection.query('INSERT INTO Musician SET ?', req.body,
        function (err, result) {
            if (err) throw err;
            connection.query('select * from Musician where Email = ?', req.body.Email,
		function (err, result) {
		    console.log(result);
		    if (result.length > 0) {
		        res.send(
                    'Email: ' + result[0].Email + '<br />' +
                    'First Name: ' + result[0].FName + '<br />' +
		  	        'Last Name: ' + result[0].LName + '<br />' +
                    'Instrument: ' + result[0].Instrument + '<br />'
		        );
		    }
		    else
		        res.send('User was not inserted.');
		});
        }
    );
});

app.post('/createBand', function (req, res) {
    console.log(req.body);
    var query = "INSERT INTO Band SET Name = '" + req.body.Name + "', City = '" + req.body.City + "', ManagerEmail = '" + req.body.ManagerEmail + "';";
    connection.query(query,
    function (err, result) {
        if (err) throw err;
        connection.query('select * from Band where Name = ?', req.body.Name,
	    function (err, result) {
	        var responseHTML;
	        console.log(result);
	        if (result.length > 0) {
	            responseHTML = 'Band Name: ' + result[0].Name + '<br />' +
                    'Band City: ' + result[0].City + '<br />' +
		  	        'Manager Email: ' + result[0].ManagerEmail + '<br />'
	            res.send(responseHTML);
	            for (var i = 0; i < req.body.Musicians.length; i++) {
	                var qry = "INSERT INTO PlaysIn SET MusicianEmail = '" + req.body.Musicians[i] + "', BandID = '" + result[0].BandID + "';";
	                console.log("QUERY: " + qry);
	                connection.query(qry,
                    function (err, result) {
                    });
	            }
	        }
	        else
	            res.send('User was not inserted.');
	    });
    });
});

app.post('/createVenue', function (req, res) {
    console.log(req.body);
    connection.query('INSERT INTO Venue SET ?', req.body,
        function (err, result) {
            if (err) throw err;
            connection.query('select * from Venue where Name = ?', req.body.Name,
		function (err, result) {
		    console.log(result);
		    if (result.length > 0) {
		        res.send(
                    'Name: ' + result[0].Name + '<br />' +
                    'City: ' + result[0].City + '<br />' +
		  	        'Street: ' + result[0].Street + '<br />' +
                    'Zip: ' + result[0].Zip + '<br />'
		        );
		    }
		    else
		        res.send('User was not inserted.');
		});
        }
    );
});

app.post('/createConcert', function (req, res) {
    console.log(req.body);
    var query = "INSERT INTO Concert SET Name = '" + req.body.Name + "', ConcertTime = '" + req.body.ConcertTime + "', VenueID = '" + req.body.VenueID + "';";
    connection.query(query,
        function (err, result) {
            if (err) throw err;
            connection.query('select * from Concert where Name = ?', req.body.Name,
		function (err, result) {
		    console.log(result);
		    if (result.length > 0) {
		        res.send(
                    'Name: ' + result[0].Name + '<br />' +
                    'Time: ' + result[0].ConcertTime + '<br />' +
		  	        'Venue: ' + result[0].VenueID + '<br />'
		        );
		        for (var i = 0; i < req.body.Bands.length; i++) {
		            var qry = "INSERT INTO BandsInConcert SET BandID = '" + req.body.Bands[i] + "', ConcertID = '" + result[0].ConcertID + "';";
		            console.log("QUERY: " + qry);
		            connection.query(qry,
                    function (err, result) {
                    });
		        }
		    }
		    else
		        res.send('User was not inserted.');
		});
        }
    );
});

// ------------------------------ EDITS ------------------------------
app.post('/editMusician', function (req, res) {
    console.log(req.body);
    var qry = "UPDATE Musician SET FName = '" + req.body.FName + "', LName = '" + req.body.LName + "', Instrument = '" + req.body.Instrument + "' WHERE Email = '" + req.body.Email + "'";
    connection.query(qry, 
        function (err, result) {
            if (err) throw err;
            connection.query('select * from Musician where Email = ?', req.body.Email,
		function (err, result) {
		    console.log(result);
		    if (result.length > 0) {
		        res.send(
                    'Email: ' + result[0].Email + '<br />' +
                    'First Name: ' + result[0].FName + '<br />' +
		  	        'Last Name: ' + result[0].LName + '<br />' +
                    'Instrument: ' + result[0].Instrument + '<br />'
		        );
		    }
		    else
		        res.send('User was not inserted.');
		});
        }
    );
});

app.post('/editBand', function (req, res) {
    console.log(req.body);
    var qry = "UPDATE Band SET City = '" + req.body.City + "', ManagerEmail = '" + req.body.ManagerEmail + "' WHERE BandID = '" + req.body.BandID + "'";
    connection.query(qry,
        function (err, result) {
            if (err) throw err;
            connection.query('select * from Band where BandID = ?', req.body.BandID,
		function (err, result) {
		    console.log(result);
		    if (result.length > 0) {
		        res.send(
                    'Name: ' + result[0].Name + '<br />' +
                    'City: ' + result[0].City + '<br />' +
		  	        'ManagerEmail: ' + result[0].ManagerEmail + '<br />' 
		        );
		    }
		    else
		        res.send('User was not inserted.');
		});
        }
    );
});

app.post('/editVenue', function (req, res) {
    console.log(req.body);
    var qry = "UPDATE Venue SET City = '" + req.body.City + "', Street = '" + req.body.Street + "', Zip = '" + req.body.Zip + "', Phone = '" + req.body.Phone + "' WHERE VenueID = '" + req.body.VenueID + "'";
    connection.query(qry,
        function (err, result) {
            if (err) throw err;
            connection.query('select * from Venue where VenueID = ?', req.body.VenueID,
		function (err, result) {
		    console.log(result);
		    if (result.length > 0) {
		        res.send(
                    'Name: ' + result[0].Name + '<br />' +
                    'City: ' + result[0].City + '<br />' +
		  	        'Street: ' + result[0].Street + '<br />' +
                    'Zip: ' + result[0].Zip + '<br />'
		        );
		    }
		    else
		        res.send('User was not inserted.');
		});
        }
    );
});

app.post('/editConcert', function (req, res) {
    console.log(req.body);
    var qry = "UPDATE Concert SET ConcertTime = '" + req.body.ConcertTime + "', VenueID = '" + req.body.VenueID + "' WHERE ConcertID = '" + req.body.ConcertID + "'";
    connection.query(qry,
        function (err, result) {
            if (err) throw err;
            connection.query('select * from Concert where ConcertID = ?', req.body.ConcertID,
		function (err, result) {
		    console.log(result);
		    if (result.length > 0) {
		        res.send(
                    'Name: ' + result[0].Name + '<br />' +
                    'Date: ' + result[0].ConcertTime + '<br />' +
		  	        'Venue: ' + result[0].VenueID + '<br />'
		        );
		    }
		    else
		        res.send('User was not inserted.');
		});
        }
    );
});

// Begin listening
app.listen(8005);
console.log("Express server listening on port %d in %s mode", app.settings.env);
