// ==UserScript==
// @name        nyaa anime-planet
// @namespace   http://annanfay.com
// @include     http://www.nyaa.se/*
// @include     http://www.anime-planet.com/anime/*
// @include     http://www.anime-planet.com/users/*/anime
// @include     https://www.nyaa.se/*
// @include     https://www.anime-planet.com/anime/*
// @include     https://www.anime-planet.com/users/*/anime
// @version     1
// @grant       GM_xmlhttpRequest
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// ==/UserScript==

// @run-at      document-end

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, indent:4, maxerr:50 */

/*
Features/Todo:
    Get username automatically, cache for session in cookie.
    Mirror anime-planet ratings locally:
        Full update if database is empty.
        Partial update when listing pages are viewed.
        Single anime update when anime-planet is used to mark anime.
    UI:
        Display anime status on nyaa.
        Add nyaa search link to anime-planet.
        Add anime planet link to nyaa.
    
    EXTRACT YEAR AND ADD TO GENERATED ALIASES

    Consider extracting synonyms from myanimelist.net.

    Bug: &foo; forms in names cause highlighting to break.
*/



// These are tests for the main title extraction code
var unitTests = [

    // "S2" sometimes is transfered as:
    // "Title S2", "Title 2nd Season", "Title 2" or "Title (year)"
    // Examples of all three are:

    // Need to alias "Terra Formars: Revenge"
    [
        '[HorribleSubs] Terra Formars S2 - 04 [720p].mkv',
        'Terra Formars S2'
    ],
    // Need to alias "Assassination Classroom TV 2nd Season"
    [
        '[HorribleSubs] Assassination Classroom S2 - 15 [720p].mkv',
        'Assassination Classroom S2'
    ],
    // Need to alias "Fairy Tail 2"
    [
        '[NotWCP] Fairy Tail S2 101v2 (276) - The Challenger [Dual Audio] [720p] [60688168].mkv',
        'Fairy Tail S2'
    ],

    // and this is episode 3
    [
        '[KebabBoys] Bakuman 3 [BD][1080p][FLAC] - Re-upload',
        'Bakuman'
    ],

    // The correc title is actually simply "Durarara!!x2 Ketsu"
    [
        '[Koby] Durarara!!x2 Ketsu - 07 (WEB 720p Hi10 AAC) [Dual-Audio]',
        'Durarara!!x2 Ketsu'
    ],

    // IS a rerelease of "Patlabor: The Mobile Police - New Files"
    [
        "[-__-'] Patlabor New OVA 07 [BD 1080p x264 8bit FLAC] [3951D42A].mkv",
        'Patlabor New OVA'
    ],

    // Crane Game Girls
    // Alt title: Bishoujo Yuugi Unit Crane Geeru
    [
        '[Kaitou]_Bishoujo_Yuugi_Unit_Crane_Game_Girls_-_03_[720p][10bit][D26A9E07].mkv',
        'Bishoujo Yuugi Unit Crane Game Girls'
    ],


    // possible matches are:
    // Pretty Guardian Sailor Moon Crystal
    // Alt title: Bishoujo Senshi Sailor Moon (2014)
    // Pretty Guardian Sailor Moon Crystal (2016)
    // Alt title: Pretty Guardian Sailor Moon Crystal: Death Busters
    [
        'Sailor Moon Crystal Episode 24 DUBBED 720p HuLu WebRip AAC 2.0-JDS',
        'Sailor Moon Crystal'
    ],


    [
        '[Imagination Station] Maho Girls Precure 12',
        'Maho Girls Precure'
    ],

    [
        '[TCL] Durarara!! + OVA (12.5) (BD 720p Hi10 AAC) [Dual-Audio]',
        'Durarara!!'
    ],

    //[BDRIP]
    //魔法少女伊莉雅/プリズマ☆イリヤ
    // (+ツヴァイ+ヘルツ+OVAs/Fate Kaleid Liner Prisma Illya
    //     (+Zwei+Herz+OVAs 全32話+特典+Scans
    //         (1920x1080 HEVC 10bit FLACx2 softSub
    //             (chi+eng)
    //          chap)
    //[softsub:chinese+english]

    // from details page:
    // 【INCLUDED】
    // Fate/kaleid liner プリズマ☆イリヤ(第1期) <全10話>　+中国語・英語字幕
    // Fate/kaleid liner プリズマ☆イリヤ OVA <全1話>　+中国語・英語字幕
    // Fate/kaleid liner プリズマ☆イリヤ ツヴァイ！(第2期) <全10話>　+中国語・英語字幕
    // Fate/kaleid liner プリズマ☆イリヤ ツヴァイ！OVA <全1話>　+中国語・英語字幕
    // Fate/kaleid liner プリズマ☆イリヤ ツヴァイ ヘルツ！(第3期) <全10話>　+中国語・英語字幕

    [
        '[BDRIP]魔法少女伊莉雅/プリズマ☆イリヤ(+ツヴァイ+ヘルツ+OVAs/Fate Kaleid Liner Prisma Illya(+Zwei+Herz+OVAs 全32話+特典+Scans(1920x1080 HEVC 10bit FLACx2 softSub(chi+eng) chap)[softsub:chinese+english]',
        'Fate Kaleid Liner Prisma Illya'//Fate/Kaleid Liner Prisma Illya
    ],


    // episode 4 of "Pretty Guardian Sailor Moon Crystal (2016)"
    [
        '[HorribleSubs] Sailor Moon Crystal - 30 [720p].mkv',
        'Sailor Moon Crystal'
    ],

    // Title - informal(?) subtitle
    [
        'Cowboy Bebop The Movie - Knockin\' on Heaven\'s Door (1080p Blu-ray eng dub 8bit AC3) [NoobSubs].mp4',
        'Cowboy Bebop: The Movie - Knockin\' on Heaven\'s Door'
    ],

    [
        '[bettersub no fading karoke] Evangelion 2.​22 You Can (Not) Advance (BD 1920x1080 H.​264 AAC 2ch+5.​1ch).​ass',
        'Evangelion 2'
    ],

    // it is possible to detect "(Not)" is part of the title, but currently hard
    // Now, this is actually another name for "Evangelion: 3.0 You Can (Not) Redo"
    // Which we can possibly auto shorted to a distinct "Evangelion: 3" or "Evangelion 3"
    [
        '[UTW-THORA] Evangelion 3.33 You Can (Not) Redo [BD][1080p,x264,flac][F2060CF5].mkv',
        'Evangelion 3'
        // this is acceptable, we are able to match to a shortened form of the title
        // or "Evangelion 3.33 You Can (Not) Redo"
    ],

    //Ushio and Tora - NOPE, decades old.
    //Ushio and Tora TV - NOPE, 26 episodes
    //Ushio and Tora TV (2016) - YEP, episode 4!!!
    // we can possible replace 'to' with 'and', though that's very messy :'(
    [
        '[HorribleSubs] Ushio to Tora - 30 [720p].mkv',
        'Ushio to Tora'
    ],

    // in this case the 2011 IS part of the title and important
    [
        '[ARRG] Hunter x Hunter (2011) Ep.02 (Dual Audio) [BD 1920x1080 x264 AAC]_Rokey',
        'Hunter x Hunter (2011)'
    ],

    // this is hugly fucked, we can constrain possible titles to:
    // "Kokuriko-zaka Kara" or "From Up on Poppy Hill"... but not better.
    [
        '[MGRT][BDrip][Kokuriko-zaka Kara][From Up on Poppy Hill][Ghibli 2011 MOVIE][1080P x264 Hi10P DTS]',
        'From Up on Poppy Hill'
    ],

    //Project Itoh has some interesting naming conventions
    [
        // we can potentially go through all the tags trying to match
        '[Project Itoh][Harmony][BDRIP][1080p]Cn-Eng.mkv',
        'Harmony'
    ],
    [
        // note the double brackets "([Full HD])" and "「」" style brackets.
        '[MF-Raws]「Project Itoh PV 第2弾」(redjuiceイラストVer.) ([Full HD]).mp4',
        '???'
    ],

    [
        '【惡魔島字幕組】★4月新番【文豪野犬_Bungou Stray Dogs】[04][BIG5][720P][MP4]',
        'Bungou Stray Dogs'
    ],

    // others, unknown
    [
        '[Doremi].12-Sai.Chicchana.Mune.no.Tokimeki.Episode.03.[1280x720].[A1EC7E60].mkv',
        '12-Sai: Chiccha na Mune no Tokimeki'
    ],
    [
        'cor.tv.le.chevalier.d\'eon',
        'Le Chevalier D\'Eon'
    ],
    [
        'cor.movie.evangelion.you.are.(not).alone.1.11',
        'evangelion you are (not) alone'
        // ^ an acceptable extraction
    ],


    [
        '[Bit] Bakuon!! OVA v2.mkv',
        'Bakuon!! OVA'
    ],
    [
        // or "Fairy Tail 2". Can't find a season 7.
        '[Pn8] Fairy Tail S07Pt5(Pt20)(First 2 eps) [Funi-DL] [720p] [Dub] | N227-239 | Season 7, Part 5 | Part 20 | Fairy Tail (2014)',
        'Fairy Tail (2014)'
    ],
    [
        '[Pn8] Dimension W S01 Extras [1080p] v4 | Dub Trailer Ep 1 Clip and More',
        'Dimension W'
    ],
    [
        //"Blade" would be better, but we can false alias the year
        'Blade (2011) 480p [Gagykun]',
        'Blade (2011)'
    ],
    [
        '[Pn8] Rage of Bahamut: Genesis S01 [Funi-DL] [1080p] [Dub] | Shingeki no Bahamut: Genesis',
        'Rage of Bahamut: Genesis'
    ],
    [
        '[Pn8] One Piece S07Pt6 [Funi-DL] [1080p] [Dub] | N446-456 | Season 7, Voyage 6',
        'One Piece'
    ],

    [
        '[QUEENpairing] Gangsta opening & ending [subbed]',
        'Gangsta'
    ],
    [
        '[QUEENpairing] kyoukai no rinne [2016] season 2 opening & ending [subbed]',
        'kyoukai no rinne'
    ],
    [
        '[QUEENpairing] brother conflict opening & ending [subbed]',
        'brother conflict'
    ],


    // sometimes working if we assume numbers
    [
        // No way to detect this really. Some anime titles end in numbers.
        '[tlacatlc6] Working!! 13 (BD 1920x1080 x264 FLAC) [2011AF4D].mkv',
        'Working!!'
    ],
    [
        // if the above works this breaks!
        'Blue Submarine No 6 (BD 720p) (NakamaSub)',
        'Blue Submarine No 6'
    ],
    [
        'Blue Submarine No.6',
        'Blue Submarine No 6'
    ],
    [
        '[yibis]_One_Piece_Movie_9_[720p][780350D8].mkv',
        'One Piece Movie 9'
    ],

    [
        'Sore Ike! Anpanman - Hashire! Wakuwaku Anpanman Grand Prix (それいけ! アンパンマン はしれ! わくわく アンパンマングランプリ) DVDISO',
        'Sore Ike! Anpanman - Hashire! Wakuwaku Anpanman Grand Prix'
    ],

    // Ambigious if title is "Cowboy Bebop - Complete" or "Cowboy Bebop"
    [
        '[KamiFS] Cowboy Bebop - Complete + Movie & Bonuses [MP4][1080P][H.264][Dual][AAC][Subs]',
        'Cowboy Bebop'
    ],

    [
        // Gintama° isn't a real title?
        // we strip out the ° anyway before lookup
        '[HorribleSubs] Gintama° + Special [1080p] (Unofficial Batch)',
        'Gintama°'
    ],


    [
        'Musou Orochi Z][DVD]',
        'Musou Orochi Z'
    ],
    [
        'hoopa webisodes',
        '????????????'
    ],
    [
        '[FFF] Futsuu no Joshikousei ga [Locodol] Yatte Mita. - Vol.03 [BD][720p-AAC]',
        ''
    ],

    [
        // correct title is actually One-Punch Man, or One Punch Man would be fine.
        '[Manga Family] One Punch-Man - Bonus BR4 vostfr HD.mp4',
        'One Punch-Man'
    ],

    [
        'Evangelion 2.22 You Can (Not) Advance (DUAL AUDIO) 1080p',
        'Evangelion 2.22 You Can (Not) Advance'
    ],

    [
        'Neon Genesis Evangelion | 新世紀エヴァンゲリオン 480p BDRip MULTI (VF / VOSTFR)',
        'Neon Genesis Evangelion | 新世紀エヴァンゲリオン'
        // 'Neon Genesis Evangelion'
    ],

    [
        '【傲嬌零字幕組】迷家/Mayoiga [04][720P][MP4][BIG5]（招募）',
        'Mayoiga' // or 迷家/Mayoiga
    ],

    [
        '[xPearse] Magic Knight Rayearth Eps01-20 [720p]',
        'Magic Knight Rayearth' // or 迷家/Mayoiga
    ],

    [
        // just having "Gochuumon wa Usagi Desu ka?" is more accurate, 
        // but when we check for short titles we split on | anyway, 
        // so it's fine to return both
        // Is the Order a Rabbit?
        // Alt title: Gochuumon wa Usagi Desu ka?
        '[JacobSwaggedUp] Gochuumon wa Usagi Desu ka? | Is the Order a Rabbit? [Season 1] (BD 1280x720) [MP4 Batch]',
        'Gochuumon wa Usagi Desu ka? | Is the Order a Rabbit?'
    ],

    [
        // We can try to detect years between 1950-2016, or something.
        'Freezing 2011 [BD 480p]',
        'Freezing'
    ],
    [
        '[NotWCP] Fairy Tail S2 101v2 (276) - The Challenger [Dual Audio] [720p] [60688168].mkv',
        'Fairy Tail S2'
    ],

    [
        '<CASO><SumiSora> <harmony/> <srs:Project Itoh><fmt:1080p><cdc:HEVC><lng:Simplified Chinese and Japanese softsub>',
        'harmony'
    ],
    [
        '[RH] Hai to Gensou no Grimgar (Grimgar of Fantasy and Ash) - 12 [English Dubbed] [1080p] [WebRip] [h.264] [2.0Ch AAC] [MP4]',
        'Hai to Gensou no Grimgar' //  (Grimgar of Fantasy and Ash)
    ],
    [
        '[LovelyProject] Project Itoh PV[WebRip][1080p][Hi8P AAC].mkv',
        '????????????????'
    ],

    //everything below is mostly working

    [
        'BLUE DROP DVD Volume 6',
        'BLUE DROP'
    ],
    [
        //Title: Cerberus
        //Alt title: Seisen Cerberus: Ryuukoku no Fatalite
        '[HorribleSubs] Seisen Cerberus - 03 [720p].mkv',
        'Seisen Cerberus'
    ],
    [
        '[c&n] 2011 - From Up on Poppy Hill [1080p 10-bit FLAC][v2]',
        'From Up on Poppy Hill'
    ],

    // normalish stuff.
    [
        'Ace Attorney - 04 (1280x720 HEVC2 AAC).mkv',
        'Ace Attorney'
    ],
    [
        '[HorribleSubs] Boku no Hero Academia - 04 [720p].mkv',
        'Boku no Hero Academia'
    ],
    [
        '[UTW]_Fullmetal_Alchemist_-_The_Sacred_Star_of_Milos_[BD][h264-720p_AC3][73953C60].mkv',
        'Fullmetal Alchemist - The Sacred Star of Milos'
    ],
    [
        // actually Fate/Zero, both work
        '[UTW] Fate Zero - 01-13 + Specials [BD][h264-720p_AC3]',
        'Fate Zero'
    ],
    [
        'Mobile_Suit_Gundam_Unicorn_Ep5_The_Black_Unicorn_[720p,BluRay,x264,DTS]_-_THORA.mkv',
        'Mobile Suit Gundam Unicorn'
    ],
    [
        '[BudLightSubs] Kidou Senshi Gundam Unicorn Re 0096 - 04 [720p].mkv',
        'Kidou Senshi Gundam Unicorn Re 0096'
    ],

    [
        '(shiteater) Dr. Slump & Arale-chan 046.mkv (english) (VOSTFR - VF)',
        'Dr. Slump & Arale-chan'
    ]
];




