'use strict';

import {systemTypes as st, systemIds as si} from './constants';

/**
 * These are the URLs we're interested in.
 *
 * Each item is:
 * - sysId - unique identifier of the system (platform) called
 *
 * - sysType - the type of the system - like wrapper, auction, library load, etc.
 *
 * - title - the human-readable title of the system called
 *
 * - vendor (optional) - the human-readable name of the vendor of the system called
 *   If not set - will be taken from `title`.
 *
 * - ref - sysId for the entry, to which this call is related - i.e. same system from the same vendor.
 *   `title` and `vendor` are not needed in such entries.
 *   When `ref` is defined then this call will be put to the swim lane that is referenced by `ref` property. This
 *   is done for every library call, because we want to see them on the same lane as the auction (bid) calls.
 *
 * - listen: string or array of strings - modified URL pattern for listening to the requests via webRequest API
 *   (see https://developer.chrome.com/extensions/match_patterns ).
 *
 * - match (optional): string or array of strings - this is a modified regex (see below) to use when a URL call is reported by
 *   the API. As long as URL pattern syntax is limited and captures too much URLs, then `match` is a better mechanism
 *   to filter out the URLs that we're not interested in.
 *   If the URL matches any of the `match` strings - then it is considered a correct HB URL.
 *   If 'match' is not defined - then it is derived from 'listen' property.
 *
 * - not_match (optional): string or array of strings - this is a modified regex (see below) to filter out the URLs
 *   that pass both API and `match` patterns, but still should be removed.
 *
 * For 'listen' we use a pattern modified from those accepted by the API - just to shorten the declaration. Before
 * passing to the API the strings are expanded as following:
 * - if the pattern starts with '.', then any subdomain pattern is added to the beginning - i.e. '*'
 * - any protocol pattern is added to the beginning - i.e. '*://'
 * - any ending pattern is added to the end - i.e. '*'.
 *
 * For 'match' and `not_match` properties we use modified regex syntax, because it's easier to keep them close
 * to `listen` property. The string with this syntax is transformed into a regex according to the following rules:
 *  - * is a wildcard string - it is replaced with .*
 *  - ** is an escaper for * character - it is replaced with *
 *  - . and ? are treated literally, they are escaped for the final regex
 *  - . at the beginning means that a subdomain (or multiple) should be present in the URL before the match string
 *  - protocol is automatically added to the beginning as http|https
 *  - any ending is allowed past the match string
 */

