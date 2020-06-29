config = module.exports;

config["Client tests"] = {
    rootPath: "../",
    environment: "browser",
    libs: ["lib/**/*.js"],
    sources: ["src/*.js"],
    tests: ["test/shared/**/*-test.js", "test/client/**/*-test.js"]
};

config["Server tests"] = {
    rootPath: "../",
    environment: "node",
    tests: ["test/shared/**/*-test.js", "test/server/**/*-test.js"]
};
