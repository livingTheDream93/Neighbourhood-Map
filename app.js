var models = [{
        "name": "India Gate",
        "location": {
            "lat": 28.612912,
            "lng": 77.22950969999999
        },
        "wikiname":"India Gate"
    },
    {
        "name": "Connaught Place",
        "location": {
            "lat": 28.6314512,
            "lng": 77.2166672
        },
        "wikiname":"Connaught_Place,_New_Delhi"
    },
    {
        "name": " Lal Qila",
        "location": {
            "lat": 28.6561592,
            "lng": 77.2410203
        },
        "wikiname":"Red_Fort"
    },
    {
        "name": "Qutb Minar",
        "location": {
            "lat": 28.5244281,
            "lng": 77.18545589999999
        },
        "wikiname":"Qutb Minar"
    },
    {
        "name": "Akshardham Mandir",
        "location": {
            "lat": 28.6126735,
            "lng": 77.2772619
        },
        "wikiname":"Akshardham_(Delhi)"
    },
    {
        "name": "Jantar Mantar",
        "location": {
            "lat": 28.6229291749,
            "lng": 77.2098858271
        },
        "wikiname":"Jantar Mantar"
    }
];
//View -- Data Control And Storage
var vModel = function () {
    var v = this;
    var MarkerLocation = function (marker) {
        this.name = marker.name;
        this.position = marker.location;
        this.wikiname = marker.wikiname;
    };
    v.markers = ko.observableArray([]);
    for (m of models) {
        v.markers.push(new MarkerLocation(m));
    }
};

//---------------//
//The function renders the map and is independent of view
//---------------//
function initMap() {
    var map,bounds;
    var self = this; 
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 28.6139391,
            lng: 77.2090212
        },
        zoom: 11,
    });
    bounds = new google.maps.LatLngBounds();

    //------------ Initialize info windows and map bounds----------------//
    var infoWindow = new google.maps.InfoWindow({
        maxWidth: 150
    });

    var wikiInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < viewModel.markers().length; i++) {
        var position = viewModel.markers()[i].position;
        var name = viewModel.markers()[i].name;
        var wikiname = viewModel.markers()[i].wikiname
        marker = new google.maps.Marker({
            map: map,
            position: position,
            title: name,
            animation: google.maps.Animation.DROP,
            id: i,
            wiki:wikiname
        });
        viewModel.markers()[i] = marker;
       
        //---------------Create an onclick event to open an infowindow at each marker.--------------//
        marker.addListener('click', function () {
            dance.call(this);
            populateInfoWindow(this, wikiInfowindow);
        });

        //----------Add animations to the marker--------------//
        function dance() {
            this.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => {
                this.setAnimation(null);
            }, 1700);
        }
    }

    //------------- A function to show information about a particular clicked marker ---------------//
    function populateInfoWindow(marker, infowindow) {
        var url = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.wiki + '&imlimit=5&format=json&callback=wikiCallback';
        $.ajax({
            url: url,
            dataType: 'jsonp'
          }).done((res) => {
            var arturl = res[3][0];
            var artdscr = res[2][0];
            // Error handling for if no articles are returned from Wikipedia API
            if (arturl === undefined) {
              infowindow.setContent('<div>' + '<h3>' + marker.title + '</h3>' + '<p>' + 'Sorry no wikipedia entries could be found to match this station.' + '</p>' + '</div>');
              infowindow.open(map, marker);
            } else {
              infowindow.marker = marker;
              infowindow.setContent('<div>' + '<h3>' + marker.title + '</h3>' + '<p>' + artdscr + '<a href="' + arturl + '" target="blank">' + '..' + ' Read More' + '</a>' + '</p>' + '</div>');
              infowindow.open(map, marker);
            }
            // Error handling for if Wikipedia API call fails
          }).fail(()=> {
            infowindow.setContent('<div>' + '<h3>' + marker.title + '</h3>' + '<p>' + 'Sorry no wikipedia entries could be found to match this station.' + '</p>' + '</div>');
            infowindow.open(map, marker);
          });
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('<div>' + marker.title + '</div>');
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function () {
                infowindow.setMarker = null;
            });
        }
    }
    
    //--------The function to set the action when a place name is clicked -----//
    self.clickBounce =  function(place,event){
        var a = event.target.innerHTML;
        //console.log(a);
        for(i=0;i<viewModel.markers().length;i++){
            if(a.toLowerCase()===viewModel.markers()[i].title.toLowerCase()){
                var mark = viewModel.markers()[i];
               bounce(mark);
               populateInfoWindow(this, wikiInfowindow);
            }
            
        }
    };

    //------Adding animation to the marker ----//
    function bounce(marker){
        if (marker.getAnimation() !== null) {
		marker.setAnimation(null);
	    } else {
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){ marker.setAnimation(null); }, 3000);
    	}
    }

    self.query = ko.observable('');
    self.defaultListItems = [];

    for(i = 0; i < viewModel.markers().length; i++){
        defaultListItems.push(viewModel.markers()[i]);
    }
    console.log(defaultListItems);
    self.listArr = ko.observableArray(self.defaultListItems);
    //console.log(listArr)   
    
    
    //-------------Input filter functionality ------------//
    self.search = function() { 
		var str = "this is in search";
        var data = self.query().toLowerCase();
        self.listArr.removeAll();
        for(i = 0; i < viewModel.markers().length; i++){
            if(viewModel.markers()[i].title.toLowerCase().indexOf(data) >= 0){
                viewModel.markers()[i].setVisible(true);
                self.listArr.push(viewModel.markers()[i])
                //console.log(viewModel.markers()[i])
            }
            else if(data.length==0){
                viewModel.markers()[i].setVisible(true);
            }
            else{
                viewModel.markers()[i].setVisible(false);
            }
        }
    }
    
    function loadError() {
        alert("failed to load page ");
    }
    
    ko.applyBindings(new vModel);
}

var viewModel = new vModel