export default [
    {
        // 33Across
        sysId:      si.SYSID_AUC_33ACROSS,
        sysType:    st.SYSTYPE_AUCTION,
        title:      '33Across',
        listen:     'ssc.33across.com/api/v1/hb',
    },
    {
        // A4G
        sysId:      si.SYSID_AUC_A4G,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'A4G',
        listen:     'ads.ad4game.com/*/bid',
    },
    {
        // Adblade
        sysId:      si.SYSID_AUC_ADBLADE,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Adblade',
        listen:     'rtb.adblade.com/prebidjs/bid',
    },
    {
        // AdBund
        sysId:      si.SYSID_AUC_ADBUND,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'AdBund',
        listen:     '.adbund.xyz/prebid/ad/get',
    },
    {
        // AdButler
        sysId:      si.SYSID_AUC_ADBUTLER,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'AdButler',
        listen:     'servedbyadbutler.com/adserve/;type=hbr;',
    },
    {
        // ADEQUANT
        sysId:      si.SYSID_AUC_ADEQUANT,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'ADEQUANT',
        listen:     'rex.adequant.com/rex/c2s_prebid',
    },
    {
        // Adform
        sysId:      si.SYSID_AUC_ADFORM,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Adform',
        listen:     'adx.adform.net/adx/?rp=4',
    },
    {
        // AdKernel
        sysId:      si.SYSID_AUC_ADKERNEL,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'AdKernel',
        listen:     'cpm.metaadserving.com/rtbg',
    },
    {
        // AdMedia
        sysId:      si.SYSID_AUC_ADMEDIA,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'AdMedia',
        listen:     'b.admedia.com/banner/prebid/bidder/',
    },
    {
        // Admixer
        sysId:      si.SYSID_AUC_ADMIXER,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Admixer',
        listen:     'inv-nets.admixer.net/prebid.aspx',
    },
    {
        // AdOcean
        sysId:      si.SYSID_AUC_ADOCEAN,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'AdOcean',
        listen:     'myao.adocean.pl/ad.json',
    },
    {
        // AdSupply
        sysId:      si.SYSID_AUC_ADSUPPLY,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'AdSupply',
        listen:     'engine.4dsply.com/banner.engine?id=',
    },
    {
        // AdXCG
        sysId:      si.SYSID_AUC_ADXCG,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'AdXCG',
        listen:     '.adxcg.net/get/adi',
    },
    {
        // ADYOULIKE
        sysId:      si.SYSID_AUC_ADYOULIKE,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'ADYOULIKE',
        listen:     'hb-api.omnitagjs.com/hb-api/prebid',
    },
    {
        // AerServ
        sysId:      si.SYSID_AUC_AERSERV,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'AerServ',
        listen:     '.aerserv.com/as',
    },
    {
        // Amazon - auction
        sysId:      si.SYSID_AUC_AMAZON,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Amazon',
        listen:     '.amazon-adsystem.com/e/dtb/bid',
    },
    {
        // Amazon - library
        sysId:      si.SYSID_LIB_AMAZON,
        sysType:    st.SYSTYPE_LIBRARY,
        ref:        si.SYSID_AUC_AMAZON,
        listen:     '.amazon-adsystem.com/aax2/amzn_ads.js',
    },
    {
        // AOL
        sysId:      si.SYSID_AUC_AOL,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'AOL',
        listen: [
            '.adtechus.com/pubapi*cmd=bid',
            '.adtech.advertising.com/pubapi*cmd=bid',
            '.adtech.de/pubapi*cmd=bid',
            '.adtechjp.com/pubapi*cmd=bid',
        ],
    },
    {
        // AppNexus
        sysId:      si.SYSID_AUC_APPNEXUS,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'AppNexus',
        listen:     '.adnxs.com/jpt',
    },
    {
        // ARTEEBEE
        sysId:      si.SYSID_AUC_ARTEEBEE,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'ARTEEBEE',
        listen:     'bidder.mamrtb.com/rtb/bid/',
    },
    {
        // Atomx - auction
        sysId:      si.SYSID_AUC_ATOMX,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Atomx',
        listen:     'p.ato.mx/placement',
    },
    {
        // Atomx - library
        sysId:      si.SYSID_LIB_ATOMX,
        sysType:    st.SYSTYPE_LIBRARY,
        ref:        si.SYSID_AUC_ATOMX,
        listen:     's.ato.mx/b.js',
    },
    {
        // Audience Science - auction
        sysId:      si.SYSID_AUC_ASCIENCE,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'AudienceScience',
        listen:     '.revsci.net/pql',
    },
    {
        // Audience Science - library
        sysId:      si.SYSID_LIB_ASCIENCE,
        sysType:    st.SYSTYPE_LIBRARY,
        ref:        si.SYSID_AUC_ASCIENCE,
        listen:     '.revsci.net/gateway/gw.js',
    },
    {
        // BeanStock
        sysId:      si.SYSID_WRAP_BEANSTOCK,
        sysType:    st.SYSTYPE_WRAPPER,
        title:      'Beanstock Media (wrapper)',
        vendor:     'Beanstock Media',
        listen:     'b.mbid.io/nucleus/request',
    },
    {
        // Beachfront
        sysId:      si.SYSID_AUC_BEACHFRONT,
        sysType:    st.SYSTYPE_WRAPPER,
        title:      'Beachfront',
        listen:     'reachms.bfmio.com/bid.json?exchange_id',
    },
    {
        // Bidfluence - auction
        sysId:      si.SYSID_AUC_BIDFLUENCE,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Bidfluence',
        listen:     [
            'secure.bidfluence.com/Demand',
            'server.bidfluence.com/Demand',
        ],
    },
    {
        // Bidfluence - library
        sysId:      si.SYSID_LIB_BIDFLUENCE,
        sysType:    st.SYSTYPE_LIBRARY,
        ref:        si.SYSID_AUC_BIDFLUENCE,
        listen:     [
            'bidfluence.azureedge.net/forge.js',
            'cdn.bidfluence.com/forge.js',
        ],
    },
    {
        // bRealTime (CPXi)
        // Examples:
        // - http://js.brealtime.com/biddrplus-1.2.0.js
        sysId:      si.SYSID_WRAP_BREALTIME,
        sysType:    st.SYSTYPE_WRAPPER,
        title:      'bRealTime (wrapper)',
        vendor:     'bRealTime',
        listen:     'js.brealtime.com/biddr*.js',
    },
    {
        // Bridgewell
        sysId:      si.SYSID_AUC_BRIDGEWELL,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Bridgewell',
        listen:     'rec.scupio.com/recweb/prebid.aspx',
    },
    {
        // Brightcom
        sysId:      si.SYSID_AUC_BRIGHTCOM,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Brightcom',
        listen:     'hb.iselephant.com/auc/ortb',
    },
    {
        // C1X
        sysId:      si.SYSID_AUC_C1X,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'C1X',
        listen:     '.c1exchange.com/ht',
        match:      '.c1exchange.com(:[0-9]+){0,1}/ht',
    },
    {
        // Carambola
        sysId:      si.SYSID_AUC_CARAMBOLA,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Carambola',
        listen:     [
            'hb.carambo.la/hb/inimage/getHbBIdProcessedResponse',
            'hb.route.carambo.la/hb/inimage/getHbBIdProcessedResponse',
        ],
    },
    {
        // Centro
        sysId:      si.SYSID_AUC_CENTRO,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Centro',
        listen:     '.brand-server.com/hb',
    },
    {
        // Conversant
        sysId:      si.SYSID_AUC_CONVERSANT,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Conversant',
        listen:     'media.msg.dotomi.com/s2s/header',
    },
    {
        // Cox Media - auction
        sysId:      si.SYSID_AUC_COX,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Cox Media',
        listen:     '.afy11.net/ad',
    },
    {
        // Cox Media - library
        sysId:      si.SYSID_LIB_COX,
        sysType:    st.SYSTYPE_LIBRARY,
        ref:        si.SYSID_AUC_COX,
        listen:     '.afy11.net/cdsad.js',
    },
    {
        // Criteo - auction
        sysId:      si.SYSID_AUC_CRITEO,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Criteo',
        listen:     [
            '.criteo.com/delivery/rta/rta.js',
            'bidder.criteo.com/cdb',
        ],
    },
    {
        // Criteo - library
        sysId:      si.SYSID_LIB_CRITEO,
        sysType:    st.SYSTYPE_LIBRARY,
        ref:        si.SYSID_AUC_CRITEO,
        listen:     'static.criteo.net/js/ld/publishertag.js'
    },
    {
        // E-Planning
        sysId:      si.SYSID_AUC_EPLANNING,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'E-Planning',
        listen:     [
            'aklc.img.e-planning.net/layers/t_pbjs_',
            'ads.us.e-planning.net/hb/',
        ],
    },
    {
        // Lotame
        sysId:      si.SYSID_AUC_CROWDC,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Lotame',
        listen:     'ad.crwdcntrl.net/',
    },
    {
        // district m - wrapper
        sysId:      si.SYSID_WRAP_DISTRICTM,
        sysType:    st.SYSTYPE_WRAPPER,
        title:      'district m (wrapper)',
        vendor:     'district m',
        listen:     'prebid.districtm.ca/lib.js',
    },
    {
        // DistroScale
        sysId:      si.SYSID_AUC_DISTROSCALE,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'DistroScale',
        listen:     '.jsrdn.com/s/bidder',
    },
    {
        // Essens
        sysId:      si.SYSID_AUC_ESSENS,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Essens',
        listen:     'bid.essrtb.com/bid/prebid_call',
    },
    {
        // Facebook Audience Network
        sysId:      si.SYSID_AUC_FACEBOOK_AN,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Facebook Audience Network',
        vendor:     'Facebook',
        listen:     [
            '.facebook.com/*/placementbid.json',
            '.facebook.com/v1/prebid.json',
        ],
    },
    {
        // Fidelity Media
        sysId:      si.SYSID_AUC_FIDELITY,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Fidelity Media',
        listen:     'x.fidelity-media.com/delivery/hb.php',
    },
    {
        // Feature Forward
        sysId:      si.SYSID_AUC_FEATURE_FORWARD,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Fidelity Media',
        listen:     'prmbdr.featureforward.com/newbidder/bidder1_prm.php',
    },
    {
        // Freewheel->StickyAds (belongs to Comcast) - auction
        sysId:      si.SYSID_AUC_FREEWHEEL,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'FreeWheel',
        listen:     'ads.stickyadstv.com/www/delivery/swfIndex.php',
    },
    {
        // Freewheel->StickyAds (belongs to Comcast) - library
        sysId:      si.SYSID_LIB_FREEWHEEL,
        sysType:    st.SYSTYPE_AUCTION,
        ref:        si.SYSID_AUC_FREEWHEEL,
        listen:     [
            'cdn.stickyadstv.com/mustang/mustang.min.js',
            'cdn.stickyadstv.com/prime-time/',
        ],
    },
    {
        // Getintent - auction
        sysId:      si.SYSID_AUC_GETINTENT,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Getintent',
        listen:     [
            'px.adhigh.net/rtb/direct_banner',
            'px.adhigh.net/rtb/direct_vast',
        ],
    },
    {
        // Getintent - library
        sysId:      si.SYSID_LIB_GETINTENT,
        sysType:    st.SYSTYPE_LIBRARY,
        ref:        si.SYSID_AUC_GETINTENT,
        listen:     'cdn.adhigh.net/adserver/hb.js',
    },
    {
        // GumGum
        sysId:      si.SYSID_AUC_GUMGUM,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'GumGum',
        listen:     'g2.gumgum.com/hbid/imp',
    },
    {
        // HIRO Media
        sysId:      si.SYSID_AUC_HIRO,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'HIRO Media',
        listen:     'hb-rtb.ktdpublishers.com/bid/get',
    },
    {
        // Huddled Masses
        sysId:      si.SYSID_AUC_HUDDLED_MASSES,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Huddled Masses',
        listen:     [
            'huddledmassessupply.com/?banner_id',
            'huddledmassessupply.com/?c=o&m=multi',
        ],
    },
    {
        // Imonomy
        sysId:      si.SYSID_AUC_IMONOMY,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Imonomy',
        listen:     'b.imonomy.com/openrtb/hb',
    },
    {
        // Improve Digital
        sysId:      si.SYSID_AUC_IMPROVE_DIGITAL,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Improve Digital',
        listen:     'ad.360yield.com/hb',
    },
    {
        // Index (Casale Media) - auction
        sysId:      si.SYSID_AUC_CASALEMEDIA,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Index Exchange',
        vendor:     'Index',
        listen:     [
            '.casalemedia.com/cygnus',
            '.casalemedia.com/headertag',
        ],
    },
    {
        // Index (Casale Media) - wrapper
        sysId:      si.SYSID_WRAP_INDEX,
        sysType:    st.SYSTYPE_WRAPPER,
        title:      'Index Exchange (wrapper)',
        vendor:     'Index',
        listen:     '.indexww.com/ht/*.js',
        match:      '.indexww.com/ht/(p/){0,1}[^/]+.js',
    },
    {
        // Inneractive
        sysId:      si.SYSID_AUC_INNERACTIVE,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Inneractive',
        listen:     'ad-tag.inner-active.mobi/simpleM2M/requestJsonAd',
    },
    {
        // Innity
        sysId:      si.SYSID_AUC_INNITY,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Innity',
        listen:     'as.innity.com/synd/?cb',
    },
    {
        // IQM
        sysId:      si.SYSID_AUC_IQM,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'IQM',
        listen:     'pbd.bids.iqm.com',
    },
    {
        // JCM
        sysId:      si.SYSID_AUC_JCM,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'JCM',
        listen:     'media.adfrontiers.com/pq?t=hb&bids',
    },
    {
        // JustPremium - auction
        sysId:      si.SYSID_AUC_JUST_PREMIUM,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'JustPremium',
        listen:     'pre.ads.justpremium.com/v/*/',
    },
    {
        // JustPremium - library
        sysId:      si.SYSID_LIB_JUST_PREMIUM,
        sysType:    st.SYSTYPE_LIBRARY,
        ref:        si.SYSID_AUC_JUST_PREMIUM,
        listen:     'cdn-cf.justpremium.com/js/*jpx*.js',
    },
    {
        // Kargo
        sysId:      si.SYSID_AUC_KARGO,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Kargo',
        listen:     'krk.kargo.com/api/*/bid',
    },
    {
        // Komoona
        sysId:      si.SYSID_AUC_KOMOONA,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Komoona',
        listen:     [
            's.komoona.com/kb/*/*.js',
            'bidder.komoona.com/v1/GetSBids',
        ],
    },
    {
        // Kumma
        sysId:      si.SYSID_AUC_KUMMA,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Kumma',
        listen:     [
            'cdn.kumma.com/pb_ortb.js',
            'hb.kumma.com',
        ],
    },
    {
        // Krux Link
        sysId:      si.SYSID_AUC_KRUX,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Krux Link',
        listen:     'link.krxd.net/hb',
    },
    {
        // LifeStreet
        sysId:      si.SYSID_AUC_LIFESTREET,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'LifeStreet',
        listen:     'ads.lfstmedia.com/getad',
    },
    {
        // Mantis
        sysId:      si.SYSID_AUC_MANTIS,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Mantis',
        listen:     'mantodea.mantisadnetwork.com/website/prebid',
    },
    {
        // Mars Media
        sysId:      si.SYSID_AUC_MARS_MEDIA,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Mars Media',
        listen:     'bid306.rtbsrv.com/bidder/?bid=',
        match: [
            'bid306.rtbsrv.com/bidder/?bid=',
            'bid306.rtbsrv.com:9306/bidder/?bid=',
        ],
    },
    {
        // Media.net - auction
        sysId:      si.SYSID_AUC_MEDIANET,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Media.net',
        listen:     'contextual.media.net/rtbsapub.php',
    },
    {
        // Media.net - wrapper
        sysId:      si.SYSID_WRAP_MEDIANET,
        sysType:    st.SYSTYPE_WRAPPER,
        title:      'Media.net (wrapper)',
        vendor:     'Media.net',
        listen:     'contextual.media.net/bidexchange.js',
    },
    {
        // Meme Global
        sysId:      si.SYSID_AUC_MEME_GLOBAL,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Meme Global',
        listen:     '.memeglobal.com/api/*/services/prebid',
    },
    {
        // MobFox
        sysId:      si.SYSID_AUC_MOBFOX,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'MobFox',
        listen:     'my.mobfox.com/request.php',
    },
    {
        // Nano Interactive
        sysId:      si.SYSID_AUC_NANO_INTERACTIVE,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Nano Interactive',
        listen:     '.audiencemanager.de/hb',
    },
    {
        // Nasmedia
        sysId:      si.SYSID_AUC_NASMEDIA,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Nasmedia',
        listen:     'adn.admixer.co.kr/prebid',
        match: [
            'adn.admixer.co.kr/prebid',
            'adn.admixer.co.kr:10443/prebid',
        ],
    },
    {
        // Net Avenir - auction
        sysId:      si.SYSID_AUC_NET_AVENIR,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Net Avenir',
        listen:     'engine.espace.netavenir.com/diffusion/',
    },
    {
        // Net Avenir - library
        sysId:      si.SYSID_LIB_NET_AVENIR,
        sysType:    st.SYSTYPE_LIBRARY,
        ref:        si.SYSID_AUC_NET_AVENIR,
        listen:     [
            'engine.espace.netavenir.com/lib/oxscript.js',
            'engine.espace.netavenir.com/lib/NETAVENIR/ESPACE.js',
            'engine.espace.netavenir.com/lib/prebid',
        ],
    },

    {
        // NginAd
        sysId:      si.SYSID_AUC_NGINAD,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'NginAd',
        listen:     '*/bid/rtb?callback=*nginadResponse',
    },
    {
        // OpenX - auction
        sysId:      si.SYSID_AUC_OPENX,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'OpenX',
        listen:     [
            '.servedbyopenx.com/w/*/acj',
            '.openx.net/w/*/acj',
            '.servedbyopenx.com/w/*/ar*?',
            '.openx.net/w/*/ar*?',
        ],
        match:      [
            '.servedbyopenx.com/w/*/acj',
            '.servedbyopenx.com/w/*/ar[a-z]?',
            '.openx.net/w/*/acj',
            '.openx.net/w/*/ar[a-z]?',
        ],
    },
    {
        // OpenX - library
        // Examples:
        // - http://psa-d.openx.com/w/1.0/jstag
        // - http://servedby.openxmarket.jp/w/1.0/jstag
        // - http://mediaservices-d.openxenterprise.com/w/1.0/jstag
        // - http://ox-d.spanishdict.servedbyopenx.com/w/1.0/jstag?nc=1027916-SpanishDict
        // - http://ox-d.intermarkets.net/w/1.0/jstag
        // - http://ax-d.pixfuture.net/w/1.0/jstag
        sysId:      si.SYSID_LIB_OPENX,
        sysType:    st.SYSTYPE_LIBRARY,
        ref:        si.SYSID_AUC_OPENX,
        listen:     [
            '.servedbyopenx.com/w/*/jstag',
            '.openx.net/w/*/jstag',
            // Wider than original, because ox-d.*/w/*/jstag is not supported by Chrome API
            // But still keep it as a separate line here, so we can improve it when API gets better.
            '*/w/*/jstag',
        ],
        match:      [
            '.servedbyopenx.com/w/*/jstag',
            '.openx.net/w/*/jstag',
            '.openx.com/w/*/jstag',
            '.openxmarket.jp/w/*/jstag',
            '.openxmarket.asia/w/*/jstag',
            '.openxenterprise.com/w/*/jstag',
            'ox-d.*/w/*/jstag',
            'ax-d.*/w/*/jstag',
            'ads.nervora.net/w/1.0/jstag',
        ],
        not_match:  '.openx.net/w/1.0/arj',
    },
    {
        // Optimatic
        sysId:      si.SYSID_AUC_OPTIMATIC,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Optimatic',
        listen:     'mg-bid.optimatic.com/adrequest/',
    },
    {
        // PiXi Media
        sysId:      si.SYSID_AUC_PIXI,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'PiXi Media',
        listen:     'static.adserver.pm/prebid',
    },
    {
        // Platform.io
        sysId:      si.SYSID_AUC_PLATFORM_IO,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Platform.io',
        listen:     [
            'adx1js.s3.amazonaws.com/pb_ortb.js',
            'js.adx1.com/pb_ortb.js',
            'piohbdisp.hb.adx1.com',
        ],
    },
    {
        // Pollux Network
        sysId:      si.SYSID_AUC_POLLUX,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Pollux',
        listen:     'adn.plxnt.com/prebid',
    },
    {
        // Prebid
        sysId:      si.SYSID_WRAP_PREBID,
        sysType:    st.SYSTYPE_WRAPPER,
        title:      'Prebid.js (wrapper)',
        vendor:     'Prebid.org',
        listen:     [
            '*/*prebid*.js',
            'ads.rubiconproject.com/prebid/',
        ],
        match:      [
            '*/*prebid[^&?/]**.js', // Also used as not_match rule for prebid-like urls to skip
            'ads.rubiconproject.com/prebid/',
        ],
        not_match:  [
            // Prebid-including url from wikia, which includes a bunch of other systems
            // Examples:
            //   1) http://slot1.images.wikia.nocookie.net/__am/1476367718/groups/-/abtesting,oasis_blocking,universal_analytics_js,
            //      adengine2_tracking_js,adengine2_amazon_match_js,adengine2_prebid_js,adengine2_ox_bidder_js,
            //      adengine2_rubicon_fastlane_js,adengine2_rubicon_vulcan_js,optimizely_blocking_js,qualaroo_blocking_js
            //   2) http://slot1.images1.wikia.nocookie.net/__am/1476211006/group/-/prebid_prod_js
            '*wikia.*(prebid_js|prebid_prod_js)*',
        ],
    },
    {
        // Peebid Server
        sysId:      si.SYSID_AUC_APPNEXUS_PREBID_SERVER,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Prebid Server',
        vendor:     'AppNexus',
        listen:     'prebid.adnxs.com/pbs/*',
    },
    {
        // Proximic
        sysId:      si.SYSID_AUC_PROXIMIC,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Proximic',
        listen:     '.zqtk.net/',
    },
    {
        // Pubfood
        sysId:      si.SYSID_WRAP_PUBFOOD,
        sysType:    st.SYSTYPE_WRAPPER,
        title:      'Pubfood.js (wrapper)',
        vendor:     'Yieldbot',
        listen:     '*/*pubfood*.js',
        match:      '*/*pubfood[^&?/]**.js',
    },
    {
        // PubGears
        sysId:      si.SYSID_AUC_PUBGEARS,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'PubGears',
        listen:     [
            'c.pubgears.com/tags/h',
            'b.pubgears.com/nucleus/request',
        ],
    },
    {
        // Pubmatic - auction
        sysId:      si.SYSID_AUC_PUBMATIC,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'PubMatic',
        listen:     [
            '.pubmatic.com/AdServer/AdCallAggregator',
            '.pubmatic.com/AdServer/AdServerServlet',
            '.pubmatic.com/translator',
        ],
    },
    {
        // Pubmatic - library
        sysId:      si.SYSID_LIB_PUBMATIC,
        sysType:    st.SYSTYPE_LIBRARY,
        ref:        si.SYSID_AUC_PUBMATIC,
        listen:     '.pubmatic.com/AdServer/js/gshowad.js',
    },
    {
        // PulsePoint - auction
        sysId:      si.SYSID_AUC_PULSEPOINT,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'PulsePoint',
        listen:     'bid.contextweb.com/header/tag',
    },
    {
        // PulsePoint - library
        sysId:      si.SYSID_LIB_PULSEPOINT,
        sysType:    st.SYSTYPE_LIBRARY,
        ref:        si.SYSID_AUC_PULSEPOINT,
        listen:     'tag.contextweb.com/getjs.static.js',
    },
    {
        // Quantcast
        sysId:      si.SYSID_AUC_QUANTCAST,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Quantcast',
        listen:     [
            'global.qc.rtb.quantserve.com/qchb',
            // Testing URLs
            's2s-canary.quantserve.com/qchb',
        ],
        match: [
            'global.qc.rtb.quantserve.com/qchb',
            'global.qc.rtb.quantserve.com:8443/qchb',
            // Testing URLs
            's2s-canary.quantserve.com/qchb',
            's2s-canary.quantserve.com:8443/qchb',
        ],
    },
    {
        // ReadPeak
        sysId:      si.SYSID_AUC_READPEAK,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'ReadPeak',
        listen:     'app.readpeak.com/header/prebid',
    },
    {
        // Roxot
        sysId:      si.SYSID_AUC_ROXOT,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Roxot',
        listen:     'r.rxthdr.com',
    },
    {
        // RTK.io
        sysId:      si.SYSID_AUC_RTKIO,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'RTK.io',
        listen:     'thor.rtk.io/*/aardvark/?jsonp',
    },
    {
        // RTB Demand
        sysId:      si.SYSID_AUC_RTB_DEMAND,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'RTB Demand',
        listen:     'bidding.rtbdemand.com',
    },
    {
        // Rubicon Project - FastLane Standard
        sysId:      si.SYSID_AUC_RP_FL_STANDARD,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Rubicon Project',
        listen:     '.rubiconproject.com/a/api/fastlane.json',
        not_match:  '.rubiconproject.com/a/api/fastlane.json*[?&=]alt_size_ids',
    },
    {
        // Rubicon Project - FastLane MAS
        sysId:      si.SYSID_AUC_RP_FL_MAS,
        sysType:    st.SYSTYPE_AUCTION,
        ref:        si.SYSID_AUC_RP_FL_STANDARD,
        listen:     '.rubiconproject.com/a/api/fastlane.json',
        match:      '.rubiconproject.com/a/api/fastlane.json*[?&=]alt_size_ids',
    },
    {
        // Rubicon Project - FastLane MAS
        // Rubicon Project - FastLane Multiplexed (Frankenstein)
        sysId:      si.SYSID_AUC_RP_FL_FRANK,
        sysType:    st.SYSTYPE_AUCTION,
        ref:        si.SYSID_AUC_RP_FL_STANDARD,
        listen:     [
            '.rubiconproject.com/v1/auction/fastlane',
            '.rubiconproject.com/v1/auction/video',
            '.rubiconproject.com/fastlane/v2',
        ],
    },
    {
        // Rubicon Project - FastLane library (Highlander)
        sysId:      si.SYSID_LIB_RP_HIGHLANDER,
        sysType:    st.SYSTYPE_LIBRARY,
        ref:        si.SYSID_AUC_RP_FL_STANDARD,
        listen:     'ads.rubiconproject.com/header/',
    },
    {
        // RhythmOne
        sysId:      si.SYSID_AUC_RHYTHMONE,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'RhythmOne',
        listen:     'tag.1rx.io/rmp',
    },
    {
        // Sekindo
        sysId:      si.SYSID_AUC_SEKINDO,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Sekindo',
        listen:     'hb.sekindo.com/live/liveView.php',
    },
    {
        // ServerBid
        sysId:      si.SYSID_AUC_SERVERBID,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'ServerBid',
        listen:     [
            'e.serverbid.com/api/v2',
            'i.connectad.io/api/v2',
        ],
    },
    {
        // Sharethrough
        sysId:      si.SYSID_AUC_SHARETHROUGH,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Sharethrough',
        listen:     'btlr.sharethrough.com/header-bid/',
    },
    {
        // SmartyAds
        sysId:      si.SYSID_AUC_SMARTYADS,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'SmartyAds',
        listen:     'ssp-nj.webtradehub.com',
    },
    {
        // SmartRTB+
        sysId:      si.SYSID_AUC_SMARTRTBP,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'SmartRTB+',
        vendor:     'Smart Ad Server',
        listen:     'prg.smartadserver.com/prebid',
    },
    {
        // SoMo Audience
        sysId:      si.SYSID_AUC_SOMO_AUDIENCE,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'SoMo Audience',
        listen:     '.mobileadtrading.com/rtb/bids',
    },
    {
        // Sonobi - auction
        sysId:      si.SYSID_AUC_SONOBI,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Sonobi',
        listen:     '.sonobi.com/trinity.js',
    },
    {
        // Sonobi - library
        sysId:      si.SYSID_LIB_SONOBI,
        sysType:    st.SYSTYPE_LIBRARY,
        ref:        si.SYSID_AUC_SONOBI,
        listen:     '.go.sonobi.com/morpheus',
    },
    {
        // Sortable
        // Examples:
        // - http://tags-cdn.deployads.com/a/thehockeywriters.com.js
        // - http://tags-cdn.deployads.com/a/mtgprice.com.js
        sysId:      si.SYSID_WRAP_SORTABLE,
        sysType:    st.SYSTYPE_WRAPPER,
        title:      'Sortable (wrapper)',
        vendor:     'Sortable',
        listen:     'tags-cdn.deployads.com/a/',
    },
    {
        // Sovrn (Lijit)
        sysId:      si.SYSID_AUC_LIJIT,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Sovrn',
        listen:     '.lijit.com/rtb/bid',
    },
    {
        // SpotX - auction
        sysId:      si.SYSID_AUC_SPOTX,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'SpotX',
        listen:     [
            'search.spotxchange.com/openrtb',
            'js.spotx.tv/ados/v1/',
        ],
    },
    {
        // SpotX - library
        sysId:      si.SYSID_LIB_SPOTX,
        sysType:    st.SYSTYPE_LIBRARY,
        ref:        si.SYSID_AUC_SPOTX,
        listen:     'js.spotx.tv/directsdk/*.js',
    },
    {
        // SpringServe
        sysId:      si.SYSID_AUC_SPRING_SERVE,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'SpringServe',
        listen:     'bidder.springserve.com/display/hbid',
    },
    {
        // TapSense
        sysId:      si.SYSID_AUC_TAPSENSE,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'TapSense',
        listen:     '.tapsense.com/ads/headerad',
    },
    {
        // Technorati
        sysId:      si.SYSID_WRAP_TECHNORATI,
        sysType:    st.SYSTYPE_WRAPPER,
        title:      'Technorati (wrapper)',
        vendor:     'Technorati',
        listen:     '.technoratimedia.com/smartwrapper',
    },
    {
        // ThoughtLeadr
        sysId:      si.SYSID_AUC_THOUGHT_LEADR,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'ThoughtLeadr',
        listen:     'a.thoughtleadr.com',
        match:      'a.thoughtleadr.com/v[0-9]+/',
    },
    {
        // Tremor
        sysId:      si.SYSID_AUC_TREMOR,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Tremor',
        listen:     '.ads.tremorhub.com/ad/tag',
    },
    {
        // Trion
        sysId:      si.SYSID_AUC_TRION,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Trion',
        listen:     'in-appadvertising.com/api/bidRequest',
    },
    {
        // TripleLift
        sysId:      si.SYSID_AUC_TRIPLE_LIFT,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'TripleLift',
        listen:     '.3lift.com/header/auction',
    },
    {
        // TrustX
        sysId:      si.SYSID_AUC_TRUSTX,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'TrustX',
        listen:     'sofia.trustx.org/hb',
    },
    {
        // Twenga
        sysId:      si.SYSID_AUC_TWENGA,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Twenga',
        listen:     'rtb.t.c4tw.net/Bid',
    },
    {
        // ucfunnel
        sysId:      si.SYSID_AUC_UCFUNNEL,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'ucfunnel',
        listen:     '.aralego.com/header',
    },
    {
        // Underdog Media - auction
        sysId:      si.SYSID_AUC_UNDERDOG,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Underdog Media',
        listen:     [
            'underdogmedia-d.openx.net/w/1.0/arj',
            'udmserve.net/udm/img.fetch',
        ],
    },
    {
        // Underdog Media - library
        sysId:      si.SYSID_LIB_UNDERDOG,
        sysType:    st.SYSTYPE_LIBRARY,
        ref:        si.SYSID_AUC_UNDERDOG,
        listen:     'bid.underdog.media/udm_header_lib.js',
    },
    {
        // Undertone
        sysId:      si.SYSID_AUC_UNDERTONE,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Undertone',
        listen:     'hb.undertone.com/hb',
    },
    {
        // Unruly
        sysId:      si.SYSID_AUC_UNRULY,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Unruly',
        listen:     'targeting.unrulymedia.com/prebid',
    },
    {
        // VertaMedia - auction
        sysId:      si.SYSID_AUC_VERTAMEDIA,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'VertaMedia',
        listen:     'rtb.vertamedia.com/hb',
    },
    {
        // VertaMedia - library
        sysId:      si.SYSID_LIB_VERTAMEDIA,
        sysType:    st.SYSTYPE_LIBRARY,
        ref:        si.SYSID_AUC_VERTAMEDIA,
        listen:     'player.vertamedia.com/outstream-unit/*/*.js',
    },
    {
        // Vertoz
        sysId:      si.SYSID_AUC_VERTOZ,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Vertoz',
        listen:     [
            'banner.vrtzads.com/vzhbidder/bid',
            'hb.vrtzads.com/vzhbidder/bid',
        ],
    },
    {
        // WideOrbit
        // Examples:
        // - http://atemda.com/JSAdservingMP.ashx?pc=1&pbId=&clk=&exm=&jsv=1.85&tsv=2.26&cts=1477341466019&arp=0&fl=0...
        sysId:      si.SYSID_AUC_WIDEORBIT,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'WideOrbit',
        listen:      [
            '.atemda.com/JSAdservingMP.ashx',
            'atemda.com/JSAdservingMP.ashx',
        ],
    },
    {
        // WideSpace
        sysId:      si.SYSID_AUC_WIDESPACE,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Widespace',
        listen:     'engine.widespace.com/map/engine/hb/dynamic',
    },
    {
        // Yieldmo
        sysId:      si.SYSID_AUC_YIELDMO,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Yieldmo',
        listen:     '.yieldmo.com/exchange/prebid',
    },
    {
        // Yieldbot - auction
        sysId:      si.SYSID_AUC_YIELDBOT,
        sysType:    st.SYSTYPE_AUCTION,
        title:      'Yieldbot',
        listen:      '.yldbt.com/m/',
    },
    {
        // Yieldbot - library
        sysId:      si.SYSID_LIB_YIELDBOT,
        sysType:    st.SYSTYPE_LIBRARY,
        ref:        si.SYSID_AUC_YIELDBOT,
        listen:     '.yldbt.com/js/yieldbot.intent.js',
    },
    {
        // DFP
        sysId:      si.SYSID_AS_DFP,
        sysType:    st.SYSTYPE_ADSERVER,
        title:      'DFP (ad server)',
        vendor:     'Google',
        listen:     '.doubleclick.net/gampad/ads',
    },
];