// whitelist of stuff which will never appear in titles
var knownTags = [
    '720p',
    '1080p',
    '1280x720',
    'AAC',
    ''
];



(function() {
    "use strict";

    var runUnitTests = false;


    var rootUrl = 'http://www.anime-planet.com'

    // inline block, 0.9em, square
    var statusColors = [
        '#666',
        '#6f99e4',
        '#8dea43',
        '#d93d48',
        '#fcfc3c',
        '#fc9f3c',
        '#9942e9',
        '#fff'
    ];


    // old style full match regular expressions
    var ws_re = "[\\s_]*?"
    var ext_re = "(?:\\.[a-z\\d]{3})";
    var oext_re = ext_re + "?";
    var tag_re = "(?:(?:\\[|\\()([^\\]\\)]+)(?:\\]|\\)))";
    var otag_re = tag_re + "?";
    var title_re = "([^\\s_\\[\\]\\(\\)][^\\[\\]\\(\\)]+?)";
    var ep_re = "(?:-?" + ws_re + "(?:\\d+-|[-0]" + ws_re + ")(\\d+(?:v\\d+)?))?";
    var end = "$";
    var anime_re = otag_re + ws_re + title_re + otag_re + ws_re + ws_re + ep_re + ws_re + otag_re + ws_re + otag_re + ws_re + otag_re + ws_re + oext_re + end;

    var anime_lre = new RegExp(anime_re);
    var anime_gre = new RegExp(anime_re, 'g');

    var username_re = /<li><a href='\/users\/([^\/]+)\/anime\/watching'>my anime list<\/a><\/li>/i;
    var anime_count_re = /<\/select><\/span><\/div><p>All <b>(\d+)<\/b> anime<\/p><script type="text\/html" id="item_tmpl">/i;
    var anime_data_re = /\/anime\/([^"]+)" class="tooltip" data-class="tooltip-full">([^\<]+)<\/a>[\s\S]*?"changeStatus"[\s\S]*?"(\d)" +selected/g;

    // the purpose of this is to split 
    // "Title - Episode" forms into two parts or more parts
    // with the title always being element 0
    // var nameSplitterRe = /[ _\.]S0\d|DVD|\d+\-\d+|[ _\.]v\d|\d+v|-?[ _\.]ep(isode)?[\. _]?\d|-?[ _\.]vol(ume)?[\. _]?\d|[\. _]-[\. _]Complete|s\d+e\d+|\+[ _\.]Special|[ _\.]0\d+[ _\.]([^-]|$)|-?[ _\.]\d+(v|[^\d\.])?/i

    // trying without removing episodes
    var nameSplitterRe = /[ _\.]S0\d|DVD|BD|\d+\-\d+|[ _\.]v\d|\d{3,5}p|\d+v|-?[ _\.]ep(isode|s)?[\. _]?\d|\d+v|-?[ _\.]disc[\. _]?\d|-?[ _\.]vol(ume|\.)?[\. _]?\d|[\. _]-[\. _]Complete|s\d+e\d+|\+[ _\.]Special|[ _\.]0\d+[ _\.]([^-]|$)?/i

    // list of known patterns
    var namePatterns = [

    ];

    var titleDelimiters = /(?:\/|:|-|\|| |\t|\{|\}|\(|\)|\[|\])+/;



    var username;
    var animeCount;
    var openTags = '<({[「【（';
    var closeTags = '>)}]」】）';



    // adapted from - http://stackoverflow.com/questions/286921/efficiently-replace-all-accented-characters-in-a-string
    // by Ed. 
    var latin_map  ={"Á":"A","Ă":"A","Ắ":"A","Ặ":"A","Ằ":"A","Ẳ":"A","Ẵ":"A","Ǎ":"A","Â":"A","Ấ":"A","Ậ":"A","Ầ":"A","Ẩ":"A","Ẫ":"A","Ä":"A","Ǟ":"A","Ȧ":"A","Ǡ":"A","Ạ":"A","Ȁ":"A","À":"A","Ả":"A","Ȃ":"A","Ā":"A","Ą":"A","Å":"A","Ǻ":"A","Ḁ":"A","Ⱥ":"A","Ã":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ḃ":"B","Ḅ":"B","Ɓ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ć":"C","Č":"C","Ç":"C","Ḉ":"C","Ĉ":"C","Ċ":"C","Ƈ":"C","Ȼ":"C","Ď":"D","Ḑ":"D","Ḓ":"D","Ḋ":"D","Ḍ":"D","Ɗ":"D","Ḏ":"D","ǲ":"D","ǅ":"D","Đ":"D","Ƌ":"D","Ǳ":"DZ","Ǆ":"DZ","É":"E","Ĕ":"E","Ě":"E","Ȩ":"E","Ḝ":"E","Ê":"E","Ế":"E","Ệ":"E","Ề":"E","Ể":"E","Ễ":"E","Ḙ":"E","Ë":"E","Ė":"E","Ẹ":"E","Ȅ":"E","È":"E","Ẻ":"E","Ȇ":"E","Ē":"E","Ḗ":"E","Ḕ":"E","Ę":"E","Ɇ":"E","Ẽ":"E","Ḛ":"E","Ꝫ":"ET","Ḟ":"F","Ƒ":"F","Ǵ":"G","Ğ":"G","Ǧ":"G","Ģ":"G","Ĝ":"G","Ġ":"G","Ɠ":"G","Ḡ":"G","Ǥ":"G","Ḫ":"H","Ȟ":"H","Ḩ":"H","Ĥ":"H","Ⱨ":"H","Ḧ":"H","Ḣ":"H","Ḥ":"H","Ħ":"H","Í":"I","Ĭ":"I","Ǐ":"I","Î":"I","Ï":"I","Ḯ":"I","İ":"I","Ị":"I","Ȉ":"I","Ì":"I","Ỉ":"I","Ȋ":"I","Ī":"I","Į":"I","Ɨ":"I","Ĩ":"I","Ḭ":"I","Ꝺ":"D","Ꝼ":"F","Ᵹ":"G","Ꞃ":"R","Ꞅ":"S","Ꞇ":"T","Ꝭ":"IS","Ĵ":"J","Ɉ":"J","Ḱ":"K","Ǩ":"K","Ķ":"K","Ⱪ":"K","Ꝃ":"K","Ḳ":"K","Ƙ":"K","Ḵ":"K","Ꝁ":"K","Ꝅ":"K","Ĺ":"L","Ƚ":"L","Ľ":"L","Ļ":"L","Ḽ":"L","Ḷ":"L","Ḹ":"L","Ⱡ":"L","Ꝉ":"L","Ḻ":"L","Ŀ":"L","Ɫ":"L","ǈ":"L","Ł":"L","Ǉ":"LJ","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ń":"N","Ň":"N","Ņ":"N","Ṋ":"N","Ṅ":"N","Ṇ":"N","Ǹ":"N","Ɲ":"N","Ṉ":"N","Ƞ":"N","ǋ":"N","Ñ":"N","Ǌ":"NJ","Ó":"O","Ŏ":"O","Ǒ":"O","Ô":"O","Ố":"O","Ộ":"O","Ồ":"O","Ổ":"O","Ỗ":"O","Ö":"O","Ȫ":"O","Ȯ":"O","Ȱ":"O","Ọ":"O","Ő":"O","Ȍ":"O","Ò":"O","Ỏ":"O","Ơ":"O","Ớ":"O","Ợ":"O","Ờ":"O","Ở":"O","Ỡ":"O","Ȏ":"O","Ꝋ":"O","Ꝍ":"O","Ō":"O","Ṓ":"O","Ṑ":"O","Ɵ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Õ":"O","Ṍ":"O","Ṏ":"O","Ȭ":"O","Ƣ":"OI","Ꝏ":"OO","Ɛ":"E","Ɔ":"O","Ȣ":"OU","Ṕ":"P","Ṗ":"P","Ꝓ":"P","Ƥ":"P","Ꝕ":"P","Ᵽ":"P","Ꝑ":"P","Ꝙ":"Q","Ꝗ":"Q","Ŕ":"R","Ř":"R","Ŗ":"R","Ṙ":"R","Ṛ":"R","Ṝ":"R","Ȑ":"R","Ȓ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꜿ":"C","Ǝ":"E","Ś":"S","Ṥ":"S","Š":"S","Ṧ":"S","Ş":"S","Ŝ":"S","Ș":"S","Ṡ":"S","Ṣ":"S","Ṩ":"S","Ť":"T","Ţ":"T","Ṱ":"T","Ț":"T","Ⱦ":"T","Ṫ":"T","Ṭ":"T","Ƭ":"T","Ṯ":"T","Ʈ":"T","Ŧ":"T","Ɐ":"A","Ꞁ":"L","Ɯ":"M","Ʌ":"V","Ꜩ":"TZ","Ú":"U","Ŭ":"U","Ǔ":"U","Û":"U","Ṷ":"U","Ü":"U","Ǘ":"U","Ǚ":"U","Ǜ":"U","Ǖ":"U","Ṳ":"U","Ụ":"U","Ű":"U","Ȕ":"U","Ù":"U","Ủ":"U","Ư":"U","Ứ":"U","Ự":"U","Ừ":"U","Ử":"U","Ữ":"U","Ȗ":"U","Ū":"U","Ṻ":"U","Ų":"U","Ů":"U","Ũ":"U","Ṹ":"U","Ṵ":"U","Ꝟ":"V","Ṿ":"V","Ʋ":"V","Ṽ":"V","Ꝡ":"VY","Ẃ":"W","Ŵ":"W","Ẅ":"W","Ẇ":"W","Ẉ":"W","Ẁ":"W","Ⱳ":"W","Ẍ":"X","Ẋ":"X","Ý":"Y","Ŷ":"Y","Ÿ":"Y","Ẏ":"Y","Ỵ":"Y","Ỳ":"Y","Ƴ":"Y","Ỷ":"Y","Ỿ":"Y","Ȳ":"Y","Ɏ":"Y","Ỹ":"Y","Ź":"Z","Ž":"Z","Ẑ":"Z","Ⱬ":"Z","Ż":"Z","Ẓ":"Z","Ȥ":"Z","Ẕ":"Z","Ƶ":"Z","Ĳ":"IJ","Œ":"OE","ᴀ":"A","ᴁ":"AE","ʙ":"B","ᴃ":"B","ᴄ":"C","ᴅ":"D","ᴇ":"E","ꜰ":"F","ɢ":"G","ʛ":"G","ʜ":"H","ɪ":"I","ʁ":"R","ᴊ":"J","ᴋ":"K","ʟ":"L","ᴌ":"L","ᴍ":"M","ɴ":"N","ᴏ":"O","ɶ":"OE","ᴐ":"O","ᴕ":"OU","ᴘ":"P","ʀ":"R","ᴎ":"N","ᴙ":"R","ꜱ":"S","ᴛ":"T","ⱻ":"E","ᴚ":"R","ᴜ":"U","ᴠ":"V","ᴡ":"W","ʏ":"Y","ᴢ":"Z","á":"a","ă":"a","ắ":"a","ặ":"a","ằ":"a","ẳ":"a","ẵ":"a","ǎ":"a","â":"a","ấ":"a","ậ":"a","ầ":"a","ẩ":"a","ẫ":"a","ä":"a","ǟ":"a","ȧ":"a","ǡ":"a","ạ":"a","ȁ":"a","à":"a","ả":"a","ȃ":"a","ā":"a","ą":"a","ᶏ":"a","ẚ":"a","å":"a","ǻ":"a","ḁ":"a","ⱥ":"a","ã":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ḃ":"b","ḅ":"b","ɓ":"b","ḇ":"b","ᵬ":"b","ᶀ":"b","ƀ":"b","ƃ":"b","ɵ":"o","ć":"c","č":"c","ç":"c","ḉ":"c","ĉ":"c","ɕ":"c","ċ":"c","ƈ":"c","ȼ":"c","ď":"d","ḑ":"d","ḓ":"d","ȡ":"d","ḋ":"d","ḍ":"d","ɗ":"d","ᶑ":"d","ḏ":"d","ᵭ":"d","ᶁ":"d","đ":"d","ɖ":"d","ƌ":"d","ı":"i","ȷ":"j","ɟ":"j","ʄ":"j","ǳ":"dz","ǆ":"dz","é":"e","ĕ":"e","ě":"e","ȩ":"e","ḝ":"e","ê":"e","ế":"e","ệ":"e","ề":"e","ể":"e","ễ":"e","ḙ":"e","ë":"e","ė":"e","ẹ":"e","ȅ":"e","è":"e","ẻ":"e","ȇ":"e","ē":"e","ḗ":"e","ḕ":"e","ⱸ":"e","ę":"e","ᶒ":"e","ɇ":"e","ẽ":"e","ḛ":"e","ꝫ":"et","ḟ":"f","ƒ":"f","ᵮ":"f","ᶂ":"f","ǵ":"g","ğ":"g","ǧ":"g","ģ":"g","ĝ":"g","ġ":"g","ɠ":"g","ḡ":"g","ᶃ":"g","ǥ":"g","ḫ":"h","ȟ":"h","ḩ":"h","ĥ":"h","ⱨ":"h","ḧ":"h","ḣ":"h","ḥ":"h","ɦ":"h","ẖ":"h","ħ":"h","ƕ":"hv","í":"i","ĭ":"i","ǐ":"i","î":"i","ï":"i","ḯ":"i","ị":"i","ȉ":"i","ì":"i","ỉ":"i","ȋ":"i","ī":"i","į":"i","ᶖ":"i","ɨ":"i","ĩ":"i","ḭ":"i","ꝺ":"d","ꝼ":"f","ᵹ":"g","ꞃ":"r","ꞅ":"s","ꞇ":"t","ꝭ":"is","ǰ":"j","ĵ":"j","ʝ":"j","ɉ":"j","ḱ":"k","ǩ":"k","ķ":"k","ⱪ":"k","ꝃ":"k","ḳ":"k","ƙ":"k","ḵ":"k","ᶄ":"k","ꝁ":"k","ꝅ":"k","ĺ":"l","ƚ":"l","ɬ":"l","ľ":"l","ļ":"l","ḽ":"l","ȴ":"l","ḷ":"l","ḹ":"l","ⱡ":"l","ꝉ":"l","ḻ":"l","ŀ":"l","ɫ":"l","ᶅ":"l","ɭ":"l","ł":"l","ǉ":"lj","ſ":"s","ẜ":"s","ẛ":"s","ẝ":"s","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ᵯ":"m","ᶆ":"m","ń":"n","ň":"n","ņ":"n","ṋ":"n","ȵ":"n","ṅ":"n","ṇ":"n","ǹ":"n","ɲ":"n","ṉ":"n","ƞ":"n","ᵰ":"n","ᶇ":"n","ɳ":"n","ñ":"n","ǌ":"nj","ó":"o","ŏ":"o","ǒ":"o","ô":"o","ố":"o","ộ":"o","ồ":"o","ổ":"o","ỗ":"o","ö":"o","ȫ":"o","ȯ":"o","ȱ":"o","ọ":"o","ő":"o","ȍ":"o","ò":"o","ỏ":"o","ơ":"o","ớ":"o","ợ":"o","ờ":"o","ở":"o","ỡ":"o","ȏ":"o","ꝋ":"o","ꝍ":"o","ⱺ":"o","ō":"o","ṓ":"o","ṑ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","õ":"o","ṍ":"o","ṏ":"o","ȭ":"o","ƣ":"oi","ꝏ":"oo","ɛ":"e","ᶓ":"e","ɔ":"o","ᶗ":"o","ȣ":"ou","ṕ":"p","ṗ":"p","ꝓ":"p","ƥ":"p","ᵱ":"p","ᶈ":"p","ꝕ":"p","ᵽ":"p","ꝑ":"p","ꝙ":"q","ʠ":"q","ɋ":"q","ꝗ":"q","ŕ":"r","ř":"r","ŗ":"r","ṙ":"r","ṛ":"r","ṝ":"r","ȑ":"r","ɾ":"r","ᵳ":"r","ȓ":"r","ṟ":"r","ɼ":"r","ᵲ":"r","ᶉ":"r","ɍ":"r","ɽ":"r","ↄ":"c","ꜿ":"c","ɘ":"e","ɿ":"r","ś":"s","ṥ":"s","š":"s","ṧ":"s","ş":"s","ŝ":"s","ș":"s","ṡ":"s","ṣ":"s","ṩ":"s","ʂ":"s","ᵴ":"s","ᶊ":"s","ȿ":"s","ɡ":"g","ᴑ":"o","ᴓ":"o","ᴝ":"u","ť":"t","ţ":"t","ṱ":"t","ț":"t","ȶ":"t","ẗ":"t","ⱦ":"t","ṫ":"t","ṭ":"t","ƭ":"t","ṯ":"t","ᵵ":"t","ƫ":"t","ʈ":"t","ŧ":"t","ᵺ":"th","ɐ":"a","ᴂ":"ae","ǝ":"e","ᵷ":"g","ɥ":"h","ʮ":"h","ʯ":"h","ᴉ":"i","ʞ":"k","ꞁ":"l","ɯ":"m","ɰ":"m","ᴔ":"oe","ɹ":"r","ɻ":"r","ɺ":"r","ⱹ":"r","ʇ":"t","ʌ":"v","ʍ":"w","ʎ":"y","ꜩ":"tz","ú":"u","ŭ":"u","ǔ":"u","û":"u","ṷ":"u","ü":"u","ǘ":"u","ǚ":"u","ǜ":"u","ǖ":"u","ṳ":"u","ụ":"u","ű":"u","ȕ":"u","ù":"u","ủ":"u","ư":"u","ứ":"u","ự":"u","ừ":"u","ử":"u","ữ":"u","ȗ":"u","ū":"u","ṻ":"u","ų":"u","ᶙ":"u","ů":"u","ũ":"u","ṹ":"u","ṵ":"u","ᵫ":"ue","ꝸ":"um","ⱴ":"v","ꝟ":"v","ṿ":"v","ʋ":"v","ᶌ":"v","ⱱ":"v","ṽ":"v","ꝡ":"vy","ẃ":"w","ŵ":"w","ẅ":"w","ẇ":"w","ẉ":"w","ẁ":"w","ⱳ":"w","ẘ":"w","ẍ":"x","ẋ":"x","ᶍ":"x","ý":"y","ŷ":"y","ÿ":"y","ẏ":"y","ỵ":"y","ỳ":"y","ƴ":"y","ỷ":"y","ỿ":"y","ȳ":"y","ẙ":"y","ɏ":"y","ỹ":"y","ź":"z","ž":"z","ẑ":"z","ʑ":"z","ⱬ":"z","ż":"z","ẓ":"z","ȥ":"z","ẕ":"z","ᵶ":"z","ᶎ":"z","ʐ":"z","ƶ":"z","ɀ":"z","ﬀ":"ff","ﬃ":"ffi","ﬄ":"ffl","ﬁ":"fi","ﬂ":"fl","ĳ":"ij","œ":"oe","ﬆ":"st","ₐ":"a","ₑ":"e","ᵢ":"i","ⱼ":"j","ₒ":"o","ᵣ":"r","ᵤ":"u","ᵥ":"v","ₓ":"x"};
    function latinise(s) {
        return s.replace(/[^A-Za-z0-9\[\] ]/g, function(a) {
            return latin_map[a] || a;
        });
    };

    // it's very important that this never returns a falsy value
    function codify(name) {
        if (!name) return '';
        // return name.toLowerCase().replace(/[\&\[\]\(\)\{\}\.\?\/# \-_:'`~\\@"']/g, '');
        return latinise(name).toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    }

    function processTitle(words) {
        var word = words.join('');
        // Foo - 01
        // Foo 01
        // Foo 1    ..... maybe???
        // Foo - Bar 01
        // Foo - Bar
        // Foo - Bar - 01
        // Foo 01-12
        // Foo - 01-12
        // Foo - Bar - 01-12
        // Foo - Bar 0012 - 01

        // consider removing the last rule, it's a bit BS

        // Assume a nice well formed name (however unlikely)
        var sword = word.split(/-[ _\.]\d/i);

        // if our sword is not long enough, try harder....
        if (sword.length < 2) {
            // Assume numbers are part of anime title
            // var sword = word.split(/\d+\-\d+|-[ _]\d+v?|\d+v|-?[ _]ep(isode)?[\. _]?\d|-?[ _]vol\.?\d|s\d+e\d+|[ _]0\d+[ _]([^-]|$)/i);

            // Assume numbers are episodes
            var sword = word.split(nameSplitterRe);
        }
        // console.log('sword', sword);

        // word.match();
        // console.log(word, sword);
        var rawTitle = sword[0];

        // if someone did something idiotic, like put the year before title!
        if (!rawTitle.trim().length) {
            // console.log('rawTitle.trim()', rawTitle.trim());
            rawTitle = sword.join('').replace('-', '');
        }

        var title = rawTitle.replace(/[\._]/g, ' ').trim();
        // console.log(title);

        return [rawTitle, title, sword];
    }

    function nameParser(name) {
        var open = undefined;

        var words = [];
        var tags = [];
        var ext;


        var agg = '';
        for (var i = 0, l = name.length; i < l; i++) {
            var c = name[i];

            // if (open && ~', ;'.indexOf(c)) {
            //     data.tags.push(agg);
            //     data.words.push(agg);
            //     agg = '';
            //     continue;
            // }

            if (~openTags.indexOf(c)) {
                open = c;
                // processWord(agg);
                if (codify(agg).length) {//.replace(/_| |\./g, '')
                    words.push(agg);
                }
                agg = '';
                continue;
            }

            if (~closeTags.indexOf(c)) {
                if (open) {
                    tags.push(open + agg + c);
                    words.push(open + agg + c);
                }

                open = undefined;
                agg = '';
                continue;
            }

            // we are in title!, whoops
            if (!open && !/[a-z]/i.test(c)) {

            }

            agg += c;
        }

        // last word might be extension
        var extm = agg.match(/(.*)\.([a-z0-9]{2,4})$/i);
        if (extm) {
            agg = extm[1];
            ext = extm[2];
        }

        if (agg.replace(/_| |\./g, '').length) {
            words.push(agg);
        }

        while (words.length && ~tags.indexOf(words[0])) {
            words.shift();
        }
        while (words.length && ~tags.indexOf(words[words.length - 1])) {
            words.pop();
        }
        tags = tags.filter(function(t) {
            return !~words.indexOf(t);
        });

        // console.log('\n');
        // console.log('name', name);
        // console.log('\ttags', tags);
        // console.log('\twords', words);

        // console.log(data.tags, data.words, data.title);
        var titles = processTitle(words);
        return {
            words: words,
            tags: tags,
            rawTitle: titles[0],
            title: titles[1],
            sword: titles[2],
            ext: ext
        };

    }

    function testParser() {
        var total = unitTests.length;
        var passed = 0;
        unitTests.forEach(function(test) {
            var name = test[0];
            var answer = test[1];

            var v = nameParser(name);
            if (v.title !== answer) {
                var failData = {
                    name: name,
                    correct: answer,
                    value: v.title,
                    details: v
                };
                // console.log('\t   name\t:', name);
                // console.log('\tcorrect\t:', answer);
                // console.log('\t  value\t:', v.title);
                // console.log('\t\t\t\twords:', v.words);
                // console.log('\t\t\t\ttags:', v.tags);
                console.log('TESTFAILED:', name);
                console.log('\t\t\t', failData);
            } else {
                passed++;
            }
        });

        console.log('Test summary:', passed, '/', total, '(', Math.floor(100 * passed / total), '%)');
    }

    if (runUnitTests) testParser();

    document.addEventListener('runUnitTests', testParser, false);
    window.eval("window.testParser = function(){document.dispatchEvent(new Event('runUnitTests'));};");

    function ask(name, desc, def) {
        return prompt(name + ': ' + desc, def === undefined ? '' : def);
    }

    var store = {
        section: undefined,
        storeMode: 'GM', // or 'LS' for local storage (buggy)
        get: function get(name, def) {
            var method = store.storeMode == 'GM' ? GM_getValue : window.localStorage.getItem;
            var val = method(store.section + ':' + name);
            return val ? JSON.parse(val) : def;
        },
        set: function set(name, data) {
            var method = store.storeMode == 'GM' ? GM_setValue : window.localStorage.setItem;
            return method(store.section + ':' + name, JSON.stringify(data));
        },
        unset: function unset(name) {
            var method = store.storeMode == 'GM' ? GM_deleteValue : window.localStorage.removeItem;
            return method(store.section + ':' + name);
        },
        ensure: function ensure(name, desc, def, stringHandler) {
            var v = store.get(store.section + ':' + name, undefined);
            if (v === undefined) {
                v = ask(name, desc, def);
                if (v !== null) {
                    store.set(store.section + ':' + name, stringHandler ? stringHandler(v) : v);
                }
            }
            return v;
        }
    };

    function get(url, callback) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function(response) {
                callback(response.responseText)
            }
        });
    }


    var animePerPage = 500;

    function importAllAnime(callback, currentPage) {
        // console.log('importAllAnime', arguments);

        if (!username) return; // something's very wrong

        var userAnimeUrl = rootUrl + '/users/' + username + '/anime?filter=all&per_page=' + animePerPage + '&page='
        var currentPage = currentPage || 1;
        var animeProcessed = (currentPage - 1) * animePerPage;

        console.log('animeProcessed >= animeCount', animeProcessed, animeCount, animeProcessed >= animeCount);

        if (animeCount > 0 && animeProcessed >= animeCount) {
            return callback();
        }

        process_url(userAnimeUrl + currentPage, function() {
            console.log('sub-importAllAnime', currentPage);
            if (!animeCount) {
                return; // bad crack... something's wrong
            }
            setTimeout(importAllAnime, 10000, callback, currentPage + 1);
        });
    }


    // function get_nyaa_anime () {

    //     // var m;
    //     // while (m = anime_data_re.exec(html)) {
    //     //     var name = m[1];
    //     //     var link = m[2];
    //     //     var status = m[3];
    //     //     // console.log(name, link, status);
    //     //     store.set('anime-' + name, {n: name, l: link, s: status});
    //     // }
    //     var matches = document.body.textContent.match(anime_gre);
    //     var match;
    //     console.log('gre matches', matches);
    //     for (var m in matches){
    //         match = matches[m];
    //         anime_info = match.match(anime_lre);
    //         if (anime_info) {
    //             title = anime_info[2];
    //             console.log(title);
    //         }
    //     }

    // }
    function extract_username(html) {
        //
        var matches = html.match(username_re);
        if (matches) {
            username = matches[1];
            store.set('username', username);
            console.log('username found', username);
        }
    }

    function extract_anime_count(html) {
        //
        var matches = html.match(anime_count_re);
        if (matches) {
            animeCount = matches[1];
            store.set('anime-count', animeCount);
            console.log('anime-count found', animeCount);
        } else {
            console.log('could not find anime-count');
        }
    }

    function animeSet(name, data) {
        var code = codify(name);
        if (!code) return;
        store.set('anime|' + code, data);
    }

    function updateAnimeData(name, link, status, year) {
        var data = {
            n: name,
            l: link,
            s: status,
            y: year
        };

        console.log('updateAnimeData', codify(name), data);
        animeSet(name, data);

        updateAnimeShortAliases(name, name, year);
    }

    function updateAnimeAlias(alias, name, year) {
        console.log('updateAnimeAlias', alias, name, codify(alias));
        animeSet(alias, {n: name});
        updateAnimeShortAliases(alias, name, year);
    }
    // Add a given alias
    // Will not overwrite anime records or higher priority aliases
    function addAlias(alias, name, priority) {
        var key = 'anime|' + codify(alias);

        if (alias.length < 4 && priority <= 100) {
            return;
        }

        var existing = store.get(key);
        if (existing) {
            // already existing alias or default name

            // real name
            // or if the current alias doesn't have a priority
            // or the exsting priority is higher
            if (existing.l || !priority || existing.p > priority) {
                console.log('!addAlias: ', alias, '\t', name, '\t', key, '\t', priority);
                return;
            }
        }

        console.log(' addAlias: ', alias, '\t', name, '\t', key, '\t', priority);

        animeSet(alias, {n: name, p:priority});
    }

    function updateAnimeShortAliases(alias, name, year) {
        // automatic short form aliases
        
        // var del = /(?=\:|-|\.)/;
        if (titleDelimiters.test(alias)) {
            var parts = alias.split(titleDelimiters);
            console.log('parts:', parts);
            var priority = 100;
            while(parts.length > 1) {
                parts.pop();
                addAlias(parts.join(''), name, priority);
                priority--;
            }
        }


        // create a fake alias which includes the year.
        if (year) {
            // because we are adding data, i.e. increasing restriction,
            //  this can be very high priority
            addAlias(name + ' (' + year + ')', name, 1000);
        }

        // // Should we really be doing shit like this?
        // // There's 3-4 ways of indicating the season.
        // // Only time I've seen it useful is "Assassination Classroom TV 2nd Season"
        // if (~alias.indexOf('TV 2nd Season')) {
        //     var fuckedAlias = alias.replace(/(TV )?2nd Season/, 'S2');

        //     if (store.get('anime|' + codify(fuckedAlias))) {
        //         // already existing, might be real anime
        //         return;
        //     }
        //     console.log('updateAnimeAlias adding short form', fuckedAlias, name, codify(fuckedAlias));
        //     store.set('anime|' + codify(fuckedAlias), {
        //         n: name
        //     });
        // }


    }

    function retrieveName(name) {
        return store.get('anime|' + codify(name));
    }

    // given names = [a, b, c]
    // we want to try:
    // abc, ab, a, b, c

    var single_limit = 4; 
    function _getAnime(names) {
        for (var i = names.length; i >= 1; i--) {
            // try all names before i
            var name = names.slice(0, i).join(' ');
            var anime = retrieveName(name);
            console.log('Parts  : Trying to get anime with... : ', name, anime);
            if (anime) {
                return anime;
            }
        }

        console.log('names: ', names);
        for (var i = 1, l = names.length; i < l; i++) {
            var name = names[i];
            if (name.length < single_limit) {
                continue;
            }
            var anime = retrieveName(name);
            console.log('Singles: Trying to get anime with... : ', name, anime);
            if (anime) {
                return anime;
            }
        }
    }

    function getAnime(nameInfo) {
        var names = [nameInfo.title];//,nameInfo.rawTitle];
        console.log('getAnime:', names);
        var tags = nameInfo.tags;
        var tagsTried = false;
        var splittingTried = false;
        var i=0;
        while (true) {
            if(i++ > 100) return;

            var anime = _getAnime(names);
            
            // console.log(names, 'ANIME...', anime)
            // there's no record
            if (!anime) {
                // try shortening the primary name
                if (!splittingTried && titleDelimiters.test(names[0])) {
                    splittingTried = true;
                    names = names[0].split(titleDelimiters);
                    continue;
                } 
                // last ditch attempt
                // look inside tags
                if (!tagsTried) {
                    // console.log('trying tags', tags);
                    names = tags;
                    tagsTried = true;
                    continue;
                }
                return anime;
            }

            // we're finished
            if (anime.s) return anime;

            // there's a redirect
            names = [anime.n];
        }
    }

    function extract_anime(html) {
        var m;
        while (m = anime_data_re.exec(html)) {
            var link = m[1];
            var name = m[2];
            var status = m[3];
            // console.log(name, link, status);
            updateAnimeData(name, link, status);
        }
    }

    function process_url(url, callback) {
        console.log('process_url', url);
        get(url, function(html) {
            process_page(html, callback);
        })
    }

    function process_page(html, callback) {
        extract_username(html);
        extract_anime_count(html);
        extract_anime(html);
        callback();
    }

    function acquireUsername(callback) {
        username = store.get('username');
        if (!username) {
            process_url(rootUrl, callback);
        } else {
            callback();
        }
    }
    var updateFrequency = 1000 * 60 * 60 * 24; // * 7;
    function updateAnime(callback) {
        var lastUpdate = store.get('lastFullUpdate', 0);
        var dataAge = Date.now() - lastUpdate;

        console.log('updateAnime', lastUpdate, dataAge, dataAge > updateFrequency);

        if (dataAge > updateFrequency) {
            store.set('lastFullUpdate', Date.now());
            importAllAnime(callback);
        } else {
            callback();
        }
    }

    function displayAnimeStatus(td) {
        // var rowMatch = td.textContent.match(anime_lre);
        // if (!rowMatch) {
        //     console.log('NO MATCH!', td.textContent);
        //     return;
        // }
        // var rawName = rowMatch[2];

        var animeNameInfo = nameParser(td.textContent);
        var rawName = animeNameInfo.rawTitle;

        // highlight the match in UI, mostly for debug purposeses
        // low saturation orange or purple would look alright as highlight colours
        if (rawName) {
            td.innerHTML = td.innerHTML.replace(rawName, '<span style="color:#692785;">' + rawName + '</span>');
        }

        // console.log(animeNameInfo);

        var animeInfo = getAnime(animeNameInfo);

        var name = animeNameInfo.title;

        if (!animeInfo) {
            // console.log('No Status', '|' + name + '|', codify(name));
            var s = statusColors.length - 1;
            var l = name.replace(/\//gi, ' ');
        } else {
            var s = parseInt(animeInfo.s);
            var l = animeInfo.l;
        }

        var color = statusColors[s];
        var url = rootUrl + '/anime/' + l;
        var h = '<a href="' + url + '"><span style="margin:0 0.2em;width:1.1em;height:1.1em;display:inline-block;border:1px solid black;background-color:' + color + '"></span></a>'
        td.innerHTML = h + td.innerHTML;
        // console.log(name, animeInfo.s);
    }

    function displayStatus(callback) {
        var tds = document.getElementsByClassName('tlistname');
        Array.prototype.forEach.call(tds, displayAnimeStatus);
        // get_nyaa_anime();
        callback();
    }

    function apHandler(e) {
        console.log('apHandler', e);

        var html = document.body.innerHTML;
        extract_username(html);

        var name = document.querySelectorAll('meta[property="og:title"]')[0].content;
        var link = window.location.pathname.split('/')[2];
        var status = unsafeWindow.$('.changeStatus :selected')[0].value;
        var year = (document.querySelectorAll('span[itemprop="datePublished"]')[0] || {}).innerText;

        updateAnimeData(name, link, status, year);
        //<h2 class='aka'>Alt title: Shingeki no Kyojin</h2>
        try {
            var aliases = document.querySelectorAll('h2.aka')[0].textContent.split(/Alt titles?: /)[1].split(',');
            aliases.forEach(function(a) {
                updateAnimeAlias(a, name, year);
            });
        } catch (e) {
            console.log('Could not find any alt titles');
        }
    }

    function main() {
        console.log('in main');
        store.section = 'nyaa-anime-planet';

        // store.unset('anime|no')

        var host = window.location.host;

        if (host == 'www.anime-planet.com') {
            var cs = document.querySelectorAll('.changeStatus');

            if (!cs.length) {
                // setTimeout(main, 100);
                return;
            };
            cs[0].addEventListener('change', apHandler);
            apHandler();
            return;
        }

        acquireUsername(function() {
            updateAnime(function() {
                displayStatus(function() {
                    // foo
                });
            });
        });
    }

    setTimeout(main, 0);
})();