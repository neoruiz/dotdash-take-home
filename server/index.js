const path = require('path');
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
const axios = require('axios');

const api_key = 'a407cbcbf42b0279e4d9d86b95539926';
const tmdb_url = 'https://api.themoviedb.org/3';

app.set('view engine', 'pug');
app.use(cors());

axios.get(`${tmdb_url}/configuration`, {
	params: {
		'api_key': api_key
	}
}).then((config) => {
	//console.log(config.data);
});


/* SEARCH TV SHOWS */
app.get('/search', function (request, response) {
	axios.get(`${tmdb_url}/search/tv`, {
		params: {
			'api_key': api_key,
			'query': request.query.query || 'Airbender'
		}
	}).then((results) => {

		getDetails( results.data )
			.then((shows) => getSeasons(shows))
			.then((shows) => {
				response.send({
					result: shows
				})
			});
	
	}).catch((error) => console.log(error));
});

/* GET IMAGES */
app.get('/:tv_id/images', function (request, response) {
	axios.get(`${tmdb_url}/tv/${request.params.tv_id}/images`, {
		params: {
			'api_key': api_key
		}
	}).then((results) => {
		response.send({
			images: results.data.posters.map(image => {
				return {
					path : image.file_path,
					height: image.height,
					width: image.width,
					aspect_ratio: image.aspect_ratio
				}
			})
		});
	
	}).catch((error) => console.log(error));
});

/* GET TV RECOMMENDATIONS */
app.get('/:tv_id/recommendations', function (request, response) {
	axios.get(`${tmdb_url}/tv/${request.params.tv_id}/recommendations`, {
		params: {
			'api_key': api_key
		}
	}).then((results) => {

		getDetails( results.data )
			.then((shows) => getSeasons(shows))
			.then((shows) => {
				response.send({
					result: shows
				})
			});
	
	}).catch((error) => console.log(error));
});

/* GET SHOW DETAILS */
const getDetails = ( shows, showURLs) => {
	return new Promise((resolve, reject) => {
		Promise.all(
			shows.results.map((tv_show) => {
				return axios.get(`${tmdb_url}/tv/${tv_show.id}?api_key=${api_key}`);
			})).then(( details ) => {

				shows.results = shows.results.map((show) => {
					return {
						id: show.id,
						name: show.name,
						first_air_date: show.first_air_date,
						overview: show.overview,
						popularity: show.popularity,
						poster_path: show.poster_path,
						...details.filter((detail) => {
							return detail.data.id == show.id;
						})[0].data
					}
				});

				resolve(shows);

			});
	});
}

/* GET SHOW SEASON DETAILS (EPISODES) */
const getSeasons = ( shows ) => {
	let seasonsUrls = [];

	shows.results.forEach((show) => {
		seasonsUrls = seasonsUrls.concat(show.seasons.map((season) => {
			return `${tmdb_url}/tv/${show.id}/season/${season.season_number}`
		}));
	});

	return new Promise((resolve, reject) => {
		Promise.all(
			seasonsUrls.map((url) => {
				return axios.get(`${url}?api_key=${api_key}`);
			})).then(( seasons ) => {

				shows.results.forEach((show) => {
					show.seasons = show.seasons.map((season) => {
						return {
							...season,
							...seasons.filter((seasonDetails) => {
								return seasonDetails.data.id == season.id;
							})[0].data
						}
					});
				});

				resolve( shows );
			}).catch(error => console.log(error));
	});
}


app.use(express.static('public'));
const server = http.createServer(app);

server.listen(process.env.PORT || 3002, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log('[WEB] listening at http://%s:%s', host, port);
});