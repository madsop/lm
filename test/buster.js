config = module.exports;

config["My tests"] = {
    rootPath: "../",
    environment: "browser",
    libs: [
	"lib/knockout-2.1.0.js"
    ],
    sources: [
	"src/kommandemedlem.js",
	"src/verving.js",
	"src/song.js",
	"src/services-stub.js"
    ],
    tests: [
	"test/su-test.js"
    ]/*,
    excludes: [
            "jquery",
            "knockout",
            "sinon"
    ]*/
}
