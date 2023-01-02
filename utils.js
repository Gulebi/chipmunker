module.exports.VIEWS_PATH = __dirname + "/views";
module.exports.ROUTERS_PATH = __dirname + "/routers";
module.exports.PUBLIC_PATH = __dirname + "/public";

module.exports.EFFECTS_ARRAY = [
    { name: "chipmunk", string: "atempo=3/4,asetrate=44100*4/3" },
    { name: "bassboost", string: "bass=g=20:f=110:w=0.3" },
    { name: "8D", string: "apulsator=hz=0.09" },
    { name: "nightcore", string: "aresample=48000,asetrate=48000*1.25" },
    { name: "haas", string: "haas" },
];

module.exports.urlValidator = (url) => {
    return /^(ftp|http|https):\/\/[^ "]+$/.test(url);
};
