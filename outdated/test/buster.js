config = module.exports;

config["My tests"] = {
    rootPath: "../",
    environment: "browser",
    libs: [
	"lib/knockout-2.1.0.js"
    ],
    sources: [
    ],
    tests: [
	"test/lm-test.js"
    ]/*,
    excludes: [
            "jquery",
            "knockout",
            "sinon"
    ]*/
}
