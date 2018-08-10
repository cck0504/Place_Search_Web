(function () {
    var app = angular.module('googleSearch', ['ngAnimate', 'ngMap']);


    app.directive("rateYo", function() {
        return {
            restrict: "E",
            scope: {
                rating: "="
            },
            template: "<div id='rateYo'></div>",
            link: function( scope, element, attrs ) {
                $(element).rateYo({
                    rating: scope.rating,
                    starWidth: "18px",      
                    ratedFill: "#F39C12",
                    readOnly: true          
                });
            }
        };
    });


    app.directive('autocomplete', function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, model) {
                var options = {
                    types: [],
                    componentRestrictions: {}
                };
                scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
                google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
                    scope.$apply(function() {
                        model.$setViewValue(element.val());                
                    });
                });
            }
        };
    });

    function SearchCtrl($scope) {
        $scope.gPlace;
    }

    app.controller('SearchCtrl', ['$scope', '$http', '$window', 'NgMap', function ($scope, $http, $window, NgMap) {
        $scope.keyword = "";
        $scope.type = "Default";
        $scope.radius = "";
        $scope.location = "0,0";
        $scope.loc_radio = "current";
        $scope.loc_enter = "";
        $scope.loc_flag = false;
        $scope.name = "Nearby Search";
        $scope.favFlag = false;
        $scope.current_id = "";
        $scope.favData = [];
        $scope.favDataStore = "";
        $scope.nearbyPage = [];
        $scope.favPage = [];
        $scope.nearbyCnt = 0;
        $scope.favCnt = 0;
        $scope.nearbyOrig = [];
        $scope.noRecord_near = false;
        $scope.noRecord_fav = false;
        $scope.noRecord_photo = false;
        $scope.noRecord_google = false;
        $scope.noRecord_yelp = false;
        $scope.error_near = false;
        $scope.data = "";
        $scope.searchTable = true;

        $http({
            method: 'GET',
            url: 'http://ip-api.com/json'
        }).then(function successCallback(response) {
            $scope.location = response.data.lat+","+response.data.lon;
        });


        $scope.keywordValid = function(){
            if ($scope.searchForm.keyword.$touched && $scope.searchForm.keyword.$invalid){
                $scope.key_style = {'border-color':'red'};
                return true;
            }
            else{
                $scope.key_style = {'border-color':'none'};
                return false;
            }
        }

        $scope.locationValid = function(){
            if ($scope.searchForm.loc_enter.$touched && $scope.searchForm.loc_enter.$invalid){
                $scope.loc_style = {'border-color':'red'};
                return true;
            }
            else{
                $scope.loc_style = {'border-color':'none'};
                return false;
            }
        }

        $scope.submitValid = function(){
            if ($scope.loc_radio == "current"){
                if ($scope.searchForm.keyword.$invalid)
                    return true;
                else
                    return false;
            }
            else{
                if($scope.searchForm.loc_enter.$invalid || $scope.searchForm.keyword.$invalid)
                    return true;
                else
                    return false;
            }
        }

        $scope.next = function(){
            if ($scope.favBlock == true){
                $scope.favCnt += 1; 
                if ($scope.favCnt < $scope.favTotal.length){
                    $scope.favData = $scope.favTotal[$scope.favCnt];
                    $scope.favPrevBtn = true;
                    if ($scope.favCnt+1 < $scope.favTotal.length)
                        $scope.favNextBtn = true;
                    else
                        $scope.favNextBtn = false;
                }
            }
            else{
                $scope.nearbyCnt += 1;
                if ($scope.nearbyCnt < 20 && $scope.nearbyPage[$scope.nearbyCnt] != undefined){
                    $scope.progressBlock = true;
                    $scope.nearbyBlock = false;
                    $scope.data = [];
                    nextUrl = "search-198504.appspot.com/?nextToken=" + $scope.nearbyPage[$scope.nearbyCnt];
                    // nextUrl = "498-dot-search-198504.appspot.com/?nextToken=" + $scope.nearbyPage[$scope.nearbyCnt];
                    $http({
                        method: 'GET',
                        url: nextUrl,
                    }).then(function successCallback(response) {
                        $scope.nextPageToken = response.data.next_page_token;
                        $scope.data = response.data.results; 
                        if($scope.nextPageToken != undefined){
                            $scope.nearbyPage[$scope.nearbyCnt+1] = $scope.nextPageToken;
                            if($scope.nearbyCnt != 20)
                                $scope.nearNextBtn = true;
                            else
                                $scope.nearNextBtn = false;
                        }
                        else
                            $scope.nearNextBtn = false;
                        $scope.progressBlock = false;
                        $scope.nearbyBlock = true;
                        $scope.nearPrevBtn = true;
                    }, function errorCallback(response) {
                        $scope.data = "sth went wrong";
                        $scope.error_near = true;
                    });    
                }     
            }
        }
        
        $scope.prev = function(){
            if ($scope.favBlock == true){
                $scope.favCnt -= 1;
                if ($scope.favCnt >= 0){
                    $scope.favData = $scope.favTotal[$scope.favCnt];
                    $scope.favNextBtn = true;
                    if ($scope.favCnt-1 >= 0)
                        $scope.favPrevBtn = true;
                    else
                        $scope.favPrevBtn = false;
                }
            }
            else{
                $scope.nearbyCnt -= 1;
                if ($scope.nearbyCnt >= 1 && $scope.nearbyPage[$scope.nearbyCnt] != undefined){
                    $scope.progressBlock = true;
                    $scope.nearbyBlock = false;
                    $scope.data = [];
                    prevUrl = "search-198504.appspot.com/?nextToken=" + $scope.nearbyPage[$scope.nearbyCnt];
                    // prevUrl = "498-dot-search-198504.appspot.com/?nextToken=" + $scope.nearbyPage[$scope.nearbyCnt];
                    $http({
                        method: 'GET',
                        url: prevUrl,
                    }).then(function successCallback(response) {
                        $scope.data = response.data.results; 
                        $scope.progressBlock = false;
                        $scope.nearbyBlock = true;
                        $scope.nearNextBtn = true;
                        $scope.nearPrevBtn = true;
                    }, function errorCallback(response) {
                        $scope.data = "sth went wrong";
                        $scope.error_near = true;
                    });    
                }  
                else    
                    $scope.nearbySearch($scope.nearbyOrig[0][0], $scope.nearbyOrig[0][1], $scope.nearbyOrig[0][2], $scope.nearbyOrig[0][3]);
            }
        }

        $scope.list = function(place_id){
            $scope.detailBlock = false;
            $scope.searchTable = true;

            if($scope.favFlag == true){
                $scope.nearbyBlock = false;  
                $scope.favBlock = true;
            }
            else{
                $scope.nearbyBlock = true;
                $scope.favBlock = false;
            }
        }

        $scope.nearbySearch = function(keyword, type, radius, loc_enter){
            $scope.loc_enter = "";
            $scope.nearbyOrig = [];
            $scope.nearbyOrig.push([keyword, type, radius, loc_enter]);

            if(radius == "")
                radius = 16090;
            else{
                $scope.radius = radius;
                radius *= 1609;
            }
            $scope.detailBlock = false;
            $scope.searchTable = true;
            $scope.progressBlock = true;
            $scope.nearbyBlock = false;
            $scope.favBlock = false;
            $scope.data = [];
            nearbyUrl = 'search-198504.appspot.com/?';
            // nearbyUrl = '498-dot-search-198504.appspot.com/?';
            if(loc_enter != "" && $scope.loc_flag){
                nearbyUrlGet = 'keyword='+keyword+"&type="+type+"&radius="+radius+"&loc_enter="+loc_enter;
                $scope.loc_enter = loc_enter;
            }
            else
                nearbyUrlGet = 'keyword='+keyword+"&type="+type+"&radius="+radius+"&location="+$scope.location;
            nearbyUrl += nearbyUrlGet;
            $http({
                method: 'GET',
                url: nearbyUrl,
            }).then(function successCallback(response) {
                $scope.error_near = false;
                $scope.progressBlock = false;
                $scope.nearbyBlock = true;
                $scope.favBlock = false;
                $scope.detailBlock = false;
                $scope.data = response.data.results; 
                if ($scope.data != ""){
                    $scope.noRecord_near = false;                        
                    $scope.nextPageToken = response.data.next_page_token;
                    $scope.nearbyPage = [];
                    $scope.nearbyCnt = 0;
                    $scope.nearPrevBtn = false;
                    if($scope.nextPageToken != undefined){
                        $scope.nearbyPage[1] = $scope.nextPageToken;
                        $scope.nearNextBtn = true;
                    }
                }
                else{
                    $scope.noRecord_near = true;
                }
            }, function errorCallback(response) {
            $scope.error_near = true;
            $scope.data = "sth went wrong";
            });
        }

        $scope.showFav = function(){
            $scope.searchTable = true;
            $scope.favFlag = true;
            $scope.favTotal = [];
            var favData = $scope.getLocal();
            $scope.nearbyBlock = false;
            $scope.detailBlock = false;
            $scope.favBlock = true;
            if (favData != undefined && favData.length >= 1){
                $scope.noRecord_fav = false;
                for(var i=0, len=favData.length; i<len; i+=20){
                    $scope.favTotal.push(favData.slice(i,i+20));
                }

                $scope.favData = $scope.favTotal[0];
                $scope.favCnt = 0;
                $scope.favPrevBtn = false;
                if ($scope.favTotal.length > 1)
                    $scope.favNextBtn = true;
                else
                    $scope.favNextBtn = false;
            }
            else
                $scope.noRecord_fav = true;
        }

        $scope.showResult = function(){
            $scope.searchTable = true;
            $scope.favFlag = false;
            $scope.nearbyBlock = true;
            $scope.favBlock = false;
            $scope.detailBlock = false;
            if ($scope.data != ""){
                $scope.noRecord_near = false;
            }
            else
                $scope.noRecord_near = true;
        }

        $scope.showDetail_prev = function(){
            $scope.searchTable = false;
            $scope.nearbyBlock = false;
            $scope.favBlock = false;
            $scope.detailBlock = true;
        }

        $scope.showDetail = function(place_id, lat, lon){
            $scope.searchTable = false;
            $scope.nearbyBlock = false;
            $scope.favBlock = false;
            $scope.detailBlock = false;
            $scope.progressBlock = true;

            $scope.detail = [];
            $scope.detailReviews = [];
            $scope.detailLat = lat;
            $scope.detailLon = lon;
            $scope.detailAdd = "";
            $scope.detailPhone = "";
            $scope.detailPrice = "";
            $scope.detailRate = 0.0;
            $scope.googleUrl = "";
            $scope.website = "";
            $scope.detailHour = "";
            $scope.current_id = place_id;
            $scope.detailPhotos = [];
            $scope.photo_col1 = [];
            $scope.photo_col2 = [];
            $scope.photo_col3 = [];
            $scope.photo_col4 = [];
            $scope.detail_address_components = {};
            $scope.country = "";
            $scope.city = "";
            $scope.postal_code = 0;
            $scope.address1 = "";
            $scope.phone = 0;
            $scope.detailPeriod = [];
            $scope.detailWeekday = []
            $scope.priceLevel = "";
            $scope.active = "active";
            $scope.detailItem_array = [];
            $scope.pickedID = place_id;

            detailUrl = 'search-198504.appspot.com/?place_id='+place_id;
            // detailUrl = '498-dot-search-198504.appspot.com/?place_id='+place_id;
            $http({
                method: 'GET',
                url: detailUrl,
            }).then(function successCallback(response) {

                $scope.error_detail = false;

                $scope.detail = response.data.result;
                $scope.detailReviews = $scope.detail.reviews;

                //info
                $scope.detailName = $scope.detail.name;
                $scope.detailAdd = $scope.detail.formatted_address;
                $scope.detailPhone = $scope.detail.international_phone_number;
                for (var i = 0; i<$scope.detail.price_level; i++)
                    $scope.detailPrice += "$";
                $scope.detailRate = $scope.detail.rating;
                $scope.googleUrl = $scope.detail.url;
                $scope.website = $scope.detail.website;

                if ($scope.detail.opening_hours){
                    $scope.days = $scope.detail.opening_hours.weekday_text;
                    $scope.hours = [];
                    $scope.day_words = ["Monday","Tuseday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                    $scope.hours_after = [];
                    $scope.day_words_after = [];

                    var toLocal = moment().utc().utcOffset($scope.detail.utc_offset).format();
                    var currDay = moment(toLocal.split("T")[0]).day();

                    if (currDay == 0)
                        currDay = 6;
                    else
                        currDay--;

                    for (var i = 0; i < 7; i++) {
                        var open_time = $scope.days[i].indexOf(":") + 1;
                        var open_status = $scope.days[i].substring(open_time, $scope.days[i].length);
                        if (open_status == undefined || open_status.length == 0 || open_status == "")
                            $scope.hours[i] = "Closed";
                        else
                            $scope.hours[i] = open_status;
                    }
                    for (var i = 0; i < 7; i++){
                        $scope.hours_after[i] = $scope.hours[(i+currDay)%7];
                        $scope.day_words_after[i] = $scope.day_words[(i+currDay)%7];
                    }
                    if ($scope.detail.opening_hours.open_now)
                        $scope.detailHour = "Open now: " + $scope.hours_after[0];
                    else
                        $scope.detailHour = "Closed";
                }

                //photo
                var map = new google.maps.Map(document.getElementById('keyword'), {
                    center: {lat: $scope.detailLat, lng: $scope.detailLon},
                    zoom: 13
                });
                var service = new google.maps.places.PlacesService(map);

                service.getDetails({placeId: place_id}, function(place, status){
                    if (status == google.maps.places.PlacesServiceStatus.OK){
                        $scope.error_photo = false;
                        for (var i=0;i<place.photos.length;i++){    
                            var photo = place.photos[i].getUrl({'maxWidth': place.photos[0].width, 'maxHeight': place.photos[0].hight});
                            var remainder = i%4;
                            var divider = Math.floor(i/4);
                            $scope.detailPhotos[i] = photo;
                            if (remainder == 0)
                                $scope.photo_col1[divider] = photo;
                            if (remainder == 1)
                                $scope.photo_col2[divider] = photo;
                            if (remainder == 2)
                                $scope.photo_col3[divider] = photo;
                            if (remainder == 3)
                                $scope.photo_col4[divider] = photo;                         
                        }
                    }
                    else{
                        $scope.detailPhotos = "wrong";
                        $scope.error_photo = true;
                    }
                });

                //review
                for (var i=0; i < $scope.detailReviews.length; i++){
                    //0:auth_url
                    //1:profile_photo
                    //2:auth_name
                    //3:rating
                    //4:rating_round
                    //5:time
                    //6:time_convert
                    //7:text
                    $scope.detailItem_array.push([$scope.detailReviews[i].author_url, 
                        $scope.detailReviews[i].profile_photo_url,
                        $scope.detailReviews[i].author_name, 
                        $scope.detailReviews[i].rating, 
                        0,
                        $scope.detailReviews[i].time,
                        moment($scope.detailReviews[i].time*1000).format("YYYY-MM-DD HH:mm:ss"), 
                        $scope.detailReviews[i].text]);
                }
                $scope.detailReviews = angular.copy($scope.detailItem_array);


                $scope.detail_address_components = $scope.detail.address_components; 
                for(var j = 0; j < $scope.detail_address_components.length; j++){
                    var address_type = $scope.detail_address_components[j].types[0];
                    if(address_type == "country") {
                        $scope.country = $scope.detail_address_components[j].short_name;
                    }else if(address_type == "administrative_area_level_1"){
                        $scope.state = $scope.detail_address_components[j].short_name;
                    }else if(address_type == "locality"){
                        $scope.city = $scope.detail_address_components[j].short_name;
                    }else if(address_type == "postal_code"){
                        $scope.postal_code = $scope.detail_address_components[j].short_name;
                    }
                }
                $scope.address1 = $scope.detail.formatted_address.split(", ")[0];
                $scope.phone = $scope.detail.international_phone_number.split(" ").join("").split("-").join("");

            }, function errorCallback(response) {
              $scope.detail = "sth went wrong";
              $scope.error_detail = true;
            });
                $scope.progressBlock = false;
                $scope.detailBlock = true;
                $scope.infoBlock = true;
                $scope.photoBlock = false;
                $scope.mapBlock = false;
                $scope.reviewBlock = false;
        }



        $scope.detailItem = function(){
            
        }



        $scope.dirChange = function(from){
            var re = new RegExp("[^\s]+");
            if (re.test(from))
                return false;
            else
                return true;
        }

        $scope.getDirection = function(from, mode){
            if (from.toLowerCase() == "your location" || from.toLowerCase() == "my location")//TODO: current not working
                $scope.origin = $scope.location;
            else
                $scope.origin = from;
            $scope.MODE = mode.toUpperCase();
            $scope.directionPanel = true;

            $scope.marker = false;
            $scope.direction = true;

        }
        
        $scope.getStreet = function(){
            $scope.streetView = true;
            $scope.mapView = false;
            $scope.mapIcon = true;
            $scope.pegman = false;
        }

        $scope.getMap = function(){
            $scope.streetView = false;
            $scope.mapView = true;
            $scope.mapIcon = false;
            $scope.pegman = true;
        }

        // TODO
        //1. special char in name, add,url
        //maybe more
        $scope.twitter = function(name,address,google, website){
            var url = "";
            if (website != "")
                url = website;
            else
                url = google;
            var twitter = "https://twitter.com/intent/tweet?";
            var hashtags = "&hashtags=TravelAndEntertainmentSearch";
            var text = "text=Check out " + name + " located at " + address + ". Website: ";
            text = encodeURI(text);
            var urls = "&url=" + url;
            $window.open("https://twitter.com/intent/tweet?" + text + urls + hashtags, "_blank", "resizable=1,top=500,left=500,width=400,height=400");
        }

        $scope.showInfo = function(){
            $scope.infoBlock = true;
            $scope.photoBlock = false;
            $scope.mapBlock = false;
            $scope.reviewBlock = false;
        }
        
        $scope.showPhoto = function(){
            $scope.infoBlock = false;
            $scope.photoBlock = true;
            $scope.mapBlock = false;
            $scope.reviewBlock = false; 
            if ($scope.photo_col1.length > 0)
                $scope.noRecord_photo = false;
            else
                $scope.noRecord_photo = true;
        }

        $scope.showMap = function(){
            $scope.from = "";
            $scope.infoBlock = false;
            $scope.photoBlock = false;
            $scope.mapBlock = true;
            $scope.reviewBlock = false;  
            $scope.mode = "Driving";     
            $scope.to = $scope.detail.name + "," + $scope.detailAdd; 
            $scope.streetView = false;
            $scope.mapView = true;
            $scope.mapIcon = false;
            $scope.pegman = true;
            $scope.directionPanel = false;

            $scope.marker = true;
            $scope.direction = false;
            if ($scope.loc_enter == "")
                $scope.from = "Your location";
            else
                $scope.from = $scope.loc_enter;

        }

        $scope.showReview = function(){
            $scope.rate = 0;
            $scope.infoBlock = false;
            $scope.photoBlock = false;
            $scope.mapBlock = false;
            $scope.progressBlock = true;
            $scope.yelpReviews = {};
            $scope.yelpReviews_copy = {};
            $scope.selectBrand = "";
            $scope.selectOrder = "";
            $scope.yelpItem_array = [];

            yelpUrl = 'search-198504.appspot.com/?name='+$scope.detail.name+"&city="+$scope.city+"&state="+$scope.state+"&country="+$scope.country+
                "&postal_code="+$scope.postal_code+"&lat="+$scope.detailLat+"&lon="+$scope.detailLon+"&address1="+$scope.address1+"&phone="+$scope.phone;
            // yelpUrl = '498-dot-search-198504.appspot.com/?name='+$scope.detail.name+"&city="+$scope.city+"&state="+$scope.state+"&country="+$scope.country+
                // "&postal_code="+$scope.postal_code+"&lat="+$scope.detailLat+"&lon="+$scope.detailLon+"&address1="+$scope.address1+"&phone="+$scope.phone;
                $http({
                    method: 'GET',
                    url: yelpUrl,
                }).then(function successCallback(response) {
                    $scope.error_yelp = false;
                    $scope.yelpReviews = response.data.reviews;
                    $scope.yelpReviews_copy = $scope.yelpReviews;
                    $scope.progressBlock = false;
                    $scope.reviewBlock = true;
                    $scope.showGoogle = true;
                    if ($scope.detail_address_components.length > 0)
                        $scope.noRecord_google = false;
                    else
                        $scope.noRecord_google = true;
                    $scope.showYelp = false;
                    $scope.selectBrand = "Google Reviews";
                    $scope.selectOrder = "Default Order";
                    $scope.yelpItem();
                    
                }, function errorCallback(response) {
                    $scope.progressBlock = false;
                    $scope.reviewBlock = true;
                    $scope.showGoogle = true;
                    if ($scope.detail_address_components.length > 0)
                        $scope.noRecord_google = false;
                    else
                        $scope.noRecord_google = true;
                    $scope.showYelp = false;
                    $scope.selectBrand = "Google Reviews";
                    $scope.selectOrder = "Default Order";
                    $scope.yelpReviews = "sth went wrong";
                    $scope.error_yelp = true;
                });
        }

        $scope.clickGoogle = function(){
            $scope.selectBrand = "Google Reviews";
            $scope.selectOrder = "Default Order";
            $scope.detailReviews = angular.copy($scope.detailItem_array);
            $scope.showGoogle = true;
            $scope.showYelp = false;
        }

        $scope.clickYelp = function(){
            $scope.selectBrand = "Yelp Reviews";
            $scope.selectOrder = "Default Order";
            $scope.yelpReviews_copy = angular.copy($scope.yelpItem_array);
            $scope.showYelp = true;
            $scope.showGoogle = false;
            if ($scope.yelpReviews_copy.length > 0)
                $scope.noRecord_yelp = false;
            else
                $scope.noRecord_yelp = true;
        }

        $scope.default = function(){
            $scope.selectOrder = "Default Order";
            if ($scope.selectBrand == "Google Reviews"){
                $scope.detailReviews = angular.copy($scope.detailItem_array);
            }
            else{
                $scope.yelpReviews_copy = angular.copy($scope.yelpItem_array);
            }
        }

        $scope.high = function(){
            $scope.selectOrder = "Highest Rating";    
            if ($scope.selectBrand == "Google Reviews"){
                $scope.detailReviews.sort(function(a,b){
                    return b[3] - a[3];
                });
            }
            else{
                $scope.yelpReviews_copy.sort(function(a,b){
                    return b[3] - a[3];
                });
            }        
        }

        $scope.low = function(){
            $scope.selectOrder = "Lowest Rating";  
            if ($scope.selectBrand == "Google Reviews"){
                $scope.detailReviews.sort(function(a,b){
                    return a[3] - b[3];
                });
            }
            else{
                $scope.yelpReviews_copy.sort(function(a,b){
                    return a[3] - b[3];
                });
            }  
        }
        
        $scope.most = function(){
            $scope.selectOrder = "Most Recent";
            if ($scope.selectBrand == "Google Reviews"){
                $scope.detailReviews.sort(function(a,b){
                    return b[5] - a[5];
                });
            }
            else{
                $scope.yelpReviews_copy.sort(function(a,b){
                    return b[5] - a[5];
                });
            }   
        }

        $scope.least = function(){
            $scope.selectOrder = "Least Recent"; 
            if ($scope.selectBrand == "Google Reviews"){
                $scope.detailReviews.sort(function(a,b){
                    return a[5] - b[5];
                });
            }
            else{
                $scope.yelpReviews_copy.sort(function(a,b){
                    return a[5] - b[5];
                });
            }   
        }

        $scope.yelpItem = function(){
            for (var i=0; i < $scope.yelpReviews.length; i++){
                var time_convert = $scope.yelpReviews[i].time_created.split(" ").join("").split("-").join("").split(":").join("");
                $scope.yelpItem_array.push([$scope.yelpReviews[i].url, 
                    $scope.yelpReviews[i].user.image_url,
                    $scope.yelpReviews[i].user.name, 
                    $scope.yelpReviews[i].rating, 
                    0,
                    time_convert, 
                    $scope.yelpReviews[i].time_created, 
                    $scope.yelpReviews[i].text]);
            }
            $scope.yelpReviews_copy = angular.copy($scope.yelpItem_array);
        }

        $scope.clickCurrent = function(){
            $scope.loc_radio = "current";
            $scope.loc_flag  = false;
            $scope.searchForm.loc_enter.$touched = false;
        }

        $scope.clickOther = function(){
            $scope.loc_radio = "other";
            $scope.loc_flag = true;
        } 

        $scope.showReviewRate = function(rate) {
            $scope.rate = Math.round(rate);
            return true;
        }

        $scope.googleTime = function(time) {
            $scope.convert = moment(time*1000).format("YYYY-MM-DD HH:mm:ss");
            return true;
        }

        $scope.saveFav = function(icon, name, vicinity, place_id, lat, lon){
            $scope.favData.push([icon,name,vicinity,place_id, lat, lon]);
            $scope.saveLocal($scope.favData);
        }

        $scope.deleteFav = function(place_id){
            var i = $scope.favData.findIndex(function(item){
                return item[3] == place_id;
            })
            if (i > -1){
                $scope.favData.splice(i,1);
                $scope.saveLocal($scope.favData)
                if (i == 0 && $scope.favData.length < 1){
                    $scope.favCnt -= 1;
                    if ($scope.favCnt >= 0){
                        $scope.favData = $scope.favTotal[$scope.favCnt];
                        if ($scope.favCnt-1 >= 0)
                            $scope.favPrevBtn = true;
                        else
                            $scope.favPrevBtn = false;
                    }
                }
                if ($scope.favData.length < 1)
                    $scope.noRecord_fav = true;

            }
        }

        $scope.checkFav = function(place_id){
            var i = $scope.favData.findIndex(function(item){
                return item[3] === place_id;
            })
            if (i > -1)
                return true;
            else
                return false;
        }

        $scope.saveLocal = function(data){
          localStorage.setItem($scope.favDataStore, JSON.stringify(data));
          $scope.save = true;
        }

        $scope.getLocal = function(){
          return JSON.parse(localStorage.getItem($scope.favDataStore)) || [];
        }

        $scope.clear = function(){
            $scope.favBlock = false;
            $scope.nearbyBlock = false;
            $scope.detailBlock = false;
            $scope.keyword = "";
            $scope.loc_enter = "";
            $scope.current_id = "";
            $scope.loc_flag = false;
            $scope.favFlag = false;
            $scope.data = "";
            $scope.searchForm.keyword.$touched = false;
            $scope.searchForm.loc_enter.$touched = false;
            $scope.searchTable = true;
        } 
    }]);

})();
