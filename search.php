<?php
    $nearbyUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
    $nearbyKey ="AIzaSyCldxWurm9gfcG-RwL3Kpu4lXn6UEyeu9M";
    $detailUrl = "https://maps.googleapis.com/maps/api/place/details/json?";
    $detailKey = "AIzaSyAY_mAfYqjGW_1uN6dr89VrF7Xn7hUiZTY";
    $geocodeUrl = "https://maps.googleapis.com/maps/api/geocode/json?";
    $geocodeKey = "AIzaSyCRUj6EX-d27bghx-MIge-6pGjuHe7UT2M";
    $yelpUrl = "https://api.yelp.com/v3/businesses/";
    $yelpKey = "UdVQCqA2c0dusssENaYMmLtE7WlkDC8nA49shuUC8H2suTzNT_5dzhIltSPCCNjlin0PaJJMaytKtJa2lDDAHfY4lE9lA6mfsvFOcEk4yQ3EgXOmRrkw1LEi8Xe9WnYx";

    header("Access-Control-Allow-Origin: *");

    //nearby api
    if (isset($_GET["type"])){
        //if for location
        if (isset($_GET["loc_enter"])){
            $geocodeUrl .= "address=". $_GET["loc_enter"] . "&key=" . $geocodeKey;
            $google_response = file_get_contents($geocodeUrl);
            $google_json = json_decode($google_response);
            $lat = $google_json -> results[0] -> geometry -> location -> lat;
            $lng = $google_json -> results[0] -> geometry -> location -> lng;
            $location = $lat.",".$lng;
        }
        else{
            $location = $_GET["location"];
        }
        //request nearby search
        if ($_GET["type"] == "Default"){
            $nearbyUrl .= "keyword=".$_GET["keyword"]."&type=%20"."&radius=".$_GET["radius"]."&location=".$location."&key=".$nearbyKey;
            echo file_get_contents($nearbyUrl);
        }
        else{
            $nearbyUrl .= "keyword=".$_GET["keyword"]."&type=".$_GET["type"]."&radius=".$_GET["radius"]."&location=".$location."&key=".$nearbyKey;
            echo file_get_contents($nearbyUrl);
        }
    }
    //next or prev
    if (isset($_GET["nextToken"])){
        $nextUrl = $nearbyUrl."pagetoken=".$_GET["nextToken"]."&key=".$nearbyKey;
        echo file_get_contents($nextUrl);
    }
    
    //detail api
    //need more codes
    if (isset($_GET["place_id"])){
        $detailUrl .= "place_id=".$_GET["place_id"]."&key=".$detailKey;
        echo file_get_contents($detailUrl);
    }

    //yelp api
    if (isset($_GET["name"])){
        $matchUrl =$yelpUrl."matches/lookup?name=".$_GET["name"]."&address1=".$_GET["address1"]."&city=".$_GET["city"]."&state=".$_GET["state"]."&postal_code=".$_GET["postal_code"]."&country=".$_GET["country"]."&latitude=".$_GET["lat"]."&longitude=".$_GET["lon"]."&phone=".$_GET["phone"];

        // echo $yelpUrl;
        $headers = "Authorization: Bearer UdVQCqA2c0dusssENaYMmLtE7WlkDC8nA49shuUC8H2suTzNT_5dzhIltSPCCNjlin0PaJJMaytKtJa2lDDAHfY4lE9lA6mfsvFOcEk4yQ3EgXOmRrkw1LEi8Xe9WnYx\r\n".
            "Cache-Control: no-cache\r\n";

        $opts = [
                'http' => [
                    'method' => 'GET',
                    'header' => $headers,
                ]
            ];
        $context = stream_context_create($opts);

        // echo file_get_contents($yelpUrl, false, $context);
        $match_response = file_get_contents($matchUrl, false, $context);
        $match_json = json_decode($match_response);
        $match_id = $match_json -> businesses[0] -> id;
        $match_name = $match_json -> businesses[0] -> name;
        $match_lat = $match_json -> businesses[0] -> coordinates -> latitude; //differences?
        $match_lon = $match_json -> businesses[0] -> coordinates -> longitude; //differences?
        $match_address1 = $match_json -> businesses[0] -> location -> address1;
        $match_city = $match_json -> businesses[0] -> location -> city;
        $match_zip_code = $match_json -> businesses[0] -> location -> zip_code;
        $match_phone = $match_json -> businesses[0] -> location -> phone;

        //check validity
        $cnt = 0;
        if (strtolower($match_name) == strtolower($_GET['name']))
            $cnt++;
        if (strtolower($match_address1) == strtolower($_GET['address1']))
            $cnt++;
        if ($match_zip_code == $_GET['postal_code'])
            $cnt++;
        if ($match_phone == $_GET['phone'])
            $cnt++;
        if (abs($match_lat - $_GET['lat']) < 0.0005 && abs($match_lon - $_GET['lon']) < 0.0005)
            $cnt++;

        if ($cnt >= 3){
            // echo $match_response;
            $reviewUrl = $yelpUrl.$match_id."/reviews";
            echo file_get_contents($reviewUrl, false, $context);
        }
        else 
            echo null;
    }
?>