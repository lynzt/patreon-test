
var passport = require( 'passport' );
var OAuth2Strategy = require( 'passport-oauth2' ).Strategy;
var q = require('q');

var patreon = require('patreon');

var CLIENT_ID = process.env.PATREON_CLIENT_ID;
var CLIENT_SECRET = process.env.PATREON_CLIENT_SECRET;
var CALLBACK_URL = process.env.PATREON_CALLBACK_URL;

passport.use(new OAuth2Strategy({
    authorizationURL: 'https://patreon.com/oauth2/authorize',
    tokenURL: 'api.patreon.com/oauth2/token',
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ exampleId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));

exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('index');
}


exports.demandPatreonAuth = passport.authenticate('oauth2');

exports.demandPatreonAuthCB = function(req, res) {

  var getTokens = patreon.oauth(CLIENT_ID, CLIENT_SECRET).getTokens
  var code = req.query.code;
  var error = req.query.error;

  if (error) {
    console.dir("auth denied");
    res.redirect(401, '/');
  } else {
    console.dir("keep going");

    getTokens(code, CALLBACK_URL, function (err, tokens) {
        client = patreon.default(tokens.access_token)

        var fetchCampaign = q.nfcall(client, 'current_user/campaigns?include=rewards,creator,goals,pledges').then(results => {
          return getCampaignDetails(results[0].data);
        });

        var fetchPledges = fetchCampaign.then(campaignDetails => {
          return q.nfcall(client, 'campaigns/'+campaignDetails.campaign_id+'/pledges').then(results => {
            return getPledgeDetails(results[0].data);
          });
        });

        q.all([fetchCampaign, fetchPledges]).spread(function(campaignDetails, pledgeDetails) {
          console.log("\n*********************");
          console.log("\n campaignDetails");
          console.dir(campaignDetails);

          console.log("\n pledgeDetails");
          console.dir(pledgeDetails);

        }).catch(err => {
          console.dir(err);
        })

    })
  }



}

function getCampaignDetails(results) {
  var data = results[0];
  console.dir("\ncampaignDetails");
  console.dir(data);
  return {campaign_id: data.id,
          patron_count: data.attributes.patron_count,
          pledge_sum: data.attributes.pledge_sum
  };
}

function getPledgeDetails(results) {
  pledgeDetails = [];
  results.map((result) => {
    console.dir("\npledgeDetails");
    console.dir(result);
    pledgeDetails.push(
      {user_id: result.relationships.patron.data.id,
        created_at: result.attributes.created_at,
        amount_cents: result.attributes.created_at,
        pledge_cap_cents: result.attributes.pledge_cap_cents
      }
    )
  })
  return pledgeDetails;

}
