var root_url = 'http://comp426.cs.unc.edu:3001/'
$(document).ready(function() {

    $("#loginbtn").click(function() {
        console.log("Loginbtn clicked");
        checkAuth($("#userId").val(), $("#password").val());
    });

    var authSuccess = localStorage.getItem("authSuccess");
    console.log('AuthSuccess: ' + authSuccess);

});

// Invoked from Login page
function checkAuth(userId, password) {
    alert(userId + ':' + password);
    
    //console.log(LOGIN_URL);

    $.ajax( {
        URL: root_url + 'sessions',
        type: 'POST',
        xhrFields: {
            withCredentials: true
        },
        data: {
            "user": {
                "username": 'sumit',
                "password": 'sumit97'
            }
        },
        success: function(response) {
            window.location.replace('index.html');
            console.log(response);
        
            
            if (response.status) {
                localStorage.setItem("authSuccess", true);
                window.location.href = 'index.html';
                console.log('Auth Success: ' + userId + ':' + password);
                alert('auth success');
            } else {
                console.log('auth failed')
            }
        },
         error: function(XMLHttpRequest, textStatus, errorThrown) {
            window.alert('error');
        //     console.log(XMLHttpRequest);
        //     alert('Login failed!' + textStatus);
        //     alert('error thrown - ' + errorThrown);
         }
    });
}