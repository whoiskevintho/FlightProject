// dynamically generate html part starts
function createInputField(ID, CLASS, PLACEHOLDER, ARAI_L, ARIA_DESC) {
    var mi = document.createElement("input");
    mi.setAttribute('type', 'text');
    mi.setAttribute('placeholder', PLACEHOLDER);
    mi.setAttribute('aria-describedby', ARIA_DESC);
    mi.setAttribute('aria-label', ARAI_L);
    mi.class = CLASS;
    mi.id = ID;
    return mi;
}

var flyTo = createInputField("to-fly", "form-control ", "City or airport", "Username", "basic-addon1");
$(flyTo).insertAfter(".inp-to");

var flyFrom = createInputField("from-fly", "form-control ", "City or airport", "Username", "basic-addon1");
$(flyFrom).insertAfter(".inp-from");

var datepicker = createInputField("datepicker", "form-control hasDatepicker", "MM/DD/YYYY", "", "basic-addon1");
$(datepicker).insertAfter(".inp-datepicker");

// Base API URL
var BASE_URL = 'http://comp426.cs.unc.edu:3001/';

// Initialize global cache...
var airports = [];
var airportsData = [];
var airportList = [];
var loc = [];

$(document).ready(function() {
    // alert("I am ready");
    $("#datepicker").addClass("form-control");

    // If Auth Cookie is not available or false, redirect to login page
    var authSuccess = localStorage.getItem("authSuccess");
    if (!authSuccess) {
        var str = window.location.pathname;
        var index = str.split("/");
        var lenObj = index.length;
        var len = lenObj - 1;
        if (index[len] != 'login.html') {
            window.location.href = 'login.html';
        }
    }

    // Cache Airport data...
    var URL = BASE_URL + 'airports';

    $.ajax({
        type: "GET",
        xhrFields: {
            withCredentials: true
        },
        url: URL,
        success: function(airportList) {

            for (var i in airportList) {
                locn = [];
                airports.push(airportList[i].name + " [" + airportList[i].code + "]");
                locn.push(airportList[i].name,
                    airportList[i].latitude,
                    airportList[i].longitude,
                    airportList[i].id,
                    airportList[i].code,
                    airportList[i].city,
                    airportList[i].state);
                loc.push(locn);
            }
        }
    });
});


/* Auto suggestion airports */
$(function() {
    $("#from-fly").autocomplete({
        source: airports,
        messages: {
            noResults: '',
            results: function() {}
        },
        appendTo: '#container_from_fly'
    });
});

$(function() {
    $("#to-fly").autocomplete({
        source: airports,
        messages: {
            noResults: '',
            results: function() {}
        },
        appendTo: '#container_to_fly'
    });
});
$("#to-fly,#from-fly").addClass('form-control '); //rewrite the class
/* Auto complete airports ends*/

//datepicker starts
$(function() {
    $("#datepicker").datepicker();
});

// Cache airline data for Preferred Airline dropdown..
var airlines = [];

$(document).ready(function() {
    var URL = BASE_URL + 'airlines';

    $.ajax({
        type: "GET",
        xhrFields: {
            withCredentials: true
        },
        url: URL,
        success: function(airlines) {
            var airlinesData = '';

            airlinesData += '<select id="selectPA"><option value="">No Preference</option>';
            for (var i in airlines) {
                airlinesData += '<option value=' + airlines[i].id + '>' + airlines[i].name + '</option>';
            }
            airlinesData += '</select>';
            document.getElementById('airlinesDropDown').innerHTML = airlinesData;
        }
    });
});

/*Enable search button once 'from' and 'to' along with date is selected*/
$(document).ready(function() {
    $('#from-fly, #to-fly, #datepicker').change(function() {
        if ($('#from-fly').val() != '' &&
            $('#to-fly').val() != '' &&
            $('#datepicker').val() != '') {
            $('#searchBtn').attr('disabled', false);
        }
    });
});

// Google map - callback handler to render the map and the pins for the airport location
function initMap() {
    /* All airports are being passed to google map*/
    var locations = loc;

    $(document).on("click", "#global-map", function() {
        // alert("hello");
        $('#map').show();
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 4,
            center: new google.maps.LatLng(41.97859955, -87.90480042),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        var infowindow = new google.maps.InfoWindow({});
        var marker, i;

        for (i = 0; i < locations.length; i++) {
            marker = new google.maps.Marker({
                position: new google.maps.LatLng(locations[i][1], locations[i][2]),
                map: map
            });

            google.maps.event.addListener(marker, 'click', (function(marker, i) {
                return function() {
                    infowindow.setContent(locations[i][0] + " [" + locations[i][4] + "]<br>" +
                        locations[i][5]);
                    infowindow.open(map, marker);
                }
            })(marker, i));
        }
    });
}

