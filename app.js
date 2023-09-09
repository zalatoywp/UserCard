
const config = require('dotenv').config()
const fs = require('fs')
const request = require('request')
const express = require('express')
const app = express()
const compression = require('express-compression')
const TOKEN = process.env.TWITTER_BEARER_TOKEN
const PORT = process.env.PORT || 3000



app.use(compression({

    filter: (req, res) =>
    {

        if (req.headers['x-no-compression']) {
            return false
        }

        return true;
    },

    brotli: {
        enabled: true,
        zlib: {}
    }
}));



// Server setup --------------------------------------------------
app.listen(PORT);
app.set('view engine', 'ejs');
console.log('Server is running on port ' + PORT);






// Static Pages ---------------------------------------------------
app.use('/img', express.static(__dirname + '/pages/img'));
///////////////////////////////////////////////////////////////////

// Configuracion endpoints de la API de Twitter
const api = {
    endPoints: {
        // Obtener un nuevo Token de invitado
        token: "https://api.twitter.com/1.1/guest/activate.json",
        // Búsqueda de usuario por nombre de usuario
        lookup: "https://api.twitter.com/1.1/users/lookup.json?screen_name=",
        // Búsqueda de un usuario por ID
        search: "https://api.twitter.com/1.1/users/lookup.json?user_id=",
    },
    headers: {
        authorization: `Bearer ${TOKEN}`,

    }
};


// Twitter Token
async function twitter_token(callback)
{
    const options = {
        method: 'POST',
        url: api.endPoints.token,
        headers: api.headers
    };
    request(options, function (error, response, body)
    {
        if (!error) {
            const { guest_token } = JSON.parse(body);
            callback(guest_token);
        }
    });
};




// Formatear numeros para su conversion en K (ej. 9300 = 9.3K)


function formatNum(num, decimals = 1)
{
    if (!+num) return '0';
    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const symbol = ['', 'K', 'M', 'B', 'T', 'P', 'E', 'Sextillion', 'Septillion', 'Octillion', 'Nonillion', 'Decillion', 'Undecillion', 'Duodecillion', 'Tredecillion', 'Quattuordecillion', 'Quindecillion', 'Sedecillion', 'Septendecillion', 'Octodecillion', 'Novendecillion', 'Vigintillion'];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return `${parseFloat((num / Math.pow(k, i)).toFixed(dm))} ${symbol[i]}`;
};



// Home Page ------------------------------------------------------------
app.get('/', function (req, res)
{
    console.log('Twitter Main Page : ' + req.url)
    res.sendFile(__dirname + '/pages/twitter.html')
})


