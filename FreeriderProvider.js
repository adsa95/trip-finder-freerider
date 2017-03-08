/*
 *	Created by Adam Sandström
 *	(c) 2017
 *
 *	adsa95@gmail.com
 *	www.adsa.se
 */

"use strict"

let TripFinder = require('trip-finder');
let request = require('request');
let moment = require('moment');
let cheerio = require('cheerio');
let dateRegExp = /^\d{4}-\d{2}-\d{2}$/;

class FreeriderProvider{
	static fetch(){
		return new Promise(function(resolve, reject){
			request("http://www.hertzfreerider.se/unauth/list_transport_offer.aspx", function(err, res, body){
				if(err) reject(err);

				let $ = cheerio.load(body);
			    let trips = [];
			    let trip = false;

			    $('tr').each(function(i, elm1){
			        let tr = $(this);
			        if(tr.hasClass('highlight')){
			            trip = TripFinder.Trip('Hertz Freerider');
			            trip._url = 'https://www.hertzfreerider.se/unauth/list_transport_offer.aspx';

			            tr.find('a').each(function(j, elm2){
			                let text = $(this).text().trim();

			                if(j == 0){
			                    trip._from = TripFinder.Location(text);
			                }else if(j == 1){
			                    trip._to = TripFinder.Location(text);
			                }
			            });
			        }else if(trip !== false){
			            tr.find('span').each(function(k, elm3){
			                let text = $(this).text().trim();
			                let isDate = dateRegExp.test(text);

			                if(k == 0 && isDate){
			                    trip._start = moment(text);
			                }else if(k == 1 && isDate){
			                    trip._end = moment(text);
			                }else if(k == 2 && !isDate){
			                    trip._vehicle = TripFinder.Vehicle(text);
			                }
			            })

			            trips.push(trip);
			            trip = false;
			        }
			    });
			    
			    resolve(trips);
			});
		});
	}

	static getProviderName(){
		return "Hertz Freerider";
	}
}

module.exports = FreeriderProvider;