//search button click for alert
$(document).on("click", "#searchBtn", function() {

    if ($("#from-fly").val().length == 0 || $("#to-fly").val().length == 0 || $('#datepicker').val() == '') {
        alert("Please provide 'Flying from' , 'Flying To', and 'Departure Date");
    } else {
        //console.log("From: " + $('#from-fly').val());
        //console.log("To: " + $('#to-fly').val());
        departureAirport = $("#from-fly").val();
        arrivalAirport = $("#to-fly").val();

        // We need to get the code to lookup for matching flights for from and to
        var departureId = null; //133030; //'Ft Lauderdale';
        var arrivalId = null; //133101; //'Orlando';

        // Comvert the date into proper format that API recongizes..
        tempDate = $('#datepicker').val();
        newDate = tempDate.split("/");
        tDate = newDate[2] + "-" + newDate[0] + "-" + newDate[1];

        // Fetch the preferred airline...
        pAirlineId = $('#selectPA').val();

        var departureArr = departureAirport.split("[");
        var departureCode = departureArr[1].split("]");

        var arrivalArr = arrivalAirport.split("[");
        var arrivalCode = arrivalArr[1].split("]");

        for (var i = 0; i < loc.length; i++) {
            if (departureCode[0] === loc[i][4]) {
                departureId = loc[i][3]; // Fetch the Airline ID for Departure
            }

            if (arrivalCode[0] === loc[i][4]) {
                arrivalId = loc[i][3]; // Fetch the Airline ID for Arrival
            }

            if (departureId && arrivalId) {
                break;
            }
        }

        console.log("DID: " + departureId + "::" +
            "AID: " + arrivalId + "::" +
            "TravelDate: " + tDate + "::" +
            "Preferred Airline: " + pAirlineId);

        getFlights(departureId, arrivalId, tDate, pAirlineId);
    }

})

/* Get Flights for matching criteria */
function getFlights(departureAirportId, arrivalAirportId, travelDate, airlineId) {
    var flightsList = [];
    var flights = [];
    var matchingFlights = [];
    var tableStart = "<table class='search-result'>";
    var tableClose = "</table>";
    var instances = [];
    var delay = 2000;

    var tableHeader = "<thead><tr><th>Id</th><th>Date</th><th>Departure</th><th>Arrival</th><th>Flight Id</th><th>Airline Id</th></tr></thead>";

    var FLIGHT_URL = BASE_URL + 'flights?' +
        'filter[departure_id]=' + departureAirportId + '&' +
        'filter[arrival_id]=' + arrivalAirportId;

    if (airlineId != "")
        FLIGHT_URL = FLIGHT_URL + '&' + 'filter[airline_id]=' + airlineId;

    /* Start ajax call to get flight based on airport selection */
    $.ajax({
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        dataType: 'json',
        url: FLIGHT_URL,
        timeout: 10000,
        success: function(flightsList) {

            if (flightsList.length == 0) {
                document.getElementById("displayFlights").style.display = "";
                document.getElementById("displayFlights").innerHTML = "<br><br>No Flights Available for your selected dates and preferred airlines";
            }
            for (var i in flightsList) {
                //console.log(flightsList[i]);
                flights.push(flightsList[i]);
                //console.log(flights[i].id);
                var INSTANCES_URL = BASE_URL + 'instances?' +
                    'filter[flight_id]=' + flights[i].id + '&' + 'filter[date]=' + travelDate;

                $.ajax({
                    type: 'GET',
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: 'json',
                    url: INSTANCES_URL,
                    timeout: 15000,
                    success: function(instanceList) {
                        console.log(instanceList.length);

                        for (var j in instanceList) {
                            var tableFlight = "<tr>";
                            console.log(instanceList[j].id + ':' + instanceList[j].date);
                            tableFlight += "<td>" + instanceList[j].id + "&nbsp&nbsp" + "</td>";
                            tableFlight += "<td>" + instanceList[j].date + "&nbsp&nbsp" + "</td>";
                            tableFlight += "<td>" + flightsList[i].departs_at + "&nbsp&nbsp" + "</td>";
                            tableFlight += "<td>" + flightsList[i].arrives_at + "&nbsp&nbsp" + "</td>";
                            tableFlight += "<td>" + instanceList[j].flight_id + "&nbsp&nbsp" + "</td>";
                            tableFlight += "<td>" + flightsList[i].airline_id + "</td>";
                            tableFlight += "</tr>";
                            matchingFlights.push(tableFlight);
                        }
                        //console.log("Table: " + table);

                    },
                    fail: function(xhr, textStatus, errorThrown) {
                        alert('Get instances request failed');
                    }
                });
            }

            setTimeout(function() {
                delaySuccess(tableStart, tableHeader, matchingFlights, tableClose);
            }, delay);

        },
        fail: function(xhr, textStatus, errorThrown) {
            alert('Get flight request failed');
        }
    });

    function delaySuccess() {
        console.log('delaysuccess');
        var searchTitle = "<br>Here are your available flights ...<br>";
        var finalTable = searchTitle + tableStart + tableHeader;
        for (var i in matchingFlights) {
            finalTable += matchingFlights[i];
        }
        finalTable += tableClose;
        console.log(finalTable);

        $("#displayFlights").show();
        $("#displayFlights").html(finalTable);
    }
}