//  Pagina de perfil --------------------------------------------------------
app.get('/lookup/:user', (req, res) => profile(req, res, 'lookup'));	// lookup por Usuario
app.get('/search/:user', (req, res) => profile(req, res, 'search'));	// search por ID
function profile(req, res, method)
{
    twitter_token(token =>
    {
        const user = req.params.user.toLowerCase().split(' ').join('');
        var http = require('http');

        http.get({ 'host': 'api.ipify.org' }, function (resp)
        {
            resp.on('data', function (ip)
            {
                console.log("Dirección IP: " + ip);
            });
        });
        console.log('Search Name : ' + user);

        // hacer solicitud GET a twitter

        // Configurar la solicitud
        const options = {
            method: 'GET',
            json: true,
            url: api.endPoints[method] + user,
            headers: {
                ...api.headers,
                'x-guest-token': token
            }
        };

        // Recibe la solicitud
        request(options, function (error, response, body)
        {
            console.log('ID: ', body.id_str)
            console.log('Código de estado = ', response.statusCode)

            // Si no hay error
            if (!error && response.statusCode == 200 && body[0]) {

                // cuenta activa
                const profile_user = body[0];

                const tweets_str = formatNum(profile_user.statuses_count);
                const following_str = formatNum(profile_user.friends_count);
                const followers_str = formatNum(profile_user.followers_count);
                const likes_str = formatNum(profile_user.favourites_count);
                const media_count_str = formatNum(profile_user.media_count);


                date = new Date(profile_user.created_at);
                joined = date.toLocaleString('es');

                const twitter = {
                    available: 1,
                    suspended: 0,
                    user_id: profile_user.id,
                    user_id_str: profile_user.id_str,
                    name: profile_user.name,
                    listed: profile_user.listed_count,
                    account: profile_user.screen_name,
                    verificada: profile_user.verified,
                    protegida: profile_user.protected,
                    Bussnis_state: profile_user.business_profile_state,
                    joined: joined,
                    location: profile_user.location,
                    website: profile_user.url,
                    description: profile_user.description,
                    tweets: profile_user.statuses_count,
                    tweets_str: tweets_str,
                    following: profile_user.friends_count,
                    following_str: following_str,
                    followers: profile_user.followers_count,
                    followers_str: followers_str,
                    likes: profile_user.favourites_count,
                    likes_str: likes_str,
                    media_count: profile_user.media_count,
                    media_count_str: media_count_str,
                    avatar: profile_user.profile_image_url_https.replace("_normal", "_400x400"),
                    banner: profile_user.profile_banner_url,
                    background_image: profile_user.profile_background_image_url,
                    background_color: profile_user.profile_background_color,
                    link_color: profile_user.profile_link_color,
                    sidebar_border_color: profile_user.profile_sidebar_border_color,
                    sidebar_fill_color: profile_user.profile_sidebar_fill_color,
                    text_color: profile_user.profile_text_color
                };



                //console.log(twitter);
                //console.log(res.statusCode);
                res.render(__dirname + '/pages/twitter', twitter);
            }

            // Si hay error = No User Found
            else {
                console.log('No Such a User .');

                const twitter = {
                    available: 0,
                    suspended: 0,
                    user_id: '',
                    user_id_str: '',
                    name: 'Ups,, no lo encuentro',
                    account: user,
                    verificada: '',
                    protegida: '',
                    Bussnis_state: '',
                    joined: '',
                    location: '',
                    website: '',
                    description: '',
                    tweets: '',
                    tweets_str: '',
                    following: '',
                    following_str: '',
                    followers: '',
                    followers_str: '',
                    likes: '',
                    listed: '',
                    likes_str: '',
                    media_count: '',
                    media_count_str: '',
                    avatar: '/img/user.gif',
                    banner: '',
                    background_image: '',
                    background_color: '',
                    link_color: '',
                    sidebar_border_color: '',
                    sidebar_fill_color: '',
                    text_color: ''
                };

                res.render(__dirname + '/pages/twitter', twitter);
            }
        })

    })
};


app.get('/api/:user', function (req, res)
{
    twitter_token(token =>
    {
        const user = req.params.user;
        console.log('Search Name : ' + user);

        const options = {
            method: 'GET',
            json: true,
            url: api.endPoints.lookup + user,
            headers: {
                ...api.headers,
                'x-guest-token': token
            }
        };

        request(options, function (error, response, body)
        {
            console.log(response.statusCode)

            if (!error && response.statusCode == 200 && body[0]) {


                res.send(body)
                console.log(body)
            }


            // si hay error o no se encontraron usuarios
            else {
                console.log('Error or No Such a User .');
                res.send(body)

            }
        })

    })
})



// header (actualmente obsoleto) ---------------------------------------------------------------------------------------------------
//app.get('/header', (req, res) => {
//	twitter_token(token => {
//		res.send({
//            ...api.header,
//			'x-guest-token': token
//		})
//	})
//})


// robots.txt
app.get('/robots.txt', (req, res) =>
{
    res.send(`
    User-agent: *
    Allow: /
    # Disallow: /
    `);
});



// error 404  ------------------------------------------------------------
// Redirigir todas las solicitudes desconocidas a la página principal
app.get('*', function (req, res)
{
    console.log('404 Request')

    res.redirect('/')
})
